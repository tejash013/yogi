import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { setIO } from './socketServer.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

export function attachSocketHandlers(server: HttpServer) {
  const configuredOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (configuredOrigins.length > 0 && configuredOrigins.includes(origin)) {
          return callback(null, true);
        }
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return callback(null, true);
        }
        if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        if (configuredOrigins.length === 0) {
          return callback(null, true);
        }
        return callback(new Error('Origin is not allowed'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  setIO(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token ?? socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyAccessToken(token);
      const user = await User.findById(String(payload.id)).lean().exec();
      if (!user || user.status !== 'active' || payload.tokenVersion !== user.tokenVersion) return next(new Error('Unauthorized'));
      socket.data.user = { id: String(user._id), role: user.role, restaurantId: String(user.restaurantId), branchId: String(user.branchId) };
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.data.user.id);
    const tenant = `${socket.data.user.restaurantId}:${socket.data.user.branchId}`;
    socket.join(`${tenant}:user:${userId}`);
    if (socket.data.user.role !== 'customer') socket.join(`${tenant}:staff:orders`);
    socket.emit('connected', { ok: true });

    socket.on('join', (room) => {
      if (typeof room !== 'string' || !room || room.length > 100) return;
      if (room === `user:${socket.data.user.restaurantId}:${socket.data.user.branchId}:user:${socket.data.user.id}`) socket.join(room);
    });

    socket.on('leave', (room) => {
      if (typeof room === 'string') socket.leave(room);
    });

    socket.on('disconnect', () => {
      // handle cleanup if needed
    });
  });
}
