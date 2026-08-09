import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { Card, EmptyState } from '@/components/ui';
import { KitchenStatsCard, OrderStatusBadge, PriorityBadge, OrderDetails, } from '@/components/kitchen';
import { useKitchenStore, selectCounts, isDelayed, getTotalPrepMinutes, } from '@/store';
import { getRelativeTime } from '@/utils';
/**
 * Kitchen dashboard: summary cards, live activity and performance metrics.
 */
export default function KitchenDashboard() {
    const orders = useKitchenStore((s) => s.orders);
    const activeOrderId = useKitchenStore((s) => s.activeOrderId);
    const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);
    const counts = useKitchenStore(selectCounts);
    const activeOrders = useMemo(() => orders
        .filter((o) => ['new', 'confirmed', 'preparing', 'ready'].includes(o.status))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 6), [orders]);
    const completedToday = orders.filter((o) => o.status === 'completed').length;
    const preparingOrders = orders.filter((o) => o.status === 'preparing');
    const delayedOrders = preparingOrders.filter((o) => isDelayed(o));
    const avgPrep = useMemo(() => {
        const completed = orders.filter((o) => o.status === 'completed');
        if (completed.length === 0)
            return 0;
        const total = completed.reduce((sum, o) => sum + getTotalPrepMinutes(o), 0);
        return Math.round((total / completed.length) * 10) / 10;
    }, [orders]);
    const onTimeRate = Math.max(0, Math.round(((completedToday - delayedOrders.length) / Math.max(1, completedToday)) * 100));
    const activeOrder = activeOrderId ? orders.find((o) => o.id === activeOrderId) ?? null : null;
    const countsData = [
        { label: 'New Orders', value: counts.new, accent: 'warning' },
        { label: 'Confirmed', value: counts.confirmed, accent: 'info' },
        { label: 'Preparing', value: counts.preparing, accent: 'primary' },
        { label: 'Ready', value: counts.ready, accent: 'success' },
        { label: 'Completed Today', value: completedToday, accent: 'neutral' },
        { label: 'Avg Prep Time', value: `${avgPrep}m`, accent: 'info' },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Kitchen Dashboard", description: "Overview of kitchen operations and performance" }), _jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6", children: countsData.map((s) => (_jsx(KitchenStatsCard, { label: s.label, value: s.value, accent: s.accent }, s.label))) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-white", children: "Live Kitchen Activity" }), activeOrders.length === 0 ? (_jsx(EmptyState, { title: "No active orders", description: "New orders will appear here." })) : (_jsx("div", { className: "space-y-3", children: activeOrders.map((order) => (_jsxs("button", { onClick: () => setActiveOrder(order.id), className: "block w-full rounded-xl border border-neutral-200 p-4 text-left transition-colors hover:border-primary-300 dark:border-neutral-700 dark:hover:border-primary-700", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-bold text-neutral-900 dark:text-white", children: ["#", order.orderNumber] }), _jsx(OrderStatusBadge, { status: order.status }), _jsx(PriorityBadge, { priority: order.priority })] }), _jsx("span", { className: "text-xs text-neutral-400", children: getRelativeTime(order.createdAt) })] }), _jsxs("div", { className: "mt-1 text-sm text-neutral-500 dark:text-neutral-400", children: [order.tableNumber ? `Table ${order.tableNumber} · ` : '', _jsx("span", { className: "capitalize", children: order.orderType }), " \u00B7 ", ' ', order.items.reduce((s, i) => s + i.quantity, 0), " items"] })] }, order.id))) }))] }) }), _jsxs(Card, { children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-white", children: "Kitchen Performance" }), _jsxs("div", { className: "space-y-4", children: [_jsx(MetricRow, { label: "Orders Completed Today", value: String(completedToday) }), _jsx(MetricRow, { label: "Average Prep Time", value: `${avgPrep} min` }), _jsx(MetricRow, { label: "Delayed Orders", value: String(delayedOrders.length), accent: "error" }), _jsx(MetricRow, { label: "On-Time Completion", value: `${onTimeRate}%`, accent: "success" })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "mb-1 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-neutral-500 dark:text-neutral-400", children: "On-Time Rate" }), _jsxs("span", { className: "font-medium text-neutral-900 dark:text-white", children: [onTimeRate, "%"] })] }), _jsx("div", { className: "h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700", children: _jsx("div", { className: "h-full rounded-full bg-green-500", style: { width: `${onTimeRate}%` } }) })] })] })] }), _jsx(OrderDetails, { order: activeOrder, onClose: () => setActiveOrder(null) })] }));
}
function MetricRow({ label, value, accent = 'neutral', }) {
    const color = accent === 'error'
        ? 'text-error'
        : accent === 'success'
            ? 'text-green-600 dark:text-green-400'
            : 'text-neutral-900 dark:text-white';
    return (_jsxs("div", { className: "flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0 dark:border-neutral-700", children: [_jsx("span", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: label }), _jsx("span", { className: `text-lg font-bold ${color}`, children: value })] }));
}
