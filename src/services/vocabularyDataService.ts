/**
 * Vocabulary Data Service
 * Handles loading and querying vocabulary data from backend API
 */

import type {
  VocabularyItem,
  VocabularyFilter,
  TextbookType,
  JLPTLevel,
  LessonInfo,
} from '../types/vocabulary';
import { minnaAPI } from './api';

/**
 * Convert backend Tango item to VocabularyItem
 */
const toVocabularyItem = (item: any): VocabularyItem => ({
  id: item._id,
  wordId: item._id,
  sourceId: item._id,
  kanji: item.kanji || item.word || '',
  hiragana: item.hiragana || item.reading || '',
  hanViet: item.hanViet || item.han_viet || '',
  meaning: item.meaning || item.meaningVi || '',
  type: item.type || item.partOfSpeech || 'unknown',
  example: typeof item.example === 'object' ? item.example?.jp || '' : item.example || '',
  exampleMeaning: typeof item.example === 'object' ? item.example?.vn || '' : item.exampleMeaning || item.exampleVi || '',
  textbook: item.textbook || 'minna_no_nihongo',
  level: item.level || 'N5',
  lesson: item.lessonNumber || 1,
  topic: item.topic || item.topicName || '',
});

/**
 * Get vocabulary with optional filtering using backend API
 */
export const getVocabulary = async (filter?: VocabularyFilter): Promise<VocabularyItem[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filter?.textbook) params.append('textbook', filter.textbook);
    if (filter?.level) params.append('level', filter.level);
    if (filter?.lesson) params.append('lesson', filter.lesson.toString());
    if (filter?.topic) params.append('topic', filter.topic);

    // Call backend API
    const response = await fetch(`/api/v1/vocabulary?${params.toString()}`);
    const result = await response.json();

    if (result.success && result.data) {
      const items = result.data.map(toVocabularyItem);

      // Apply additional filters if needed (search, type)
      if (filter) {
        return items.filter((item: VocabularyItem) => {
          if (filter.type && item.type !== filter.type) return false;
          if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            const matchesKanji = item.kanji.toLowerCase().includes(searchLower);
            const matchesHiragana = item.hiragana.toLowerCase().includes(searchLower);
            const matchesMeaning = item.meaning.toLowerCase().includes(searchLower);
            if (!matchesKanji && !matchesHiragana && !matchesMeaning) return false;
          }
          return true;
        });
      }

      return items;
    }

    return [];
  } catch (error) {
    console.error('Error fetching vocabulary from backend:', error);
    return [];
  }
};

/**
 * Get vocabulary for a specific textbook lesson using backend API
 * Compatible with legacy textbookId format (e.g., "minna-n5", "tango-n1")
 */
export const getLessonVocabulary = async (
  textbookId: string,
  lessonNumber: number
): Promise<VocabularyItem[]> => {
  try {
    const response = await fetch(`/api/v1/vocabulary/textbook/${textbookId}/lesson/${lessonNumber}`);
    const result = await response.json();

    if (result.success && result.data) {
      return result.data.map(toVocabularyItem);
    }
    return [];
  } catch (error) {
    console.error('Error fetching lesson vocabulary from backend:', error);
    return [];
  }
};

/**
 * Get lesson info for a textbook using backend API
 */
export const getLessons = async (
  textbookId: string
): Promise<LessonInfo[]> => {
  try {
    // Parse textbookId to get slug for backend
    const parts = textbookId.split('-');
    if (parts.length < 2) return [];

    // Convert to backend slug format (e.g., "minna-n5")
    const slug = textbookId;

    // Call backend API to get lessons
    const response = await fetch(`/api/v1/textbooks/${slug}/lessons`);
    const result = await response.json();

    if (result.success && result.data) {
      // Transform backend response to LessonInfo format
      return result.data.map((lesson: any) => ({
        lessonNumber: lesson.number || lesson.lessonNumber,
        lessonTitle: lesson.topic || lesson.title || `Bài ${lesson.lessonNumber}`,
        textbookId,
        level: parts[1].toUpperCase() as JLPTLevel,
        topic: lesson.topic || '',
        vocabCount: lesson.vocab || lesson.vocabularyCount || 0,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching lessons from backend:', error);
    return [];
  }
};

/**
 * Get all available topics for a textbook level
 */
export const getTopics = async (
  textbook: TextbookType,
  level: JLPTLevel
): Promise<string[]> => {
  try {
    const textbookId = `${textbook}-${level.toLowerCase()}`;
    const lessons = await getLessons(textbookId);
    
    const topics = new Set<string>();
    lessons.forEach(lesson => {
      if (lesson.topic) {
        topics.add(lesson.topic);
      }
    });
    return Array.from(topics).sort();
  } catch (error) {
    console.error('Error fetching topics from backend:', error);
    return [];
  }
};

/**
 * Search vocabulary across all textbooks
 */
export const searchVocabulary = async (query: string): Promise<VocabularyItem[]> => {
  try {
    const response = await fetch(`/api/v1/vocabulary/search?q=${encodeURIComponent(query)}`);
    const result = await response.json();
    if (result.success && result.data) {
      return result.data.map(toVocabularyItem);
    }
    return [];
  } catch (error) {
    console.error('Error searching vocabulary:', error);
    return [];
  }
};

/**
 * Get a single word by ID
 */
export const getWordById = async (wordId: string): Promise<VocabularyItem | null> => {
  try {
    const response = await fetch(`/api/v1/vocabulary/${wordId}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return toVocabularyItem(result.data);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching word by ID from backend:', error);
    return null;
  }
};

/**
 * Get all sources for a word (where it appears in different textbooks)
 */
export const getWordSources = async (wordId: string): Promise<VocabularyItem[]> => {
  // For now, just return the word itself
  // This would need a backend endpoint to fetch all sources
  const word = await getWordById(wordId);
  return word ? [word] : [];
};

/**
 * Get statistics about the vocabulary data
 */
export const getVocabularyStats = async () => {
  try {
    const response = await fetch('/api/v1/vocabulary?limit=1');
    const result = await response.json();
    
    if (result.success && result.pagination) {
      return {
        totalUniqueWords: result.pagination.totalItems,
        totalMappings: result.pagination.totalItems,
        duplicates: 0,
        byTextbook: {},
        byLevel: {},
      };
    }
    
    return {
      totalUniqueWords: 0,
      totalMappings: 0,
      duplicates: 0,
      byTextbook: {},
      byLevel: {},
    };
  } catch (error) {
    console.error('Error fetching vocabulary stats from backend:', error);
    return {
      totalUniqueWords: 0,
      totalMappings: 0,
      duplicates: 0,
      byTextbook: {},
      byLevel: {},
    };
  }
};

/**
 * Clear cache (no-op since we're using backend API)
 */
export const clearCache = (): void => {
  // No cache to clear when using backend API
};

// Default export as vocabularyAPI object
const vocabularyAPI = {
  getVocabulary,
  getLessonVocabulary,
  getLessons,
  getTopics,
  searchVocabulary,
  getWordById,
  getWordSources,
  getVocabularyStats,
  clearCache,
};

export default vocabularyAPI;
