import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/utils';
/**
 * Displays a list of order items with quantity, variants, add-ons
 * and per-item special instructions.
 */
export default function OrderItemList({ items, showVariants = true, showAddons = true, }) {
    return (_jsx("ul", { className: "space-y-2", children: items.map((item) => (_jsxs("li", { className: "rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("span", { className: "text-sm font-medium text-neutral-800 dark:text-neutral-100", children: [item.quantity, " \u00D7 ", item.name] }), _jsxs("span", { className: "shrink-0 text-xs text-neutral-400", children: ["~", item.prepTimeMin, "m"] })] }), showVariants && item.variants && item.variants.length > 0 && (_jsx("div", { className: "mt-1 space-y-0.5", children: item.variants.map((v, i) => (_jsxs("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: ["\u2022 ", v] }, i))) })), showAddons && item.addons && item.addons.length > 0 && (_jsx("div", { className: "mt-0.5 space-y-0.5", children: item.addons.map((a, i) => (_jsxs("p", { className: "text-xs text-secondary-600 dark:text-secondary-400", children: ["+ ", a] }, i))) })), item.specialInstructions && (_jsxs("p", { className: cn('mt-1 rounded bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'), children: ["\uD83D\uDCDD ", item.specialInstructions] }))] }, item.id))) }));
}
