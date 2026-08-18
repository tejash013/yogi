import request from 'supertest';
import { strict as assert } from 'assert';
import { app } from '../dist/app.js';

describe('Auth routes', () => {
  const email = `test+${Date.now()}@example.com`;
  const password = 'Pa$$w0rd';

  it('should register a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email,
      password,
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.refreshToken);
  });

  it('should login the user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.refreshToken);
  });
});
