import crypto from 'crypto';
import request from 'supertest';
import { strict as assert } from 'assert';
import { app } from '../dist/app.js';
import User from '../dist/models/User.js';
import Order from '../dist/models/Order.js';
import Invoice from '../dist/models/Invoice.js';
import { signAccessToken } from '../dist/utils/jwt.js';

describe('Payment security controls', () => {
  async function createUser(role, suffix) {
    const user = await User.create({
      firstName: role,
      lastName: 'Test',
      email: `payment-${role}-${suffix}-${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'hashed-password',
      role,
    });
    return { user, token: signAccessToken({ id: user._id, role, email: user.email, tokenVersion: user.tokenVersion, restaurantId: user.restaurantId, branchId: user.branchId }) };
  }

  it('prevents duplicate invoices and synchronizes paid status', async () => {
    const cashier = await createUser('cashier', 'cashier');
    const customer = await createUser('customer', 'customer');
    const order = await Order.create({ user: customer.user._id, items: [], subtotal: 10, taxes: 0, total: 10 });
    const headers = { Authorization: `Bearer ${cashier.token}`, 'Idempotency-Key': `invoice-${Date.now()}` };

    const first = await request(app).post('/api/invoices').set(headers).send({ orderId: order._id, paymentMethod: 'card' });
    assert.equal(first.status, 201);
    const second = await request(app).post('/api/invoices').set({ ...headers, 'Idempotency-Key': `${headers['Idempotency-Key']}-retry` }).send({ orderId: order._id });
    assert.equal(second.status, 200);
    assert.equal(String(second.body.data._id), String(first.body.data._id));

    const paid = await request(app)
      .patch(`/api/invoices/${first.body.data._id}/status`)
      .set('Authorization', `Bearer ${cashier.token}`)
      .send({ status: 'paid', transactionId: 'txn-test-1' });
    assert.equal(paid.status, 200);
    const updatedOrder = await Order.findById(order._id);
    assert.equal(updatedOrder.paymentStatus, 'paid');
  });

  it('isolates invoice reads and validates signed idempotent webhooks', async () => {
    const cashier = await createUser('cashier', 'read');
    const customer = await createUser('customer', 'owner');
    const other = await createUser('customer', 'other');
    const order = await Order.create({ user: customer.user._id, items: [], subtotal: 5, taxes: 0, total: 5 });
    const invoice = await Invoice.create({ order: order._id, amount: 5, idempotencyKey: `read-${Date.now()}` });
    const otherToken = signAccessToken({ id: other.user._id, role: 'customer', email: other.user.email, tokenVersion: other.user.tokenVersion, restaurantId: other.user.restaurantId, branchId: other.user.branchId });
    const forbidden = await request(app).get(`/api/invoices/${invoice._id}`).set('Authorization', `Bearer ${otherToken}`);
    assert.equal(forbidden.status, 403);

    process.env.PAYMENT_WEBHOOK_SECRET = 'test-webhook-secret';
    const payload = JSON.stringify({ invoiceId: invoice._id, amount: 5, status: 'paid', transactionId: 'txn-webhook-1' });
    const signature = crypto.createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET).update(payload).digest('hex');
    const eventId = `event-${Date.now()}`;
    const webhook = request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').set('x-payment-signature', signature).set('x-payment-event-id', eventId).send(payload);
    const result = await webhook;
    assert.equal(result.status, 200);
    const replay = await request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').set('x-payment-signature', signature).set('x-payment-event-id', eventId).send(payload);
    assert.equal(replay.status, 200);
    void cashier;
  });
});