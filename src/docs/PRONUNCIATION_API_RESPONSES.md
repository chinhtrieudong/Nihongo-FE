# Pronunciation API Response Documentation

## Base URL
```
http://localhost:3000/api/v1/pronunciation
```

## Authentication
All endpoints except `/exercises` and `/categories` require JWT authentication:
```javascript
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

## Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": { ... } // Only when success: false
}
```

---

## 1. GET /exercises - Lấy danh sách bài tập

### Request
```javascript
GET /api/v1/pronunciation/exercises?level=N5&category=greetings&difficulty=easy&page=1&limit=20
```

### Query Parameters
| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| level | string | No | all | N5, N4, N3, N2, N1, all |
| category | string | No | all | greetings, numbers, daily, business, all |
| difficulty | string | No | - | easy, medium, hard |
| page | number | No | 1 | - |
| limit | number | No | 20 | 1-100 |

### Response
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "_id": "65a5b1c2d3e4f5g6h7i8j9k0",
        "japanese": "こんにちは",
        "romaji": "konnichiwa",
        "vietnamese": "Xin chào",
        "difficulty": "easy",
        "category": "greetings",
        "level": "N5",
        "isActive": true,
        "audioUrl": null,
        "createdAt": "2024-01-20T10:30:00.000Z",
        "updatedAt": "2024-01-20T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 2. GET /exercises/:exerciseId - Lấy chi tiết bài tập

### Request
```javascript
GET /api/v1/pronunciation/exercises/65a5b1c2d3e4f5g6h7i8j9k0
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "65a5b1c2d3e4f5g6h7i8j9k0",
    "japanese": "こんにちは",
    "romaji": "konnichiwa",
    "vietnamese": "Xin chào",
    "difficulty": "easy",
    "category": "greetings",
    "level": "N5",
    "isActive": true,
    "audioUrl": null,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "PRONUNCIATION_EXERCISE_NOT_FOUND",
    "message": "Exercise not found"
  }
}
```

---

## 3. GET /exercises/:exerciseId/audio - Lấy audio bài tập

### Request
```javascript
GET /api/v1/pronunciation/exercises/65a5b1c2d3e4f5g6h7i8j9k0/audio
```

### Response
```json
{
  "success": true,
  "data": {
    "message": "Audio URL placeholder",
    "audioUrl": "https://storage.example.com/audio/minna/1/konnichiwa.mp3"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "AUDIO_NOT_FOUND",
    "message": "Audio file not found for this exercise"
  }
}
```

---

## 4. POST /practice - Nộp bài tập phát âm

### Request
```javascript
POST /api/v1/pronunciation/practice

Headers: {
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}

Body: {
  "exerciseId": "65a5b1c2d3e4f5g6h7i8j9k0",
  "audioData": "base64_encoded_audio_file",
  "duration": 5.2
}
```

### Response
```json
{
  "success": true,
  "data": {
    "practiceId": "65a5b1c2d3e4f5g6h7i8j9k1",
    "score": 85,
    "feedback": "Tốt! Phát âm của bạn khá chuẩn.",
    "detailedAnalysis": {
      "pronunciationAccuracy": 88,
      "fluency": 82,
      "intonation": 85,
      "overallScore": 85,
      "improvements": [
        "Cải thiện ngữ điệu ở âm cuối"
      ]
    },
    "audioUrl": "https://storage.example.com/pronunciation/1642678800000.mp3",
    "createdAt": "2024-01-20T15:00:00.000Z"
  }
}
```

### Error Responses
```json
// Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// Invalid audio data
{
  "success": false,
  "error": {
    "code": "INVALID_AUDIO_DATA",
    "message": "Invalid audio data provided"
  }
}

// Exercise not found
{
  "success": false,
  "error": {
    "code": "PRONUNCIATION_EXERCISE_NOT_FOUND",
    "message": "Exercise not found"
  }
}
```

---

## 5. GET /history - Lấy lịch sử luyện tập

