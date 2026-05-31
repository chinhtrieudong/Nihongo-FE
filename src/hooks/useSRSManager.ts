import { useState, useEffect, useCallback } from 'react';
import { useSRS } from './useProgress';
import type { VocabularyItem } from '../types/vocabulary';

export interface SRSData {
  interval: number;
  easeFactor: number;
  nextReview: number;
  reviewCount: number;
  correctCount: number;
}

export const useSRSManager = (userId: string | undefined, textbookId: string | undefined, lessonNumber: number | undefined) => {
  const [srsData, setSrsData] = useState<Record<string, SRSData>>(() => {
    const saved = localStorage.getItem('vocabulary-srs');
    return saved ? JSON.parse(saved) : {};
  });

  const { submitReview: submitReviewAPI } = useSRS(userId || "");

  // Save SRS data to localStorage
  useEffect(() => {
    localStorage.setItem('vocabulary-srs', JSON.stringify(srsData));
  }, [srsData]);

  // Handle background sync with retry queue (simplified for now, logs failed attempts)
  const syncWithServer = useCallback(async (wordId: string, isCorrect: boolean) => {
    if (userId && textbookId && lessonNumber) {
      try {
        await submitReviewAPI({
          wordId,
          textbookId,
          lessonNumber: Number(lessonNumber),
          quality: isCorrect ? 4 : 1, // SM-2 quality mapping
          timeSpent: 5,
        });
      } catch (e) {
        console.error("Failed to sync SRS review to server. Queueing for later:", e);
        // Fallback: save to offline queue
        const queue = JSON.parse(localStorage.getItem('srs-sync-queue') || '[]');
        queue.push({
          wordId, textbookId, lessonNumber: Number(lessonNumber), quality: isCorrect ? 4 : 1, timeSpent: 5, timestamp: Date.now()
        });
        localStorage.setItem('srs-sync-queue', JSON.stringify(queue));
      }
    }
  }, [userId, textbookId, lessonNumber, submitReviewAPI]);

  // Attempt to flush offline queue
  useEffect(() => {
    if (!userId) return;

    const flushQueue = async () => {
      const queue = JSON.parse(localStorage.getItem('srs-sync-queue') || '[]');
      if (queue.length === 0) return;

      // Flush all pending items
      const successfullySynced: any[] = [];
      const failedItems: any[] = [];

      for (const item of queue) {
        try {
          await submitReviewAPI(item);
          successfullySynced.push(item);
        } catch (e) {
          // Keep failed items in queue
          failedItems.push(item);
        }
      }

      // Update queue with only failed items
      localStorage.setItem('srs-sync-queue', JSON.stringify(failedItems));
    };

    // Attempt flush when coming online or on mount
    if (navigator.onLine) {
      flushQueue();
    }
  }, [userId, submitReviewAPI]);

  const updateSRS = useCallback((wordId: string, isCorrect: boolean) => {
    setSrsData(prev => {
      const now = Date.now();
      const existing = prev[wordId] || {
        interval: 1,
        easeFactor: 2.5,
        nextReview: now,
        reviewCount: 0,
        correctCount: 0,
      };

      let newInterval = existing.interval;
      let newEaseFactor = existing.easeFactor;

      if (isCorrect) {
        newEaseFactor = Math.max(1.3, existing.easeFactor + 0.1);
        newInterval = Math.round(existing.interval * newEaseFactor);
      } else {
        newEaseFactor = Math.max(1.3, existing.easeFactor - 0.2);
        newInterval = 1;
      }

      return {
        ...prev,
        [wordId]: {
          interval: newInterval,
          easeFactor: newEaseFactor,
          nextReview: now + (newInterval * 24 * 60 * 60 * 1000), // convert days to ms
          reviewCount: existing.reviewCount + 1,
          correctCount: existing.correctCount + (isCorrect ? 1 : 0),
        },
      };
    });

    syncWithServer(wordId, isCorrect);
  }, [syncWithServer]);

  const getDueWords = useCallback((vocabularyItems: VocabularyItem[]) => {
    const now = Date.now();
    return vocabularyItems.filter(item => {
      const data = srsData[item.id];
      return !data || data.nextReview <= now;
    });
  }, [srsData]);

  return { srsData, updateSRS, getDueWords };
};
