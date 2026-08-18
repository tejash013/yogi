import { Router } from 'express';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import { paginated, success, failure } from '../utils/response.js';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';

const router = Router();

const idParamSchema = z.object({ id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id') });
const listQuerySchema = z.object({ page: z.preprocess((v) => Number(v), z.number().int().positive().default(1)), limit: z.preprocess((v) => Number(v), z.number().int().positive().default(10)), q: z.string().optional(), category: z.string().optional() });
const menuCreateSchema = z.object({ title: z.string().min(1), description: z.string().optional(), category: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid category id'), price: z.number().nonnegative(), image: z.string().optional(), isPopular: z.boolean().optional(), isRecommended: z.boolean().optional(), availableQty: z.preprocess((v) => Number(v), z.number().int().nonnegative().optional()), tags: z.array(z.string()).optional() });
const menuUpdateSchema = z.object({ title: z.string().min(1).optional(), description: z.string().optional(), category: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid category id').optional(), price: z.number().nonnegative().optional(), image: z.string().optional(), isPopular: z.boolean().optional(), isRecommended: z.boolean().optional(), availableQty: z.preprocess((v) => Number(v), z.number().int().nonnegative().optional()), tags: z.array(z.string()).optional() });

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', validateQuery(listQuerySchema), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const q = String(req.query.q ?? '').trim();
  const categoryId = String(req.query.category ?? '').trim();

  const filter: any = { isActive: true };
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

router.get('/popular', async (_req, res) => {
  const items = await MenuItem.find({ isPopular: true, isActive: true }).populate('category', 'name').exec();
  return res.json(success(items, 'Popular menu items loaded'));
});

router.get('/recommended', async (_req, res) => {
  const items = await MenuItem.find({ isRecommended: true, isActive: true }).populate('category', 'name').exec();
  return res.json(success(items, 'Recommended items loaded'));
});

router.get('/search', validateQuery(z.object({ q: z.string().min(1) })), async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const items = await MenuItem.find({
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
  const item = await MenuItem.findById(req.params.id).populate('category', 'name').exec();
  if (!item) {
    return res.status(404).json(failure('Menu item not found'));
  }

  return res.json(success(item, 'Menu item loaded'));
});

router.post('/', validateBody(menuCreateSchema), async (req, res) => {
  const { title, description, category, price, image, isPopular, isRecommended, availableQty, tags } = req.body;

  const categoryExists = await Category.findById(category).exec();
  if (!categoryExists) {
    return res.status(404).json(failure('Category not found'));
  }

  const menuItem = new MenuItem({
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

router.patch('/:id', validateParams(idParamSchema), validateBody(menuUpdateSchema), async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category', 'name').exec();
  if (!item) {
    return res.status(404).json(failure('Menu item not found'));
  }

  return res.json(success(item, 'Menu item updated successfully'));
});

router.delete('/:id', validateParams(idParamSchema), async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).exec();
  if (!item) {
    return res.status(404).json(failure('Menu item not found'));
  }

  return res.json(success(item, 'Menu item deactivated successfully'));
});

export default router;
