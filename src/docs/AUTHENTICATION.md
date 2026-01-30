# Authentication System Documentation

## Overview

The Nihongo backend implements a JWT-based authentication system to secure API endpoints and manage user access. This document provides comprehensive information about the authentication implementation, usage, and security features.

## Authentication Architecture

### Components

1. **JWT (JSON Web Tokens)** - Stateless authentication using access and refresh tokens
2. **Middleware** - Request authentication and authorization
3. **Services** - Business logic for authentication operations
4. **Routes** - API endpoints for authentication

### Security Features

- **Password Hashing** - Uses bcryptjs for secure password storage
- **Token-based Authentication** - Stateless JWT tokens
- **Rate Limiting** - Prevents brute force attacks
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Request data sanitization

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/login`
Authenticates a user and returns tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "currentLevel": "N5",
      "totalXp": 150,
      "streakDays": 5
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### POST `/api/auth/register`
Registers a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "Jane Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "newuser@example.com",
      "fullName": "Jane Doe",
      "currentLevel": "N5",
      "totalXp": 0,
      "streakDays": 0
    }
  }
}
```

#### POST `/api/auth/logout`
Logs out a user (client-side token removal).

**Response:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

#### POST `/api/auth/refresh`
Refreshes access tokens using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token đã được làm mới",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

## Token Management

### Access Token
- **Purpose:** Access protected API endpoints
- **Lifetime:** 15 minutes
- **Format:** Bearer token in Authorization header

### Refresh Token
- **Purpose:** Obtain new access tokens
- **Lifetime:** 7 days
- **Storage:** Secure HTTP-only cookies or local storage

### Usage Example
```javascript
// Include access token in API requests
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Middleware Implementation

### Authentication Middleware (`authenticateToken`)

Protects routes by verifying JWT tokens and attaching user data to requests.

**Usage:**
```javascript
const { authenticateToken } = require('../middleware/auth');

router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains authenticated user data
  res.json({ user: req.user });
});
```

**Response Types:**
- **401 Unauthorized:** Missing or invalid token
- **403 Forbidden:** Token verification failed
- **Next:** Valid token, proceed to next middleware

### Optional Authentication (`optionalAuth`)

Allows access to endpoints with optional authentication - user data is attached if valid token is provided, but request continues even without authentication.

**Usage:**
```javascript
const { optionalAuth } = require('../middleware/auth');

router.get('/public-data', optionalAuth, (req, res) => {
  // req.user may be undefined if no valid token
  const data = req.user ? 
    { personalized: true, user: req.user } : 
    { personalized: false };
  res.json(data);
});
```

## Protected Routes

### Currently Protected Endpoints

1. **Conversation API** (`/api/conversation/*`)
   - AI chat functionality
   - Dialog management
   - Message history

2. **Pronunciation API** (`/api/pronunciation/*`)
   - Audio upload and analysis
   - Practice sessions
   - Progress tracking

3. **User Progress** (`/api/progress/*`)
   - Learning progress
   - Achievement tracking
   - Statistics

4. **Lesson Exercises** (`/api/lessons/:id/exercises/*`)
   - Exercise submission
   - Progress updates
   - Weak point analysis

## Environment Configuration

### Required Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nihongo

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Security Considerations

1. **JWT Secret**: Use a strong, unique secret key in production
2. **Environment**: Set `NODE_ENV=production` in production
3. **Database**: Secure MongoDB connection with authentication
4. **HTTPS**: Use HTTPS in production to protect tokens in transit

## User Model

### User Schema Fields

```typescript
interface UserDocument {
  _id: ObjectId;
  email: string;
  password: string; // Hashed
  fullName: string;
  avatar?: string;
  currentLevel: string;
  totalXp: number;
  streakDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Authentication Errors

| Error Code | Message | Description |
|------------|---------|-------------|
| 401 | "Access token là bắt buộc" | No token provided |
| 401 | "Token không hợp lệ hoặc tài khoản đã bị khóa" | Invalid token or inactive account |
| 403 | "Token không hợp lệ" | Token verification failed |
| 400 | "Dữ liệu không hợp lệ" | Invalid input data |
| 401 | "Đăng nhập thất bại" | Invalid credentials |

### Validation Rules

- **Email**: Must be valid email format
- **Password**: Minimum 6 characters
- **Full Name**: Minimum 2 characters

## Security Best Practices

### For Developers

1. **Token Storage**: Store refresh tokens in HTTP-only cookies
2. **Token Rotation**: Implement token rotation for enhanced security
3. **Rate Limiting**: Configure appropriate rate limits for auth endpoints
4. **Input Validation**: Always validate and sanitize user input
5. **Error Messages**: Use generic error messages to prevent information leakage

### For Production

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit secrets to version control
3. **JWT Secret**: Use a cryptographically strong secret
4. **Database Security**: Secure database connections with authentication
5. **Monitoring**: Monitor authentication attempts and failures

## Testing Authentication

### Test Credentials

For development and testing, you can create test users:

```javascript
// Example test user creation
const testUser = {
  email: 'test@example.com',
  password: 'test123456',
  fullName: 'Test User'
};
```

### API Testing Example

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# Access protected endpoint
curl -X GET http://localhost:3000/api/conversation/ai/start \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Common Issues

1. **Token Expired**: Refresh token using `/api/auth/refresh`
2. **Invalid Token**: Check token format and JWT secret
3. **CORS Issues**: Verify FRONTEND_URL configuration
4. **Database Connection**: Check MongoDB URI and connection

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
DEBUG=auth:*
```

## Migration from Mock Authentication

The system previously used mock authentication for development. This has been removed and replaced with real JWT authentication across all environments.

### Changes Made

1. Removed `mockAuth` middleware from conversation routes
2. Enabled `authenticateToken` for all protected endpoints
3. Ensured consistent authentication behavior across environments

### Impact

- All protected endpoints now require valid JWT tokens
- Development environment no longer uses mock authentication
- Consistent security posture across all environments

## Future Enhancements

### Planned Features

1. **OAuth Integration**: Google, Facebook login options
2. **Two-Factor Authentication**: Enhanced security with 2FA
3. **Role-Based Access Control**: Admin, teacher, student roles
4. **Session Management**: Active session tracking and management
5. **Password Reset**: Secure password recovery flow

### Security Improvements

1. **Token Blacklisting**: Logout token invalidation
2. **Device Management**: Multiple device session management
3. **Biometric Authentication**: Fingerprint/Face ID support
4. **Advanced Rate Limiting**: IP-based and user-based limits

---

## Support

For authentication-related issues or questions:

1. Check the error logs for detailed error messages
2. Verify environment configuration
3. Ensure proper token handling in client applications
4. Review this documentation for common solutions

Last updated: January 2026
