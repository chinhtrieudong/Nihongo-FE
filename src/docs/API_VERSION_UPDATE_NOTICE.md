# 🚀 API Version Update Notice

## 📢 Important Changes

**Date**: 2026-01-21  
**Affected**: All API endpoints  
**Action Required**: Update frontend API calls

---

## 🔄 URL Structure Changes

### ❌ Old URLs (Deprecated)
```javascript
// Before
http://localhost:3000/api/auth
http://localhost:3000/api/vocabulary
http://localhost:3000/api/grammar
http://localhost:3000/api/lessons
http://localhost:3000/api/ai
http://localhost:3000/api/progress
http://localhost:3000/api/minna
http://localhost:3000/api/kanji
http://localhost:3000/api/v1/pronunciation
```

### ✅ New URLs (Current)
```javascript
// After - All APIs now use /api/v1/
http://localhost:3000/api/v1/auth
http://localhost:3000/api/v1/vocabulary
http://localhost:3000/api/v1/grammar
http://localhost:3000/api/v1/lessons
http://localhost:3000/api/v1/ai
http://localhost:3000/api/v1/progress
http://localhost:3000/api/v1/minna
http://localhost:3000/api/v1/kanji
http://localhost:3000/api/v1/pronunciation
```

---

## 🎯 Impact on Frontend

### 1. **Update API Base URL**
```typescript
// Before
const API_BASE_URL = 'http://localhost:3000/api';

// After
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

### 2. **Update Individual Endpoints**
```typescript
// Example: Auth endpoints
// Before
const loginUrl = `${API_BASE_URL}/auth/login`;
const registerUrl = `${API_BASE_URL}/auth/register`;

// After
const loginUrl = `${API_BASE_URL}/auth/login`;
const registerUrl = `${API_BASE_URL}/auth/register`;

// Example: Pronunciation endpoints
// Before
const exercisesUrl = `${API_BASE_URL}/v1/pronunciation/exercises`;

// After
const exercisesUrl = `${API_BASE_URL}/pronunciation/exercises`;
```

### 3. **Update Environment Variables**
```bash
# .env file
# Before
REACT_APP_API_BASE_URL=http://localhost:3000/api

# After
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 📋 Complete Endpoint Mapping

| Module | Old URL | New URL |
|--------|----------|----------|
| Auth | `/api/auth/*` | `/api/v1/auth/*` |
| Vocabulary | `/api/vocabulary/*` | `/api/v1/vocabulary/*` |
| Grammar | `/api/grammar/*` | `/api/v1/grammar/*` |
| Lessons | `/api/lessons/*` | `/api/v1/lessons/*` |
| AI | `/api/ai/*` | `/api/v1/ai/*` |
| Progress | `/api/progress/*` | `/api/v1/progress/*` |
| Minna | `/api/minna/*` | `/api/v1/minna/*` |
| Kanji | `/api/kanji/*` | `/api/v1/kanji/*` |
| Pronunciation | `/api/v1/pronunciation/*` | `/api/v1/pronunciation/*` |

---

## 🔧 Migration Steps for Frontend Team

### Step 1: Update Configuration
```typescript
// config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1',
  VERSION: 'v1'
};
```

### Step 2: Update API Client
```typescript
// services/apiClient.ts
import { API_CONFIG } from '../config/api';

class ApiClient {
  private baseUrl = API_CONFIG.BASE_URL;
  
  async get(endpoint: string) {
    return fetch(`${this.baseUrl}${endpoint}`);
  }
  
  async post(endpoint: string, data: any) {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}
```

### Step 3: Update Service Files
```typescript
// services/authService.ts
import { apiClient } from './apiClient';

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  // ... other auth methods
};

// services/pronunciationService.ts
import { apiClient } from './apiClient';

export const pronunciationService = {
  getExercises: (filters) => apiClient.get('/pronunciation/exercises'),
  submitPractice: (data) => apiClient.post('/pronunciation/practice', data),
  // ... other pronunciation methods
};
```

### Step 4: Test All Endpoints
```bash
# Test script to verify all endpoints work
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/pronunciation/exercises
curl http://localhost:3000/api/v1/vocabulary
# ... test other endpoints
```

---

## 🚨 Breaking Changes

### High Priority
- **Authentication endpoints** - Will affect user login/registration
- **Pronunciation endpoints** - Newly implemented, need immediate update

### Medium Priority
- **Vocabulary, Grammar, Lessons** - Existing features, need update
- **AI, Progress, Minna, Kanji** - Feature-specific endpoints

---

## 📞 Support

If you encounter any issues during migration:

1. **Check the server logs** for routing errors
2. **Verify the new URLs** are correctly formed
3. **Test with Postman collection** (updated version available)
4. **Contact backend team** for assistance

---

## ✅ Verification Checklist

- [ ] Update API base URL in configuration
- [ ] Update all service files
- [ ] Update environment variables
- [ ] Test authentication flow
- [ ] Test pronunciation endpoints
- [ ] Test all other endpoints
- [ ] Update Postman collection
- [ ] Update documentation

---

## 📅 Timeline

- **Immediate**: Update development environment
- **Next Release**: Deploy to staging with new URLs
- **Future**: All new APIs will use `/api/v1/` by default

---

**Note**: This change ensures consistent API versioning across all endpoints and prepares for future API upgrades.
