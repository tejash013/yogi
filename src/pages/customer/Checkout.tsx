import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui';
import { ROUTES } from '@/constants';
import { ordersApi, settingsApi, tablesApi } from '@/api';
import { getApiErrorMessage } from '@/api/errors';
import { useAuthStore, useCartStore, useOrderSyncStore } from '@/store';

type DiningType = 'dine-in' | 'takeaway' | 'delivery';
type PaymentMethod = 'card' | 'cash' | 'upi' | 'wallet';

export default function Checkout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cartTableNumber = useCartStore((state) => state.tableNumber);
  const { items, subtotal, clearCart } = useCartStore();
  const [diningType, setDiningType] = useState<DiningType>('dine-in');
  const [tableNumber, setTableNumber] = useState(cartTableNumber ? String(cartTableNumber) : '');
  const [tableId, setTableId] = useState('');
  const [tables, setTables] = useState<Array<{ id: string; label: string }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Customer' : '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    notes: '',
  });
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState<number>(40);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Customer',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cartTableNumber) {
      setTableNumber(String(cartTableNumber));
    }
  }, [cartTableNumber]);

  useEffect(() => {
    settingsApi.get()
      .then((res) => {
        const s = res.data?.data;
        if (s) {
          if (typeof s.taxRate === 'number') setTaxPercent(s.taxRate);
          if (typeof s.deliveryFee === 'number') setStandardDeliveryFee(s.deliveryFee);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    tablesApi.getAll()
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setTables(list
          .filter((table: any) => table.status === 'available')
          .map((table: any) => ({
            id: String(table._id ?? table.id),
            label: String(table.label ?? table.number ?? 'Table'),
          })));
      })
      .catch(() => setTables([]));
  }, []);

  const deliveryFee = diningType === 'delivery' ? standardDeliveryFee : 0;
  const actualTax = subtotal * (taxPercent / 100);
  const rewardDiscount = useRewardPoints ? Math.min(50, subtotal * 0.2) : 0;
  const finalTotal = Math.max(0, subtotal + actualTax + deliveryFee - rewardDiscount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const customerId = user?.id ?? (user as any)?._id;
    if (!customerId) {
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }

    if (diningType === 'dine-in' && !tableNumber.trim()) {
      setSubmitError('Please enter your Table Number for Dine-In order.');
      return;
    }

    if (diningType === 'dine-in' && !tableId) {
      setSubmitError('Please select an available restaurant table.');
      return;
    }

    setIsProcessing(true);
    setSubmitError(null);

    try {
      const notes = [
        formData.notes,
        diningType === 'dine-in' && tableNumber ? `Table ${tableNumber}` : '',
        paymentMethod ? `Payment: ${paymentMethod}` : '',
      ].filter(Boolean).join(' | ');

      const response = await ordersApi.create({
        userId: String(customerId),
        tableId: diningType === 'dine-in' ? tableId : undefined,
        items: items.map((item) => ({
          menuItem: item.menuItemId,
          quantity: item.quantity,
        })),
        orderType: diningType,
        paymentStatus: 'pending',
        notes: notes || undefined,
      });

      const createdOrder = (response?.data?.data ?? response?.data) as any;
      const orderId = createdOrder?._id ?? createdOrder?.id ?? 'unknown';
      const orderNumber = createdOrder?.orderNumber ?? `ORD-${String(orderId).slice(-6).toUpperCase()}`;

      useOrderSyncStore.getState().notifyOrderChange({
        type: 'create',
        orderId,
        status: 'pending',
        at: new Date().toISOString(),
      });

      clearCart();
      navigate(ROUTES.CUSTOMER.ORDER_SUCCESS, {
        state: {
          orderId,
          orderNumber,
        },
      });
    } catch (error: any) {
      const message = getApiErrorMessage(error, 'We could not place your order. Please try again.');

      if (error?.response?.status === 409) {
        setSubmitError('One or more items in your cart are no longer available in the required quantity. Please adjust the cart and try again.');
        return;
      }

      setSubmitError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Order Checkout</h1>
        <p className="text-xs text-neutral-500">Quickly confirm your order without repetitive forms</p>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Dining Type & Table Number */}
            <Card>
              <h3 className="mb-3 font-bold text-neutral-900 dark:text-white">1. Select Dining Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['dine-in', 'takeaway', 'delivery'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDiningType(type)}
                    className={`rounded-2xl border-2 p-3.5 text-center transition-all ${
                      diningType === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <span className="text-2xl">
                      {type === 'dine-in' ? '🍽️' : type === 'takeaway' ? '🛍️' : '🚚'}
                    </span>
                    <p className={`mt-1 text-xs font-bold ${
                      diningType === type ? 'text-primary-600' : 'text-neutral-600 dark:text-neutral-300'
                    }`}>
                      {type === 'dine-in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                    </p>
                  </button>
                ))}
              </div>

              {diningType === 'dine-in' && (
                <div className="mt-4 rounded-2xl bg-amber-50/60 p-4 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                    <span>Restaurant Table 🍽️ (Required for Dine-in)</span>
                    <span className="text-[11px] font-normal text-amber-700 dark:text-amber-400">Select from database</span>
                  </label>
                  <select
                    value={tableId}
                    onChange={(e) => {
                      const selected = tables.find((table) => table.id === e.target.value);
                      setTableId(e.target.value);
                      setTableNumber(selected?.label.replace(/\D/g, '') || selected?.label || '');
                    }}
                    required
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-neutral-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-amber-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="">Select an available table</option>
                    {tables.map((table) => <option key={table.id} value={table.id}>{table.label}</option>)}
                  </select>
                </div>
              )}
            </Card>

            {/* Customer Details - Friction Free */}
            <Card>
              <h3 className="mb-3 font-bold text-neutral-900 dark:text-white">2. Customer Information</h3>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-green-50 p-3.5 border border-green-200 dark:bg-green-950/30 dark:border-green-800/40">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                        ✓
                      </span>
                      <div>
                        <p className="text-sm font-bold text-green-900 dark:text-green-100">
                          {formData.name || 'Registered Customer'}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {formData.email} {formData.phone ? `· ${formData.phone}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditCustomer(!showEditCustomer)}
                      className="text-xs font-bold text-green-800 hover:underline dark:text-green-300"
                    >
                      {showEditCustomer ? 'Done' : 'Change Info'}
                    </button>
                  </div>

                  {showEditCustomer && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone Number"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              )}

              {/* Special instructions */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Special Cooking Instructions / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, no onions, extra sauce, well cooked..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <h3 className="mb-3 font-bold text-neutral-900 dark:text-white">3. Payment Option</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([
                  { id: 'card' as const, label: 'Credit/Debit Card', icon: '💳' },
                  { id: 'cash' as const, label: 'Cash', icon: '💵' },
                  { id: 'upi' as const, label: 'UPI', icon: '📱' },
                  { id: 'wallet' as const, label: 'Wallet', icon: '👛' },
                ]).map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className={`text-sm font-medium ${
                      paymentMethod === method.id ? 'text-primary-600' : 'text-neutral-600 dark:text-neutral-300'
                    }`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Order Summary</h3>

              {/* Items */}
              <div className="mb-4 space-y-2">
                {items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="mb-4 border-neutral-200 dark:border-neutral-600" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">GST / Tax ({taxPercent}%)</span>
                  <span>₹{actualTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>

                {/* Reward Points */}
                <div className="flex items-center justify-between rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                      Use loyalty points (₹50 discount)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseRewardPoints(!useRewardPoints)}
                    className={`h-6 w-11 rounded-full transition-colors ${
                      useRewardPoints ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  >
                    <div className={`h-5 w-5 -translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                      useRewardPoints ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {useRewardPoints && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Reward Discount</span>
                    <span className="font-medium text-green-600">-₹{rewardDiscount.toFixed(2)}</span>
                  </div>
                )}

                <hr className="border-neutral-200 dark:border-neutral-600" />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary-500">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-900/10 dark:text-red-300">
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                className="mt-6"
                isLoading={isProcessing}
              >
                {isProcessing ? 'Placing Order...' : `Place Order · ₹${finalTotal.toFixed(2)}`}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

