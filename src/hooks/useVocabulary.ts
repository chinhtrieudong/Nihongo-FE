/**
 * React hook for vocabulary data
 * Provides easy access to the normalized core vocabulary data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { VocabularyItem, VocabularyFilter, LessonInfo, TextbookType, JLPTLevel } from '../types/vocabulary';
import * as vocabularyService from '../services/vocabularyDataService';

interface UseVocabularyOptions {
  textbookId?: string;
  lessonNumber?: number;
  filter?: VocabularyFilter;
  autoLoad?: boolean;
}

interface UseVocabularyReturn {
  items: VocabularyItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch vocabulary data
 */
export const useVocabulary = (options: UseVocabularyOptions = {}): UseVocabularyReturn => {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { textbookId, lessonNumber, filter, autoLoad = true } = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data: VocabularyItem[];

      if (textbookId && lessonNumber !== undefined) {
        // Fetch by textbook lesson
        data = await vocabularyService.getLessonVocabulary(textbookId, lessonNumber);
      } else if (filter) {
        // Fetch by filter
        data = await vocabularyService.getVocabulary(filter);
      } else {
        // Fetch all (not recommended for large datasets)
        data = await vocabularyService.getVocabulary();
      }

      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary');
      console.error('Error loading vocabulary:', err);
    } finally {
      setLoading(false);
    }
  }, [textbookId, lessonNumber, filter]);

  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  return {
    items,
    loading,
    error,
    refresh: fetchData,
  };
};

/**
 * Hook to get lessons for a textbook
 */
export const useLessons = (textbookId: string | undefined) => {
  const [lessons, setLessons] = useState<LessonInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!textbookId) return;

    const fetchLessons = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await vocabularyService.getLessons(textbookId);
        setLessons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lessons');
        console.error('Error loading lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [textbookId]);

  return { lessons, loading, error };
};

/**
 * Hook to search vocabulary
 */
export const useVocabularySearch = () => {
  const [results, setResults] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await vocabularyService.searchVocabulary(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error searching vocabulary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
};

/**
 * Hook to get topics for a textbook level
 */
export const useTopics = (textbook: TextbookType | undefined, level: JLPTLevel | undefined) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!textbook || !level) return;

    const fetchTopics = async () => {
      setLoading(true);
      try {
        const data = await vocabularyService.getTopics(textbook, level);
        setTopics(data);
      } catch (err) {
        console.error('Error loading topics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [textbook, level]);

  return { topics, loading };
};

/**
 * Hook to get vocabulary statistics
 */
export const useVocabularyStats = () => {
  const [stats, setStats] = useState<{
    totalUniqueWords: number;
    totalMappings: number;
    duplicates: number;
    byTextbook: Record<string, number>;
    byLevel: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await vocabularyService.getVocabularyStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};

/**
 * Hook to get a single word by ID
 */
export const useWord = (wordId: string | undefined) => {
  const [word, setWord] = useState<VocabularyItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wordId) return;

    const fetchWord = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await vocabularyService.getWordById(wordId);
        setWord(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load word');
        console.error('Error loading word:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWord();
  }, [wordId]);

  return { word, loading, error };
};
