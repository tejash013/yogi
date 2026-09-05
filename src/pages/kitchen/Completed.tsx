import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/common';
import { Card, EmptyState, Search, Select, Pagination } from '@/components/ui';
import {
  OrderStatusBadge,
  PriorityBadge,
  OrderItemList,
  OrderDetails,
} from '@/components/kitchen';
import { useKitchenStore, getTotalPrepMinutes } from '@/store';

const PAGE_SIZE = 8;

/**
 * Completed page: searchable, filterable log of completed kitchen orders
 * with pagination.
 */
export default function Completed() {
  const orders = useKitchenStore((s) => s.orders);
  const activeOrderId = useKitchenStore((s) => s.activeOrderId);
  const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);

  // Local filters (search, table, date)
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed'),
    [orders]
  );

  const tables = useMemo(
    () =>
      Array.from(
        new Set(completedOrders.map((o) => o.tableNumber).filter((t): t is number => !!t))
      ).sort((a, b) => a - b),
    [completedOrders]
  );

  const filtered = useMemo(() => {
    return completedOrders.filter((o) => {
      if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase())) return false;
      if (tableFilter !== 'all' && String(o.tableNumber) !== tableFilter) return false;
      if (dateFilter !== 'all') {
        const orderDate = new Date(o.completedAt ?? o.createdAt).toDateString();
        const today = new Date().toDateString();
        if (dateFilter === 'today' && orderDate !== today) return false;
        if (dateFilter === 'week' && Date.now() - new Date(o.completedAt ?? o.createdAt).getTime() > 7 * 86400000) return false;
      }
      return true;
    });
  }, [completedOrders, search, tableFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeOrder = activeOrderId
    ? orders.find((o) => o.id === activeOrderId) ?? null
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Completed Orders"
        description="History of completed kitchen orders"
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
        <Search
          placeholder="Search order number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => {
            setSearch('');
            setPage(1);
          }}
          className="lg:max-w-[220px]"
        />
        <Select
          options={[
            { value: 'all', label: 'All Tables' },
            ...tables.map((t) => ({ value: String(t), label: `Table ${t}` })),
          ]}
          value={tableFilter}
          onChange={(e) => {
            setTableFilter(e.target.value);
            setPage(1);
          }}
          className="lg:w-40"
        />
        <Select
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'Last 7 Days' },
          ]}
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
          className="lg:w-40"
        />
      </div>

      {/* List */}
      {paginated.length === 0 ? (
        <EmptyState
          title="No completed orders found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-3">
          {paginated.map((order) => {
            const prepTime = getTotalPrepMinutes(order);
            return (
              <Card key={order.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    onClick={() => setActiveOrder(order.id)}
                    className="text-left font-bold text-neutral-900 hover:text-primary-600 dark:text-white"
                  >
                    #{order.orderNumber}
                  </button>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PriorityBadge priority={order.priority} />
                  </div>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {order.tableNumber && (
                    <span>
                      {typeof order.tableNumber === 'object'
                        ? ((order.tableNumber as any).label || ((order.tableNumber as any).number ? `Table ${(order.tableNumber as any).number}` : 'Table'))
                        : `Table ${order.tableNumber}`}
                    </span>
                  )}
                  <span className="uppercase">{order.orderType}</span>
                  <span>Started: {formattedDateTimeShort(order.startedAt ?? order.createdAt)}</span>
                  <span>Completed: {formattedDateTimeShort(order.completedAt ?? '')}</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    Prep: {prepTime} min
                  </span>
                </div>

                <div className="mt-3">
                  <OrderItemList items={order.items} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
      />

      <OrderDetails order={activeOrder} onClose={() => setActiveOrder(null)} />
    </div>
  );
}

function formattedDateTimeShort(iso: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}
