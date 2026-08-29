import assert from 'node:assert/strict';
import Category from '../dist/models/Category.js';
import MenuItem from '../dist/models/MenuItem.js';
import Offer from '../dist/models/Offer.js';
import { seedDatabase } from '../dist/data/seed.js';

describe('catalog seeding', function () {
  it('creates default menu categories, items, and offers when collections are empty', async function () {
    await Category.deleteMany({});
    await MenuItem.deleteMany({});
    await Offer.deleteMany({});

    await seedDatabase();

    const categoryCount = await Category.countDocuments();
    const menuCount = await MenuItem.countDocuments();
    const offerCount = await Offer.countDocuments();

    assert.ok(categoryCount > 0, 'Expected categories to be seeded');
    assert.ok(menuCount > 0, 'Expected menu items to be seeded');
    assert.ok(offerCount > 0, 'Expected offers to be seeded');
  });
});
