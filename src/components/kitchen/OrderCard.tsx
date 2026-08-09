import { cn, getRelativeTime } from '@/utils';
import Button from '@/components/ui/Button';
import type { KitchenOrder } from '@/types/kitchen';
import { useKitchenStore, getElapsedMinutes, isDelayed } from '@/store';
import OrderStatusBadge from './OrderStatusBadge';
import PriorityBadge from './PriorityBadge';
import OrderItemList from './OrderItemList';
import OrderTimer from './OrderTimer';

interface Props {
  order: KitchenOrder;
  onOpen?: (id: string) => void;
}

const orderTypeLabel: Record<string, string> = {
  'dine-in': 'Dine In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

/**
 * A single kitchen order card. Displays all relevant order information and
 * context-aware action buttons depending on the current order status.
 */
export default function OrderCard({ order, onOpen }: Props) {
  const store = useKitchenStore();
  const delayed = isDelayed(order);
  const elapsed = getElapsedMinutes(order);

  const openDetails = () => {
    if (onOpen) onOpen(order.id);
    else store.setActiveOrder(order.id);
  };

  const renderActions = () => {
    switch (order.status) {
      case 'new':
        return (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="primary"
              className="w-full"
              onClick={() => store.acceptOrder(order.id)}
            >
              Accept Order
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="w-full"
              onClick={() => store.rejectOrder(order.id)}
            >
              Reject
            </Button>
          </div>
        );
      case 'confirmed':
        return (
          <div className="mt-3">
            <Button size="sm" variant="secondary" className="w-full" onClick={() => store.startPreparing(order.id)}>
              Start Preparing
            </Button>
          </div>
        );
      case 'preparing':
        return (
          <div className="mt-3">
            <Button size="sm" variant="primary" className="w-full" onClick={() => store.markReady(order.id)}>
              Mark Ready
            </Button>
          </div>
        );
      case 'ready':
        return (
          <div className="mt-3">
<Button size="sm" variant="primary" className="w-full" onClick={() => store.completeOrder(order.id)}>
              Complete
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const isPreparing = order.status === 'preparing';

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border bg-white p-4 shadow-soft dark:bg-neutral-800 transition-shadow',
        delayed && isPreparing
          ? 'border-red-300 ring-1 ring-red-200 dark:border-red-700'
          : 'border-neutral-200 dark:border-neutral-700'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={openDetails}
          className="text-left font-bold text-neutral-900 dark:text-white hover:text-primary-600"
        >
          #{order.orderNumber.replace('ORDER', 'ORD')}
        </button>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Meta row */}
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        {order.tableNumber && <span>Table {order.tableNumber}</span>}
        <span className="uppercase">{orderTypeLabel[order.orderType]}</span>
        <span>{getRelativeTime(order.createdAt)}</span>
        {order.status !== 'new' && <span>- {elapsed} min elapsed</span>}
      </div>

      {/* Priority */}
      <div className="mt-2 flex items-center gap-2">
        <PriorityBadge priority={order.priority} />
        {delayed && isPreparing && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Delayed
          </span>
        )}
      </div>

      {/* Items */}
      <div className="mt-3 flex-1">
        <OrderItemList items={order.items} />
      </div>

      {/* Timer for preparing */}
      {isPreparing && (
        <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-700">
          <OrderTimer order={order} />
        </div>
      )}

      {/* Actions */}
      {renderActions()}
    </div>
  );
}
