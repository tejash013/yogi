import { formatDateTime } from '@/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import type { KitchenOrder, OrderPriority } from '@/types/kitchen';
import { useKitchenStore, getTotalPrepMinutes } from '@/store';
import OrderStatusBadge from './OrderStatusBadge';
import PriorityBadge from './PriorityBadge';
import OrderItemList from './OrderItemList';

interface Props {
  order: KitchenOrder | null;
  onClose: () => void;
}

const orderTypeLabel: Record<string, string> = {
  'dine-in': 'Dine In',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

const priorityOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

/**
 * Detailed order modal. Shows full order info and allows priority changes.
 * Used across kitchen pages.
 */
export default function OrderDetails({ order, onClose }: Props) {
  const updatePriority = useKitchenStore((s) => s.updatePriority);

  if (!order) return null;

  return (
    <Modal isOpen={!!order} onClose={onClose} title={`Order #${order.orderNumber}`} size="lg">
      <div className="space-y-4">
        {/* Header info */}
        <div className="flex flex-wrap items-center gap-3">
          <OrderStatusBadge status={order.status} size="md" />
          <PriorityBadge priority={order.priority} size="md" />
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Customer</p>
            <p className="font-medium text-neutral-900 dark:text-white">
              {order.customerName || 'Walk-in'}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Table</p>
            <p className="font-medium text-neutral-900 dark:text-white">
              {order.tableNumber ? `Table ${order.tableNumber}` : '—'}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Order Type</p>
            <p className="font-medium text-neutral-900 dark:text-white">
              {orderTypeLabel[order.orderType]}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Ordered At</p>
            <p className="font-medium text-neutral-900 dark:text-white">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Expected Prep</p>
            <p className="font-medium text-neutral-900 dark:text-white">
              {order.expectedPrepTimeMin} min
            </p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Total Prep Time</p>
            <p className="font-medium text-neutral-900 dark:text-white">
              {getTotalPrepMinutes(order)} min
            </p>
          </div>
        </div>

        {/* Items */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Items
          </h4>
          <OrderItemList items={order.items} />
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <strong>Notes:</strong> {order.notes}
          </div>
        )}

        {/* Priority change */}
        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Change Priority
          </label>
          <Select
            options={priorityOptions}
            value={order.priority}
            onChange={(e) => updatePriority(order.id, e.target.value as OrderPriority)}
          />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
</Modal>
  );
}
