# Authentication API Documentation

## Overview

This document describes the authentication endpoints for the Nihongo backend API. All authentication endpoints are currently in **TEMPORARY BYPASS** mode for development purposes.

**Base URL**: `http://localhost:3000/api/v1/auth`

---

## 1. Register Endpoint

### **POST /api/v1/auth/register**

Registers a new user account in the system.

#### **Request Headers**
```
Content-Type: application/json
```

#### **Request Body**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

#### **Request Parameters**
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| username | string | Yes | 3-50 characters | User's display name |
| email | string | Yes | Valid email format | User's email address |
| password | string | Yes | Minimum 6 characters | User's password |

#### **Example Request**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nguyenvana",
    "email": "nguyenvana@example.com",
    "password": "password123"
  }'
```

#### **Success Response (201)**
```json
{
  "success": true,
  "message": "User registered successfully (temporary bypass)",
  "data": {
    "user": {
      "id": "temp-abc123def",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com",
      "role": "student"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### **Error Responses**

**400 - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username must be between 3 and 50 characters"
    }
  ]
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 2. Login Endpoint

### **POST /api/v1/auth/login**

Authenticates a user and returns access tokens.

#### **Request Headers**
```
Content-Type: application/json
```

#### **Request Body**
```json
{
  "email": "string",
  "password": "string"
}
```

#### **Request Parameters**
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| email | string | Yes | Valid email format | User's email address |
| password | string | Yes | Non-empty | User's password |

#### **Example Request**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nguyenvana@example.com",
    "password": "password123"
  }'
```

#### **Success Response (200)**
```json
{
  "success": true,
  "message": "Login successful (temporary bypass)",
  "data": {
    "user": {
      "id": "temp-xyz789abc",
      "username": "nguyenvana",
      "email": "nguyenvana@example.com",
      "role": "student"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### **Error Responses**

**400 - Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 3. Refresh Token Endpoint

### **POST /api/v1/auth/refresh**

Refreshes an expired access token using a valid refresh token.

#### **Request Headers**
```
Content-Type: application/json
```

#### **Request Body**
```json
{
  "refreshToken": "string"
}
```

#### **Request Parameters**
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| refreshToken | string | Yes | Valid JWT token | Refresh token obtained from login/register |

#### **Example Request**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### **Success Response (200)**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### **Error Responses**

**400 - Missing Token**
```json
{
  "success": false,
  "message": "Refresh token is required"
}
```

**401 - Invalid Token**
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

**401 - Expired Token**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

## Token Information

### **Access Token**
- **Type**: JWT
- **Expiration**: 7 days
- **Usage**: Used for accessing protected endpoints
- **Header**: `Authorization: Bearer <accessToken>`

### **Refresh Token**
- **Type**: JWT
- **Expiration**: 30 days
- **Usage**: Used to obtain new access tokens
- **Storage**: Should be stored securely on client side

### **Token Payload Structure**
```json
{
  "userId": "temp-abc123def",
  "username": "nguyenvana",
  "role": "student",
  "iat": 1643723400,
  "exp": 1644328200
}
```

---

## Current Implementation Status

### **⚠️ TEMPORARY BYPASS MODE**

All authentication endpoints are currently running in **TEMPORARY BYPASS** mode for development purposes:

- **Register**: Accepts any valid input and creates mock user without database persistence
- **Login**: Accepts any email/password combination and creates mock user
- **Refresh Token**: Still validates JWT tokens but uses mock user data

### **Important Notes**
- No actual user data is stored in the database
- All user IDs are prefixed with "temp-" 
- Passwords are not validated or hashed
- Email uniqueness is not enforced
- This is for development/testing only

### **File Locations**
- **Routes**: `src/modules/auth/authRoutes.js`
- **Controller**: `src/modules/auth/authController.js`
- **Middleware**: `src/middleware/auth.js`

---

## Usage Examples

### **Complete Authentication Flow**

```javascript
// 1. Register new user
const registerResponse = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'password123'
  })
});

const { data } = await registerResponse.json();
const { accessToken, refreshToken } = data.tokens;

// 2. Use access token for protected endpoints
const protectedResponse = await fetch('http://localhost:3000/api/v1/conversation/ai/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    scenarioId: '60f1b2b3c4d5e6f7g8h9i0j1',
    level: 'N5'
  })
});

// 3. Refresh token when access token expires
const refreshResponse = await fetch('http://localhost:3000/api/v1/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});
```

---

## Testing with curl

### **Quick Test Commands**

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Refresh Token (replace with actual refresh token)
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your_refresh_token_here"}'
```

---

## Security Considerations

### **Current Limitations (Temporary Bypass Mode)**
- No password hashing
- No rate limiting on auth endpoints
- No email verification
- No account lockout mechanism
- No password strength validation beyond minimum length

### **Production Requirements**
When implementing full authentication:
- Implement proper password hashing (bcrypt)
- Add rate limiting
- Implement email verification
- Add password reset functionality
- Implement account lockout after failed attempts
- Add proper user validation and uniqueness checks
- Implement proper session management
- Add CSRF protection
- Implement proper logout functionality

---

*Last Updated: January 26, 2026*
*Version: 1.0*
