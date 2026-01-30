# User Dashboard Stats API Documentation

## Overview
API để quản lý và cập nhật thống kê dashboard của người dùng.

## Base URL
```
/api/v1/users/stats
```

## Authentication
Tất cả requests cần include JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get Dashboard Statistics
Lấy thống kê dashboard hiện tại của người dùng.

```http
GET /api/v1/users/stats/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "learningStreak": 15,
    "totalStudyTime": 90,
    "weeklyStats": {
      "lessonsCompleted": 5,
      "studyHours": 8,
      "averageScore": 85
    }
  }
}
```

### 2. Update Dashboard Statistics
Cập nhật thống kê dashboard của người dùng.

```http
PUT /api/v1/users/stats/dashboard
```

**Request Body:**
```json
{
  "learningStreak": 15,
  "totalStudyTime": 90
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| learningStreak | number | No | Số ngày học liên tục (cập nhật vào field `streakDays`) |
| totalStudyTime | number | No | Tổng thời gian học (tính bằng giờ) |

**Response:**
```json
{
  "success": true,
  "data": {
    "learningStreak": 15,
    "totalStudyTime": 90
  }
}
```

### 3. Get Learning Streak
Lấy thông tin chuỗi ngày học của người dùng.

```http
GET /api/v1/users/stats/streak
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentStreak": 15,
    "longestStreak": 30,
    "lastStudyDate": "2026-01-29T10:00:00Z"
  }
}
```

### 4. Get Weekly Statistics
Lấy thống kê học tập theo tuần.

```http
GET /api/v1/users/stats/weekly
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lessonsCompleted": 5,
    "studyHours": 8,
    "averageScore": 85,
    "weekStart": "2026-01-23T00:00:00Z",
    "weekEnd": "2026-01-29T23:59:59Z"
  }
}
```

### 5. Get Total Study Time
Lấy tổng thời gian học của người dùng.

```http
GET /api/v1/users/stats/study-time
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalHours": 90,
    "totalMinutes": 5400,
    "averageDaily": 2.5
  }
}
```

### 6. Get Average Score
Lấy điểm trung bình của người dùng.

```http
GET /api/v1/users/stats/average-score
```

**Response:**
```json
{
  "success": true,
  "data": {
    "averageScore": 85,
    "totalExercises": 150,
    "bestScore": 100,
    "improvement": "+5%"
  }
}
```

---

## Frontend Usage Examples

### Using the API Service

```typescript
import { userStatsAPI } from '../services/api';

// Get dashboard stats
const getStats = async () => {
  try {
    const response = await userStatsAPI.getDashboardStats();
    console.log('Dashboard stats:', response.data);
  } catch (error) {
    console.error('Failed to get stats:', error);
  }
};

// Update dashboard stats after completing a lesson
const updateStatsOnComplete = async (lesson: Lesson) => {
  try {
    // Get current stats first
    const currentStats = await userStatsAPI.getDashboardStats();
    
    // Calculate new stats
    const newLearningStreak = (currentStats.data?.learningStreak || 0) + 1;
    const newTotalHours = (currentStats.data?.totalStudyTime || 0) + (lesson.estimatedTime || 1);
    
    // Update stats
    await userStatsAPI.updateDashboardStats({
      learningStreak: newLearningStreak,
      totalStudyTime: newTotalHours
    });
    
    console.log('Stats updated successfully');
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
};
```

### Using Fetch API

```javascript
// Update dashboard stats
const updateDashboardStats = async (learningStreak, totalStudyTime) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch('/api/v1/users/stats/dashboard', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        learningStreak,
        totalStudyTime
      })
    });
    
    const data = await response.json();
    console.log('Updated stats:', data);
  } catch (error) {
    console.error('Error updating stats:', error);
  }
};
```

---

## Backend Implementation Notes

### User Model Fields
- `streakDays`: Số ngày học liên tục
- `totalStudyTime`: Tổng thời gian học (tính bằng phút hoặc giờ)
- `lastStudyDate`: Ngày học cuối cùng

### Business Logic
1. **Learning Streak**: Cập nhật khi người dùng hoàn thành bài học mới
2. **Total Study Time**: Tính tổng từ tất cả lesson progress
3. **Weekly Stats**: Reset vào đầu mỗi tuần (Monday 00:00)
4. **Average Score**: Tính từ tất cả bài tập đã hoàn thành

### Security
- User ID được lấy từ JWT token, không cần truyền trong request
- Validate data types và ranges trước khi cập nhật
- Log changes cho tracking purposes

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid data format",
  "details": {
    "learningStreak": "Must be a positive integer",
    "totalStudyTime": "Must be a positive number"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to update user statistics"
}
```

---

## Testing

### Test Cases for Update Endpoint

1. **Valid Update:**
   ```bash
   curl -X PUT http://localhost:3000/api/v1/users/stats/dashboard \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer valid_token" \
     -d '{"learningStreak": 10, "totalStudyTime": 45}'
   ```

2. **Partial Update:**
   ```bash
   curl -X PUT http://localhost:3000/api/v1/users/stats/dashboard \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer valid_token" \
     -d '{"learningStreak": 5}'
   ```

3. **Invalid Data:**
   ```bash
   curl -X PUT http://localhost:3000/api/v1/users/stats/dashboard \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer valid_token" \
     -d '{"learningStreak": -5}'
   ```

---

## Changelog

### v1.0.0 (2026-01-29)
- Added initial dashboard stats endpoints
- Implemented update dashboard stats functionality
- Added comprehensive documentation
