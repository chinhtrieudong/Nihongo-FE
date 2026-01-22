# Conversation API Requirements

## Overview
API endpoints required for the Conversation page to support AI roleplay, dialog practice, and voice training features.

## Base URL
```
/api/conversation
```

---

## 1. AI Roleplay API

### 1.1 Get Available Scenarios
```http
GET /api/conversation/scenarios
```

**Query Parameters:**
- `level` (optional): "N5" | "N4" | "N3" | "N2" | "N1"
- `difficulty` (optional): "easy" | "medium" | "hard"
- `category` (optional): string (e.g., "restaurant", "shopping", "travel")

**Response:**
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "scenario_001",
        "title": "Nhà hàng Nhật Bản",
        "description": "Đặt món và gọi đồ uống trong nhà hàng",
        "level": "N5",
        "category": "restaurant",
        "difficulty": "easy",
        "scenario": "Bạn là khách hàng trong một nhà hàng Nhật Bản. Bạn cần đặt món và gọi đồ uống.",
        "aiRole": "Nhân viên phục vụ",
        "userRole": "Khách hàng",
        "vocabulary": ["注文", "メニュー", "お水", "お会計"],
        "grammar": ["〜をください", "〜はありますか", "〜にします"],
        "estimatedDuration": 10
      }
    ]
  }
}
```

### 1.2 Start AI Conversation
```http
POST /api/conversation/ai/start
```

**Request Body:**
```json
{
  "scenarioId": "scenario_001",
  "userId": "user123",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_001",
    "firstMessage": {
      "id": "msg_001",
      "role": "assistant",
      "content": "いらっしゃいませ。何名様ですか？",
      "romaji": "Irasshaimase. Nan-mei-sama desu ka?",
      "meaning": "Chào mừng quý khách. Có bao nhiêu người ạ?",
      "timestamp": "2024-01-20T10:00:00Z"
    },
    "context": {
      "scenario": {
        "id": "scenario_001",
        "title": "Nhà hàng Nhật Bản",
        "aiRole": "Nhân viên phục vụ",
        "userRole": "Khách hàng"
      },
      "difficulty": "medium",
      "startedAt": "2024-01-20T10:00:00Z"
    }
  }
}
```

### 1.3 Send Message to AI
```http
POST /api/conversation/ai/chat
```

**Request Body:**
```json
{
  "conversationId": "conv_001",
  "message": "二人です",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_002",
      "role": "assistant",
      "content": "二人様ですね。お席へご案内いたします。こちらへどうぞ。",
      "romaji": "Futari-sama desu ne. O-seki e go-annai itashimasu. Kochira e dōzo.",
      "meaning": "Hai hai người ạ. Tôi sẽ dẫn quý khách đến bàn. Mời quý khách bên này.",
      "timestamp": "2024-01-20T10:01:00Z",
      "feedback": {
        "grammar": {
          "score": 85,
          "errors": [],
          "suggestions": ["Rất tốt! Bạn đã sử dụng đúng số đếm người."]
        },
        "vocabulary": {
          "score": 90,
          "usedWords": ["二人"],
          "suggestions": ["Có thể thêm từ お願いします để lịch sự hơn."]
        },
        "pronunciation": {
          "score": 88,
          "feedback": "Phát âm tốt, chú trọng âm dài của です"
        }
      }
    },
    "conversationProgress": {
      "messagesExchanged": 2,
      "estimatedCompletion": 70,
      "objectivesMet": ["greeting", "seating"]
    }
  }
}
```

### 1.4 End AI Conversation
```http
POST /api/conversation/ai/end
```

**Request Body:**
```json
{
  "conversationId": "conv_001",
  "userId": "user123",
  "rating": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "conversationId": "conv_001",
      "duration": 15,
      "messagesExchanged": 12,
      "overallScore": 87,
      "grammarScore": 85,
      "vocabularyScore": 90,
      "pronunciationScore": 88,
      "completedObjectives": ["greeting", "ordering", "payment"],
      "weakAreas": ["honorifics", "counters"],
      "recommendations": [
        "Ôn tập lại các từ kính ngữ (さん, さま)",
        "Luyện thêm về các từ đếm người và vật"
      ],
      "nextScenario": "scenario_002"
    }
  }
}
```

---

## 2. Dialog Practice API

### 2.1 Get Available Dialogs
```http
GET /api/conversation/dialogs
```

**Query Parameters:**
- `level` (optional): "N5" | "N4" | "N3" | "N2" | "N1"
- `category` (optional): string

**Response:**
```json
{
  "success": true,
  "data": {
    "dialogs": [
      {
        "id": "dialog_001",
        "title": "Trong nhà hàng",
        "scenario": "Hai bạn đang đi ăn trong nhà hàng",
        "level": "N5",
        "category": "restaurant",
        "estimatedDuration": 8,
        "lineCount": 6
      }
    ]
  }
}
```

### 2.2 Get Dialog Details
```http
GET /api/conversation/dialogs/{dialogId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dialog": {
      "id": "dialog_001",
      "title": "Trong nhà hàng",
      "scenario": "Hai bạn đang đi ăn trong nhà hàng",
      "level": "N5",
      "category": "restaurant",
      "vocabulary": ["注文", "メニュー", "お水", "お会計", "美味しい"],
      "grammar": ["〜をください", "〜はありますか", "〜が好きです"],
      "lines": [
        {
          "id": "line_001",
          "speaker": "Waiter",
          "japanese": "いらっしゃいませ。何名様ですか？",
          "romaji": "Irasshaimase. Nan-mei-sama desu ka?",
          "vietnamese": "Chào mừng quý khách. Có bao nhiêu người ạ?",
          "audioUrl": "/api/audio/dialog_001_line_001.mp3"
        },
        {
          "id": "line_002",
          "speaker": "Customer",
          "japanese": "二人です。",
          "romaji": "Futari desu.",
          "vietnamese": "Hai người.",
          "audioUrl": "/api/audio/dialog_001_line_002.mp3"
        }
      ]
    }
  }
}
```

---

## 3. Voice Practice API

### 3.1 Start Voice Recording
```http
POST /api/conversation/voice/start
```

**Request Body:**
```json
{
  "userId": "user123",
  "exerciseType": "conversation",
  "targetText": "いらっしゃいませ。何名様ですか？"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recordingId": "rec_001",
    "startedAt": "2024-01-20T10:00:00Z",
    "maxDuration": 30
  }
}
```

### 3.2 Upload Voice Recording
```http
POST /api/conversation/voice/upload
```

**Request Body (multipart/form-data):**
- `recordingId`: string
- `audioFile`: File (audio/wav or audio/mp3)
- `userId`: string

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "recordingId": "rec_001",
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

## 4. Progress & Statistics API

### 4.1 Get User Conversation Stats
```http
GET /api/conversation/stats/{userId}
```

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
      "bestStreak": 12
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
      "masteredDialogs": 6
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
        "duration": 12
      }
    ]
  }
}
```

