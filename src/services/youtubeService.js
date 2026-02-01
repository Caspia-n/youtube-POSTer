const { google } = require('googleapis');
const config = require('../config/config');
const tokenService = require('./tokenService');

class YouTubeService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    });

    this._initialized = false;
    this._initPromise = null;
  }

  /**
   * Initialize the OAuth client with stored credentials.
   * Returns a promise that resolves when initialization is complete.
   */
  async initialize() {
    if (this._initialized) {
      return;
    }
    
    if (this._initPromise) {
      return this._initPromise;
    }
    
    this._initPromise = this._doInitialize();
    return this._initPromise;
  }

  async _doInitialize() {
    try {
      const token = await tokenService.loadToken();
      if (token) {
        this.oauth2Client.setCredentials(token);
        
        // Set up token refresh handler
        this.oauth2Client.on('tokens', async (tokens) => {
          console.log('[YouTubeService] Token refreshed');
          // Merge with existing token (preserve refresh_token if not in new tokens)
          const existingToken = await tokenService.loadToken();
          const updatedToken = {
            ...existingToken,
            ...tokens,
          };
          await tokenService.updateToken(updatedToken);
        });
        
        console.log('[YouTubeService] Initialized with stored credentials');
      } else {
        console.log('[YouTubeService] No stored credentials found');
      }
      this._initialized = true;
    } catch (error) {
      console.error('[YouTubeService] Initialization error:', error.message);
      this._initialized = true; // Mark as initialized even on error to prevent retries
    }
  }

  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async handleCallback(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    await tokenService.saveToken(tokens);
    this._initialized = true;
    
    // Set up token refresh handler after initial auth
    this.oauth2Client.on('tokens', async (newTokens) => {
      console.log('[YouTubeService] Token refreshed');
      const existingToken = await tokenService.loadToken();
      const updatedToken = {
        ...existingToken,
        ...newTokens,
      };
      await tokenService.updateToken(updatedToken);
    });
    
    return tokens;
  }

  async isAuthenticated() {
    await this.initialize();
    return await tokenService.hasToken();
  }

  /**
   * Ensure credentials are fresh before making API calls
   */
  async _ensureCredentials() {
    await this.initialize();
    
    const hasToken = await tokenService.hasToken();
    if (!hasToken) {
      throw new Error('Not authenticated. Please complete OAuth setup first.');
    }

    const token = await tokenService.loadToken();
    this.oauth2Client.setCredentials(token);
    
    // Check if token is expired and refresh if needed
    const expiryDate = token.expiry_date;
    if (expiryDate) {
      const now = Date.now();
      const bufferMs = 5 * 60 * 1000; // 5 minutes buffer
      
      if (now >= expiryDate - bufferMs) {
        console.log('[YouTubeService] Token expired or expiring soon, refreshing...');
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          const updatedToken = { ...token, ...credentials };
          await tokenService.updateToken(updatedToken);
          this.oauth2Client.setCredentials(updatedToken);
        } catch (error) {
          console.error('[YouTubeService] Token refresh failed:', error.message);
          throw new Error('Token refresh failed. You may need to re-authorize.');
        }
      }
    }
  }

  async uploadVideo(videoStream, metadata) {
    await this._ensureCredentials();

    // Sanitize metadata
    const title = this._sanitizeString(metadata.title, 100) || 'Untitled Video';
    const description = this._sanitizeString(metadata.description, 5000) || '';
    const tags = Array.isArray(metadata.tags) 
      ? metadata.tags.map(t => this._sanitizeString(t, 500)).filter(Boolean).slice(0, 500)
      : [];

    const requestBody = {
      snippet: {
        title,
        description,
        tags,
        categoryId: metadata.categoryId || '22', // Default to People & Blogs
      },
      status: {
        privacyStatus: this._validatePrivacyStatus(metadata.privacyStatus),
        selfDeclaredMadeForKids: Boolean(metadata.madeForKids),
      },
    };

    const response = await this.youtube.videos.insert({
      part: 'snippet,status',
      requestBody,
      media: {
        body: videoStream,
      },
    });

    return response.data;
  }

  /**
   * Sanitize string input by trimming and limiting length
   */
  _sanitizeString(str, maxLength) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLength);
  }

  /**
   * Validate privacy status to prevent invalid values
   */
  _validatePrivacyStatus(status) {
    const validStatuses = ['public', 'private', 'unlisted'];
    if (validStatuses.includes(status)) {
      return status;
    }
    return 'private'; // Default to private for safety
  }

  async revokeAccess() {
    try {
      await this.oauth2Client.revokeCredentials();
    } catch (error) {
      console.error('[YouTubeService] Error revoking credentials:', error.message);
      // Continue with local cleanup even if revocation fails
    }
    await tokenService.deleteToken();
    this._initialized = false;
    this._initPromise = null;
  }
}

module.exports = new YouTubeService();
