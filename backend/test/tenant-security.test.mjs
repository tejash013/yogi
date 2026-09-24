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

  it('blocks staff (manager, chef, cashier) from logging in when restaurant is restricted/paused', async () => {
    const t = await tenant('Restricted Res');
    await Restaurant.updateOne({ _id: t.restaurant._id }, { $set: { isActive: false } });

    const password = 'Password123';
    const { hashPassword } = await import('../dist/utils/password.js');
    const hashedPassword = hashPassword(password);

    const email = `manager-restricted-${Date.now()}@example.com`;
    await User.create({
      restaurantId: t.restaurant._id,
      branchId: t.branch._id,
      firstName: 'Restricted',
      lastName: 'Manager',
      email,
      phone: '9876543210',
      password: hashedPassword,
      role: 'manager',
      status: 'active',
    });

    const res = await request(app).post('/api/auth/login').send({ email, password });
    assert.equal(res.status, 403);
    assert.match(res.body.message, /paused or restricted/i);
  });

  it('blocks staff from logging in when branch is restricted/paused', async () => {
    const t = await tenant('Restricted Branch');
    await Branch.updateOne({ _id: t.branch._id }, { $set: { isActive: false } });

    const password = 'Password123';
    const { hashPassword } = await import('../dist/utils/password.js');
    const hashedPassword = hashPassword(password);

    const email = `cashier-restricted-${Date.now()}@example.com`;
    await User.create({
      restaurantId: t.restaurant._id,
      branchId: t.branch._id,
      firstName: 'Restricted',
      lastName: 'Cashier',
      email,
      phone: '9876543211',
      password: hashedPassword,
      role: 'cashier',
      status: 'active',
    });

    const res = await request(app).post('/api/auth/login').send({ email, password });
    assert.equal(res.status, 403);
    assert.match(res.body.message, /paused or restricted/i);
  });

  it('returns empty menu and categories when restaurant is restricted, never leaking other restaurants', async () => {
    const a = await tenant('Paused Outlet');
    const b = await tenant('Active Outlet');

    const catB = await Category.create({ restaurantId: b.restaurant._id, branchId: b.branch._id, name: `ActiveCat-${Date.now()}` });
    await MenuItem.create({ restaurantId: b.restaurant._id, branchId: b.branch._id, category: catB._id, title: 'Active Secret Dish', price: 25 });

    // Pause restaurant A
    await Restaurant.updateOne({ _id: a.restaurant._id }, { $set: { isActive: false } });

    const menuRes = await request(app).get('/api/menu').set('x-restaurant-id', String(a.restaurant._id)).set('x-branch-id', String(a.branch._id));
    assert.equal(menuRes.status, 200);
    assert.equal(menuRes.body.data.length, 0);

    const catRes = await request(app).get('/api/categories').set('x-restaurant-id', String(a.restaurant._id)).set('x-branch-id', String(a.branch._id));
    assert.equal(catRes.status, 200);
    assert.equal(catRes.body.data.length, 0);
  });

  it('reactivates child branches and makes menu accessible when restaurant is reactivated', async () => {
    const admin = await User.create({ firstName: 'Super', lastName: 'Admin', email: `admin-${Date.now()}@example.com`, phone: '9999999999', password: 'hash', role: 'platformAdmin', status: 'active' });
    const adminToken = signAccessToken({ id: admin._id, role: admin.role, email: admin.email, tokenVersion: admin.tokenVersion, restaurantId: admin.restaurantId, branchId: admin.branchId });

    const t = await tenant('Reactivate Test');
    const cat = await Category.create({ restaurantId: t.restaurant._id, branchId: t.branch._id, name: `Cat-${Date.now()}` });
    await MenuItem.create({ restaurantId: t.restaurant._id, branchId: t.branch._id, category: cat._id, title: 'Reactivated Dish', price: 15 });

    // Deactivate restaurant
    await request(app).put(`/api/tenants/restaurants/${t.restaurant._id}`).set('Authorization', `Bearer ${adminToken}`).send({ isActive: false });
    let branch = await Branch.findById(t.branch._id);
    assert.equal(branch.isActive, false);

    // Reactivate restaurant
    await request(app).put(`/api/tenants/restaurants/${t.restaurant._id}`).set('Authorization', `Bearer ${adminToken}`).send({ isActive: true });
    branch = await Branch.findById(t.branch._id);
    assert.equal(branch.isActive, true);

    // Menu should now return the item
    const res = await request(app).get('/api/menu').set('x-restaurant-id', String(t.restaurant._id)).set('x-branch-id', String(t.branch._id));
    assert.equal(res.status, 200);
    assert.equal(res.body.data.some((item) => item.title === 'Reactivated Dish'), true);
  });
});
