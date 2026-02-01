const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const oauthRoutes = require('./routes/oauth');
const uploadRoutes = require('./routes/upload');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for docs
}));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests', message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: { error: 'Too many requests', message: 'Too many upload requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit OAuth requests to prevent abuse
  message: { error: 'Too many requests', message: 'Too many OAuth requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors()); // Allow all origins
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging in development
if (config.environment === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
}

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
    environment: config.environment,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error:`, err.message);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: 'The uploaded file exceeds the maximum allowed size (256 MB)',
    });
  }
  
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: config.environment === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
});

module.exports = app;
