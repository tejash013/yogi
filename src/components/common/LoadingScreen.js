import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Logo from './Logo';
export default function LoadingScreen({ message = 'Loading...', }) {
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-neutral-900", children: [_jsx(Logo, { size: "lg" }), _jsxs("div", { className: "mt-6 flex items-center gap-2", children: [_jsx("div", { className: "h-2 w-2 animate-bounce rounded-full bg-primary-500", style: { animationDelay: '0s' } }), _jsx("div", { className: "h-2 w-2 animate-bounce rounded-full bg-primary-500", style: { animationDelay: '0.15s' } }), _jsx("div", { className: "h-2 w-2 animate-bounce rounded-full bg-primary-500", style: { animationDelay: '0.3s' } })] }), _jsx("p", { className: "mt-4 text-sm text-neutral-500", children: message })] }));
}
