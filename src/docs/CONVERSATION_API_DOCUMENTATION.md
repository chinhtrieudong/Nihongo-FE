# Conversation API Documentation

Base URL: `http://localhost:3000/api/v1/conversation`

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Public Endpoints](#public-endpoints)
3. [AI Conversation Endpoints](#ai-conversation-endpoints)
4. [Voice Recording Endpoints](#voice-recording-endpoints)
5. [Statistics & History Endpoints](#statistics--history-endpoints)
6. [Audio Generation Endpoints](#audio-generation-endpoints)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Response Format](#response-format)
10. [Code Examples](#code-examples)

---

## 🔐 Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

**How to get token:**
```javascript
// Login endpoint (example)
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "testuser",
      "role": "student"
    }
  }
}
```

---

## 🌐 Public Endpoints

### 1. Get Scenarios

Lấy danh sách các kịch bản hội thoại AI.

```http
GET /api/v1/conversation/scenarios
```

**Query Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|-------|----------|-------------|----------|
| category | string | No | Lọc theo danh mục | `restaurant` |
| level | string | No | Lọc theo trình độ | `N5` |
| difficulty | number | No | Lọc theo độ khó (1-5) | `2` |
| page | number | No | Số trang (mặc định: 1) | `1` |
| limit | number | No | Số lượng/trang (mặc định: 20) | `10` |

**Category Options:**
- `restaurant` - Nhà hàng
- `shopping` - Mua sắm
- `travel` - Du lịch
- `business` - Công việc
- `daily_life` - Đời sống hàng ngày
- `school` - Trường học
- `hospital` - Bệnh viện
- `other` - Khác

**Level Options:**
- `N5`, `N4`, `N3`, `N2`, `N1`

**Response:**
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Nhà hàng Nhật Bản",
        "description": "Tập tình huống đặt món và trả tiền tại nhà hàng Nhật Bản",
        "category": "restaurant",
        "level": "N5",
        "context": "Bạn đến một nhà hàng Nhật Bản và muốn gọi món ăn...",
        "aiRole": "Nhân viên phục vụ",
        "userRole": "Khách hàng",
        "objectives": [
          "Chào hỏi và đặt bàn",
          "Xem menu và gọi món",
          "Hỏi về món ăn",
          "Yêu cầu hóa đơn và trả tiền"
        ],
        "keyPhrases": [
          {
            "japanese": "いらっしゃいませ",
            "romaji": "irasshaimase",
            "vietnamese": "Chào mừng quý khách"
          }
        ],
        "difficulty": 2,
        "estimatedDuration": 15,
        "isActive": true,
        "usageCount": 0
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

### 2. Get Scenario Details

Lấy chi tiết một kịch bản cụ thể.

```http
GET /api/v1/conversation/scenarios/{id}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Scenario ID (MongoDB ObjectId) |

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Nhà hàng Nhật Bản",
    "description": "Tập tình huống đặt món và trả tiền tại nhà hàng Nhật Bản",
    "category": "restaurant",
    "level": "N5",
    "context": "Bạn đến một nhà hàng Nhật Bản và muốn gọi món ăn...",
    "aiRole": "Nhân viên phục vụ",
    "userRole": "Khách hàng",
    "objectives": ["Chào hỏi và đặt bàn", "Xem menu và gọi món"],
    "keyPhrases": [
      {
        "japanese": "いらっしゃいませ",
        "romaji": "irasshaimase",
        "vietnamese": "Chào mừng quý khách"
      }
    ],
    "difficulty": 2,
    "estimatedDuration": 15,
    "isActive": true,
    "usageCount": 1
  }
}
```

### 3. Get Dialogs

Lấy danh sách các hội thoại có sẵn.

```http
GET /api/v1/conversation/dialogs
```

**Query Parameters:** (Same as scenarios)

**Response:**
```json
{
  "success": true,
  "data": {
    "dialogs": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Đặt món tại nhà hàng",
        "description": "Hội thoại ngắn về việc đặt món ăn tại nhà hàng Nhật Bản",
        "category": "restaurant",
        "level": "N5",
        "lines": [
          {
            "id": "line_001",
            "speaker": "Staff",
            "japanese": "いらっしゃいませ。何名様ですか？",
            "romaji": "Irasshaimase. Nan-mei-sama desu ka?",
            "vietnamese": "Chào mừng quý khách. Có bao nhiêu người ạ?",
            "audioUrl": "/api/audio/dialog_001_line_001.mp3"
          }
        ],
        "difficulty": 2,
        "estimatedDuration": 8,
        "isActive": true,
        "usageCount": 0
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

### 4. Get Dialog Details

Lấy chi tiết một hội thoại cụ thể.

```http
GET /api/v1/conversation/dialogs/{id}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| id | string | Yes | Dialog ID (MongoDB ObjectId) |

---

## 🤖 AI Conversation Endpoints

### 5. Start AI Conversation

Bắt đầu một cuộc hội thoại mới với AI.

```http
POST /api/v1/conversation/ai/start
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "scenarioId": "507f1f77bcf86cd799439011",
  "level": "N5"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| scenarioId | string | Yes | ID của kịch bản |
| level | string | No | Trình độ (N5-N1) |

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "507f1f77bcf86cd799439013",
    "scenario": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Nhà hàng Nhật Bản",
      "context": "Bạn đến một nhà hàng Nhật Bản...",
      "aiRole": "Nhân viên phục vụ",
      "userRole": "Khách hàng",
      "objectives": ["Chào hỏi và đặt bàn"],
      "keyPhrases": [
        {
          "japanese": "いらっしゃいませ",
          "romaji": "irasshaimase",
          "vietnamese": "Chào mừng quý khách"
        }
      ]
    },
    "initialMessage": {
      "id": "msg_001",
      "role": "assistant",
      "content": "Nhân viên phục vụ：いらっしゃいませ。何名様ですか？",
      "romaji": "Nhân viên phục vụ: Irasshaimase. Nan-mei-sama desu ka?",
      "meaning": "Nhân viên phục vụ: Chào mừng quý khách. Có bao nhiêu người ạ?",
      "timestamp": "2024-01-20T10:00:00Z"
    },
    "startedAt": "2024-01-20T10:00:00Z"
  }
}
```

### 6. Send Chat Message

Gửi tin nhắn trong cuộc hội thoại AI.

```http
POST /api/v1/conversation/ai/chat
```

**Request Body:**
```json
{
  "conversationId": "507f1f77bcf86cd799439013",
  "message": "こんにちは。二人です。"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| conversationId | string | Yes | ID cuộc hội thoại |
| message | string | Yes | Nội dung tin nhắn (1-1000 ký tự) |

**Response:**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": "msg_002",
      "role": "user",
      "content": "こんにちは。二人です。",
      "timestamp": "2024-01-20T10:01:00Z",
      "score": 85,
      "feedback": "Good response!"
    },
    "aiResponse": {
      "id": "msg_003",
      "role": "assistant",
      "content": "ありがとうございます。こちらへどうぞ。メニューです。",
      "romaji": "Arigatou gozaimasu. Kochira e dōzo. Menyū desu.",
      "meaning": "Cảm ơn. Mời ngồi đây. Đây là menu.",
      "timestamp": "2024-01-20T10:01:30Z"
    },
    "conversationStatus": "active"
  }
}
```

### 7. End AI Conversation

Kết thúc cuộc hội thoại AI và nhận điểm số.

```http
POST /api/v1/conversation/ai/end/{conversationId}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| conversationId | string | Yes | ID cuộc hội thoại |

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "507f1f77bcf86cd799439013",
    "status": "completed",
    "completedAt": "2024-01-20T10:05:00Z",
    "duration": 5,
    "scores": {
      "overall": 82,
      "grammar": 85,
      "vocabulary": 88,
      "pronunciation": 83
    },
    "messageCount": 3,
    "feedback": "Great job! You completed the conversation."
  }
}
```

---

## 🎤 Voice Recording Endpoints

### 8. Start Voice Recording

Bắt đầu ghi âm cho bài tập phát âm.

```http
POST /api/v1/conversation/voice/start
```

**Request Body:**
```json
{
  "exerciseType": "conversation",
  "targetText": "いらっしゃいませ"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| exerciseType | string | Yes | Loại bài tập |
| targetText | string | Yes | Văn bản mục tiêu (1-500 ký tự) |

**Exercise Type Options:**
- `conversation` - Hội thoại
- `dialog` - Đoạn hội thoại
- `vocabulary` - Từ vựng
- `sentence` - Câu

**Response:**
```json
{
  "success": true,
  "data": {
    "recordingId": "rec_1642694400000_abc123def",
    "startedAt": "2024-01-20T10:00:00Z",
    "maxDuration": 30
  }
}
```

### 9. Upload Voice Recording

Tải file âm thanh đã ghi lên để phân tích.

```http
POST /api/v1/conversation/voice/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|-------|----------|-------------|
| recordingId | string | Yes | ID ghi âm |
| audioFile | File | Yes | File âm thanh |

**File Requirements:**
- Format: WAV, MP3, M4A
- Max size: 10MB
- Duration: Max 30 seconds

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "recordingId": "rec_1642694400000_abc123def",
      "overallScore": 85,
      "pronunciationScore": 88,
      "fluencyScore": 82,
      "accuracy": {
        "correctSyllables": 12,
        "totalSyllables": 14,
        "accuracyPercentage": 85.7
      },
      "feedback": {
        "pronunciation": [
          {
            "syllable": "い",
            "score": 90,
            "feedback": "Phát âm tốt"
          },
          {
            "syllable": "しゃ",
            "score": 75,
            "feedback": "Cần chú trọng âm SHA"
          }
        ],
        "prosody": {
          "pitch": "Tốt",
          "rhythm": "Cần cải thiện",
          "stress": "Khá tốt"
        },
        "overall": "Phát âm khá tốt. Chú trọng hơn đến âm SHA trong いらっしゃいませ."
      },
      "comparison": {
        "similarity": 87,
        "differences": [
          "Âm SHA hơi ngắn",
          "Nhịp điệu cần đều hơn"
        ]
      }
    }
  }
}
```

---

## 📊 Statistics & History Endpoints

### 10. Get User Conversation Stats

Lấy thống kê hội thoại của user.

```http
GET /api/v1/conversation/stats
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| (none) | - | - | User identified by JWT token |

**Response:**
```json
{
  "success": true,
  "data": {
    "overallStats": {
      "totalConversations": 25,
      "totalPracticeTime": 450,
      "averageScore": 82,
      "currentStreak": 7,
      "bestStreak": 12,
      "lastPracticeDate": "2024-01-20T09:30:00Z"
    },
    "aiRoleplayStats": {
      "completedScenarios": 15,
      "averageGrammarScore": 85,
      "averageVocabularyScore": 88,
      "averagePronunciationScore": 83,
      "favoriteCategories": ["restaurant", "shopping"],
      "improvementAreas": ["honorifics", "casual_speech"]
    },
    "dialogPracticeStats": {
      "completedDialogs": 10,
      "averageCompletionTime": 12,
      "replayCount": 8,
      "masteredDialogs": []
    },
    "voicePracticeStats": {
      "totalRecordings": 45,
      "averagePronunciationScore": 86,
      "improvementRate": 15.5,
      "problematicSounds": ["しゃ", "じゅ", "りゅ"]
    },
    "recentActivity": [
      {
        "type": "ai_conversation",
        "date": "2024-01-20T09:30:00Z",
        "title": "Nhà hàng Nhật Bản",
        "score": 87,
        "duration": 12,
        "scenario": "restaurant",
        "conversationId": "507f1f77bcf86cd799439013"
      }
    ]
  }
}
```

### 11. Get Conversation History

Lấy lịch sử hội thoại của user.

```http
GET /api/v1/conversation/history/{userId}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| type | string | No | Lọc theo loại |
| limit | number | No | Số lượng (mặc định: 20) |
| offset | number | No | Vị trí bắt đầu (mặc định: 0) |

**Type Options:**
- `ai` - AI conversations
- `dialog` - Dialog practice
- `voice` - Voice recordings

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "507f1f77bcf86cd799439013",
        "type": "ai_conversation",
        "date": "2024-01-20T09:30:00Z",
        "title": "Nhà hàng Nhật Bản",
        "scenario": "restaurant",
        "level": "N5",
        "duration": 12,
        "score": 87,
        "messagesExchanged": 15,
        "completedObjectives": ["greeting", "ordering", "payment"]
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## 🔊 Audio Generation Endpoints

### 12. Get Audio for Text (Text-to-Speech)

Chuyển văn bản thành giọng nói.

```http
GET /api/v1/conversation/audio/text-to-speech
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| text | string | Yes | Văn bản cần chuyển (1-500 ký tự) |
| voice | string | No | Loại giọng (male/female/child) |
| speed | number | No | Tốc độ (0.5-2.0) |

**Response:**
```json
{
  "success": true,
  "data": {
    "audioUrl": "/api/conversation/audio/generated/abc123.mp3",
    "duration": 2.5,
    "format": "mp3"
  }
}
```

### 13. Get Dialog Line Audio

Lấy audio cho một dòng hội thoại cụ thể.

```http
GET /api/v1/conversation/audio/dialog/{dialogId}/{lineId}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|-------|----------|-------------|
| dialogId | string | Yes | Dialog ID |
| lineId | string | Yes | Line ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "audioUrl": "/api/conversation/audio/dialog/507f1f77bcf86cd799439012/line_001.mp3",
    "duration": 3.2,
    "format": "mp3"
  }
}
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": "Additional details"
  }
}
```

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `SCENARIO_NOT_FOUND` | 404 | Scenario not found |
| `CONVERSATION_NOT_FOUND` | 404 | Conversation not found |
| `DIALOG_NOT_FOUND` | 404 | Dialog not found |
| `RECORDING_NOT_FOUND` | 404 | Recording not found |
| `INVALID_USER_ID` | 400 | Invalid user ID |
| `AUDIO_PROCESSING_ERROR` | 500 | Audio processing failed |
| `RECORDING_TOO_LONG` | 400 | Recording exceeds duration limit |
| `ACCESS_DENIED` | 403 | Access denied |
| `NO_FILE` | 400 | No file provided |
| `MISSING_TEXT` | 400 | Text parameter required |
| `LINE_NOT_FOUND` | 404 | Dialog line not found |
| `INVALID_TOKEN` | 401 | Invalid authentication token |
| `TOKEN_EXPIRED` | 401 | Authentication token expired |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## 🚦 Rate Limiting

### Rate Limits per User/IP

| Endpoint Type | Limit | Time Window |
|---------------|--------|-------------|
| AI Chat | 60 requests | 1 hour |
| Voice Analysis | 30 requests | 1 hour |
| Audio Generation | 100 requests | 1 hour |
| General Protected | 200 requests | 1 hour |
| Public Endpoints | 1000 requests | 1 hour |

### Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": "Maximum 60 chat requests per hour allowed"
  }
}
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1642698000
```

---

## 📋 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

---

## 💻 Code Examples

### JavaScript/TypeScript

```typescript
// API Client Setup
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1/conversation';

class ConversationAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get scenarios
  async getScenarios(params?: {
    category?: string;
    level?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_BASE}/scenarios`, {
      params,
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Start AI conversation
  async startConversation(scenarioId: string, level?: string) {
    const response = await axios.post(`${API_BASE}/ai/start`, {
      scenarioId,
      level
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Send chat message
  async sendMessage(conversationId: string, message: string) {
    const response = await axios.post(`${API_BASE}/ai/chat`, {
      conversationId,
      message
    }, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Upload voice recording
  async uploadVoice(recordingId: string, audioFile: File) {
    const formData = new FormData();
    formData.append('recordingId', recordingId);
    formData.append('audioFile', audioFile);

    const response = await axios.post(`${API_BASE}/voice/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
}

// Usage
const api = new ConversationAPI('your-jwt-token');

// Get scenarios
const scenarios = await api.getScenarios({
  category: 'restaurant',
  level: 'N5',
  page: 1,
  limit: 10
});

// Start conversation
const conversation = await api.startConversation('scenario-id', 'N5');

// Send message
const response = await api.sendMessage(conversation.data.conversationId, 'こんにちは');
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

const useConversationAPI = (token: string) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getScenarios = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/v1/conversation/scenarios', {
        params: filters,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setScenarios(response.data.data.scenarios);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return { scenarios, loading, error, getScenarios };
};

