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

  /** Hán Việt reading */
  hanviet: string;

  /** JLPT level (N5, N4, N3, N2, N1) */
  level: string;

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

  /** Number of strokes */
  strokeCount: number;

  /** Array of radical symbols */
  radicals: string[];

  /** Main radical object (if available) */
  radical?: Radical;

  /** Memory tip for remembering the kanji */
  memoryTip?: string;

  /** Related vocabulary examples */
  relatedVocabulary?: RelatedVocabulary[];

  /** Usage frequency: 'high' | 'medium' | 'low' */
  frequency?: string;

  /** Category: 'numbers' | 'basic' | 'nature' | 'time' | 'people' | 'places' | 'actions' */
  category?: string;

  /** Kanji structure type */
  structure?: string;

  /** Visual explanation/mnemonic image description */
  imageExplanation?: string;

  /** Kanji component analysis */
  kanjiAnalysis?: KanjiAnalysis[];

  // Legacy snake_case properties for backward compatibility
  jlpt?: string;
  stroke_count?: number;
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
