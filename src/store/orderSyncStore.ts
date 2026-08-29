import { create } from 'zustand';

interface OrderEvent {
  type: 'create' | 'update';
  orderId?: string;
  status?: string;
  at: string;
}

interface OrderSyncState {
  version: number;
  lastEvent: OrderEvent | null;
  refresh: () => void;
  notifyOrderChange: (event: OrderEvent) => void;
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
}));
