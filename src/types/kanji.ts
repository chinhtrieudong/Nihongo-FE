/**
 * @deprecated Use string[] directly for onyomi/kunyomi. This interface is no longer used.
 */
export interface OnyomiReading {
  kana: string;
  romaji?: string;
  _id?: string;
}

/**
 * @deprecated Use string[] directly for onyomi/kunyomi. This interface is no longer used.
 */
export interface KunyomiReading {
  kana: string;
  romaji?: string;
  _id?: string;
}

export interface Radical {
  symbol: string;
  hanviet: string;
  nameVi: string;
  meaning: string;
  strokes?: number;
}

export interface KanjiAnalysis {
  component: string;
  hanviet: string;
  role: string;
  meaning: string;
  position: string;
  _id?: string;
}

/**
 * @deprecated This interface does not match the database schema. Use RelatedVocabulary instead.
 * Kept for backward compatibility but should be removed in future versions.
 */
export interface VocabularyExample {
  word: string;
  hiragana: string;
  romaji: string;
  hanviet: string;
  meaning_vi: string;
  example_jp: string;
  example_vi: string;
  audio_url: string;
  _id?: string;
}

export interface RelatedVocabulary {
  hanviet: string;
  meaningVi: string;
  word: string;
  kana: string;
  romaji?: string;
  exampleJp?: string;
  exampleVi?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface KanjiItem {
  /** MongoDB document ID */
  id?: string;

  /** The kanji character (primary display field) */
  kanji: string;

  /** @deprecated Use 'kanji' instead. Kept for backward compatibility. */
  character?: string;

  /** Hán Việt reading */
  hanviet: string;

  /** JLPT level (N5, N4, N3, N2, N1) - standardized naming */
  level: string;

  /** @deprecated Use 'level' instead. Kept for backward compatibility. */
  jlpt?: string;

  /** @deprecated Use 'level' instead. Kept for backward compatibility. */
  jlpt_level?: string;

  /** Computed color based on JLPT level for UI */
  color?: string;

  /** Onyomi readings as string array */
  onyomi: string[];

  /** Kunyomi readings as string array */
  kunyomi: string[];

  /** Nanori (name) readings */
  nanori?: string[];

  /** English meaning */
  meaning?: string;

  /** Vietnamese meaning */
  meaningVi: string;

  /** @deprecated Use 'meaningVi' instead. Kept for backward compatibility. */
  meaning_vi?: string;

  /** Number of strokes */
  strokeCount: number;

  /** @deprecated Use 'strokeCount' instead. Kept for backward compatibility. */
  stroke_count?: number;

  /** Array of radical symbols */
  radicals: string[];

  /** Main radical object (if available) */
  radical?: Radical;

  /** Memory tip for remembering the kanji */
  memoryTip?: string;

  /** @deprecated Use 'memoryTip' instead. Kept for backward compatibility. */
  memory_tip?: string;

  /** Related vocabulary examples */
  relatedVocabulary?: RelatedVocabulary[];

  /** @deprecated Use 'relatedVocabulary' instead. Kept for backward compatibility. */
  related_vocabulary?: RelatedVocabulary[];

  /** Usage frequency: 'high' | 'medium' | 'low' */
  frequency?: string;

  /** Category: 'numbers' | 'basic' | 'nature' | 'time' | 'people' | 'places' | 'actions' */
  category?: string;

  /** Kanji structure type */
  structure?: string;

  /** Visual explanation/mnemonic image description */
  imageExplanation?: string;

  /** @deprecated Use 'imageExplanation' instead. */
  image_explanation?: string;

  /** Kanji component analysis */
  kanjiAnalysis?: KanjiAnalysis[];

  /** @deprecated Use 'kanjiAnalysis' instead. */
  kanji_analysis?: KanjiAnalysis[];

  /** @deprecated Use 'relatedVocabulary' instead. This field is not populated by API. */
  vocabulary_examples?: VocabularyExample[];
}

// API Response types
export interface KanjiListResponse {
  success: boolean;
  data: KanjiItem[];
}

export interface KanjiDetailResponse {
  success: boolean;
  data: KanjiItem;
}
