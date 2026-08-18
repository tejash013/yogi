import { Router } from 'express';
import Inventory from '../models/Inventory.js';
import { paginated, success, failure } from '../utils/response.js';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';

const router = Router();

const idParamSchema = z.object({ id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id') });
const listQuerySchema = z.object({ page: z.preprocess((v) => Number(v), z.number().int().positive().default(1)), limit: z.preprocess((v) => Number(v), z.number().int().positive().default(10)), q: z.string().optional() });
const inventoryCreateSchema = z.object({ name: z.string().min(1), category: z.string().optional(), quantity: z.preprocess((v) => Number(v), z.number().nonnegative()), unit: z.string().min(1), unitPrice: z.preprocess((v) => Number(v), z.number().nonnegative()), supplier: z.string().optional(), minStockLevel: z.preprocess((v) => Number(v), z.number().int().nonnegative().optional()), maxStockLevel: z.preprocess((v) => Number(v), z.number().int().nonnegative().optional()), expiryDate: z.string().optional(), lastRestocked: z.string().optional() });
const inventoryUpdateSchema = inventoryCreateSchema.partial();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', validateQuery(listQuerySchema), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const q = String(req.query.q ?? '').trim();
  const filter: any = { isActive: true };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } },
      { supplier: { $regex: q, $options: 'i' } },
    ];
  }

  const total = await Inventory.countDocuments(filter).exec();
  const items = await Inventory.find(filter)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res.json(paginate(items, page, limit));
});

router.get('/:id', validateParams(idParamSchema), async (req, res) => {
  const item = await Inventory.findById(req.params.id).exec();
  if (!item) {
    return res.status(404).json(failure('Inventory item not found'));
  }

  return res.json(success(item, 'Inventory item loaded'));
});

router.post('/', validateBody(inventoryCreateSchema), async (req, res) => {
  const {
    name,
    category,
    quantity,
    unit,
    unitPrice,
    supplier,
    minStockLevel,
    maxStockLevel,
    expiryDate,
    lastRestocked,
  } = req.body;

  const inventoryItem = new Inventory({
    name,
    category,
    quantity,
    unit,
    unitPrice,
    supplier,
    minStockLevel,
    maxStockLevel,
    expiryDate,
    lastRestocked,
  });

  await inventoryItem.save();
  return res.status(201).json(success(inventoryItem, 'Inventory item created successfully'));
});

router.patch('/:id', validateParams(idParamSchema), validateBody(inventoryUpdateSchema), async (req, res) => {
  const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!item) {
    return res.status(404).json(failure('Inventory item not found'));
  }

  return res.json(success(item, 'Inventory item updated successfully'));
});

router.delete('/:id', validateParams(idParamSchema), async (req, res) => {
  const item = await Inventory.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).exec();
  if (!item) {
    return res.status(404).json(failure('Inventory item not found'));
  }

  return res.json(success(item, 'Inventory item removed successfully'));
});

export default router;
