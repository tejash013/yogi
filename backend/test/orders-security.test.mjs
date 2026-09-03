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

  it('creates new menu items successfully', async () => {
    const owner = await User.create({
      firstName: 'Owner',
      lastName: 'Test',
      email: `menu-stock-${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'hashed-password',
      role: 'owner',
    });

    const token = signAccessToken({
      id: owner._id,
      role: owner.role,
      email: owner.email,
      tokenVersion: owner.tokenVersion,
      restaurantId: owner.restaurantId,
      branchId: owner.branchId,
    });

    const category = await Category.create({ name: `stock-${Date.now()}` });
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Auto stocked item',
        description: 'Should create menu item',
        category: category._id,
        price: 12,
        image: 'https://example.com/item.jpg',
      });

    assert.equal(res.status, 201);
    assert.ok(res.body?.data?._id, 'Expected new menu item to be created');
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

  it('accepts confirmed as a valid order status update', async () => {
    const owner = await User.create({
      firstName: 'Owner',
      lastName: 'Test',
      email: `owner-confirmed-${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'hashed-password',
      role: 'owner',
    });
    const token = signAccessToken({
      id: owner._id,
      role: owner.role,
      email: owner.email,
      tokenVersion: owner.tokenVersion,
      restaurantId: owner.restaurantId,
      branchId: owner.branchId,
    });
    const category = await Category.create({ name: `confirmed-${Date.now()}` });
    const menuItem = await MenuItem.create({
      title: 'Confirmed item',
      category: category._id,
      price: 10,
      availableQty: 5,
    });

    const order = await Order.create({
      user: owner._id,
      items: [{ menuItem: menuItem._id, quantity: 1, unitPrice: 10 }],
      subtotal: 10,
      taxes: 0.8,
      total: 10.8,
    });

    const res = await request(app)
      .patch(`/api/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'confirmed' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'confirmed');
  });

  it('creates orders successfully for customers', async () => {
    const customer = await createCustomer('order-create');
    const category = await Category.create({ name: `Test-${Date.now()}` });
    const menuItem = await MenuItem.create({
      title: 'Menu item',
      category: category._id,
      price: 10,
    });
    const payload = { userId: customer.user._id, items: [{ menuItem: menuItem._id, quantity: 1 }] };

    const res = await request(app).post('/api/orders').set('Authorization', `Bearer ${customer.token}`).send(payload);
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
  });
});
