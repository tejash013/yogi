import request from 'supertest';
import { strict as assert } from 'assert';
import { app } from '../dist/app.js';
import User from '../dist/models/User.js';
import Order from '../dist/models/Order.js';
import Category from '../dist/models/Category.js';
import MenuItem from '../dist/models/MenuItem.js';
import { signAccessToken } from '../dist/utils/jwt.js';

describe('Order ownership controls', () => {
  async function createCustomer(suffix) {
    const user = await User.create({
      firstName: 'Customer',
      lastName: 'Test',
      email: `order-${suffix}-${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'hashed-password',
      role: 'customer',
    });
    return { user, token: signAccessToken({ id: user._id, role: user.role, email: user.email, tokenVersion: user.tokenVersion, restaurantId: user.restaurantId, branchId: user.branchId }) };
  }

  it('denies tracking another customer\'s order', async () => {
    const owner = await createCustomer('owner');
    const other = await createCustomer('other');
    const order = await Order.create({
      user: other.user._id,
      items: [],
      subtotal: 0,
      taxes: 0,
      total: 0,
    });

    const res = await request(app)
      .get(`/api/orders/${order._id}/track`)
      .set('Authorization', `Bearer ${owner.token}`);

    assert.equal(res.status, 403);
  });

  it('does not create an order under another user account', async () => {
    const owner = await createCustomer('creator');
    const other = await createCustomer('target');

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ userId: other.user._id, items: [] });

    assert.notEqual(res.status, 201);
    assert.notEqual(res.body?.data?.user, String(other.user._id));
  });

  it('reserves inventory and rejects orders after stock is exhausted', async () => {
    const customer = await createCustomer('inventory');
    const category = await Category.create({ name: `Test-${Date.now()}` });
    const menuItem = await MenuItem.create({
      title: 'Limited item',
      category: category._id,
      price: 10,
      availableQty: 1,
    });
    const payload = { userId: customer.user._id, items: [{ menuItem: menuItem._id, quantity: 1 }] };

    const first = await request(app).post('/api/orders').set('Authorization', `Bearer ${customer.token}`).send(payload);
    assert.equal(first.status, 201);
    const second = await request(app).post('/api/orders').set('Authorization', `Bearer ${customer.token}`).send(payload);
    assert.equal(second.status, 409);

    const storedItem = await MenuItem.findById(menuItem._id);
    assert.equal(storedItem.availableQty, 0);
  });
});
