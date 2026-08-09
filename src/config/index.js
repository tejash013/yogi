const config = {
    app: {
        name: 'RestaurantOS',
        description: 'Complete Restaurant Management System',
        version: '1.0.0',
        company: 'RestaurantOS Inc.',
        supportEmail: 'support@restaurantos.com',
        supportPhone: '+1-800-RESTAURANT',
    },
    api: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
    },
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100,
    },
    upload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    currency: {
        code: 'USD',
        symbol: '$',
        locale: 'en-US',
    },
    dateTime: {
        dateFormat: 'MMM dd, yyyy',
        timeFormat: 'hh:mm a',
        dateTimeFormat: 'MMM dd, yyyy hh:mm a',
    },
    theme: {
        storageKey: 'restaurantos-theme',
        defaultTheme: 'light',
    },
    auth: {
        storageKey: 'restaurantos-auth',
        tokenKey: 'restaurantos-token',
        refreshTokenKey: 'restaurantos-refresh-token',
    },
};
export default config;
