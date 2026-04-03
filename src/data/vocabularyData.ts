export interface VocabularyItem {
  id: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  level: string;
  partOfSpeech: string;
  example?: string;
  exampleTranslation?: string;
}

export const vocabularyData: VocabularyItem[] = [
  // N5 Vocabulary
  {
    id: "n5_001",
    kanji: "学生",
    hiragana: "がくせい",
    romaji: "gakusei",
    meaning: "student",
    level: "N5",
    partOfSpeech: "noun",
    example: "私は学生です。",
    exampleTranslation: "I am a student."
  },
  {
    id: "n5_002",
    kanji: "先生",
    hiragana: "せんせい",
    romaji: "sensei",
    meaning: "teacher",
    level: "N5",
    partOfSpeech: "noun",
    example: "田中先生は日本語の先生です。",
    exampleTranslation: "Mr. Tanaka is a Japanese teacher."
  },
  {
    id: "n5_003",
    kanji: "学校",
    hiragana: "がっこう",
    romaji: "gakkou",
    meaning: "school",
    level: "N5",
    partOfSpeech: "noun",
    example: "学校に行きます。",
    exampleTranslation: "I go to school."
  },
  {
    id: "n5_004",
    kanji: "友達",
    hiragana: "ともだち",
    romaji: "tomodachi",
    meaning: "friend",
    level: "N5",
    partOfSpeech: "noun",
    example: "友達と話します。",
    exampleTranslation: "I talk with friends."
  },
  {
    id: "n5_005",
    kanji: "家族",
    hiragana: "かぞく",
    romaji: "kazoku",
    meaning: "family",
    level: "N5",
    partOfSpeech: "noun",
    example: "家族は日本にいます。",
    exampleTranslation: "My family is in Japan."
  },
  {
    id: "n5_006",
    kanji: "時間",
    hiragana: "じかん",
    romaji: "jikan",
    meaning: "time",
    level: "N5",
    partOfSpeech: "noun",
    example: "時間があります。",
    exampleTranslation: "I have time."
  },
  {
    id: "n5_007",
    kanji: "朝",
    hiragana: "あさ",
    romaji: "asa",
    meaning: "morning",
    level: "N5",
    partOfSpeech: "noun",
    example: "朝は早く起きます。",
    exampleTranslation: "I wake up early in the morning."
  },
  {
    id: "n5_008",
    kanji: "晩",
    hiragana: "ばん",
    romaji: "ban",
    meaning: "evening",
    level: "N5",
    partOfSpeech: "noun",
    example: "晩ご飯を食べます。",
    exampleTranslation: "I eat dinner."
  },
  // N4 Vocabulary
  {
    id: "n4_001",
    kanji: "経験",
    hiragana: "けいけん",
    romaji: "keiken",
    meaning: "experience",
    level: "N4",
    partOfSpeech: "noun",
    example: "日本での経験は大切です。",
    exampleTranslation: "Experience in Japan is important."
  },
  {
    id: "n4_002",
    kanji: "環境",
    hiragana: "かんきょう",
    romaji: "kankyou",
    meaning: "environment",
    level: "N4",
    partOfSpeech: "noun",
    example: "環境を守りましょう。",
    exampleTranslation: "Let's protect the environment."
  },
  {
    id: "n4_003",
    kanji: "社会",
    hiragana: "しゃかい",
    romaji: "shakai",
    meaning: "society",
    level: "N4",
    partOfSpeech: "noun",
    example: "社会問題について話します。",
    exampleTranslation: "I talk about social issues."
  },
  {
    id: "n4_004",
    kanji: "経済",
    hiragana: "けいざい",
    romaji: "keizai",
    meaning: "economy",
    level: "N4",
    partOfSpeech: "noun",
    example: "経済のニュースを見ました。",
    exampleTranslation: "I watched economic news."
  },
  {
    id: "n4_005",
    kanji: "文化",
    hiragana: "ぶんか",
    romaji: "bunka",
    meaning: "culture",
    level: "N4",
    partOfSpeech: "noun",
    example: "日本の文化に興味があります。",
    exampleTranslation: "I'm interested in Japanese culture."
  },
  // N3 Vocabulary
  {
    id: "n3_001",
    kanji: "技術",
    hiragana: "ぎじゅつ",
    romaji: "gijutsu",
    meaning: "technology",
    level: "N3",
    partOfSpeech: "noun",
    example: "新しい技術が開発されました。",
    exampleTranslation: "New technology has been developed."
  },
  {
    id: "n3_002",
    kanji: "研究",
    hiragana: "けんきゅう",
    romaji: "kenkyuu",
    meaning: "research",
    level: "N3",
    partOfSpeech: "noun",
    example: "科学の研究をしています。",
    exampleTranslation: "I'm doing scientific research."
  },
  {
    id: "n3_003",
    kanji: "計画",
    hiragana: "けいかく",
    romaji: "keikaku",
    meaning: "plan",
    level: "N3",
    partOfSpeech: "noun",
    example: "旅行の計画を立てました。",
    exampleTranslation: "I made a travel plan."
  },
  {
    id: "n3_004",
    kanji: "政策",
    hiragana: "せいさく",
    romaji: "seisaku",
    meaning: "policy",
    level: "N3",
    partOfSpeech: "noun",
    example: "政府の政策が変わりました。",
    exampleTranslation: "The government's policy has changed."
  },
  {
    id: "n3_005",
    kanji: "進歩",
    hiragana: "しんぽ",
    romaji: "shinpo",
    meaning: "progress",
    level: "N3",
    partOfSpeech: "noun",
    example: "技術の進歩が速いです。",
    exampleTranslation: "Technological progress is fast."
  },
  // N2 Vocabulary
  {
    id: "n2_001",
    kanji: "相互作用",
    hiragana: "そうごさよう",
    romaji: "sougasayou",
    meaning: "interaction",
    level: "N2",
    partOfSpeech: "noun",
    example: "人間と環境の相互作用を研究します。",
    exampleTranslation: "I study the interaction between humans and the environment."
  },
  {
    id: "n2_002",
    kanji: "複雑",
    hiragana: "ふくざつ",
    romaji: "fukuzatsu",
    meaning: "complex",
    level: "N2",
    partOfSpeech: "adjective",
    example: "この問題は複雑です。",
    exampleTranslation: "This problem is complex."
  },
  {
    id: "n2_003",
    kanji: "重要",
    hiragana: "じゅうよう",
    romaji: "juuyou",
    meaning: "important",
    level: "N2",
    partOfSpeech: "adjective",
    example: "この情報は重要です。",
    exampleTranslation: "This information is important."
  },
  {
    id: "n2_004",
    kanji: "詳細",
    hiragana: "しょうさい",
    romaji: "shousai",
    meaning: "details",
    level: "N2",
    partOfSpeech: "noun",
    example: "詳細を説明します。",
    exampleTranslation: "I'll explain the details."
  },
  {
    id: "n2_005",
    kanji: "実施",
    hiragana: "じっし",
    romaji: "jisshi",
    meaning: "implementation",
    level: "N2",
    partOfSpeech: "noun",
    example: "計画の実施が始まりました。",
    exampleTranslation: "The implementation of the plan has begun."
  },
  // N1 Vocabulary
  {
    id: "n1_001",
    kanji: "矛盾",
    hiragana: "むじゅん",
    romaji: "mujun",
    meaning: "contradiction",
    level: "N1",
    partOfSpeech: "noun",
    example: "彼の言動には矛盾がある。",
    exampleTranslation: "There are contradictions in his words and actions."
  },
  {
    id: "n1_002",
    kanji: "一貫性",
    hiragana: "いっかんせい",
    romaji: "ikkkansei",
    meaning: "consistency",
    level: "N1",
    partOfSpeech: "noun",
    example: "彼の意見には一貫性がない。",
    exampleTranslation: "His opinions lack consistency."
  },
  {
    id: "n1_003",
    kanji: "覆す",
    hiragana: "くつがえす",
    romaji: "kutsugaesu",
    meaning: "to overturn",
    level: "N1",
    partOfSpeech: "verb",
    example: "常識を覆す発見だった。",
    exampleTranslation: "It was a discovery that overturned common sense."
  },
  {
    id: "n1_004",
    kanji: "不可欠",
    hiragana: "ふかけつ",
    romaji: "fukaketsu",
    meaning: "indispensable",
    level: "N1",
    partOfSpeech: "adjective",
    example: "国際協力は不可欠だ。",
    exampleTranslation: "International cooperation is indispensable."
  },
  {
    id: "n1_005",
    kanji: "深刻化",
    hiragana: "しんこくか",
    romaji: "shinkokuka",
    meaning: "worsening",
    level: "N1",
    partOfSpeech: "noun",
    example: "環境問題の深刻化が懸念される。",
    exampleTranslation: "The worsening of environmental problems is concerning."
  }
];

export const getVocabularyByLevel = (level: string): VocabularyItem[] => {
  return vocabularyData.filter(v => v.level === level);
};

export const getVocabularyByPartOfSpeech = (partOfSpeech: string): VocabularyItem[] => {
  return vocabularyData.filter(v => v.partOfSpeech === partOfSpeech);
};

export const searchVocabulary = (query: string): VocabularyItem[] => {
  const lowerQuery = query.toLowerCase();
  return vocabularyData.filter(v => 
    v.kanji.includes(query) ||
    v.hiragana.includes(query) ||
    v.romaji.toLowerCase().includes(lowerQuery) ||
    v.meaning.toLowerCase().includes(lowerQuery)
  );
};
