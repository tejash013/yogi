import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { QuantitySelector } from '@/components/customer';
import RestaurantFloorView, { type TableItem } from '@/components/common/RestaurantFloorView';
import { ROUTES } from '@/constants';
import { offersApi, tablesApi } from '@/api';
import { useCartStore } from '@/store';

const TAX_RATE = 0.08;
const DELIVERY_FEE = 2.99;

export default function Cart() {
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [tablesList, setTablesList] = useState<TableItem[]>([]);

  const tableNumber = useCartStore((s) => s.tableNumber);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    tablesApi.getAll().then((res: any) => {
      const raw = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      const mapped: TableItem[] = raw.map((t: any, i: number) => {
        const label = String(t?.label ?? t?.number ?? `Table ${i + 1}`);
        const num = Number.parseInt(label.replace(/\D/g, ''), 10) || i + 1;
        return {
          id: String(t?._id ?? t?.id ?? `table-${i + 1}`),
          number: num,
          label,
          capacity: Number(t?.capacity ?? 4),
          status: (t?.status ?? 'available') as TableItem['status'],
          location: t?.location ?? (num <= 2 ? 'Window View' : num <= 4 ? 'Center Hall' : 'Plant Corner'),
          notes: t?.notes ?? '',
        };
      });
      setTablesList(mapped);
    }).catch(() => undefined);
  }, []);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

    try {
      const response = await offersApi.validateCoupon(code);
      const coupon = response?.data?.data;
      if (coupon) {
        const discountVal = coupon.discountType === 'percentage'
          ? (subtotal * (Number(coupon.discountValue || 0) / 100))
          : Number(coupon.discountValue || 0);
        setCouponApplied(true);
        setCouponDiscount(discountVal);
        return;
      }
    } catch {
      // Check fallback codes
    }

    if (code.toUpperCase() === 'FIRST10') {
      setCouponApplied(true);
      setCouponDiscount(10);
    } else if (code.toUpperCase() === 'WELCOME20') {
      setCouponApplied(true);
      setCouponDiscount(subtotal * 0.2);
    } else {
      alert('Invalid coupon code');
    }
  };

  const actualTax = subtotal * TAX_RATE;
  const finalTotal = Math.max(0, subtotal + actualTax + DELIVERY_FEE - couponDiscount);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
          <svg className="h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">Your cart is empty</h2>
        <p className="mb-6 text-sm text-neutral-500">Looks like you haven't added anything yet</p>
        <Link to={ROUTES.CUSTOMER.MENU}>
          <Button size="lg">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
          Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
        </h1>
        <button
          onClick={clearCart}
          className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
        >
          Clear All
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.menuItemId}>
              <div className="flex gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-700">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{item.name}</h3>
                  <p className="mt-0.5 text-sm text-neutral-500">₹{item.price.toFixed(2)} each</p>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      size="sm"
                    />
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Order Summary</h3>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  disabled={couponApplied}
                />
                {!couponApplied ? (
                  <Button size="sm" variant="outline" onClick={applyCoupon}>Apply</Button>
                ) : (
                  <button
                    onClick={() => { setCouponApplied(false); setCouponDiscount(0); }}
                    className="text-sm font-medium text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              {couponApplied && (
                <p className="mt-1 text-xs font-semibold text-green-500">Coupon applied!</p>
              )}
            </div>

            {/* Special Instructions */}
            <input
              type="text"
              placeholder="Cooking instructions (e.g. less spicy)..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="mb-4 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />

            {/* Reservation floor map */}
            <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 dark:text-amber-300">Reserve a dining table</span>
                <button
                  type="button"
                  onClick={() => setShowFloorModal(true)}
                  className="rounded-lg bg-amber-400/20 px-2 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-400/30 dark:text-amber-300"
                >
                  Open floor map
                </button>
              </div>
              {tableNumber ? (
                <p className="text-xs text-amber-800 dark:text-amber-200">Table {tableNumber} selected for your reservation.</p>
              ) : (
                <p className="text-xs text-amber-700 dark:text-amber-300">Choose a table from the reservation floor plan.</p>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Tax (8%)</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">₹{actualTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Delivery Fee</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">₹{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-500 font-semibold">Discount</span>
                  <span className="font-bold text-green-500">-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-neutral-100 dark:border-neutral-800" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-900 dark:text-white">Total</span>
                <span className="text-2xl font-extrabold text-primary-500">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link to={ROUTES.CUSTOMER.CHECKOUT} className="mt-6 block">
              <Button fullWidth size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Reservation floor plan */}
      {showFloorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-[#48392d] bg-[#161311] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Reserve a table on the floor map</h3>
                <p className="text-xs text-[#a0907e]">Choose an available table for your reservation.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFloorModal(false)}
                aria-label="Close floor map"
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <RestaurantFloorView
              tables={tablesList}
              selectedTableNumber={tableNumber}
              onSelectTable={(table) => {
                setTableNumber(table.number);
                setShowFloorModal(false);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}

