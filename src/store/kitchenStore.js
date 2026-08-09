import { create } from 'zustand';
import { kitchenOrders, kitchenNotifications } from '@/data/kitchenOrders';
import { useToastStore } from '@/store/toastStore';
import { useNotificationStore } from '@/store/notificationStore';
const nowISO = () => new Date().toISOString();
const mapToGlobalNotification = (n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt,
});
export const useKitchenStore = create((set, get) => ({
    orders: kitchenOrders,
    notifications: kitchenNotifications,
    headerStatus: 'online',
    activeOrderId: null,
    statusFilter: 'all',
    searchQuery: '',
    tableFilter: 'all',
    orderTypeFilter: 'all',
    onlineStatus: (status) => {
        set({ headerStatus: status });
        useToastStore
            .getState()
            .showToast(status === 'online' ? 'Kitchen is now Online' : 'Kitchen is now Offline', status === 'online' ? 'success' : 'warning');
    },
    setActiveOrder: (id) => set({ activeOrderId: id }),
    acceptOrder: (id) => {
        set((state) => ({
            orders: state.orders.map((o) => o.id === id
                ? { ...o, status: 'confirmed', acceptedAt: o.acceptedAt ?? nowISO() }
                : o),
        }));
        useToastStore.getState().showToast(`Order accepted`, 'success');
    },
    rejectOrder: (id) => {
        const order = get().orders.find((o) => o.id === id);
        set((state) => ({
            orders: state.orders.map((o) => o.id === id ? { ...o, status: 'rejected' } : o),
        }));
        useToastStore
            .getState()
            .showToast(`Order ${order?.orderNumber ?? ''} rejected`, 'error');
    },
    startPreparing: (id) => {
        set((state) => ({
            orders: state.orders.map((o) => o.id === id
                ? { ...o, status: 'preparing', startedAt: o.startedAt ?? nowISO() }
                : o),
        }));
        useToastStore.getState().showToast('Preparation started', 'info');
    },
    markReady: (id) => {
        set((state) => ({
            orders: state.orders.map((o) => o.id === id
                ? { ...o, status: 'ready', readyAt: o.readyAt ?? nowISO() }
                : o),
        }));
        useToastStore.getState().showToast('Order marked ready', 'success');
    },
    completeOrder: (id) => {
        set((state) => ({
            orders: state.orders.map((o) => o.id === id
                ? { ...o, status: 'completed', completedAt: nowISO() }
                : o),
        }));
        useToastStore.getState().showToast('Order completed', 'success');
    },
    cancelOrder: (id) => {
        set((state) => ({
            orders: state.orders.map((o) => o.id === id ? { ...o, status: 'cancelled' } : o),
        }));
        useToastStore.getState().showToast('Order cancelled', 'warning');
    },
    updateStatus: (id, status) => {
        set((state) => ({
            orders: state.orders.map((o) => {
                if (o.id !== id)
                    return o;
                const next = { ...o, status, updatedAt: nowISO() };
                if (status === 'confirmed')
                    next.acceptedAt = o.acceptedAt ?? nowISO();
                if (status === 'preparing')
                    next.startedAt = o.startedAt ?? nowISO();
                if (status === 'ready')
                    next.readyAt = o.readyAt ?? nowISO();
                if (status === 'completed')
                    next.completedAt = nowISO();
                return next;
            }),
        }));
    },
    updatePriority: (id, priority) => {
        set((state) => ({
            orders: state.orders.map((o) => o.id === id ? { ...o, priority } : o),
        }));
        useToastStore
            .getState()
            .showToast(`Priority updated to ${priority}`, 'info');
        if (priority === 'high' || priority === 'urgent') {
            const order = get().orders.find((o) => o.id === id);
            get().addNotification({
                id: `knote-${Date.now()}`,
                title: 'High Priority',
                message: `${order?.orderNumber ?? ''} priority set to ${priority}`,
                type: 'warning',
                isRead: false,
                createdAt: nowISO(),
                orderId: id,
            });
        }
    },
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setTableFilter: (tableFilter) => set({ tableFilter }),
    setOrderTypeFilter: (orderTypeFilter) => set({ orderTypeFilter }),
    markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    })),
    markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
    addNotification: (n) => {
        set((state) => ({
            notifications: [n, ...state.notifications].slice(0, 50),
        }));
        useNotificationStore.getState().addNotification(mapToGlobalNotification(n));
    },
}));
// ---- Selector helpers ----
export const selectOrderById = (id) => (state) => state.orders.find((o) => o.id === id);
export const selectCounts = (state) => {
    const orders = state.orders;
    return {
        new: orders.filter((o) => o.status === 'new').length,
        confirmed: orders.filter((o) => o.status === 'confirmed').length,
        preparing: orders.filter((o) => o.status === 'preparing').length,
        ready: orders.filter((o) => o.status === 'ready').length,
        completed: orders.filter((o) => o.status === 'completed').length,
        delayed: orders.filter((o) => o.status === 'preparing' && isDelayed(o)).length,
    };
};
export const isDelayed = (order) => {
    if (!order.startedAt)
        return false;
    const elapsed = (Date.now() - new Date(order.startedAt).getTime()) / 60_000;
    return elapsed > order.expectedPrepTimeMin;
};
export const getElapsedMinutes = (order) => {
    const start = order.startedAt || order.acceptedAt || order.createdAt;
    return Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 60_000));
};
export const getWaitingMinutes = (order) => {
    if (!order.readyAt)
        return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(order.readyAt).getTime()) / 60_000));
};
export const getPrepProgress = (order) => {
    if (!order.startedAt)
        return 0;
    const elapsed = (Date.now() - new Date(order.startedAt).getTime()) / 60_000;
    const pct = Math.min(100, Math.round((elapsed / order.expectedPrepTimeMin) * 100));
    return pct;
};
export const getTotalPrepMinutes = (order) => {
    if (order.completedAt && order.startedAt) {
        return Math.round((new Date(order.completedAt).getTime() - new Date(order.startedAt).getTime()) / 60_000);
    }
    return getElapsedMinutes(order);
};
