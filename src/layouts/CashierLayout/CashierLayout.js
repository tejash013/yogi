import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Sidebar, {} from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import { ROUTES } from '@/constants';
const sidebarItems = [
    {
        label: 'Dashboard',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) })),
        href: ROUTES.CASHIER.DASHBOARD,
    },
    {
        label: 'Billing',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" }) })),
        href: ROUTES.CASHIER.BILLING,
    },
    {
        label: 'Payments',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" }) })),
        href: ROUTES.CASHIER.PAYMENTS,
    },
    {
        label: 'Invoices',
        icon: (_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) })),
        href: ROUTES.CASHIER.INVOICES,
    },
];
export default function CashierLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900", children: [_jsx(Navbar, { showMobileMenu: true, rightContent: _jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden", children: _jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }) }), _jsxs("div", { className: "flex flex-1", children: [_jsx(Sidebar, { items: sidebarItems, isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) }), _jsx("main", { className: "flex-1 p-4 sm:p-6 lg:ml-64 lg:p-8", children: _jsx(Outlet, {}) })] }), _jsx(Footer, {})] }));
}
