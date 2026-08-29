import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { Card, Button, EmptyState } from '@/components/ui';
import { OrderStatusBadge, PriorityBadge, OrderItemList, OrderDetails, } from '@/components/kitchen';
import { useKitchenStore, getWaitingMinutes } from '@/store';
const formatWaiting = (minutes) => `${Math.floor(minutes / 60)}h ${(minutes % 60).toString().padStart(2, '0')}m`;
const READY_WARNING_MIN = 10;
/**
 * Ready page: shows orders whose food is ready, with waiting-time
 * warnings when food has been sitting too long.
 */
export default function Ready() {
    const orders = useKitchenStore((s) => s.orders);
    const activeOrderId = useKitchenStore((s) => s.activeOrderId);
    const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);
    const readyOrders = useMemo(() => orders.filter((o) => o.status === 'ready'), [orders]);
    const activeOrder = activeOrderId
        ? orders.find((o) => o.id === activeOrderId) ?? null
        : null;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Ready to Serve", description: "Orders whose food is ready for pickup or delivery" }), readyOrders.length === 0 ? (_jsx(EmptyState, { title: "No ready orders", description: "Prepared orders will appear here once marked ready." })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: readyOrders.map((order) => {
                    const waiting = getWaitingMinutes(order);
                    const longWait = waiting >= READY_WARNING_MIN;
                    return (_jsxs(Card, { className: longWait ? 'border-yellow-300 ring-1 ring-yellow-200 dark:border-yellow-700' : '', children: [_jsxs("div", { className: "mb-3 flex items-start justify-between gap-2", children: [_jsxs("button", { onClick: () => setActiveOrder(order.id), className: "text-left font-bold text-neutral-900 hover:text-primary-600 dark:text-white", children: ["#", order.orderNumber] }), _jsx(OrderStatusBadge, { status: order.status })] }), _jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400", children: [order.tableNumber && _jsxs("span", { children: ["Table ", order.tableNumber] }), _jsx("span", { className: "uppercase", children: order.orderType }), _jsx(PriorityBadge, { priority: order.priority })] }), _jsx("div", { className: "mb-3", children: _jsx(OrderItemList, { items: order.items }) }), _jsxs("div", { className: "mb-3 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900", children: [_jsxs("p", { className: "text-sm text-neutral-600 dark:text-neutral-300", children: ["Waiting: ", _jsx("span", { className: "font-semibold text-neutral-900 dark:text-white", children: formatWaiting(waiting) })] }), longWait && (_jsxs("p", { className: "mt-1 rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", children: ["\u26A0 Food waiting for ", waiting, " min \u2014 may need to be remade"] }))] }), _jsx(Button, { variant: "primary", className: "w-full", onClick: () => useKitchenStore.getState().completeOrder(order.id), children: "Complete Order" })] }, order.id));
                }) })), _jsx(OrderDetails, { order: activeOrder, onClose: () => setActiveOrder(null) })] }));
}
