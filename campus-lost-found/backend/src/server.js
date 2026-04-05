const http = require('http');
const app  = require('./app');
const { connectDB }   = require('./config/db');
const { initSocket }  = require('./config/socket');
const { port, nodeEnv } = require('./config/env');

async function bootstrap() {
  // Create HTTP server (required for Socket.io)
  const httpServer = http.createServer(app);

  // Listen immediately so health checks always work
  httpServer.listen(port, () => {
    console.log(`\n====================================`);
    console.log(` FindHUB Backend — ${nodeEnv.toUpperCase()}`);
    console.log(` http://localhost:${port}`);
    console.log(`====================================\n`);
  });

  // Initialize Socket.io
  initSocket(httpServer);

  // Connect to MongoDB (non-blocking in dev)
  connectDB().catch((err) => {
    console.error('[DB] Could not connect:', err.message);
    if (nodeEnv === 'production') process.exit(1);
    else console.warn('[DB] Running without DB — some routes will fail.');
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[${signal}] Graceful shutdown...`);
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException',  (err) => { console.error('[UNCAUGHT]', err); process.exit(1); });
  process.on('unhandledRejection', (err) => { console.error('[UNHANDLED]', err); });
}

bootstrap().catch((err) => {
  console.error('[BOOT ERROR]', err.message);
  process.exit(1);
});
