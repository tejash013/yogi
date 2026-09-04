import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { CustomerInvoiceModal } from '@/components/customer';
import { ROUTES } from '@/constants';
import { ordersApi } from '@/api';
import type { Order } from '@/types';
import { FiDownload } from 'react-icons/fi';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const state = (location.state as { orderId?: string; orderNumber?: string; order?: any } | null) ?? null;
  const orderId = state?.orderId ?? state?.order?.id ?? state?.order?._id ?? 'unknown';
  const orderNumber = state?.orderNumber ?? state?.order?.orderNumber ?? 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const estimatedTime = '20-30';

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (orderId && orderId !== 'unknown') {
      ordersApi.getById(orderId)
        .then((res) => {
          const item = (res.data?.data ?? res.data) as any;
          if (item) {
            setCurrentOrder({
              id: item._id ?? item.id,
              orderNumber: item.orderNumber ?? `ORD-${String(item._id ?? item.id).slice(-6).toUpperCase()}`,
              userId: item.user ?? item.userId ?? '',
              userName: item.userName ?? (item.user?.firstName ? `${item.user.firstName} ${item.user.lastName ?? ''}`.trim() : 'Customer'),
              items: Array.isArray(item.items) ? item.items.map((entry: any) => ({
                id: entry._id ?? entry.id,
                menuItemId: entry.menuItem ?? entry.menuItemId ?? '',
                name: entry.name ?? entry.menuItem?.title ?? entry.menuItem?.name ?? 'Menu item',
                quantity: Number(entry.quantity ?? 1),
                unitPrice: Number(entry.unitPrice ?? entry.price ?? 0),
                totalPrice: Number(entry.totalPrice ?? (Number(entry.unitPrice ?? entry.price ?? 0) * Number(entry.quantity ?? 1))),
                specialInstructions: entry.specialInstructions,
              })) : [],
              subtotal: Number(item.subtotal ?? 0),
              tax: Number(item.tax ?? item.taxes ?? 0),
              discount: Number(item.discount ?? 0),
              total: Number(item.total ?? 0),
              status: item.status ?? 'pending',
              paymentStatus: item.paymentStatus ?? 'pending',
              paymentMethod: (item.paymentMethod === 'upi' ? 'upi' : 'cash'),
              deliveryType: item.deliveryType ?? 'dine-in',
              createdAt: item.createdAt ?? new Date().toISOString(),
              updatedAt: item.updatedAt ?? new Date().toISOString(),
            });
          }
        })
        .catch(() => {});
    }
  }, [orderId]);

  // Fallback temporary order object if not yet loaded from backend
  const displayOrder: Order = currentOrder ?? {
    id: orderId,
    orderNumber: orderNumber,
    userId: '',
    userName: 'Valued Customer',
    items: [{ id: '1', menuItemId: '1', name: 'Restaurant Order Items', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    deliveryType: 'dine-in',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      {/* Success Animation */}
      <div className={`transition-all duration-700 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <div className="relative mx-auto mb-8">
          {/* Outer ring */}
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary-200 dark:border-primary-800">
            {/* Inner circle */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
              {/* Checkmark */}
              <svg className="h-12 w-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                  className="animate-draw-check"
                />
              </svg>
            </div>
          </div>
          {/* Sparkles */}
          <div className="absolute -right-2 -top-2 animate-ping text-2xl opacity-70">✨</div>
          <div className="absolute -left-1 -bottom-1 animate-ping text-xl opacity-50" style={{ animationDelay: '0.3s' }}>⭐</div>
        </div>
      </div>

      {/* Content */}
      <div className={`text-center transition-all duration-700 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-white">
          Order Placed Successfully! 🎉
        </h1>
        <p className="mb-6 text-neutral-500">
          Thank you for your order. Your delicious food is being prepared.
        </p>

        {/* Order Details Card */}
        <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="mb-4">
            <p className="text-sm text-neutral-500">Order Number</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{orderNumber}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-neutral-500">Estimated Time</p>
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-bold text-primary-500">{estimatedTime} minutes</p>
            </div>
          </div>
          <div className="rounded-xl bg-primary-50 p-3 dark:bg-primary-900/20">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              We'll notify you when your order is ready!
            </p>
          </div>
        </div>

        <div className="mx-auto flex max-w-sm flex-col gap-3">
          <Button
            size="lg"
            onClick={() => navigate(ROUTES.CUSTOMER.ORDER_TRACKING.replace(':orderId', orderId))}
          >
            Track Order Live
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowInvoiceModal(true)}
            className="border-primary-500 text-primary-600 dark:text-primary-400 font-bold"
          >
            <FiDownload className="mr-2 h-4 w-4" /> Download / View Tax Invoice
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate(ROUTES.CUSTOMER.HOME)}
          >
            Back to Home
          </Button>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      <CustomerInvoiceModal
        order={displayOrder}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
}

