// Kitchen Module specific types.
// These are intentionally separate from the shared/customer types to avoid
// modifying the Customer Module or shared Order model.

export type KitchenStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type OrderPriority = 'normal' | 'high' | 'urgent';

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  variants?: string[];
  addons?: string[];
  specialInstructions?: string;
  prepTimeMin: number;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  tableNumber?: number;
  orderType: OrderType;
  status: KitchenStatus;
  priority: OrderPriority;
  items: KitchenOrderItem[];
  createdAt: string; // ISO timestamp when order was placed
  acceptedAt?: string; // ISO timestamp when order was accepted
  startedAt?: string; // ISO timestamp when preparing started
  readyAt?: string; // ISO timestamp when marked ready
  completedAt?: string; // ISO timestamp when completed
  expectedPrepTimeMin: number;
  notes?: string;
}

export interface KitchenNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}
