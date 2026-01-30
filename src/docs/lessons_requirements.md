# Japanese Learning Lessons Page - Comprehensive Requirements

## 🎯 Overview

Design and implement a comprehensive Japanese learning platform following the Nihongo textbook curriculum (50 lessons from N5 to N1 level).

## 📚 Core Features 

### 1. Sidebar Navigation

- **Lesson List**: Display 50 lessons (Lesson 1 → Lesson 50)
- **Status Indicators**:
  - ✔ Completed (green)
  - 🔄 In Progress (blue)
  - 🔒 Not Started (gray)
- **Progress Bars**: Visual progress tracking for each lesson

### 2. Main Content Area with 6 Tabs

#### 📚 Vocabulary Tab

- **Flashcard System**: Interactive cards with:
  - Kanji, Hiragana, Romaji
  - Vietnamese & English meanings
  - Audio pronunciation
  - Mnemonic tips
  - Hán Việt equivalents
- **Features**:
  - 🔊 Audio playback
  - ⭐ Bookmark important words
  - 🧠 Flashcard mode with spaced repetition

#### 📘 Grammar Tab

**Structure for each grammar pattern**:

1. **Mẫu câu**: Pattern template
2. **Nghĩa + tình huống**: Meaning and usage context
3. **Cách chia**: Conjugation rules
4. **Ví dụ hội thoại**: Example sentences
5. **So sánh dễ nhầm**: Comparison with similar patterns
6. **Lỗi người Việt hay mắc**: Common Vietnamese learner mistakes
7. **Sơ đồ trực quan**: Visual grammar maps

#### 💬 Conversation Tab

- **Dialogue System**:
  - Full Japanese audio
  - Romaji transcription (toggleable)
  - Vietnamese translation (toggleable)
  - Character avatars
  - Scenario descriptions
- **Controls**:
  - Play/pause audio
  - Adjust playback speed
  - Repeat sections

#### ✍ Exercises Tab

**Exercise Types**:

- Trắc nghiệm (multiple choice)
- Điền chỗ trống (fill-in-blank)
- Sắp xếp câu (sentence ordering)
- Nghe – chọn đáp án (listening comprehension)
- Viết lại câu (sentence transformation)

**Features**:

- Automatic scoring
- Detailed explanations
- Progress tracking
- Adaptive difficulty

#### 🤖 AI Practice Tab

**AI Tutor Functions**:

- 🗣 **Nói chuyện theo bài**: Contextual conversation practice
- 📝 **Kiểm tra miệng**: Oral examination mode
- 🧠 **Tạo bài luyện thêm**: Personalized exercise generation
- ❓ **Giải thích lại chỗ tôi sai**: Error analysis and correction

**AI Capabilities**:

- Natural language processing
- Grammar error detection
- Pronunciation evaluation
- Context-aware responses
- Personalized feedback

#### 📝 Summary Tab

- **Learning Summary**:
  - Key vocabulary review
  - Core grammar patterns
  - Personal weak points analysis
- **Action Buttons**:
  - 🔄 Smart review mode
  - ➡️ Proceed to next lesson

## 🎨 UI/UX Requirements

### Visual Design

- Clean, modern interface
- Responsive layout (mobile/desktop)
- Dark/light mode support
- Japanese aesthetic elements
- Progress visualization

### Interaction Design

- Smooth tab transitions
- Keyboard shortcuts
- Touch-friendly controls
- Accessibility compliance
- Loading states and animations

## 🔧 Technical Requirements

### Frontend

- **Framework**: React.js / Next.js
- **State Management**: Redux Toolkit
- **Routing**: Dynamic routing (`/lessons/:id`)
- **Styling**: Tailwind CSS / CSS Modules
- **Audio**: Web Audio API
- **Animations**: Framer Motion

### Backend

- **API**: RESTful endpoints
- **Database**: MongoDB / PostgreSQL
- **Authentication**: JWT-based
- **Storage**: Cloud storage for audio files

### Data Structure

```typescript
interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  jlptLevel: "N5" | "N4" | "N3" | "N2" | "N1";
  status: "not_started" | "in_progress" | "completed";
  progress: number;
  vocabulary: VocabularyItem[];
  grammar: GrammarPattern[];
  dialogs: Dialog[];
  exercises: Exercise[];
  userProgress: UserProgress;
}

interface VocabularyItem {
  id: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaningVi: string;
  meaningEn: string;
  audioUrl: string;
  hanViet?: string;
  mnemonic?: string;
  tags: string[];
}

interface GrammarPattern {
  id: string;
  pattern: string;
  meaning: string;
  usageContext: string;
  formation: string;
  examples: Example[];
  commonMistakes: string[];
  comparison: Comparison[];
  visualAid?: string;
}

interface Dialog {
  id: string;
  title: string;
  scenario: string;
  lines: DialogLine[];
  audioUrl: string;
}

interface Exercise {
  id: string;
  type: "multiple_choice" | "fill_blank" | "reorder" | "listening" | "writing";
  question: string;
  content: any;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  explanation: string;
}
```

## 🤖 AI System Requirements

### AI Prompt Templates

1. **Conversation Practice Prompt**
2. **Grammar Correction Prompt**
3. **Pronunciation Feedback Prompt**
4. **Exercise Generation Prompt**
5. **Personalized Learning Prompt**

### AI Capabilities

- Context-aware responses
- Error pattern recognition
- Adaptive difficulty adjustment
- Multilingual support (Japanese/Vietnamese)
- Progress-based recommendations

## 📊 Advanced Features

### 1. Classroom Mode

- AI calls student by name
- Random oral questions
- 5-second response timer
- Performance scoring

### 2. Grammar Map

- Visual knowledge graph
- Lesson interconnections
- Prerequisite tracking
- Progress visualization

### 3. Error Profile

- Individual mistake tracking
- Pattern recognition
- Targeted exercises
- Progress reports

### 4. Shadowing Mode

- Audio playback with visual guide
- User recording
- AI pronunciation scoring
- Waveform comparison

### 5. Gamification

- Achievement badges
- Experience points
- Leaderboards
- Streak tracking
- Reward system

## 🎯 User Flow

1. **Lesson Selection**: Choose from sidebar
2. **Tab Navigation**: Explore different content types
3. **Interactive Learning**: Engage with exercises and AI
4. **Progress Tracking**: Monitor completion status
5. **Review & Advance**: Smart review before proceeding

## 📁 Deliverables

1. **Wireframes**: Visual mockups of all screens
2. **Component Architecture**: React component hierarchy
3. **Database Schema**: Complete data model
4. **AI Prompt Library**: System prompts for all functions
5. **User Flow Diagram**: Complete interaction map
6. **Technical Documentation**: API specs and integration guide

## 📅 Implementation Timeline

1. **Phase 1**: Core structure and navigation
2. **Phase 2**: Content tabs implementation
3. **Phase 3**: AI integration
4. **Phase 4**: Advanced features
5. **Phase 5**: Testing and optimization
6. **Phase 6**: Deployment and monitoring

This comprehensive design ensures a complete, pedagogically sound, and technically robust Japanese learning platform.
