export interface Question {
  id: string;
  type: "multiple-choice" | "text-input" | "listening" | "reading";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  audioUrl?: string;
  readingText?: string;
  sectionId: string;
  level: string;
  difficulty: string;
}

export const sampleQuestions: Question[] = [
  // N5 Vocabulary Questions
  {
    id: "n5_voc_1",
    type: "multiple-choice",
    question: "次の（　）に何を入れますか。　１　（　）　を　食べます。",
    options: ["りんご", "にんじん", "たまねぎ", "じゃがいも"],
    correctAnswer: 0,
    explanation: "りんご (apple) は果物で、食べますという動詞と自然に組み合わさります。",
    sectionId: "vocabulary",
    level: "N5",
    difficulty: "Beginner"
  },
  {
    id: "n5_voc_2",
    type: "multiple-choice",
    question: "「こんにちは」は何時あいさつですか。",
    options: ["朝", "昼", "夜", "いつでも"],
    correctAnswer: 1,
    explanation: "「こんにちは」は昼の挨拶です。",
    sectionId: "vocabulary",
    level: "N5",
    difficulty: "Beginner"
  },
  // N5 Grammar Questions
  {
    id: "n5_gram_1",
    type: "multiple-choice",
    question: "私は　学生（　）。",
    options: ["です", "だ", "ます", "である"],
    correctAnswer: 0,
    explanation: "丁寧な表現では「です」を使います。",
    sectionId: "grammar",
    level: "N5",
    difficulty: "Beginner"
  },
  {
    id: "n5_gram_2",
    type: "multiple-choice",
    question: "日本語（　）勉強します。",
    options: ["を", "が", "は", "に"],
    correctAnswer: 0,
    explanation: "勉強する対象には助詞「を」を使います。",
    sectionId: "grammar",
    level: "N5",
    difficulty: "Beginner"
  },
  // N5 Reading Questions
  {
    id: "n5_read_1",
    type: "reading",
    question: "次の文章を読んで、質問に答えてください。\n\n田中さんは学生です。毎日図書館で勉強します。友達と一緒に本を読みます。\n\n田中さんは毎日どこで勉強しますか。",
    readingText: "田中さんは学生です。毎日図書館で勉強します。友達と一緒に本を読みます。",
    options: ["教室", "図書館", "家", "カフェ"],
    correctAnswer: 1,
    explanation: "文章に「毎日図書館で勉強します」と書いてあります。",
    sectionId: "reading",
    level: "N5",
    difficulty: "Beginner"
  },
  // N4 Vocabulary Questions
  {
    id: "n4_voc_1",
    type: "multiple-choice",
    question: "この薬は（　）前に飲んでください。",
    options: ["食事", "食後", "食中", "食前"],
    correctAnswer: 3,
    explanation: "薬を飲むタイミングを表す場合は「食前」が適切です。",
    sectionId: "vocabulary",
    level: "N4",
    difficulty: "Elementary"
  },
  {
    id: "n4_voc_2",
    type: "multiple-choice",
    question: "会議の（　）を事前に確認しておきます。",
    options: ["時間", "場所", "内容", "日程"],
    correctAnswer: 2,
    explanation: "会議で話す内容を事前に確認するのは一般的です。",
    sectionId: "vocabulary",
    level: "N4",
    difficulty: "Elementary"
  },
  // N4 Grammar Questions
  {
    id: "n4_gram_1",
    type: "multiple-choice",
    question: "雨が（　）から、傘を持って行きます。",
    options: ["降る", "降り", "降って", "降った"],
    correctAnswer: 2,
    explanation: "理由を表す場合は「〜てから」の形を使います。",
    sectionId: "grammar",
    level: "N4",
    difficulty: "Elementary"
  },
  {
    id: "n4_gram_2",
    type: "multiple-choice",
    question: "この本は（　）おもしろいです。",
    options: ["読んで", "読む", "読んだ", "読み"],
    correctAnswer: 2,
    explanation: "過去の経験を表す場合は「〜たことがある」の形を使います。",
    sectionId: "grammar",
    level: "N4",
    difficulty: "Elementary"
  },
  // N3 Vocabulary Questions
  {
    id: "n3_voc_1",
    type: "multiple-choice",
    question: "最近、新しい技術の（　）が速いですね。",
    options: ["進歩", "発展", "成長", "向上"],
    correctAnswer: 0,
    explanation: "技術の進歩について話す場合、「進歩」が最も適切な表現です。",
    sectionId: "vocabulary",
    level: "N3",
    difficulty: "Intermediate"
  },
  {
    id: "n3_voc_2",
    type: "multiple-choice",
    question: "この計画は（　）に基づいて作成されました。",
    options: ["調査", "研究", "データ", "分析"],
    correctAnswer: 2,
    explanation: "計画を作成する基礎として「データ」が最も適切です。",
    sectionId: "vocabulary",
    level: "N3",
    difficulty: "Intermediate"
  },
  // N3 Grammar Questions
  {
    id: "n3_gram_1",
    type: "multiple-choice",
    question: "もっと練習すれば、（　）できるようになります。",
    options: ["上手", "上手に", "上手な", "上手だ"],
    correctAnswer: 1,
    explanation: "「〜ようになる」の前には動詞の連用形（副詞形）が来ます。",
    sectionId: "grammar",
    level: "N3",
    difficulty: "Intermediate"
  },
  {
    id: "n3_gram_2",
    type: "multiple-choice",
    question: "彼は医者として（　）評判が高い。",
    options: ["とても", "非常に", "大変", "ずいぶん"],
    correctAnswer: 1,
    explanation: "評判が高い」という評価を表す場合は「非常に」がより正式な表現です。",
    sectionId: "grammar",
    level: "N3",
    difficulty: "Intermediate"
  },
  // N2 Vocabulary Questions
  {
    id: "n2_voc_1",
    type: "multiple-choice",
    question: "この問題は複数の要因が（　）して発生した。",
    options: ["関連", "影響", "相互作用", "連携"],
    correctAnswer: 2,
    explanation: "複数の要因が互いに作用し合う状況を「相互作用」と表現します。",
    sectionId: "vocabulary",
    level: "N2",
    difficulty: "Advanced"
  },
  {
    id: "n2_voc_2",
    type: "multiple-choice",
    question: "新しい政策の実施に（　）して、慎重な検討が必要だ。",
    options: ["先立ち", "前もって", "あらかじめ", "事前に"],
    correctAnswer: 0,
    explanation: "政策実施の前段階を表す場合、「〜に先立ち」がより正式な表現です。",
    sectionId: "vocabulary",
    level: "N2",
    difficulty: "Advanced"
  },
  // N2 Grammar Questions
  {
    id: "n2_gram_1",
    type: "multiple-choice",
    question: "経済状況を（　）、来年度の予算を編成する必要がある。",
    options: ["踏まえ", "基づき", "もとづき", "もとに"],
    correctAnswer: 0,
    explanation: "状況を考慮して何かをする場合、「〜を踏まえ」が適切な表現です。",
    sectionId: "grammar",
    level: "N2",
    difficulty: "Advanced"
  },
  {
    id: "n2_gram_2",
    type: "multiple-choice",
    question: "この製品は、安全性（　）配慮が欠かせない。",
    options: ["に関して", "について", "において", "に対して"],
    correctAnswer: 0,
    explanation: "特定の事柄について言及する場合、「〜に関して」が適切です。",
    sectionId: "grammar",
    level: "N2",
    difficulty: "Advanced"
  },
  // N1 Vocabulary Questions
  {
    id: "n1_voc_1",
    type: "multiple-choice",
    question: "彼の言動には一貫性がなく、（　）に富んでいる。",
    options: ["矛盾", "対立", "衝突", "不一致"],
    correctAnswer: 0,
    explanation: "一貫性がない状態を「矛盾」と表現するのが最も適切です。",
    sectionId: "vocabulary",
    level: "N1",
    difficulty: "Expert"
  },
  {
    id: "n1_voc_2",
    type: "multiple-choice",
    question: "この研究は従来の常識を（　）ものだ。",
    options: ["覆す", "逆転する", "転換する", "変革する"],
    correctAnswer: 0,
    explanation: "常識を根本から変える場合、「覆す」が最も適切な表現です。",
    sectionId: "vocabulary",
    level: "N1",
    difficulty: "Expert"
  },
  // N1 Grammar Questions
  {
    id: "n1_gram_1",
    type: "multiple-choice",
    question: "環境問題の深刻化（　）、国際的な協力が不可欠となっている。",
    options: ["を背景に", "を契機に", "を皮切りに", "を機に"],
    correctAnswer: 0,
    explanation: "状況が背景となって何かが起こる場合、「〜を背景に」が適切です。",
    sectionId: "grammar",
    level: "N1",
    difficulty: "Expert"
  },
  {
    id: "n1_gram_2",
    type: "multiple-choice",
    question: "彼の能力は、プロ（　）素晴らしいものだ。",
    options: ["にも増して", "にもまして", "にも匹敵し", "にも劣らず"],
    correctAnswer: 1,
    explanation: "プロ以上に素晴らしいと比較する場合、「〜にもまして」が適切です。",
    sectionId: "grammar",
    level: "N1",
    difficulty: "Expert"
  },
  // N5 Listening Questions
  {
    id: "n5_listen_1",
    type: "listening",
    question: "男の人と女の人が話しています。男の人は何時に起きますか。",
    options: ["6時", "6時半", "7時", "7時半"],
    correctAnswer: 2,
    explanation: "会話で「7時に起きます」と言っています。",
    sectionId: "listening",
    level: "N5",
    difficulty: "Beginner",
    audioUrl: "/audio/n5_listen_1.mp3"
  },
  {
    id: "n5_listen_2",
    type: "listening",
    question: "女の人は何を食べたいですか。",
    options: ["寿司", "ラーメン", "カレーライス", "うどん"],
    correctAnswer: 1,
    explanation: "会話で「ラーメンが食べたい」と言っています。",
    sectionId: "listening",
    level: "N5",
    difficulty: "Beginner",
    audioUrl: "/audio/n5_listen_2.mp3"
  },
  // N4 Listening Questions
  {
    id: "n4_listen_1",
    type: "listening",
    question: "会議は何時から始まりますか。",
    options: ["9時", "9時半", "10時", "10時半"],
    correctAnswer: 1,
    explanation: "会話で「9時半からです」と言っています。",
    sectionId: "listening",
    level: "N4",
    difficulty: "Elementary",
    audioUrl: "/audio/n4_listen_1.mp3"
  }
];

export const getQuestionsByLevel = (level: string): Question[] => {
  return sampleQuestions.filter(q => q.level === level);
};

export const getQuestionsBySection = (sectionId: string): Question[] => {
  return sampleQuestions.filter(q => q.sectionId === sectionId);
};

export const getQuestionsByLevelAndSection = (level: string, sectionId: string): Question[] => {
  return sampleQuestions.filter(q => q.level === level && q.sectionId === sectionId);
};
