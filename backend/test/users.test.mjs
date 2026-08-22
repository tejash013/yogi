import request from 'supertest';
import { strict as assert } from 'assert';
import { app } from '../dist/app.js';
import User from '../dist/models/User.js';
import { signAccessToken } from '../dist/utils/jwt.js';

describe('User access management', () => {
  async function createUser(role, suffix) {
    const user = await User.create({
      firstName: role,
      lastName: 'Test',
      email: `${role}-${suffix}-${Date.now()}@example.com`,
      phone: '1234567890',
      password: 'hashed-password',
      role,
    });
    return { user, token: signAccessToken({ id: user._id, role, email: user.email, tokenVersion: user.tokenVersion, restaurantId: user.restaurantId, branchId: user.branchId }) };
  }

  it('denies customers access to user administration', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      email: `user-admin-customer+${Date.now()}@example.com`,
      password: 'Pa$$w0rd',
      confirmPassword: 'Pa$$w0rd',
      firstName: 'Customer',
      lastName: 'Test',
      phone: '1234567890',
    });
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${registration.body.data.token}`);
    assert.equal(res.status, 403);
  });

  it('does not return passwords or reset tokens', async () => {
    const owner = await createUser('owner', 'list');
    await createUser('cashier', 'target');
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${owner.token}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
    assert.equal(Object.hasOwn(res.body.data[0], 'password'), false);
    assert.equal(Object.hasOwn(res.body.data[0], 'resetToken'), false);
  });

  it('prevents owners from changing their own access level', async () => {
    const owner = await createUser('owner', 'self');
    const res = await request(app)
      .patch(`/api/users/${owner.user._id}/access`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ role: 'customer' });
    assert.equal(res.status, 403);
    assert.equal(res.body.message, 'You cannot change your own access level');
  });

  it('prevents owners from modifying manager accounts', async () => {
    const owner = await createUser('owner', 'admin-target');
    const manager = await createUser('manager', 'protected');
    const res = await request(app)
      .patch(`/api/users/${manager.user._id}/access`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'suspended' });
    assert.equal(res.status, 403);
    assert.equal(res.body.message, 'Owners cannot modify administrative accounts');
  });

  it('rejects access tokens immediately after suspension', async () => {
    const owner = await createUser('owner', 'suspend');
    const target = await createUser('cashier', 'suspend-target');
    await User.findByIdAndUpdate(target.user._id, { status: 'suspended', tokenVersion: target.user.tokenVersion + 1 });
    const res = await request(app).get('/api/orders').set('Authorization', `Bearer ${target.token}`);
    assert.equal(res.status, 401);
    void owner;
  });
});
