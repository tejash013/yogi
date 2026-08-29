import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { cn } from '@/utils';
export default function Breadcrumb({ items, className }) {
    return (_jsx("nav", { className: cn('flex items-center gap-2 text-sm', className), children: items.map((item, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [index > 0 && (_jsx("svg", { className: "h-4 w-4 text-neutral-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })), item.href ? (_jsx(Link, { to: item.href, className: "text-neutral-500 hover:text-primary-500 transition-colors", children: item.label })) : (_jsx("span", { className: "text-neutral-900 dark:text-white font-medium", children: item.label }))] }, index))) }));
}
