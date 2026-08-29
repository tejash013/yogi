import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { PageHeader } from '@/components/common';
import { OrderBoard, OrderDetails, KitchenFilters } from '@/components/kitchen';
import { useKitchenStore, isDelayed } from '@/store';
/**
 * Live Orders board: multi-column view of NEW / CONFIRMED / PREPARING / READY
 * orders with working status-transition actions.
 */
export default function LiveOrders() {
    const orders = useKitchenStore((s) => s.orders);
    const statusFilter = useKitchenStore((s) => s.statusFilter);
    const searchQuery = useKitchenStore((s) => s.searchQuery);
    const tableFilter = useKitchenStore((s) => s.tableFilter);
    const orderTypeFilter = useKitchenStore((s) => s.orderTypeFilter);
    const activeOrderId = useKitchenStore((s) => s.activeOrderId);
    const setActiveOrder = useKitchenStore((s) => s.setActiveOrder);
    const filtered = useMemo(() => {
        return orders.filter((o) => {
            // Only show active statuses on the board
            if (!['new', 'confirmed', 'preparing', 'ready'].includes(o.status))
                return false;
            // Status filter
            if (statusFilter === 'delayed' && !(o.status === 'preparing' && isDelayed(o)))
                return false;
            if (statusFilter === 'high-priority' && o.priority === 'normal')
                return false;
            if (['new', 'confirmed', 'preparing', 'ready'].includes(statusFilter) && o.status !== statusFilter)
                return false;
            // Search
            if (searchQuery && !o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                return false;
            // Table filter
            if (tableFilter !== 'all' && String(o.tableNumber) !== tableFilter)
                return false;
            // Order type filter
            if (orderTypeFilter !== 'all' && o.orderType !== orderTypeFilter)
                return false;
            return true;
        });
    }, [orders, statusFilter, searchQuery, tableFilter, orderTypeFilter]);
    const columns = [
        {
            key: 'new',
            label: 'New',
            accent: 'bg-yellow-500',
            orders: filtered.filter((o) => o.status === 'new'),
        },
        {
            key: 'confirmed',
            label: 'Confirmed',
            accent: 'bg-blue-500',
            orders: filtered.filter((o) => o.status === 'confirmed'),
        },
        {
            key: 'preparing',
            label: 'Preparing',
            accent: 'bg-primary-500',
            orders: filtered.filter((o) => o.status === 'preparing'),
        },
        {
            key: 'ready',
            label: 'Ready',
            accent: 'bg-green-500',
            orders: filtered.filter((o) => o.status === 'ready'),
        },
    ];
    const activeOrder = activeOrderId
        ? orders.find((o) => o.id === activeOrderId) ?? null
        : null;
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Live Orders", description: "Real-time order board \u2014 accept, prepare and complete orders" }), _jsx(KitchenFilters, {}), _jsx(OrderBoard, { columns: columns, onOpenOrder: setActiveOrder }), _jsx(OrderDetails, { order: activeOrder, onClose: () => setActiveOrder(null) })] }));
}
