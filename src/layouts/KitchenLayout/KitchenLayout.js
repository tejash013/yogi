import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { KitchenHeader, KitchenSidebar } from '@/components/kitchen';
import { ToastContainer } from '@/components/ui';
import { useToastStore } from '@/store';
/**
 * Main kitchen layout: sticky header + collapsible sidebar + content area.
 * Also renders global toast notifications.
 */
export default function KitchenLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toasts = useToastStore((s) => s.toasts);
    const dismissToast = useToastStore((s) => s.dismissToast);
    return (_jsxs("div", { className: "flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900", children: [_jsx(KitchenHeader, { onMenuClick: () => setIsSidebarOpen((o) => !o) }), _jsxs("div", { className: "flex flex-1", children: [_jsx(KitchenSidebar, { isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) }), _jsx("main", { className: "flex-1 p-4 sm:p-6 lg:ml-64 lg:p-8", children: _jsx(Outlet, {}) })] }), _jsx(ToastContainer, { toasts: toasts, onDismiss: dismissToast })] }));
}
