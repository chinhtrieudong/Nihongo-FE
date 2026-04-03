# Nihongo Master API Documentation

## Overview

This document describes the API endpoints for the Nihongo Master application, including both legacy endpoints and new minna-json endpoints.

## Base URLs

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Minna JSON API**: `http://localhost:5000/api/minna-json`

---

## Lesson Component Endpoints (NEW)

These endpoints provide structured lesson content from the minna-json data source.

### GET /api/minna-json/lesson/{number}/vocabulary

Get vocabulary data for a specific lesson.

**Parameters:**
- `number` (path): Lesson number (integer)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "kanji": "学校",
      "hiragana": "がっこう",
      "katakana": null,
      "romaji": "gakkou",
      "hanviet": "học hiệu",
      "meaning_vi": "trường học",
      "meaning_en": "school",
      "example_jp": "学校に行きます。",
      "example_vi": "Đi đến trường.",
      "example_en": "Go to school.",
      "audio_url": "/audio/gakkou.mp3",
      "difficulty": "easy",
      "frequency": "high",
      "jlpt": "N5",
      "part_of_speech": "noun",
      "mnemonic": "School: Where you learn stuff!",
      "notes": "Common N5 vocabulary"
    }
  ],
  "lesson": {
    "id": "69a54bcccf315ad07757ee5c",
    "lessonNumber": 1,
    "title": "Giới thiệu bản thân",
    "level": "N5",
    "description": "Học cách giới thiệu bản thân và các lời chào hỏi cơ bản",
    "image_url": null
  },
  "total_items": 49,
  "component": "vocabulary",
  "lesson_number": 1
}
```

### GET /api/minna-json/lesson/{number}/grammar

Get grammar patterns for a specific lesson.

**Parameters:**
- `number` (path): Lesson number (integer)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "grammar_1",
      "pattern": "は (wa)",
      "explanation": "Particle は dùng để chỉ chủ đề của câu",
      "structure": "Chủ đề + は + Mô tả",
      "examples": [
        {
          "japanese": "私は学生です。",
          "vietnamese": "Tôi là sinh viên."
        }
      ],
      "level": "N5",
      "importance": "high"
    }
  ],
  "lesson": {
    "id": "69a54bcccf315ad07757ee5c",
    "lessonNumber": 1,
    "title": "Giới thiệu bản thân",
    "level": "N5",
    "description": "Học cách giới thiệu bản thân và các lời chào hỏi cơ bản",
    "image_url": null
  },
  "total_items": 10,
  "component": "grammar",
  "lesson_number": 1
}
```

### GET /api/minna-json/lesson/{number}/kaiwa

Get conversation/dialogue data for a specific lesson.

**Parameters:**
- `number` (path): Lesson number (integer)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dialogue_1",
      "dialogue": [
        {
          "jpText": "こんにちは。",
          "romaji": "Konnichiwa.",
          "viTranslation": "Xin chào.",
          "audioUrl": null
        },
        {
          "jpText": "こんにちは。よろしくお願いします。",
          "romaji": "Konnichiwa. Yoroshiku onegaishimasu.",
          "viTranslation": "Xin chào. Rất vui được gặp bạn.",
          "audioUrl": null
        }
      ],
      "audioUrl": "/audio/lesson1_dialogue.mp3",
      "scenario": "Gặp gỡ lần đầu"
    }
  ],
  "lesson": {
    "id": "69a54bcccf315ad07757ee5c",
    "lessonNumber": 1,
    "title": "Giới thiệu bản thân",
    "level": "N5",
    "description": "Học cách giới thiệu bản thân và các lời chào hỏi cơ bản",
    "image_url": null
  },
  "total_items": 1,
  "component": "kaiwa",
  "lesson_number": 1
}
```

### GET /api/minna-json/lesson/{number}/mondai

Get exercise/question data for a specific lesson.

**Parameters:**
- `number` (path): Lesson number (integer)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "exercise_group_1",
      "type": "fill_blank",
      "items": [
        {
          "id": "q1",
          "question": "私は___です。",
          "correct_answer": "学生",
          "explanation": "学生 (gakusei) nghĩa là sinh viên",
          "options": null
        },
        {
          "id": "q2",
          "question": "___は学校です。",
          "correct_answer": "ここ",
          "explanation": "ここ (koko) nghĩa là ở đây",
          "options": null
        }
      ]
    }
  ],
  "lesson": {
    "id": "69a54bcccf315ad07757ee5c",
    "lessonNumber": 1,
    "title": "Giới thiệu bản thân",
    "level": "N5",
    "description": "Học cách giới thiệu bản thân và các lời chào hỏi cơ bản",
    "image_url": null
  },
  "total_items": 10,
  "component": "mondai",
  "lesson_number": 1
}
```

### GET /api/minna-json/lesson/{number}/all

Get all component data for a specific lesson.

**Parameters:**
- `number` (path): Lesson number (integer)

**Response Format:**
Combines all the above data structures in a single response.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid lesson number",
  "message": "Lesson number must be a positive integer"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Lesson not found",
  "message": "No data found for lesson {number}"
}
```

---

## Legacy Endpoints (DEPRECATED)

These endpoints are being phased out in favor of the new minna-json endpoints above.

### GET /lesson/{number}/detail (REMOVED)
### GET /lesson/{number}/summary (REMOVED)
### PUT /lesson/{number}/detail (REMOVED)
### PUT /lesson/{number}/progress (REMOVED)

---

## API Statistics

- **Total Endpoints**: 5 (active minna-json endpoints)
- **Component Types**: vocabulary, grammar, kaiwa, mondai, all
- **Data Source**: Minna no Nihongo curriculum
- **Version**: v2.0 (minna-json)

---

## Version History

### v2.0 (Current)
- ✅ Added minna-json endpoints for structured lesson content
- ✅ Component-based data organization
- ✅ Improved error handling and response format
- ✅ Support for vocabulary, grammar, kaiwa, mondai, and combined data

### v1.0 (Legacy)
- ❌ Removed deprecated lesson detail endpoints
- ❌ Replaced with component-specific endpoints
