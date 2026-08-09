import type { CashierOrderItem } from '@/types/cashier';
import { formatINR, useCashierStore } from '@/store';

interface Props {
  item: CashierOrderItem;
}

export default function BillItem({ item }: Props) {
  const updateQuantity = useCashierStore((s) => s.updateQuantity);
  const removeBillItem = useCashierStore((s) => s.removeBillItem);

  return (
    <div className="flex items-start gap-3 border-b border-neutral-100 py-3 last:border-0 dark:border-neutral-700">
      <img
        src={item.image}
        alt={item.name}
        className="h-14 w-14 shrink-0 rounded-lg bg-neutral-100 object-cover dark:bg-neutral-700"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">{item.name}</p>
            {item.variant && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.variant}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeBillItem(item.id)}
            className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            aria-label={`Remove ${item.name}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {item.addons.length > 0 && (
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Add-ons: {item.addons.join(', ')}
          </p>
        )}
        {item.specialInstructions && (
          <p className="mt-0.5 text-xs italic text-amber-600 dark:text-amber-500">
            Note: {item.specialInstructions}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-600">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, -1)}
              className="px-2.5 py-1 text-base font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-semibold text-neutral-900 dark:text-white">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, 1)}
              className="px-2.5 py-1 text-base font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              aria-label="Increase"
            >
              +
            </button>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatINR(item.unitPrice)} × {item.quantity}
            </p>
            <p className="font-semibold text-neutral-900 dark:text-white">
              {formatINR(item.quantity * item.unitPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
