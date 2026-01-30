# Conversation Lesson API Documentation

## Overview
API mới cho hệ thống conversation lesson theo format Minna no Nihongo với đầy đủ exercises và grading tự động.

## Base URL
```
http://localhost:3000/api/v1/conversation
```

## Authentication
- Public endpoints: Không cần authentication
- Protected endpoints: Cần mock token (development) hoặc JWT token (production)

---

## 🆕 Endpoints Mới

### 1. Get All Conversation Lessons
**Endpoint:** `GET /lessons`

**Description:** Lấy danh sách tất cả bài học conversation với hỗ trợ filter và pagination

**Query Parameters:**
```typescript
interface GetLessonsParams {
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'     // Filter theo level
  category?: 'greetings' | 'self_introduction' | 'daily_life' | 
             'shopping' | 'restaurant' | 'travel' | 'business' | 
             'school' | 'hospital' | 'other'          // Filter theo category
  difficulty?: 1 | 2 | 3 | 4 | 5                   // Filter theo độ khó
  page?: number                                   // Pagination (default: 1)
  limit?: number                                  // Items per page (default: 20, max: 100)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lessons": [
      {
        "lesson_id": 1,
        "lesson_title": "はじめまして – Chào hỏi lần đầu",
        "situation_vi": "Mai gặp John lần đầu ở trường và tự giới thiệu.",
        "level": "N5",
        "category": "greetings",
        "difficulty": 1,
        "estimated_duration": 15,
        "dialogue": [...],
        "exercises": {...},
        "is_active": true,
        "usage_count": 0
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

**Frontend Usage:**
```typescript
// Fetch all lessons
const response = await fetch('/api/v1/conversation/lessons');
const data = await response.json();

// Filter by level and category
const filteredResponse = await fetch(
  '/api/v1/conversation/lessons?level=N5&category=school'
);
```

---

### 2. Get Lesson by ID
**Endpoint:** `GET /lessons/:id`

**Description:** Lấy chi tiết một bài học conversation theo ID (có thể dùng lesson_id hoặc MongoDB _id)

**Path Parameters:**
```typescript
interface LessonParams {
  id: string | number  // Có thể là "1" hoặc MongoDB ObjectId
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lesson_id": 1,
    "lesson_title": "はじめまして – Chào hỏi lần đầu",
    "situation_vi": "Mai gặp John lần đầu ở trường và tự giới thiệu.",
    "level": "N5",
    "category": "greetings",
    "difficulty": 1,
    "estimated_duration": 15,
    "dialogue": [
      {
        "line_id": 1,
        "speaker": "Mai",
        "text_jp": "こんにちは。",
        "romaji": "Konnichiwa.",
        "meaning_vi": "Xin chào.",
        "audio_url": "/audio/conversation/lesson_1/line_1.mp3"
      }
    ],
    "exercises": {
      "dictation": [...],
      "comprehension_mcq": [...],
      "reorder": [...],
      "roleplay": {...},
      "shadowing": [...],
      "reaction_speaking": [...]
    }
  }
}
```

**Frontend Usage:**
```typescript
// Get lesson by number ID
const lesson1 = await fetch('/api/v1/conversation/lessons/1');

// Get lesson by MongoDB ID
const lessonById = await fetch('/api/v1/conversation/lessons/507f1f77bcf86cd799439011');
```

---

### 3. Get Lesson Exercises
**Endpoint:** `GET /lessons/:id/exercises`

**Description:** Lấy exercises của một bài học, có thể filter theo loại exercise

**Query Parameters:**
```typescript
interface GetExercisesParams {
  exerciseType?: 'dictation' | 'comprehension_mcq' | 'reorder' | 
                  'roleplay' | 'shadowing' | 'reaction_speaking'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lesson_id": 1,
    "lesson_title": "はじめまして – Chào hỏi lần đầu",
    "exercises": {
      // Nếu có exerciseType parameter
      "dictation": [
        {
          "line_id": 3,
          "text_with_blank": "わたしは＿＿＿＿です。",
          "answer": "マイ"
        }
      ]
      
      // Nếu không có exerciseType parameter - trả về tất cả
      "dictation": [...],
      "comprehension_mcq": [...],
      "reorder": [...],
      "roleplay": {...},
      "shadowing": [...],
      "reaction_speaking": [...]
    }
  }
}
```

**Frontend Usage:**
```typescript
// Get all exercises
const allExercises = await fetch('/api/v1/conversation/lessons/1/exercises');

