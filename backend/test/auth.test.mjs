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
      confirmPassword: password,
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.refreshToken, undefined);
    assert.match(res.headers['set-cookie'][0], /restaurantos_refresh=.*HttpOnly/);
  });

  it('should never allow public registration to assign an elevated role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: `role-test+${Date.now()}@example.com`,
      password,
      confirmPassword: password,
      firstName: 'Role',
      lastName: 'Test',
      phone: '1234567890',
      role: 'manager',
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Unrecognized key/);
  });

  it('should login the user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.refreshToken, undefined);
    assert.match(res.headers['set-cookie'][0], /restaurantos_refresh=.*HttpOnly/);
  });

  it('rotates a refresh token atomically under concurrent use', async () => {
    const login = await request(app).post('/api/auth/login').send({ email, password });
    const refreshCookie = login.headers['set-cookie'][0];
    const results = await Promise.all([
      request(app).post('/api/auth/refresh').set('Cookie', refreshCookie),
      request(app).post('/api/auth/refresh').set('Cookie', refreshCookie),
    ]);

    assert.equal(results.filter((result) => result.status === 200).length, 1);
    assert.equal(results.filter((result) => result.status === 401).length, 1);
  });

  it('revokes the refresh session on logout', async () => {
    const login = await request(app).post('/api/auth/login').send({ email, password });
    const refreshCookie = login.headers['set-cookie'][0];
    const logout = await request(app).post('/api/auth/logout').set('Cookie', refreshCookie);
    assert.equal(logout.status, 200);

    const refreshed = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie);
    assert.equal(refreshed.status, 401);
    assert.match(logout.headers['set-cookie'][0], /restaurantos_refresh=;.*Max-Age=0/);
  });

  it('should return readable validation messages', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'invalid', password: '' });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, 'Email: Please enter a valid email address');
    assert.deepEqual(res.body.errors, ['Email: Please enter a valid email address', 'Password: This field is required']);
  });
});
