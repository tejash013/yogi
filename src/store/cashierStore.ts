import { create } from 'zustand';
import { invoicesApi, offersApi, ordersApi, settingsApi } from '@/api';
import { useOrderSyncStore } from '@/store/orderSyncStore';
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
import { useToastStore } from '@/store/toastStore';
import { useTenantStore } from '@/store/tenantStore';

export interface RestaurantInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  tagline: string;
}

export const defaultRestaurantInfo: RestaurantInfo = {
  name: 'Yogi Restaurant',
  address: 'Station Road, Near Sardar Patel Ashram, Bardoli, Gujarat 394601, India',
  phone: '+91 98251 23456',
  email: 'contact@yogirestaurant.com',
  gstNumber: '24AABCY1234F1Z8',
  tagline: 'Authentic Dining & Smart Kitchen',
};

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
  restaurantInfo: RestaurantInfo;

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
  fetchData: () => Promise<void>;
  toggleShift: () => void;
  setSelectedOrder: (id: string | null) => void;
  createNewBill: (orderType?: CashierOrder['orderType'], tableNumber?: string, customerName?: string) => void;
  updateBillInfo: (data: { orderType?: CashierOrder['orderType']; tableId?: string; tableNumber?: string; customerName?: string; customerPhone?: string }) => void;
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
  sendOrderToKitchen: () => Promise<{ ok: boolean; error?: string }>;
  refundPayment: (paymentId: string, refundAmount: number, reason: string) => void;
  createInvoice: () => Invoice | null;
  clearCurrentBill: () => void;
  resetPaymentState: () => void;
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const normalizeCashierCustomer = (user: any) => ({
  id: String(user?._id ?? user?.id ?? 'guest-user'),
  name: user?.firstName || user?.name ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.name || 'Guest Customer' : 'Guest Customer',
  phone: user?.phone ?? '',
  email: user?.email ?? '',
});

const normalizeCashierOrder = (order: any): CashierOrder => {
  const statusValue = String(order?.status ?? 'pending');
  const mapStatus = (value: string): CashierOrder['status'] => {
    if (value === 'pending') return 'new';
    if (value === 'confirmed') return 'confirmed';
    if (value === 'preparing') return 'preparing';
    if (value === 'ready') return 'ready';
    if (value === 'completed' || value === 'served') return 'completed';
    if (value === 'cancelled') return 'cancelled';
    return 'new';
  };

  const orderId = String(order?._id ?? order?.id ?? `ord-${Date.now()}`);
  const itemList = Array.isArray(order?.items) ? order.items : [];

  return {
    id: orderId,
    orderNumber: order?.orderNumber ?? `ORD-${orderId.slice(-6).toUpperCase()}`,
    tableId: order?.table?._id ?? (typeof order?.tableId === 'string' ? order.tableId : undefined),
    tableNumber: (() => {
      const rawTable = order?.table ?? order?.tableNumber;
      if (typeof rawTable === 'number' && Number.isFinite(rawTable)) return rawTable;
      if (typeof rawTable === 'string') {
        const num = Number.parseInt(rawTable.replace(/\D/g, ''), 10);
        return Number.isFinite(num) ? num : undefined;
      }
      if (typeof rawTable === 'object' && rawTable !== null) {
        const label = rawTable.label || rawTable.name || rawTable.number || '';
        const num = Number.parseInt(String(label).replace(/\D/g, ''), 10);
        return Number.isFinite(num) ? num : undefined;
      }
      return undefined;
    })(),
    customer: normalizeCashierCustomer(order?.user),
    orderType: (order?.orderType ?? 'dine-in') as CashierOrder['orderType'],
    status: mapStatus(statusValue),
    paymentStatus: (order?.paymentStatus ?? 'pending') as CashierOrder['paymentStatus'],
    items: itemList.map((entry: any, index: number) => ({
      id: String(entry?._id ?? entry?.id ?? `${orderId}-item-${index}`),
      name: entry?.name ?? entry?.menuItem?.title ?? entry?.menuItem?.name ?? 'Menu Item',
      image: entry?.image ?? '/images/placeholder.jpg',
      variant: entry?.variant,
      addons: Array.isArray(entry?.addons) ? entry.addons : [],
      quantity: Number(entry?.quantity ?? 1),
      unitPrice: Number(entry?.unitPrice ?? entry?.price ?? 0),
      totalPrice: Number(entry?.totalPrice ?? Number(entry?.unitPrice ?? entry?.price ?? 0) * Number(entry?.quantity ?? 1)),
      specialInstructions: entry?.specialInstructions,
    })),
    subtotal: Number(order?.subtotal ?? 0),
    discount: Number(order?.discount ?? 0),
    tax: Number(order?.tax ?? order?.taxes ?? 0),
    additionalCharges: 0,
    total: Number(order?.total ?? 0),
    createdAt: order?.createdAt ?? new Date().toISOString(),
    cashierName: 'Store',
  };
};

