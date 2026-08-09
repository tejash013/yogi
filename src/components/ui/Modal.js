import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { cn } from '@/utils';
const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};
export default function Modal({ isOpen, onClose, title, children, size = 'md', showCloseButton = true, }) {
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
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: cn('relative w-full rounded-2xl bg-white shadow-modal dark:bg-neutral-800', sizes[size]), children: [(title || showCloseButton) && (_jsxs("div", { className: "flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700", children: [title && (_jsx("h2", { className: "text-lg font-semibold text-neutral-900 dark:text-white", children: title })), showCloseButton && (_jsx("button", { onClick: onClose, className: "rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700", children: _jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] })), _jsx("div", { className: "px-6 py-4", children: children })] })] }));
}
