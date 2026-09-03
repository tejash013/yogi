import request from 'supertest';
import { strict as assert } from 'assert';
import { app } from '../dist/app.js';
import Restaurant from '../dist/models/Restaurant.js';
import Branch from '../dist/models/Branch.js';
import User from '../dist/models/User.js';
import { signAccessToken } from '../dist/utils/jwt.js';

describe('Restaurant and Branch CRUD & Address Setup', () => {
  let adminToken;
  let ownerToken;
  let otherOwnerToken;
  let managerToken;
  let customerToken;
  let testRestaurant;
  let testBranch;
  let otherRestaurant;

  before(async () => {
    // 1. Create test restaurants
    testRestaurant = await Restaurant.create({
      name: 'Yogi Gourmet Hub',
      slug: `yogi-gourmet-${Date.now()}`,
      phone: '+91 9876543210',
      email: `gourmet-${Date.now()}@example.com`,
      addressDetails: {
        street: 'Station Road',
        landmark: 'Near Sardar Baug',
        city: 'Bardoli',
        state: 'Gujarat',
        pincode: '394601',
        country: 'India',
      },
      address: 'Station Road, Near Sardar Baug, Bardoli, Gujarat - 394601, India',
      latitude: 21.1197,
      longitude: 73.1167,
      isActive: true,
    });

    testBranch = await Branch.create({
      restaurantId: testRestaurant._id,
      name: 'Central Dine',
      slug: `central-dine-${Date.now()}`,
      phone: '+91 9876543211',
      email: `central-${Date.now()}@example.com`,
      managerName: 'Rajesh Patel',
      addressDetails: {
        street: 'Main Bazaar',
        city: 'Bardoli',
        state: 'Gujarat',
        pincode: '394601',
        country: 'India',
      },
      address: 'Main Bazaar, Bardoli, Gujarat - 394601, India',
      latitude: 21.1197,
      longitude: 73.1167,
      isActive: true,
    });

    otherRestaurant = await Restaurant.create({
      name: 'Other Place',
      slug: `other-${Date.now()}`,
      addressDetails: { city: 'Surat', state: 'Gujarat' },
      address: 'Surat, Gujarat, India',
      isActive: true,
    });

    // 2. Create users and sign tokens
    const adminUser = await User.create({
      firstName: 'Platform',
      lastName: 'Admin',
      email: `platformadmin-${Date.now()}@example.com`,
      phone: '1112223330',
      password: 'hashed',
      role: 'platformAdmin',
    });
    adminToken = signAccessToken({
      id: adminUser._id,
      role: adminUser.role,
      email: adminUser.email,
      tokenVersion: 0,
      restaurantId: adminUser.restaurantId,
      branchId: adminUser.branchId,
    });

    const ownerUser = await User.create({
      restaurantId: testRestaurant._id,
      branchId: testBranch._id,
      firstName: 'Restaurant',
      lastName: 'Owner',
      email: `owner-${Date.now()}@example.com`,
      phone: '1112223331',
      password: 'hashed',
      role: 'owner',
    });
    ownerToken = signAccessToken({ id: ownerUser._id, role: ownerUser.role, email: ownerUser.email, tokenVersion: 0, restaurantId: testRestaurant._id, branchId: testBranch._id });

    const otherOwnerUser = await User.create({
      restaurantId: otherRestaurant._id,
      branchId: testBranch._id,
      firstName: 'Other',
      lastName: 'Owner',
      email: `otherowner-${Date.now()}@example.com`,
      phone: '1112223332',
      password: 'hashed',
      role: 'owner',
    });
    otherOwnerToken = signAccessToken({ id: otherOwnerUser._id, role: otherOwnerUser.role, email: otherOwnerUser.email, tokenVersion: 0, restaurantId: otherRestaurant._id });

    const managerUser = await User.create({
      restaurantId: testRestaurant._id,
      branchId: testBranch._id,
      firstName: 'Branch',
      lastName: 'Manager',
      email: `manager-${Date.now()}@example.com`,
      phone: '1112223333',
      password: 'hashed',
      role: 'manager',
    });
    managerToken = signAccessToken({ id: managerUser._id, role: managerUser.role, email: managerUser.email, tokenVersion: 0, restaurantId: testRestaurant._id, branchId: testBranch._id });

    const customerUser = await User.create({
      firstName: 'Regular',
      lastName: 'Customer',
      email: `customer-${Date.now()}@example.com`,
      phone: '1112223334',
      password: 'hashed',
      role: 'customer',
    });
    customerToken = signAccessToken({ id: customerUser._id, role: customerUser.role, email: customerUser.email, tokenVersion: 0 });
  });

  describe('Restaurant CRUD & Structured Address', () => {
    it('allows platformAdmin to provision restaurant with structured address and resolves coordinates', async () => {
      const res = await request(app)
        .post('/api/tenants/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Surat Spice Lounge',
          slug: `surat-spice-${Date.now()}`,
          phone: '+91 9998887776',
          email: 'info@suratspice.com',
          addressDetails: {
            street: 'Ring Road, Near Flyover',
            landmark: 'Textile Market',
            city: 'Surat',
            state: 'Gujarat',
            pincode: '395002',
            country: 'India',
          },
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Surat Spice Lounge');
      assert.ok(res.body.data.address.includes('Surat'));
      assert.ok(res.body.data.address.includes('395002'));
      // Coords should be auto-resolved from Surat
      assert.equal(typeof res.body.data.latitude, 'number');
      assert.equal(typeof res.body.data.longitude, 'number');
    });

    it('retrieves single restaurant details by ID', async () => {
      const res = await request(app)
        .get(`/api/tenants/restaurants/${testRestaurant._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.name, 'Yogi Gourmet Hub');
      assert.equal(res.body.data.addressDetails.city, 'Bardoli');
      assert.equal(typeof res.body.data.branchCount, 'number');
    });

    it('allows owner to update their own restaurant profile and address', async () => {
      const res = await request(app)
        .put(`/api/tenants/restaurants/${testRestaurant._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          tagline: 'Best Indian Fine Dining in South Gujarat',
          addressDetails: {
            street: 'New Station Road',
            landmark: 'Near Gandhi Statue',
            city: 'Bardoli',
            state: 'Gujarat',
            pincode: '394601',
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.tagline, 'Best Indian Fine Dining in South Gujarat');
      assert.ok(res.body.data.address.includes('New Station Road'));
    });

    it('forbids owner from modifying another restaurant', async () => {
      const res = await request(app)
        .put(`/api/tenants/restaurants/${otherRestaurant._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Hacked' });

      assert.equal(res.status, 403);
    });
  });

  describe('Branch CRUD & Address Setup', () => {
    let createdBranchId;

    it('allows owner to create a new branch under their restaurant with structured address', async () => {
      const res = await request(app)
        .post(`/api/tenants/restaurants/${testRestaurant._id}/branches`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Vyara Highway Outpost',
          slug: `vyara-outpost-${Date.now()}`,
          branchCode: 'VY-01',
          phone: '+91 9898000000',
          managerName: 'Kishore Patel',
          addressDetails: {
            street: 'National Highway 53',
            landmark: 'Near Toll Plaza',
            city: 'Vyara',
            state: 'Gujarat',
            pincode: '394650',
          },
          seatingCapacity: 60,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Vyara Highway Outpost');
      assert.equal(res.body.data.managerName, 'Kishore Patel');
      assert.ok(res.body.data.address.includes('Vyara'));
      // Coords auto-resolved for Vyara
      assert.equal(typeof res.body.data.latitude, 'number');
      assert.equal(typeof res.body.data.longitude, 'number');
      createdBranchId = res.body.data._id;
    });

    it('retrieves single branch by ID', async () => {
      const res = await request(app)
        .get(`/api/tenants/branches/${createdBranchId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.name, 'Vyara Highway Outpost');
      assert.equal(res.body.data.branchCode, 'VY-01');
    });

    it('allows manager to update their assigned branch address and operational info', async () => {
      const res = await request(app)
        .put(`/api/tenants/branches/${testBranch._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          phone: '+91 9990001112',
          managerName: 'Rajesh P. (Senior)',
          addressDetails: {
            street: 'Main Bazaar Renovated',
            city: 'Bardoli',
            state: 'Gujarat',
            pincode: '394601',
          },
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.phone, '+91 9990001112');
      assert.equal(res.body.data.managerName, 'Rajesh P. (Senior)');
    });

    it('assigns a matching manager account to the updated branch', async () => {
      const otherBranch = await Branch.create({
        restaurantId: testRestaurant._id,
        name: 'Yogi Res',
        slug: `yogi-res-${Date.now()}`,
        addressDetails: { city: 'Bardoli', state: 'Gujarat' },
      });

      const res = await request(app)
        .put(`/api/tenants/branches/${otherBranch._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ managerName: 'Branch Manager' });

      assert.equal(res.status, 200);
      const assignedManager = await User.findOne({ firstName: 'Branch', lastName: 'Manager' });
      assert.equal(String(assignedManager.branchId), String(otherBranch._id));
      assert.equal(assignedManager.tokenVersion, 1);
    });

    it('forbids manager from updating a different branch', async () => {
      const res = await request(app)
        .put(`/api/tenants/branches/${createdBranchId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Unauthorized Change' });

      assert.equal(res.status, 403);
    });

    it('allows owner to deactivate branch', async () => {
      const res = await request(app)
        .delete(`/api/tenants/branches/${createdBranchId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.isActive, false);
    });
  });

  describe('Deactivation Cascading', () => {
    it('deactivating a restaurant cascades deactivation to its branches', async () => {
      const res = await request(app)
        .delete(`/api/tenants/restaurants/${testRestaurant._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.isActive, false);

      const branch = await Branch.findById(testBranch._id).lean().exec();
      assert.equal(branch.isActive, false);
    });
  });
});
