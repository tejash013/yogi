import { Router } from 'express';
import Order from '../models/Order.js';
import { userRepo, orderRepo } from '../repos/index.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import { paginated, success, failure } from '../utils/response.js';
import { getIO } from '../socket/socketServer.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { idParamSchema, orderCreateSchema, orderQuerySchema, orderStatusSchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', authenticate, requirePermission(permissions.orderRead), validateQuery(orderQuerySchema), async (req: any, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const status = String(req.query.status ?? '').trim();
  const userId = String(req.query.userId ?? '').trim();

  const filter: any = {};
  if (status) filter.status = status;
  if (req.user.role === 'customer') filter.user = req.user.id;
  else if (userId) filter.user = userId;

  const { items, total } = await orderRepo.findPaginated(filter, page, limit, { createdAt: -1 });
  return res.json(paginated(items, total, page, limit));
});

router.get('/my-orders', authenticate, requirePermission(permissions.orderRead), validateQuery(orderQuerySchema.pick({ userId: true })), async (req: any, res) => {
  const userId = req.user.id;

  const orders = await orderRepo.findByUser(userId);
  return res.json(success(orders, 'User orders loaded'));
});

router.get('/:id', authenticate, requirePermission(permissions.orderRead), validateParams(idParamSchema), async (req: any, res) => {
  const order = await orderRepo.findById(req.params.id);

  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }
  if (req.user.role === 'customer' && String(order.user?._id ?? order.user) !== req.user.id) {
    return res.status(403).json(failure('You do not have access to this order'));
  }

  return res.json(success(order, 'Order loaded'));
});

router.patch('/:id/status', authenticate, requirePermission(permissions.orderStatus), validateParams(idParamSchema), validateBody(orderStatusSchema), async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json(failure('Status is required'));
  }

  const order = await orderRepo.updateById(req.params.id, { status });
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  try {
    const io = getIO();
    io.emit('order:status:update', { id: order.id, status: order.status });
  } catch (err) {
    // socket not available — continue
  }

  return res.json(success(order, 'Order status updated'));
});

router.get('/:id/track', authenticate, requirePermission(permissions.orderRead), validateParams(idParamSchema), async (req, res) => {
  const order = await orderRepo.findById(req.params.id);
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  return res.json(success(
    {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      estimatedReadyAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      updatedAt: order.updatedAt,
    },
    'Order tracking data loaded'
  ));
});

router.post('/', authenticate, requirePermission(permissions.orderCreate), validateBody(orderCreateSchema), async (req, res) => {
  const { userId, tableId, items: orderItems, orderType, paymentStatus, notes } = req.body;
  if (!userId || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json(failure('userId and items are required'));
  }

  const user = await userRepo.findById(userId);
  if (!user) {
    return res.status(404).json(failure('User not found'));
  }

  if (tableId) {
    const table = await Table.findById(tableId).exec();
    if (!table) {
      return res.status(404).json(failure('Table not found'));
    }
  }

  const items = await Promise.all(
    orderItems.map(async (item: any) => {
      const menuItem = await MenuItem.findById(item.menuItem).exec();
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItem}`);
      }
      return {
        menuItem: menuItem._id,
        quantity: item.quantity || 1,
        unitPrice: menuItem.price,
      };
    })
  );

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxes = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + taxes).toFixed(2));

  const order = await orderRepo.create({
    user: userId,
    table: tableId,
    items,
    orderType: orderType || 'dine-in',
    paymentStatus: paymentStatus || 'pending',
    subtotal,
    taxes,
    total,
    notes,
  });
  try {
    const io = getIO();
    io.emit('order:created', { id: order.id, user: order.user, total: order.total });
  } catch (err) {
    // socket not available — continue
  }

  return res.status(201).json(success(order, 'Order created successfully'));
});

export default router;
