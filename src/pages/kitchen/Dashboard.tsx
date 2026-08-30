import { useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { Card, EmptyState } from '@/components/ui';
import {
  KitchenStatsCard,
  OrderStatusBadge,
  PriorityBadge,
  OrderDetails,
} from '@/components/kitchen';
import {
  useKitchenStore,
  isDelayed,
  getTotalPrepMinutes,
} from '@/store';
import { getRelativeTime } from '@/utils';

/**
 * Kitchen dashboard: summary cards, live activity and performance metrics.
 */
export default function KitchenDashboard() {
  const orders = useKitchenStore((s) => s.orders);
  const activeOrderId = useKitchenStore((s) => s.activeOrderId);
  const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);
  const acceptOrder = useKitchenStore((s) => s.acceptOrder);
  const startPreparing = useKitchenStore((s) => s.startPreparing);
  const markReady = useKitchenStore((s) => s.markReady);
  const completeOrder = useKitchenStore((s) => s.completeOrder);

  const counts = useMemo(() => ({
    new: orders.filter((o) => o.status === 'new').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
  }), [orders]);

  const activeOrders = useMemo(
    () =>
      orders
        .filter((o) => ['new', 'confirmed', 'preparing', 'ready'].includes(o.status))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 6),
    [orders]
  );

  const completedToday = orders.filter((o) => o.status === 'completed').length;
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const delayedOrders = preparingOrders.filter((o) => isDelayed(o));
  const avgPrep = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'completed');
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, o) => sum + getTotalPrepMinutes(o), 0);
    return Math.round((total / completed.length) * 10) / 10;
  }, [orders]);

  const onTimeRate = Math.max(
    0,
    Math.round(((completedToday - delayedOrders.length) / Math.max(1, completedToday)) * 100)
  );

  const activeOrder = activeOrderId ? orders.find((o) => o.id === activeOrderId) ?? null : null;

  const countsData = [
    { label: 'New Orders', value: counts.new, accent: 'warning' as const },
    { label: 'Confirmed', value: counts.confirmed, accent: 'info' as const },
    { label: 'Preparing', value: counts.preparing, accent: 'primary' as const },
    { label: 'Ready', value: counts.ready, accent: 'success' as const },
    { label: 'Completed Today', value: completedToday, accent: 'neutral' as const },
    { label: 'Avg Prep Time', value: `${avgPrep}m`, accent: 'info' as const },
  ];

  const fetchOrders = useKitchenStore((s) => s.fetchOrders);
  const isLoading = useKitchenStore((s) => s.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen Dashboard"
        description="Overview of kitchen operations and performance"
        actions={
          <button
            type="button"
            onClick={() => void fetchOrders()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <span className={`inline-block h-2 w-2 rounded-full ${isLoading ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`} />
            {isLoading ? 'Syncing...' : 'Sync Orders'}
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {countsData.map((s) => (
          <KitchenStatsCard key={s.label} label={s.label} value={s.value} accent={s.accent} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live activity */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
              Live Kitchen Activity
            </h3>
            {activeOrders.length === 0 ? (
              <EmptyState title="No active orders" description="New orders will appear here." />
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200 p-4 transition-all hover:border-primary-300 hover:shadow-sm dark:border-neutral-700 dark:hover:border-primary-700 bg-white dark:bg-neutral-800/60"
                  >
                    <div
                      onClick={() => setActiveOrder(order.id)}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-neutral-900 dark:text-white">
                          #{order.orderNumber}
                        </span>
                        <OrderStatusBadge status={order.status} />
                        <PriorityBadge priority={order.priority} />
                        <span className="text-xs text-neutral-400 ml-auto sm:ml-0">
                          {getRelativeTime(order.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-300 truncate">
                        {order.customerName ? <span className="font-semibold text-neutral-800 dark:text-neutral-200">{order.customerName} · </span> : ''}
                        {order.tableNumber ? `Table ${order.tableNumber} · ` : ''}
                        <span className="capitalize">{order.orderType}</span> · {' '}
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items (
                        {order.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {order.status === 'new' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            acceptOrder(order.id);
                          }}
                          className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
                        >
                          ✓ Confirm Order
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startPreparing(order.id);
                          }}
                          className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                        >
                          🔥 Start Prep
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markReady(order.id);
                          }}
                          className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-95"
                        >
                          🔔 Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            completeOrder(order.id);
                          }}
                          className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
                        >
                          ✓ Complete
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveOrder(order.id)}
                        className="rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Performance */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Kitchen Performance
          </h3>
          <div className="space-y-4">
            <MetricRow label="Orders Completed Today" value={String(completedToday)} />
            <MetricRow label="Average Prep Time" value={`${avgPrep} min`} />
            <MetricRow label="Delayed Orders" value={String(delayedOrders.length)} accent="error" />
            <MetricRow label="On-Time Completion" value={`${onTimeRate}%`} accent="success" />
          </div>

          <div className="mt-6">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">On-Time Rate</span>
              <span className="font-medium text-neutral-900 dark:text-white">{onTimeRate}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${onTimeRate}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <OrderDetails order={activeOrder} onClose={() => setActiveOrder(null)} />
    </div>
  );
}

function MetricRow({
  label,
  value,
  accent = 'neutral',
}: {
  label: string;
  value: string;
  accent?: 'neutral' | 'error' | 'success';
}) {
  const color =
    accent === 'error'
      ? 'text-error'
      : accent === 'success'
      ? 'text-green-600 dark:text-green-400'
      : 'text-neutral-900 dark:text-white';
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0 dark:border-neutral-700">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
);
}
