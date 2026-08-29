import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
export default function Table({ columns, data, isLoading = false, emptyMessage = 'No data available', onRowClick, className, }) {
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" }) }));
    }
    if (data.length === 0) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-neutral-500", children: [_jsx("svg", { className: "mb-3 h-12 w-12", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" }) }), _jsx("p", { className: "text-sm", children: emptyMessage })] }));
    }
    return (_jsx("div", { className: cn('overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700', className), children: _jsxs("table", { className: "min-w-full divide-y divide-neutral-200 dark:divide-neutral-700", children: [_jsx("thead", { className: "bg-neutral-50 dark:bg-neutral-800", children: _jsx("tr", { children: columns.map((col) => (_jsx("th", { className: cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400', col.headerClassName), children: col.header }, col.key))) }) }), _jsx("tbody", { className: "divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-900", children: data.map((item, index) => (_jsx("tr", { onClick: () => onRowClick?.(item), className: cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800'), children: columns.map((col) => (_jsx("td", { className: cn('whitespace-nowrap px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300', col.className), children: col.render
                                ? col.render(item)
                                : item[col.key] ?? '-' }, col.key))) }, index))) })] }) }));
}
