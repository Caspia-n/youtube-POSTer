require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  
  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
  },
  
  // API Key for client authentication
  apiKey: process.env.API_KEY || 'your-secure-api-key-here',
  
  // Token storage path
  tokenPath: process.env.TOKEN_PATH || './tokens/youtube-token.json',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
};
