import { useMemo, useState } from 'react';
import type { CashierOrder } from '@/types/cashier';
import { ORDER_TYPE_LABELS } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';
import { getRelativeTime } from '@/utils';
import { cn } from '@/utils';
import Search from '@/components/ui/Search';
import PaymentStatusBadge from './PaymentStatusBadge';

interface Props {
  orders: CashierOrder[];
  onSelect: (orderId: string) => void;
}

interface Filters {
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  unpaid: boolean;
  paid: boolean;
}

const defaultFilters: Filters = { dineIn: false, takeaway: false, delivery: false, unpaid: true, paid: false };

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary-500 bg-primary-500 text-white'
          : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800'
      )}
    >
      {label}
    </button>
  );
}

export default function OrderList({ orders, onSelect }: Props) {
  const query = useCashierStore((s) => s.orders);
  const selectedOrderId = useCashierStore((s) => s.selectedOrderId);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const searchableOrders = query.length > 0 ? query : orders;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return searchableOrders
      .filter((o) => {
        if (q) {
          const customerName = o.customer.name.toLowerCase();
          const phone = o.customer.phone.toLowerCase();
          const table = o.tableNumber ? String(o.tableNumber) : '';
          const orderNum = o.orderNumber.toLowerCase();
          const hit =
            customerName.includes(q) ||
            phone.includes(q) ||
            table.includes(q) ||
            orderNum.includes(q);
          if (!hit) return false;
        }
        if (filters.dineIn && o.orderType !== 'dine-in') return false;
        if (filters.takeaway && o.orderType !== 'takeaway') return false;
        if (filters.delivery && o.orderType !== 'delivery') return false;
        if (filters.unpaid && o.paymentStatus !== 'unpaid' && o.paymentStatus !== 'pending' && o.paymentStatus !== 'partially_paid')
          return false;
        if (filters.paid && o.paymentStatus !== 'paid') return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [searchableOrders, search, filters]);

  const toggle = (key: keyof Filters) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Active Orders</h3>
        <button
          type="button"
          onClick={() => useCashierStore.getState().createNewBill()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-primary-600"
        >
          + New Bill
        </button>
      </div>

      <Search
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        placeholder="Search orders, tables, customers..."
        className="max-w-none"
      />
      <div className="flex flex-wrap gap-2">
        <FilterChip label="Dine In" active={filters.dineIn} onClick={() => toggle('dineIn')} />
        <FilterChip label="Takeaway" active={filters.takeaway} onClick={() => toggle('takeaway')} />
        <FilterChip label="Delivery" active={filters.delivery} onClick={() => toggle('delivery')} />
        <FilterChip label="Unpaid" active={filters.unpaid} onClick={() => toggle('unpaid')} />
        <FilterChip label="Paid" active={filters.paid} onClick={() => toggle('paid')} />
      </div>

      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-600">
            No orders match your search.
          </div>
        )}
        {filtered.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className={cn(
              'block w-full rounded-xl border p-3 text-left transition-colors',
              selectedOrderId === o.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-neutral-200 bg-white hover:border-primary-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-primary-700'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-neutral-900 dark:text-white">{o.orderNumber}</span>
              <span className="text-xs text-neutral-400">{getRelativeTime(o.createdAt)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-neutral-600 dark:text-neutral-300">
                {o.customer.name}
                {o.tableNumber ? ` · Table ${o.tableNumber}` : ''} · {ORDER_TYPE_LABELS[o.orderType]}
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white">{formatINR(o.total)}</span>
            </div>
            <div className="mt-2">
              <PaymentStatusBadge status={o.paymentStatus} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
