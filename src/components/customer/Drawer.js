import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { cn } from '@/utils';
export default function Drawer({ isOpen, onClose, title, children, position = 'right', }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const positionClasses = {
        left: 'left-0 top-0 h-full w-80 max-w-[85vw]',
        right: 'right-0 top-0 h-full w-80 max-w-[85vw]',
        bottom: 'bottom-0 left-0 w-full max-h-[85vh] rounded-t-2xl',
    };
    const slideClasses = {
        left: 'animate-slide-in-left',
        right: 'animate-slide-in-right',
        bottom: 'animate-slide-up',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: cn('fixed flex flex-col bg-white shadow-modal dark:bg-neutral-800', positionClasses[position], slideClasses[position]), children: [_jsxs("div", { className: "flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-700", children: [title && (_jsx("h2", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: title })), _jsx("button", { onClick: onClose, className: "rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700", children: _jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4", children: children })] })] }));
}
