import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { cn } from '@/utils';
import { getPrepProgress, isDelayed } from '@/store/kitchenStore';
const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
/**
 * Live preparation timer with a progress bar.
 * Counts elapsed time since the order started preparing.
 */
export default function OrderTimer({ order, compact = false }) {
    const started = order.startedAt || order.acceptedAt || order.createdAt;
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);
    const elapsedSeconds = started
        ? Math.max(0, (now - new Date(started).getTime()) / 1000)
        : 0;
    const progress = getPrepProgress(order);
    const delayed = isDelayed(order);
    return (_jsxs("div", { className: "w-full", children: [!compact && (_jsxs("div", { className: "mb-1 flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-neutral-500 dark:text-neutral-400", children: "Elapsed" }), _jsxs("span", { className: cn('font-mono font-medium', delayed
                            ? 'text-error'
                            : 'text-neutral-700 dark:text-neutral-200'), children: ["\u23F1 ", formatTime(elapsedSeconds)] })] })), _jsxs("div", { className: "flex items-center gap-2", children: [compact && (_jsxs("span", { className: cn('font-mono text-sm font-medium', delayed ? 'text-error' : 'text-neutral-700 dark:text-neutral-200'), children: ["\u23F1 ", formatTime(elapsedSeconds)] })), _jsx("div", { className: "h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700", children: _jsx("div", { className: cn('h-full rounded-full transition-all duration-700', delayed ? 'bg-error' : 'bg-primary-500'), style: { width: `${Math.min(100, progress)}%` } }) }), !compact && (_jsxs("span", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: [progress, "%"] }))] }), !compact && (_jsxs("p", { className: "mt-1 text-xs text-neutral-500 dark:text-neutral-400", children: ["Expected: ", order.expectedPrepTimeMin, " min"] }))] }));
}
