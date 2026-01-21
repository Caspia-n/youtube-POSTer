const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const oauthRoutes = require('./routes/oauth');
const uploadRoutes = require('./routes/upload');

const app = express();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: 'Too many upload requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit OAuth requests to prevent abuse
  message: 'Too many OAuth requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors()); // Allow all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static documentation
app.use('/docs', express.static('docs'));

// Apply rate limiting to routes
app.use('/oauth', oauthLimiter, oauthRoutes);
app.use('/api', uploadLimiter, uploadRoutes);

// Apply general rate limiting to all other routes
app.use(apiLimiter);

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
