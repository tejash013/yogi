import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { failure, paginated, success } from '../utils/response.js';
import { idParamSchema, userAccessUpdateSchema, userCreateSchema, userQuerySchema } from '../validation/schemas.js';
import { recordAudit } from '../utils/audit.js';
import { tenantFilter } from '../utils/tenant.js';
import Branch from '../models/Branch.js';
import Restaurant from '../models/Restaurant.js';
import { hashPassword } from '../utils/password.js';
const router = Router();
function publicUser(user) {
    const value = user.toObject ? user.toObject() : { ...user };
    delete value.password;
    delete value.resetToken;
    delete value.resetTokenExpires;
    return value;
}
function publicUserForRole(user, role) {
    const value = publicUser(user);
    if (role === 'manager' && value.role === 'customer') {
        value.email = value.email.replace(/^(.{2}).*(@.*)$/, '$1***$2');
        value.phone = value.phone ? `${value.phone.slice(0, 3)}***${value.phone.slice(-2)}` : value.phone;
    }
    return value;
}
const profileUpdateSchema = z.object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(7).optional(),
}).strict();
// Self profile endpoints for all authenticated users
router.get('/profile', authenticate, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password -resetToken -resetTokenExpires').exec();
    if (!user)
        return res.status(404).json(failure('User not found'));
    return res.json(success(publicUser(user), 'Profile loaded'));
});
router.patch('/profile', authenticate, validateBody(profileUpdateSchema), async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: req.body }, { new: true, runValidators: true }).select('-password -resetToken -resetTokenExpires').exec();
    if (!user)
        return res.status(404).json(failure('User not found'));
    return res.json(success(publicUser(user), 'Profile updated successfully'));
});
// Admin-only user management routes
router.get('/', authenticate, requireRole(['owner', 'manager', 'platformAdmin']), validateQuery(userQuerySchema), async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const q = String(req.query.q ?? '').trim();
    const filter = req.user.role === 'platformAdmin'
        ? {}
        : req.user.role === 'owner'
            ? { restaurantId: req.user.restaurantId, role: { $in: ['customer', 'cashier', 'chef'] } }
            : { ...tenantFilter(req), role: { $in: ['customer', 'cashier', 'chef'] } };
    if (q) {
        filter.$or = [
            { email: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { role: { $regex: q, $options: 'i' } },
        ];
    }
    const [users, total] = await Promise.all([
        User.find(filter).select('-password -resetToken -resetTokenExpires').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
        User.countDocuments(filter).exec(),
    ]);
    return res.json(paginated(users.map((user) => publicUserForRole(user, req.user.role)), total, page, limit, 'Users loaded'));
});
router.post('/', authenticate, requireRole('platformAdmin'), validateBody(userCreateSchema), async (req, res) => {
    const { firstName, lastName, email, phone, password, role, restaurantId, branchId } = req.body;
    const [existing, restaurant, branch] = await Promise.all([
        User.findOne({ email: email.toLowerCase() }).exec(),
        Restaurant.findOne({ _id: restaurantId, isActive: true }).exec(),
        Branch.findOne({ _id: branchId, restaurantId, isActive: true }).exec(),
    ]);
    if (existing)
        return res.status(409).json(failure('Email already registered'));
    if (!restaurant || !branch)
        return res.status(400).json(failure('Invalid restaurant or branch assignment'));
    const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        password: hashPassword(password),
        role,
        restaurantId,
        branchId,
    });
    return res.status(201).json(success(publicUser(user), 'Administrative user created successfully'));
});
router.patch('/:id/access', authenticate, requireRole(['owner', 'manager', 'platformAdmin']), validateParams(idParamSchema), validateBody(userAccessUpdateSchema), async (req, res) => {
    const target = await User.findById(req.params.id).exec();
    if (!target)
        return res.status(404).json(failure('User not found'));
    if (String(target._id) === req.user.id) {
        return res.status(403).json(failure('You cannot change your own access level'));
    }
    const { role, status, branch, restaurantId, branchId } = req.body;
    if (req.user.role !== 'platformAdmin' && !['customer', 'cashier', 'chef'].includes(target.role)) {
        return res.status(403).json(failure('Owners cannot modify administrative accounts'));
    }
    if (req.user.role !== 'platformAdmin') {
        const sameScope = req.user.role === 'owner'
            ? String(target.restaurantId) === String(req.user.restaurantId)
            : String(target.restaurantId) === String(req.user.restaurantId) && String(target.branchId) === String(req.user.branchId);
        if (!sameScope)
            return res.status(404).json(failure('User not found'));
    }
    if (req.user.role !== 'platformAdmin' && role && !['customer', 'cashier', 'chef'].includes(role)) {
        return res.status(403).json(failure('Only a platform administrator can assign administrative roles'));
    }
    if ((restaurantId || branchId) && req.user.role !== 'platformAdmin')
        return res.status(403).json(failure('Only a platform admin can move users between tenants'));
    if (restaurantId || branchId) {
        const branchRecord = await Branch.findOne({ _id: branchId ?? target.branchId, restaurantId: restaurantId ?? target.restaurantId, isActive: true }).exec();
        const restaurantRecord = await Restaurant.findOne({ _id: restaurantId ?? target.restaurantId, isActive: true }).exec();
        if (!branchRecord || !restaurantRecord)
            return res.status(400).json(failure('Invalid restaurant or branch'));
        if (restaurantId)
            target.restaurantId = restaurantId;
        if (branchId)
            target.branchId = branchId;
    }
    if (role)
        target.role = role;
    if (status) {
        target.status = status;
        target.tokenVersion = (target.tokenVersion ?? 0) + 1;
    }
    if (branch !== undefined)
        target.branch = branch;
    await target.save();
    await recordAudit({
        actor: req.user.id,
        action: 'user.access_updated',
        resourceType: 'User',
        resourceId: String(target._id),
        metadata: { role, status, branchChanged: branch !== undefined },
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    return res.json(success(publicUser(target), 'User access updated successfully'));
});
export default router;
