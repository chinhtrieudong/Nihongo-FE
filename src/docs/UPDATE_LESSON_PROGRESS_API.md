# Update Lesson Progress API Documentation

## Overview

This document describes the endpoints for updating lesson status and progress in the Nihongo backend API.

## Base URL
`http://localhost:3000/api/v1/lessons`

---

## 1. Update Lesson Progress (Detailed)

### **PUT /api/v1/lessons/:id/progress**

Updates the progress and status of a specific lesson for a user.

#### **Request Headers**
```
Content-Type: application/json
```

#### **Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Lesson ID (MongoDB ObjectId) |

#### **Request Body**
```json
{
  "userId": "string",
  "status": "string",
  "progress": "number",
  "vocabularyCompleted": "boolean (optional)",
  "grammarCompleted": "boolean (optional)",
  "dialogCompleted": "boolean (optional)",
  "exercisesScore": "number (optional)",
  "aiPracticeCount": "number (optional)"
}
```

#### **Body Parameters**
| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| status | string | Yes | `not_started`, `in_progress`, `completed`, `review` | Current status of the lesson |
| progress | number | Yes | 0-100 | Progress percentage (0-100) |
| vocabularyCompleted | boolean | No | true/false | Whether vocabulary section is completed |
| grammarCompleted | boolean | No | true/false | Whether grammar section is completed |
| dialogCompleted | boolean | No | true/false | Whether dialog section is completed |
| exercisesScore | number | No | ≥ 0 | Score from exercises (0-100) |
| aiPracticeCount | number | No | ≥ 0 | Number of AI practice sessions |

#### **Example Request**
```bash
curl -X PUT http://localhost:3000/api/v1/lessons/696847962327c5a3aabc4e83/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in_progress",
    "progress": 45,
    "vocabularyCompleted": true,
    "grammarCompleted": false,
    "exercisesScore": 80
  }'
```

#### **Success Response (200)**
```json
{
  "success": true,
  "message": "Cập nhật tiến độ bài học thành công",
  "data": {
    "lessonId": "696847962327c5a3aabc4e83",
    "status": "in_progress",
    "progress": 45,
    "vocabularyCompleted": true,
    "grammarCompleted": false,
    "dialogCompleted": false,
    "exercisesScore": 80,
    "aiPracticeCount": 0,
    "lastAccessedAt": "2026-01-26T15:40:00.000Z",
    "completedAt": null
  }
}
```

#### **Error Responses**

**400 - Validation Error**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "status",
      "message": "Invalid status. Must be: not_started, in_progress, completed, or review"
    }
  ]
}
```

**404 - Lesson Not Found**
```json
{
  "success": false,
  "error": "Không tìm thấy bài học"
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "error": "Không thể cập nhật tiến độ bài học",
  "message": "Database connection error"
}
```

---

## 2. Mark Lesson as Completed (Shortcut)

### **POST /api/v1/lessons/:id/complete**

A shortcut endpoint to quickly mark a lesson as completed with 100% progress.

#### **Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Lesson ID (MongoDB ObjectId) |

#### **Request Body**
```json
{}
```

#### **Body Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| (none) | - | - | User identified by JWT token |

#### **Example Request**
```bash
curl -X POST http://localhost:3000/api/v1/lessons/696847962327c5a3aabc4e83/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```

#### **Success Response (200)**
```json
{
  "success": true,
  "message": "Đã đánh dấu bài học là hoàn thành",
  "data": {
    "lessonId": "696847962327c5a3aabc4e83",
    "status": "completed",
    "progress": 100,
    "completedAt": "2026-01-26T15:42:00.000Z"
  }
}
```

---

## Status Values

| Status | Description | Use Case |
|--------|-------------|----------|
| `not_started` | User hasn't started the lesson | Initial state |
| `in_progress` | User is currently working on the lesson | Active learning |
| `completed` | User has finished the lesson | Lesson finished |
| `review` | User needs to review the lesson | For reinforcement |

## Usage Examples

### **JavaScript/Frontend Integration**

