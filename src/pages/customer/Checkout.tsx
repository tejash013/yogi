import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ROUTES } from '@/constants';
import { ordersApi } from '@/api';
import { getApiErrorMessage } from '@/api/errors';
import { useAuthStore, useCartStore, useOrderSyncStore } from '@/store';

type DiningType = 'dine-in' | 'takeaway';

export default function Checkout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cartTableNumber = useCartStore((state) => state.tableNumber);
  const cartTableId = useCartStore((state) => state.tableId);
  const { items, subtotal, clearCart } = useCartStore();
  const [diningType, setDiningType] = useState<DiningType>('dine-in');
  const [tableNumber, setTableNumber] = useState(cartTableNumber ? String(cartTableNumber) : '');
  const [tableId, setTableId] = useState(cartTableId || '');
  const cartSpecialInstructions = useCartStore((state) => state.specialInstructions);
  const [formData, setFormData] = useState(() => {
    const defaultNotes = cartSpecialInstructions || items.map((i) => i.specialInstructions).filter(Boolean).join(', ') || '';
    return {
      name: user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Customer' : '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      notes: defaultNotes,
    };
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.notes) {
      const defaultNotes = cartSpecialInstructions || items.map((i) => i.specialInstructions).filter(Boolean).join(', ') || '';
      if (defaultNotes) {
        setFormData((prev) => ({ ...prev, notes: defaultNotes }));
      }
    }
  }, [cartSpecialInstructions, items]);

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
    if (cartTableId) setTableId(cartTableId);
  }, [cartTableId]);

  const finalTotal = subtotal;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const customerId = user?.id ?? (user as any)?._id;

    if (items.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }

    setIsProcessing(true);
    setSubmitError(null);

    try {
      const activeTableNum = cartTableNumber && Number.isFinite(cartTableNumber) && cartTableNumber > 0 && cartTableNumber < 1000 ? cartTableNumber : undefined;
      const notes = [
        formData.notes,
        formData.name ? `Customer: ${formData.name.trim()}` : '',
        formData.phone ? `Phone: ${formData.phone.trim()}` : '',
        diningType === 'dine-in' && (activeTableNum || tableNumber) ? `Table ${activeTableNum || tableNumber}` : '',
        'Payment: cash',
      ].filter(Boolean).join(' | ');

      const response = await ordersApi.create({
        userId: customerId ? String(customerId) : undefined,
        tableId: diningType === 'dine-in' ? (tableId || (activeTableNum ? String(activeTableNum) : undefined)) : undefined,
        items: items.map((item) => ({
          menuItem: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || formData.notes || undefined,
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
            {/* Dining Type */}
            <Card>
              <h3 className="mb-3 font-bold text-neutral-900 dark:text-white">1. Select Dining Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['dine-in', 'takeaway'] as const).map((type) => (
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
                      {type === 'dine-in' ? '🍽️' : '🛍️'}
                    </span>
                    <p className={`mt-1 text-xs font-bold ${
                      diningType === type ? 'text-primary-600' : 'text-neutral-600 dark:text-neutral-300'
                    }`}>
                      {type === 'dine-in' ? 'Dine In' : 'Takeaway'}
                    </p>
                  </button>
                ))}
              </div>

              {/* Special Cooking Instructions */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label className="mb-1.5 block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Special Cooking Instructions / Food Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, no onions, extra sauce..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <h3 className="mb-1 font-bold text-neutral-900 dark:text-white">2. Payment Method</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                Pay directly at counter or table
              </p>
              <div className="flex items-center gap-3.5 rounded-2xl border-2 border-primary-500 bg-primary-50/80 p-4 dark:bg-primary-950/40">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-neutral-800 text-2xl">
                  💵
                </span>
                <div>
                  <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    Pay at Counter / Table
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Cash payment processed upon dining
                  </p>
                </div>
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

