import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import Offer from '../models/Offer.js';
import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import Branch from '../models/Branch.js';
import { DEFAULT_BRANCH_ID, DEFAULT_RESTAURANT_ID } from '../utils/tenant.js';
import { geocodeAddress } from '../utils/geocoding.js';

const tenant = {
  restaurantId: DEFAULT_RESTAURANT_ID,
  branchId: DEFAULT_BRANCH_ID,
};

const defaultTables = [
  { label: 'Table 1', capacity: 4, status: 'available', location: 'Window View', notes: 'Warm ambient lighting & garden view' },
  { label: 'Table 2', capacity: 4, status: 'available', location: 'Center Hall', notes: 'Under chef wall graphics with quick service' },
  { label: 'Table 3', capacity: 4, status: 'available', location: 'Plant Corner', notes: 'Cozy greenery & quiet dining' },
  { label: 'Table 4', capacity: 4, status: 'available', location: 'Window Front', notes: 'Near front glass facade' },
  { label: 'Table 5', capacity: 4, status: 'available', location: 'Center Prime', notes: 'Prime seating for families & groups' },
  { label: 'Table 6', capacity: 4, status: 'available', location: 'Wood Slat Corner', notes: 'Near wooden accent partition & lush vines' },
];

const defaultCategories = [
  { name: 'Pizza', description: 'Wood-fired pizzas with fresh ingredients' },
  { name: 'Main Course', description: 'Hearty mains for a satisfying meal' },
  { name: 'Salads', description: 'Fresh and healthy salads' },
  { name: 'Desserts', description: 'Sweet treats and desserts' },
  { name: 'Appetizers', description: 'Light bites to start your meal' },
  { name: 'Beverages', description: 'Refreshing drinks and juices' },
];

const defaultMenuItems = [
  {
    title: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil.',
    price: 12.99,
    image: '/images/menu/margherita-pizza.jpg',
    isPopular: true,
    isRecommended: true,
    availableQty: 20,
    tags: ['pizza', 'vegetarian', 'popular'],
    categoryName: 'Pizza',
  },
  {
    title: 'Grilled Salmon',
    description: 'Atlantic salmon fillet with lemon butter and seasonal vegetables.',
    price: 24.99,
    discountPrice: 19.99,
    image: '/images/menu/grilled-salmon.jpg',
    isPopular: true,
    isRecommended: false,
    availableQty: 12,
    tags: ['seafood', 'healthy', 'grilled'],
    categoryName: 'Main Course',
  },
  {
    title: 'Caesar Salad',
    description: 'Crisp romaine with parmesan, croutons, and Caesar dressing.',
    price: 9.99,
    image: '/images/menu/caesar-salad.jpg',
    isPopular: false,
    isRecommended: true,
    availableQty: 18,
    tags: ['salad', 'vegetarian', 'healthy'],
    categoryName: 'Salads',
  },
  {
    title: 'Chocolate Lava Cake',
    description: 'Rich chocolate cake with a molten center and vanilla ice cream.',
    price: 8.99,
    image: '/images/menu/chocolate-lava-cake.jpg',
    isPopular: true,
    isRecommended: true,
    availableQty: 16,
    tags: ['dessert', 'chocolate', 'popular'],
    categoryName: 'Desserts',
  },
  {
    title: 'BBQ Chicken Wings',
    description: 'Crispy chicken wings tossed in smoky BBQ sauce.',
    price: 11.99,
    discountPrice: 9.99,
    image: '/images/menu/bbq-chicken-wings.jpg',
    isPopular: true,
    isRecommended: false,
    availableQty: 14,
    tags: ['appetizer', 'chicken', 'spicy'],
    categoryName: 'Appetizers',
  },
  {
    title: 'Mango Cold Brew',
    description: 'Mango-infused cold brew with a tropical finish.',
    price: 6.5,
    image: '/images/menu/mango-cold-brew.jpg',
    isPopular: false,
    isRecommended: true,
    availableQty: 25,
    tags: ['beverage', 'cold', 'refreshing'],
    categoryName: 'Beverages',
  },
  {
    title: 'Classic Burger',
    description: 'Juicy grilled chicken burger with lettuce and signature sauce.',
    price: 13.5,
    image: '/images/menu/classic-burger.jpg',
    isPopular: true,
    isRecommended: false,
    availableQty: 17,
    tags: ['burger', 'grilled', 'popular'],
    categoryName: 'Main Course',
  },
  {
    title: 'Tomato Basil Soup',
    description: 'Comforting tomato basil soup served with toasted bread.',
    price: 7.5,
    image: '/images/menu/tomato-basil-soup.jpg',
    isPopular: false,
    isRecommended: true,
    availableQty: 18,
    tags: ['soup', 'comfort', 'vegetarian'],
    categoryName: 'Main Course',
  },
];

const defaultOffers = [
  {
    title: 'Weekend Special',
    description: '15% off selected mains this weekend.',
    discountType: 'percentage',
    discountValue: 15,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    terms: ['Valid for dine-in only', 'Cannot be combined with other offers'],
    offerType: 'offer',
    isActive: true,
  },
  {
    title: 'Lunch Combo',
    description: 'Get 10% off on combo meals after 12 PM.',
    discountType: 'percentage',
    discountValue: 10,
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    terms: ['Apply at checkout', 'Limited time offer'],
    offerType: 'offer',
    isActive: true,
  },
  {
    title: 'SAVE10',
    description: 'Flat ₹10 off on your next order.',
    discountType: 'fixed',
    discountValue: 10,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    terms: ['Applicable on minimum order of ₹200'],
    offerType: 'coupon',
    code: 'SAVE10',
    isActive: true,
  },
];

