import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { Card, Button, EmptyState } from '@/components/ui';
import { OrderStatusBadge, PriorityBadge, OrderItemList, OrderTimer, OrderDetails, } from '@/components/kitchen';
import { useKitchenStore, isDelayed } from '@/store';
/**
 * Preparing page: shows only orders currently being prepared,
 * with a live preparation timer and delay indicators.
 */
export default function Preparing() {
    const orders = useKitchenStore((s) => s.orders);
    const activeOrderId = useKitchenStore((s) => s.activeOrderId);
    const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);
    const preparingOrders = useMemo(() => orders.filter((o) => o.status === 'preparing'), [orders]);
    const activeOrder = activeOrderId
        ? orders.find((o) => o.id === activeOrderId) ?? null
        : null;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Preparing", description: "Orders currently being prepared in the kitchen" }), preparingOrders.length === 0 ? (_jsx(EmptyState, { title: "No orders being prepared", description: "Orders moved here once you start preparing them." })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: preparingOrders.map((order) => {
                    const delayed = isDelayed(order);
                    return (_jsxs(Card, { className: delayed ? 'border-red-300 dark:border-red-700' : '', children: [_jsxs("div", { className: "mb-3 flex items-start justify-between gap-2", children: [_jsxs("button", { onClick: () => setActiveOrder(order.id), className: "text-left font-bold text-neutral-900 hover:text-primary-600 dark:text-white", children: ["#", order.orderNumber] }), _jsx("div", { className: "flex items-center gap-2", children: _jsx(OrderStatusBadge, { status: order.status }) })] }), _jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400", children: [order.tableNumber && _jsxs("span", { children: ["Table ", order.tableNumber] }), _jsx("span", { className: "uppercase", children: order.orderType }), _jsx(PriorityBadge, { priority: order.priority }), delayed && (_jsx("span", { className: "rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300", children: "Delayed" }))] }), _jsx("div", { className: "mb-3", children: _jsx(OrderItemList, { items: order.items }) }), _jsx("div", { className: "rounded-lg border border-neutral-200 p-3 dark:border-neutral-700", children: _jsx(OrderTimer, { order: order }) }), _jsx("div", { className: "mt-3", children: _jsx(Button, { variant: "primary", className: "w-full", onClick: () => useKitchenStore.getState().markReady(order.id), children: "Mark Ready" }) })] }, order.id));
                }) })), _jsx(OrderDetails, { order: activeOrder, onClose: () => setActiveOrder(null) })] }));
}
