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
import { legacyToType } from '../types/vocabulary';

// Cache for loaded data
let wordsCache: CoreWord[] | null = null;
let sourcesCache: WordSource[] | null = null;
let textbookMetaCache: Record<string, any> = {};

const loadTextbookMeta = async (textbookId: string): Promise<any | null> => {
  if (textbookMetaCache[textbookId]) return textbookMetaCache[textbookId];
  try {
    const response = await fetch(`/data/textbook/textbook-${textbookId}.json`);
    if (!response.ok) return null;
    const data = await response.json();
    textbookMetaCache[textbookId] = data;
    return data;
  } catch {
    return null;
  }
};

const loadTopicFile = async (
  textbookId: string,
  chapterNum: number,
  topicNum: number
): Promise<any | null> => {
  try {
    const url = `/data/${textbookId}/topics/${textbookId}-topic-${chapterNum}-${topicNum}.json`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
};

const mapTopicWordsToVocabularyItems = (args: {
  textbook: TextbookType;
  level: JLPTLevel;
  textbookId: string;
  lessonNumber: number;
  topicNameVi: string;
  topicWords: Array<{
    word: string;
    reading: string;
    meaning: string;
    type?: string;
    example?: { jp?: string; vn?: string };
  }>;
  hanVietByWordOrReading?: (word: string, reading: string) => string;
}): VocabularyItem[] => {
  const { textbook, level, textbookId, lessonNumber, topicNameVi, topicWords, hanVietByWordOrReading } = args;
  return topicWords.map((w, idx) => ({
    id: `${textbookId}-${lessonNumber}-${idx}-${w.word}`,
    wordId: "",
    sourceId: `${textbookId}-${lessonNumber}-${idx}`,
    // In Tango topic JSON, "word" is the kanji/main written form (or JP form when no kanji).
    kanji: w.word,
    hiragana: w.reading || w.word,
    hanViet: hanVietByWordOrReading ? (hanVietByWordOrReading(w.word, w.reading) || "") : "",
    meaning: w.meaning,
    type: legacyToType(w.type || ""),
    example: w.example?.jp || "",
    exampleMeaning: w.example?.vn || "",
    textbook,
    level,
    lesson: lessonNumber,
    topic: topicNameVi,
  }));
};

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

  // Validate
  if (!['minna', 'tango', 'speed-master', 'speed_master'].includes(textbook)) {
    console.error('Unknown textbook:', textbook);
    return [];
  }

  if (!['N1', 'N2', 'N3', 'N4', 'N5'].includes(level)) {
    console.error('Invalid level:', level);
    return [];
  }

  // Chapter-based textbooks: lessonNumber maps to (chapter, topicIndex)
  if (textbook === 'tango' || textbook === 'speed-master') {
    const chapterNum = Math.ceil(lessonNumber / 5);
    const topicIndex = (lessonNumber - 1) % 5;
    const topicNum = topicIndex + 1;

    // Try to narrow down by topic name from textbook metadata
    const meta = await loadTextbookMeta(textbookId);
    const topicNameVi =
      meta?.chapters?.find((c: any) => c.number === chapterNum)?.topics?.[topicIndex]?.nameVi;

    // Prefer topic JSON (authoritative for Tango/Speed Master pages)
    const topicJson = await loadTopicFile(textbookId, chapterNum, topicNum);
    if (topicJson?.words && Array.isArray(topicJson.words)) {
      // Best-effort Han-Viet lookup from core words data
      const coreWords = await loadWords();
      const byWord = new Map<string, CoreWord>();
      const byReading = new Map<string, CoreWord>();
      for (const cw of coreWords) {
        if (cw.word) byWord.set(cw.word, cw);
        if (cw.reading) byReading.set(cw.reading, cw);
      }

      return mapTopicWordsToVocabularyItems({
        textbook,
        level,
        textbookId,
        lessonNumber,
        topicNameVi: topicJson.topicNameVi || topicNameVi || `Bài ${lessonNumber}`,
        topicWords: topicJson.words,
        hanVietByWordOrReading: (word: string, reading: string) => {
          const cw = byWord.get(word) || byReading.get(reading) || byReading.get(word);
          return cw?.hanViet || "";
        },
      });
    }

    // Fallback: derive from normalized core sources if available
    return getVocabulary({
      textbook,
      level,
      lesson: chapterNum,
      ...(topicNameVi ? { topic: topicNameVi } : {}),
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