// Component usage
const ConversationScenarios = ({ token }) => {
  const { scenarios, loading, error, getScenarios } = useConversationAPI(token);

  useEffect(() => {
    getScenarios({ category: 'restaurant', level: 'N5' });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {scenarios.map(scenario => (
        <div key={scenario._id}>
          <h3>{scenario.title}</h3>
          <p>{scenario.description}</p>
          <button onClick={() => startConversation(scenario._id)}>
            Start Practice
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Vue.js Example

```javascript
// composables/useConversation.js
import { ref } from 'vue';
import axios from 'axios';

export function useConversation(token) {
  const scenarios = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const getScenarios = async (filters = {}) => {
    try {
      loading.value = true;
      const response = await axios.get('http://localhost:3000/api/v1/conversation/scenarios', {
        params: filters,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      scenarios.value = response.data.data.scenarios;
    } catch (err) {
      error.value = err.response?.data || err.message;
    } finally {
      loading.value = false;
    }
  };

  return { scenarios, loading, error, getScenarios };
}
```

---

## 🧪 Testing

### Using curl

```bash
# Get scenarios
curl -X GET "http://localhost:3000/api/v1/conversation/scenarios?category=restaurant&level=N5"

# Start conversation (with token)
curl -X POST "http://localhost:3000/api/v1/conversation/ai/start" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scenarioId":"507f1f77bcf86cd799439011","level":"N5"}'

# Upload voice recording
curl -X POST "http://localhost:3000/api/v1/conversation/voice/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "recordingId=rec_123" \
  -F "userId=507f1f77bcf86cd799439011" \
  -F "audioFile=@recording.wav"
```

### Postman Collection

Import the following Postman collection for easy testing:

```json
{
  "info": {
    "name": "Conversation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Scenarios",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/scenarios?category={{category}}&level={{level}}",
          "host": ["{{baseUrl}}"],
          "path": ["scenarios"],
          "query": [
            {"key": "category", "value": "{{category}}"},
            {"key": "level", "value": "{{level}}"}
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1/conversation"
    },
    {
      "key": "token",
      "value": "your-jwt-token"
    }
  ]
}
```

---

## 📝 Notes for Frontend Team

1. **Authentication:** All protected endpoints require JWT token in Authorization header
2. **Rate Limiting:** Handle 429 responses gracefully, show remaining requests in UI
3. **File Upload:** Use FormData for voice uploads, max file size 10MB
4. **Error Handling:** Always check `success` field first, then handle specific error codes
5. **Pagination:** Use pagination data for infinite scroll or pagination components
6. **Audio Playback:** Use returned audio URLs for playback
7. **Real-time Updates:** Consider WebSocket for live conversation updates (future feature)

### Recommended UI Components

- **Scenario Card:** Display scenario info with start button
- **Conversation Interface:** Chat-like interface for AI conversations
- **Voice Recorder:** Component with recording controls and waveform
- **Progress Dashboard:** Display user statistics and achievements
- **Audio Player:** Component for playing generated audio and dialog lines

### Best Practices

1. Store JWT token securely (httpOnly cookies or secure storage)
2. Implement retry logic for failed requests
3. Show loading states during API calls
4. Cache scenarios and dialogs for better performance
5. Implement proper error boundaries
6. Use TypeScript for better type safety
7. Test with various network conditions

---

## 🆘 Support

For any issues or questions about the API:
- Check server logs for detailed error information
- Verify JWT token validity
- Ensure proper request format
- Check rate limiting headers
- Test with provided examples

**API Version:** v1.0  
**Last Updated:** January 2024  
**Status:** ✅ Production Ready
