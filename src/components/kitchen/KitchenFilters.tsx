import Search from '@/components/ui/Search';
import Select from '@/components/ui/Select';
import { cn } from '@/utils';
import { useKitchenStore } from '@/store';
import type { KitchenStatusFilter, OrderTypeFilter } from '@/store/kitchenStore';

const statusOptions: { value: KitchenStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'high-priority', label: 'High Priority' },
];

const orderTypeOptions: { value: OrderTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'dine-in', label: 'Dine In' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
];

interface Props {
  showStatus?: boolean;
  showSearch?: boolean;
  showTable?: boolean;
  showOrderType?: boolean;
  className?: string;
}

/**
 * Reusable filter bar for kitchen pages.
 * Manages search, status, table and order-type filters via the kitchen store.
 */
export default function KitchenFilters({
  showStatus = true,
  showSearch = true,
  showTable = true,
  showOrderType = true,
  className,
}: Props) {
  const orders = useKitchenStore((state) => state.orders);
  const statusFilter = useKitchenStore((state) => state.statusFilter);
  const searchQuery = useKitchenStore((state) => state.searchQuery);
  const tableFilter = useKitchenStore((state) => state.tableFilter);
  const orderTypeFilter = useKitchenStore((state) => state.orderTypeFilter);
  const setStatusFilter = useKitchenStore((state) => state.setStatusFilter);
  const setSearchQuery = useKitchenStore((state) => state.setSearchQuery);
  const setTableFilter = useKitchenStore((state) => state.setTableFilter);
  const setOrderTypeFilter = useKitchenStore((state) => state.setOrderTypeFilter);

  // Unique table numbers present in the orders.
  const tables = Array.from(
    new Set(orders.map((o) => o.tableNumber).filter((t): t is number => !!t))
  ).sort((a, b) => a - b);

  const tableOptions = [
    { value: 'all', label: 'All Tables' },
    ...tables.map((t) => ({ value: String(t), label: `Table ${t}` })),
  ];

  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap', className)}>
      {showStatus && (
        <div className="flex flex-wrap items-center gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === opt.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {showSearch && (
        <Search
          placeholder="Search order number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          className="lg:max-w-[220px]"
        />
      )}

      {showTable && (
        <Select
          options={tableOptions}
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="lg:w-40"
        />
      )}

      {showOrderType && (
        <Select
          options={orderTypeOptions}
          value={orderTypeFilter}
          onChange={(e) => setOrderTypeFilter(e.target.value as OrderTypeFilter)}
          className="lg:w-40"
        />
      )}
    </div>
  );
}
