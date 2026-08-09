import apiClient from './axios';
import type {
  ApiResponse,
  PaginatedResponse,
PaginationParams,
  MenuItem,
  Category,
  Order,
  Table,
  Employee,
  InventoryItem,
  Invoice,
  Coupon,
  Offer,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '@/types';

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', data),

  logout: () => apiClient.post<ApiResponse<null>>('/api/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ token: string }>>('/api/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/reset-password', { token, password }),

  verifyOtp: (email: string, otp: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/verify-otp', { email, otp }),
};

// Menu API
export const menuApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<MenuItem>>('/api/menu', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<MenuItem>>(`/api/menu/${id}`),

  getPopular: () =>
    apiClient.get<ApiResponse<MenuItem[]>>('/api/menu/popular'),

  getRecommended: () =>
    apiClient.get<ApiResponse<MenuItem[]>>('/api/menu/recommended'),

  search: (query: string) =>
    apiClient.get<PaginatedResponse<MenuItem>>('/api/menu/search', {
      params: { q: query },
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Category[]>>('/api/categories'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/api/categories/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Order>>('/api/orders', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`),

  getUserOrders: () =>
    apiClient.get<ApiResponse<Order[]>>('/api/orders/my-orders'),

  create: (order: Partial<Order>) =>
    apiClient.post<ApiResponse<Order>>('/api/orders', order),

  updateStatus: (id: string, status: Order['status']) =>
    apiClient.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status }),

  track: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/api/orders/${id}/track`),
};

// Tables API
export const tablesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Table[]>>('/api/tables'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Table>>(`/api/tables/${id}`),

  updateStatus: (id: string, status: Table['status']) =>
    apiClient.patch<ApiResponse<Table>>(`/api/tables/${id}/status`, { status }),
};

// Employees API
export const employeesApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Employee>>('/api/employees', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Employee>>(`/api/employees/${id}`),
};

// Inventory API
export const inventoryApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<InventoryItem>>('/api/inventory', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<InventoryItem>>(`/api/inventory/${id}`),
};

// Invoices API
export const invoicesApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Invoice>>('/api/invoices', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Invoice>>(`/api/invoices/${id}`),
};

// Offers & Coupons API
export const offersApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Offer[]>>('/api/offers'),

  getCoupons: () =>
    apiClient.get<ApiResponse<Coupon[]>>('/api/offers/coupons'),

  validateCoupon: (code: string) =>
    apiClient.post<ApiResponse<Coupon>>('/api/offers/validate-coupon', { code }),
};

// Reports API
export const reportsApi = {
  getSales: (params: { startDate: string; endDate: string }) =>
    apiClient.get<ApiResponse<unknown>>('/api/reports/sales', { params }),

  getRevenue: (params: { startDate: string; endDate: string }) =>
    apiClient.get<ApiResponse<unknown>>('/api/reports/revenue', { params }),

  getExpenses: (params: { startDate: string; endDate: string }) =>
    apiClient.get<ApiResponse<unknown>>('/api/reports/expenses', { params }),
};

export default apiClient;

