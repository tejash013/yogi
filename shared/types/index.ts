export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface OrderItem {
  menuItem: string;
  quantity?: number;
}

export interface CreateOrderRequest {
  userId: string;
  tableId?: string;
  items: OrderItem[];
  orderType?: string;
  paymentStatus?: string;
  notes?: string;
}
