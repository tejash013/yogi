import { Router } from 'express';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import { paginated, success, failure } from '../utils/response.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { idParamSchema, menuCreateSchema, menuQuerySchema, menuUpdateSchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';
import { tenantFilter } from '../utils/tenant.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', validateQuery(menuQuerySchema), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const q = String(req.query.q ?? '').trim();
  const categoryId = String(req.query.category ?? '').trim();

  const filter: any = { ...tenantFilter(req), isActive: true };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  if (categoryId) {
    filter.category = categoryId;
  }

  const total = await MenuItem.countDocuments(filter).exec();
  const items = await MenuItem.find(filter)
    .populate('category', 'name')
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res.json(paginated(items, total, page, limit));
});

router.get('/popular', async (req, res) => {
  const items = await MenuItem.find({ ...tenantFilter(req), isPopular: true, isActive: true }).populate('category', 'name').exec();
  return res.json(success(items, 'Popular menu items loaded'));
});

router.get('/recommended', async (req, res) => {
  const items = await MenuItem.find({ ...tenantFilter(req), isRecommended: true, isActive: true }).populate('category', 'name').exec();
  return res.json(success(items, 'Recommended items loaded'));
});

router.get('/search', validateQuery(menuQuerySchema.pick({ q: true })), async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const items = await MenuItem.find({
    ...tenantFilter(req),
    isActive: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ],
  })
    .populate('category', 'name')
    .exec();

  return res.json(paginated(items, items.length, 1, items.length));
});

router.get('/:id', validateParams(idParamSchema), async (req, res) => {
  const item = await MenuItem.findOne({ _id: req.params.id, ...tenantFilter(req) }).populate('category', 'name').exec();
  if (!item) {
    return res.status(404).json(failure('Menu item not found'));
  }

  return res.json(success(item, 'Menu item loaded'));
});

router.post('/', authenticate, requirePermission(permissions.menuCreate), validateBody(menuCreateSchema), async (req, res) => {
  const { title, description, category, price, image, isPopular, isRecommended, availableQty, tags } = req.body;

  const tenant = tenantFilter(req);
  const categoryExists = await Category.findOne({ _id: category, ...tenant }).exec();
  if (!categoryExists) {
    return res.status(404).json(failure('Category not found'));
  }

  const menuItem = new MenuItem({
    ...tenant,
    title,
    description,
    category,
    price,
    image,
    isPopular: Boolean(isPopular),
    isRecommended: Boolean(isRecommended),
    availableQty: Number(availableQty) || 0,
    tags: Array.isArray(tags) ? tags : [],
  });
  await menuItem.save();

  return res.status(201).json(success(menuItem, 'Menu item created successfully'));
});

router.patch('/:id', authenticate, requirePermission(permissions.menuUpdate), validateParams(idParamSchema), validateBody(menuUpdateSchema), async (req, res) => {
  if (req.body.category && !(await Category.exists({ _id: req.body.category, ...tenantFilter(req) }))) {
    return res.status(400).json(failure('Category belongs to another branch'));
  }
  const item = await MenuItem.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, req.body, { new: true }).populate('category', 'name').exec();
  if (!item) {
    return res.status(404).json(failure('Menu item not found'));
  }

  return res.json(success(item, 'Menu item updated successfully'));
});

router.delete('/:id', authenticate, requirePermission(permissions.menuDelete), validateParams(idParamSchema), async (req, res) => {
  const item = await MenuItem.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { isActive: false }, { new: true }).exec();
  if (!item) {
    return res.status(404).json(failure('Menu item not found'));
  }

  return res.json(success(item, 'Menu item deactivated successfully'));
});

export default router;
