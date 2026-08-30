import { useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { OrderBoard, OrderDetails, KitchenFilters } from '@/components/kitchen';
import { useKitchenStore, isDelayed } from '@/store';

/**
 * Live Orders board: multi-column view of NEW / CONFIRMED / PREPARING / READY
 * orders with working status-transition actions.
 */
export default function LiveOrders() {
  const orders = useKitchenStore((s) => s.orders);
  const statusFilter = useKitchenStore((s) => s.statusFilter);
  const searchQuery = useKitchenStore((s) => s.searchQuery);
  const tableFilter = useKitchenStore((s) => s.tableFilter);
  const orderTypeFilter = useKitchenStore((s) => s.orderTypeFilter);
  const activeOrderId = useKitchenStore((s) => s.activeOrderId);
  const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Only show active statuses on the board
      if (!['new', 'confirmed', 'preparing', 'ready'].includes(o.status)) return false;

      // Status filter
      if (statusFilter === 'delayed' && !(o.status === 'preparing' && isDelayed(o))) return false;
      if (statusFilter === 'high-priority' && o.priority === 'normal') return false;
      if (['new', 'confirmed', 'preparing', 'ready'].includes(statusFilter) && o.status !== statusFilter) return false;

      // Search
      if (searchQuery && !o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Table filter
      if (tableFilter !== 'all' && String(o.tableNumber) !== tableFilter) return false;

      // Order type filter
      if (orderTypeFilter !== 'all' && o.orderType !== orderTypeFilter) return false;

      return true;
    });
  }, [orders, statusFilter, searchQuery, tableFilter, orderTypeFilter]);

  const columns = [
    {
      key: 'new',
      label: 'New',
      accent: 'bg-yellow-500',
      orders: filtered.filter((o) => o.status === 'new'),
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      accent: 'bg-blue-500',
      orders: filtered.filter((o) => o.status === 'confirmed'),
    },
    {
      key: 'preparing',
      label: 'Preparing',
      accent: 'bg-primary-500',
      orders: filtered.filter((o) => o.status === 'preparing'),
    },
    {
      key: 'ready',
      label: 'Ready',
      accent: 'bg-green-500',
      orders: filtered.filter((o) => o.status === 'ready'),
    },
  ];

  const activeOrder = activeOrderId
    ? orders.find((o) => o.id === activeOrderId) ?? null
    : null;

  const fetchOrders = useKitchenStore((s) => s.fetchOrders);
  const isLoading = useKitchenStore((s) => s.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Orders"
        description="Real-time order board — accept, prepare and complete orders"
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

      <KitchenFilters />

      <OrderBoard columns={columns} onOpenOrder={setActiveOrder} />

      <OrderDetails order={activeOrder} onClose={() => setActiveOrder(null)} />
</div>
  );
}
