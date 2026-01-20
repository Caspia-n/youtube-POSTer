const express = require('express');
const router = express.Router();
const youtubeService = require('../services/youtubeService');

// Start OAuth flow
router.get('/authorize', (req, res) => {
  const authUrl = youtubeService.getAuthUrl();
  res.redirect(authUrl);
});

// OAuth callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    await youtubeService.handleCallback(code);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            .success {
              color: #4CAF50;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .info {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="success">✓ Authorization Successful!</div>
          <p>Your YouTube POSTer app has been successfully authorized.</p>
          <div class="info">
            <strong>Next Steps:</strong>
            <p>You can now use the API to upload videos using your API key.</p>
            <p>Check the <a href="/docs/api-usage.html">API documentation</a> for usage instructions.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('Error completing authorization: ' + error.message);
  }
});

// Check auth status
router.get('/status', async (req, res) => {
  const isAuthenticated = await youtubeService.isAuthenticated();
  res.json({
    authenticated: isAuthenticated,
    message: isAuthenticated
      ? 'YouTube API is authorized and ready to use'
      : 'Not authorized. Visit /oauth/authorize to set up OAuth',
  });
});

// Revoke access (for testing/reset)
router.post('/revoke', async (req, res) => {
  try {
    await youtubeService.revokeAccess();
    res.json({
      success: true,
      message: 'Authorization revoked successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to revoke authorization',
      message: error.message,
    });
  }
});

module.exports = router;
