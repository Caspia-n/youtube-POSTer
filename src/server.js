const app = require('./app');
const config = require('./config/config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`YouTube POSTer API running on port ${PORT}`);
  console.log(`Environment: ${config.environment}`);
  console.log(`\nEndpoints:`);
  console.log(`  - Root: http://localhost:${PORT}/`);
  console.log(`  - OAuth Setup: http://localhost:${PORT}/oauth/authorize`);
  console.log(`  - API Upload: http://localhost:${PORT}/api/video`);
  console.log(`  - Documentation: http://localhost:${PORT}/docs`);
});
