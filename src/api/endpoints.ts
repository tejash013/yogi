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
  User,
  Restaurant,
  Branch,
  MenuReview,
} from '@/types';

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials | { phone: string; password: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', data),

  logout: () => apiClient.post<ApiResponse<null>>('/api/auth/logout'),

  refreshToken: () =>
    apiClient.post<ApiResponse<{ token: string }>>('/api/auth/refresh'),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/reset-password', { token, password }),

  verifyOtp: (email: string, otp: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/verify-otp', { email, otp }),
};

export const tenantsApi = {
  getCurrent: () =>
    apiClient.get<ApiResponse<{ restaurantId: string; branchId: string; restaurant: Restaurant; branch: Branch }>>('/api/tenants/current'),
  getRestaurants: (params?: { includeInactive?: boolean }) =>
    apiClient.get<ApiResponse<Restaurant[]>>('/api/tenants/restaurants', { params }),
  getRestaurant: (id: string) =>
    apiClient.get<ApiResponse<Restaurant & { branchCount?: number }>>(`/api/tenants/restaurants/${id}`),
  createRestaurant: (payload: Partial<Restaurant> & { name: string; slug: string }) =>
    apiClient.post<ApiResponse<Restaurant>>('/api/tenants/restaurants', payload),
  updateRestaurant: (id: string, payload: Partial<Restaurant>) =>
    apiClient.put<ApiResponse<Restaurant>>(`/api/tenants/restaurants/${id}`, payload),
  deleteRestaurant: (id: string, permanent = false) =>
    apiClient.delete<ApiResponse<null>>(`/api/tenants/restaurants/${id}`, { params: { permanent } }),

  getAllBranches: (params?: { restaurantId?: string; includeInactive?: boolean }) =>
    apiClient.get<ApiResponse<Branch[]>>('/api/tenants/branches', { params }),
  getBranches: (restaurantId: string, params?: { includeInactive?: boolean }) =>
    apiClient.get<ApiResponse<Branch[]>>(`/api/tenants/restaurants/${restaurantId}/branches`, { params }),
  getBranch: (id: string) =>
    apiClient.get<ApiResponse<Branch>>(`/api/tenants/branches/${id}`),
  createBranch: (restaurantId: string, payload: Partial<Branch> & { name: string; slug: string }) =>
    apiClient.post<ApiResponse<Branch>>(`/api/tenants/restaurants/${restaurantId}/branches`, payload),
  updateBranch: (id: string, payload: Partial<Branch>) =>
    apiClient.put<ApiResponse<Branch>>(`/api/tenants/branches/${id}`, payload),
  deleteBranch: (id: string, permanent = false) =>
    apiClient.delete<ApiResponse<null>>(`/api/tenants/branches/${id}`, { params: { permanent } }),
};

// Menu API
export const menuApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<MenuItem>>('/api/menu', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<MenuItem>>(`/api/menu/${id}`),

  create: (item: Partial<MenuItem> & { title?: string; category?: string }) =>
    apiClient.post<ApiResponse<MenuItem>>('/api/menu', item),

  update: (id: string, item: Partial<MenuItem> & { title?: string; category?: string }) =>
    apiClient.patch<ApiResponse<MenuItem>>(`/api/menu/${id}`, item),

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

  create: (payload: Partial<Category>) =>
    apiClient.post<ApiResponse<Category>>('/api/categories', payload),
};

export const reviewsApi = {
  getForMenuItem: (menuItemId: string) =>
    apiClient.get<ApiResponse<MenuReview[]>>(`/api/reviews/menu/${menuItemId}`),
  create: (review: { menuItemId: string; rating: number; subject?: string; comment?: string; images?: string[] }) =>
    apiClient.post<ApiResponse<MenuReview>>('/api/reviews', review),
};

// Orders API
export const ordersApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Order>>('/api/orders', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`),

  getUserOrders: () =>
    apiClient.get<ApiResponse<Order[]>>('/api/orders/my-orders'),

  create: (order: Partial<Order> | { userId?: string; tableId?: string; items?: Array<{ menuItem: string; quantity: number }>; orderType?: 'dine-in' | 'takeaway' | 'delivery'; paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'; notes?: string; }) =>
    apiClient.post<ApiResponse<Order>>('/api/orders', order),

  update: (id: string, data: any) =>
    apiClient.put<ApiResponse<Order>>(`/api/orders/${id}`, data),

  updateStatus: (id: string, status: Order['status']) =>
    apiClient.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status }),

  track: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/api/orders/${id}/track`),
};

