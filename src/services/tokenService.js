const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

class TokenService {
  constructor() {
    this.tokenPath = config.tokenPath;
  }

  async saveToken(token) {
    try {
      const tokenDir = path.dirname(this.tokenPath);
      await fs.mkdir(tokenDir, { recursive: true });
      await fs.writeFile(this.tokenPath, JSON.stringify(token, null, 2));
      console.log('Token saved successfully');
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  async loadToken() {
    try {
      const tokenData = await fs.readFile(this.tokenPath, 'utf-8');
      return JSON.parse(tokenData);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async hasToken() {
    try {
      await fs.access(this.tokenPath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteToken() {
    try {
      await fs.unlink(this.tokenPath);
      console.log('Token deleted successfully');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

module.exports = new TokenService();
