import { useState, useEffect, useCallback } from 'react';
import { textbooksAPI } from '../services/api';

export interface Lesson {
  lessonNumber: number;
  title: string;
  titleVi: string;
  titleJp: string;
  description: string;
  descriptionVi: string;
  vocabularyCount: number;
  grammarCount: number;
  kaiwaCount: number;
  mondaiCount: number;
  isActive: boolean;
  order: number;
}

export interface TextbookDetail {
  slug: string;
  name: string;
  nameVi: string;
  nameJp: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  type: 'minna' | 'tango' | 'speed-master';
  description: string;
  descriptionVi: string;
  descriptionJp: string;
  imageUrl: string;
  totalLessons: number;
  totalVocabulary: number;
  totalGrammar: number;
  estimatedHours: number;
  lessons: Lesson[];
  isActive: boolean;
  isPublished: boolean;
}

export function useTextbookDetail(slug: string | undefined) {
  const [textbook, setTextbook] = useState<TextbookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTextbook = useCallback(async () => {
    if (!slug) {
      setTextbook(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await textbooksAPI.getById(slug);
      if (response.success) {
        setTextbook(response.data);
      } else {
        setError('Failed to fetch textbook');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching textbook:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTextbook();
  }, [fetchTextbook]);

  return {
    textbook,
    loading,
    error,
    refresh: fetchTextbook,
  };
}

export function useTextbookLessons(slug: string | undefined, page: number = 1, limit: number = 20) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!slug) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await textbooksAPI.getLessons(slug, { page, limit });
      if (response.success) {
        setLessons(response.data || []);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch lessons');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, page, limit]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    pagination,
    loading,
    error,
    refresh: fetchLessons,
  };
}
