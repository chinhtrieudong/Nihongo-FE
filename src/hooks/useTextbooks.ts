import { useState, useEffect } from 'react';
import { textbooksAPI } from '../services/api';

export interface Textbook {
  slug: string;
  name: string;
  nameVi?: string;
  description: string;
  descriptionVi?: string;
  type: 'minna' | 'tango' | 'speed-master' | string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  totalLessons: number;
  imageUrl?: string;
  lessons: {
    lessonNumber: number;
    title: string;
    titleVi?: string;
    description?: string;
    vocabularyCount?: number;
    grammarCount?: number;
  }[];
}

export interface UseTextbooksOptions {
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  type?: string;
  page?: number;
  limit?: number;
}

export interface UseTextbooksReturn {
  textbooks: Textbook[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTextbooks = (options?: UseTextbooksOptions): UseTextbooksReturn => {
  const { level, type, page = 1, limit = 20 } = options || {};
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTextbooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page, limit };
      if (level) params.level = level;
      if (type) params.type = type;
      
      const response = await textbooksAPI.getAll();
      if (response.success) {
        // Filter client-side if needed (backend filtering will come later)
        let data = response.data;
        if (level) {
          data = data.filter((t: Textbook) => t.level === level);
        }
        if (type) {
          data = data.filter((t: Textbook) => t.type === type);
        }
        setTextbooks(data);
      } else {
        setError('Failed to fetch textbooks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTextbooks();
  }, [level, type, page, limit]);

  return { textbooks, loading, error, refetch: fetchTextbooks };
};
