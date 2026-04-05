const { Server } = require('socket.io');
const { clientUrl } = require('./env');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./env');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Socket: no auth token'));
    try {
      const decoded = jwt.verify(token, jwtSecret);
      socket.userId = decoded.id;
      socket.role   = decoded.role;
      next();
    } catch {
      next(new Error('Socket: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] connected: ${socket.userId}`);

    socket.on('join:room', (roomId) => {
      socket.join(`room:${roomId}`);
      socket.emit('joined', { roomId });
    });

    socket.on('leave:room', (roomId) => {
      socket.leave(`room:${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] disconnected: ${socket.userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket not initialized');
  return io;
}

module.exports = { initSocket, getIO };
