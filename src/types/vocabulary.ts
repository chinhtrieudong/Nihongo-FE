/**
 * Core vocabulary data types - Normalized schema
 * Based on public/data/core/words.json and word_sources.json
 */

// Core word entry from words.json
export interface CoreWord {
  id: string;           // Format: word_xxxxxx
  word: string;         // Japanese word
  reading: string;      // Reading (hiragana/katakana)
  hanViet: string;      // Han-Viet (empty if not applicable)
  meaning: string;      // Vietnamese meaning
  type: WordType;       // Part of speech
}

// Part of speech types
export type WordType =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'pronoun'
  | 'suffix'
  | 'particle'
  | 'other';

// Textbook mapping from word_sources.json
export interface WordSource {
  id: string;           // Format: map_xxxxxx
  wordId: string;       // Reference to CoreWord.id
  textbook: TextbookType;
  level: JLPTLevel;
  lesson: number;       // Chapter/lesson number
  topic: string;        // Topic name
  example: string;      // Example sentence (Japanese)
  exampleMeaning?: string; // Example meaning (Vietnamese)
}

// Textbook types
// Note: the core data uses "speed-master" (kebab-case). Keep "speed_master"
// for backward compatibility with older code paths.
export type TextbookType = 'minna' | 'tango' | 'speed-master' | 'speed_master';

// JLPT levels
export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';

// Combined vocabulary item for frontend use
// Merges CoreWord + WordSource for display
export interface VocabularyItem {
  id: string;
  wordId: string;        // Reference to core word
  sourceId: string;     // Reference to word source
  kanji: string;        // Same as CoreWord.word
  hiragana: string;     // Same as CoreWord.reading
  hanViet: string;      // Same as CoreWord.hanViet
  meaning: string;      // Same as CoreWord.meaning
  meaningVi?: string;   // Vietnamese meaning (alias)
  type: WordType;       // Same as CoreWord.type
  example: string;      // From WordSource.example (Japanese)
  exampleMeaning?: string; // From WordSource.exampleMeaning (Vietnamese)
  exampleSentence?: string; // Legacy alias
  exampleSentenceVi?: string; // Legacy alias
  textbook: TextbookType;
  level: JLPTLevel;
  lesson: number;
  topic: string;
  // Legacy snake_case properties for backward compatibility
  meaning_vi?: string;
  example_jp?: string;
  example_vi?: string;
  kanji_analysis?: any;
  jlpt?: string;
  jpt?: string;
  jlpt_level?: string;
  jpt_level?: string;
}

// Legacy type mapping for backward compatibility
export const typeToLegacy: Record<WordType, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adjective: 'Tính từ',
  pronoun: 'Đại từ',
  suffix: 'Phụ tố',
  particle: 'Trợ từ',
  other: 'Khác',
};

// Legacy to core type mapping
export const legacyToType = (legacy: string): WordType => {
  const lower = legacy.toLowerCase();
  if (lower.includes('danh từ') || lower.includes('noun')) return 'noun';
  if (lower.includes('động từ') || lower.includes('verb')) return 'verb';
  if (lower.includes('tính từ') || lower.includes('adj')) return 'adjective';
  if (lower.includes('đại từ') || lower.includes('pronoun')) return 'pronoun';
  if (lower.includes('phụ tố') || lower.includes('hậu tố') || lower.includes('suffix')) return 'suffix';
  if (lower.includes('trợ') || lower.includes('particle')) return 'particle';
  return 'other';
};

// Filter options for querying vocabulary
export interface VocabularyFilter {
  textbook?: TextbookType;
  level?: JLPTLevel;
  lesson?: number;
  topic?: string;
  type?: WordType;
  search?: string;      // Search in word, reading, or meaning
}

// Lesson/Chapter info
export interface LessonInfo {
  lessonNumber: number;
  lessonTitle: string;
  textbookId: string;
  level: JLPTLevel;
  topic?: string;
  vocabCount: number;
}
