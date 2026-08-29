import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/utils';
const Checkbox = forwardRef(({ label, error, className, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (_jsxs("div", { className: "flex items-start gap-2", children: [_jsx("input", { ref: ref, type: "checkbox", id: checkboxId, className: cn('mt-1 h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800', className), ...props }), label && (_jsx("label", { htmlFor: checkboxId, className: "text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none", children: label })), error && _jsx("p", { className: "text-sm text-error", children: error })] }));
});
Checkbox.displayName = 'Checkbox';
export default Checkbox;
