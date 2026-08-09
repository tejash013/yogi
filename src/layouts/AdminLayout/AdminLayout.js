import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Sidebar, {} from '@/components/common/Sidebar';
import Logo from '@/components/common/Logo';
import { ROUTES } from '@/constants';
const sidebarItems = [
    {
        label: 'Dashboard',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) })),
        href: ROUTES.ADMIN.DASHBOARD,
    },
    {
        label: 'Menu',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" }) })),
        href: ROUTES.ADMIN.MENU_MANAGEMENT,
    },
    {
        label: 'Categories',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) })),
        href: ROUTES.ADMIN.CATEGORIES,
    },
    {
        label: 'Orders',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" }) })),
        href: ROUTES.ADMIN.ORDERS,
        badge: 12,
    },
    {
        label: 'Customers',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" }) })),
        href: ROUTES.ADMIN.CUSTOMERS,
    },
    {
        label: 'Employees',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" }) })),
        href: ROUTES.ADMIN.EMPLOYEES,
    },
    {
        label: 'Tables',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" }) })),
        href: ROUTES.ADMIN.TABLES,
    },
    {
        label: 'Inventory',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" }) })),
        href: ROUTES.ADMIN.INVENTORY,
    },
    {
        label: 'Reports',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) })),
        href: ROUTES.ADMIN.REPORTS,
    },
    {
        label: 'Settings',
        icon: (_jsxs("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] })),
        href: ROUTES.ADMIN.SETTINGS,
    },
];
export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900", children: [_jsx(Navbar, { showMobileMenu: true, rightContent: _jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden", children: _jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }) }), _jsxs("div", { className: "flex flex-1", children: [_jsx(Sidebar, { items: sidebarItems, isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) }), _jsx("main", { className: "flex-1 bg-neutral-100 p-4 sm:p-6 lg:ml-64 lg:p-8 dark:bg-neutral-950", children: _jsxs("div", { className: "mx-auto w-full max-w-7xl", children: [_jsxs("div", { className: "mb-6 hidden rounded-[1.75rem] border border-neutral-200 bg-white/90 p-5 shadow-soft backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90 lg:flex lg:items-center lg:justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Logo, { size: "sm", showText: true }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-neutral-500 dark:text-neutral-400", children: "Admin Control Center" }), _jsx("h1", { className: "text-2xl font-semibold text-neutral-900 dark:text-white", children: "RestaurantOS Admin" })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("button", { className: "rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800", children: "Overview" }), _jsx("button", { className: "rounded-2xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600", children: "Create Report" }), _jsx("button", { className: "rounded-2xl bg-secondary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary-600", children: "New Item" })] })] }), _jsx(Outlet, {})] }) })] })] }));
}
