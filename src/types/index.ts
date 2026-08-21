// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  restaurantId?: string;
  branchId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  branch?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'cashier' | 'chef' | 'manager' | 'owner' | 'admin' | 'platformAdmin';

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface Branch {
  _id: string;
  restaurantId: string;
  name: string;
  slug: string;
  address?: string;
  isActive: boolean;
}

// Menu Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  categoryName: string;
  image: string;
  images: string[];
  ingredients: string[];
  allergens: string[];
  nutritionalInfo: NutritionalInfo;
  isAvailable: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  preparationTime: number;
  rating: number;
  totalReviews: number;
  tags: string[];
  createdAt: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
  createdAt: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partially_paid';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'online';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  tableNumber?: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryType: 'dine-in' | 'takeaway' | 'delivery';
  deliveryAddress?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

// Cart Types
export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  specialInstructions?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  deliveryType: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: number;
  deliveryAddress?: string;
  specialInstructions?: string;
}

// Table Types
export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location: string;
  qrCode?: string;
}

// Employee Types
export interface Employee {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  salary: number;
  joiningDate: string;
  isActive: boolean;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issuedAt: string;
  dueDate: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  supplier: string;
  expiryDate?: string;
  lastRestocked: string;
}

// Report Types
export interface SalesReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topSellingItems: { name: string; quantity: number; revenue: number }[];
}

export interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Coupon / Offer Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validUntil: string;
  terms: string[];
  isActive: boolean;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  q?: string;
  [key: string]: unknown;
}

