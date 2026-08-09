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
  selectCounts,
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

  const counts = useKitchenStore(selectCounts);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen Dashboard"
        description="Overview of kitchen operations and performance"
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
                  <button
                    key={order.id}
                    onClick={() => setActiveOrder(order.id)}
                    className="block w-full rounded-xl border border-neutral-200 p-4 text-left transition-colors hover:border-primary-300 dark:border-neutral-700 dark:hover:border-primary-700"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          #{order.orderNumber}
                        </span>
                        <OrderStatusBadge status={order.status} />
                        <PriorityBadge priority={order.priority} />
                      </div>
                      <span className="text-xs text-neutral-400">
                        {getRelativeTime(order.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {order.tableNumber ? `Table ${order.tableNumber} · ` : ''}
                      <span className="capitalize">{order.orderType}</span> · {' '}
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </div>
                  </button>
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
