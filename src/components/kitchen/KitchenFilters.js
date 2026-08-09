import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Search from '@/components/ui/Search';
import Select from '@/components/ui/Select';
import { cn } from '@/utils';
import { useKitchenStore } from '@/store';
const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'high-priority', label: 'High Priority' },
];
const orderTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'dine-in', label: 'Dine In' },
    { value: 'takeaway', label: 'Takeaway' },
    { value: 'delivery', label: 'Delivery' },
];
/**
 * Reusable filter bar for kitchen pages.
 * Manages search, status, table and order-type filters via the kitchen store.
 */
export default function KitchenFilters({ showStatus = true, showSearch = true, showTable = true, showOrderType = true, className, }) {
    const store = useKitchenStore();
    // Unique table numbers present in the orders.
    const tables = Array.from(new Set(store.orders.map((o) => o.tableNumber).filter((t) => !!t))).sort((a, b) => a - b);
    const tableOptions = [
        { value: 'all', label: 'All Tables' },
        ...tables.map((t) => ({ value: String(t), label: `Table ${t}` })),
    ];
    return (_jsxs("div", { className: cn('flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap', className), children: [showStatus && (_jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: statusOptions.map((opt) => (_jsx("button", { onClick: () => store.setStatusFilter(opt.value), className: cn('rounded-full px-3 py-1.5 text-sm font-medium transition-colors', store.statusFilter === opt.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'), children: opt.label }, opt.value))) })), showSearch && (_jsx(Search, { placeholder: "Search order number...", value: store.searchQuery, onChange: (e) => store.setSearchQuery(e.target.value), onClear: () => store.setSearchQuery(''), className: "lg:max-w-[220px]" })), showTable && (_jsx(Select, { options: tableOptions, value: store.tableFilter, onChange: (e) => store.setTableFilter(e.target.value), className: "lg:w-40" })), showOrderType && (_jsx(Select, { options: orderTypeOptions, value: store.orderTypeFilter, onChange: (e) => store.setOrderTypeFilter(e.target.value), className: "lg:w-40" }))] }));
}
