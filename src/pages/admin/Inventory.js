import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
const data = [
    { name: 'Tomatoes', category: 'Vegetables', quantity: 50, unit: 'kg', minStock: 20 },
    { name: 'Chicken Breast', category: 'Meat', quantity: 15, unit: 'kg', minStock: 10 },
    { name: 'Mozzarella', category: 'Dairy', quantity: 8, unit: 'kg', minStock: 5 },
    { name: 'Olive Oil', category: 'Pantry', quantity: 3, unit: 'L', minStock: 5 },
];
const columns = [
    { key: 'name', header: 'Item' },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit', header: 'Unit' },
    {
        key: 'minStock',
        header: 'Min Stock',
        render: (item) => (_jsx(Badge, { variant: item.quantity <= item.minStock ? 'error' : 'success', size: "sm", children: item.minStock })),
    },
];
export default function Inventory() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Inventory", description: "Track your inventory levels and avoid stockouts", actions: _jsx(Search, { placeholder: "Search inventory..." }) }), _jsx(Card, { className: "rounded-[1.5rem] border-neutral-200 dark:border-neutral-700", children: _jsxs(CardContent, { className: "grid gap-4 p-6 sm:grid-cols-2", children: [_jsxs("div", { className: "rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Low stock items" }), _jsx("p", { className: "mt-3 text-3xl font-semibold text-neutral-900 dark:text-white", children: "2" })] }), _jsxs("div", { className: "rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Total inventory lines" }), _jsx("p", { className: "mt-3 text-3xl font-semibold text-neutral-900 dark:text-white", children: "4" })] })] }) }), _jsx(Card, { padding: "none", children: _jsx(Table, { columns: columns, data: data }) })] }));
}
