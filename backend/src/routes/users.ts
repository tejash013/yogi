import { Router } from 'express';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { failure, paginated, success } from '../utils/response.js';
import { idParamSchema, userAccessUpdateSchema, userQuerySchema } from '../validation/schemas.js';

const router = Router();

function publicUser(user: any) {
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.password;
  delete value.resetToken;
  delete value.resetTokenExpires;
  return value;
}

router.use(authenticate, requireRole(['owner', 'admin']));

router.get('/', validateQuery(userQuerySchema), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const q = String(req.query.q ?? '').trim();
  const filter: any = {};

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

router.patch('/:id/access', validateParams(idParamSchema), validateBody(userAccessUpdateSchema), async (req: any, res) => {
  const target = await User.findById(req.params.id).exec();
  if (!target) return res.status(404).json(failure('User not found'));

  if (String(target._id) === req.user.id) {
    return res.status(403).json(failure('You cannot change your own access level'));
  }

  if (req.user.role === 'owner' && target.role === 'admin') {
    return res.status(403).json(failure('Owners cannot modify admin accounts'));
  }

  const { role, status, branch } = req.body;
  if ((role === 'admin' || target.role === 'admin') && req.user.role !== 'admin') {
    return res.status(403).json(failure('Only an admin can manage admin accounts'));
  }

  if (role) target.role = role;
  if (status) target.status = status;
  if (branch !== undefined) target.branch = branch;
  await target.save();

  return res.json(success(publicUser(target), 'User access updated successfully'));
});

export default router;
