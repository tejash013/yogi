import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from '@/components/ui/Card';
import { cn } from '@/utils';
const accentStyles = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
};
export default function KitchenStatsCard({ label, value, icon, accent = 'primary', sub, onClick, }) {
    return (_jsxs(Card, { className: cn('flex items-start justify-between gap-3 transition-colors', onClick && 'cursor-pointer hover:border-primary-300 dark:hover:border-primary-700'), onClick: onClick, children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-neutral-500 dark:text-neutral-400", children: label }), _jsx("p", { className: "mt-2 text-3xl font-bold text-neutral-900 dark:text-white", children: value }), sub && _jsx("p", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-400", children: sub })] }), icon && (_jsx("div", { className: cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accentStyles[accent]), children: icon }))] }));
}
