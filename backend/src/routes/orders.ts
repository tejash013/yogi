import { Router } from 'express';
import Order from '../models/Order.js';
import { userRepo, orderRepo } from '../repos/index.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import { paginated, success, failure } from '../utils/response.js';
import { getIO } from '../socket/socketServer.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const status = String(req.query.status ?? '').trim();
  const userId = String(req.query.userId ?? '').trim();

  const filter: any = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;

  const { items, total } = await orderRepo.findPaginated(filter, page, limit, { createdAt: -1 });
  return res.json(paginated(items, total, page, limit));
});

router.get('/my-orders', async (req, res) => {
  const userId = String(req.query.userId ?? '');
  if (!userId) {
    return res.status(400).json(failure('userId query parameter is required'));
  }

  const orders = await orderRepo.findByUser(userId);
  return res.json(success(orders, 'User orders loaded'));
});

router.get('/:id', async (req, res) => {
  const order = await orderRepo.findById(req.params.id);

  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  return res.json(success(order, 'Order loaded'));
});

router.patch('/:id/status', async (req, res) => {
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

router.get('/:id/track', async (req, res) => {
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

router.post('/', async (req, res) => {
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
