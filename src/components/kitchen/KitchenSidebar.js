import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useKitchenStore } from '@/store';
const navItems = [
    {
        label: 'Dashboard',
        href: ROUTES.KITCHEN.DASHBOARD,
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) })),
    },
    {
        label: 'Live Orders',
        href: ROUTES.KITCHEN.LIVE_ORDERS,
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) })),
        countKey: 'active',
    },
    {
        label: 'Preparing',
        href: ROUTES.KITCHEN.PREPARING,
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
        countKey: 'preparing',
    },
    {
        label: 'Ready',
        href: ROUTES.KITCHEN.READY,
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
        countKey: 'ready',
    },
    {
        label: 'Completed',
        href: ROUTES.KITCHEN.COMPLETED,
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })),
    },
];
export default function KitchenSidebar({ isOpen, onClose }) {
    const location = useLocation();
    const orders = useKitchenStore((s) => s.orders);
    const counts = {
        active: orders.filter((o) => ['new', 'confirmed'].includes(o.status)).length,
        preparing: orders.filter((o) => o.status === 'preparing').length,
        ready: orders.filter((o) => o.status === 'ready').length,
    };
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden", onClick: onClose })), _jsxs("aside", { className: cn('fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 lg:translate-x-0 dark:border-neutral-700 dark:bg-neutral-900', isOpen ? 'translate-x-0' : '-translate-x-full'), children: [_jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4", children: _jsx("ul", { className: "space-y-1", children: navItems.map((item) => {
                                const isActive = location.pathname === item.href;
                                const count = item.countKey ? counts[item.countKey] : null;
                                return (_jsx("li", { children: _jsxs(Link, { to: item.href, onClick: onClose, className: cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive
                                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'), children: [_jsx("span", { className: "flex h-5 w-5 items-center justify-center", children: item.icon }), _jsx("span", { className: "flex-1", children: item.label }), count !== null && count > 0 && (_jsx("span", { className: "rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white", children: count }))] }) }, item.href));
                            }) }) }), _jsx("div", { className: "border-t border-neutral-200 p-4 dark:border-neutral-700", children: _jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "Kitchen Control \u00B7 v1.0" }) })] })] }));
}
