import type { KitchenOrderItem } from '@/types/kitchen';
import { cn } from '@/utils';

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
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {item.quantity} × {item.name}
            </span>
            <span className="shrink-0 text-xs text-neutral-400">~{item.prepTimeMin}m</span>
          </div>

          {showVariants && item.variants && item.variants.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {item.variants.map((v, i) => (
                <p key={i} className="text-xs text-neutral-500 dark:text-neutral-400">
                  • {v}
                </p>
              ))}
            </div>
          )}

          {showAddons && item.addons && item.addons.length > 0 && (
            <div className="mt-0.5 space-y-0.5">
              {item.addons.map((a, i) => (
                <p key={i} className="text-xs text-secondary-600 dark:text-secondary-400">
                  + {a}
                </p>
              ))}
            </div>
          )}

          {item.specialInstructions && (
            <p
              className={cn(
                'mt-1 rounded bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              )}
            >
              📝 {item.specialInstructions}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
