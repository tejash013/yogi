import { useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { Card, Button, EmptyState } from '@/components/ui';
import {
  OrderStatusBadge,
  PriorityBadge,
  OrderItemList,
  OrderDetails,
} from '@/components/kitchen';
import { useKitchenStore, getWaitingMinutes } from '@/store';

const formatWaiting = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${(minutes % 60).toString().padStart(2, '0')}m`;

const READY_WARNING_MIN = 10;

/**
 * Ready page: shows orders whose food is ready, with waiting-time
 * warnings when food has been sitting too long.
 */
export default function Ready() {
  const orders = useKitchenStore((s) => s.orders);
  const activeOrderId = useKitchenStore((s) => s.activeOrderId);
  const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'ready'),
    [orders]
  );

  const activeOrder = activeOrderId
    ? orders.find((o) => o.id === activeOrderId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ready to Serve"
        description="Orders whose food is ready for pickup or delivery"
      />

      {readyOrders.length === 0 ? (
        <EmptyState
          title="No ready orders"
          description="Prepared orders will appear here once marked ready."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readyOrders.map((order) => {
            const waiting = getWaitingMinutes(order);
            const longWait = waiting >= READY_WARNING_MIN;
            return (
              <Card
                key={order.id}
                className={longWait ? 'border-yellow-300 ring-1 ring-yellow-200 dark:border-yellow-700' : ''}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <button
                    onClick={() => setActiveOrder(order.id)}
                    className="text-left font-bold text-neutral-900 hover:text-primary-600 dark:text-white"
                  >
                    #{order.orderNumber}
                  </button>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {order.tableNumber && <span>Table {order.tableNumber}</span>}
                  <span className="uppercase">{order.orderType}</span>
                  <PriorityBadge priority={order.priority} />
                </div>

                <div className="mb-3">
                  <OrderItemList items={order.items} />
                </div>

                <div className="mb-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Waiting: <span className="font-semibold text-neutral-900 dark:text-white">{formatWaiting(waiting)}</span>

                  </p>
                  {longWait && (
                    <p className="mt-1 rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      ⚠ Food waiting for {waiting} min — may need to be remade
                    </p>
                  )}
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => useKitchenStore.getState().completeOrder(order.id)}
                >
                  Complete Order
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <OrderDetails order={activeOrder} onClose={() => setActiveOrder(null)} />
    </div>
  );
}

