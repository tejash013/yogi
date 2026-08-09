import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Badge } from '@/components/ui';
import { PageHeader } from '@/components/common';
const expenseCategories = [
    { label: 'Ingredients', value: '$18,500', percentage: 42 },
    { label: 'Staff Salaries', value: '$12,000', percentage: 27 },
    { label: 'Utilities', value: '$3,200', percentage: 7 },
    { label: 'Rent', value: '$5,000', percentage: 11 },
    { label: 'Marketing', value: '$2,800', percentage: 6 },
    { label: 'Other', value: '$3,000', percentage: 7 },
];
export default function Expenses() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Expenses", description: "Monitor business expenses" }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: expenseCategories.map((item) => (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm uppercase tracking-[0.18em] text-neutral-500", children: item.label }), _jsx("p", { className: "mt-4 text-3xl font-semibold text-neutral-900 dark:text-white", children: item.value })] }), _jsxs(Badge, { variant: "warning", size: "sm", children: [item.percentage, "%"] })] }), _jsx("div", { className: "mt-6 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800", children: _jsx("div", { className: "h-full rounded-full bg-amber-500", style: { width: `${item.percentage}%` } }) })] }, item.label))) }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-3", children: [_jsxs(Card, { className: "xl:col-span-2", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: "Expense Trends" }), _jsx("p", { className: "mt-1 text-sm text-neutral-500 dark:text-neutral-400", children: "Monitor how expenses shift month over month." })] }), _jsx(Badge, { variant: "secondary", size: "sm", children: "Expense view" })] }), _jsx("div", { className: "mt-6 flex h-64 items-center justify-center rounded-3xl bg-neutral-50 text-sm text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500", children: "Expense trend chart placeholder" })] }), _jsxs(Card, { children: [_jsx("h2", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: "Expense Summary" }), _jsx("div", { className: "mt-5 space-y-4", children: [
                                    { label: 'Total Expenses', value: '$44,500' },
                                    { label: 'Average Cost', value: '$3,708' },
                                    { label: 'Cost Ratio', value: '67%' },
                                ].map((item) => (_jsx("div", { className: "rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("p", { className: "text-sm text-neutral-500", children: item.label }), _jsx("p", { className: "font-semibold text-neutral-900 dark:text-white", children: item.value })] }) }, item.label))) })] })] })] }));
}
