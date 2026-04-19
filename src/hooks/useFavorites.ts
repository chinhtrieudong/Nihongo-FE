import { useState, useEffect, useCallback } from 'react';
import { favoritesAPI } from '../services/api';

export interface FavoriteItem {
  _id: string;
  wordId: {
    _id: string;
    kanji: string;
    kana: string;
    meaning: string;
    example?: string;
  };
  textbookId: string;
  lessonNumber: number;
  note?: string;
  tags?: string[];
  createdAt: string;
}

export interface UseFavoritesOptions {
  userId: string;
  textbookId?: string;
  lessonNumber?: number;
}

export function useFavorites(options: UseFavoritesOptions) {
  const { userId, textbookId, lessonNumber } = options;
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await favoritesAPI.getFavorites(userId, {
        textbookId,
        lessonNumber,
      });
      setFavorites(response.data?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, textbookId, lessonNumber]);

  const toggleFavorite = useCallback(async (data: {
    wordId: string;
    textbookId: string;
    lessonNumber: number;
  }) => {
    try {
      const response = await favoritesAPI.toggleFavorite({
        userId,
        ...data,
      });
      await fetchFavorites();
      return response.data?.favorited;
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, [userId, fetchFavorites]);

  const checkFavorite = useCallback(async (wordId: string): Promise<boolean> => {
    if (!userId || !wordId) return false;

    try {
      const response = await favoritesAPI.checkFavorite(userId, wordId);
      return response.data?.isFavorited || false;
    } catch (err) {
      console.error('Error checking favorite:', err);
      return false;
    }
  }, [userId]);

  const isFavorited = useCallback((wordId: string) => {
    return favorites.some(f => f.wordId._id === wordId);
  }, [favorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    refresh: fetchFavorites,
    toggleFavorite,
    checkFavorite,
    isFavorited,
    count: favorites.length,
  };
}
