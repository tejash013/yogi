import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { failure, paginated, success } from '../utils/response.js';
import { idParamSchema, userAccessUpdateSchema, userQuerySchema } from '../validation/schemas.js';
import { recordAudit } from '../utils/audit.js';
import { tenantFilter } from '../utils/tenant.js';
import Branch from '../models/Branch.js';
import Restaurant from '../models/Restaurant.js';

const router = Router();

function publicUser(user: any) {
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.password;
  delete value.resetToken;
  delete value.resetTokenExpires;
  return value;
}

const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(7).optional(),
}).strict();

// Self profile endpoints for all authenticated users
router.get('/profile', authenticate, async (req: any, res) => {
  const user = await User.findById(req.user.id).select('-password -resetToken -resetTokenExpires').exec();
  if (!user) return res.status(404).json(failure('User not found'));
  return res.json(success(publicUser(user), 'Profile loaded'));
});

router.patch('/profile', authenticate, validateBody(profileUpdateSchema), async (req: any, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: req.body },
    { new: true, runValidators: true },
  ).select('-password -resetToken -resetTokenExpires').exec();

  if (!user) return res.status(404).json(failure('User not found'));
  return res.json(success(publicUser(user), 'Profile updated successfully'));
});

// Admin-only user management routes
router.get('/', authenticate, requireRole(['owner', 'manager', 'platformAdmin']), validateQuery(userQuerySchema), async (req: any, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const q = String(req.query.q ?? '').trim();
  const filter: any = req.user.role === 'platformAdmin' ? {} : { ...tenantFilter(req) };

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

  return res.json(paginated(users, total, page, limit, 'Users loaded'));
});

router.patch('/:id/access', authenticate, requireRole(['owner', 'manager', 'platformAdmin']), validateParams(idParamSchema), validateBody(userAccessUpdateSchema), async (req: any, res) => {
  const targetFilter = req.user.role === 'platformAdmin' ? { _id: req.params.id } : { _id: req.params.id, ...tenantFilter(req) };
  const target = await User.findOne(targetFilter).exec();
  if (!target) return res.status(404).json(failure('User not found'));

  if (String(target._id) === req.user.id) {
    return res.status(403).json(failure('You cannot change your own access level'));
  }

  if (req.user.role === 'owner' && ['manager', 'platformAdmin'].includes(target.role)) {
    return res.status(403).json(failure('Owners cannot modify administrative accounts'));
  }

  const { role, status, branch, restaurantId, branchId } = req.body;
  if ((role === 'manager' || role === 'platformAdmin' || ['manager', 'platformAdmin'].includes(target.role)) && req.user.role !== 'platformAdmin') {
    return res.status(403).json(failure('Only a platform administrator can manage administrative accounts'));
  }

  if ((restaurantId || branchId) && req.user.role !== 'platformAdmin') return res.status(403).json(failure('Only a platform admin can move users between tenants'));
  if (restaurantId || branchId) {
    const branchRecord = await Branch.findOne({ _id: branchId ?? target.branchId, restaurantId: restaurantId ?? target.restaurantId, isActive: true }).exec();
    const restaurantRecord = await Restaurant.findOne({ _id: restaurantId ?? target.restaurantId, isActive: true }).exec();
    if (!branchRecord || !restaurantRecord) return res.status(400).json(failure('Invalid restaurant or branch'));
    if (restaurantId) target.restaurantId = restaurantId;
    if (branchId) target.branchId = branchId;
  }

  if (role) target.role = role;
  if (status) {
    target.status = status;
    target.tokenVersion = (target.tokenVersion ?? 0) + 1;
  }
  if (branch !== undefined) target.branch = branch;
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
