import type { Server as SocketIOServer, Socket } from 'socket.io';

export function attachSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    socket.emit('connected', { ok: true });

    socket.on('disconnect', () => {
      // Socket disconnect handling can be added here later.
    });
  });
}
