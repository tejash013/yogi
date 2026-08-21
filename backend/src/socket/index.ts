import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { setIO } from './socketServer.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

export function attachSocketHandlers(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: (process.env.FRONTEND_URL ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()),
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
