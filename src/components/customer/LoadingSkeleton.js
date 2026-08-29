import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
function SkeletonBlock({ className }) {
    return (_jsx("div", { className: cn('animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700', className) }));
}
function FoodCardSkeleton() {
    return (_jsxs("div", { className: "rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800", children: [_jsx(SkeletonBlock, { className: "mb-3 h-40 w-full rounded-xl" }), _jsx(SkeletonBlock, { className: "mb-2 h-5 w-3/4" }), _jsx(SkeletonBlock, { className: "mb-2 h-4 w-1/2" }), _jsx(SkeletonBlock, { className: "mb-3 h-4 w-full" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(SkeletonBlock, { className: "h-6 w-20" }), _jsx(SkeletonBlock, { className: "h-10 w-24 rounded-lg" })] })] }));
}
function ListSkeleton() {
    return (_jsxs("div", { className: "flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800", children: [_jsx(SkeletonBlock, { className: "h-16 w-16 flex-shrink-0 rounded-lg" }), _jsxs("div", { className: "flex-1", children: [_jsx(SkeletonBlock, { className: "mb-2 h-5 w-3/4" }), _jsx(SkeletonBlock, { className: "h-4 w-1/2" })] }), _jsx(SkeletonBlock, { className: "h-6 w-16" })] }));
}
function DetailSkeleton() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(SkeletonBlock, { className: "h-64 w-full rounded-2xl" }), _jsxs("div", { className: "space-y-3", children: [_jsx(SkeletonBlock, { className: "h-8 w-3/4" }), _jsx(SkeletonBlock, { className: "h-4 w-1/4" }), _jsx(SkeletonBlock, { className: "h-20 w-full" })] }), _jsx("div", { className: "flex gap-2", children: [1, 2, 3, 4].map((i) => (_jsx(SkeletonBlock, { className: "h-8 w-20 rounded-full" }, i))) })] }));
}
export default function LoadingSkeleton({ type = 'card', count = 6, className, }) {
    if (type === 'detail')
        return _jsx(DetailSkeleton, {});
    if (type === 'list') {
        return (_jsx("div", { className: cn('space-y-3', className), children: Array.from({ length: count }).map((_, i) => (_jsx(ListSkeleton, {}, i))) }));
    }
    return (_jsx("div", { className: cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className), children: Array.from({ length: count }).map((_, i) => (_jsx(FoodCardSkeleton, {}, i))) }));
}
