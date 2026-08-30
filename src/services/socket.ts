import { io, type Socket } from 'socket.io-client';
import config from '@/config';
import { useOrderSyncStore } from '@/store/orderSyncStore';

let socket: Socket | null = null;

function readTokenPayload(token: string): { exp?: number; restaurantId?: string; branchId?: string; role?: string } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function hasValidToken() {
  const token = localStorage.getItem(config.auth.tokenKey || 'restaurantos-token');
  if (!token) return false;

  const payload = readTokenPayload(token);
  if (!payload) return false;

  if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
    return false;
  }

  return Boolean(payload.role);
}

function emitOrderSync(event: { type: 'create' | 'update' | 'delete'; orderId?: string; status?: string; at: string }) {
  useOrderSyncStore.getState().notifyOrderChange(event);
}

export const socketService = {
  connect() {
    if (!hasValidToken()) {
      socket?.disconnect();
      socket = null;
      return null;
    }

    const token = localStorage.getItem(config.auth.tokenKey || 'restaurantos-token');
    if (!token) return null;
    if (socket?.connected) return socket;

    try {
      socket = io(config.api.baseUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        auth: { token },
      });

      socket.on('connect', () => {
        // no-op: socket is connected and backend will scope rooms by tenant
      });

      socket.on('connect_error', () => {
        // Ignore socket handshake failures; the app will continue using the REST refresh path.
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
    } catch {
      socket = null;
    }

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
