import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize = 10, }) {
    if (totalPages <= 1)
        return null;
    const getPageNumbers = () => {
        const pages = [];
        const delta = 1;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)) {
                pages.push(i);
            }
            else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems ?? 0);
    return (_jsxs("div", { className: "flex flex-col items-center gap-3 sm:flex-row sm:justify-between", children: [totalItems && (_jsxs("p", { className: "text-sm text-neutral-500", children: ["Showing ", _jsx("span", { className: "font-medium", children: startItem }), " to", ' ', _jsx("span", { className: "font-medium", children: endItem }), " of", ' ', _jsx("span", { className: "font-medium", children: totalItems }), " results"] })), _jsxs("nav", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => onPageChange(currentPage - 1), disabled: currentPage === 1, className: cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800', 'disabled:cursor-not-allowed disabled:opacity-50'), children: "Previous" }), getPageNumbers().map((page, index) => typeof page === 'string' ? (_jsx("span", { className: "px-2 text-neutral-400", children: "..." }, `ellipsis-${index}`)) : (_jsx("button", { onClick: () => onPageChange(page), className: cn('min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition-colors', page === currentPage
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800'), children: page }, page))), _jsx("button", { onClick: () => onPageChange(currentPage + 1), disabled: currentPage === totalPages, className: cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800', 'disabled:cursor-not-allowed disabled:opacity-50'), children: "Next" })] })] }));
}
