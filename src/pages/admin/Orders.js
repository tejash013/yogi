import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, Badge, Table, Button, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
const data = [
    { order: 'ORD-001', customer: 'John Doe', table: 5, items: 3, total: 38.85, status: 'Preparing' },
    { order: 'ORD-002', customer: 'Jane Smith', table: 3, items: 2, total: 41.41, status: 'Completed' },
    { order: 'ORD-003', customer: 'Mike Johnson', table: 8, items: 4, total: 25.89, status: 'Pending' },
];
const statusColors = {
    pending: 'warning',
    confirmed: 'primary',
    preparing: 'primary',
    ready: 'success',
    completed: 'success',
};
const statusOptions = ['All', 'Pending', 'Preparing', 'Completed'];
const columns = [
    { key: 'order', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'table', header: 'Table' },
    { key: 'items', header: 'Items' },
    { key: 'total', header: 'Total', render: (item) => `₹${item.total.toFixed(2)}` },
    {
        key: 'status',
        header: 'Status',
        render: (item) => (_jsx(Badge, { variant: statusColors[item.status.toLowerCase()] || 'neutral', size: "sm", children: item.status })),
    },
];
export default function AdminOrders() {
    const [statusFilter, setStatusFilter] = useState('All');
    const [search, setSearch] = useState('');
    const filteredOrders = useMemo(() => data.filter((order) => {
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        const matchesSearch = order.order.toLowerCase().includes(search.toLowerCase()) ||
            order.customer.toLowerCase().includes(search.toLowerCase()) ||
            order.status.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    }), [statusFilter, search]);
    const orderCount = filteredOrders.length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Orders", description: "Track live order progress and manage kitchen flow", actions: _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [_jsx(Search, { placeholder: "Search orders..." }), _jsx(Button, { variant: "outline", children: "Filter" })] }) }), _jsx("div", { className: "grid gap-4 xl:grid-cols-3", children: statusOptions.map((status) => {
                    const matchingCount = status === 'All'
                        ? data.length
                        : data.filter((order) => order.status === status).length;
                    return (_jsxs(Card, { className: "rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: status }), _jsxs("div", { className: "mt-4 flex items-center justify-between gap-4", children: [_jsx("p", { className: "text-3xl font-semibold text-neutral-900 dark:text-white", children: matchingCount }), _jsx(Badge, { variant: status === 'Completed' ? 'success' : status === 'Pending' ? 'warning' : 'primary', size: "sm", children: "Live" })] })] }, status));
                }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-neutral-900 dark:text-white", children: "Order log" }), _jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Recent orders and totals." })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [_jsx(Search, { placeholder: "Search orders...", value: search, onChange: (e) => setSearch(e.target.value), onClear: () => setSearch('') }), _jsx("div", { className: "flex flex-wrap items-center gap-2", children: statusOptions.map((status) => (_jsx(Button, { variant: statusFilter === status ? 'primary' : 'outline', size: "sm", onClick: () => setStatusFilter(status), children: status }, status))) })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "mb-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300", children: ["Showing ", orderCount, " of ", data.length, " orders."] }), _jsx(Table, { columns: columns, data: filteredOrders })] })] })] }));
}
