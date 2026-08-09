import apiClient from './axios';
// Auth API
export const authApi = {
    login: (credentials) => apiClient.post('/api/auth/login', credentials),
    register: (data) => apiClient.post('/api/auth/register', data),
    logout: () => apiClient.post('/api/auth/logout'),
    refreshToken: (refreshToken) => apiClient.post('/api/auth/refresh', { refreshToken }),
    forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
    resetPassword: (token, password) => apiClient.post('/api/auth/reset-password', { token, password }),
    verifyOtp: (email, otp) => apiClient.post('/api/auth/verify-otp', { email, otp }),
};
// Menu API
export const menuApi = {
    getAll: (params) => apiClient.get('/api/menu', { params }),
    getById: (id) => apiClient.get(`/api/menu/${id}`),
    getPopular: () => apiClient.get('/api/menu/popular'),
    getRecommended: () => apiClient.get('/api/menu/recommended'),
    search: (query) => apiClient.get('/api/menu/search', {
        params: { q: query },
    }),
};
// Categories API
export const categoriesApi = {
    getAll: () => apiClient.get('/api/categories'),
    getById: (id) => apiClient.get(`/api/categories/${id}`),
};
// Orders API
export const ordersApi = {
    getAll: (params) => apiClient.get('/api/orders', { params }),
    getById: (id) => apiClient.get(`/api/orders/${id}`),
    getUserOrders: () => apiClient.get('/api/orders/my-orders'),
    create: (order) => apiClient.post('/api/orders', order),
    updateStatus: (id, status) => apiClient.patch(`/api/orders/${id}/status`, { status }),
    track: (id) => apiClient.get(`/api/orders/${id}/track`),
};
// Tables API
export const tablesApi = {
    getAll: () => apiClient.get('/api/tables'),
    getById: (id) => apiClient.get(`/api/tables/${id}`),
    updateStatus: (id, status) => apiClient.patch(`/api/tables/${id}/status`, { status }),
};
// Employees API
export const employeesApi = {
    getAll: (params) => apiClient.get('/api/employees', { params }),
    getById: (id) => apiClient.get(`/api/employees/${id}`),
};
// Inventory API
export const inventoryApi = {
    getAll: (params) => apiClient.get('/api/inventory', { params }),
    getById: (id) => apiClient.get(`/api/inventory/${id}`),
};
// Invoices API
export const invoicesApi = {
    getAll: (params) => apiClient.get('/api/invoices', { params }),
    getById: (id) => apiClient.get(`/api/invoices/${id}`),
};
// Offers & Coupons API
export const offersApi = {
    getAll: () => apiClient.get('/api/offers'),
    getCoupons: () => apiClient.get('/api/offers/coupons'),
    validateCoupon: (code) => apiClient.post('/api/offers/validate-coupon', { code }),
};
// Reports API
export const reportsApi = {
    getSales: (params) => apiClient.get('/api/reports/sales', { params }),
    getRevenue: (params) => apiClient.get('/api/reports/revenue', { params }),
    getExpenses: (params) => apiClient.get('/api/reports/expenses', { params }),
};
export default apiClient;