```javascript
// Update lesson progress
const updateLessonProgress = async (lessonId, userId, status, progress) => {
  const response = await fetch(`http://localhost:3000/api/v1/lessons/${lessonId}/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      status: status,
      progress: progress,
      vocabularyCompleted: progress >= 25,
      grammarCompleted: progress >= 50,
      dialogCompleted: progress >= 75,
      exercisesScore: Math.round(progress * 0.8)
    })
  });
  
  return await response.json();
};

// Mark lesson as completed
const completeLesson = async (lessonId) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`http://localhost:3000/api/v1/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};

// Usage examples
await updateLessonProgress('696847962327c5a3aabc4e83', 'temp-ip6k6nm51', 'in_progress', 45);
await completeLesson('696847962327c5a3aabc4e83');
```

### **Progress Tracking Workflow**

```javascript
// Typical learning workflow
const learningWorkflow = async (lessonId, userId) => {
  // 1. Start lesson
  await updateLessonProgress(lessonId, 'in_progress', 0);
  
  // 2. Complete vocabulary (25% progress)
  await updateLessonProgress(lessonId, 'in_progress', 25, {
    vocabularyCompleted: true
  });
  
  // 3. Complete grammar (50% progress)
  await updateLessonProgress(lessonId, 'in_progress', 50, {
    vocabularyCompleted: true,
    grammarCompleted: true
  });
  
  // 4. Complete dialog (75% progress)
  await updateLessonProgress(lessonId, 'in_progress', 75, {
    vocabularyCompleted: true,
    grammarCompleted: true,
    dialogCompleted: true
  });
  
  // 5. Complete exercises (100% progress)
  await updateLessonProgress(lessonId, 'completed', 100, {
    vocabularyCompleted: true,
    grammarCompleted: true,
    dialogCompleted: true,
    exercisesScore: 85
  });
  
  // 6. Or simply use the shortcut
  await completeLesson(lessonId);
};
```

### **React Component Example**

```jsx
import React, { useState } from 'react';

const LessonProgress = ({ lessonId, userId }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('not_started');

  const updateProgress = async (newProgress, newStatus) => {
    try {
      const response = await fetch(`/api/v1/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: newStatus,
          progress: newProgress
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setProgress(newProgress);
        setStatus(newStatus);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completeLesson = async () => {
    try {
      const response = await fetch(`/api/v1/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await response.json();
      if (data.success) {
        setProgress(100);
        setStatus('completed');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  return (
    <div>
      <div>Progress: {progress}%</div>
      <div>Status: {status}</div>
      <button onClick={() => updateProgress(25, 'in_progress')}>
        Start Lesson
      </button>
      <button onClick={completeLesson}>
        Complete Lesson
      </button>
    </div>
  );
};
```

## Testing with cURL

### **Quick Test Commands**

```bash
# Update progress to 45%
curl -X PUT http://localhost:3000/api/v1/lessons/696847962327c5a3aabc4e83/progress \
  -H "Content-Type: application/json" \
  -d '{"userId":"temp-test123","status":"in_progress","progress":45}'

# Mark lesson as completed
curl -X POST http://localhost:3000/api/v1/lessons/696847962327c5a3aabc4e83/complete \
  -H "Content-Type: application/json" \
  -d '{"userId":"temp-test123"}'

# Verify progress updated
curl -X GET "http://localhost:3000/api/v1/lessons?userId=temp-test123"
```

## Features

### **✅ Implemented Features**
- ✅ Update lesson status and progress
- ✅ Track individual section completion (vocabulary, grammar, dialog)
- ✅ Exercise score tracking
- ✅ AI practice session counting
- ✅ Automatic timestamp tracking (lastAccessedAt, completedAt)
- ✅ Support for temporary users (temp-xxx format)
- ✅ Input validation and error handling
- ✅ Create or update progress records automatically

### **🔧 Technical Details**
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Express-validator for input validation
- **Error Handling**: Comprehensive error responses
- **User Support**: Works with both registered and temporary users
- **Progress Tracking**: Real-time progress updates

---

*Last Updated: January 26, 2026*
*Version: 1.0*
