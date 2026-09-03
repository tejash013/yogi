import request from 'supertest';
import { strict as assert } from 'assert';
import { app } from '../dist/app.js';
import User from '../dist/models/User.js';

describe('Google Auth routes', () => {
  const uniqueId = Date.now();
  const testEmail = `google.user.${uniqueId}@example.com`;
  const testGoogleId = `gid-${uniqueId}`;
  const validTestToken = `test-google-token:${testEmail}:${testGoogleId}:Jane:Doe`;

  it('rejects empty or missing credential', async () => {
    const res = await request(app).post('/api/auth/google').send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('registers a new user directly with Google', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: validTestToken });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token, 'Expected access token in response');
    assert.equal(res.body.data.user.email, testEmail);
    assert.equal(res.body.data.user.role, 'customer');
    assert.equal(res.body.data.user.firstName, 'Jane');
    assert.equal(res.body.data.user.lastName, 'Doe');
    assert.match(res.headers['set-cookie'][0], /restaurantos_refresh=.*HttpOnly/);

    const dbUser = await User.findOne({ googleId: testGoogleId }).exec();
    assert.ok(dbUser);
    assert.equal(dbUser.authProvider, 'google');
  });

  it('logs in an existing Google user', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: validTestToken });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, testEmail);
  });

  it('links googleId if existing user registered via email', async () => {
    const localEmail = `local.user.${uniqueId}@example.com`;
    const localUser = new User({
      firstName: 'Local',
      lastName: 'User',
      email: localEmail,
      phone: '1234567890',
      password: 'some-password-hash',
      role: 'customer',
      status: 'active',
      authProvider: 'local',
    });
    await localUser.save();

    const linkGoogleId = `gid-link-${uniqueId}`;
    const linkToken = `test-google-token:${localEmail}:${linkGoogleId}:Local:User`;

    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: linkToken });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, localEmail);

    const updatedUser = await User.findById(localUser._id).exec();
    assert.equal(updatedUser.googleId, linkGoogleId);
    assert.equal(updatedUser.authProvider, 'google');
  });

  it('rejects Google login if user status is suspended', async () => {
    const suspendedEmail = `suspended.${uniqueId}@example.com`;
    const suspendedGoogleId = `gid-susp-${uniqueId}`;
    const user = new User({
      firstName: 'Suspended',
      lastName: 'User',
      email: suspendedEmail,
      googleId: suspendedGoogleId,
      role: 'customer',
      status: 'suspended',
      authProvider: 'google',
    });
    await user.save();

    const token = `test-google-token:${suspendedEmail}:${suspendedGoogleId}:Suspended:User`;
    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: token });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /deactivated or suspended/i);
  });
});
