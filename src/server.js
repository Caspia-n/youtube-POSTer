const app = require('./app');
const config = require('./config/config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] YouTube POSTer API started`);
  console.log(`  Environment: ${config.environment}`);
  console.log(`  Port: ${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  - Root: http://localhost:${PORT}/`);
  console.log(`  - OAuth Setup: http://localhost:${PORT}/oauth/authorize`);
  console.log(`  - API Upload: http://localhost:${PORT}/api/video`);
  console.log(`  - Documentation: http://localhost:${PORT}/docs`);
  console.log('');
  console.log('OAuth Token Storage:');
  if (process.env.YOUTUBE_OAUTH_TOKEN) {
    console.log('  - Using YOUTUBE_OAUTH_TOKEN environment variable');
  } else {
    console.log(`  - Using file storage: ${config.tokenPath}`);
    console.log('  - TIP: Set YOUTUBE_OAUTH_TOKEN env var for persistent storage on Render.com');
  }
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\n[${new Date().toISOString()}] Received ${signal}, shutting down gracefully...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
    console.log(`[${new Date().toISOString()}] Server closed`);
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[${new Date().toISOString()}] Uncaught Exception:`, err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] Unhandled Rejection at:`, promise, 'reason:', reason);
});
