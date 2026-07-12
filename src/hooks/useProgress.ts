import { useState, useEffect, useCallback } from 'react';
import { progressAPI } from '../services/api';

export interface ProgressStats {
  total: number;
  studied: number;
  mastered: number;
  lastStudiedAt?: string;
}

export interface LessonProgress {
  _id: string;
  userId: string;
  textbookId: string;
  lessonNumber: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'review';
  progressPercent: number;
  vocabularyStats: ProgressStats;
  grammarStats: ProgressStats;
  dialogStats: ProgressStats;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface UseProgressOptions {
  userId: string;
  textbookId?: string;
  status?: string;
}

export function useProgress(options: UseProgressOptions) {
  const { userId, textbookId, status } = options;
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    // In development mode, use mock data if no userId or API fails
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    if (!userId && !isDevelopment) return;

    try {
      setLoading(true);
      setError(null);
      
      if (userId) {
        const response = await progressAPI.getProgress(userId, { textbookId, status });
        setProgress(response.data?.data || []);
      } else if (isDevelopment) {
        // Use mock data in development when no userId
        const mockData = await import('../data/fakeProgressData.json');
        const filteredProgress = mockData.progress.filter(
          (p: any) => p.textbookId === textbookId || !textbookId
        ) as LessonProgress[];
        setProgress(filteredProgress);
      }
    } catch (err: any) {
      // Fallback to local mock data when API fails
      if (isDevelopment) {
        try {
          const mockData = await import('../data/fakeProgressData.json');
          const filteredProgress = mockData.progress.filter(
            (p: any) => p.textbookId === textbookId || !textbookId
          ) as LessonProgress[];
          setProgress(filteredProgress);
        } catch (mockErr) {
          console.error('Error loading mock progress data:', mockErr);
        }
      } else {
        setError(err.message || 'Failed to fetch progress');
        console.error('Error fetching progress:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, textbookId, status]);

  const updateProgress = useCallback(async (data: {
    textbookId: string;
    lessonNumber: number;
    status?: string;
    progressPercent?: number;
    stats?: any;
  }) => {
    try {
      const response = await progressAPI.updateLessonProgress({
        userId,
        ...data,
      });
      await fetchProgress();
      return response.data;
    } catch (err: any) {
      console.error('Error updating progress:', err);
      throw err;
    }
  }, [userId, fetchProgress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refresh: fetchProgress,
    updateProgress,
  };
}

export function useSRS(userId: string) {
  const [dueReviews, setDueReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDueReviews = useCallback(async (limit?: number) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await progressAPI.getDueReviews(userId, limit);
      setDueReviews(response.data?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch due reviews');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const submitReview = useCallback(async (data: {
    wordId: string;
    textbookId: string;
    lessonNumber: number;
    quality: number;
    timeSpent?: number;
  }) => {
    try {
      const response = await progressAPI.submitReview({
        userId,
        ...data,
      });
      return response.data;
    } catch (err: any) {
      console.error('Error submitting review:', err);
      throw err;
    }
  }, [userId]);

  useEffect(() => {
    fetchDueReviews();
  }, [fetchDueReviews]);

  return {
    dueReviews,
    loading,
    error,
    refresh: fetchDueReviews,
    submitReview,
  };
}