// Tables API
export const tablesApi = {
  getAll: (params?: { status?: Table['status'] }) =>
    apiClient.get<ApiResponse<Table[]>>('/api/tables', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Table>>(`/api/tables/${id}`),

  create: (table: {
    label: string;
    capacity: number;
    status?: 'available' | 'occupied' | 'reserved' | 'cleaning';
    location?: string;
    notes?: string;
  }) =>
    apiClient.post<ApiResponse<Table>>('/api/tables', table),

  updateStatus: (id: string, status: Table['status']) =>
    apiClient.patch<ApiResponse<Table>>(`/api/tables/${id}/status`, { status }),

  reserve: (id: string) =>
    apiClient.post<ApiResponse<Table>>(`/api/tables/${id}/reserve`),
};

// Employees API
export const employeesApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Employee>>('/api/employees', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Employee>>(`/api/employees/${id}`),

  create: (employee: Partial<Employee>) =>
    apiClient.post<ApiResponse<Employee>>('/api/employees', employee),

  update: (id: string, payload: Partial<Employee>) =>
    apiClient.patch<ApiResponse<Employee>>(`/api/employees/${id}`, payload),

  deactivate: (id: string) =>
    apiClient.delete<ApiResponse<Employee>>(`/api/employees/${id}`),
};

// User access API
export const usersApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<User>>('/api/users', { params }),

  create: (payload: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    password: string;
    role: 'owner' | 'manager';
    restaurantId: string;
    branchId: string;
  }) => apiClient.post<ApiResponse<User>>('/api/users', payload),

  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/api/users/profile'),

  updateProfile: (payload: { firstName?: string; lastName?: string; phone?: string }) =>
    apiClient.patch<ApiResponse<User>>('/api/users/profile', payload),

  updateAccess: (id: string, payload: { role?: User['role']; status?: User['status']; branch?: string }) =>
    apiClient.patch<ApiResponse<User>>(`/api/users/${id}/access`, payload),
};

// Inventory API
export const inventoryApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<InventoryItem>>('/api/inventory', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<InventoryItem>>(`/api/inventory/${id}`),

  create: (item: Partial<InventoryItem>) =>
    apiClient.post<ApiResponse<InventoryItem>>('/api/inventory', item),

  update: (id: string, payload: Partial<InventoryItem>) =>
    apiClient.patch<ApiResponse<InventoryItem>>(`/api/inventory/${id}`, payload),

  deactivate: (id: string) =>
    apiClient.delete<ApiResponse<InventoryItem>>(`/api/inventory/${id}`),
};

// Invoices API
export const invoicesApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Invoice>>('/api/invoices', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Invoice>>(`/api/invoices/${id}`),

  create: (payload: { orderId: string; paymentMethod: string }, idempotencyKey?: string) =>
    apiClient.post<ApiResponse<Invoice>>('/api/invoices', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey || `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      },
    }),

  updateStatus: (id: string, payload: { status: string; transactionId?: string }) =>
    apiClient.patch<ApiResponse<Invoice>>(`/api/invoices/${id}/status`, payload),
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

export const settingsApi = {
  get: () => apiClient.get<ApiResponse<Record<string, any>>>('/api/settings'),
  update: (payload: Record<string, any>) => apiClient.patch<ApiResponse<Record<string, any>>>('/api/settings', payload),
};

export default apiClient;

