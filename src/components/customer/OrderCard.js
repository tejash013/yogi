import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/components/ui';
import { ROUTES } from '@/constants';
import { formatDate, formatCurrency } from '@/utils';
const statusConfig = {
    pending: { label: 'Pending', variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'primary' },
    preparing: { label: 'Preparing', variant: 'primary' },
    ready: { label: 'Ready', variant: 'success' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'neutral' },
};
export default function OrderCard({ id, orderNumber, status, items, total, createdAt, isCurrent = false, onRepeatOrder, onInvoice, }) {
    const config = statusConfig[status] || { label: status, variant: 'neutral' };
    return (_jsx(Link, { to: ROUTES.CUSTOMER.ORDER_TRACKING.replace(':orderId', id), children: _jsxs(Card, { hover: true, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "mb-1 flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-neutral-900 dark:text-white", children: orderNumber }), _jsx(Badge, { variant: config.variant, size: "sm", children: config.label })] }), _jsx("p", { className: "text-sm text-neutral-500", children: formatDate(createdAt) }), _jsx("div", { className: "mt-2", children: items.map((item, idx) => (_jsxs("span", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: [item.name, " x", item.quantity, idx < items.length - 1 && ', '] }, idx))) })] }), _jsx("div", { className: "flex flex-col items-end gap-2", children: _jsx("span", { className: "text-lg font-bold text-primary-500", children: formatCurrency(total) }) })] }), (onRepeatOrder || onInvoice) && (_jsxs("div", { className: "mt-4 flex gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-700", children: [onRepeatOrder && (_jsxs(Button, { size: "sm", variant: "outline", onClick: (e) => { e.preventDefault(); onRepeatOrder(); }, children: [_jsx("svg", { className: "mr-1 h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), "Repeat Order"] })), onInvoice && (_jsxs(Button, { size: "sm", variant: "ghost", onClick: (e) => { e.preventDefault(); onInvoice(); }, children: [_jsx("svg", { className: "mr-1 h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), "Invoice"] }))] }))] }) }));
}
