import { create } from 'zustand';
import type {
  CashierOrder,
  CashierOrderItem,
  CashierPaymentMethod,
  Coupon,
  Discount,
  Invoice,
  Payment,
  PaymentBreakdownEntry,
  ShiftStatus,
  TaxRule,
} from '@/types/cashier';
import {
  cashierCoupons,
  cashierInvoices,
  cashierOrders,
  cashierPayments,
  cashierTaxes,
} from '@/data/cashierData';
import { useToastStore } from '@/store/toastStore';

// ---- Currency formatter (INR) ----
export const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export interface BillTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  additionalCharges: number;
  grandTotal: number;
}

interface CashierState {
  orders: CashierOrder[];
  payments: Payment[];
  invoices: Invoice[];
  coupons: Coupon[];
  taxes: TaxRule[];

  // Shift status
  shiftStatus: ShiftStatus;

  // Current bill / selected order
  currentBill: CashierOrder | null;
  selectedOrderId: string | null;

  // Discount & payment state
  discount: Discount | null;
  couponCodeInput: string;
  percentageDiscount: string;
  fixedDiscount: string;
  additionalCharges: number;
  paymentMethod: CashierPaymentMethod;
  cashReceived: string;
  splitPayments: PaymentBreakdownEntry[];
  paymentSuccess: {
    orderNumber: string;
    invoiceNumber: string;
    paidAmount: number;
    paymentMethod: CashierPaymentMethod;
    date: string;
  } | null;

// Actions
  toggleShift: () => void;
  setSelectedOrder: (id: string | null) => void;
  addBillItem: (item: CashierOrderItem) => void;
  removeBillItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  applyDiscount: (discount: Discount) => void;
  applyCoupon: (code: string) => { ok: boolean; error?: string };
  applyPercentageDiscount: (value: string) => void;
  applyFixedDiscount: (value: string) => void;
  removeDiscount: () => void;
  calculateTotals: () => BillTotals;
  setAdditionalCharges: (value: number) => void;
  setPaymentMethod: (method: CashierPaymentMethod) => void;
  setCashReceived: (value: string) => void;
  addPayment: (entry: PaymentBreakdownEntry) => void;
  removePayment: (index: number) => void;
  completePayment: () => { ok: boolean; error?: string };
  refundPayment: (paymentId: string, refundAmount: number, reason: string) => void;
  createInvoice: () => Invoice | null;
  clearCurrentBill: () => void;
  resetPaymentState: () => void;
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useCashierStore = create<CashierState>((set, get) => ({
  orders: cashierOrders,
  payments: cashierPayments,
  invoices: cashierInvoices,
  coupons: cashierCoupons,
taxes: cashierTaxes,

  shiftStatus: 'active',

  currentBill: null,
  selectedOrderId: null,

  discount: null,
  couponCodeInput: '',
  percentageDiscount: '',
  fixedDiscount: '',
  additionalCharges: 0,
  paymentMethod: 'cash',
  cashReceived: '',
splitPayments: [],
  paymentSuccess: null,

  toggleShift: () => {
    set((s) => {
      const next: ShiftStatus =
        s.shiftStatus === 'active' ? 'break' : s.shiftStatus === 'break' ? 'closed' : 'active';
      useToastStore
        .getState()
        .showToast(`Shift ${next}`, next === 'active' ? 'success' : 'info');
      return { shiftStatus: next };
    });
  },

  setSelectedOrder: (id) => {
    const order = id ? get().orders.find((o) => o.id === id) ?? null : null;
    set({
      selectedOrderId: id,
      currentBill: order,
      discount: null,
      couponCodeInput: '',
      percentageDiscount: '',
      fixedDiscount: '',
      additionalCharges: order?.additionalCharges ?? 0,
      paymentMethod: 'cash',
      cashReceived: '',
      splitPayments: [],
      paymentSuccess: null,
    });
  },

  addBillItem: (item) => {
    const bill = get().currentBill;
    if (!bill) return;
    const exists = bill.items.find((i) => i.id === item.id && i.variant === item.variant);
    const items = exists
      ? bill.items.map((i) =>
          i.id === item.id && i.variant === item.variant
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                totalPrice: (i.quantity + item.quantity) * i.unitPrice,
              }
            : i
        )
      : [...bill.items, item];
    set({ currentBill: { ...bill, items } });
  },

  removeBillItem: (itemId) => {
    const bill = get().currentBill;
    if (!bill) return;
    set({
      currentBill: {
        ...bill,
        items: bill.items.filter((i) => i.id !== itemId),
      },
    });
  },

  updateQuantity: (itemId, delta) => {
    const bill = get().currentBill;
    if (!bill) return;
    const items = bill.items
      .map((i) => {
        if (i.id !== itemId) return i;
        const qty = i.quantity + delta;
        if (qty <= 0) return null;
        return { ...i, quantity: qty, totalPrice: qty * i.unitPrice };
      })
      .filter((i): i is CashierOrderItem => i !== null);
    set({ currentBill: { ...bill, items } });
  },

  applyDiscount: (discount) => {
    const totals = get().calculateTotals();
    if (discount.amount > totals.subtotal) {
      useToastStore.getState().showToast('Discount cannot exceed subtotal', 'error');
      return;
    }
    set({ discount });
    useToastStore.getState().showToast(`Discount applied: ${discount.name}`, 'success');
  },

  applyCoupon: (code) => {
    const coupon = get().coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    const totals = get().calculateTotals();
    if (!coupon) {
      useToastStore.getState().showToast('Invalid coupon code', 'error');
      return { ok: false, error: 'Invalid coupon' };
    }
    if (!coupon.isActive) {
      useToastStore.getState().showToast('Coupon is not active', 'error');
      return { ok: false, error: 'Coupon is not active' };
    }
    const now = Date.now();
    if (now < new Date(coupon.validFrom).getTime() || now > new Date(coupon.validUntil).getTime()) {
      useToastStore.getState().showToast('Coupon has expired', 'error');
      return { ok: false, error: 'Expired coupon' };
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      useToastStore.getState().showToast('Coupon usage limit reached', 'error');
      return { ok: false, error: 'Coupon usage limit reached' };
    }
    if (totals.subtotal < coupon.minOrderAmount) {
      useToastStore.getState().showToast(`Minimum order ₹${coupon.minOrderAmount} required`, 'error');
      return { ok: false, error: `Min order ₹${coupon.minOrderAmount}` };
    }
    let amount = coupon.discountType === 'percentage'
      ? (totals.subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
    if (coupon.maxDiscount) amount = Math.min(amount, coupon.maxDiscount);
    amount = round2(Math.min(amount, totals.subtotal));
    set({
      discount: { id: uid('disc'), name: coupon.code, type: 'coupon', amount, couponCode: coupon.code },
      couponCodeInput: coupon.code,
    });
    useToastStore.getState().showToast(`Coupon ${coupon.code} applied`, 'success');
    return { ok: true };
  },

  applyPercentageDiscount: (value) => {
    const num = parseFloat(value);
    const totals = get().calculateTotals();
    if (Number.isNaN(num)) {
      set({ percentageDiscount: value, discount: null });
      return;
    }
    if (num < 0) {
      useToastStore.getState().showToast('Discount cannot be negative', 'error');
      return;
    }
    if (num > 100) {
      useToastStore.getState().showToast('Percentage cannot exceed 100%', 'error');
      return;
    }
    const amount = round2((totals.subtotal * num) / 100);
    set({
      percentageDiscount: value,
      fixedDiscount: '',
      couponCodeInput: '',
      discount: num > 0 ? { id: uid('disc'), name: `${num}% Discount`, type: 'percentage', amount } : null,
    });
  },

  applyFixedDiscount: (value) => {
    const num = parseFloat(value);
    const totals = get().calculateTotals();
    if (Number.isNaN(num)) {
      set({ fixedDiscount: value, discount: null });
      return;
    }
    if (num < 0) {
      useToastStore.getState().showToast('Discount cannot be negative', 'error');
      return;
    }
    if (num > totals.subtotal) {
      useToastStore.getState().showToast('Discount cannot exceed subtotal', 'error');
      return;
    }
    set({
      fixedDiscount: value,
      percentageDiscount: '',
      couponCodeInput: '',
      discount:
        num > 0 ? { id: uid('disc'), name: 'Fixed Discount', type: 'fixed', amount: round2(num) } : null,
    });
  },

  removeDiscount: () =>
    set({
      discount: null,
      couponCodeInput: '',
      percentageDiscount: '',
      fixedDiscount: '',
    }),

  calculateTotals: () => {
    const state = get();
    const bill = state.currentBill;
    const subtotal = round2(
      bill ? bill.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) : 0
    );
    const discountAmount = round2(state.discount?.amount ?? 0);
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = round2(
      state.taxes.reduce((s, t) => s + (taxable * t.percentage) / 100, 0)
    );
    const additionalCharges = round2(state.additionalCharges ?? 0);
    const grandTotal = round2(taxable + taxAmount + additionalCharges);
    return { subtotal, discountAmount, taxAmount, additionalCharges, grandTotal };
  },

  setAdditionalCharges: (value) => {
    const num = Number.isFinite(value) ? Math.max(0, value) : 0;
    set({ additionalCharges: round2(num) });
  },

  setPaymentMethod: (method) => {
    set({ paymentMethod: method, splitPayments: [] });
  },

  setCashReceived: (value) => set({ cashReceived: value }),

  addPayment: (entry) => {
    const totals = get().calculateTotals();
    const current = get().splitPayments.reduce((s, p) => s + p.amount, 0);
    if (current + entry.amount > totals.grandTotal + 0.01) {
      useToastStore.getState().showToast('Total paid cannot exceed bill amount', 'error');
      return;
    }
    set({ splitPayments: [...get().splitPayments, entry] });
  },

  removePayment: (index) => {
    const list = [...get().splitPayments];
    if (index >= 0 && index < list.length) list.splice(index, 1);
    set({ splitPayments: list });
  },

  completePayment: () => {
    const state = get();
    const bill = state.currentBill;
    if (!bill) {
      useToastStore.getState().showToast('No bill selected', 'error');
      return { ok: false, error: 'No bill selected' };
    }
    const totals = state.calculateTotals();
    if (bill.items.length === 0) {
      useToastStore.getState().showToast('Bill has no items', 'error');
      return { ok: false, error: 'Bill has no items' };
    }
    if (totals.grandTotal <= 0) {
      useToastStore.getState().showToast('Bill amount must be positive', 'error');
      return { ok: false, error: 'Invalid bill amount' };
    }

    // Split mode
    if (state.splitPayments.length > 0) {
      const paid = round2(state.splitPayments.reduce((s, p) => s + p.amount, 0));
      if (Math.abs(paid - totals.grandTotal) > 0.01) {
        useToastStore.getState().showToast('Split payments must equal the bill amount', 'error');
        return { ok: false, error: 'Split payments must equal the bill amount' };
      }
    } else {
      // Single method
      const amount = round2(totals.grandTotal);
      if (state.paymentMethod === 'cash') {
        const received = parseFloat(state.cashReceived);
        if (Number.isNaN(received) || received < 0) {
          useToastStore.getState().showToast('Enter a valid cash amount', 'error');
          return { ok: false, error: 'Enter a valid cash amount' };
        }
        if (received < amount) {
          useToastStore.getState().showToast('Cash received cannot be less than the bill amount', 'error');
          return { ok: false, error: 'Cash received cannot be less than the bill amount' };
        }
      }
    }

    // Build payment record
    const invoice = get().createInvoice();
    const breakdown: PaymentBreakdownEntry[] =
      state.splitPayments.length > 0
        ? state.splitPayments
        : [{ method: state.paymentMethod, amount: totals.grandTotal }];
    const payment: Payment = {
      id: uid('pay'),
      paymentNumber: `PAY-${Math.floor(3000 + Math.random() * 1000)}`,
      orderNumber: bill.orderNumber,
      invoiceNumber: invoice?.invoiceNumber,
      customerName: bill.customer.name,
      amount: totals.grandTotal,
      originalAmount: totals.grandTotal,
      paymentMethod:
        state.splitPayments.length > 1 ? state.splitPayments[0].method : state.paymentMethod,
      status: 'paid',
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      cashier: 'Meera K',
      breakdown,
    };

    set((s) => ({
      payments: [payment, ...s.payments],
      orders: s.orders.map((o) =>
        o.id === bill.id ? { ...o, paymentStatus: 'paid', status: 'completed' } : o
      ),
      paymentSuccess: {
        orderNumber: bill.orderNumber,
        invoiceNumber: invoice?.invoiceNumber ?? '',
        paidAmount: totals.grandTotal,
        paymentMethod: payment.paymentMethod,
        date: new Date().toISOString(),
      },
    }));
    useToastStore.getState().showToast('Payment completed successfully', 'success');
    return { ok: true };
  },

  refundPayment: (paymentId, refundAmount, reason) => {
    const payment = get().payments.find((p) => p.id === paymentId);
    if (!payment) {
      useToastStore.getState().showToast('Payment not found', 'error');
      return;
    }
    if (refundAmount <= 0) {
      useToastStore.getState().showToast('Refund amount must be positive', 'error');
      return;
    }
    if (refundAmount > payment.amount) {
      useToastStore.getState().showToast('Refund cannot exceed the paid amount', 'error');
      return;
    }
    const isFull = refundAmount >= payment.amount - 0.01;
    set((s) => ({
      payments: s.payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: isFull ? 'refunded' : 'partially_refunded',
              refundAmount: round2(refundAmount),
              refundReason: reason,
              amount: isFull ? 0 : round2(p.amount - refundAmount),
            }
          : p
      ),
      invoices: s.invoices.map((inv) =>
        inv.invoiceNumber === payment.invoiceNumber
          ? { ...inv, status: isFull ? 'refunded' : 'partially_paid' }
          : inv
      ),
    }));
    useToastStore
      .getState()
      .showToast(isFull ? 'Full refund processed' : 'Partial refund processed', 'success');
  },

