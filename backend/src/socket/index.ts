import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';

export function attachSocketHandlers(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.emit('connected', { ok: true });

    socket.on('disconnect', () => {
      // Socket disconnect handling can be added here later.
    });
  });
}
