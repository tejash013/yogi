import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardContent, Table, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
const data = [
    { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0101', orders: 12, spent: 245.5 },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0102', orders: 8, spent: 189.2 },
    { name: 'Mike Johnson', email: 'mike@example.com', phone: '+1-555-0103', orders: 5, spent: 98.75 },
];
const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'orders', header: 'Orders' },
    { key: 'spent', header: 'Total Spent', render: (item) => `$${item.spent.toFixed(2)}` },
];
export default function Customers() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Customers", description: "View your customer base and recent activity", actions: _jsx(Search, { placeholder: "Search customers..." }) }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-[1.4fr_0.6fr]", children: [_jsxs(Card, { className: "rounded-[1.5rem] border-neutral-200 dark:border-neutral-700", children: [_jsx(CardHeader, { children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-neutral-500 dark:text-neutral-400", children: "Customer insights" }), _jsx("h3", { className: "text-xl font-semibold text-neutral-900 dark:text-white", children: "Loyalty and orders" })] }) }), _jsxs(CardContent, { className: "grid gap-4 p-6 sm:grid-cols-2", children: [_jsxs("div", { className: "rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Total customers" }), _jsx("p", { className: "mt-3 text-3xl font-semibold text-neutral-900 dark:text-white", children: "3" })] }), _jsxs("div", { className: "rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Average spend" }), _jsx("p", { className: "mt-3 text-3xl font-semibold text-neutral-900 dark:text-white", children: "$177" })] })] })] }), _jsxs(Card, { className: "rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-900", children: [_jsx("p", { className: "text-sm font-medium text-neutral-500 dark:text-neutral-400", children: "Customer satisfaction" }), _jsxs("div", { className: "mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300", children: [_jsx("p", { children: "Retention is strong across repeat buyers." }), _jsx("p", { children: "Use customer insights to personalize your offers." })] })] })] }), _jsx(Card, { padding: "none", children: _jsx(Table, { columns: columns, data: data }) })] }));
}
