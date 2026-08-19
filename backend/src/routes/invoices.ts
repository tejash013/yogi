import { Router } from 'express';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import { paginated, success, failure } from '../utils/response.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { idParamSchema, invoiceCreateSchema, invoiceQuerySchema, invoiceStatusSchema, invoiceUpdateSchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', authenticate, requirePermission(permissions.invoicesRead), validateQuery(invoiceQuerySchema), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const status = String(req.query.status ?? '').trim();
  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  const total = await Invoice.countDocuments(filter).exec();
  const invoices = await Invoice.find(filter)
    .populate('order', 'status paymentStatus total')
    .sort({ issuedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res.json(paginate(invoices, page, limit));
});

router.get('/:id', authenticate, requirePermission(permissions.invoicesRead), validateParams(idParamSchema), async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('order', 'status paymentStatus total')
    .exec();
  if (!invoice) {
    return res.status(404).json(failure('Invoice not found'));
  }

  return res.json(success(invoice, 'Invoice loaded'));
});

router.post('/', authenticate, requirePermission(permissions.invoicesCreate), validateBody(invoiceCreateSchema), async (req, res) => {
  const { orderId, amount, paymentMethod, status, issuedAt } = req.body;
  if (!orderId) {
    return res.status(400).json(failure('orderId is required'));
  }

  const order = await Order.findById(orderId).exec();
  if (!order) {
    return res.status(404).json(failure('Order not found'));
  }

  const invoice = new Invoice({
    order: orderId,
    amount: amount ?? order.total,
    paymentMethod,
    status: status ?? 'pending',
    issuedAt: issuedAt ? new Date(issuedAt) : undefined,
  });

  await invoice.save();
  return res.status(201).json(success(invoice, 'Invoice created successfully'));
});

router.patch('/:id', authenticate, requirePermission(permissions.invoicesUpdate), validateParams(idParamSchema), validateBody(invoiceUpdateSchema), async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!invoice) {
    return res.status(404).json(failure('Invoice not found'));
  }

  return res.json(success(invoice, 'Invoice updated successfully'));
});

router.patch('/:id/status', authenticate, requirePermission(permissions.invoicesUpdate), validateParams(idParamSchema), validateBody(invoiceStatusSchema), async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json(failure('Status is required'));
  }

  const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true }).exec();
  if (!invoice) {
    return res.status(404).json(failure('Invoice not found'));
  }

  return res.json(success(invoice, 'Invoice status updated successfully'));
});

export default router;
