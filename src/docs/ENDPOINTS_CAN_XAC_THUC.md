# Danh Sách Endpoint Cần Xác Thực Token

## 📋 Tổng quan

Dưới đây là danh sách tất cả các endpoint **cần JWT token** để xác thực người dùng. Frontend cần gửi token trong header `Authorization: Bearer <token>`.

---

## 🔐 Lessons Module

### **POST** `/api/v1/lessons/:id/exercises/:exerciseId/submit`
- **Mục đích**: Nộp bài tập
- **Auth**: `authMiddleware.authenticateToken`
- **Headers**: `Authorization: Bearer <token>`

### **POST** `/api/v1/lessons/:id/progress` (cũ)
- **Mục đích**: Cập nhật progress (endpoint cũ)
- **Auth**: `authMiddleware.authenticateToken`
- **Headers**: `Authorization: Bearer <token>`

### **GET** `/api/v1/lessons/:id/weak-points`
- **Mục đích**: Lấy điểm yếu của user
- **Auth**: `authMiddleware.authenticateToken`
- **Headers**: `Authorization: Bearer <token>`

### **POST** `/api/v1/lessons/:id/ai/roleplay`
- **Mục đích**: AI roleplay
- **Auth**: `authMiddleware.authenticateToken`
- **Headers**: `Authorization: Bearer <token>`

> **Lưu ý**: Các endpoint lessons sau đây **KHÔNG** cần token:
> - `GET /api/v1/lessons` (public)
> - `GET /api/v1/lessons/:id` (public)
> - `PUT /api/v1/lessons/:id/progress` (public - mới)
> - `POST /api/v1/lessons/:id/complete` (public - mới)

---

## 🤖 AI Module

### **POST** `/api/v1/ai/chat`
- **Mục đích**: Chat với AI để luyện tập
- **Auth**: `authMiddleware`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "message": "string", "lessonId": "string" }`

### **POST** `/api/v1/ai/practice`
- **Mục đích**: Tạo kịch bản luyện tập
- **Auth**: `authMiddleware`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "lessonId": "string", "topic": "string", "level": "string" }`

---

## 📊 Progress Module

### **GET** `/api/v1/progress/me`
- **Mục đích**: Lấy progress của user cho tất cả bài học
- **Auth**: `authMiddleware`
- **Headers**: `Authorization: Bearer <token>`

### **PATCH** `/api/v1/progress/lesson/:id`
- **Mục đích**: Cập nhật progress cho bài học cụ thể
- **Auth**: `authMiddleware`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "status": "string", "accuracy": "number", "timeSpent": "number" }`

---

## 💬 Conversation Module

**Tất cả các endpoint sau dòng 145 trong conversation.js đều cần token:**

### **Protected Routes** (tất cả đều cần token)
- **GET** `/api/v1/conversation/scenarios`
- **GET** `/api/v1/conversation/scenarios/:id`
- **POST** `/api/v1/conversation/ai/start`
- **POST** `/api/v1/conversation/ai/chat`
- **POST** `/api/v1/conversation/ai/end`
- **GET** `/api/v1/conversation/dialogs`
- **GET** `/api/v1/conversation/dialogs/:id`
- **POST** `/api/v1/conversation/voice/start`
- **POST** `/api/v1/conversation/voice/upload`
- **GET** `/api/v1/conversation/stats`
- **GET** `/api/v1/conversation/history`
- **GET** `/api/v1/conversation/audio/:text`
- **GET** `/api/v1/conversation/dialog/:dialogId/line/:lineId/audio`
- **POST** `/api/v1/conversation/upload`
- **GET** `/api/v1/conversation/lessons`
- **GET** `/api/v1/conversation/lessons/:id`
- **GET** `/api/v1/conversation/lessons/:id/exercises`
- **POST** `/api/v1/conversation/lessons/:id/exercises/submit`

> **Lưu ý**: Các endpoint lessons trong conversation.js (dòng 97-145) **KHÔNG** cần token:
> - `GET /api/v1/conversation/lessons`
> - `GET /api/v1/conversation/lessons/:id`

---

## 🔑 Authentication Module

### **GET** `/api/v1/auth/profile`
- **Mục đích**: Lấy thông tin profile user
- **Auth**: `authenticateToken`
- **Headers**: `Authorization: Bearer <token>`

### **POST** `/api/v1/auth/refresh`
- **Mục đích**: Làm mới token
- **Auth**: `authenticateToken`
- **Headers**: `Authorization: Bearer <token>`

> **Lưu ý**: Các endpoint auth sau **KHÔNG** cần token:
> - `POST /api/v1/auth/register`
> - `POST /api/v1/auth/login`

---

## 📝 Cách Gửi Token từ Frontend

### **JavaScript/Fetch**
```javascript
const getProtectedData = async () => {
  const token = localStorage.getItem('token'); // hoặc từ context/store
  
  const response = await fetch('http://localhost:3000/api/v1/progress/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token hết hạn, cần refresh token hoặc login lại
      window.location.href = '/login';
    }
    throw new Error('Request failed');
  }
  
  return await response.json();
};
```

### **Axios**
```javascript
import axios from 'axios';

// Tạo instance với token
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Interceptor để xử lý 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token hết hạn
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Sử dụng
const getUserProgress = async () => {
  const response = await api.get('/progress/me');
  return response.data;
};
```

### **React Component Example**
```jsx
import React, { useState, useEffect } from 'react';

const ProtectedComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Chưa đăng nhập');
          return;
        }

        const response = await fetch('http://localhost:3000/api/v1/progress/me', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Token hết hạn, vui lòng đăng nhập lại');
          } else {
            setError('Lỗi khi tải dữ liệu');
          }
          return;
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError('Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      <h2>Dữ liệu được bảo vệ</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
```

---

## ⚠️ Error Handling

### **401 Unauthorized**
```json
{
  "success": false,
  "error": "Token không hợp lệ hoặc đã hết hạn"
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "error": "Không có quyền truy cập"
}
```

### **Handling trong Frontend**
```javascript
const handleApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token hết hạn
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
```

---

## 📋 Tóm Tắt

### **Endpoints Cần Token:**
1. **Lessons**: 4 endpoints (submit exercise, old progress, weak-points, AI roleplay)
2. **AI**: 2 endpoints (chat, practice)
3. **Progress**: 2 endpoints (get progress, update progress)
4. **Conversation**: 17+ endpoints (tất cả protected routes)
5. **Auth**: 2 endpoints (profile, refresh)

### **Endpoints Không Cần Token:**
1. **Lessons**: 4 endpoints (list, detail, new progress, complete)
2. **Auth**: 2 endpoints (login, register)
3. **Public conversation lessons**: 2 endpoints

**Tổng cộng**: ~27 endpoints cần xác thực token.
