import request from 'supertest';
import { strict as assert } from 'assert';
import { app } from '../dist/app.js';
import Restaurant from '../dist/models/Restaurant.js';
import Branch from '../dist/models/Branch.js';
import User from '../dist/models/User.js';
import Order from '../dist/models/Order.js';
import MenuItem from '../dist/models/MenuItem.js';
import Category from '../dist/models/Category.js';
import { signAccessToken } from '../dist/utils/jwt.js';

describe('Tenant isolation', () => {
  async function tenant(name) {
    const restaurant = await Restaurant.create({ name, slug: `${name.toLowerCase()}-${Date.now()}` });
    const branch = await Branch.create({ restaurantId: restaurant._id, name: 'Main', slug: `main-${Date.now()}` });
    return { restaurant, branch };
  }

  it('does not allow restaurant staff to provision tenants', async () => {
    const a = await tenant('Provisioning A');
    const user = await User.create({ restaurantId: a.restaurant._id, branchId: a.branch._id, firstName: 'Staff', lastName: 'Manager', email: `manager-${Date.now()}@example.com`, phone: '1234567890', password: 'hashed', role: 'manager' });
    const token = signAccessToken({ id: user._id, role: user.role, email: user.email, tokenVersion: user.tokenVersion, restaurantId: user.restaurantId, branchId: user.branchId });
    const res = await request(app).post('/api/tenants/restaurants').set('Authorization', `Bearer ${token}`).send({ name: 'Blocked', slug: `blocked-${Date.now()}` });
    assert.equal(res.status, 403);
  });

  it('does not expose branch B menu records to branch A requests', async () => {
    const a = await tenant('Tenant A');
    const b = await tenant('Tenant B');
    const category = await Category.create({ restaurantId: b.restaurant._id, branchId: b.branch._id, name: `B-${Date.now()}` });
    await MenuItem.create({ restaurantId: b.restaurant._id, branchId: b.branch._id, category: category._id, title: 'Branch B Secret Item', price: 10 });

    const res = await request(app).get('/api/menu').set('x-restaurant-id', String(a.restaurant._id)).set('x-branch-id', String(a.branch._id));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.some((item) => item.title === 'Branch B Secret Item'), false);
  });

  it('does not allow a customer from branch A to read branch B orders', async () => {
    const a = await tenant('Order A');
    const b = await tenant('Order B');
    const user = await User.create({
      restaurantId: a.restaurant._id,
      branchId: a.branch._id,
      firstName: 'A', lastName: 'Customer', email: `tenant-a-${Date.now()}@example.com`, phone: '1234567890', password: 'hashed', role: 'customer',
    });
    const order = await Order.create({ restaurantId: b.restaurant._id, branchId: b.branch._id, user: user._id, items: [], subtotal: 0, taxes: 0, total: 0 });
    const token = signAccessToken({ id: user._id, role: user.role, email: user.email, tokenVersion: user.tokenVersion, restaurantId: a.restaurant._id, branchId: a.branch._id });
    const res = await request(app).get(`/api/orders/${order._id}`).set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 404);
  });
});
