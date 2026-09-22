import type { KitchenOrderItem } from '@/types/kitchen';

interface Props {
  items: KitchenOrderItem[];
  showVariants?: boolean;
  showAddons?: boolean;
}

/**
 * Displays a list of order items with quantity, variants, add-ons
 * and per-item special instructions.
 */
export default function OrderItemList({
  items,
  showVariants = true,
  showAddons = true,
}: Props) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 dark:border-neutral-700/80 dark:bg-neutral-900/80 shadow-xs"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-primary-100 px-1.5 text-xs font-black text-primary-700 dark:bg-primary-950 dark:text-primary-300 mr-1.5">
                {item.quantity}x
              </span>
              {item.name}
            </span>
            <span className="shrink-0 text-[11px] font-semibold text-neutral-400">~{item.prepTimeMin}m</span>
          </div>

          {showVariants && item.variants && item.variants.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {item.variants.map((v, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60"
                >
                  {v}
                </span>
              ))}
            </div>
          )}

          {showAddons && item.addons && item.addons.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.addons.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                >
                  + {a}
                </span>
              ))}
            </div>
          )}

          {item.specialInstructions && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-amber-50 px-2 py-1 text-xs font-black text-amber-900 dark:from-amber-950/70 dark:to-amber-900/50 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800">
              <span className="text-xs">🌶️</span>
              <span>{item.specialInstructions}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
