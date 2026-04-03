export interface OnyomiReading {
  kana: string;
  romaji?: string;
  _id?: string;
}

export interface KunyomiReading {
  kana: string;
  romaji?: string;
  _id?: string;
}

export interface Radical {
  symbol: string;
  hanviet: string;
  name_vi: string;
  meaning: string;
}

export interface KanjiAnalysis {
  component: string;
  hanviet: string;
  role: string;
  meaning: string;
  position: string;
  _id?: string;
}

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
  meaning_vi: string;
  vocab_kanji: string;
  vocab_reading: string;
}

export interface KanjiItem {
  kanji?: string;
  character?: string;
  hanviet: string;
  jlpt?: string;
  jlpt_level?: string;
  color?: string;
  onyomi: string[];
  kunyomi: string[];
  meaning?: string;
  meaningVi?: string;
  meaning_vi?: string;
  stroke_count?: number;
  strokeCount?: number;
  radicals?: string[];
  radical?: Radical | string;
  memory_tip?: string;
  memoryTip?: string;
  related_vocabulary?: RelatedVocabulary[];
  frequency?: string;
  category?: string;
  structure?: string;
  image_explanation?: string;
  kanji_analysis?: KanjiAnalysis[];
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
