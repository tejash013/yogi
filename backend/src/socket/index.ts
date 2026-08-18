import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { setIO } from './socketServer.js';

export function attachSocketHandlers(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
    },
  });

  setIO(io);

  io.on('connection', (socket) => {
    socket.emit('connected', { ok: true });

    socket.on('join', (room) => {
      if (room) socket.join(room);
    });

    socket.on('leave', (room) => {
      if (room) socket.leave(room);
    });

    socket.on('disconnect', () => {
      // handle cleanup if needed
    });
  });
}
