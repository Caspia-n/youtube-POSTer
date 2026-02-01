const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

/**
 * TokenService handles OAuth token storage and retrieval.
 * 
 * Storage priority:
 * 1. Environment variable (YOUTUBE_OAUTH_TOKEN) - recommended for production/Render.com
 * 2. File-based storage (TOKEN_PATH) - for local development
 * 
 * When running on platforms with ephemeral filesystems (like Render.com),
 * use the environment variable approach to persist tokens across deployments.
 */
class TokenService {
  constructor() {
    this.tokenPath = config.tokenPath;
    this.envToken = null;
    this._initEnvToken();
  }

  /**
   * Initialize token from environment variable if available
   */
  _initEnvToken() {
    if (process.env.YOUTUBE_OAUTH_TOKEN) {
      try {
        this.envToken = JSON.parse(process.env.YOUTUBE_OAUTH_TOKEN);
        console.log('[TokenService] Loaded token from environment variable');
      } catch (error) {
        console.error('[TokenService] Failed to parse YOUTUBE_OAUTH_TOKEN:', error.message);
        this.envToken = null;
      }
    }
  }

  /**
   * Save token to file storage.
   * Also logs the token JSON for copying to environment variable.
   */
  async saveToken(token) {
    try {
      const tokenDir = path.dirname(this.tokenPath);
      await fs.mkdir(tokenDir, { recursive: true });
      await fs.writeFile(this.tokenPath, JSON.stringify(token, null, 2));
      
      // Update in-memory token
      this.envToken = token;
      
      console.log('[TokenService] Token saved successfully to file');
      
      // Log the token for environment variable setup (useful for Render.com)
      console.log('\n' + '='.repeat(80));
      console.log('IMPORTANT: To persist this token across deployments on Render.com,');
      console.log('copy the following value to your YOUTUBE_OAUTH_TOKEN environment variable:');
      console.log('='.repeat(80));
      console.log(JSON.stringify(token));
      console.log('='.repeat(80) + '\n');
    } catch (error) {
      console.error('[TokenService] Error saving token:', error);
      throw error;
    }
  }

  /**
   * Load token from environment variable or file storage.
   * Priority: env variable > file
   */
  async loadToken() {
    // First try environment variable
    if (this.envToken) {
      return this.envToken;
    }
    
    // Try to re-parse from env in case it was set after startup
    if (process.env.YOUTUBE_OAUTH_TOKEN) {
      try {
        this.envToken = JSON.parse(process.env.YOUTUBE_OAUTH_TOKEN);
        return this.envToken;
      } catch {
        // Ignore parse errors, fall through to file
      }
    }

    // Fall back to file storage
    try {
      const tokenData = await fs.readFile(this.tokenPath, 'utf-8');
      const token = JSON.parse(tokenData);
      // Cache it in memory
      this.envToken = token;
      return token;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if a token exists (in env or file)
   */
  async hasToken() {
    if (this.envToken) {
      return true;
    }
    
    if (process.env.YOUTUBE_OAUTH_TOKEN) {
      try {
        JSON.parse(process.env.YOUTUBE_OAUTH_TOKEN);
        return true;
      } catch {
        // Invalid JSON, fall through
      }
    }
    
    try {
      await fs.access(this.tokenPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete token from file storage and clear memory cache.
   * Note: Cannot delete from environment variable - must be done manually.
   */
  async deleteToken() {
    this.envToken = null;
    
    try {
      await fs.unlink(this.tokenPath);
      console.log('[TokenService] Token deleted from file storage');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    
    if (process.env.YOUTUBE_OAUTH_TOKEN) {
      console.log('[TokenService] Note: YOUTUBE_OAUTH_TOKEN environment variable still set.');
      console.log('[TokenService] Remove it from your environment to fully revoke access.');
    }
  }

  /**
   * Update cached token (useful when token is refreshed)
   */
  async updateToken(token) {
    this.envToken = token;
    // Also save to file for persistence
    await this.saveToken(token);
  }
}

module.exports = new TokenService();
