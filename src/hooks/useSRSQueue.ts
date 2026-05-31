import { useEffect, useCallback } from 'react';

/**
 * Hook that manages an offline queue for SRS review syncs.
 * The queue is stored in `localStorage` under the key `srs-sync-queue`.
 * Items are flushed when the browser becomes online or on component mount.
 */
export interface SRSQueueItem {
  wordId: string;
  textbookId: string;
  lessonNumber: number;
  quality: number; // SM‑2 quality (1‑5)
  timeSpent: number;
  timestamp: number;
}

/**
 * Returns helpers to enqueue a review and to manually flush the queue.
 * The `submitReview` function should be the API call that returns a Promise.
 */
export const useSRSQueue = (submitReview: (item: SRSQueueItem) => Promise<unknown>) => {
  // Load existing queue from localStorage
  const getQueue = useCallback((): SRSQueueItem[] => {
    try {
      const raw = localStorage.getItem('srs-sync-queue');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const setQueue = useCallback((queue: SRSQueueItem[]) => {
    localStorage.setItem('srs-sync-queue', JSON.stringify(queue));
  }, []);

  const enqueue = useCallback(
    (item: Omit<SRSQueueItem, 'timestamp'>) => {
      const queue = getQueue();
      queue.push({ ...item, timestamp: Date.now() });
      setQueue(queue);
    },
    [getQueue, setQueue],
  );

  const flush = useCallback(async () => {
    const queue = getQueue();
    if (queue.length === 0) return;
    // Try to send items one by one preserving order
    const remaining: SRSQueueItem[] = [];
    for (const q of queue) {
      try {
        await submitReview(q);
        // success – nothing to keep
      } catch {
        // keep the item for next retry
        remaining.push(q);
      }
    }
    setQueue(remaining);
  }, [getQueue, setQueue, submitReview]);

  // Auto‑flush when online status changes
  useEffect(() => {
    const handler = () => {
      if (navigator.onLine) {
        flush();
      }
    };
    window.addEventListener('online', handler);
    // Initial attempt on mount
    if (navigator.onLine) {
      flush();
    }
    return () => {
      window.removeEventListener('online', handler);
    };
  }, [flush]);

  return { enqueue, flush };
};
