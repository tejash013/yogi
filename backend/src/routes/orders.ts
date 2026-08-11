import { Router } from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Table from '../models/Table.js';
import MenuItem from '../models/MenuItem.js';
import { paginated, success, failure } from '../utils/response.js';

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

  const total = await Order.countDocuments(filter).exec();
  const orders = await Order.find(filter)
    .populate('user', 'firstName lastName email')
    .populate('table', 'label status')
    .populate('items.menuItem', 'title price image')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res.json(paginate(orders, page, limit));
});

router.get('/my-orders', async (req, res) => {
  const userId = String(req.query.userId ?? '');
  if (!userId) {
    return res.status(400).json(failure('userId query parameter is required'));
  }

  const orders = await Order.find({ user: userId })
    .populate('table', 'label status')
    .populate('items.menuItem', 'title price image')
    .exec();

  return res.json(success(orders, 'User orders loaded'));
});

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email')
    .populate('table', 'label status')
    .populate('items.menuItem', 'title price image')
    .exec();

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

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).exec();
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  return res.json(success(order, 'Order status updated'));
});

router.get('/:id/track', async (req, res) => {
  const order = await Order.findById(req.params.id).exec();
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

  const user = await User.findById(userId).exec();
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

  const order = new Order({
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

  await order.save();
  return res.status(201).json(success(order, 'Order created successfully'));
});

export default router;
