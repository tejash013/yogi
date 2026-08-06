export function attachSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.emit('connected', { ok: true });

    socket.on('disconnect', () => {
      // Socket disconnect handling can be added here later.
    });
  });
}
