import { describe, expect, it, vi } from "vitest";
import reducer, {
  completeLesson,
  loadLessons,
  loadVocabulary,
  setCurrentLesson,
  setCurrentLevel,
  setError,
  setLoading,
  updateFlashcard,
  updateProgress,
} from "./learningSlice";

const lesson = {
  id: "lesson-1",
  title: "Greetings",
  courseId: "n5",
  contentType: "vocabulary" as const,
  orderIndex: 1,
  estimatedTime: 15,
  isLocked: false,
};

const vocabulary = {
  id: "vocab-1",
  kanji: "日本",
  hiragana: "にほん",
  romaji: "nihon",
  meaningVi: "Nhat Ban",
  meaningEn: "Japan",
  jlptLevel: "N5" as const,
};

describe("learningSlice", () => {
  it("loads lessons and vocabulary and selects the current lesson", () => {
    const lessonsState = reducer(undefined, loadLessons([lesson]));
    const vocabularyState = reducer(lessonsState, loadVocabulary([vocabulary]));
    const currentLessonState = reducer(vocabularyState, setCurrentLesson(lesson));

    expect(currentLessonState.lessons).toEqual([lesson]);
    expect(currentLessonState.vocabulary).toEqual([vocabulary]);
    expect(currentLessonState.currentLesson).toEqual(lesson);
  });

  it("upserts lesson progress and flashcard progress", () => {
    const firstProgress = {
      lessonId: "lesson-1",
      status: "in_progress" as const,
      score: 20,
      timeSpent: 10,
    };
    const completedProgress = {
      ...firstProgress,
      status: "completed" as const,
      score: 90,
    };
    const flashcard = {
      vocabularyId: "vocab-1",
      easeFactor: 2.5,
      intervalDays: 3,
      repetitions: 2,
      nextReview: "2026-07-07",
    };

    const progressState = reducer(undefined, updateProgress(firstProgress));
    const updatedProgressState = reducer(progressState, updateProgress(completedProgress));
    const flashcardState = reducer(updatedProgressState, updateFlashcard(flashcard));

    expect(updatedProgressState.userProgress).toEqual([completedProgress]);
    expect(flashcardState.flashcards).toEqual([flashcard]);
  });

  it("completes a lesson with a timestamp and handles status flags", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-04T08:00:00.000Z"));

    const loadingState = reducer(undefined, setLoading(true));
    const errorState = reducer(loadingState, setError("Network error"));
    const levelState = reducer(errorState, setCurrentLevel("N4"));
    const completedState = reducer(levelState, completeLesson({ lessonId: "lesson-2", score: 88 }));

    expect(completedState.isLoading).toBe(true);
    expect(completedState.error).toBe("Network error");
    expect(completedState.currentLevel).toBe("N4");
    expect(completedState.userProgress[0]).toMatchObject({
      lessonId: "lesson-2",
      status: "completed",
      score: 88,
      completedAt: "2026-07-04T08:00:00.000Z",
    });

    vi.useRealTimers();
  });
});
