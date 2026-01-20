const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const oauthRoutes = require('./routes/oauth');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middleware
app.use(cors()); // Allow all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static documentation
app.use('/docs', express.static('docs'));

// Routes
app.use('/oauth', oauthRoutes);
app.use('/api', uploadRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'YouTube POSTer API',
    version: '1.0.0',
    description: 'Simple API for uploading videos to YouTube with API key authentication',
    endpoints: {
      oauth: {
        authorize: '/oauth/authorize - Start OAuth flow',
        callback: '/oauth/callback - OAuth callback',
        status: '/oauth/status - Check authentication status',
        revoke: '/oauth/revoke - Revoke authorization (POST)',
      },
      api: {
        upload: '/api/video - Upload video (POST, requires API key)',
      },
      docs: '/docs - Documentation',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message,
  });
});

module.exports = app;
