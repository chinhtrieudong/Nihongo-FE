/**
 * Vocabulary Data Service
 * Handles loading and querying normalized core vocabulary data
 */

import type {
  CoreWord,
  WordSource,
  VocabularyItem,
  VocabularyFilter,
  TextbookType,
  JLPTLevel,
  LessonInfo,
} from '../types/vocabulary';

// Cache for loaded data
let wordsCache: CoreWord[] | null = null;
let sourcesCache: WordSource[] | null = null;

/**
 * Load core words data
 */
const loadWords = async (): Promise<CoreWord[]> => {
  if (wordsCache) return wordsCache;

  try {
    const response = await fetch('/data/core/words.json');
    if (!response.ok) {
      throw new Error(`Failed to load words.json: ${response.status}`);
    }
    wordsCache = await response.json();
    return wordsCache || [];
  } catch (error) {
    console.error('Error loading words:', error);
    return [];
  }
};

/**
 * Load word sources data
 */
const loadSources = async (): Promise<WordSource[]> => {
  if (sourcesCache) return sourcesCache;

  try {
    const response = await fetch('/data/core/word_sources.json');
    if (!response.ok) {
      throw new Error(`Failed to load word_sources.json: ${response.status}`);
    }
    sourcesCache = await response.json();
    return sourcesCache || [];
  } catch (error) {
    console.error('Error loading word sources:', error);
    return [];
  }
};

/**
 * Clear cache (useful for testing or memory management)
 */
export const clearCache = (): void => {
  wordsCache = null;
  sourcesCache = null;
};

/**
 * Build a map of wordId -> CoreWord for fast lookup
 */
const buildWordMap = (words: CoreWord[]): Map<string, CoreWord> => {
  const map = new Map<string, CoreWord>();
  for (const word of words) {
    map.set(word.id, word);
  }
  return map;
};

/**
 * Convert WordSource + CoreWord to VocabularyItem
 */
const toVocabularyItem = (source: WordSource, word: CoreWord): VocabularyItem => ({
  id: `${source.textbook}-${source.level}-${source.lesson}-${source.wordId}`,
  wordId: word.id,
  sourceId: source.id,
  kanji: word.word,
  hiragana: word.reading,
  hanViet: word.hanViet,
  meaning: word.meaning,
  type: word.type,
  example: source.example,
  exampleMeaning: source.exampleMeaning,
  textbook: source.textbook,
  level: source.level,
  lesson: source.lesson,
  topic: source.topic,
});

/**
 * Get vocabulary with optional filtering
 */
export const getVocabulary = async (filter?: VocabularyFilter): Promise<VocabularyItem[]> => {
  const [words, sources] = await Promise.all([loadWords(), loadSources()]);
  const wordMap = buildWordMap(words);

  // Filter sources
  let filteredSources = sources;

  if (filter) {
    filteredSources = sources.filter((source) => {
      if (filter.textbook && source.textbook !== filter.textbook) return false;
      if (filter.level && source.level !== filter.level) return false;
      if (filter.lesson !== undefined && source.lesson !== filter.lesson) return false;
      if (filter.topic && !source.topic.toLowerCase().includes(filter.topic.toLowerCase())) return false;

      // Get word for type/search filtering
      const word = wordMap.get(source.wordId);
      if (!word) return false;

      if (filter.type && word.type !== filter.type) return false;

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesWord = word.word.toLowerCase().includes(searchLower);
        const matchesReading = word.reading.toLowerCase().includes(searchLower);
        const matchesMeaning = word.meaning.toLowerCase().includes(searchLower);
        if (!matchesWord && !matchesReading && !matchesMeaning) return false;
      }

      return true;
    });
  }

  // Map to VocabularyItem
  const items: VocabularyItem[] = [];
  for (const source of filteredSources) {
    const word = wordMap.get(source.wordId);
    if (word) {
      items.push(toVocabularyItem(source, word));
    }
  }

  return items;
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

  const textbook = parts[0] as TextbookType;
  const level = parts[1].toUpperCase() as JLPTLevel;

  // Validate
  if (!['minna', 'tango', 'speed_master'].includes(textbook)) {
    console.error('Unknown textbook:', textbook);
    return [];
  }

  if (!['N1', 'N2', 'N3', 'N4', 'N5'].includes(level)) {
    console.error('Invalid level:', level);
    return [];
  }

  // Special handling for Tango: lessonNumber maps to topic within chapter
  if (textbook === 'tango') {
    // For Tango: 1-5 -> chapter 1, 6-10 -> chapter 2, etc.
    const chapterNum = Math.ceil(lessonNumber / 5);
    return getVocabulary({
      textbook,
      level,
      lesson: chapterNum,
    });
  }

  // For other textbooks, lessonNumber maps directly
  return getVocabulary({
    textbook,
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

  const sources = await loadSources();

  // Group by lesson
  const lessonMap = new Map<number, { topic: string; count: number }>();

  for (const source of sources) {
    if (source.textbook === textbook && source.level === level) {
      const existing = lessonMap.get(source.lesson);
      if (existing) {
        existing.count++;
        // Use first topic if available
        if (!existing.topic && source.topic) {
          existing.topic = source.topic;
        }
      } else {
        lessonMap.set(source.lesson, {
          topic: source.topic,
          count: 1,
        });
      }
    }
  }

  // Convert to array
  const lessons: LessonInfo[] = [];
  const sortedEntries = Array.from(lessonMap.entries()).sort((a, b) => a[0] - b[0]);
  for (const [lessonNum, info] of sortedEntries) {
    lessons.push({
      lessonNumber: lessonNum,
      lessonTitle: info.topic || `Bài ${lessonNum}`,
      textbookId,
      level,
      topic: info.topic,
      vocabCount: info.count,
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
  const sources = await loadSources();
  const topics = new Set<string>();

  for (const source of sources) {
    if (source.textbook === textbook && source.level === level && source.topic) {
      topics.add(source.topic);
    }
  }

  return Array.from(topics).sort();
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
  const [words, sources] = await Promise.all([loadWords(), loadSources()]);
  const word = words.find((w) => w.id === wordId);

  if (!word) return null;

  // Find first source for this word
  const source = sources.find((s) => s.wordId === wordId);
  if (!source) return null;

  return toVocabularyItem(source, word);
};

/**
 * Get all sources for a word (where it appears in different textbooks)
 */
export const getWordSources = async (wordId: string): Promise<VocabularyItem[]> => {
  const [words, sources] = await Promise.all([loadWords(), loadSources()]);
  const word = words.find((w) => w.id === wordId);

  if (!word) return [];

  const wordSources = sources.filter((s) => s.wordId === wordId);
  return wordSources.map((source) => toVocabularyItem(source, word));
};

/**
 * Get statistics about the vocabulary data
 */
export const getVocabularyStats = async () => {
  const [words, sources] = await Promise.all([loadWords(), loadSources()]);

  const stats = {
    totalUniqueWords: words.length,
    totalMappings: sources.length,
    duplicates: sources.length - words.length,
    byTextbook: {} as Record<string, number>,
    byLevel: {} as Record<string, number>,
  };

  for (const source of sources) {
    const bookKey = `${source.textbook}-${source.level}`;
    stats.byTextbook[bookKey] = (stats.byTextbook[bookKey] || 0) + 1;
    stats.byLevel[source.level] = (stats.byLevel[source.level] || 0) + 1;
  }

  return stats;
};