### Request
```javascript
GET /api/v1/pronunciation/history?page=1&limit=20&level=N5&category=greetings&startDate=2024-01-01&endDate=2024-01-31

Headers: {
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

### Query Parameters
| Parameter | Type | Required | Default | Format |
|-----------|------|----------|---------|---------|
| page | number | No | 1 | - |
| limit | number | No | 20 | 1-100 |
| level | string | No | all | N5, N4, N3, N2, N1, all |
| category | string | No | all | greetings, numbers, daily, business, all |
| startDate | string | No | - | ISO 8601 (YYYY-MM-DD) |
| endDate | string | No | - | ISO 8601 (YYYY-MM-DD) |

### Response
```json
{
  "success": true,
  "data": {
    "practices": [
      {
        "practiceId": "65a5b1c2d3e4f5g6h7i8j9k1",
        "exercise": {
          "_id": "65a5b1c2d3e4f5g6h7i8j9k0",
          "japanese": "こんにちは",
          "romaji": "konnichiwa",
          "vietnamese": "Xin chào",
          "difficulty": "easy",
          "category": "greetings",
          "level": "N5"
        },
        "score": 85,
        "feedback": "Tốt! Phát âm của bạn khá chuẩn.",
        "detailedAnalysis": {
          "pronunciationAccuracy": 88,
          "fluency": 82,
          "intonation": 85,
          "overallScore": 85
        },
        "audioUrl": "https://storage.example.com/pronunciation/1642678800000.mp3",
        "createdAt": "2024-01-20T15:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    },
    "statistics": {
      "totalPractices": 50,
      "averageScore": 78.5,
      "bestScore": 95,
      "improvementRate": 12.5
    }
  }
}
```

---

## 6. GET /stats - Lấy thống kê người dùng

### Request
```javascript
GET /api/v1/pronunciation/stats?period=week

Headers: {
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

### Query Parameters
| Parameter | Type | Required | Default | Options |
|-----------|------|----------|---------|---------|
| period | string | No | all | today, week, month, all |

### Response
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
      "N5": {
        "completed": 45,
        "total": 50,
        "averageScore": 85
      },
      "N4": {
        "completed": 30,
        "total": 60,
        "averageScore": 78
      },
      "N3": {
        "completed": 15,
        "total": 80,
        "averageScore": 72
      },
      "N2": {
        "completed": 0,
        "total": 100,
        "averageScore": 0
      },
      "N1": {
        "completed": 0,
        "total": 120,
        "averageScore": 0
      }
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
      },
      {
        "category": "daily",
        "practices": 45,
        "averageScore": 80
      },
      {
        "category": "business",
        "practices": 25,
        "averageScore": 85
      }
    ],
    "recentActivity": [
      {
        "date": "2024-01-20",
        "practices": 5,
        "averageScore": 84
      },
      {
        "date": "2024-01-19",
        "practices": 3,
        "averageScore": 79
      }
    ],
    "achievements": [
      {
        "id": "pronunciation_master",
        "unlockedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 7. GET /categories - Lấy danh mục

### Request
```javascript
GET /api/v1/pronunciation/categories
```

### Response
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
    },
    {
      "value": "daily",
      "label": "Hàng ngày",
      "description": "Các câu giao tiếp hàng ngày",
      "exerciseCount": 40
    },
    {
      "value": "business",
      "label": "Công việc",
      "description": "Các câu giao tiếp trong môi trường công sở",
      "exerciseCount": 20
    }
  ]
}
```

---

## 8. DELETE /practice/:practiceId - Xóa bản ghi luyện tập

### Request
```javascript
DELETE /api/v1/pronunciation/practice/65a5b1c2d3e4f5g6h7i8j9k1

Headers: {
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

### Response
```json
{
  "success": true,
  "message": "Practice record deleted successfully"
}
```

### Error Responses
```json
// Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// Not found
{
  "success": false,
  "error": {
    "code": "PRACTICE_NOT_FOUND",
    "message": "Practice record not found"
  }
}
```

---

## Error Codes Reference

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| UNAUTHORIZED | 401 | Authentication required |
| PRONUNCIATION_EXERCISE_NOT_FOUND | 404 | Exercise not found |
| PRACTICE_NOT_FOUND | 404 | Practice record not found |
| AUDIO_NOT_FOUND | 404 | Audio file not found |
| VALIDATION_ERROR | 400 | Input validation failed |
| INVALID_AUDIO_FORMAT | 400 | Invalid audio file format |
| AUDIO_FILE_TOO_LARGE | 400 | Audio file exceeds size limit |
| INVALID_AUDIO_DATA | 400 | Invalid audio data provided |
| PRONUNCIATION_ANALYSIS_FAILED | 422 | Speech analysis failed |
| QUOTA_EXCEEDED | 429 | Rate limit exceeded |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

## Data Types Reference

### Exercise Object
```typescript
interface Exercise {
  _id: string;
  japanese: string;
  romaji: string;
  vietnamese: string;
  difficulty: "easy" | "medium" | "hard";
  category: "greetings" | "numbers" | "daily" | "business";
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  isActive: boolean;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Practice Object
```typescript
interface Practice {
  practiceId: string;
  exercise: Exercise;
  score: number;
  feedback: string;
  detailedAnalysis: {
    pronunciationAccuracy: number;
    fluency: number;
    intonation: number;
    overallScore: number;
    improvements: string[];
  };
  audioUrl: string;
  createdAt: string;
}
```

### Pagination Object
```typescript
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

---

## Usage Examples

### JavaScript/TypeScript
```typescript
// Get exercises with filters
const response = await fetch('/api/v1/pronunciation/exercises?level=N5&category=greetings&page=1&limit=10', {
  headers: {
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// Submit practice
const practiceResponse = await fetch('/api/v1/pronunciation/practice', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    exerciseId: '65a5b1c2d3e4f5g6h7i8j9k0',
    audioData: 'base64_audio_data',
    duration: 5.2
  })
});
```

### React Hook Example
```typescript
const usePronunciationExercises = (filters: ExerciseFilters) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/v1/pronunciation/exercises?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setExercises(data.data.exercises);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to fetch exercises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [filters]);

  return { exercises, loading, error, refetch: fetchExercises };
};
```

---

## Rate Limiting
- **Practice Submission**: 10 requests per minute per user
- **Audio Download**: 50 requests per minute per user  
- **History Fetch**: 20 requests per minute per user

---

## File Upload Specifications
- **Supported Formats**: MP3, WAV, M4A
- **Max File Size**: 10MB
- **Duration Range**: 1-30 seconds
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128kbps (MP3), 16-bit (WAV)
