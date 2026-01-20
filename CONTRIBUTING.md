# Contributing to YouTube POSTer

Thank you for your interest in contributing to YouTube POSTer! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to build something useful together.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**Good bug reports include:**
- Clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots or logs if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach
- Any potential drawbacks

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit with clear messages** describing what and why
6. **Submit a pull request** with a detailed description

## Development Setup

### Prerequisites
- Node.js 14 or higher
- npm or yarn
- Google Cloud account (for testing OAuth)

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/youtube-POSTer.git
cd youtube-POSTer

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your test credentials
# (Use a separate Google Cloud project for development)

# Start development server
npm start
```

## Coding Standards

### JavaScript Style
- Use ES6+ features where appropriate
- Use `const` and `let`, not `var`
- Use async/await for asynchronous code
- Follow existing code formatting

### File Organization
```
src/
├── config/      # Configuration files
├── middleware/  # Express middleware
├── routes/      # Route handlers
├── services/    # Business logic
└── app.js       # App setup
```

### Error Handling
- Always handle errors appropriately
- Use try-catch for async operations
- Return meaningful error messages
- Log errors for debugging

### Example:
```javascript
router.post('/endpoint', async (req, res) => {
  try {
    // Your code here
    const result = await someAsyncOperation();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Operation failed:', error);
    res.status(500).json({
      error: 'Operation Failed',
      message: error.message
    });
  }
});
```

## Testing

Before submitting a PR:

1. **Manual Testing**
   - Test all affected endpoints
   - Verify error handling
   - Check edge cases

2. **Security Testing**
   - Run `npm audit`
   - Ensure no sensitive data in logs
   - Verify authentication works

3. **Documentation**
   - Update README if needed
   - Update API docs for endpoint changes
   - Add inline comments for complex logic

## Commit Messages

Use clear, descriptive commit messages:

**Good:**
```
Add rate limiting to upload endpoint
Fix async file deletion in upload handler
Update README with deployment instructions
```

**Less good:**
```
fix bug
update code
changes
```

### Commit Message Format
```
<type>: <subject>

<body (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Areas for Contribution

We welcome contributions in these areas:

### High Priority
- [ ] Database storage for OAuth tokens (MongoDB, PostgreSQL)
- [ ] Resumable uploads for large files
- [ ] Video processing/transcoding integration
- [ ] Admin dashboard for monitoring
- [ ] Enhanced error logging and monitoring

### Medium Priority
- [ ] Multiple YouTube account support
- [ ] Batch upload capabilities
- [ ] Webhook notifications on upload completion
- [ ] Video thumbnail upload support
- [ ] Playlist management

### Documentation
- [ ] More code examples in different languages
- [ ] Video tutorials
- [ ] Troubleshooting guide expansion
- [ ] Performance optimization guide

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] End-to-end testing
- [ ] Load testing

## Project Architecture

### Key Components

**OAuth Service (`src/services/youtubeService.js`)**
- Handles Google OAuth flow
- Manages token refresh
- Interacts with YouTube API

**Token Service (`src/services/tokenService.js`)**
- Stores and retrieves OAuth tokens
- Can be extended for database storage

**Upload Route (`src/routes/upload.js`)**
- Handles video upload requests
- Validates API keys
- Processes file uploads

**Authentication Middleware (`src/middleware/auth.js`)**
- Validates API keys
- Protects routes

### Design Decisions

1. **Token Storage**: File-based by default for simplicity, but designed to be easily replaced with database storage.

2. **Rate Limiting**: Implemented to prevent abuse, with separate limits for different endpoint types.

3. **CORS**: Enabled for all origins by default to maximize compatibility, but can be restricted in production.

4. **Error Handling**: Consistent error response format across all endpoints.

## Questions?

- Check existing [Issues](https://github.com/Caspia-n/youtube-POSTer/issues)
- Review [Documentation](docs/)
- Start a [Discussion](https://github.com/Caspia-n/youtube-POSTer/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to YouTube POSTer! 🎉
