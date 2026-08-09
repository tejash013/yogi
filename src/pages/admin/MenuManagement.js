import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card, CardHeader, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
const data = [
    { name: 'Margherita Pizza', category: 'Pizza', price: 12.99, status: 'Available', rating: 4.5 },
    { name: 'Grilled Salmon', category: 'Main Course', price: 24.99, status: 'Available', rating: 4.7 },
    { name: 'Caesar Salad', category: 'Salads', price: 9.99, status: 'Available', rating: 4.3 },
    { name: 'Chocolate Lava Cake', category: 'Desserts', price: 8.99, status: 'Out of Stock', rating: 4.8 },
];
const columns = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', render: (item) => `$${item.price.toFixed(2)}` },
    {
        key: 'status',
        header: 'Status',
        render: (item) => (_jsx(Badge, { variant: item.status === 'Available' ? 'success' : 'error', size: "sm", children: item.status })),
    },
    { key: 'rating', header: 'Rating' },
];
export default function MenuManagement() {
    const [search, setSearch] = useState('');
    const filteredItems = useMemo(() => data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())), [search]);
    const availableCount = filteredItems.filter((item) => item.status === 'Available').length;
    const outOfStockCount = filteredItems.filter((item) => item.status !== 'Available').length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Menu Management", description: "Manage your restaurant menu items and availability", actions: _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [_jsx(Search, { placeholder: "Search menu...", value: search, onChange: (e) => setSearch(e.target.value), onClear: () => setSearch('') }), _jsx(Button, { children: "Add New Item" })] }) }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [_jsxs(Card, { className: "rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Total items" }), _jsx("p", { className: "mt-4 text-3xl font-semibold text-neutral-900 dark:text-white", children: filteredItems.length }), _jsx("p", { className: "mt-2 text-sm text-neutral-500 dark:text-neutral-400", children: "Search results are updated live." })] }), _jsxs(Card, { className: "rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Available" }), _jsx("p", { className: "mt-4 text-3xl font-semibold text-neutral-900 dark:text-white", children: availableCount }), _jsx("p", { className: "mt-2 text-sm text-neutral-500 dark:text-neutral-400", children: "Includes dishes ready to serve." })] }), _jsxs(Card, { className: "rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Out of stock" }), _jsx("p", { className: "mt-4 text-3xl font-semibold text-neutral-900 dark:text-white", children: outOfStockCount }), _jsx("p", { className: "mt-2 text-sm text-neutral-500 dark:text-neutral-400", children: "Filtered count for unavailable items." })] })] }), _jsxs(Card, { padding: "none", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-neutral-900 dark:text-white", children: "Menu items" }), _jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: "Browse and maintain all dishes in your restaurant menu." })] }), _jsx(Button, { variant: "outline", children: "Sync Menu" })] }) }), _jsx(CardContent, { children: _jsx(Table, { columns: columns, data: filteredItems }) })] })] }));
}
