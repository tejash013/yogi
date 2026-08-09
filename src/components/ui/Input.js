import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/utils';
const Input = forwardRef(({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("label", { htmlFor: inputId, className: "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: [label, props.required && (_jsx("span", { className: "ml-1 text-error", children: "*" }))] })), _jsx("input", { ref: ref, id: inputId, className: cn('w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 transition-colors duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500', error &&
                    'border-error focus:border-error focus:ring-error/20', className), ...props }), error && (_jsx("p", { className: "mt-1 text-sm text-error", children: error })), helperText && !error && (_jsx("p", { className: "mt-1 text-sm text-neutral-500", children: helperText }))] }));
});
Input.displayName = 'Input';
export default Input;
