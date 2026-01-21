# Security Policy

## Security Features

YouTube POSTer includes several security measures to protect your application and data:

### 1. API Key Authentication
- All upload endpoints require API key authentication
- API keys can be provided via `X-API-Key` header (recommended) or query parameter
- Invalid or missing API keys result in 401/403 responses

### 2. Rate Limiting
To prevent abuse and DoS attacks, the application implements rate limiting:

- **Upload endpoints**: 10 requests per hour per IP
- **OAuth endpoints**: 5 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

Rate limits can be adjusted in `src/app.js` if needed.

### 3. OAuth 2.0 Security
- OAuth tokens are stored securely
- Tokens are automatically refreshed when expired
- One-time setup reduces attack surface
- Redirect URI validation by Google

### 4. File Upload Security
- File type validation (only video MIME types accepted)
- File size limits (256 MB default, configurable)
- Temporary files are cleaned up after upload
- Asynchronous file operations to prevent blocking

### 5. Input Validation
- JSON parsing with error handling
- Metadata validation before YouTube upload
- MIME type checking for uploaded files

### 6. Environment Variable Protection
- Sensitive credentials stored in environment variables
- `.env` file excluded from version control
- Environment variable templates provided

### 7. CORS Configuration
- CORS enabled for all origins (can be restricted in production)
- Configurable via `src/app.js`

## Security Best Practices

### For Development
1. Never commit `.env` files
2. Use strong, random API keys (32+ characters)
3. Rotate API keys regularly
4. Keep dependencies updated

### For Production
1. **Use HTTPS**: Always deploy with SSL/TLS enabled
2. **Restrict CORS**: Limit allowed origins to your specific domains
3. **Environment Secrets**: Use platform secret management (e.g., Render.com environment variables)
4. **Database Storage**: Consider using a database for token storage instead of files
5. **Enhanced Rate Limiting**: Adjust limits based on your usage patterns
6. **Monitoring**: Set up logging and monitoring for security events
7. **API Key Rotation**: Implement regular API key rotation
8. **IP Whitelisting**: Consider IP whitelisting for additional security

## Recommended Configuration for Production

```javascript
// In src/app.js, restrict CORS:
app.use(cors({
  origin: ['https://your-frontend.com'],
  credentials: true
}));

// Adjust rate limits based on needs:
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5, // Stricter limit for production
  message: 'Too many upload requests, please try again later.'
});
```

## Reporting a Vulnerability

If you discover a security vulnerability in YouTube POSTer, please report it by:

1. **Do NOT** open a public issue
2. Email the repository maintainer privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

We take security seriously and will respond to reports as quickly as possible.

## Security Updates

We regularly review dependencies and security practices:
- Run `npm audit` before each release
- CodeQL security scanning on all commits
- Dependency updates reviewed for security patches

## Known Limitations

1. **File-based token storage**: Default token storage uses local files. For production with multiple instances, use a database.
2. **In-memory rate limiting**: Rate limits are per-instance. Use Redis for distributed rate limiting.
3. **API key storage**: API keys are stored in environment variables. Consider using a secret management service for enterprise deployments.

## Compliance

This application handles:
- OAuth tokens (sensitive)
- API keys (sensitive)
- Video files (potentially sensitive)

Ensure your deployment complies with:
- GDPR (if handling EU user data)
- COPPA (YouTube content guidelines)
- Your organization's security policies

## Additional Resources

- [Google OAuth 2.0 Security](https://developers.google.com/identity/protocols/oauth2/security-best-practices)
- [YouTube Data API Policies](https://developers.google.com/youtube/terms/api-services-terms-of-service)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
