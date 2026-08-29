import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card, Input, Select, Table } from '@/components/ui';
import { PageHeader } from '@/components/common';
export default function Billing() {
    const [items] = useState([
        { item: 'Margherita Pizza', qty: 2, price: 12.99, total: 25.98 },
        { item: 'Caesar Salad', qty: 1, price: 9.99, total: 9.99 },
    ]);
    const columns = [
        { key: 'item', header: 'Item' },
        { key: 'qty', header: 'Qty' },
        { key: 'price', header: 'Price', render: (item) => `$${item.price.toFixed(2)}` },
        { key: 'total', header: 'Total', render: (item) => `$${item.total.toFixed(2)}` },
    ];
    return (_jsxs("div", { children: [_jsx(PageHeader, { title: "Billing", description: "Create and manage bills" }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { children: [_jsx("h3", { className: "mb-4 font-semibold text-neutral-900 dark:text-white", children: "Order Items" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Input, { placeholder: "Search menu items...", className: "flex-1" }), _jsx(Select, { options: [
                                                        { value: '1', label: 'Table 1' },
                                                        { value: '2', label: 'Table 2' },
                                                        { value: '3', label: 'Table 3' },
                                                    ], placeholder: "Select table" })] }), _jsx(Table, { columns: columns, data: items }), _jsx("div", { className: "border-t border-neutral-200 pt-4 dark:border-neutral-700", children: _jsxs("div", { className: "space-y-1 text-right", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-neutral-500", children: "Subtotal" }), _jsx("span", { className: "font-medium", children: "$35.97" })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-neutral-500", children: "Tax (8%)" }), _jsx("span", { className: "font-medium", children: "$2.88" })] }), _jsxs("div", { className: "flex justify-between text-lg font-bold", children: [_jsx("span", { children: "Total" }), _jsx("span", { className: "text-primary-500", children: "$38.85" })] })] }) })] })] }) }), _jsx("div", { children: _jsxs(Card, { children: [_jsx("h3", { className: "mb-4 font-semibold text-neutral-900 dark:text-white", children: "Payment" }), _jsxs("div", { className: "space-y-4", children: [_jsx(Select, { options: [
                                                { value: 'cash', label: 'Cash' },
                                                { value: 'card', label: 'Card' },
                                                { value: 'upi', label: 'UPI' },
                                                { value: 'online', label: 'Online' },
                                            ], placeholder: "Payment method", label: "Payment Method" }), _jsx(Input, { label: "Amount Received", type: "number", placeholder: "0.00" }), _jsxs("div", { className: "rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20", children: [_jsx("p", { className: "text-sm text-green-700 dark:text-green-300", children: "Change Due" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: "$0.00" })] }), _jsx(Button, { fullWidth: true, size: "lg", children: "Process Payment" })] })] }) })] })] }));
}
