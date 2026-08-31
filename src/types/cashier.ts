// Cashier Module specific types.
// These are intentionally separate from the shared/customer types so that we
// do not modify or affect the Customer or Kitchen modules.

export type CashierOrderType = 'dine-in' | 'takeaway' | 'delivery';

export type CashierOrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type CashierPaymentStatus =
  | 'paid'
  | 'unpaid'
  | 'pending'
  | 'partially_paid'
  | 'partially_refunded'
  | 'refunded'
  | 'failed';

export type CashierPaymentMethod = 'cash' | 'upi' | 'card' | 'wallet' | 'online';

export type ShiftStatus = 'active' | 'break' | 'closed';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface CashierOrderItem {
  id: string;
  name: string;
  image: string;
  variant?: string;
  addons: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface CashierOrder {
  id: string;
  orderNumber: string;
  tableId?: string;
  tableNumber?: number;
  customer: Customer;
  orderType: CashierOrderType;
  status: CashierOrderStatus;
  paymentStatus: CashierPaymentStatus;
  items: CashierOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  additionalCharges: number;
  total: number;
  createdAt: string; // ISO
  cashierName?: string;
}

export type DiscountType = 'percentage' | 'fixed' | 'coupon';

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  amount: number;
  couponCode?: string;
}

export interface TaxRule {
  id: string;
  name: string;
  percentage: number;
}

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

export interface PaymentBreakdownEntry {
  method: CashierPaymentMethod;
  amount: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  orderNumber: string;
  invoiceNumber?: string;
  customerName: string;
  amount: number; // paid amount
  originalAmount: number; // bill amount before refund
  paymentMethod: CashierPaymentMethod;
  status: CashierPaymentStatus;
  transactionId: string;
  date: string; // ISO
  cashier: string;
  breakdown: PaymentBreakdownEntry[];
  refundAmount?: number;
  refundReason?: string;
}

export type InvoiceStatus = 'paid' | 'pending' | 'partially_paid' | 'cancelled' | 'refunded';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  tableNumber?: number;
  orderType: CashierOrderType;
  customer: Customer;
  items: CashierOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  additionalCharges: number;
  grandTotal: number;
  paidAmount: number;
  paymentMethod: CashierPaymentMethod;
  status: InvoiceStatus;
  issuedAt: string; // ISO
}

// ---- Label / color helper maps ----
export const PAYMENT_METHOD_LABELS: Record<CashierPaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  wallet: 'Wallet',
  online: 'Online',
};

export const PAYMENT_STATUS_LABELS: Record<CashierPaymentStatus, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  pending: 'Pending',
  partially_paid: 'Partially Paid',
  partially_refunded: 'Partially Refunded',
  refunded: 'Refunded',
  failed: 'Failed',
};

export const ORDER_TYPE_LABELS: Record<CashierOrderType, string> = {
  'dine-in': 'Dine In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

