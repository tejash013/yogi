import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, CardHeader, CardContent, Table, Badge, Search } from '@/components/ui';
import { PageHeader } from '@/components/common';
const data = [
    { name: 'Carlos Rodriguez', role: 'Chef', shift: 'Morning', salary: 4500, status: 'active' },
    { name: 'Emily Brown', role: 'Cashier', shift: 'Afternoon', salary: 3200, status: 'active' },
    { name: 'Alex Kim', role: 'Server', shift: 'Evening', salary: 2800, status: 'active' },
    { name: 'Sarah Wilson', role: 'Manager', shift: 'Morning', salary: 5500, status: 'inactive' },
];
const columns = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'shift', header: 'Shift' },
    { key: 'salary', header: 'Salary', render: (item) => `$${item.salary.toFixed(2)}` },
    {
        key: 'status',
        header: 'Status',
        render: (item) => (_jsx(Badge, { variant: item.status === 'active' ? 'success' : 'neutral', size: "sm", children: item.status.charAt(0).toUpperCase() + item.status.slice(1) })),
    },
];
export default function Employees() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Employees", description: "Manage your staff and track payroll status", actions: _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [_jsx(Search, { placeholder: "Search employees..." }), _jsx(Button, { children: "Add Employee" })] }) }), _jsx(Card, { className: "rounded-[1.5rem] border-neutral-200 dark:border-neutral-700", children: _jsx(CardContent, { className: "grid gap-4 p-6 sm:grid-cols-3", children: [
                        { label: 'Total staff', value: '4' },
                        { label: 'On duty', value: '3' },
                        { label: 'Off duty', value: '1' },
                    ].map((item) => (_jsxs("div", { className: "rounded-3xl bg-neutral-50 p-5 text-neutral-900 dark:bg-neutral-900 dark:text-white", children: [_jsx("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: item.label }), _jsx("p", { className: "mt-3 text-3xl font-semibold", children: item.value })] }, item.label))) }) }), _jsx(Card, { padding: "none", children: _jsx(Table, { columns: columns, data: data }) })] }));
}
