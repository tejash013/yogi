import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
export default function MainLayout({ navItems = [], sidebar, showFooter = true, }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900", children: [_jsx(Navbar, { items: navItems, showMobileMenu: true, rightContent: _jsx("button", { onClick: () => setIsSidebarOpen(!isSidebarOpen), className: "rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden", children: _jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }) }), _jsxs("div", { className: "flex flex-1", children: [sidebar && (_jsx("div", { className: "hidden lg:block", children: sidebar })), sidebar && (_jsx("div", { className: `fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`, onClick: () => setIsSidebarOpen(false) })), _jsx("main", { className: "flex-1 p-4 sm:p-6 lg:p-8", children: _jsx(Outlet, {}) })] }), showFooter && _jsx(Footer, {})] }));
}
