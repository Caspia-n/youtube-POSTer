# 📹 YouTube POSTer

> Simple REST API for uploading videos to YouTube with one-time OAuth setup and API key authentication

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

## 🎯 Overview

YouTube POSTer is a REST API service that simplifies video uploads to YouTube. Instead of implementing OAuth in every client application, you set up OAuth **once** on the server, then use simple API key authentication for all uploads.

**Perfect for:**
- Mobile apps that need to upload to YouTube
- Web applications without complex OAuth flows
- Automation scripts and bots
- Multiple clients sharing one YouTube channel

## ✨ Features

- 🔐 **One-time OAuth 2.0 setup** - Authorize once, use forever
- 🔑 **Simple API key authentication** - No OAuth complexity for clients
- 📡 **RESTful API** - Standard multipart/form-data uploads
- 🌐 **CORS enabled** - Call from any origin
- ☁️ **Deploy anywhere** - Render.com, Heroku, Railway, Google Cloud Run
- 🔄 **Auto token refresh** - No re-authorization needed
- 📝 **Full metadata support** - Title, description, tags, privacy settings
- 📚 **Comprehensive documentation** - Setup, API reference, deployment guides

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- A Google account with a YouTube channel
- Google Cloud project with YouTube Data API v3 enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/Caspia-n/youtube-POSTer.git
cd youtube-POSTer

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# (See Setup Guide for details)
```

### Configuration

Edit `.env` file with your Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
API_KEY=your-secure-api-key
```

### Start the Server

```bash
npm start
```

### Complete OAuth Setup

1. Visit `http://localhost:3000/oauth/authorize`
2. Sign in with your Google account
3. Grant YouTube upload permissions
4. Done! You're ready to upload videos

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Setup Guide](docs/setup.html)** - Complete setup instructions, Google Cloud configuration, and OAuth setup
- **[API Usage](docs/api-usage.html)** - API reference, code examples in multiple languages, error handling
- **[Deployment Guide](docs/deployment.html)** - Deploy to Render.com, Heroku, Railway, Google Cloud Run, and more

Or visit the documentation at `http://localhost:3000/docs` when running the server.

## 🎬 Usage Example

### Using cURL

```bash
curl -X POST http://localhost:3000/api/video \
  -H "X-API-Key: your-api-key" \
  -F "video=@video.mp4" \
  -F "title=My Awesome Video" \
  -F "description=Check out this cool video!" \
  -F 'tags=["tutorial","demo"]' \
  -F "privacyStatus=private"
```

### Using JavaScript (Node.js)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('video', fs.createReadStream('video.mp4'));
formData.append('title', 'My Awesome Video');
formData.append('description', 'Check out this cool video!');
formData.append('tags', JSON.stringify(['tutorial', 'demo']));
formData.append('privacyStatus', 'private');

axios.post('http://localhost:3000/api/video', formData, {
  headers: {
    'X-API-Key': 'your-api-key',
    ...formData.getHeaders()
  }
}).then(response => {
  console.log('Video uploaded:', response.data.video.url);
}).catch(error => {
  console.error('Upload failed:', error.response?.data);
});
```

### Using Python

```python
import requests

url = 'http://localhost:3000/api/video'
headers = {'X-API-Key': 'your-api-key'}
files = {'video': open('video.mp4', 'rb')}
data = {
    'title': 'My Awesome Video',
    'description': 'Check out this cool video!',
    'tags': '["tutorial","demo"]',
    'privacyStatus': 'private'
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())
```

## 🏗️ API Endpoints

### Upload Video
- **POST** `/api/video` - Upload a video to YouTube
  - Headers: `X-API-Key: your-api-key`
  - Body: `multipart/form-data`
  - Returns: Video ID and YouTube URL

### OAuth Management
- **GET** `/oauth/authorize` - Start OAuth flow
- **GET** `/oauth/callback` - OAuth callback (automatic)
- **GET** `/oauth/status` - Check authorization status
- **POST** `/oauth/revoke` - Revoke authorization

### Utility
- **GET** `/` - API information
- **GET** `/health` - Health check
- **GET** `/docs` - Documentation

## 🚢 Deployment

### Render.com (Recommended)

1. Connect your GitHub repository
2. Create a new Web Service
3. Set environment variables
4. Deploy!

See the **[Deployment Guide](docs/deployment.html)** for detailed instructions.

### Other Platforms

- **Heroku** - `git push heroku main`
- **Railway** - Connect repo and deploy
- **Google Cloud Run** - Docker-based deployment
- **AWS/DigitalOcean** - Traditional VPS hosting

## 🛡️ Security

- Never commit your `.env` file
- Use HTTPS in production
- Rotate API keys regularly
- Use different keys for dev/prod
- Consider rate limiting for production

## 🔧 Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Required |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Required |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/oauth/callback` |
| `API_KEY` | Client authentication key | Required |
| `TOKEN_PATH` | Token storage path | `./tokens/youtube-token.json` |
| `NODE_ENV` | Environment | `development` |

## 📊 Project Structure

```
youtube-POSTer/
├── src/
│   ├── config/
│   │   └── config.js          # Configuration management
│   ├── services/
│   │   ├── tokenService.js    # Token storage and retrieval
│   │   └── youtubeService.js  # YouTube API integration
│   ├── middleware/
│   │   └── auth.js            # API key authentication
│   ├── routes/
│   │   ├── oauth.js           # OAuth endpoints
│   │   └── upload.js          # Upload endpoints
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── docs/                      # Documentation
│   ├── index.html
│   ├── setup.html
│   ├── api-usage.html
│   └── deployment.html
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Uses [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- Inspired by the need for simpler YouTube integrations

## 📞 Support

- 📖 **Documentation**: [/docs](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Caspia-n/youtube-POSTer/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Caspia-n/youtube-POSTer/discussions)

---

Made with ❤️ for developers who want YouTube uploads without the OAuth headache.
