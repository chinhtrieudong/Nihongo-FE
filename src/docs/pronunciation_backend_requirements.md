# Backend API Requirements - Pronunciation Module

## Overview
This document outlines the backend API requirements for the pronunciation practice feature in the Nihongo learning application.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require JWT authentication (Bearer token in Authorization header).

## API Endpoints

### 1. Get Pronunciation Exercises
```
GET /pronunciation/exercises
```

**Query Parameters:**
- `level` (optional): string - JLPT level (N5, N4, N3, N2, N1)
- `category` (optional): string - Exercise category (greetings, numbers, daily, business, all)
- `difficulty` (optional): string - Difficulty level (easy, medium, hard)
- `page` (optional): number - Page number (default: 1)
- `limit` (optional): number - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "string",
        "japanese": "こんにちは",
        "romaji": "konnichiwa",
        "vietnamese": "Xin chào",
        "difficulty": "easy|medium|hard",
        "category": "greetings",
        "audioUrl": "string",
        "createdAt": "datetime",
        "updatedAt": "datetime"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get Single Exercise
```
GET /pronunciation/exercises/:exerciseId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "japanese": "こんにちは",
    "romaji": "konnichiwa",
    "vietnamese": "Xin chào",
    "difficulty": "easy|medium|hard",
    "category": "greetings",
    "audioUrl": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

### 3. Get Exercise Audio
```
GET /pronunciation/exercises/:exerciseId/audio
```

**Response:** Audio file (MP3/WAV format)

### 4. Submit Pronunciation Practice
```
POST /pronunciation/practice
```

**Request Body:**
```json
{
  "exerciseId": "string",
  "audioData": "base64_encoded_audio_file",
  "duration": "number_in_seconds"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "practiceId": "string",
    "score": 85,
    "feedback": "Tuyệt vời! Phát âm của bạn rất chuẩn.",
    "detailedAnalysis": {
      "pronunciationAccuracy": 90,
      "fluency": 80,
      "intonation": 85,
      "overallScore": 85,
      "improvements": [
        "Cần cải thiện ngữ điệu ở âm cuối",
        "Tập trung hơn vào độ dài của từng âm"
      ]
    },
    "audioUrl": "string", // URL to recorded audio
    "createdAt": "datetime"
  }
}
```

### 5. Get Practice History
```
GET /pronunciation/history
```

**Query Parameters:**
- `page` (optional): number - Page number (default: 1)
- `limit` (optional): number - Items per page (default: 20)
- `level` (optional): string - Filter by JLPT level
- `category` (optional): string - Filter by category
- `startDate` (optional): string - Start date (ISO format)
- `endDate` (optional): string - End date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "practices": [
      {
        "practiceId": "string",
        "exercise": {
          "id": "string",
          "japanese": "こんにちは",
          "romaji": "konnichiwa",
          "vietnamese": "Xin chào",
          "difficulty": "easy|medium|hard",
          "category": "greetings"
        },
        "score": 85,
        "feedback": "Tuyệt vời! Phát âm của bạn rất chuẩn.",
        "detailedAnalysis": {
          "pronunciationAccuracy": 90,
          "fluency": 80,
          "intonation": 85,
          "overallScore": 85
        },
        "audioUrl": "string",
        "createdAt": "datetime"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "totalPractices": 100,
      "averageScore": 78.5,
      "bestScore": 95,
      "improvementRate": 12.5
    }
  }
}
```

### 6. Get User Pronunciation Stats
```
GET /pronunciation/stats
```