  createInvoice: () => {
    const state = get();
    const bill = state.currentBill;
    if (!bill) return null;
    const totals = state.calculateTotals();
    const invoice: Invoice = {
      id: uid('inv'),
      invoiceNumber: `INV-${Math.floor(1100 + Math.random() * 900)}`,
      orderNumber: bill.orderNumber,
      tableNumber: bill.tableNumber,
      orderType: bill.orderType,
      customer: { ...bill.customer },
      items: bill.items.map((i) => ({ ...i })),
      subtotal: totals.subtotal,
      discount: totals.discountAmount,
      tax: totals.taxAmount,
      additionalCharges: totals.additionalCharges,
      grandTotal: totals.grandTotal,
      paidAmount: totals.grandTotal,
      paymentMethod:
        state.splitPayments.length > 1 ? state.splitPayments[0].method : state.paymentMethod,
      status: 'paid',
      issuedAt: new Date().toISOString(),
    };
    set((s) => ({ invoices: [invoice, ...s.invoices] }));
    return invoice;
  },

  clearCurrentBill: () =>
    set({
      currentBill: null,
      selectedOrderId: null,
      discount: null,
      couponCodeInput: '',
      percentageDiscount: '',
      fixedDiscount: '',
      additionalCharges: 0,
      paymentMethod: 'cash',
      cashReceived: '',
      splitPayments: [],
      paymentSuccess: null,
    }),

  resetPaymentState: () =>
    set({
      paymentMethod: 'cash',
      cashReceived: '',
      splitPayments: [],
      paymentSuccess: null,
    }),
}));

// ---- Selector helpers ----
export const selectUnpaidOrders = (state: CashierState) =>
  state.orders.filter(
    (o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'pending' || o.paymentStatus === 'partially_paid'
  );
