import crypto from 'crypto';
import { Router } from 'express';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import PaymentEvent from '../models/PaymentEvent.js';
import { failure, success } from '../utils/response.js';
import { tenantIdsFromRequest } from '../utils/tenant.js';

const router = Router();

router.post('/', async (req, res) => {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  const signature = req.get('x-payment-signature');
  const eventId = req.get('x-payment-event-id');
  if (!secret || !signature || !eventId || !Buffer.isBuffer(req.body)) return res.status(401).json(failure('Invalid webhook authentication'));
  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json(failure('Invalid webhook signature'));

  let event: any;
  try { event = JSON.parse(req.body.toString('utf8')); } catch { return res.status(400).json(failure('Invalid webhook payload')); }
  if (!event.invoiceId || !['paid', 'cancelled'].includes(event.status) || !event.transactionId || !Number.isFinite(Number(event.amount))) return res.status(400).json(failure('Invalid webhook event'));
  const tenant = tenantIdsFromRequest({ headers: { 'x-restaurant-id': event.restaurantId, 'x-branch-id': event.branchId } });

  try {
    await PaymentEvent.create({ ...tenant, eventId, type: event.type ?? 'payment.updated' });
  } catch (error: any) {
    if (error?.code === 11000) return res.json(success(null, 'Webhook already processed'));
    throw error;
  }

  const invoice = await Invoice.findOneAndUpdate(
    { _id: event.invoiceId, ...tenant, amount: Number(event.amount), status: { $nin: ['paid', 'cancelled'] } },
    { status: event.status, transactionId: event.transactionId, ...(event.status === 'paid' ? { paidAt: new Date() } : {}) },
    { new: true, runValidators: true }
  ).exec();
  if (!invoice) {
    await PaymentEvent.deleteOne({ ...tenant, eventId }).exec();
    return res.status(409).json(failure('Invoice is missing, mismatched, or already finalized'));
  }
  await Order.findOneAndUpdate({ _id: invoice.order, ...tenant, paymentStatus: { $ne: 'paid' } }, { paymentStatus: event.status === 'paid' ? 'paid' : 'failed' }).exec();
  return res.json(success(null, 'Payment webhook processed'));
});

export default router;