**Query Parameters:**
- `period` (optional): string - Time period (today, week, month, all)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPractices": 150,
    "averageScore": 82.3,
    "bestScore": 98,
    "currentStreak": 7,
    "longestStreak": 15,
    "levelProgress": {
      "N5": { "completed": 45, "total": 50, "averageScore": 85 },
      "N4": { "completed": 30, "total": 60, "averageScore": 78 },
      "N3": { "completed": 15, "total": 80, "averageScore": 72 }
    },
    "categoryStats": [
      {
        "category": "greetings",
        "practices": 50,
        "averageScore": 88
      },
      {
        "category": "numbers",
        "practices": 30,
        "averageScore": 75
      }
    ],
    "recentActivity": [
      {
        "date": "2024-01-20",
        "practices": 5,
        "averageScore": 84
      }
    ],
    "achievements": [
      {
        "id": "pronunciation_master",
        "name": "Chuyên gia phát âm",
        "description": "Hoàn thành 100 bài tập",
        "unlockedAt": "datetime",
        "icon": "trophy"
      }
    ]
  }
}
```

### 7. Get Categories
```
GET /pronunciation/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "value": "greetings",
      "label": "Chào hỏi",
      "description": "Các câu chào hỏi thông dụng",
      "exerciseCount": 25
    },
    {
      "value": "numbers",
      "label": "Số đếm",
      "description": "Cách đọc các số đếm trong tiếng Nhật",
      "exerciseCount": 30
    }
  ]
}
```

### 8. Delete Practice Record
```
DELETE /pronunciation/practice/:practiceId
```

**Response:**
```json
{
  "success": true,
  "message": "Practice record deleted successfully"
}
```

## Database Schema

### Exercises Collection
```javascript
{
  _id: ObjectId,
  japanese: String,
  romaji: String,
  vietnamese: String,
  difficulty: String, // easy, medium, hard
  category: String,
  audioUrl: String,
  level: String, // N5, N4, N3, N2, N1
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Practice Records Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  exerciseId: ObjectId,
  score: Number,
  feedback: String,
  detailedAnalysis: {
    pronunciationAccuracy: Number,
    fluency: Number,
    intonation: Number,
    overallScore: Number,
    improvements: [String]
  },
  audioUrl: String,
  duration: Number,
  createdAt: Date
}
```

### User Stats Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  totalPractices: Number,
  averageScore: Number,
  bestScore: Number,
  currentStreak: Number,
  longestStreak: Number,
  levelProgress: {
    N5: { completed: Number, total: Number, averageScore: Number },
    N4: { completed: Number, total: Number, averageScore: Number },
    N3: { completed: Number, total: Number, averageScore: Number },
    N2: { completed: Number, total: Number, averageScore: Number },
    N1: { completed: Number, total: Number, averageScore: Number }
  },
  categoryStats: [{
    category: String,
    practices: Number,
    averageScore: Number
  }],
  achievements: [{
    id: String,
    unlockedAt: Date
  }],
  lastPracticeDate: Date,
  updatedAt: Date
}
```

## File Upload Requirements

### Audio File Specifications
- **Format**: MP3, WAV, M4A
- **Max Size**: 10MB
- **Duration**: 1-30 seconds
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128kbps (MP3), 16-bit (WAV)

### Storage
- Use AWS S3 or similar cloud storage for audio files
- Implement automatic cleanup of old practice recordings (older than 30 days)
- Store both original and optimized versions

## AI/ML Integration

### Speech Recognition Service
- Integrate with speech-to-text API (Google Speech-to-Text, Azure Speech Services)
- Implement pronunciation scoring algorithm
- Support for Japanese phoneme analysis

### Pronunciation Analysis
- **Accuracy**: Compare user pronunciation with native speaker
- **Fluency**: Measure speech flow and timing
- **Intonation**: Analyze pitch patterns
- **Phoneme Analysis**: Individual sound accuracy

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "PRONUNCIATION_EXERCISE_NOT_FOUND",
    "message": "Exercise not found",
    "details": {}
  }
}
```

### Error Codes
- `PRONUNCIATION_EXERCISE_NOT_FOUND`
- `INVALID_AUDIO_FORMAT`
- `AUDIO_FILE_TOO_LARGE`
- `SPEECH_RECOGNITION_FAILED`
- `PRONUNCIATION_ANALYSIS_FAILED`
- `QUOTA_EXCEEDED`

## Rate Limiting
- **Practice Submission**: 10 requests per minute per user
- **Audio Download**: 50 requests per minute per user
- **History Fetch**: 20 requests per minute per user

## Security Considerations
- Validate all audio file uploads
- Sanitize file names and paths
- Implement virus scanning for uploaded files
- Use signed URLs for audio file access
- Log all practice submissions for audit trail

## Performance Requirements
- **API Response Time**: < 500ms for most endpoints
- **Audio Processing**: < 5 seconds for pronunciation analysis
- **File Upload**: Support concurrent uploads
- **Database Indexing**: Optimize queries for user-specific data

## Testing Requirements
- Unit tests for all API endpoints
- Integration tests for audio processing pipeline
- Load testing for concurrent users
- Security testing for file upload vulnerabilities