const seededOffers = defaultOffers.map((offer) => {
  const normalizedOffer = { ...offer };
  if (normalizedOffer.offerType !== 'coupon') {
    delete (normalizedOffer as any).code;
  }
  return normalizedOffer;
});

export async function seedDatabase() {
  try {
    await Offer.collection.dropIndex('restaurantId_1_branchId_1_code_1').catch(() => undefined);
  } catch {
    // Ignore missing index issues while cleaning stale duplicates.
  }

  await Category.updateMany(
    { $or: [{ restaurantId: { $exists: false } }, { branchId: { $exists: false } }] },
    { $set: tenant }
  ).catch(() => undefined);
  await MenuItem.updateMany(
    { $or: [{ restaurantId: { $exists: false } }, { branchId: { $exists: false } }] },
    { $set: tenant }
  ).catch(() => undefined);

  await Offer.updateMany(
    { $or: [{ offerType: { $ne: 'coupon' }, code: { $exists: true } }, { offerType: 'coupon', code: { $in: [null, ''] } }] },
    { $unset: { code: '' } }
  ).catch(() => undefined);

  // Seed default SaaS Restaurants and Branches
  const restaurantCount = await Restaurant.countDocuments().exec();
  if (restaurantCount === 0) {
    const r1 = await Restaurant.create({
      _id: DEFAULT_RESTAURANT_ID,
      name: 'Yogi Grand Restaurant & Lounge',
      slug: 'yogi-grand',
      address: '101 Culinary Blvd, Downtown Hub',
      latitude: 19.0760,
      longitude: 72.8777,
      isActive: true,
    });
    await Branch.create({
      _id: DEFAULT_BRANCH_ID,
      restaurantId: r1._id,
      name: 'Main Dining Hall (Downtown)',
      slug: 'downtown-main',
      address: '101 Culinary Blvd, City Center',
      latitude: 19.0760,
      longitude: 72.8777,
      isActive: true,
    });
    await Branch.create({
      restaurantId: r1._id,
      name: 'Express Food Court (Uptown)',
      slug: 'uptown-express',
      address: '45 Uptown Mall, Food Court L2',
      latitude: 19.1136,
      longitude: 72.8697,
      isActive: true,
    });
    const r2 = await Restaurant.create({
      name: 'Yogi Cloud Kitchens & Bistro',
      slug: 'yogi-bistro',
      address: 'Terminal 1 Plaza, Airport Rd',
      latitude: 19.0896,
      longitude: 72.8656,
      isActive: true,
    });
    await Branch.create({
      restaurantId: r2._id,
      name: 'Airport Road Bistro',
      slug: 'airport-bistro',
      address: 'Terminal 1 Plaza, Airport Rd',
      latitude: 19.0896,
      longitude: 72.8656,
      isActive: true,
    });
    await Branch.create({
      restaurantId: r2._id,
      name: 'Sea Breeze Coastal Dine',
      slug: 'coastal-breeze',
      address: '88 Promenade View, Beach Rd',
      latitude: 19.0988,
      longitude: 72.8267,
      isActive: true,
    });
  }

  const categoryCount = await Category.countDocuments({ ...tenant, isActive: true }).exec();
  if (categoryCount === 0) {
    const categories = await Category.insertMany(defaultCategories.map((category) => ({ ...tenant, ...category })));
    const categoryMap = new Map(categories.map((category) => [category.name, category._id]));

    const items = defaultMenuItems.map((item) => ({
      ...tenant,
      ...item,
      category: categoryMap.get(item.categoryName),
      discountPrice: item.discountPrice ?? undefined,
      tags: item.tags,
    }));

    await MenuItem.insertMany(items);
  }

  const offerCount = await Offer.countDocuments({ ...tenant, isActive: true }).exec();
  if (offerCount === 0) {
    await Offer.insertMany(seededOffers.map((offer) => ({ ...tenant, ...offer })));
  }

  const tableCount = await Table.countDocuments({ ...tenant }).exec();
  if (tableCount === 0) {
    await Table.insertMany(defaultTables.map((table) => ({ ...tenant, ...table })));
  }

  // Backfill coordinates for any existing branches or restaurants missing them
  const branchesWithoutCoords = await Branch.find({
    $or: [{ latitude: { $exists: false } }, { latitude: null }, { longitude: { $exists: false } }, { longitude: null }],
  }).exec();

  for (const b of branchesWithoutCoords) {
    const coords = geocodeAddress(b.address, b.name);
    if (coords) {
      await Branch.updateOne({ _id: b._id }, { $set: { latitude: coords.latitude, longitude: coords.longitude } });
    }
  }

  const restaurantsWithoutCoords = await Restaurant.find({
    $or: [{ latitude: { $exists: false } }, { latitude: null }, { longitude: { $exists: false } }, { longitude: null }],
  }).exec();

  for (const r of restaurantsWithoutCoords) {
    const coords = geocodeAddress(r.address, r.name);
    if (coords) {
      await Restaurant.updateOne({ _id: r._id }, { $set: { latitude: coords.latitude, longitude: coords.longitude } });
    }
  }

  await Offer.syncIndexes();
}
