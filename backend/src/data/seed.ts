import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import Offer from '../models/Offer.js';
import { DEFAULT_BRANCH_ID, DEFAULT_RESTAURANT_ID } from '../utils/tenant.js';

const tenant = {
  restaurantId: DEFAULT_RESTAURANT_ID,
  branchId: DEFAULT_BRANCH_ID,
};

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

  await Offer.updateMany(
    { $or: [{ offerType: { $ne: 'coupon' }, code: { $exists: true } }, { offerType: 'coupon', code: { $in: [null, ''] } }] },
    { $unset: { code: '' } }
  ).catch(() => undefined);

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

  await Offer.syncIndexes();
}
