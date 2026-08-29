import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { PageHeader } from '@/components/common';
const reports = [
    { title: 'Sales Report', date: 'Mar 20, 2025', summary: 'Revenue and orders overview' },
    { title: 'Revenue Report', date: 'Mar 19, 2025', summary: 'Income breakdown by channel' },
    { title: 'Expense Report', date: 'Mar 18, 2025', summary: 'Cost and spend analysis' },
    { title: 'Customer Report', date: 'Mar 17, 2025', summary: 'Visits, retention, and feedback' },
];
export default function AdminReports() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Reports", description: "Generate and view reports", actions: _jsx(Button, { children: "Generate Report" }) }), _jsx("div", { className: "grid gap-6 lg:grid-cols-2", children: reports.map((report) => (_jsxs(Card, { className: "rounded-[1.5rem] border-neutral-200 p-6 shadow-soft dark:border-neutral-700 dark:bg-neutral-900", children: [_jsx(CardHeader, { children: _jsxs("div", { children: [_jsx("p", { className: "text-base font-semibold text-neutral-900 dark:text-white", children: report.title }), _jsxs("p", { className: "text-sm text-neutral-500 dark:text-neutral-400", children: ["Last generated: ", report.date] })] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-neutral-600 dark:text-neutral-300", children: report.summary }), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx(Button, { variant: "outline", size: "sm", children: "View" }) })] })] }, report.title))) })] }));
}
