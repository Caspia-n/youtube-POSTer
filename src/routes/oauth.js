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
  const { code, error: oauthError } = req.query;

  if (oauthError) {
    console.error('[OAuth] Authorization denied:', oauthError);
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Failed</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="error">✗ Authorization Denied</div>
          <p>You denied the authorization request.</p>
          <p><a href="/oauth/authorize">Try again</a></p>
        </body>
      </html>
    `);
  }

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
              max-width: 700px;
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
              text-align: left;
            }
            .warning {
              background: #fff3e0;
              border-left: 4px solid #ff9800;
              padding: 15px;
              margin-top: 20px;
              text-align: left;
            }
            code {
              background: #e8e8e8;
              padding: 2px 6px;
              border-radius: 3px;
            }
          </style>
        </head>
        <body>
          <div class="success">✓ Authorization Successful!</div>
          <p>Your YouTube POSTer app has been successfully authorized.</p>
          <div class="warning">
            <strong>⚠️ Important for Render.com users:</strong>
            <p>Check your server logs for the <code>YOUTUBE_OAUTH_TOKEN</code> value.</p>
            <p>Copy it to your environment variables in Render.com dashboard to persist the token across deployments.</p>
          </div>
          <div class="info">
            <strong>Next Steps:</strong>
            <p>You can now use the API to upload videos using your API key.</p>
            <p>Check the <a href="/docs/api-usage.html">API documentation</a> for usage instructions.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[OAuth] Callback error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #f44336; font-size: 24px; margin-bottom: 20px; }
            .details { background: #ffebee; padding: 15px; border-radius: 5px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="error">✗ Authorization Error</div>
          <p>An error occurred while completing the authorization.</p>
          <div class="details">
            <strong>Error:</strong> ${error.message}
          </div>
          <p><a href="/oauth/authorize">Try again</a></p>
        </body>
      </html>
    `);
  }
});

// Check auth status
router.get('/status', async (req, res) => {
  try {
    const isAuthenticated = await youtubeService.isAuthenticated();
    res.json({
      authenticated: isAuthenticated,
      message: isAuthenticated
        ? 'YouTube API is authorized and ready to use'
        : 'Not authorized. Visit /oauth/authorize to set up OAuth',
      tokenSource: isAuthenticated 
        ? (process.env.YOUTUBE_OAUTH_TOKEN ? 'environment' : 'file')
        : null,
    });
  } catch (error) {
    console.error('[OAuth] Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error.message,
    });
  }
});

// Revoke access (for testing/reset)
router.post('/revoke', async (req, res) => {
  try {
    await youtubeService.revokeAccess();
    res.json({
      success: true,
      message: 'Authorization revoked successfully',
      note: process.env.YOUTUBE_OAUTH_TOKEN 
        ? 'Remember to also remove the YOUTUBE_OAUTH_TOKEN environment variable'
        : undefined,
    });
  } catch (error) {
    console.error('[OAuth] Revoke error:', error);
    res.status(500).json({
      error: 'Failed to revoke authorization',
      message: error.message,
    });
  }
});

module.exports = router;