const normalizeInvoice = (invoice: any): Invoice => {
  const invoiceId = String(invoice?._id ?? invoice?.id ?? `inv-${Date.now()}`);
  const order = invoice?.order ?? {};
  const amount = Number(invoice?.amount ?? order?.total ?? 0);

  return {
    id: invoiceId,
    invoiceNumber: `INV-${invoiceId.slice(-6).toUpperCase()}`,
    orderNumber: order?.orderNumber ?? `ORD-${invoiceId.slice(-6).toUpperCase()}`,
    tableNumber: (() => {
      const rawTable = order?.table ?? order?.tableNumber ?? invoice?.tableNumber;
      if (typeof rawTable === 'number' && Number.isFinite(rawTable)) return rawTable;
      if (typeof rawTable === 'string') {
        const num = Number.parseInt(rawTable.replace(/\D/g, ''), 10);
        return Number.isFinite(num) ? num : undefined;
      }
      if (typeof rawTable === 'object' && rawTable !== null) {
        const label = rawTable.label || rawTable.name || rawTable.number || '';
        const num = Number.parseInt(String(label).replace(/\D/g, ''), 10);
        return Number.isFinite(num) ? num : undefined;
      }
      return undefined;
    })(),
    orderType: (order?.orderType ?? 'dine-in') as Invoice['orderType'],
    customer: { id: 'guest-user', name: 'Guest Customer', phone: '', email: '' },
    items: [],
    subtotal: amount,
    discount: 0,
    tax: 0,
    additionalCharges: 0,
    grandTotal: amount,
    paidAmount: Number(invoice?.paidAmount ?? amount),
    paymentMethod: (invoice?.paymentMethod ?? 'cash') as CashierPaymentMethod,
    status: invoice?.status === 'paid' ? 'paid' : invoice?.status === 'cancelled' ? 'cancelled' : 'pending',
    issuedAt: invoice?.issuedAt ?? invoice?.createdAt ?? new Date().toISOString(),
  };
};

const defaultTaxes: TaxRule[] = [
  { id: 'tax-001', name: 'CGST', percentage: 2.5 },
  { id: 'tax-002', name: 'SGST', percentage: 2.5 },
  { id: 'tax-003', name: 'Service Charge', percentage: 5 },
];

const POS_CURRENT_BILL_KEY = 'restaurantos_pos_current_bill';

const saveActiveBillToStorage = (bill: CashierOrder | null) => {
  try {
    if (typeof window === 'undefined') return;
    if (bill) {
      localStorage.setItem(POS_CURRENT_BILL_KEY, JSON.stringify(bill));
    } else {
      localStorage.removeItem(POS_CURRENT_BILL_KEY);
    }
  } catch {}
};

