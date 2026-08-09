import { create } from 'zustand';
export const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: notification.isRead
            ? state.unreadCount
            : state.unreadCount + 1,
    })),
    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1),
    })),
    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
    })),
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: state.notifications.find((n) => n.id === id && !n.isRead)
            ? state.unreadCount - 1
            : state.unreadCount,
    })),
    clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    toggleNotifications: () => set((state) => ({ isOpen: !state.isOpen })),
    setOpen: (isOpen) => set({ isOpen }),
}));
