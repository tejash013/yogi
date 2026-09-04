import { Router } from 'express';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import { paginated, success, failure } from '../utils/response.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { idParamSchema, invoiceCreateSchema, invoiceQuerySchema, invoiceStatusSchema, invoiceUpdateSchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';
import { recordAudit } from '../utils/audit.js';
import { tenantFilter } from '../utils/tenant.js';
const router = Router();
function paginate(items, page, limit) {
    const start = (page - 1) * limit;
    return paginated(items.slice(start, start + limit), items.length, page, limit);
}
function isCustomer(req) {
    return req.user.role === 'customer';
}
router.get('/', authenticate, requirePermission(permissions.invoicesRead), validateQuery(invoiceQuerySchema), async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const status = String(req.query.status ?? '').trim();
    const filter = { ...tenantFilter(req) };
    if (status) {
        filter.status = status;
    }
    if (isCustomer(req)) {
        const orderIds = await Order.find({ user: req.user.id, ...tenantFilter(req) }).distinct('_id').exec();
        filter.order = { $in: orderIds };
    }
    const invoices = await Invoice.find(filter)
        .populate('order', 'status paymentStatus total')
        .sort({ issuedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    return res.json(paginate(invoices, page, limit));
});
router.get('/:id', authenticate, requirePermission(permissions.invoicesRead), validateParams(idParamSchema), async (req, res) => {
    const invoice = await Invoice.findOne({ _id: req.params.id, ...tenantFilter(req) })
        .populate('order', 'status paymentStatus total')
        .exec();
    if (!invoice) {
        return res.status(404).json(failure('Invoice not found'));
    }
    const order = await Order.findOne({ _id: invoice.order, ...tenantFilter(req) }).select('user').lean().exec();
    if (isCustomer(req) && String(order?.user) !== req.user.id)
        return res.status(403).json(failure('You do not have access to this invoice'));
    return res.json(success(invoice, 'Invoice loaded'));
});
router.post('/', authenticate, requirePermission(permissions.invoicesCreate), validateBody(invoiceCreateSchema), async (req, res) => {
    const { orderId, paymentMethod } = req.body;
    const tenant = tenantFilter(req);
    const idempotencyKey = String(req.get('Idempotency-Key') ?? '').trim();
    if (!idempotencyKey || idempotencyKey.length > 128)
        return res.status(400).json(failure('A valid Idempotency-Key header is required'));
    if (!orderId) {
        return res.status(400).json(failure('orderId is required'));
    }
    const order = await Order.findOne({ _id: orderId, ...tenant }).exec();
    if (!order) {
        return res.status(404).json(failure('Order not found'));
    }
    if (isCustomer(req) && String(order.user) !== req.user.id)
        return res.status(403).json(failure('You do not have access to this order'));
    const existing = await Invoice.findOne({ ...tenant, $or: [{ order: orderId }, { idempotencyKey }] }).exec();
    if (existing)
        return res.status(200).json(success(existing, 'Invoice already exists'));
    const invoice = new Invoice({
        order: orderId,
        ...tenant,
        amount: order.total,
        paymentMethod,
        status: 'pending',
        idempotencyKey,
    });
    await invoice.save();
    await recordAudit({
        actor: req.user.id,
        action: 'invoice.created',
        resourceType: 'Invoice',
        resourceId: String(invoice._id),
        metadata: { orderId: String(order._id), amount: invoice.amount },
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    return res.status(201).json(success(invoice, 'Invoice created successfully'));
});
router.patch('/:id', authenticate, requirePermission(permissions.invoicesUpdate), validateParams(idParamSchema), validateBody(invoiceUpdateSchema), async (req, res) => {
    const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { paymentMethod: req.body.paymentMethod }, { new: true, runValidators: true }).exec();
    if (!invoice) {
        return res.status(404).json(failure('Invoice not found'));
    }
    await recordAudit({ actor: req.user.id, action: 'invoice.payment_method_updated', resourceType: 'Invoice', resourceId: String(invoice._id), metadata: { paymentMethod: req.body.paymentMethod }, ip: req.ip, userAgent: req.get('user-agent') });
    return res.json(success(invoice, 'Invoice updated successfully'));
});
router.patch('/:id/status', authenticate, requirePermission(permissions.invoicesUpdate), validateParams(idParamSchema), validateBody(invoiceStatusSchema), async (req, res) => {
    const { status, transactionId } = req.body;
    if (!status) {
        return res.status(400).json(failure('Status is required'));
    }
    if (status === 'paid' && !transactionId)
        return res.status(400).json(failure('transactionId is required when marking an invoice paid'));
    const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), status: { $nin: ['paid', 'cancelled'] } }, { status, transactionId, ...(status === 'paid' ? { paidAt: new Date() } : {}) }, { new: true, runValidators: true }).exec();
    if (!invoice) {
        return res.status(404).json(failure('Invoice not found or already finalized'));
    }
    const paymentStatus = status === 'paid' ? 'paid' : status === 'cancelled' ? 'failed' : 'pending';
    await Order.findOneAndUpdate({ _id: invoice.order, ...tenantFilter(req), paymentStatus: { $ne: 'paid' } }, { paymentStatus }).exec();
    await recordAudit({ actor: req.user.id, action: 'invoice.status_updated', resourceType: 'Invoice', resourceId: String(invoice._id), metadata: { status }, ip: req.ip, userAgent: req.get('user-agent') });
    return res.json(success(invoice, 'Invoice status updated successfully'));
});
export default router;
