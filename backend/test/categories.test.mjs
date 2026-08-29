import crypto from 'crypto';
import request from 'supertest';
import { strict as assert } from 'assert';
import User from '../dist/models/User.js';
import { app } from '../dist/app.js';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

describe('Categories API', () => {
  it('creates a category with an icon field', async () => {
    const email = `category-create+${Date.now()}@example.com`;
    await User.create({
      firstName: 'Category',
      lastName: 'Owner',
      email,
      phone: '1234567890',
      password: hashPassword('Pa$$w0rd'),
      role: 'owner',
      restaurantId: '000000000000000000000001',
      branchId: '000000000000000000000002',
    });

    const login = await request(app).post('/api/auth/login').send({
      email,
      password: 'Pa$$w0rd',
    });

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${login.body.data.token}`)
      .send({
        name: 'Pizza',
        description: 'Chef specials',
        icon: '🍕',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Pizza');
    assert.equal(res.body.data.icon, '🍕');
  });
});
