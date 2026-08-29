import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { cn } from '@/utils';
import { useKitchenStore } from '@/store';
import NotificationPanel from './NotificationPanel';
import Logo from '@/components/common/Logo';
/**
 * Kitchen header with logo, title, live clock, notifications,
 * staff profile and online/offline toggle.
 */
export default function KitchenHeader({ onMenuClick }) {
    const [now, setNow] = useState(() => new Date());
    const [notifOpen, setNotifOpen] = useState(false);
    const headerStatus = useKitchenStore((s) => s.headerStatus);
    const onlineStatus = useKitchenStore((s) => s.onlineStatus);
    const notifications = useKitchenStore((s) => s.notifications);
    const unread = notifications.filter((n) => !n.isRead).length;
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    return (_jsx("header", { className: "sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-900/80", children: _jsxs("div", { className: "flex h-16 items-center justify-between px-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: onMenuClick, className: "rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden", "aria-label": "Open menu", children: _jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }), _jsx(Logo, { size: "sm", showText: false }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("h1", { className: "text-base font-bold text-neutral-900 dark:text-white", children: "Kitchen" }), _jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "RestaurantOS \u00B7 Kitchen" })] })] }), _jsx("div", { className: "hidden items-center gap-4 md:flex", children: _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-200", children: dateStr }), _jsx("p", { className: "font-mono text-sm text-primary-500", children: timeStr })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => onlineStatus(headerStatus === 'online' ? 'offline' : 'online'), className: cn('hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:flex', headerStatus === 'online'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300'), children: [_jsx("span", { className: cn('h-2 w-2 rounded-full', headerStatus === 'online' ? 'bg-green-500' : 'bg-neutral-400') }), headerStatus === 'online' ? 'Online' : 'Offline'] }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setNotifOpen((o) => !o), className: "relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300", "aria-label": "Notifications", children: [_jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }), unread > 0 && (_jsx("span", { className: "absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white", children: unread }))] }), notifOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setNotifOpen(false) }), _jsx("div", { className: "relative z-50", children: _jsx(NotificationPanel, {}) })] }))] }), _jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5 dark:border-neutral-700", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white", children: "KS" }), _jsxs("div", { className: "hidden leading-tight sm:block", children: [_jsx("p", { className: "text-sm font-medium text-neutral-900 dark:text-white", children: "Kitchen Staff" }), _jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: "Chef" })] })] })] })] }) }));
}
