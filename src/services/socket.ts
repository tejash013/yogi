import { io, type Socket } from 'socket.io-client';
import config from '@/config';
import { useOrderSyncStore } from '@/store/orderSyncStore';

let socket: Socket | null = null;

function emitOrderSync(event: { type: 'create' | 'update' | 'delete'; orderId?: string; status?: string; at: string }) {
  useOrderSyncStore.getState().notifyOrderChange(event);
}

export const socketService = {
  connect() {
    const token = localStorage.getItem(config.auth.tokenKey || 'restaurantos-token');
    if (!token) return null;

    if (socket?.connected) return socket;

    socket = io(config.api.baseUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token },
    });

    socket.on('connect', () => {
      // no-op: socket is connected and backend will scope rooms by tenant
    });

    socket.on('connect_error', () => {
      // no-op: the app will continue using the polling refresh fallback if live socket is unavailable
    });

    socket.on('order:created', (payload: any) => {
      emitOrderSync({
        type: 'create',
        orderId: String(payload?.id ?? payload?._id ?? payload?.orderId ?? 'unknown'),
        status: 'pending',
        at: new Date().toISOString(),
      });
    });

    socket.on('order:status:update', (payload: any) => {
      emitOrderSync({
        type: 'update',
        orderId: String(payload?.id ?? payload?._id ?? payload?.orderId ?? 'unknown'),
        status: String(payload?.status ?? 'pending'),
        at: new Date().toISOString(),
      });
    });

    return socket;
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  },

  getSocket() {
    return socket;
  },
};
