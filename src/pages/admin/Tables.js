import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
const tables = [
    { number: 1, capacity: 2, status: 'available', location: 'Window' },
    { number: 2, capacity: 4, status: 'occupied', location: 'Center' },
    { number: 3, capacity: 4, status: 'occupied', location: 'Center' },
    { number: 4, capacity: 6, status: 'reserved', location: 'VIP' },
    { number: 5, capacity: 2, status: 'available', location: 'Window' },
    { number: 6, capacity: 8, status: 'available', location: 'Corner' },
];
const statusConfig = {
    available: { variant: 'success', label: 'Available' },
    occupied: { variant: 'error', label: 'Occupied' },
    reserved: { variant: 'warning', label: 'Reserved' },
    maintenance: { variant: 'info', label: 'Maintenance' },
};
export default function Tables() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Tables", description: "Manage restaurant table layout" }), _jsxs(Card, { className: "rounded-[1.5rem] border-neutral-200 dark:border-neutral-700", children: [_jsx(CardHeader, { children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-neutral-500 dark:text-neutral-400", children: "Table performance" }), _jsx("h3", { className: "text-xl font-semibold text-neutral-900 dark:text-white", children: "Current floor status" })] }) }), _jsx(CardContent, { className: "grid gap-4 p-6 sm:grid-cols-3", children: [
                            { label: 'Available', value: 3 },
                            { label: 'Occupied', value: 2 },
                            { label: 'Reserved', value: 1 },
                        ].map((item) => (_jsxs("div", { className: "rounded-3xl bg-neutral-50 p-5 dark:bg-neutral-900", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: item.label }), _jsx("p", { className: "mt-3 text-3xl font-semibold text-neutral-900 dark:text-white", children: item.value })] }, item.label))) })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: tables.map((table) => {
                    const config = statusConfig[table.status];
                    return (_jsx(Card, { className: "rounded-[1.5rem] border-neutral-200 p-5 shadow-soft dark:border-neutral-700", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-2xl font-semibold text-neutral-900 dark:text-white", children: ["Table ", table.number] }), _jsxs("p", { className: "mt-1 text-sm text-neutral-500 dark:text-neutral-400", children: ["Capacity: ", table.capacity, " \u00B7 ", table.location] })] }), _jsx(Badge, { variant: config.variant, size: "sm", children: config.label })] }) }, table.number));
                }) })] }));
}