### 4.2 Get Conversation History
```http
GET /api/conversation/history/{userId}
```

**Query Parameters:**
- `type` (optional): "ai" | "dialog" | "voice"
- `limit` (optional): number (default: 20)
- `offset` (optional): number (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "conv_001",
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

## 5. Audio API

### 5.1 Get Audio for Text
```http
GET /api/conversation/audio/text-to-speech
```

**Query Parameters:**
- `text`: string (Japanese text)
- `voice`: (optional) string (voice type)
- `speed`: (optional) number (0.5-2.0)

**Response:**
- Audio file (MP3/WAV)

### 5.2 Get Dialog Line Audio
```http
GET /api/conversation/audio/dialog/{dialogId}/{lineId}
```

**Response:**
- Audio file (MP3/WAV)

---

## 6. Error Handling

All endpoints should return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "SCENARIO_NOT_FOUND",
    "message": "Scenario not found",
    "details": "Scenario with ID 'invalid_id' does not exist"
  }
}
```

### Common Error Codes:
- `SCENARIO_NOT_FOUND`
- `CONVERSATION_NOT_FOUND`
- `INVALID_USER_ID`
- `AUDIO_PROCESSING_ERROR`
- `RECORDING_TOO_LONG`
- `RATE_LIMIT_EXCEEDED`
- `SERVER_ERROR`

---

## 7. Rate Limiting

- AI Chat: 60 requests per hour per user
- Voice Analysis: 30 requests per hour per user
- Audio Generation: 100 requests per hour per user

---

## 8. Authentication

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 9. WebSocket Support (Optional Enhancement)

For real-time AI conversation:

```
ws://localhost:3001/ws/conversation/{conversationId}
```

**Message Format:**
```json
{
  "type": "message",
  "data": {
    "content": "二人です",
    "userId": "user123"
  }
}
```

**Response Format:**
```json
{
  "type": "response",
  "data": {
    "message": {
      "id": "msg_002",
      "role": "assistant",
      "content": "二人様ですね...",
      "romaji": "Futari-sama desu ne...",
      "meaning": "Hai hai người ạ...",
      "timestamp": "2024-01-20T10:01:00Z"
    },
    "isTyping": false
  }
}
```

---

## 10. Database Schema Suggestions

### Tables needed:
1. `conversation_scenarios`
2. `conversation_dialogs`
3. `ai_conversations`
4. `conversation_messages`
5. `voice_recordings`
6. `user_conversation_stats`
7. `audio_files`

### Key Relationships:
- Users → Conversations (1:many)
- Scenarios → Conversations (1:many)
- Conversations → Messages (1:many)
- Users → Voice Recordings (1:many)

---

## Implementation Priority

1. **Phase 1 (MVP):**
   - Get scenarios API
   - AI conversation start/chat/end
   - Basic dialog practice

2. **Phase 2:**
   - Voice recording and analysis
   - Progress tracking
   - Audio generation

3. **Phase 3:**
   - WebSocket support
   - Advanced analytics
   - Personalized recommendations
