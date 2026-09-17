const { Server } = require('socket.io');

// Real-time seat-swap namespace mounted on the same Express HTTP server.
// Clients join a room per showtime ('showtime:<id>') and a room per user
// ('user:<userId>'). The server relays swap events directly to a target user's
// device via 'swap_received'.
function initSeatSwap(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.of('/seat-swap').on('connection', socket => {
    console.log('[socket] client connected:', socket.id);

    socket.on('join-showtime', showtimeId => {
      socket.join(`showtime:${showtimeId}`);
    });

    socket.on('leave-showtime', showtimeId => {
      socket.leave(`showtime:${showtimeId}`);
    });

    socket.on('join-user', userId => {
      socket.join(`user:${userId}`);
    });

    // Client-driven initiate: server relays 'swap_received' to the target user's device
    socket.on('initiate_swap', payload => {
      const { targetUserId, initiatorId, showtimeId, requestId, message } = payload || {};
      io.to(`user:${targetUserId}`).emit('swap_received', {
        type: 'initiate_swap',
        showtimeId,
        requestId,
        message: message || 'You have a new seat swap request!',
        swappedAt: new Date().toISOString(),
      });
      if (initiatorId) {
        io.to(`user:${initiatorId}`).emit('swap_received', {
          type: 'initiate_swap_sent',
          showtimeId,
          requestId,
          message: 'Your swap request has been sent.',
        });
      }
    });

    // Relay accept/reject results back to both users' devices
    socket.on('accept_swap', payload => {
      const { initiatorId, targetId, showtimeId, requestId } = payload || {};
      const eventPayload = {
        type: 'swap_result',
        action: 'accepted',
        showtimeId,
        requestId,
        message: 'Seat swap accepted!',
        swappedAt: new Date().toISOString(),
      };
      io.to(`user:${initiatorId}`).emit('swap_received', eventPayload);
      io.to(`user:${targetId}`).emit('swap_received', eventPayload);
      socket.to(`showtime:${showtimeId}`).emit('seat-swapped', eventPayload);
    });

    socket.on('reject_swap', payload => {
      const { initiatorId, targetId, showtimeId } = payload || {};
      const eventPayload = {
        type: 'swap_result',
        action: 'rejected',
        showtimeId,
        message: 'Swap request was declined.',
      };
      io.to(`user:${initiatorId}`).emit('swap_received', eventPayload);
      io.to(`user:${targetId}`).emit('swap_received', eventPayload);
    });

    socket.on('disconnect', () => {
      console.log('[socket] client disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initSeatSwap;