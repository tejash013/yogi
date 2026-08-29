import request from 'supertest';
import { app } from '../dist/app.js';
import { strict as assert } from 'assert';

describe('Health endpoints', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health').set('x-request-id', 'health-test');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.headers['x-request-id'], 'health-test');
  });

  it('GET /health should not rate-limit a normal burst of refreshes', async () => {
    const requests = Array.from({ length: 110 }, (_, index) =>
      request(app)
        .get('/health')
        .set('x-request-id', `health-refresh-${index}`)
    );

    const responses = await Promise.all(requests);
    const tooMany = responses.filter((res) => res.status === 429);

    assert.equal(tooMany.length, 0, `Unexpected 429 responses: ${tooMany.length}`);
  });

  it('GET /ready should report database readiness', async () => {
    const res = await request(app).get('/ready');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ready');
    assert.equal(res.body.database, 'ok');
  });
});
