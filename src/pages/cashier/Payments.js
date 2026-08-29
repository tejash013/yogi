import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, Table, Badge, Search, Select } from '@/components/ui';
import { PageHeader } from '@/components/common';
const data = [
    { id: '1', order: 'ORD-001', customer: 'John Doe', amount: 38.85, method: 'Cash', status: 'completed', date: '2025-03-20' },
    { id: '2', order: 'ORD-002', customer: 'Jane Smith', amount: 41.41, method: 'Card', status: 'completed', date: '2025-03-20' },
    { id: '3', order: 'ORD-003', customer: 'Mike Johnson', amount: 25.89, method: 'UPI', status: 'pending', date: '2025-03-19' },
    { id: '4', order: 'ORD-004', customer: 'Sarah Wilson', amount: 52.30, method: 'Online', status: 'failed', date: '2025-03-18' },
];
const statusColors = {
    completed: 'success',
    pending: 'warning',
    failed: 'error',
    refunded: 'info',
};
const columns = [
    { key: 'order', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (item) => '$' + item.amount.toFixed(2) },
    { key: 'method', header: 'Method' },
    {
        key: 'status',
        header: 'Status',
        render: (item) => (_jsx(Badge, { variant: statusColors[item.status] || 'neutral', size: 'sm', children: item.status.charAt(0).toUpperCase() + item.status.slice(1) })),
    },
    { key: 'date', header: 'Date' },
];
export default function Payments() {
    return (_jsxs("div", { children: [_jsx(PageHeader, { title: 'Payments', description: 'Track and manage payments', actions: _jsxs("div", { className: 'flex items-center gap-3', children: [_jsx(Search, { placeholder: 'Search payments...' }), _jsx(Select, { options: [
                                { value: 'all', label: 'All Methods' },
                                { value: 'cash', label: 'Cash' },
                                { value: 'card', label: 'Card' },
                                { value: 'upi', label: 'UPI' },
                                { value: 'online', label: 'Online' },
                            ], placeholder: 'Filter' })] }) }), _jsx(Card, { padding: 'none', children: _jsx(Table, { columns: columns, data: data }) })] }));
}
