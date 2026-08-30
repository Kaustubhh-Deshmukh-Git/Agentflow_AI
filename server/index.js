const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');

const env = require('./src/config/env');
const connectDB = require('./src/config/db');

// Import routes
const { router: authRoutes } = require('./src/routes/authRoutes');
const workflowRoutes = require('./src/routes/workflowRoutes');
const executionRoutes = require('./src/routes/executionRoutes');
const integrationRoutes = require('./src/routes/integrationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const httpServer = createServer(app);

// Init WebSockets and Background Queues
const { initSocket } = require('./src/config/socket');
const { initQueues } = require('./src/queues/executionQueue');
initSocket(httpServer);
initQueues();

// Connect to MongoDB Cloud (or fallback)
connectDB();

// CORS Configuration with multi-domain cloud support
const allowedOrigins = (env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.NODE_ENV !== 'production') return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.endsWith('.railway.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate-limit auth endpoints in production
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.json({
    name: 'Agentflow_AI API Engine',
    version: '1.0.0',
    status: 'online',
    docs: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'ok',
    environment: env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected (MongoDB Cloud)' : 'in-memory fallback',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handling
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Agentflow AI Server running on port ${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Client Origins: ${allowedOrigins.join(', ')}\n`);
});