const getActiveBillFromStorage = (): CashierOrder | null => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(POS_CURRENT_BILL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const autoSyncOrderToDatabase = async (bill: CashierOrder) => {
  if (!bill) return;
  if (!bill.id.startsWith('pos-')) {
    void syncBillUpdateToBackend(bill);
    return;
  }

  try {
    const res = await ordersApi.create({
      userId: 'walk-in',
      items: bill.items.map((i) => ({
        menuItem: i.id,
        quantity: i.quantity,
      })),
      orderType: bill.orderType,
      paymentStatus: 'pending',
      notes: [
        bill.customer.name ? `Customer: ${bill.customer.name}` : '',
        bill.customer.phone ? `Phone: ${bill.customer.phone}` : '',
        bill.tableNumber ? `Table ${bill.tableNumber}` : '',
      ].filter(Boolean).join(' | '),
    });

    const created = (res.data?.data ?? res.data) as any;
    const realId = String(created?._id ?? created?.id);
    const realOrderNum = created?.orderNumber;

    if (realId && realId !== bill.id) {
      const dbBill: CashierOrder = {
        ...bill,
        id: realId,
        orderNumber: realOrderNum || bill.orderNumber,
      };

      saveActiveBillToStorage(dbBill);

      useCashierStore.setState((s) => ({
        currentBill: s.currentBill?.id === bill.id ? dbBill : s.currentBill,
        selectedOrderId: s.selectedOrderId === bill.id ? realId : s.selectedOrderId,
        orders: s.orders.map((o) => (o.id === bill.id ? dbBill : o)),
      }));

      useOrderSyncStore.getState().notifyOrderChange({
        type: 'create',
        orderId: realId,
        status: 'new',
        at: new Date().toISOString(),
      });
    }
  } catch {}
};

const syncBillUpdateToBackend = async (bill: CashierOrder) => {
  if (!bill || bill.id.startsWith('pos-')) return;
  try {
    await ordersApi.update(bill.id, {
      items: bill.items.map((i) => ({ menuItem: i.id, quantity: i.quantity })),
      orderType: bill.orderType,
      paymentStatus: bill.paymentStatus,
      notes: [
        bill.customer.name ? `Customer: ${bill.customer.name}` : '',
        bill.customer.phone ? `Phone: ${bill.customer.phone}` : '',
        bill.tableNumber ? `Table ${bill.tableNumber}` : '',
      ].filter(Boolean).join(' | '),
    });
  } catch {}
};

const hydrateCashierData = async () => {
  try {
    const [ordersResponse, invoicesResponse, couponResponse, settingsResponse] = await Promise.all([
      ordersApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
      invoicesApi.getAll({ page: 1, limit: 100 }).catch(() => ({ data: { data: [] } })),
      offersApi.getCoupons().catch(() => ({ data: { data: [] } })),
      settingsApi.get().catch(() => ({ data: { data: defaultRestaurantInfo } })),
    ]);

    const orderList = Array.isArray(ordersResponse?.data?.data) ? ordersResponse.data.data : [];
    const invoiceList = Array.isArray(invoicesResponse?.data?.data) ? invoicesResponse.data.data : [];
    const couponList = Array.isArray(couponResponse?.data?.data) ? couponResponse.data.data : [];
    const tenantState = useTenantStore.getState();
    const activeBranch = tenantState.currentBranch;
    const activeRestaurant = tenantState.currentRestaurant;
    const rawSettings = settingsResponse?.data?.data ?? {};

    const restaurantInfo: RestaurantInfo = {
      name: activeBranch?.name || activeRestaurant?.name || rawSettings.name || defaultRestaurantInfo.name,
      address: activeBranch?.address || activeRestaurant?.address || rawSettings.address || defaultRestaurantInfo.address,
      phone: activeBranch?.phone || activeRestaurant?.phone || rawSettings.phone || defaultRestaurantInfo.phone,
      email: activeBranch?.email || activeRestaurant?.email || rawSettings.email || defaultRestaurantInfo.email,
      gstNumber: activeRestaurant?.gstNumber || rawSettings.gstNumber || defaultRestaurantInfo.gstNumber,
      tagline: activeRestaurant?.tagline || rawSettings.tagline || defaultRestaurantInfo.tagline,
    };

    const taxPercent = typeof (rawSettings as any).taxRate === 'number' ? (rawSettings as any).taxRate : 5;
    const dynamicTaxes: TaxRule[] = [
      { id: 'tax-001', name: 'CGST', percentage: round2(taxPercent / 2) },
      { id: 'tax-002', name: 'SGST', percentage: round2(taxPercent / 2) },
      { id: 'tax-003', name: 'Service Charge', percentage: 5 },
    ];

    const storedActiveBill = getActiveBillFromStorage();
    const fetchedOrders = orderList.map(normalizeCashierOrder);
    
    let mergedOrders = [...fetchedOrders];
    let resolvedCurrentBill: CashierOrder | null = null;

    if (storedActiveBill) {
      const existingInDb = fetchedOrders.find(
        (o) => o.id === storedActiveBill.id || (storedActiveBill.orderNumber && o.orderNumber === storedActiveBill.orderNumber)
      );
      if (existingInDb) {
        resolvedCurrentBill = existingInDb.items.length >= storedActiveBill.items.length ? existingInDb : { ...existingInDb, ...storedActiveBill };
      } else {
        mergedOrders = [storedActiveBill, ...mergedOrders];
        resolvedCurrentBill = storedActiveBill;
      }
    }

    useCashierStore.setState((prev) => ({
      restaurantInfo,
      orders: mergedOrders,
      invoices: invoiceList.map(normalizeInvoice),
      payments: invoiceList.map((invoice: any) => ({
        id: String(invoice?._id ?? invoice?.id ?? `pay-${Date.now()}`),
        paymentNumber: `PAY-${String(invoice?._id ?? invoice?.id ?? '000').slice(-6).toUpperCase()}`,
        orderNumber: invoice?.order?.orderNumber ?? `ORD-${String(invoice?._id ?? invoice?.id ?? '000').slice(-6).toUpperCase()}`,
        invoiceNumber: `INV-${String(invoice?._id ?? invoice?.id ?? '000').slice(-6).toUpperCase()}`,
        customerName: 'Guest Customer',
        amount: Number(invoice?.amount ?? 0),
        originalAmount: Number(invoice?.amount ?? 0),
        paymentMethod: (invoice?.paymentMethod ?? 'cash') as CashierPaymentMethod,
        status: invoice?.status === 'paid' ? 'paid' : invoice?.status === 'cancelled' ? 'failed' : 'pending',
        transactionId: invoice?.transactionId ?? `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        date: invoice?.issuedAt ?? invoice?.createdAt ?? new Date().toISOString(),
        cashier: restaurantInfo.name,
        breakdown: [{ method: (invoice?.paymentMethod ?? 'cash') as CashierPaymentMethod, amount: Number(invoice?.amount ?? 0) }],
      })),
      coupons: couponList.map((coupon: any) => ({
        id: String(coupon?._id ?? coupon?.id ?? coupon?.code ?? uid('cpn')),
        code: coupon?.code ?? 'UNKNOWN',
        description: coupon?.title ?? coupon?.description ?? 'Coupon',
        discountType: coupon?.discountType ?? 'percentage',
        discountValue: Number(coupon?.discountValue ?? 0),
        minOrderAmount: Number(coupon?.minOrderAmount ?? 0),
        maxDiscount: coupon?.maxDiscount ? Number(coupon.maxDiscount) : undefined,
        validFrom: coupon?.validFrom ?? new Date().toISOString(),
        validUntil: coupon?.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usageLimit: Number(coupon?.usageLimit ?? 100),
        usedCount: Number(coupon?.usedCount ?? 0),
        isActive: coupon?.isActive ?? true,
      })),
      taxes: dynamicTaxes,
      currentBill: prev.currentBill ?? resolvedCurrentBill,
      selectedOrderId: prev.selectedOrderId ?? resolvedCurrentBill?.id ?? null,
    }));
  } catch {
    const storedActiveBill = getActiveBillFromStorage();
    const tenantState = useTenantStore.getState();
    const activeBranch = tenantState.currentBranch;
    const activeRestaurant = tenantState.currentRestaurant;
    const fallbackInfo: RestaurantInfo = {
      name: activeBranch?.name || activeRestaurant?.name || defaultRestaurantInfo.name,
      address: activeBranch?.address || activeRestaurant?.address || defaultRestaurantInfo.address,
      phone: activeBranch?.phone || activeRestaurant?.phone || defaultRestaurantInfo.phone,
      email: activeBranch?.email || activeRestaurant?.email || defaultRestaurantInfo.email,
      gstNumber: activeRestaurant?.gstNumber || defaultRestaurantInfo.gstNumber,
      tagline: activeRestaurant?.tagline || defaultRestaurantInfo.tagline,
    };
    useCashierStore.setState((prev) => ({
      restaurantInfo: fallbackInfo,
      orders: storedActiveBill ? [storedActiveBill] : [],
      payments: [],
      invoices: [],
      coupons: [],
      taxes: defaultTaxes,
      currentBill: prev.currentBill ?? storedActiveBill,
      selectedOrderId: prev.selectedOrderId ?? storedActiveBill?.id ?? null,
    }));
  }
};

export const useCashierStore = create<CashierState>((set, get) => ({
  orders: [],
  payments: [],
  invoices: [],
  coupons: [],
  taxes: defaultTaxes,
  restaurantInfo: defaultRestaurantInfo,

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

  fetchData: async () => {
    await hydrateCashierData();
  },

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

  createNewBill: (orderType = 'dine-in', tableNumber?: string, customerName?: string) => {
    const newId = `pos-${Date.now()}`;
    const orderNumber = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBill: CashierOrder = {
      id: newId,
      orderNumber,
      tableNumber: tableNumber ? Number(tableNumber) || undefined : undefined,
      customer: {
        id: 'walk-in',
        name: customerName?.trim() || 'Walk-in Customer',
        phone: '',
        email: '',
      },
      orderType,
      status: 'new',
      paymentStatus: 'pending',
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      additionalCharges: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      cashierName: get().restaurantInfo.name || 'Store Cashier',
    };

    saveActiveBillToStorage(newBill);

    set((s) => ({
      orders: [newBill, ...s.orders.filter((o) => o.id !== newId)],
      selectedOrderId: newId,
      currentBill: newBill,
      discount: null,
      couponCodeInput: '',
      percentageDiscount: '',
      fixedDiscount: '',
      additionalCharges: 0,
      paymentMethod: 'cash',
      cashReceived: '',
      splitPayments: [],
      paymentSuccess: null,
    }));

    ordersApi.create({
      userId: 'walk-in',
      items: [],
      orderType,
      paymentStatus: 'pending',
      notes: [
        customerName?.trim() ? `Customer: ${customerName.trim()}` : '',
        tableNumber ? `Table ${tableNumber}` : '',
      ].filter(Boolean).join(' | '),
    }).then((res) => {
      const created = (res.data?.data ?? res.data) as any;
      const realId = String(created?._id ?? created?.id ?? newId);
      const realOrderNum = created?.orderNumber ?? orderNumber;

      const syncedBill: CashierOrder = {
        ...newBill,
        id: realId,
        orderNumber: realOrderNum,
      };

      saveActiveBillToStorage(syncedBill);

      useCashierStore.setState((s) => ({
        currentBill: s.currentBill?.id === newId ? syncedBill : s.currentBill,
        selectedOrderId: s.selectedOrderId === newId ? realId : s.selectedOrderId,
        orders: s.orders.map((o) => (o.id === newId ? syncedBill : o)),
      }));

      useOrderSyncStore.getState().notifyOrderChange({
        type: 'create',
        orderId: realId,
        status: 'new',
        at: new Date().toISOString(),
      });
    }).catch(() => {});

    useToastStore.getState().showToast(`Created Bill #${orderNumber}`, 'info');
  },

  updateBillInfo: (data) => {
    const bill = get().currentBill;
    if (!bill) return;

    const updatedCustomer = {
      ...bill.customer,
      ...(data.customerName !== undefined ? { name: data.customerName } : {}),
      ...(data.customerPhone !== undefined ? { phone: data.customerPhone } : {}),
    };

    const updatedBill: CashierOrder = {
      ...bill,
      orderType: data.orderType ?? bill.orderType,
      tableId: data.tableId !== undefined ? data.tableId || undefined : bill.tableId,
      tableNumber: data.tableNumber !== undefined ? (Number(data.tableNumber) || undefined) : bill.tableNumber,
      customer: updatedCustomer,
    };

    saveActiveBillToStorage(updatedBill);

    set((s) => ({
      currentBill: updatedBill,
      orders: s.orders.map((o) => (o.id === bill.id ? updatedBill : o)),
    }));

    void syncBillUpdateToBackend(updatedBill);
  },

  setSelectedOrder: (id) => {
    const order = id ? get().orders.find((o) => o.id === id) ?? null : null;
    saveActiveBillToStorage(order);
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
    let bill = get().currentBill;
    if (!bill) {
      // Auto-create bill if not present
      get().createNewBill();
      bill = get().currentBill;
    }
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

    const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0);
    const updatedBill: CashierOrder = {
      ...bill,
      items,
      subtotal,
      total: subtotal,
    };

    saveActiveBillToStorage(updatedBill);

    set((s) => ({
      currentBill: updatedBill,
      orders: s.orders.some((o) => o.id === bill!.id)
        ? s.orders.map((o) => (o.id === bill!.id ? updatedBill : o))
        : [updatedBill, ...s.orders],
    }));

    void autoSyncOrderToDatabase(updatedBill);
    useToastStore.getState().showToast(`Added ${item.name} to bill`, 'success');
  },

  removeBillItem: (itemId) => {
    const bill = get().currentBill;
    if (!bill) return;
    const items = bill.items.filter((i) => i.id !== itemId);
    const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0);
    const updatedBill: CashierOrder = {
      ...bill,
      items,
      subtotal,
      total: subtotal,
    };
    saveActiveBillToStorage(updatedBill);
    set((s) => ({
      currentBill: updatedBill,
      orders: s.orders.map((o) => (o.id === bill.id ? updatedBill : o)),
    }));
    void syncBillUpdateToBackend(updatedBill);
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

    const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0);
    const updatedBill: CashierOrder = {
      ...bill,
      items,
      subtotal,
      total: subtotal,
    };
    saveActiveBillToStorage(updatedBill);
    set((s) => ({
      currentBill: updatedBill,
      orders: s.orders.map((o) => (o.id === bill.id ? updatedBill : o)),
    }));
    void syncBillUpdateToBackend(updatedBill);
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
    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
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
      transactionId: txnId,
      date: new Date().toISOString(),
      cashier: state.restaurantInfo.name || 'Store Cashier',
      breakdown,
    };

    // Async backend persistence for invoice and payment status
    if (bill.id.startsWith('pos-')) {
      ordersApi.create({
        userId: 'walk-in',
        items: bill.items.map((i) => ({
          menuItem: i.id,
          quantity: i.quantity,
        })),
        orderType: bill.orderType,
        paymentStatus: 'paid',
        notes: [
          bill.customer.name ? `Customer: ${bill.customer.name}` : '',
          bill.customer.phone ? `Phone: ${bill.customer.phone}` : '',
          bill.tableNumber ? `Table ${bill.tableNumber}` : '',
        ].filter(Boolean).join(' | '),
      }).then((res) => {
        const created = (res.data?.data ?? res.data) as any;
        const realId = created?._id ?? created?.id;
        if (realId) {
          invoicesApi.create({ orderId: realId, paymentMethod: payment.paymentMethod })
            .then((invRes) => {
              const invId = (invRes.data?.data as any)?._id || invRes.data?.data?.id;
              if (invId) {
                return invoicesApi.updateStatus(invId, { status: 'paid', transactionId: txnId });
              }
            })
            .catch(() => {});
          ordersApi.updateStatus(realId, 'completed').catch(() => {});
        }
      }).catch(() => {});
    } else {
      invoicesApi.create({ orderId: bill.id, paymentMethod: payment.paymentMethod })
        .then((res) => {
          const invId = (res.data?.data as any)?._id || res.data?.data?.id;
          if (invId) {
            return invoicesApi.updateStatus(invId, { status: 'paid', transactionId: txnId });
          }
        })
        .catch(() => {});

      ordersApi.updateStatus(bill.id, 'completed').catch(() => {});
    }

    saveActiveBillToStorage(null);

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
    useOrderSyncStore.getState().notifyResourceChange({
      type: 'update',
      resource: 'payment',
      at: new Date().toISOString(),
    });
    useToastStore.getState().showToast('Payment completed and invoice recorded', 'success');
    return { ok: true };
  },

  sendOrderToKitchen: async () => {
    const state = get();
    const bill = state.currentBill;
    if (!bill || bill.items.length === 0) {
      useToastStore.getState().showToast('Add items to the bill first before sending to kitchen', 'error');
      return { ok: false, error: 'No items on bill' };
    }

    try {
      const response = await ordersApi.create({
        userId: 'walk-in',
        items: bill.items.map((i) => ({
          menuItem: i.id,
          quantity: i.quantity,
        })),
        orderType: bill.orderType,
        tableId: bill.tableId,
        paymentStatus: 'pending',
        notes: [
          bill.customer.name ? `Customer: ${bill.customer.name}` : '',
          bill.customer.phone ? `Phone: ${bill.customer.phone}` : '',
          bill.tableNumber ? `Table ${bill.tableNumber}` : '',
        ].filter(Boolean).join(' | '),
      });

      const created = (response.data?.data ?? response.data) as any;
      const realId = String(created?._id ?? created?.id ?? bill.id);
      const realOrderNum = created?.orderNumber ?? bill.orderNumber;

      const updatedBill: CashierOrder = {
        ...bill,
        id: realId,
        orderNumber: realOrderNum,
        status: 'new',
      };

      set((s) => ({
        currentBill: updatedBill,
        selectedOrderId: realId,
        orders: s.orders.map((o) => (o.id === bill.id ? updatedBill : o)),
      }));

      useOrderSyncStore.getState().notifyOrderChange({
        type: 'create',
        orderId: realId,
        status: 'new',
        at: new Date().toISOString(),
      });

      useToastStore.getState().showToast(`Order #${realOrderNum} sent to Kitchen & saved to Database!`, 'success');
      return { ok: true };
    } catch {
      useToastStore.getState().showToast('Sent to kitchen locally', 'info');
      return { ok: true };
    }
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

    // Async backend update
    if (payment.invoiceNumber) {
      const inv = get().invoices.find((i) => i.invoiceNumber === payment.invoiceNumber);
      if (inv) {
        invoicesApi.updateStatus(inv.id, { status: isFull ? 'refunded' : 'partially_paid' }).catch(() => {});
      }
    }

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
    useOrderSyncStore.getState().notifyResourceChange({
      type: 'update',
      resource: 'payment',
      at: new Date().toISOString(),
    });
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

  clearCurrentBill: () => {
    saveActiveBillToStorage(null);
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
    });
  },

  resetPaymentState: () =>
    set({
      paymentMethod: 'cash',
      cashReceived: '',
      splitPayments: [],
      paymentSuccess: null,
    }),
}));

void hydrateCashierData();

useOrderSyncStore.subscribe((state) => {
  if (!state.lastEvent) return;
  void hydrateCashierData();
});

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'restaurantos-order-sync') {
      void hydrateCashierData();
    }
  });
}

// ---- Selector helpers ----
export const selectUnpaidOrders = (state: CashierState) =>
  state.orders.filter(
    (o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'pending' || o.paymentStatus === 'partially_paid'
  );
