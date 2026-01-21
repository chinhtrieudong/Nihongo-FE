import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface VocabularyItem {
  id: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaningVi: string;
  meaningEn: string;
  audioUrl?: string;
  imageUrl?: string;
  mnemonic?: string;
  kanjiAnalysis?: string;
  jlptLevel: "N5" | "N4" | "N3" | "N2";
}

export interface Lesson {
  id: string;
  title: string;
  courseId: string;
  contentType: "vocabulary" | "grammar" | "pronunciation" | "conversation";
  orderIndex: number;
  estimatedTime: number;
  isLocked: boolean;
}

export interface UserProgress {
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  score: number;
  timeSpent: number;
  completedAt?: string;
}

export interface FlashcardProgress {
  vocabularyId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReview: string;
}

interface LearningState {
  currentLesson: Lesson | null;
  vocabulary: VocabularyItem[];
  lessons: Lesson[];
  userProgress: UserProgress[];
  flashcards: FlashcardProgress[];
  currentLevel: "N5" | "N4" | "N3" | "N2";
  isLoading: boolean;
  error: string | null;
}

const initialState: LearningState = {
  currentLesson: null,
  vocabulary: [],
  lessons: [],
  userProgress: [],
  flashcards: [],
  currentLevel: "N5",
  isLoading: false,
  error: null,
};

const learningSlice = createSlice({
  name: "learning",
  initialState,
  reducers: {
    setCurrentLesson: (state, action: PayloadAction<Lesson>) => {
      state.currentLesson = action.payload;
    },
    loadVocabulary: (state, action: PayloadAction<VocabularyItem[]>) => {
      state.vocabulary = action.payload;
    },
    loadLessons: (state, action: PayloadAction<Lesson[]>) => {
      state.lessons = action.payload;
    },
    updateProgress: (state, action: PayloadAction<UserProgress>) => {
      const index = state.userProgress.findIndex(
        (p) => p.lessonId === action.payload.lessonId
      );
      if (index >= 0) {
        state.userProgress[index] = action.payload;
      } else {
        state.userProgress.push(action.payload);
      }
    },
    updateFlashcard: (state, action: PayloadAction<FlashcardProgress>) => {
      const index = state.flashcards.findIndex(
        (f) => f.vocabularyId === action.payload.vocabularyId
      );
      if (index >= 0) {
        state.flashcards[index] = action.payload;
      } else {
        state.flashcards.push(action.payload);
      }
    },
    setCurrentLevel: (
      state,
      action: PayloadAction<"N5" | "N4" | "N3" | "N2">
    ) => {
      state.currentLevel = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    completeLesson: (
      state,
      action: PayloadAction<{ lessonId: string; score: number }>
    ) => {
      const progress: UserProgress = {
        lessonId: action.payload.lessonId,
        status: "completed",
        score: action.payload.score,
        timeSpent: 0,
        completedAt: new Date().toISOString(),
      };
      const index = state.userProgress.findIndex(
        (p) => p.lessonId === action.payload.lessonId
      );
      if (index >= 0) {
        state.userProgress[index] = progress;
      } else {
        state.userProgress.push(progress);
      }
    },
  },
});

export const {
  setCurrentLesson,
  loadVocabulary,
  loadLessons,
  updateProgress,
  updateFlashcard,
  setCurrentLevel,
  setLoading,
  setError,
  completeLesson,
} = learningSlice.actions;

export default learningSlice.reducer;
