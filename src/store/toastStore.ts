import { create } from 'zustand';
import type { ToastData } from '@/components/ui/Toast';

interface ToastState {
  toasts: ToastData[];
  showToast: (
    message: string,
    type?: ToastData['type'],
    duration?: number,
    action?: ToastData['action']
  ) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const DEFAULT_DURATION = 4000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message, type = 'info', duration = DEFAULT_DURATION, action) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast: ToastData = { id, message, type, duration, action };
    set((state) => ({ toasts: [...state.toasts, toast] }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}));
