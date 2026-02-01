require('dotenv').config();

/**
 * Validate required environment variables
 */
function validateConfig() {
  const errors = [];
  
  if (!process.env.GOOGLE_CLIENT_ID) {
    errors.push('GOOGLE_CLIENT_ID is required');
  }
  
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    errors.push('GOOGLE_CLIENT_SECRET is required');
  }
  
  if (!process.env.API_KEY) {
    errors.push('API_KEY is required for client authentication');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease set the required environment variables.');
    console.error('See .env.example for the required configuration.');
    process.exit(1);
  }
}

// Validate on module load (but allow NODE_ENV=test to skip validation)
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = {
  port: process.env.PORT || 3000,
  
  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
  },
  
  // API Key for client authentication
  apiKey: process.env.API_KEY,
  
  // Token storage path
  tokenPath: process.env.TOKEN_PATH || './tokens/youtube-token.json',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
};
