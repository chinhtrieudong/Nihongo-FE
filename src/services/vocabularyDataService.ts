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
  kanji: item.kanji || item.word,
  hiragana: item.hiragana || item.reading,
  hanViet: item.hanViet || '',
  meaning: item.meaning || item.meaningVi || '',
  type: item.type || item.partOfSpeech || 'unknown',
  example: item.example || '',
  exampleMeaning: item.exampleMeaning || item.exampleVi || '',
  textbook: item.textbook || 'minna_no_nihongo',
  level: item.level || 'N5',
  lesson: item.lessonNumber || 1,
  topic: item.topic || '',
});

/**
 * Get vocabulary with optional filtering using backend API
 */
export const getVocabulary = async (filter?: VocabularyFilter): Promise<VocabularyItem[]> => {
  try {
    // Use minnaAPI.getTango to fetch vocabulary from backend
    const lessonNumber = filter?.lesson;
    const textbook = filter?.textbook || 'minna_no_nihongo';
    
    const response = await minnaAPI.getTango(lessonNumber, textbook);
    
    if (response.success && response.data) {
      const items = response.data.map(toVocabularyItem);
      
      // Apply additional filters if needed
      if (filter) {
        return items.filter((item: VocabularyItem) => {
          if (filter.level && item.level !== filter.level) return false;
          if (filter.topic && !item.topic.toLowerCase().includes(filter.topic.toLowerCase())) return false;
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
 * Get vocabulary for a specific textbook lesson
 * Compatible with legacy textbookId format (e.g., "minna-n5", "tango-n1")
 */
export const getLessonVocabulary = async (
  textbookId: string,
  lessonNumber: number
): Promise<VocabularyItem[]> => {
  // Parse textbookId to extract textbook type and level
  const parts = textbookId.split('-');
  if (parts.length < 2) {
    console.error('Invalid textbookId format:', textbookId);
    return [];
  }

  let textbook: TextbookType;
  let level: JLPTLevel;

  // Handle kebab-case textbook names like "speed-master-n1"
  if (parts[0] === 'speed' && parts[1] === 'master') {
    textbook = 'speed-master';
    level = (parts[2] || '').toUpperCase() as JLPTLevel;
  } else {
    textbook = parts[0] as TextbookType;
    level = parts[1].toUpperCase() as JLPTLevel;
  }

  // Convert to backend textbook format
  const backendTextbook = textbook === 'minna' ? 'minna_no_nihongo' : textbook;

  // Use backend API to fetch vocabulary
  return getVocabulary({
    textbook: backendTextbook as any,
    level,
    lesson: lessonNumber,
  });
};

/**
 * Get lesson info for a textbook
 */
export const getLessons = async (
  textbookId: string
): Promise<LessonInfo[]> => {
  // Parse textbookId
  const parts = textbookId.split('-');
  if (parts.length < 2) return [];

  const textbook = parts[0] as TextbookType;
  const level = parts[1].toUpperCase() as JLPTLevel;

  // For now, return a simple list based on typical lesson counts
  // This could be enhanced to fetch from backend if there's an endpoint
  const lessonCount = level === 'N5' ? 50 : level === 'N4' ? 50 : 40;
  
  const lessons: LessonInfo[] = [];
  for (let i = 1; i <= lessonCount; i++) {
    lessons.push({
      lessonNumber: i,
      lessonTitle: `Bài ${i}`,
      textbookId,
      level,
      topic: '',
      vocabCount: 0, // Would need to fetch from backend
    });
  }

  return lessons;
};

/**
 * Get all available topics for a textbook level
 */
export const getTopics = async (
  textbook: TextbookType,
  level: JLPTLevel
): Promise<string[]> => {
  try {
    const backendTextbook = textbook === 'minna' ? 'minna_no_nihongo' : textbook;
    const response = await minnaAPI.getTango(undefined, backendTextbook);
    
    if (response.success && response.data) {
      const topics = new Set<string>();
      response.data.forEach((item: any) => {
        if (item.topic) {
          topics.add(item.topic);
        }
      });
      return Array.from(topics).sort();
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching topics from backend:', error);
    return [];
  }
};

/**
 * Search vocabulary across all textbooks
 */
export const searchVocabulary = async (query: string): Promise<VocabularyItem[]> => {
  return getVocabulary({ search: query });
};

/**
 * Get a single word by ID
 */
export const getWordById = async (wordId: string): Promise<VocabularyItem | null> => {
  try {
    const response = await minnaAPI.getTangoById(wordId);
    
    if (response.success && response.data) {
      return toVocabularyItem(response.data);
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
    const response = await minnaAPI.getTango(undefined, 'minna_no_nihongo');
    
    if (response.success && response.data) {
      const stats = {
        totalUniqueWords: response.data.length,
        totalMappings: response.data.length,
        duplicates: 0,
        byTextbook: {} as Record<string, number>,
        byLevel: {} as Record<string, number>,
      };

      response.data.forEach((item: any) => {
        const bookKey = `${item.textbook}-${item.level}`;
        stats.byTextbook[bookKey] = (stats.byTextbook[bookKey] || 0) + 1;
        stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
      });

      return stats;
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
