export const users = [
    {
        id: 'u1',
        firstName: 'Anna',
        lastName: 'Lee',
        email: 'anna@example.com',
        phone: '+15551234567',
        password: 'password',
        role: 'customer',
    },
    {
        id: 'u2',
        firstName: 'Carlos',
        lastName: 'Smith',
        email: 'carlos@example.com',
        phone: '+15557654321',
        password: 'password',
        role: 'staff',
    },
];
export const categories = [
    { id: 'c1', name: 'Appetizers' },
    { id: 'c2', name: 'Main Course' },
    { id: 'c3', name: 'Desserts' },
    { id: 'c4', name: 'Beverages' },
];
export const menuItems = [
    {
        id: 'm1',
        title: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella, basil and tomato sauce.',
        categoryId: 'c2',
        price: 14.99,
        image: '/images/pizza.png',
        isPopular: true,
        isRecommended: true,
    },
    {
        id: 'm2',
        title: 'Avocado Salad',
        description: 'Mixed greens, avocado, tomatoes, and citrus vinaigrette.',
        categoryId: 'c1',
        price: 10.5,
        image: '/images/salad.png',
        isPopular: true,
        isRecommended: false,
    },
    {
        id: 'm3',
        title: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center.',
        categoryId: 'c3',
        price: 8.75,
        image: '/images/cake.png',
        isPopular: false,
        isRecommended: true,
    },
];
export const tables = [
    { id: 't1', label: 'Table 1', status: 'available', capacity: 4 },
    { id: 't2', label: 'Table 2', status: 'occupied', capacity: 6 },
    { id: 't3', label: 'Table 3', status: 'reserved', capacity: 2 },
];
export const orders = [
    {
        id: 'o1',
        userId: 'u1',
        tableId: 't2',
        status: 'preparing',
        paymentStatus: 'pending',
        orderType: 'dine-in',
        total: 38.49,
        createdAt: new Date().toISOString(),
        items: [
            { id: 'm1', quantity: 1 },
            { id: 'm2', quantity: 2 },
        ],
    },
];
export const employees = [
    { id: 'e1', name: 'Mia Chen', role: 'Cashier', status: 'active' },
    { id: 'e2', name: 'Noah Patel', role: 'Chef', status: 'active' },
];
export const inventory = [
    { id: 'i1', name: 'Tomato Sauce', quantity: 24, unit: 'liters', reorderLevel: 5 },
    { id: 'i2', name: 'Flour', quantity: 120, unit: 'kg', reorderLevel: 20 },
];
export const invoices = [
    { id: 'inv1', orderId: 'o1', amount: 38.49, status: 'paid', createdAt: new Date().toISOString() },
];
export const offers = [
    {
        id: 'offer1',
        title: 'Weekend Special',
        description: '15% off selected mains.',
        discountType: 'percentage',
        discountValue: 15,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        terms: ['Valid for dine-in only', 'Cannot be combined with other offers'],
        isActive: true,
    },
];
export const coupons = [
    {
        code: 'SAVE10',
        discountType: 'fixed',
        discountValue: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
    },
];
