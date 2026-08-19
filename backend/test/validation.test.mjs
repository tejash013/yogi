import request from 'supertest';
import { strict as assert } from 'assert';
import { app } from '../dist/app.js';

describe('Request validation', () => {
  it('rejects malformed resource ids', async () => {
    const res = await request(app).get('/api/categories/not-an-id');
    assert.equal(res.status, 400);
    assert.equal(res.body.message, 'Id: Invalid ID');
  });

  it('rejects invalid order items before database access', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      email: `order-validation+${Date.now()}@example.com`,
      password: 'Pa$$w0rd',
      confirmPassword: 'Pa$$w0rd',
      firstName: 'Order',
      lastName: 'Validation',
      phone: '1234567890',
    });
    const res = await request(app).post('/api/orders').send({
      userId: '507f1f77bcf86cd799439011',
      items: [{ menuItem: 'bad-id', quantity: 0 }],
    }).set('Authorization', `Bearer ${registration.body.data.token}`);
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, ['Items.0.menuItem: Invalid ID', 'Items.0.quantity: Number must be greater than 0']);
  });

  it('requires authentication before accessing reports', async () => {
    const res = await request(app).get('/api/reports/sales?startDate=not-a-date');
    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Unauthorized');
  });

  it('rejects protected mutations without authentication', async () => {
    const res = await request(app).post('/api/menu').send({});
    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Unauthorized');
  });

  it('forbids a customer from accessing staff-only resources', async () => {
    const registration = await request(app).post('/api/auth/register').send({
      email: `permission-test+${Date.now()}@example.com`,
      password: 'Pa$$w0rd',
      confirmPassword: 'Pa$$w0rd',
      firstName: 'Permission',
      lastName: 'Test',
      phone: '1234567890',
    });
    const res = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${registration.body.data.token}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.message, 'You do not have permission to perform this action');
  });

  it('rejects unknown fields in strict public bodies', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: `strict-validation+${Date.now()}@example.com`,
      password: 'Pa$$w0rd',
      confirmPassword: 'Pa$$w0rd',
      firstName: 'Strict',
      lastName: 'Validation',
      phone: '1234567890',
      unexpected: true,
    });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /^Request: Unrecognized key/);
  });
});
