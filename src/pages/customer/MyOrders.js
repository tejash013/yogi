import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { OrderCard } from '@/components/customer';
import { ROUTES } from '@/constants';
import ordersData from '@/data/orders.json';
const orders = ordersData;
export default function MyOrders() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [trackNumber, setTrackNumber] = useState('');
    const [filter, setFilter] = useState('all');
    const handleTrack = (e) => {
        e.preventDefault();
        const value = trackNumber.trim();
        if (!value)
            return;
        navigate(ROUTES.CUSTOMER.ORDER_TRACKING.replace(':orderId', value));
    };
    const filteredOrders = orders.filter((order) => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            order.items.some((item) => item.name.toLowerCase().includes(search.toLowerCase()));
        const matchesFilter = filter === 'all' ||
            (filter === 'current' && !['completed', 'cancelled'].includes(order.status)) ||
            (filter === 'previous' && ['completed', 'cancelled'].includes(order.status));
        return matchesSearch && matchesFilter;
    });
    const handleRepeatOrder = (order) => {
        alert(`Repeating order ${order.orderNumber} - items added to cart!`);
    };
    const handleInvoice = (order) => {
        alert(`Invoice for ${order.orderNumber} generated!`);
    };
    if (orders.length === 0) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx("div", { className: "mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700", children: _jsx("svg", { className: "h-12 w-12 text-neutral-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) }) }), _jsx("h2", { className: "mb-2 text-xl font-bold text-neutral-900 dark:text-white", children: "No orders yet" }), _jsx("p", { className: "mb-6 text-sm text-neutral-500", children: "Your order history will appear here" }), _jsx(Link, { to: ROUTES.CUSTOMER.MENU, children: _jsx(Button, { size: "lg", children: "Start Ordering" }) })] }));
    }
    return (_jsxs("div", { className: "space-y-6 pb-8", children: [_jsx("h1", { className: "text-xl font-bold text-neutral-900 dark:text-white", children: "My Orders" }), _jsxs("form", { onSubmit: handleTrack, className: "flex flex-col gap-2 rounded-xl border border-primary-200 bg-primary-50/60 p-3 dark:border-primary-800 dark:bg-primary-900/10 sm:flex-row sm:items-center", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("svg", { className: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", value: trackNumber, onChange: (e) => setTrackNumber(e.target.value), placeholder: "Enter order number e.g. ORD-NWBB78", className: "w-full rounded-lg border border-primary-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-primary-700 dark:bg-neutral-800" })] }), _jsxs(Button, { type: "submit", size: "md", variant: "primary", children: [_jsx("svg", { className: "mr-1.5 h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }), "Track"] })] }), _jsxs("div", { className: "relative", children: [_jsx("svg", { className: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search orders...", className: "w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800" })] }), _jsx("div", { className: "flex gap-2", children: ['all', 'current', 'previous'].map((f) => (_jsxs("button", { onClick: () => setFilter(f), className: `rounded-full px-4 py-2 text-sm font-medium transition-all ${filter === f
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}`, children: [f.charAt(0).toUpperCase() + f.slice(1), f === 'current' && ` (${orders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length})`] }, f))) }), filteredOrders.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx("span", { className: "mb-3 text-4xl", children: "\uD83D\uDCCB" }), _jsx("p", { className: "text-sm text-neutral-500", children: "No orders match your search" })] })) : (_jsx("div", { className: "space-y-4", children: filteredOrders.map((order) => (_jsx(OrderCard, { id: order.id, orderNumber: order.orderNumber, status: order.status, items: order.items.map((i) => ({ name: i.name, quantity: i.quantity })), total: order.total, createdAt: order.createdAt, isCurrent: !['completed', 'cancelled'].includes(order.status), onRepeatOrder: () => handleRepeatOrder(order), onInvoice: () => handleInvoice(order) }, order.id))) }))] }));
}
