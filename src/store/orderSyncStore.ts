import { create } from 'zustand';

interface ResourceEvent {
  type: 'create' | 'update' | 'delete';
  resource?:
    | 'order'
    | 'category'
    | 'menu'
    | 'invoice'
    | 'payment'
    | 'coupon'
    | 'report'
    | 'settings'
    | 'user'
    | 'auth';
  orderId?: string;
  status?: string;
  at: string;
}

interface OrderSyncState {
  version: number;
  lastEvent: ResourceEvent | null;
  refresh: () => void;
  notifyOrderChange: (event: ResourceEvent) => void;
  notifyResourceChange: (event: ResourceEvent) => void;
}

export const useOrderSyncStore = create<OrderSyncState>((set) => ({
  version: 0,
  lastEvent: null,
  refresh: () => set((state) => ({ version: state.version + 1 })),
  notifyOrderChange: (event) => {
    const syncEvent = {
      ...event,
      at: event.at || new Date().toISOString(),
    };
    localStorage.setItem('restaurantos-order-sync', JSON.stringify(syncEvent));
    set((state) => ({
      version: state.version + 1,
      lastEvent: syncEvent,
    }));
  },
  notifyResourceChange: (event) => {
    const syncEvent = {
      ...event,
      at: event.at || new Date().toISOString(),
    };
    localStorage.setItem('restaurantos-order-sync', JSON.stringify(syncEvent));
    set((state) => ({
      version: state.version + 1,
      lastEvent: syncEvent,
    }));
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== 'restaurantos-order-sync' || !event.newValue) return;
    try {
      const payload = JSON.parse(event.newValue) as ResourceEvent;
      useOrderSyncStore.setState((state) => ({
        version: state.version + 1,
        lastEvent: payload,
      }));
    } catch {
      // ignore malformed payloads
    }
  });
}
