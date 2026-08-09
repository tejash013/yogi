import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common';
export default function CashierDashboard() {
    return (_jsxs("div", { children: [_jsx(PageHeader, { title: "Cashier Dashboard", description: "Overview of today transactions" }), _jsx("div", { className: "mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
                    { label: 'Today Revenue', value: '$2,450', change: '+15%', color: 'text-green-500' },
                    { label: 'Orders Today', value: '42', change: '+8%', color: 'text-blue-500' },
                    { label: 'Pending Payments', value: '3', change: '-2', color: 'text-yellow-500' },
                    { label: 'Avg Order Value', value: '$58.33', change: '+5%', color: 'text-primary-500' },
                ].map((stat) => (_jsxs(Card, { children: [_jsx("p", { className: "text-sm text-neutral-500", children: stat.label }), _jsxs("div", { className: "mt-1 flex items-end justify-between", children: [_jsx("p", { className: "text-2xl font-bold text-neutral-900 dark:text-white", children: stat.value }), _jsx("span", { className: `text-sm font-medium ${stat.color}`, children: stat.change })] })] }, stat.label))) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs(Card, { children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-white", children: "Recent Transactions" }), _jsx("div", { className: "divide-y divide-neutral-200 dark:divide-neutral-700", children: [
                                    { order: 'ORD-001', amount: 38.85, method: 'Cash', status: 'paid' },
                                    { order: 'ORD-002', amount: 41.41, method: 'Card', status: 'paid' },
                                    { order: 'ORD-003', amount: 25.89, method: 'UPI', status: 'pending' },
                                ].map((tx, i) => (_jsxs("div", { className: "flex items-center justify-between py-3", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-neutral-900 dark:text-white", children: tx.order }), _jsx("p", { className: "text-sm text-neutral-500", children: tx.method })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold text-neutral-900 dark:text-white", children: ["$", tx.amount.toFixed(2)] }), _jsx("p", { className: `text-sm ${tx.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`, children: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) })] })] }, i))) })] }), _jsxs(Card, { children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-white", children: "Payment Methods" }), _jsx("div", { className: "space-y-3", children: [
                                    { method: 'Cash', count: 18, total: 1042.50 },
                                    { method: 'Card', count: 15, total: 895.75 },
                                    { method: 'UPI', count: 7, total: 345.25 },
                                    { method: 'Online', count: 2, total: 166.50 },
                                ].map((pm, i) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: pm.method }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: "text-sm font-medium text-neutral-900 dark:text-white", children: [pm.count, " transactions"] }), _jsxs("span", { className: "ml-3 text-sm text-neutral-500", children: ["$", pm.total.toFixed(2)] })] })] }, i))) })] })] })] }));
}
