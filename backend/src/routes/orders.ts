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
import { recordAudit } from '../utils/audit.js';
import { tenantFilter } from '../utils/tenant.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

function emitOrderEvent(event: string, order: any, payload: Record<string, unknown>) {
  try {
    const io = getIO();
    const ownerId = String(order.user?._id ?? order.user);
    const tenant = `${order.restaurantId}:${order.branchId}`;
    io.to(`${tenant}:user:${ownerId}`).emit(event, payload);
    io.to(`${tenant}:staff:orders`).emit(event, payload);
  } catch {
    // Socket.IO is optional for HTTP operation.
  }
}

router.get('/', authenticate, requirePermission(permissions.orderRead), validateQuery(orderQuerySchema), async (req: any, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const status = String(req.query.status ?? '').trim();
  const userId = String(req.query.userId ?? '').trim();

  const filter: any = {};
  Object.assign(filter, tenantFilter(req));
  if (status) filter.status = status;
  if (req.user.role === 'customer') filter.user = req.user.id;
  else if (userId) filter.user = userId;

  const { items, total } = await orderRepo.findPaginated(filter, page, limit, { createdAt: -1 });
  return res.json(paginated(items, total, page, limit));
});

router.get('/my-orders', authenticate, requirePermission(permissions.orderRead), validateQuery(orderQuerySchema.pick({ userId: true })), async (req: any, res) => {
  const userId = req.user.id;

  const orders = await orderRepo.findByUser(userId, tenantFilter(req));
  return res.json(success(orders, 'User orders loaded'));
});

router.get('/:id', authenticate, requirePermission(permissions.orderRead), validateParams(idParamSchema), async (req: any, res) => {
  const order = await orderRepo.findById(req.params.id, tenantFilter(req));

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

  const order = await orderRepo.updateById(req.params.id, { status }, tenantFilter(req));
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  emitOrderEvent('order:status:update', order, { id: order.id, status: order.status });
  await recordAudit({
    actor: (req as any).user.id,
    action: 'order.status_updated',
    resourceType: 'Order',
    resourceId: String(order._id),
    metadata: { status },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  return res.json(success(order, 'Order status updated'));
});

router.get('/:id/track', authenticate, requirePermission(permissions.orderRead), validateParams(idParamSchema), async (req, res) => {
  const order = await orderRepo.findById(req.params.id, tenantFilter(req));
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  if ((req as any).user.role === 'customer' && String(order.user?._id ?? order.user) !== (req as any).user.id) {
    return res.status(403).json(failure('You do not have access to this order'));
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
  const authenticatedUser = (req as any).user;
  const tenant = tenantFilter(req);
  const orderUserId = authenticatedUser.role === 'customer' ? authenticatedUser.id : userId;
  if (!userId || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json(failure('userId and items are required'));
  }

  const user = await userRepo.findById(orderUserId);
  if (!user) {
    return res.status(404).json(failure('User not found'));
  }
  if (String(user.restaurantId) !== tenant.restaurantId || String(user.branchId) !== tenant.branchId) {
    return res.status(403).json(failure('User belongs to another branch'));
  }

  if (tableId) {
    const table = await Table.findOne({ _id: tableId, ...tenant }).exec();
    if (!table) {
      return res.status(404).json(failure('Table not found'));
    }
  }

  const items = await Promise.all(
    orderItems.map(async (item: any) => {
      const menuItem = await MenuItem.findOne({ _id: item.menuItem, ...tenant }).exec();
      if (!menuItem || !menuItem.isActive) return null;
      return {
        menuItem: menuItem._id,
        quantity: item.quantity || 1,
        unitPrice: menuItem.price,
      };
    })
  );

  if (items.some((item) => !item)) {
    return res.status(404).json(failure('One or more menu items are unavailable'));
  }
  const resolvedItems = items.filter((item): item is NonNullable<typeof item> => item !== null);

  const reserved = new Map<string, number>();
  for (const item of resolvedItems) {
    const key = String(item.menuItem);
    reserved.set(key, (reserved.get(key) ?? 0) + item.quantity);
  }

  const reservedItems: Array<{ menuItem: string; quantity: number }> = [];
  try {
    for (const [menuItem, quantity] of reserved) {
      const result = await MenuItem.updateOne(
        { _id: menuItem, ...tenant, isActive: true, availableQty: { $gte: quantity } },
        { $inc: { availableQty: -quantity } }
      ).exec();
      if (result.modifiedCount !== 1) {
        throw Object.assign(new Error('Insufficient inventory'), { status: 409 });
      }
      reservedItems.push({ menuItem, quantity });
    }
  } catch (error) {
    await Promise.all(reservedItems.map(({ menuItem, quantity }) => MenuItem.updateOne({ _id: menuItem, ...tenant }, { $inc: { availableQty: quantity } }).exec()));
    const status = (error as any)?.status ?? 500;
    return res.status(status).json(failure(status === 409 ? 'Insufficient inventory' : 'Inventory reservation failed'));
  }

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxes = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + taxes).toFixed(2));

  let order;
  try {
    order = await orderRepo.create({
      user: orderUserId,
      ...tenant,
      table: tableId,
      items: resolvedItems,
      orderType: orderType || 'dine-in',
      paymentStatus: authenticatedUser.role === 'customer' ? 'pending' : paymentStatus || 'pending',
      subtotal,
      taxes,
      total,
      notes,
    });
  } catch (error) {
    await Promise.all(reservedItems.map(({ menuItem, quantity }) => MenuItem.updateOne({ _id: menuItem, ...tenant }, { $inc: { availableQty: quantity } }).exec()));
    throw error;
  }

  emitOrderEvent('order:created', order, { id: order.id, user: order.user, total: order.total });
  await recordAudit({
    actor: authenticatedUser.id,
    action: 'order.created',
    resourceType: 'Order',
    resourceId: String(order._id),
    metadata: { total: order.total, itemCount: order.items.length },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  return res.status(201).json(success(order, 'Order created successfully'));
});

export default router;
