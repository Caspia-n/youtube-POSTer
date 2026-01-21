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

    this.initializeClient();
  }

  async initializeClient() {
    const token = await tokenService.loadToken();
    if (token) {
      this.oauth2Client.setCredentials(token);
      
      // Set up token refresh
      this.oauth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
          tokenService.saveToken(tokens);
        }
      });
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
    return tokens;
  }

  async isAuthenticated() {
    return await tokenService.hasToken();
  }

  async uploadVideo(videoStream, metadata) {
    const hasToken = await this.isAuthenticated();
    if (!hasToken) {
      throw new Error('Not authenticated. Please complete OAuth setup first.');
    }

    // Refresh credentials if needed
    const token = await tokenService.loadToken();
    this.oauth2Client.setCredentials(token);

    const requestBody = {
      snippet: {
        title: metadata.title || 'Untitled Video',
        description: metadata.description || '',
        tags: metadata.tags || [],
        categoryId: metadata.categoryId || '22', // Default to People & Blogs
      },
      status: {
        privacyStatus: metadata.privacyStatus || 'private',
        selfDeclaredMadeForKids: metadata.madeForKids || false,
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

  async revokeAccess() {
    await this.oauth2Client.revokeCredentials();
    await tokenService.deleteToken();
  }
}

module.exports = new YouTubeService();
