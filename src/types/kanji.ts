export interface OnyomiReading {
  kana: string;
  romaji: string;
  _id?: string;
}

export interface KunyomiReading {
  kana: string;
  romaji: string;
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

export interface KanjiItem {
  _id: string;
  character: string;
  hanviet: string;
  meaning_vi: string;
  onyomi: OnyomiReading[];
  kunyomi: KunyomiReading[];
  stroke_count: number;
  jlpt_level: string;
  frequency: string;
  radical: Radical;
  structure: string;
  image_explanation: string;
  kanji_analysis: KanjiAnalysis[];
  vocabulary_examples: VocabularyExample[];
  category: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  stroke_order?: string[];
}
