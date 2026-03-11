export interface Radical {
  radical?: string;
  hanviet?: string;
  meaning?: string;
  value?: string;
}

export interface KanjiAnalysis {
  character: string;
  hiragana?: string;
  hanviet: string;
  meaning: string;
  radicals?: Array<Radical | string>;
  onyomi?: Array<string | { kana?: string; romaji?: string }>;
  kunyomi?: Array<string | { kana?: string; romaji?: string }>;
  jlpt?: string;
  jlpt_level?: string;
  jpt?: string;
  jpt_level?: string;
  image_explanation?: string;
}

export interface VocabularyItem {
  id: string;
  kanji: string;
  hiragana: string;
  katakana?: string;
  romaji: string;
  hanviet?: string;
  meaningVi?: string;
  meaning_vi?: string; // For backward compatibility
  meaningEn?: string;
  audioUrl?: string;
  audio_url?: string;
  imageUrl?: string;
  mnemonic?: string;
  kanji_analysis?: string | KanjiAnalysis[];
  exampleSentence?: string;
  exampleSentenceVi?: string;
  example_jp?: string;
  example_vi?: string;
  jlpt?: string;
  jlpt_level?: string;
  jpt?: string;
  jpt_level?: string;
  difficulty?: "easy" | "medium" | "hard";
  frequency?: "low" | "medium" | "high";
  tags?: string[];
  status?: 'unknown' | 'learning' | 'known';
}

export interface Example {
  japanese: string;
  romaji?: string;
  meaning?: string;
  vietnamese?: string;
}

export interface Comparison {
  pattern: string;
  difference: string;
}

export interface GrammarPattern {
  id: string;
  pattern: string;
  meaning?: string;
  meaning_vi?: string;
  usage_vi?: string;
  structure?: string;
  formation?: string;
  examples: Example[];
  comparison?: string;
  level: string;
  importance: string;
  status: string;
}

export interface DialogLine {
  speaker: string;
  japanese: string;
  romaji: string;
  vietnamese: string;
  audioUrl?: string;
}

export interface Dialog {
  id: string;
  title?: string;
  scenario?: string;
  lines?: DialogLine[];
  jpText?: string;
  romaji?: string;
  viTranslation?: string;
  audioUrl?: string;
  // New kaiwa properties
  title_jp?: string;
  setting?: string;
  characters?: string[];
  dialogue?: Array<{
    speaker: string;
    jpText: string;
    romaji: string;
    viTranslation: string;
    speaker_role: string;
  }>;
  total_lines?: number;
  vocabulary_focus?: string[];
  grammar_focus?: string[];
}

export interface Exercise {
  id: string;
  type: "multiple-choice" | "fill-blank" | "fill_blank" | "reorder" | "listening" | "writing" | "listening_comprehension" | "dialogue_comprehension";
  title?: string;
  question: string;
  answer?: string | string[];
  content?: {
    options?: string[];
    sentence?: string;
    correctOrder?: string[];
    audioUrl?: string;
    prompt?: string;
  };
  options?: string[];
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  explanation?: string;
  // Mondai-specific properties
  audioUrl?: string;
  description?: string;
  instructions?: string;
  items?: Array<{
    question: string;
    question_translation?: string;
    type: string;
    correct_answer?: string;
    correct_answer_translation?: string;
    explanation?: string;
  }>;
  dialogues?: Array<{
    dialogue_number: number;
    content: Array<{
      speaker: string;
      japanese: string;
      translation: string;
    }>;
    questions: Array<{
      question: string;
      type: string;
      options?: string[];
      correct_answer?: string;
      explanation?: string;
    }>;
  }>;
}

export interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  description: string;
  status: "not_started" | "in_progress" | "completed";
  progress?: number;
  image_url?: string;
  estimatedTime?: number;
  prerequisites?: string[];
  relatedLessons?: string[];
}

export interface UserProgress {
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  score: number;
  timeSpent: number;
  completedAt?: string;
  lastActivity?: string;
  completedVocabulary: string[];
  completedGrammar: string[];
  completedExercises: string[];
}

export interface FlashcardProgress {
  vocabularyId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: string;
  lastReview?: string;
  correctStreak: number;
  totalReviews: number;
}

export interface LessonDetail {
  lesson: Lesson;
  vocabularies: VocabularyItem[];
  grammars: GrammarPattern[];
  dialogs: Dialog[];
  exercises: Exercise[];
  renshuuData: any[];
  reibunData: any[];
  bunkeiData: any[];
  aiPrompts: {
    roleplayPrompt: string;
    speakingTestPrompt: string;
    grammarCheckPrompt: string;
    personalizedPracticePrompt: string;
  };
  userProgress: UserProgress;
  recommendations: {
    nextLesson?: string;
    reviewItems: string[];
    weakAreas: string[];
  };
}

export interface AIConversation {
  id: string;
  lessonId: string;
  messages: {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
  feedback: {
    grammarAccuracy: number;
    vocabularyUsage: number;
    pronunciation: number;
    overallScore: number;
    suggestions: string[];
  };
}

export interface AIExercise {
  id: string;
  type: "conversation" | "grammar_check" | "pronunciation" | "custom";
  prompt: string;
  expectedResponse?: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number;
  feedbackTemplate: string;
}

export interface LessonSummary {
  lessonId: string;
  keyVocabulary: VocabularyItem[];
  keyGrammar: GrammarPattern[];
  commonMistakes: string[];
  studyTips: string[];
  timeToReview: string;
  nextSteps: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  lessons: string[];
  estimatedDuration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  progress: number;
  isCompleted: boolean;
}

export interface Achievement {
  id: string;
  type: "grammar" | "conversation" | "pronunciation" | "streak" | "completion";
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  criteria: {
    lessonCount?: number;
    scoreThreshold?: number;
    streakDays?: number;
    grammarPatterns?: string[];
  };
}

// API Response Types
export interface LessonsResponse {
  success: boolean;
  data: {
    lessons: Lesson[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface LessonDetailResponse {
  success: boolean;
  data: LessonDetail;
}

export interface ExerciseSubmitResponse {
  success: boolean;
  data: {
    results: Array<{
      exerciseId: string;
      isCorrect: boolean;
      score: number;
      explanation: string;
      feedback: string;
    }>;
    summary: {
      total: number;
      correct: number;
      accuracy: number;
    };
  };
}

export interface AIRoleplayResponse {
  success: boolean;
  data: {
    response: string;
    romaji: string;
    meaning: string;
    feedback: {
      grammar: string;
      pronunciation: string;
      vocabulary: string;
    };
    suggestions: string[];
    conversationId: string;
    timestamp: string;
  };
}

export interface WeakPointsResponse {
  success: boolean;
  data: {
    weakPoints: {
      category: string;
      specificIssues: string[];
      examples: {
        word?: string;
        sentence?: string;
        userPronunciation?: string;
        correctPronunciation?: string;
        userSentence?: string;
        correction?: string;
      }[];
      recommendedExercises: string[];
    }[];
    overallProgress: {
      vocabulary: number;
      grammar: number;
      listening: number;
      speaking: number;
      reading: number;
    };
    improvementPlan: string[];
  };
}

export interface AIPrompts {
  roleplayPrompt: string;
  speakingTestPrompt: string;
  grammarCheckPrompt: string;
  personalizedPracticePrompt: string;
}
