const config = require('../config/config');

function apiKeyAuth(req, res, next) {
  const apiKey = req.header('X-API-Key') || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Provide it via X-API-Key header or apiKey query parameter.',
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key.',
    });
  }

  next();
}

module.exports = { apiKeyAuth };
