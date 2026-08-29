import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import OrderCard from './OrderCard';
/**
 * Multi-column order board used on the Live Orders screen.
 * On desktop shows all columns side-by-side, on tablet 2 columns,
 * on mobile a single column stack.
 */
export default function OrderBoard({ columns, onOpenOrder }) {
    return (_jsx("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4", children: columns.map((column) => (_jsxs("div", { className: "flex flex-col rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between px-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `h-2.5 w-2.5 rounded-full ${column.accent}` }), _jsx("h3", { className: "text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-200", children: column.label })] }), _jsx("span", { className: "flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-neutral-700 shadow-sm dark:bg-neutral-800 dark:text-neutral-200", children: column.orders.length })] }), _jsx("div", { className: "flex-1 space-y-3 overflow-y-auto", children: column.orders.length === 0 ? (_jsxs("div", { className: "rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400 dark:border-neutral-600", children: ["No ", column.label.toLowerCase(), " orders"] })) : (column.orders.map((order) => (_jsx(OrderCard, { order: order, onOpen: onOpenOrder }, order.id)))) })] }, column.key))) }));
}
