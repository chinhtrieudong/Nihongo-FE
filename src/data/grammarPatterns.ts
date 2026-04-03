export interface GrammarPattern {
  id: string;
  pattern: string;
  meaning: string;
  level: string;
  explanation: string;
  examples: {
    japanese: string;
    translation: string;
  }[];
  usage: string;
}

export const grammarPatterns: GrammarPattern[] = [
  // N5 Grammar Patterns
  {
    id: "n5_001",
    pattern: "〜は〜です",
    meaning: "A is B (topic marker)",
    level: "N5",
    explanation: "Used to identify or describe something. は marks the topic, です is the polite copula.",
    examples: [
      {
        japanese: "私は学生です。",
        translation: "I am a student."
      },
      {
        japanese: "これは本です。",
        translation: "This is a book."
      }
    ],
    usage: "Basic sentence structure for identification and description"
  },
  {
    id: "n5_002",
    pattern: "〜を〜ます",
    meaning: "to do something (object marker)",
    level: "N5",
    explanation: "を marks the direct object of the verb, ます is the polite verb ending.",
    examples: [
      {
        japanese: "ご飯を食べます。",
        translation: "I eat a meal."
      },
      {
        japanese: "日本語を勉強します。",
        translation: "I study Japanese."
      }
    ],
    usage: "For actions performed on objects"
  },
  {
    id: "n5_003",
    pattern: "〜に〜ます",
    meaning: "to/at/in (location/time marker)",
    level: "N5",
    explanation: "に indicates location, time, or destination for verbs of movement or existence.",
    examples: [
      {
        japanese: "学校に行きます。",
        translation: "I go to school."
      },
      {
        japanese: "7時に起きます。",
        translation: "I wake up at 7 o'clock."
      }
    ],
    usage: "For destinations, times, and existence locations"
  },
  {
    id: "n5_004",
    pattern: "〜で〜ます",
    meaning: "at/in (action location marker)",
    level: "N5",
    explanation: "で indicates the location where an action takes place.",
    examples: [
      {
        japanese: "図書館で勉強します。",
        translation: "I study at the library."
      },
      {
        japanese: "レストランで食べます。",
        translation: "I eat at a restaurant."
      }
    ],
    usage: "For locations where actions occur"
  },
  // N4 Grammar Patterns
  {
    id: "n4_001",
    pattern: "〜ことができます",
    meaning: "can do something / ability",
    level: "N4",
    explanation: "Expresses ability or possibility. Used with verb dictionary form.",
    examples: [
      {
        japanese: "日本語を話すことができます。",
        translation: "I can speak Japanese."
      },
      {
        japanese: "料理を作ることができます。",
        translation: "I can cook."
      }
    ],
    usage: "Expressing abilities and possibilities"
  },
  {
    id: "n4_002",
    pattern: "〜てから",
    meaning: "after doing something",
    level: "N4",
    explanation: "Indicates that one action happens after another. Used with te-form of verbs.",
    examples: [
      {
        japanese: "勉強してから、寝ます。",
        translation: "After studying, I sleep."
      },
      {
        japanese: "ご飯を食べてから、出かけます。",
        translation: "After eating, I go out."
      }
    ],
    usage: "Sequential actions"
  },
  {
    id: "n4_003",
    pattern: "〜かもしれません",
    meaning: "might be / perhaps",
    level: "N4",
    explanation: "Expresses possibility or uncertainty. Used with verb/adjective/noun + かもしれません.",
    examples: [
      {
        japanese: "雨が降るかもしれません。",
        translation: "It might rain."
      },
      {
        japanese: "彼は忙しいかもしれません。",
        translation: "He might be busy."
      }
    ],
    usage: "Expressing uncertainty or possibility"
  },
  {
    id: "n4_004",
    pattern: "〜なければなりません",
    meaning: "must do something",
    level: "N4",
    explanation: "Expresses obligation or necessity. Used with verb negative form.",
    examples: [
      {
        japanese: "勉強しなければなりません。",
        translation: "I must study."
      },
      {
        japanese: "薬を飲まなければなりません。",
        translation: "I must take medicine."
      }
    ],
    usage: "Expressing obligations"
  },
  // N3 Grammar Patterns
  {
    id: "n3_001",
    pattern: "〜ようになります",
    meaning: "become able to / come to be",
    level: "N3",
    explanation: "Shows a gradual change or development. Used with verb potential form.",
    examples: [
      {
        japanese: "日本語が話せるようになりました。",
        translation: "I became able to speak Japanese."
      },
      {
        japanese: "一人で生活できるようになりました。",
        translation: "I became able to live alone."
      }
    ],
    usage: "Gradual change or development"
  },
  {
    id: "n3_002",
    pattern: "〜ようにします",
    meaning: "try to do something / make it a habit",
    level: "N3",
    explanation: "Expresses effort or intention to do something. Used with verb dictionary form.",
    examples: [
      {
        japanese: "毎日運動するようにします。",
        translation: "I'll try to exercise every day."
      },
      {
        japanese: "早く寝るようにします。",
        translation: "I'll try to sleep early."
      }
    ],
    usage: "Making efforts or forming habits"
  },
  {
    id: "n3_003",
    pattern: "〜そうです",
    meaning: "I hear that / it seems",
    level: "N3",
    explanation: "Reports information heard from others. Used with verb/adjective plain form.",
    examples: [
      {
        japanese: "天気予報によると、明日は雨が降るそうです。",
        translation: "According to the weather forecast, it will rain tomorrow."
      },
      {
        japanese: "彼は日本に行ったそうです。",
        translation: "I heard that he went to Japan."
      }
    ],
    usage: "Reporting hearsay"
  },
  {
    id: "n3_004",
    pattern: "〜ば〜ほど",
    meaning: "the more... the more...",
    level: "N3",
    explanation: "Shows proportional relationship. Used with conditional ば form.",
    examples: [
      {
        japanese: "勉強すればするほど、上手になります。",
        translation: "The more you study, the better you become."
      },
      {
        japanese: "考えれば考えるほど、分からなくなります。",
        translation: "The more I think about it, the less I understand."
      }
    ],
    usage: "Expressing proportional relationships"
  },
  // N2 Grammar Patterns
  {
    id: "n2_001",
    pattern: "〜を踏まえて",
    meaning: "based on / considering",
    level: "N2",
    explanation: "Considers certain information or circumstances when making a decision.",
    examples: [
      {
        japanese: "調査結果を踏まえて、方針を決めます。",
        translation: "Based on the survey results, we'll decide on our policy."
      },
      {
        japanese: "現状を踏まえて、計画を変更します。",
        translation: "Considering the current situation, we'll change the plan."
      }
    ],
    usage: "Making decisions based on information"
  },
  {
    id: "n2_002",
    pattern: "〜にわたって",
    meaning: "over / across / throughout",
    level: "N2",
    explanation: "Indicates scope or range covering time, space, or categories.",
    examples: [
      {
        japanese: "会議は3時間にわたって行われました。",
        translation: "The meeting was held over 3 hours."
      },
      {
        japanese: "全国にわたって影響がありました。",
        translation: "There were effects throughout the country."
      }
    ],
    usage: "Describing scope or range"
  },
  {
    id: "n2_003",
    pattern: "〜に伴い",
    meaning: "along with / accompanying",
    level: "N2",
    explanation: "Indicates that something happens together with or as a result of something else.",
    examples: [
      {
        japanese: "経済成長に伴い、生活水準が向上した。",
        translation: "Along with economic growth, living standards improved."
      },
      {
        japanese: "技術進歩に伴い、新しい問題が出てきた。",
        translation: "Accompanying technological progress, new problems emerged."
      }
    ],
    usage: "Accompanying changes or developments"
  },
  {
    id: "n2_004",
    pattern: "〜をめぐって",
    meaning: "around / concerning",
    level: "N2",
    explanation: "Indicates discussion, debate, or conflict around a particular topic.",
    examples: [
      {
        japanese: "環境問題をめぐって議論が続いています。",
        translation: "Discussions continue around environmental issues."
      },
      {
        japanese: "計画をめぐって意見が分かれました。",
        translation: "Opinions were divided concerning the plan."
      }
    ],
    usage: "Topics of discussion or debate"
  },
  // N1 Grammar Patterns
  {
    id: "n1_001",
    pattern: "〜を背景に",
    meaning: "against the backdrop of / with ... as background",
    level: "N1",
    explanation: "Indicates that something happens in the context of certain circumstances.",
    examples: [
      {
        japanese: "経済危機を背景に、政策が変更された。",
        translation: "Against the backdrop of economic crisis, policies were changed."
      },
      {
        japanese: "グローバル化を背景に、競争が激化している。",
        translation: "With globalization as the background, competition is intensifying."
      }
    ],
    usage: "Contextual background for events"
  },
  {
    id: "n1_002",
    pattern: "〜にもまして",
    meaning: "even more than / more than ever",
    level: "N1",
    explanation: "Emphasizes that something exceeds the usual comparison point.",
    examples: [
      {
        japanese: "彼は以前にもまして頑張っています。",
        translation: "He's working harder than ever before."
      },
      {
        japanese: "今年は例年にもまして暑いです。",
        translation: "This year is hotter than in typical years."
      }
    ],
    usage: "Emphasis on exceeding comparison"
  },
  {
    id: "n1_003",
    pattern: "〜と相まって",
    meaning: "combined with / in conjunction with",
    level: "N1",
    explanation: "Indicates that multiple factors combine to produce a result.",
    examples: [
      {
        japanese: "努力と運と相まって、成功した。",
        translation: "Combined with effort and luck, I succeeded."
      },
      {
        japanese: "好条件と好タイミングと相まって、最高の結果が出た。",
        translation: "In conjunction with good conditions and timing, the best result was achieved."
      }
    ],
    usage: "Combination of multiple factors"
  },
  {
    id: "n1_004",
    pattern: "〜を禁じ得ない",
    meaning: "cannot help but / cannot resist",
    level: "N1",
    explanation: "Expresses an unavoidable emotional reaction or impulse.",
    examples: [
      {
        japanese: "彼の話に感動を禁じ得なかった。",
        translation: "I couldn't help but be moved by his story."
      },
      {
        japanese: "その光景に笑いを禁じ得なかった。",
        translation: "I couldn't resist laughing at that scene."
      }
    ],
    usage: "Unavoidable emotional reactions"
  }
];

export const getGrammarByLevel = (level: string): GrammarPattern[] => {
  return grammarPatterns.filter(g => g.level === level);
};

export const searchGrammarPatterns = (query: string): GrammarPattern[] => {
  const lowerQuery = query.toLowerCase();
  return grammarPatterns.filter(g => 
    g.pattern.includes(query) ||
    g.meaning.toLowerCase().includes(lowerQuery) ||
    g.explanation.toLowerCase().includes(lowerQuery)
  );
};
