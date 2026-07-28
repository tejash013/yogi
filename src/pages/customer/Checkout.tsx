import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useCartStore } from '@/store';

type DiningType = 'dine-in' | 'takeaway' | 'delivery';
type PaymentMethod = 'card' | 'cash' | 'upi' | 'wallet';

const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.08;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const [diningType, setDiningType] = useState<DiningType>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const actualTax = subtotal * TAX_RATE;
  const rewardDiscount = useRewardPoints ? Math.min(5, subtotal) : 0;
  const finalTotal = Math.max(0, subtotal + actualTax + DELIVERY_FEE - rewardDiscount);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      navigate(ROUTES.CUSTOMER.ORDER_SUCCESS);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Dining Type */}
            <Card>
              <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Dining Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {(['dine-in', 'takeaway', 'delivery'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDiningType(type)}
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      diningType === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    <span className="text-2xl">
                      {type === 'dine-in' ? '🍽️' : type === 'takeaway' ? '🛍️' : '🚚'}
                    </span>
                    <p className={`mt-1 text-sm font-semibold ${
                      diningType === type ? 'text-primary-600' : 'text-neutral-600 dark:text-neutral-300'
                    }`}>
                      {type === 'dine-in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
                    </p>
                  </button>
                ))}
              </div>

              {diningType === 'dine-in' && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Table Number
                  </label>
                  <input
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Enter table number"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
                  />
                </div>
              )}
            </Card>

            {/* Customer Details */}
            <Card>
              <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Customer Details</h3>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+1-555-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Special Notes"
                  placeholder="Any special requests..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
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
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="mb-4 border-neutral-200 dark:border-neutral-600" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Tax (8%)</span>
                  <span>${actualTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Delivery Fee</span>
                  <span>${DELIVERY_FEE.toFixed(2)}</span>
                </div>

                {/* Reward Points */}
                <div className="flex items-center justify-between rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                      Use reward points ($5 off)
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
                    <span className="font-medium text-green-600">-${rewardDiscount.toFixed(2)}</span>
                  </div>
                )}

                <hr className="border-neutral-200 dark:border-neutral-600" />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary-500">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                className="mt-6"
                isLoading={isProcessing}
              >
                {isProcessing ? 'Placing Order...' : `Place Order · $${finalTotal.toFixed(2)}`}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

