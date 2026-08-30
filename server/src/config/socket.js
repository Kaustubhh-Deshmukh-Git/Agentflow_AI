const { Server } = require('socket.io');
const env = require('./env');

let io;

const getCorsOrigin = (origin, callback) => {
  // Allow all origins in non-production or if wildcard configured
  if (!origin || env.NODE_ENV !== 'production') {
    return callback(null, true);
  }

  // Parse comma-separated list of allowed CLIENT_URL origins
  const allowedOrigins = (env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Check if origin matches Vercel preview or custom domains
  if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.endsWith('.railway.app')) {
    return callback(null, true);
  }

  return callback(null, true); // Permissive for websocket connections in cloud environments
};

module.exports = {
  initSocket: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: getCorsOrigin,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      // Join execution room for live timeline events
      socket.on('subscribe_execution', (executionId) => {
        if (executionId) {
          socket.join(executionId.toString());
          console.log(`[Socket.IO] Socket ${socket.id} subscribed to execution: ${executionId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  getIo: () => {
    if (!io) {
      return { to: () => ({ emit: () => {} }), emit: () => {} };
    }
    return io;
  },
};
