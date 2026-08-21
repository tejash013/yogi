import { Router } from 'express';
import Inventory from '../models/Inventory.js';
import { paginated, success, failure } from '../utils/response.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { idParamSchema, inventoryCreateSchema, inventoryUpdateSchema, paginationQuerySchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';
import { tenantFilter } from '../utils/tenant.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', authenticate, requirePermission(permissions.inventoryRead), validateQuery(paginationQuerySchema), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const q = String(req.query.q ?? '').trim();
  const filter: any = { ...tenantFilter(req), isActive: true };

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

router.get('/:id', authenticate, requirePermission(permissions.inventoryRead), validateParams(idParamSchema), async (req, res) => {
  const item = await Inventory.findOne({ _id: req.params.id, ...tenantFilter(req) }).exec();
  if (!item) {
    return res.status(404).json(failure('Inventory item not found'));
  }

  return res.json(success(item, 'Inventory item loaded'));
});

router.post('/', authenticate, requirePermission(permissions.inventoryCreate), validateBody(inventoryCreateSchema), async (req, res) => {
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
    ...tenantFilter(req),
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

router.patch('/:id', authenticate, requirePermission(permissions.inventoryUpdate), validateParams(idParamSchema), validateBody(inventoryUpdateSchema), async (req, res) => {
  const item = await Inventory.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, req.body, { new: true }).exec();
  if (!item) {
    return res.status(404).json(failure('Inventory item not found'));
  }

  return res.json(success(item, 'Inventory item updated successfully'));
});

router.delete('/:id', authenticate, requirePermission(permissions.inventoryDelete), validateParams(idParamSchema), async (req, res) => {
  const item = await Inventory.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { isActive: false }, { new: true }).exec();
  if (!item) {
    return res.status(404).json(failure('Inventory item not found'));
  }

  return res.json(success(item, 'Inventory item removed successfully'));
});

export default router;
