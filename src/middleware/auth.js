const crypto = require('crypto');
const config = require('../config/config');

/**
 * Constant-time string comparison to prevent timing attacks
 */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  // Ensure both strings are the same length for timingSafeEqual
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  if (bufA.length !== bufB.length) {
    // Compare against self to ensure constant time even when lengths differ
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}

function apiKeyAuth(req, res, next) {
  const apiKey = req.header('X-API-Key') || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Provide it via X-API-Key header or apiKey query parameter.',
    });
  }

  if (!safeCompare(apiKey, config.apiKey)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key.',
    });
  }

  next();
}

module.exports = { apiKeyAuth };