// Get specific exercise type
const dictationExercises = await fetch('/api/v1/conversation/lessons/1/exercises?exerciseType=dictation');
```

---

### 4. Submit Exercise Answers
**Endpoint:** `POST /lessons/:id/submit` 🔒 **Protected**

**Description:** Nộp bài tập và nhận điểm tự động grading

**Request Body:**
```typescript
interface SubmitAnswersRequest {
  exerciseType: 'dictation' | 'comprehension_mcq' | 'reorder';
  answers: string[] | number[];  // Array of user answers
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lesson_id": 1,
    "lesson_title": "はじめまして – Chào hỏi lần đầu",
    "exercise_type": "comprehension_mcq",
    "score": 100,                    // 0-100
    "correct_answers": 1,
    "total_questions": 1,
    "results": [
      {
        "question": "Mai đang làm gì?",
        "user_answer": 1,
        "correct_answer": 1,
        "is_correct": true,
        "explanation": "Câu 'わたしはマイです' có nghĩa là 'Tôi là Mai'."
      }
    ],
    "passed": true                   // score >= 70
  }
}
```

**Frontend Usage:**
```typescript
const submitAnswers = async (lessonId: number, exerciseType: string, answers: any[]) => {
  const response = await fetch(`/api/v1/conversation/lessons/${lessonId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token' // hoặc JWT token
    },
    body: JSON.stringify({
      exerciseType,
      answers
    })
  });
  
  return await response.json();
};

// Example usage
const result = await submitAnswers(1, 'comprehension_mcq', [1]);
console.log(result.data.score); // 100
```

---

## 📊 Data Structure

### Lesson Object
```typescript
interface ConversationLesson {
  lesson_id: number;
  lesson_title: string;           // "Tiếng Nhật – Tiếng Việt"
  situation_vi: string;          // Tình huống bằng tiếng Việt
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  category: string;              // English category cho hệ thống
  difficulty: 1-5;
  estimated_duration: number;    // phút
  dialogue: DialogueLine[];
  exercises: Exercises;
  is_active: boolean;
  usage_count: number;
}

interface DialogueLine {
  line_id: number;
  speaker: string;
  text_jp: string;
  romaji: string;
  meaning_vi: string;
  audio_url: string;
}
```

### Exercises Structure
```typescript
interface Exercises {
  dictation: DictationExercise[];
  comprehension_mcq: MCQExercise[];
  reorder: ReorderExercise[];
  roleplay: RoleplayExercise;
  shadowing: ShadowingExercise[];
  reaction_speaking: ReactionSpeakingExercise[];
}

interface DictationExercise {
  line_id: number;
  text_with_blank: string;
  answer: string;
}

interface MCQExercise {
  question_vi: string;
  options: string[];
  correct_index: number;
  explanation_vi: string;
}

interface ReorderExercise {
  scrambled: string[];
  correct: string;
  meaning_vi: string;
}

interface RoleplayExercise {
  roles: string[];
  instruction_vi: string;
}

interface ShadowingExercise {
  line_id: number;
  focus: 'intonation' | 'speed' | 'emotion';
}

interface ReactionSpeakingExercise {
  situation_vi: string;
  expected_pattern: string;
  example_answer_jp: string;
  example_answer_vi: string;
}
```

---

## 🔄 Field Language Convention

### English Fields (System/Filtering)
- `category`: "greetings", "school", "travel", etc.
- `exerciseType`: "dictation", "comprehension_mcq", "reorder", etc.
- `focus`: "intonation", "speed", "emotion"
- `level`: "N5", "N4", "N3", "N2", "N1"

### Vietnamese Fields (Display)
- `lesson_title`: "Tiếng Nhật – Tiếng Việt"
- `situation_vi`: Tình huống mô tả
- `meaning_vi`: Nghĩa của câu thoại
- `question_vi`: Câu hỏi trắc nghiệm
- `instruction_vi`: Hướng dẫn exercises
- `explanation_vi`: Giải thích đáp án
- `example_answer_vi`: Câu trả lời mẫu

---

## 🎯 Frontend Implementation Tips

### 1. Component Structure
```typescript
// LessonList Component
interface LessonListProps {
  filters?: {
    level?: string;
    category?: string;
    difficulty?: number;
  };
}

// LessonDetail Component
interface LessonDetailProps {
  lessonId: string | number;
}

// ExerciseComponent
interface ExerciseProps {
  exerciseType: string;
  data: any;
  onSubmit: (answers: any[]) => void;
}
```

### 2. State Management
```typescript
// Redux slice example
interface ConversationState {
  lessons: ConversationLesson[];
  currentLesson: ConversationLesson | null;
  loading: boolean;
  error: string | null;
  filters: {
    level?: string;
    category?: string;
    difficulty?: number;
  };
}
```

### 3. Error Handling
```typescript
const handleApiError = (error: any) => {
  if (error.response?.status === 404) {
    return 'Lesson not found';
  }
  if (error.response?.status === 400) {
    return 'Invalid request parameters';
  }
  return 'An error occurred. Please try again.';
};
```

### 4. Loading States
```typescript
// Skeleton loader for lessons
const LessonSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);
```

---

## 🚀 Quick Start Examples

### React Component Example
```typescript
import React, { useState, useEffect } from 'react';

const ConversationLessons: React.FC = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ level: 'N5' });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const params = new URLSearchParams(filters as any).toString();
        const response = await fetch(`/api/v1/conversation/lessons?${params}`);
        const data = await response.json();
        setLessons(data.data.lessons);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [filters]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Conversation Lessons</h1>
      {lessons.map(lesson => (
        <div key={lesson.lesson_id} className="lesson-card">
          <h3>{lesson.lesson_title}</h3>
          <p>{lesson.situation_vi}</p>
          <span className="badge">{lesson.level}</span>
          <span className="badge">{lesson.category}</span>
        </div>
      ))}
    </div>
  );
};
```

### Exercise Submission Example
```typescript
const ExerciseComponent: React.FC<{ lessonId: number }> = ({ lessonId }) => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/v1/conversation/lessons/${lessonId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({
          exerciseType: 'comprehension_mcq',
          answers
        })
      });
      
      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  return (
    <div>
      {/* Exercise content */}
      <button onClick={handleSubmit}>Submit Answers</button>
      {result && (
        <div className="result">
          <p>Score: {result.score}/100</p>
          <p>Status: {result.passed ? 'Passed' : 'Failed'}</p>
        </div>
      )}
    </div>
  );
};
```

---

## 📝 Notes

1. **Authentication**: Development dùng mock token, production cần JWT
2. **Rate Limiting**: Applied cho tất cả endpoints
3. **Validation**: Input validation cho tất cả parameters
4. **Error Handling**: Standardized error response format
5. **Pagination**: Support cho list endpoints
6. **Audio URLs**: Format `/audio/conversation/lesson_{lessonId}/line_{lineId}.mp3`

---

## 🔗 Related Documentation

- [Original Conversation API](./CONVERSATION_API_REQUIREMENTS.md)
- [API Version Update](./API_VERSION_UPDATE_NOTICE.md)
- [Pronunciation API](./PRONUNCIATION_ANALYSIS_BACKEND.md)
