// Route Paths
export const ROUTES = {
    // Splash & Welcome
    SPLASH: '/splash',
    WELCOME: '/welcome',
    // Auth routes
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        FORGOT_PASSWORD: '/auth/forgot-password',
        OTP_VERIFICATION: '/auth/otp-verification',
    },
    // Customer routes
    CUSTOMER: {
        HOME: '/customer/home',
        MENU: '/customer/menu',
        FOOD_DETAILS: '/customer/menu/:id',
        CART: '/customer/cart',
        CHECKOUT: '/customer/checkout',
        ORDER_SUCCESS: '/customer/order-success',
        ORDER_TRACKING: '/customer/order-tracking/:orderId',
        MY_ORDERS: '/customer/orders',
        PROFILE: '/customer/profile',
        FAVORITES: '/customer/favorites',
        REWARDS: '/customer/rewards',
        COUPONS: '/customer/coupons',
        FEEDBACK: '/customer/feedback',
    },
    // Admin routes
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        MENU_MANAGEMENT: '/admin/menu',
        CATEGORIES: '/admin/categories',
        ORDERS: '/admin/orders',
        CUSTOMERS: '/admin/customers',
        EMPLOYEES: '/admin/employees',
        TABLES: '/admin/tables',
        INVENTORY: '/admin/inventory',
        REPORTS: '/admin/reports',
        SETTINGS: '/admin/settings',
    },
    // Kitchen routes
    KITCHEN: {
        DASHBOARD: '/kitchen/dashboard',
        LIVE_ORDERS: '/kitchen/live-orders',
        PREPARING: '/kitchen/preparing',
        READY: '/kitchen/ready',
        COMPLETED: '/kitchen/completed',
    },
    // Cashier routes
    CASHIER: {
        DASHBOARD: '/cashier/dashboard',
        BILLING: '/cashier/billing',
        PAYMENTS: '/cashier/payments',
        INVOICES: '/cashier/invoices',
    },
    // Owner routes
    OWNER: {
        DASHBOARD: '/owner/dashboard',
        ANALYTICS: '/owner/analytics',
        REVENUE: '/owner/revenue',
        EXPENSES: '/owner/expenses',
        REPORTS: '/owner/reports',
    },
    // Error routes
    ERROR: {
        FORBIDDEN: '/error/403',
        NOT_FOUND: '/error/404',
        SERVER_ERROR: '/error/500',
    },
    // Root
    ROOT: '/',
    DEFAULT: '/customer/home',
};
// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH_TOKEN: '/api/auth/refresh',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
        VERIFY_OTP: '/api/auth/verify-otp',
    },
    MENU: {
        BASE: '/api/menu',
        BY_ID: (id) => `/api/menu/${id}`,
        POPULAR: '/api/menu/popular',
        RECOMMENDED: '/api/menu/recommended',
        SEARCH: '/api/menu/search',
    },
    CATEGORIES: {
        BASE: '/api/categories',
        BY_ID: (id) => `/api/categories/${id}`,
    },
    ORDERS: {
        BASE: '/api/orders',
        BY_ID: (id) => `/api/orders/${id}`,
        USER_ORDERS: '/api/orders/my-orders',
        TRACK: (id) => `/api/orders/${id}/track`,
    },
    CART: {
        BASE: '/api/cart',
        ADD_ITEM: '/api/cart/add',
        REMOVE_ITEM: '/api/cart/remove',
        UPDATE_QUANTITY: '/api/cart/update',
    },
    CUSTOMERS: {
        BASE: '/api/customers',
        BY_ID: (id) => `/api/customers/${id}`,
    },
    EMPLOYEES: {
        BASE: '/api/employees',
        BY_ID: (id) => `/api/employees/${id}`,
    },
    TABLES: {
        BASE: '/api/tables',
        BY_ID: (id) => `/api/tables/${id}`,
    },
    INVENTORY: {
        BASE: '/api/inventory',
        BY_ID: (id) => `/api/inventory/${id}`,
    },
    INVOICES: {
        BASE: '/api/invoices',
        BY_ID: (id) => `/api/invoices/${id}`,
    },
    PAYMENTS: {
        BASE: '/api/payments',
        PROCESS: '/api/payments/process',
    },
    REPORTS: {
        SALES: '/api/reports/sales',
        REVENUE: '/api/reports/revenue',
        EXPENSES: '/api/reports/expenses',
    },
    OFFERS: {
        BASE: '/api/offers',
        VALIDATE_COUPON: '/api/offers/validate-coupon',
    },
    NOTIFICATIONS: {
        BASE: '/api/notifications',
        MARK_READ: (id) => `/api/notifications/${id}/read`,
        MARK_ALL_READ: '/api/notifications/mark-all-read',
    },
};
// App Constants
export const APP_CONFIG = {
    APP_NAME: 'RestaurantOS',
    APP_DESCRIPTION: 'Complete Restaurant Management System',
    APP_VERSION: '1.0.0',
    COMPANY_NAME: 'RestaurantOS Inc.',
    SUPPORT_EMAIL: 'support@restaurantos.com',
    SUPPORT_PHONE: '+1-800-RESTAURANT',
    ITEMS_PER_PAGE: 10,
    MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
    CURRENCY: 'INR',
    CURRENCY_SYMBOL: '₹',
    DATE_FORMAT: 'MMM dd, yyyy',
    TIME_FORMAT: 'hh:mm a',
    DATE_TIME_FORMAT: 'MMM dd, yyyy hh:mm a',
};
// Order Status Labels
export const ORDER_STATUS_LABELS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
};
// Order Status Colors
export const ORDER_STATUS_COLORS = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'primary',
    ready: 'success',
    completed: 'success',
    cancelled: 'error',
};
// User Role Labels
export const USER_ROLE_LABELS = {
    customer: 'Customer',
    chef: 'Kitchen Staff',
    manager: 'Manager',
    cashier: 'Cashier',
    owner: 'Restaurant Owner',
    platformAdmin: 'Platform Admin',
};
// Shift Labels
export const SHIFT_LABELS = {
    morning: 'Morning (6AM - 2PM)',
    afternoon: 'Afternoon (2PM - 10PM)',
    evening: 'Evening (6PM - 2AM)',
    night: 'Night (10PM - 6AM)',
};
