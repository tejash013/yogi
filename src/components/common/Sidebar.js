import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
export default function Sidebar({ items, isOpen, onClose, variant = 'default' }) {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState([]);
    const toggleExpand = (label) => {
        setExpandedItems((prev) => prev.includes(label)
            ? prev.filter((i) => i !== label)
            : [...prev, label]);
    };
    const isActive = (href) => location.pathname === href;
    const isChildActive = (children) => children?.some((child) => isActive(child.href));
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden", onClick: onClose })), _jsx("aside", { className: cn('fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transition-transform duration-300 lg:translate-x-0', variant === 'owner'
                    ? 'border-r border-neutral-800 bg-neutral-950 text-neutral-100'
                    : 'border-r border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900', isOpen ? 'translate-x-0' : '-translate-x-full'), children: _jsx("nav", { className: "h-full overflow-y-auto px-3 py-4", children: _jsx("ul", { className: "space-y-1", children: items.map((item) => {
                            const hasChildren = item.children && item.children.length > 0;
                            const isExpanded = expandedItems.includes(item.label);
                            const active = isActive(item.href) || isChildActive(item.children);
                            return (_jsx("li", { children: hasChildren ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => toggleExpand(item.label), className: cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active
                                                ? variant === 'owner'
                                                    ? 'bg-primary-600/10 text-primary-300'
                                                    : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                                : variant === 'owner'
                                                    ? 'text-neutral-300 hover:bg-white/5 hover:text-white'
                                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'), children: [_jsx("span", { className: "flex h-5 w-5 items-center justify-center", children: item.icon }), _jsx("span", { className: "flex-1 text-left", children: item.label }), item.badge && (_jsx("span", { className: "rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white", children: item.badge })), _jsx("svg", { className: cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90'), fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] }), isExpanded && item.children && (_jsx("ul", { className: "ml-4 mt-1 space-y-1 border-l border-neutral-200 pl-3 dark:border-neutral-700", children: item.children.map((child) => (_jsx("li", { children: _jsxs(Link, { to: child.href, onClick: onClose, className: cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive(child.href)
                                                        ? variant === 'owner'
                                                            ? 'bg-primary-600/10 text-primary-300'
                                                            : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                                        : variant === 'owner'
                                                            ? 'text-neutral-400 hover:bg-white/5 hover:text-white'
                                                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'), children: [_jsx("span", { className: "flex h-4 w-4 items-center justify-center", children: child.icon }), _jsx("span", { children: child.label })] }) }, child.href))) }))] })) : (_jsxs(Link, { to: item.href, onClick: onClose, className: cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active
                                        ? variant === 'owner'
                                            ? 'bg-primary-600/10 text-primary-300'
                                            : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                        : variant === 'owner'
                                            ? 'text-neutral-300 hover:bg-white/5 hover:text-white'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'), children: [_jsx("span", { className: "flex h-5 w-5 items-center justify-center", children: item.icon }), _jsx("span", { className: "flex-1", children: item.label }), item.badge && (_jsx("span", { className: "rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white", children: item.badge }))] })) }, item.href));
                        }) }) }) })] }));
}
