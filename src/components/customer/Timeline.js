import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
export default function Timeline({ steps, className }) {
    return (_jsx("div", { className: cn('relative', className), children: steps.map((step, index) => (_jsxs("div", { className: "mb-8 flex items-start last:mb-0", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: cn('flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-500', step.completed
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : step.isCurrent
                                    ? 'border-primary-500 bg-white text-primary-500 dark:bg-neutral-800'
                                    : 'border-neutral-300 bg-white text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800'), children: step.completed ? (_jsx("svg", { className: "h-5 w-5 animate-scale-in", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M5 13l4 4L19 7" }) })) : (_jsx("span", { className: "text-sm font-semibold", children: index + 1 })) }), index < steps.length - 1 && (_jsx("div", { className: cn('h-12 w-0.5 transition-colors duration-500', step.completed ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700') }))] }), _jsxs("div", { className: "ml-4", children: [_jsxs("p", { className: cn('font-semibold transition-colors duration-300', step.completed
                                ? 'text-neutral-900 dark:text-white'
                                : step.isCurrent
                                    ? 'text-primary-500'
                                    : 'text-neutral-400'), children: [step.label, step.isCurrent && (_jsx("span", { className: "ml-2 inline-flex", children: _jsxs("span", { className: "flex h-2 w-2", children: [_jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" }), _jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-primary-500" })] }) }))] }), step.time && (_jsx("p", { className: "mt-0.5 text-sm text-neutral-500", children: step.time }))] })] }, step.label))) }));
}
