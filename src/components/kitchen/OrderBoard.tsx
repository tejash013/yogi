import type { KitchenOrder } from '@/types/kitchen';
import OrderCard from './OrderCard';

interface ColumnConfig {
  key: string;
  label: string;
  orders: KitchenOrder[];
  accent: string;
}

interface Props {
  columns: ColumnConfig[];
  onOpenOrder?: (id: string) => void;
}

/**
 * Multi-column order board used on the Live Orders screen.
 * On desktop shows all columns side-by-side, on tablet 2 columns,
 * on mobile a single column stack.
 */
export default function OrderBoard({ columns, onOpenOrder }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => (
        <div key={column.key} className="flex flex-col rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${column.accent}`} />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-200">
                {column.label}
              </h3>
            </div>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-neutral-700 shadow-sm dark:bg-neutral-800 dark:text-neutral-200">
              {column.orders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {column.orders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400 dark:border-neutral-600">
                No {column.label.toLowerCase()} orders
              </div>
            ) : (
              column.orders.map((order) => (
                <OrderCard key={order.id} order={order} onOpen={onOpenOrder} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
