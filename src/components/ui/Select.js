import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/utils';
const Select = forwardRef(({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (_jsxs("div", { className: "w-full", children: [label && (_jsxs("label", { htmlFor: selectId, className: "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300", children: [label, props.required && _jsx("span", { className: "ml-1 text-error", children: "*" })] })), _jsxs("div", { className: "relative", children: [_jsxs("select", { ref: ref, id: selectId, className: cn('w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-8 text-neutral-900 transition-colors duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100', error && 'border-error focus:border-error focus:ring-error/20', className), ...props, children: [placeholder && (_jsx("option", { value: "", disabled: true, children: placeholder })), options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsx("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2", children: _jsx("svg", { className: "h-4 w-4 text-neutral-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) }) })] }), error && _jsx("p", { className: "mt-1 text-sm text-error", children: error })] }));
});
Select.displayName = 'Select';
export default Select;
