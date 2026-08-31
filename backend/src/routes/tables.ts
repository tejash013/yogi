import { Router } from 'express';
import Table from '../models/Table.js';
import { paginated, success, failure } from '../utils/response.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { idParamSchema, tableCreateSchema, tableQuerySchema, tableStatusSchema, tableUpdateSchema } from '../validation/schemas.js';
import { authenticate, optionalAuth, requirePermission } from '../middleware/auth.js';
import { permissions, hasPermission } from '../auth/permissions.js';
import { tenantFilter } from '../utils/tenant.js';
import { getIO } from '../socket/socketServer.js';

const router = Router();

function emitTableEvent(event: string, table: any) {
  try {
    const io = getIO();
    const tenant = `${table.restaurantId}:${table.branchId}`;
    io.to(`${tenant}:staff:tables`).emit(event, { tableId: table._id, status: table.status, label: table.label });
    io.emit(event, { tableId: table._id, status: table.status, label: table.label });
  } catch {
    // Socket.IO is optional for HTTP operations
  }
}

function paginate(items: any[], total: number, page: number, limit: number) {
  return paginated(items, total, page, limit);
}

// GET /api/tables - Publicly readable for customers and staff directly from database
router.get('/', optionalAuth, validateQuery(tableQuerySchema), async (req: any, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);
  const status = String(req.query.status ?? '').trim();

  const filter: any = { ...tenantFilter(req) };
  if (status) filter.status = status;

  const total = await Table.countDocuments(filter).exec();
  const tables = await Table.find(filter)
    .sort({ label: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res.json(paginate(tables, total, page, limit));
});

// GET /api/tables/:id - Get table details by ID from database
router.get('/:id', optionalAuth, validateParams(idParamSchema), async (req, res) => {
  const table = await Table.findOne({ _id: req.params.id, ...tenantFilter(req) }).exec();
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  return res.json(success(table, 'Table loaded'));
});

// POST /api/tables - Create new table (Staff only)
router.post('/', authenticate, requirePermission(permissions.tablesManage), validateBody(tableCreateSchema), async (req, res) => {
  const { label, status, capacity, location, notes } = req.body;
  if (!label || !capacity) {
    return res.status(400).json(failure('Label and capacity are required'));
  }

  const table = new Table({
    ...tenantFilter(req),
    label,
    status: status || 'available',
    capacity,
    location,
    notes,
  });
  await table.save();
  emitTableEvent('table:created', table);

  return res.status(201).json(success(table, 'Table created successfully'));
});

// PATCH /api/tables/:id - Update table properties (Staff only)
router.patch('/:id', authenticate, requirePermission(permissions.tablesManage), validateParams(idParamSchema), validateBody(tableUpdateSchema), async (req, res) => {
  const table = await Table.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, req.body, { new: true }).exec();
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  emitTableEvent('table:updated', table);
  return res.json(success(table, 'Table updated successfully'));
});

// POST /api/tables/:id/reserve - Reserve table in database
router.post('/:id/reserve', authenticate, validateParams(idParamSchema), async (req, res) => {
  const table = await Table.findOneAndUpdate(
    { _id: req.params.id, ...tenantFilter(req), status: { $in: ['available', 'reserved'] } },
    { status: 'reserved' },
    { new: true }
  ).exec();

  if (!table) {
    return res.status(400).json(failure('Table is currently not available for reservation'));
  }

  emitTableEvent('table:status:update', table);
  return res.json(success(table, 'Table reserved successfully'));
});

// PATCH /api/tables/:id/status - Update table status in database (Customer can reserve/occupy; Staff can set any status)
router.patch('/:id/status', authenticate, validateParams(idParamSchema), validateBody(tableStatusSchema), async (req: any, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json(failure('Status is required'));
  }

  const userRole = req.user?.role ?? 'customer';
  const isStaff = hasPermission(userRole, permissions.tablesManage);

  // If customer is choosing a table to sit or reserve
  if (!isStaff && status !== 'reserved' && status !== 'occupied' && status !== 'available') {
    return res.status(403).json(failure('Customers can only select, sit, or reserve available tables'));
  }

  const table = await Table.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { status }, { new: true }).exec();
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  emitTableEvent('table:status:update', table);
  return res.json(success(table, 'Table status updated successfully'));
});

// DELETE /api/tables/:id - Delete table from database (Staff only)
router.delete('/:id', authenticate, requirePermission(permissions.tablesManage), validateParams(idParamSchema), async (req, res) => {
  const table = await Table.findOneAndDelete({ _id: req.params.id, ...tenantFilter(req) }).exec();
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  emitTableEvent('table:deleted', table);
  return res.json(success(table, 'Table deleted successfully'));
});

export default router;
