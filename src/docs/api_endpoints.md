# Japanese Learning Platform - API Endpoints Documentation

## 📚 Lessons Module Endpoints

### Base URL

`http://localhost:3000/api`

### Authentication

All endpoints that modify data require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer {your_token}
```

---

## 📖 Core Endpoints

### 1. Get Lessons List

```
GET /api/lessons
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | ❌ | User ID to get progress data |
| level | string | ❌ | Filter by JLPT level (N5, N4, N3, N2, N1) |
| limit | number | ❌ | Number of lessons per page (default: 50) |
| offset | number | ❌ | Starting position (default: 0) |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/lessons?userId=123&level=N5"
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "lessons": [
      {
        "id": "696847962327c5a3aabc4e83",
        "lessonNumber": 1,
        "title": "Greetings and Introductions",
        "level": "N5",
        "description": "Basic Japanese greetings and self-introduction",
        "status": "not_started",
        "progress": 0,
        "estimatedTime": 30,
        "prerequisites": [],
        "relatedLessons": ["lesson-2", "lesson-3"]
      }
    ],
    "pagination": {
      "total": 50,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid parameters
- `404 Not Found`: No lessons found
- `500 Server Error`: Internal server error

---

### 2. Get Lesson Detail

```
GET /api/lessons/{id}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | ❌ | User ID to get personal progress |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/lessons/696847962327c5a3aabc4e83?userId=123"
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "lesson": {
      "id": "696847962327c5a3aabc4e83",
      "lessonNumber": 1,
      "title": "Greetings and Introductions",
      "level": "N5",
      "description": "Basic Japanese greetings and self-introduction",
      "estimatedTime": 30,
      "prerequisites": [],
      "relatedLessons": ["lesson-2", "lesson-3"]
    },
    "vocabularies": [
      {
        "id": "69684679d1c6887f269eaf5e",
        "kanji": "家族",
        "hiragana": "かぞく",
        "romaji": "kazoku",
        "hanviet": "gia tộc",
        "meaningVi": "gia đình",
        "meaningEn": "family",
        "audioUrl": "/audio/kazoku.mp3",
        "mnemonic": "Ka-zo-ku: Kà (cha) + Zo (mẹ) + Ku (con) = gia đình",
        "exampleSentence": "私の家族は5人です",
        "tags": ["family", "basic"]
      }
    ],
    "grammars": [
      {
        "id": "696847962327c5a3aabc4e84",
        "pattern": "〜です",
        "meaning": "to be (polite form)",
        "usageContext": "Used for self-introduction, stating facts politely",
        "formation": "Noun + です",
        "examples": [
          {
            "japanese": "私は学生です",
            "romaji": "Watashi wa gakusei desu",
            "meaning": "I am a student"
          }
        ],
        "commonMistakes": [
          "Forgetting to add です in formal situations",
          "Using です with adjectives incorrectly"
        ],
        "comparison": [
          {
            "pattern": "〜だ",
            "difference": "だ is informal, です is polite"
          }
        ],
        "visualAid": "/diagrams/desu.png"
      }
    ],
    "dialogs": [
      {
        "id": "696847962327c5a3aabc4e85",
        "title": "Meeting for the first time",
        "scenario": "Two people meeting at a language exchange event",
        "lines": [
          {
            "speaker": "A",
            "japanese": "こんにちは。",
            "romaji": "Konnichiwa.",
            "vietnamese": "Xin chào."
          },
          {
            "speaker": "B",
            "japanese": "こんにちは。お名前は？",
            "romaji": "Konnichiwa. Onamae wa?",
            "vietnamese": "Xin chào. Tên bạn là gì?"
          }
        ],
        "audioUrl": "/audio/dialog-1.mp3"
      }
    ],
    "exercises": [
      {
        "id": "696847962327c5a3aabc4e86",
        "type": "multiple-choice",
        "title": "Basic Greetings",
        "question": "What does \"こんにちは\" mean?",
        "content": {
          "options": ["Good morning", "Good evening", "Hello", "Goodbye"]
        },
        "difficulty": "easy",
        "points": 10,
        "explanation": "こんにちは (Konnichiwa) is the standard greeting meaning 'Hello' in Japanese, used during daytime."
      }
    ],
    "aiPrompts": {
      "roleplayPrompt": "You are a Japanese teacher helping a Vietnamese student practice greetings. Start with basic self-introduction and gradually introduce more complex phrases. Be patient and correct mistakes gently.",
      "speakingTestPrompt": "Evaluate the student's pronunciation of basic greetings. Focus on intonation and clarity. Provide specific feedback on any errors.",
      "grammarCheckPrompt": "Check if the student is using です correctly in self-introduction sentences. Explain common mistakes Vietnamese learners make with this pattern.",
      "personalizedPracticePrompt": "Create 3 personalized practice exercises based on the student's current level and common mistakes. Focus on greetings and basic self-introduction."
    },
    "userProgress": {
      "lessonId": "696847962327c5a3aabc4e83",
      "status": "in_progress",
      "score": 75,
      "timeSpent": 45,
      "completedAt": null,
      "lastActivity": "2024-01-15T08:30:00Z",
      "completedVocabulary": ["vocab-1", "vocab-2"],
      "completedGrammar": ["grammar-1"],
      "completedExercises": ["exercise-1"]
    },
    "recommendations": {
      "nextLesson": "696847962327c5a3aabc4e87",
      "reviewItems": ["vocab-3", "grammar-2"],
      "weakAreas": ["pronunciation", "kanji recognition"]
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid lesson ID
- `404 Not Found`: Lesson not found
- `500 Server Error`: Internal server error

---

## ✍️ Exercise Endpoints

### 3. Submit Exercise Answer

```
POST /api/lessons/{lessonId}/exercises/{exerciseId}/submit
```

**Requires Authentication**

**Body:**

```json
{
  "userId": "user_id_here",
  "answer": "user_answer_here"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/lessons/1/exercises/1/submit" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"userId": "123", "answer": "Hello"}'
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "score": 10,
    "explanation": "Correct! こんにちは means 'Hello' in Japanese.",
    "feedback": "Great job! Your understanding of basic greetings is excellent.",
    "nextExercise": "exercise-2"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Lesson or exercise not found
- `500 Server Error`: Internal server error

---

## 🤖 AI Practice Endpoints

### 4. AI Roleplay Conversation

```
POST /api/lessons/{lessonId}/ai/roleplay
```

**Requires Authentication**

**Body:**

```json
{
  "userId": "user_id_here",
  "message": "user_message_here",
  "context": {
    "currentLesson": "lesson_id",
    "difficulty": "easy|medium|hard"
  }
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/lessons/1/ai/roleplay" \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123",
    "message": "こんにちは",
    "context": {
      "currentLesson": "1",
      "difficulty": "easy"
    }
  }'
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "response": "こんにちは！お元気ですか？",
    "romaji": "Konnichiwa! Ogenki desu ka?",
    "meaning": "Hello! How are you?",
    "feedback": {
      "grammar": "Perfect!",
      "pronunciation": "Good, but work on the 'ha' sound in こんにちは",
      "vocabulary": "Excellent use of greeting vocabulary"
    },
    "suggestions": [
      "Try adding your name: こんにちは、[name]です",
      "Practice the full greeting: こんにちは、お元気ですか？"
    ],
    "conversationId": "conv-123",
    "timestamp": "2024-01-15T08:45:00Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Lesson not found
- `500 Server Error`: Internal server error

---

## 📊 Progress Tracking Endpoints

### 5. Get User Weak Points

```
GET /api/lessons/{lessonId}/weak-points?userId={userId}
```

**Requires Authentication**

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/lessons/1/weak-points?userId=123" \
  -H "Authorization: Bearer your_token"
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "weakPoints": [
      {
        "category": "pronunciation",
        "specificIssues": ["Difficulty with つ sound", "Confusing は and わ"],
        "examples": [
          {
            "word": "つくえ",
            "userPronunciation": "/audio/user-tsukue.mp3",
            "correctPronunciation": "/audio/correct-tsukue.mp3"
          }
        ],
        "recommendedExercises": ["exercise-5", "exercise-7"]
      },
      {
        "category": "grammar",
        "specificIssues": ["Forgetting を particle", "Mixing up は and が"],
        "examples": [
          {
            "sentence": "本を読みます",
            "userSentence": "本読みます",
            "correction": "Missing を particle"
          }
        ],
        "recommendedExercises": ["exercise-3", "exercise-8"]
      }
    ],
    "overallProgress": {
      "vocabulary": 85,
      "grammar": 70,
      "listening": 65,
      "speaking": 60,
      "reading": 75
    },
    "improvementPlan": [
      "Focus on pronunciation drills for つ and は",
      "Practice particle usage with sentence building",
      "Daily shadowing exercises for 10 minutes"
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Lesson not found or no user data
- `500 Server Error`: Internal server error

---

## 🎯 Additional Endpoints

### 6. Update Lesson Progress

```
POST /api/lessons/{lessonId}/progress
```

**Requires Authentication**

**Body:**

```json
{
  "userId": "user_id_here",
  "status": "in_progress|completed",
  "score": 0-100,
  "timeSpent": 30,
  "completedItems": {
    "vocabulary": ["vocab-1", "vocab-2"],
    "grammar": ["grammar-1"],
    "exercises": ["exercise-1"]
  }
}
```

### 7. Get Related Lessons

```
GET /api/lessons/{lessonId}/related
```

### 8. Search Lessons

```
GET /api/lessons/search?q={query}
```

---

## 📋 Response Codes

| Code | Meaning      | Description                       |
| ---- | ------------ | --------------------------------- |
| 200  | OK           | Request successful                |
| 201  | Created      | Resource created successfully     |
| 400  | Bad Request  | Invalid request parameters        |
| 401  | Unauthorized | Missing or invalid authentication |
| 403  | Forbidden    | User doesn't have permission      |
| 404  | Not Found    | Resource not found                |
| 500  | Server Error | Internal server error             |

---

## 🔗 Integration Examples

### Frontend Integration (React)

```javascript
// Get lessons list
const fetchLessons = async (userId) => {
  const response = await fetch(`/api/lessons?userId=${userId}`);
  const data = await response.json();
  return data;
};

// Submit exercise
const submitExercise = async (lessonId, exerciseId, userId, answer) => {
  const response = await fetch(
    `/api/lessons/${lessonId}/exercises/${exerciseId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId, answer }),
    }
  );
  return await response.json();
};

// AI conversation
const sendAIMessage = async (lessonId, userId, message) => {
  const response = await fetch(`/api/lessons/${lessonId}/ai/roleplay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      userId,
      message,
      context: { currentLesson: lessonId, difficulty: "easy" },
    }),
  });
  return await response.json();
};
```

---

## 📊 Rate Limiting

- 100 requests per minute per user
- 10 concurrent requests per user

## 🔒 Security

- All sensitive endpoints require JWT authentication
- Rate limiting applied to prevent abuse
- Input validation on all endpoints
- HTTPS required for all requests

## 📄 Versioning

Current API version: `v1`

All endpoints are prefixed with `/api/v1/` in production.

---

This comprehensive API documentation provides all necessary endpoints for building a complete Japanese learning platform with full functionality for lessons, exercises, and AI-powered practice.
