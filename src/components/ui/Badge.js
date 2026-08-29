import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
const variants = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
};
const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
};
const dotColors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-neutral-500',
};
export default function Badge({ children, variant = 'primary', size = 'md', dot = false, className, }) {
    return (_jsxs("span", { className: cn('inline-flex items-center gap-1.5 rounded-full font-medium', variants[variant], sizes[size], className), children: [dot && (_jsx("span", { className: cn('h-1.5 w-1.5 rounded-full', dotColors[variant]) })), children] }));
}
