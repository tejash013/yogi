import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};
export default function Loader({ size = 'md', variant = 'spinner', fullPage = false, label, }) {
    if (fullPage) {
        return (_jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-neutral-900/80", children: [_jsx(LoaderContent, { size: size, variant: variant }), label && (_jsx("p", { className: "mt-4 text-sm text-neutral-600 dark:text-neutral-400", children: label }))] }));
    }
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-8", children: [_jsx(LoaderContent, { size: size, variant: variant }), label && (_jsx("p", { className: "mt-2 text-sm text-neutral-500", children: label }))] }));
}
function LoaderContent({ size, variant, }) {
    if (variant === 'dots') {
        return (_jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((dot) => (_jsx("div", { className: cn('animate-bounce rounded-full bg-primary-500', sizes[size]), style: { animationDelay: `${dot * 0.15}s` } }, dot))) }));
    }
    if (variant === 'pulse') {
        return (_jsx("div", { className: cn('animate-pulse rounded-full bg-primary-500/30', sizes[size]) }));
    }
    return (_jsxs("svg", { className: cn('animate-spin text-primary-500', sizes[size]), xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }));
}
