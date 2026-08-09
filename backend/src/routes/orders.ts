import { Router } from 'express';
import { orders } from '../data/mockData.js';
import { paginated, success, failure } from '../utils/response.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return paginated(data, items.length, page, limit);
}

router.get('/', (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  return res.json(paginate(orders, page, limit));
});

router.get('/my-orders', (_req, res) => {
  // This example returns all orders for the first user.
  const userOrders = orders.filter((order) => order.userId === 'u1');
  return res.json(success(userOrders, 'User orders loaded'));
});

router.get('/:id', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  return res.json(success(order, 'Order loaded'));
});

router.patch('/:id/status', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  order.status = req.body.status ?? order.status;
  return res.json(success(order, 'Order status updated'));
});

router.get('/:id/track', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  return res.json(success({ ...order, estimatedReadyAt: new Date(Date.now() + 20 * 60 * 1000).toISOString() }, 'Order tracking data loaded'));
});

router.post('/', (req, res) => {
  const { userId, tableId, items: orderItems, total, paymentStatus, orderType } = req.body;
  const newOrder = {
    id: `o${orders.length + 1}`,
    userId: userId ?? 'u1',
    tableId: tableId ?? 't1',
    status: 'pending',
    paymentStatus: paymentStatus ?? 'pending',
    orderType: orderType ?? 'dine-in',
    total: total ?? 0,
    createdAt: new Date().toISOString(),
    items: orderItems ?? [],
  };

  orders.push(newOrder);
  return res.status(201).json(success(newOrder, 'Order created successfully'));
});

export default router;
