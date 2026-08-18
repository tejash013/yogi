import request from 'supertest';
import { app } from '../dist/app.js';
import { strict as assert } from 'assert';

describe('Health endpoints', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });
});
