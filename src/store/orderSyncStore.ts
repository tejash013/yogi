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
  notifyOrderChange: (event) =>
    set((state) => ({
      version: state.version + 1,
      lastEvent: event,
    })),
  notifyResourceChange: (event) =>
    set((state) => ({
      version: state.version + 1,
      lastEvent: event,
    })),
}));
