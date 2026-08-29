import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { cn } from '@/utils';
const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
};
const typeIcons = {
    success: (_jsx("svg", { className: "h-5 w-5 text-green-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })),
    error: (_jsx("svg", { className: "h-5 w-5 text-red-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })),
    warning: (_jsx("svg", { className: "h-5 w-5 text-yellow-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" }) })),
    info: (_jsx("svg", { className: "h-5 w-5 text-blue-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) })),
};
export function Toast({ toast, onDismiss }) {
    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onDismiss]);
    return (_jsxs("div", { className: cn('flex items-start gap-3 rounded-lg border p-4 shadow-lg', typeStyles[toast.type || 'info']), children: [toast.type && typeIcons[toast.type], _jsx("p", { className: "flex-1 text-sm", children: toast.message }), toast.action && (_jsx("button", { onClick: toast.action.onClick, className: "text-sm font-medium underline", children: toast.action.label })), _jsx("button", { onClick: () => onDismiss(toast.id), className: "text-current opacity-50 hover:opacity-100", children: _jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }));
}
export function ToastContainer({ toasts, onDismiss }) {
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm", children: toasts.map((toast) => (_jsx(Toast, { toast: toast, onDismiss: onDismiss }, toast.id))) }));
}
