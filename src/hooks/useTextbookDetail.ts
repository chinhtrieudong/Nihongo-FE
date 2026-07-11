import { useState, useEffect, useCallback } from 'react';
import fakeTextbooksData from '../data/fakeTextbooksData.json';

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

// Get textbook data from local JSON
const getTextbookFromLocal = (slug: string): TextbookDetail | null => {
  const textbook = (fakeTextbooksData as any).textbooks.find((t: any) => t.slug === slug);
  if (!textbook) return null;

  // Transform lessons to match Lesson interface
  const lessons: Lesson[] = (textbook.lessons || textbook.chapters || []).map((c: any) => ({
    lessonNumber: c.lessonNumber || c.number,
    title: c.title,
    titleVi: c.titleVi || c.title,
    titleJp: c.titleJp || c.title,
    description: c.description || '',
    descriptionVi: c.descriptionVi || '',
    vocabularyCount: c.vocabularyCount || c.vocab || 0,
    grammarCount: c.grammarCount || 0,
    kaiwaCount: c.kaiwaCount || 0,
    mondaiCount: c.mondaiCount || 0,
    isActive: c.isActive ?? true,
    order: c.order || c.lessonNumber || c.number,
  }));

  return {
    slug: textbook.slug,
    name: textbook.name,
    nameVi: textbook.nameVi || textbook.name,
    nameJp: textbook.nameJp || textbook.name,
    level: textbook.level || 'N5',
    type: textbook.type || 'minna',
    description: textbook.description,
    descriptionVi: textbook.descriptionVi || textbook.description,
    descriptionJp: textbook.descriptionJp || textbook.description,
    imageUrl: textbook.imageUrl || '',
    totalLessons: textbook.totalLessons,
    totalVocabulary: textbook.totalVocabulary || 0,
    totalGrammar: textbook.totalGrammar || 0,
    estimatedHours: textbook.estimatedHours || 0,
    lessons,
    isActive: textbook.isActive ?? true,
    isPublished: textbook.isPublished ?? true,
  };
};

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
      
      // Use local data
      const data = getTextbookFromLocal(slug);
      if (data) {
        setTextbook(data);
      } else {
        setError('Textbook not found');
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
      
      // Use local data
      const textbook = getTextbookFromLocal(slug);
      if (textbook) {
        const allLessons = textbook.lessons;
        const start = (page - 1) * limit;
        const end = start + limit;
        setLessons(allLessons.slice(start, end));
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(allLessons.length / limit),
          totalItems: allLessons.length,
          itemsPerPage: limit,
        });
      } else {
        setError('Textbook not found');
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