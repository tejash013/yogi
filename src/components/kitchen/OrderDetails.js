import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatDateTime } from '@/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useKitchenStore, getTotalPrepMinutes } from '@/store';
import OrderStatusBadge from './OrderStatusBadge';
import PriorityBadge from './PriorityBadge';
import OrderItemList from './OrderItemList';
const orderTypeLabel = {
    'dine-in': 'Dine In',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
};
const priorityOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];
/**
 * Detailed order modal. Shows full order info and allows priority changes.
 * Used across kitchen pages.
 */
export default function OrderDetails({ order, onClose }) {
    const updatePriority = useKitchenStore((s) => s.updatePriority);
    if (!order)
        return null;
    return (_jsx(Modal, { isOpen: !!order, onClose: onClose, title: `Order #${order.orderNumber}`, size: "lg", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx(OrderStatusBadge, { status: order.status, size: "md" }), _jsx(PriorityBadge, { priority: order.priority, size: "md" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900", children: [_jsxs("div", { children: [_jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "Customer" }), _jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: order.customerName || 'Walk-in' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "Table" }), _jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: order.tableNumber ? `Table ${order.tableNumber}` : '—' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "Order Type" }), _jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: orderTypeLabel[order.orderType] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "Ordered At" }), _jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: formatDateTime(order.createdAt) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "Expected Prep" }), _jsxs("p", { className: "font-medium text-neutral-900 dark:text-white", children: [order.expectedPrepTimeMin, " min"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-neutral-500 dark:text-neutral-400", children: "Total Prep Time" }), _jsxs("p", { className: "font-medium text-neutral-900 dark:text-white", children: [getTotalPrepMinutes(order), " min"] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200", children: "Items" }), _jsx(OrderItemList, { items: order.items })] }), order.notes && (_jsxs("div", { className: "rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", children: [_jsx("strong", { children: "Notes:" }), " ", order.notes] })), _jsxs("div", { className: "border-t border-neutral-200 pt-4 dark:border-neutral-700", children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: "Change Priority" }), _jsx(Select, { options: priorityOptions, value: order.priority, onChange: (e) => updatePriority(order.id, e.target.value) })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) })] }) }));
}
