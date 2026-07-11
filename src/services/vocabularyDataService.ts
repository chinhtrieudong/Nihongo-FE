/**
 * Vocabulary Data Service
 * Uses local vocabulary data for Minna N5, with fallback to backend API
 */

import type {
  VocabularyItem,
  VocabularyFilter,
  TextbookType,
  JLPTLevel,
  LessonInfo,
} from '../types/vocabulary';
import { lessons as minnaLessons } from '../data/vocabulary';

/**
 * Convert local vocabulary item to VocabularyItem format
 */
const toVocabularyItem = (item: any, lessonNum: number): VocabularyItem => ({
  id: `minna-n5-${lessonNum}-${item.romaji}`,
  wordId: `minna-n5-${lessonNum}-${item.romaji}`,
  sourceId: `minna-n5-${lessonNum}-${item.romaji}`,
  kanji: item.kanji || '',
  hiragana: item.hiragana || '',
  hanViet: '',
  meaning: item.meaning || '',
  type: item.partOfSpeech || 'noun',
  example: '',
  exampleMeaning: '',
  textbook: 'minna_no_nihongo',
  level: 'N5',
  lesson: lessonNum,
  topic: '',
});

/**
 * Get vocabulary with optional filtering
 * Uses local data for minna-n5, backend API for others
 */
export const getVocabulary = async (filter?: VocabularyFilter): Promise<VocabularyItem[]> => {
  // Use local data for minna-n5
  if (filter?.textbook === 'minna' && filter?.level === 'N5') {
    const allItems: VocabularyItem[] = [];
    minnaLessons.forEach((lesson: any) => {
      if (filter.lesson && lesson.lessonNumber !== filter.lesson) return;
      lesson.vocabularies.forEach((v: any) => {
        allItems.push(toVocabularyItem(v, lesson.lessonNumber));
      });
    });
    return allItems;
  }

  // Fallback to backend API
  try {
    const params = new URLSearchParams();
    if (filter?.textbook) params.append('textbook', filter.textbook);
    if (filter?.level) params.append('level', filter.level);
    if (filter?.lesson) params.append('lesson', filter.lesson.toString());
    if (filter?.topic) params.append('topic', filter.topic);

    const response = await fetch(`/api/v1/vocabulary?${params.toString()}`);
    const result = await response.json();

    if (result.success && result.data) {
      return result.data.map(toVocabularyItem);
    }
    return [];
  } catch (error) {
    console.error('Error fetching vocabulary from backend:', error);
    return [];
  }
};

/**
 * Get vocabulary for a specific textbook lesson
 */
export const getLessonVocabulary = async (
  textbookId: string,
  lessonNumber: number
): Promise<VocabularyItem[]> => {
  // Use local data for minna-n5
  if (textbookId === 'minna-n5' || textbookId === 'minna') {
    const lesson = minnaLessons.find((l: any) => l.lessonNumber === lessonNumber);
    if (lesson) {
      return lesson.vocabularies.map((v: any) => toVocabularyItem(v, lessonNumber));
    }
    return [];
  }

  // Fallback to backend API
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
 * Get lesson info for a textbook
 */
export const getLessons = async (
  textbookId: string
): Promise<LessonInfo[]> => {
  // Use local data for minna-n5
  if (textbookId === 'minna-n5' || textbookId === 'minna') {
    return minnaLessons.map((lesson: any) => ({
      lessonNumber: lesson.lessonNumber,
      lessonTitle: lesson.title,
      textbookId,
      level: 'N5' as JLPTLevel,
      topic: '',
      vocabCount: lesson.vocabularies.length,
    }));
  }

  // Fallback to backend API
  try {
    const response = await fetch(`/api/v1/textbooks/${textbookId}/lessons`);
    const result = await response.json();

    if (result.success && result.data) {
      return result.data.map((lesson: any) => ({
        lessonNumber: lesson.number || lesson.lessonNumber,
        lessonTitle: lesson.topic || lesson.title || `Bài ${lesson.lessonNumber}`,
        textbookId,
        level: textbookId.split('-')[1]?.toUpperCase() as JLPTLevel,
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
  const textbookId = `${textbook}-${level.toLowerCase()}`;
  const lessons = await getLessons(textbookId);

  const topics = new Set<string>();
  lessons.forEach(lesson => {
    if (lesson.topic) {
      topics.add(lesson.topic);
    }
  });
  return Array.from(topics).sort();
};

/**
 * Search vocabulary across all textbooks
 */
export const searchVocabulary = async (query: string): Promise<VocabularyItem[]> => {
  // Search in local data first
  const allItems: VocabularyItem[] = [];
  minnaLessons.forEach((lesson: any) => {
    lesson.vocabularies.forEach((v: any) => {
      if (v.kanji.toLowerCase().includes(query.toLowerCase()) ||
          v.hiragana.toLowerCase().includes(query.toLowerCase()) ||
          v.romaji.toLowerCase().includes(query.toLowerCase()) ||
          v.meaning.toLowerCase().includes(query.toLowerCase())) {
        allItems.push(toVocabularyItem(v, lesson.lessonNumber));
      }
    });
  });
  return allItems;
};

/**
 * Get a single word by ID
 */
export const getWordById = async (wordId: string): Promise<VocabularyItem | null> => {
  // Search in local data
  for (const lesson of minnaLessons) {
    const vocab = lesson.vocabularies.find((v: any) => 
      v.romaji === wordId || v.kanji === wordId
    );
    if (vocab) {
      return toVocabularyItem(vocab, lesson.lessonNumber);
    }
  }
  return null;
};

/**
 * Get all sources for a word
 */
export const getWordSources = async (wordId: string): Promise<VocabularyItem[]> => {
  const word = await getWordById(wordId);
  return word ? [word] : [];
};

/**
 * Get statistics about the vocabulary data
 */
export const getVocabularyStats = async () => {
  const totalWords = minnaLessons.reduce((sum: number, l: any) => sum + l.vocabularies.length, 0);
  return {
    totalUniqueWords: totalWords,
    totalMappings: totalWords,
    duplicates: 0,
    byTextbook: { minna: totalWords },
    byLevel: { N5: totalWords },
  };
};

/**
 * Clear cache
 */
export const clearCache = (): void => {
  // No cache to clear
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
