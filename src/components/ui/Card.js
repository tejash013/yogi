import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/utils';
const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
};
export default function Card({ children, padding = 'md', hover = false, className, ...props }) {
    return (_jsx("div", { className: cn('rounded-xl border border-neutral-200 bg-white shadow-soft dark:border-neutral-700 dark:bg-neutral-800', paddings[padding], hover && 'card-hover cursor-pointer', className), ...props, children: children }));
}
export function CardHeader({ children, className, ...props }) {
    return (_jsx("div", { className: cn('mb-4 flex items-center justify-between', className), ...props, children: children }));
}
export function CardTitle({ children, className, ...props }) {
    return (_jsx("h3", { className: cn('text-lg font-semibold text-neutral-900 dark:text-white', className), ...props, children: children }));
}
export function CardContent({ children, className, ...props }) {
    return (_jsx("div", { className: cn('', className), ...props, children: children }));
}
export function CardFooter({ children, className, ...props }) {
    return (_jsx("div", { className: cn('mt-4 flex items-center justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700', className), ...props, children: children }));
}
