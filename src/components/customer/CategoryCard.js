import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function CategoryCard({ category, isActive, onClick }) {
    return (_jsxs("button", { onClick: () => onClick(category.id), className: `flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-200 min-w-[90px] ${isActive
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'}`, children: [_jsx("span", { className: "text-3xl", children: category.icon }), _jsx("span", { className: "text-xs font-semibold whitespace-nowrap", children: category.name }), category.itemCount > 0 && (_jsxs("span", { className: `text-[10px] font-medium ${isActive ? 'text-white/70' : 'text-neutral-400'}`, children: [category.itemCount, " items"] }))] }));
}
