import { cn, getRelativeTime, extractChefInstructions } from '@/utils';
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
  const setActiveOrder = useKitchenStore((state) => state.setActiveOrder);
  const acceptOrder = useKitchenStore((state) => state.acceptOrder);
  const rejectOrder = useKitchenStore((state) => state.rejectOrder);
  const startPreparing = useKitchenStore((state) => state.startPreparing);
  const markReady = useKitchenStore((state) => state.markReady);
  const completeOrder = useKitchenStore((state) => state.completeOrder);
  const delayed = isDelayed(order);
  const elapsed = getElapsedMinutes(order);
  const rawInstructions = [
    (order as any).specialInstructions,
    extractChefInstructions(order.notes),
    ...(order.items || []).map((i) => i.specialInstructions).filter(Boolean),
  ].filter(Boolean);
  const combinedInstructions = Array.from(new Set(rawInstructions)).join(' • ');

  const openDetails = () => {
    if (onOpen) onOpen(order.id);
    else setActiveOrder(order.id);
  };

  const renderActions = () => {
    switch (order.status) {
      case 'new':
        return (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="primary"
              className="w-full !bg-green-600 hover:!bg-green-700 font-bold text-white shadow-sm"
              onClick={() => acceptOrder(order.id)}
            >
              ✓ Confirm Order
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="w-full font-semibold"
              onClick={() => rejectOrder(order.id)}
            >
              ✕ Reject
            </Button>
          </div>
        );
      case 'confirmed':
        return (
          <div className="mt-3">
            <Button
              size="sm"
              variant="primary"
              className="w-full !bg-blue-600 hover:!bg-blue-700 font-bold text-white shadow-sm"
              onClick={() => startPreparing(order.id)}
            >
              🔥 Start Preparing
            </Button>
          </div>
        );
      case 'preparing':
        return (
          <div className="mt-3">
            <Button
              size="sm"
              variant="primary"
              className="w-full !bg-amber-500 hover:!bg-amber-600 font-bold text-white shadow-sm"
              onClick={() => markReady(order.id)}
            >
              🔔 Mark Ready for Pickup
            </Button>
          </div>
        );
      case 'ready':
        return (
          <div className="mt-3">
            <Button
              size="sm"
              variant="primary"
              className="w-full !bg-green-600 hover:!bg-green-700 font-bold text-white shadow-sm"
              onClick={() => completeOrder(order.id)}
            >
              ✓ Complete Order
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const isPreparing = order.status === 'preparing';

  const customerInfo = (() => {
    const o = order as any;
    let name = o.customerName || o.customer?.name || (o.user ? `${o.user.firstName ?? ''} ${o.user.lastName ?? ''}`.trim() : '');
    let phone = o.customerPhone || o.customer?.phone || o.user?.phone || '';

    if (o.notes && typeof o.notes === 'string') {
      const custMatch = o.notes.match(/Customer:\s*([^|]+)/i);
      if (custMatch && custMatch[1]) name = custMatch[1].trim();
      const phoneMatch = o.notes.match(/Phone:\s*([^|]+)/i);
      if (phoneMatch && phoneMatch[1]) phone = phoneMatch[1].trim();
    }

    return {
      name: name || 'Guest Customer',
      phone: phone || null,
    };
  })();

  const formattedTable = (() => {
    if (!order.tableNumber) return null;
    if (typeof order.tableNumber === 'object') {
      return (order.tableNumber as any).label || ((order.tableNumber as any).number ? `Table ${(order.tableNumber as any).number}` : null);
    }
    return `Table ${order.tableNumber}`;
  })();

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

      {/* Customer & Order Context Badge Card */}
      <div className="mt-2.5 rounded-xl border border-indigo-200 bg-indigo-50/90 p-2.5 dark:border-indigo-900/60 dark:bg-indigo-950/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-black text-xs text-indigo-950 dark:text-indigo-100">
            <span className="text-base">👤</span>
            <span>{customerInfo.name}</span>
            {customerInfo.phone && (
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                ({customerInfo.phone})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {formattedTable && (
              <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-[11px] font-black text-white shadow-xs">
                🪑 {formattedTable}
              </span>
            )}
            <span className="rounded-lg bg-indigo-600 px-2 py-0.5 text-[11px] font-black text-white uppercase shadow-xs">
              {orderTypeLabel[order.orderType] || order.orderType}
            </span>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        <span>Received: {getRelativeTime(order.createdAt)}</span>
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

      {/* Chef Instruction Banner */}
      {combinedInstructions && (
        <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border-2 border-amber-400 bg-amber-50 p-3 text-xs font-bold text-amber-950 dark:border-amber-600 dark:bg-amber-950/80 dark:text-amber-100 shadow-md">
          <span className="text-xl shrink-0">👨‍🍳 🌶️</span>
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
              SPECIAL INSTRUCTION / CHEF DESCRIPTION
            </span>
            <span className="text-sm font-black text-amber-950 dark:text-amber-50 break-words leading-relaxed">
              {combinedInstructions}
            </span>
          </div>
        </div>
      )}

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
