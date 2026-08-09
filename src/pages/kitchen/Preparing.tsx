import { useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { Card, Button, EmptyState } from '@/components/ui';
import {
  OrderStatusBadge,
  PriorityBadge,
  OrderItemList,
  OrderTimer,
  OrderDetails,
} from '@/components/kitchen';
import { useKitchenStore, isDelayed } from '@/store';

/**
 * Preparing page: shows only orders currently being prepared,
 * with a live preparation timer and delay indicators.
 */
export default function Preparing() {
  const orders = useKitchenStore((s) => s.orders);
  const activeOrderId = useKitchenStore((s) => s.activeOrderId);
  const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);

  const preparingOrders = useMemo(
    () => orders.filter((o) => o.status === 'preparing'),
    [orders]
  );

  const activeOrder = activeOrderId
    ? orders.find((o) => o.id === activeOrderId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Preparing"
        description="Orders currently being prepared in the kitchen"
      />

      {preparingOrders.length === 0 ? (
        <EmptyState
          title="No orders being prepared"
          description="Orders moved here once you start preparing them."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {preparingOrders.map((order) => {
            const delayed = isDelayed(order);
            return (
              <Card
                key={order.id}
                className={delayed ? 'border-red-300 dark:border-red-700' : ''}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <button
                    onClick={() => setActiveOrder(order.id)}
                    className="text-left font-bold text-neutral-900 hover:text-primary-600 dark:text-white"
                  >
                    #{order.orderNumber}
                  </button>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {order.tableNumber && <span>Table {order.tableNumber}</span>}
                  <span className="uppercase">{order.orderType}</span>
                  <PriorityBadge priority={order.priority} />
                  {delayed && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Delayed
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <OrderItemList items={order.items} />
                </div>

                <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                  <OrderTimer order={order} />
                </div>

                <div className="mt-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => useKitchenStore.getState().markReady(order.id)}
                  >
                    Mark Ready
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <OrderDetails order={activeOrder} onClose={() => setActiveOrder(null)} />
</div>
  );
}
