import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Badge } from '@/components/ui';
import { Timeline } from '@/components/customer';
import { ROUTES, ORDER_STATUS_LABELS } from '@/constants';
import { ordersApi } from '@/api';
import { useOrderSyncStore } from '@/store';
import { formatCurrency, formatTime } from '@/utils';
import type { Order, OrderItem, OrderStatus } from '@/types';

const normalizeOrder = (item: any): Order => ({
  id: item._id ?? item.id,
  orderNumber: item.orderNumber ?? `ORD-${String(item._id ?? item.id).slice(-6).toUpperCase()}`,
  userId: item.user ?? item.userId ?? '',
  userName: item.userName ?? item.user?.firstName ? `${item.user.firstName} ${item.user.lastName ?? ''}`.trim() : 'Customer',
  items: Array.isArray(item.items) ? item.items.map((entry: any) => ({
    id: entry._id ?? entry.id ?? `${entry.menuItem ?? entry.name ?? 'item'}-${Math.random()}`,
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
  paymentMethod: item.paymentMethod ?? 'card',
  deliveryType: item.deliveryType ?? 'dine-in',
  createdAt: item.createdAt ?? new Date().toISOString(),
  updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
});

// Map an order status to its timeline progress steps.
const ORDER_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

function buildTimelineSteps(status: OrderStatus) {
  const currentIndex = ORDER_FLOW.indexOf(status);
  return ORDER_FLOW.map((step, index) => ({
    label: ORDER_STATUS_LABELS[step],
    completed: index < currentIndex,
    isCurrent: index === currentIndex,
  }));
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const orderSyncVersion = useOrderSyncStore((state) => state.version);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await ordersApi.getUserOrders().catch(() => ({ data: { data: [] } }));
        const orderList = Array.isArray(response?.data?.data) ? response.data.data : [];
        setOrders(orderList.map(normalizeOrder));
      } catch {
        setOrders([]);
      }
    };

    void loadOrder();
  }, [orderSyncVersion]);

  const order = orders.find(
    (o) =>
      o.id.toLowerCase() === orderId?.toLowerCase() ||
      o.orderNumber.toLowerCase() === orderId?.toLowerCase()
  );

  // Back button shared by both states.
  const backButton = (
    <Link
      to={ROUTES.CUSTOMER.MY_ORDERS}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-500"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to Orders
    </Link>
  );

  // Order not found -> empty state.
  if (!order) {
    return (
      <div className="space-y-6 pb-8">
        {backButton}
        <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-800">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-4xl dark:bg-neutral-700">
            🔍
          </div>
          <h1 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
            Order Not Found
          </h1>
          <p className="mb-6 max-w-sm text-sm text-neutral-500">
            We couldn't find an order matching{' '}
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">#{orderId}</span>.
            Please check the order number and try again.
          </p>
          <Link to={ROUTES.CUSTOMER.MY_ORDERS}>
            <Button variant="outline">View My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      {backButton}

      {/* Order Info */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-white/70">Order</p>
              <Badge
                variant="neutral"
                size="sm"
                className="!bg-white/90 !text-primary-600"
              >
                {order.orderNumber}
              </Badge>
            </div>
            <h1 className="mt-1 text-2xl font-bold">Tracking Your Order</h1>
            <p className="mt-1 text-sm text-white/70">
              Updated {formatTime(order.updatedAt)}
            </p>
          </div>
          <div className="rounded-xl bg-white/20 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">
              {order.status === 'preparing'
                ? '~15'
                : order.status === 'ready'
                ? '~5'
                : isCancelled
                ? '0'
                : '~10'}
            </p>
            <p className="text-xs text-white/70">mins</p>
          </div>
        </div>
      </Card>

      {/* Order Progress */}
      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900 dark:text-white">Order Progress</h3>
          <Badge
            variant={
              order.status === 'completed'
                ? 'success'
                : order.status === 'cancelled'
                ? 'neutral'
                : 'primary'
            }
          >
            {isCancelled ? 'Cancelled' : ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>

        {isCancelled ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-2xl dark:bg-neutral-700">
              ✖️
            </div>
            <p className="font-semibold text-neutral-900 dark:text-white">
              This order was cancelled
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Please contact the restaurant or place a new order.
            </p>
          </div>
        ) : order.status === 'completed' ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl dark:bg-green-900/30">
              ✅
            </div>
            <p className="font-semibold text-neutral-900 dark:text-white">
              Your order has been completed
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Thank you for dining with us!
            </p>
          </div>
        ) : (
          <Timeline steps={buildTimelineSteps(order.status)} />
        )}
      </Card>

      {/* Order Details */}
      <Card>
        <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Order Items</h3>
        <div className="space-y-2 text-sm">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">
                {item.name} x{item.quantity}
                {item.specialInstructions && (
                  <span className="block text-xs text-neutral-400">
                    Note: {item.specialInstructions}
                  </span>
                )}
              </span>
              <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
            </div>
          ))}
          <hr className="border-neutral-100 dark:border-neutral-700" />
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <hr className="border-neutral-100 dark:border-neutral-700" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary-500">{formatCurrency(order.total)}</span>
          </div>
          {order.paymentStatus && (
            <div className="flex justify-between pt-1 text-xs text-neutral-400">
              <span>Payment</span>
              <span className="capitalize">{order.paymentStatus.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={ROUTES.CUSTOMER.FEEDBACK} className="flex-1">
          <Button variant="outline" fullWidth>
            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
            Give Feedback
          </Button>
        </Link>
        <Link to={ROUTES.CUSTOMER.MENU} className="flex-1">
          <Button fullWidth>
            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Order More
          </Button>
        </Link>
      </div>
    </div>
  );
}

