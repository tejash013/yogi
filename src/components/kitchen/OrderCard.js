import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn, getRelativeTime } from '@/utils';
import Button from '@/components/ui/Button';
import { useKitchenStore, getElapsedMinutes, isDelayed } from '@/store';
import OrderStatusBadge from './OrderStatusBadge';
import PriorityBadge from './PriorityBadge';
import OrderItemList from './OrderItemList';
import OrderTimer from './OrderTimer';
const orderTypeLabel = {
    'dine-in': 'Dine In',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
};
/**
 * A single kitchen order card. Displays all relevant order information and
 * context-aware action buttons depending on the current order status.
 */
export default function OrderCard({ order, onOpen }) {
    const store = useKitchenStore();
    const delayed = isDelayed(order);
    const elapsed = getElapsedMinutes(order);
    const openDetails = () => {
        if (onOpen)
            onOpen(order.id);
        else
            store.setActiveOrder(order.id);
    };
    const renderActions = () => {
        switch (order.status) {
            case 'new':
                return (_jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2", children: [_jsx(Button, { size: "sm", variant: "primary", className: "w-full", onClick: () => store.acceptOrder(order.id), children: "Accept Order" }), _jsx(Button, { size: "sm", variant: "danger", className: "w-full", onClick: () => store.rejectOrder(order.id), children: "Reject" })] }));
            case 'confirmed':
                return (_jsx("div", { className: "mt-3", children: _jsx(Button, { size: "sm", variant: "secondary", className: "w-full", onClick: () => store.startPreparing(order.id), children: "Start Preparing" }) }));
            case 'preparing':
                return (_jsx("div", { className: "mt-3", children: _jsx(Button, { size: "sm", variant: "primary", className: "w-full", onClick: () => store.markReady(order.id), children: "Mark Ready" }) }));
            case 'ready':
                return (_jsx("div", { className: "mt-3", children: _jsx(Button, { size: "sm", variant: "primary", className: "w-full", onClick: () => store.completeOrder(order.id), children: "Complete" }) }));
            default:
                return null;
        }
    };
    const isPreparing = order.status === 'preparing';
    return (_jsxs("div", { className: cn('flex flex-col rounded-xl border bg-white p-4 shadow-soft dark:bg-neutral-800 transition-shadow', delayed && isPreparing
            ? 'border-red-300 ring-1 ring-red-200 dark:border-red-700'
            : 'border-neutral-200 dark:border-neutral-700'), children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("button", { onClick: openDetails, className: "text-left font-bold text-neutral-900 dark:text-white hover:text-primary-600", children: ["#", order.orderNumber.replace('ORDER', 'ORD')] }), _jsx(OrderStatusBadge, { status: order.status })] }), _jsxs("div", { className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400", children: [order.tableNumber && _jsxs("span", { children: ["Table ", order.tableNumber] }), _jsx("span", { className: "uppercase", children: orderTypeLabel[order.orderType] }), _jsx("span", { children: getRelativeTime(order.createdAt) }), order.status !== 'new' && _jsxs("span", { children: ["- ", elapsed, " min elapsed"] })] }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx(PriorityBadge, { priority: order.priority }), delayed && isPreparing && (_jsx("span", { className: "rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300", children: "Delayed" }))] }), _jsx("div", { className: "mt-3 flex-1", children: _jsx(OrderItemList, { items: order.items }) }), isPreparing && (_jsx("div", { className: "mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-700", children: _jsx(OrderTimer, { order: order }) })), renderActions()] }));
}
