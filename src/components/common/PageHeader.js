import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';
export default function PageHeader({ title, description, breadcrumbs, actions, className, }) {
    return (_jsxs("div", { className: cn('mb-6', className), children: [breadcrumbs && breadcrumbs.length > 0 && (_jsx(Breadcrumb, { items: breadcrumbs, className: "mb-3" })), _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-neutral-900 dark:text-white", children: title }), description && (_jsx("p", { className: "mt-1 text-sm text-neutral-500", children: description }))] }), actions && _jsx("div", { className: "flex items-center gap-3", children: actions })] })] }));
}
