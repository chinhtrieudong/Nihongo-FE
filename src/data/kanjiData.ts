import { KanjiItem } from '@kanji-types';

export const kanjiData: KanjiItem[] = [
  // N5 Kanji
  {
    id: '1',
    kanji: '日',
    hanviet: 'nhật',
    level: 'N5',
    color: '',
    onyomi: ['ニチ', 'ジツ'],
    kunyomi: ['ひ', '-び'],
    nanori: [],
    meaning: 'day, sun',
    meaningVi: 'ngày, mặt trời',
    strokeCount: 4,
    radicals: ['日'],
    memoryTip: 'Mặt trời (日) chiếu sáng',
    relatedVocabulary: [
      { word: '日曜日', kana: 'にちようび', hanviet: 'nhật diệt nhật', meaningVi: 'chủ nhật' },
      { word: '今日', kana: 'きょう', hanviet: 'kim nhật', meaningVi: 'hôm nay' }
    ]
  },
  {
    id: '2',
    kanji: '一',
    hanviet: 'nhất',
    level: 'N5',
    color: '',
    onyomi: ['イチ', 'イツ'],
    kunyomi: ['ひと', '-つ'],
    nanori: [],
    meaning: 'one',
    meaningVi: 'một',
    strokeCount: 1,
    radicals: ['一'],
    memoryTip: 'Một nét ngang',
    relatedVocabulary: [
      { word: '一月', kana: 'いちがつ', hanviet: 'nhất nguyệt', meaningVi: 'tháng một' },
      { word: '一人', kana: 'ひとり', hanviet: 'nhất nhân', meaningVi: 'một người' }
    ]
  },
  {
    id: '3',
    kanji: '人',
    hanviet: 'nhân',
    level: 'N5',
    color: '',
    onyomi: ['ジン', 'ニン'],
    kunyomi: ['ひと'],
    nanori: [],
    meaning: 'person',
    meaningVi: 'người',
    strokeCount: 2,
    radicals: ['人'],
    memoryTip: 'Hai chân người đứng',
    relatedVocabulary: [
      { word: '日本人', kana: 'にほんじん', hanviet: 'Nhật bản nhân', meaningVi: 'người Nhật' },
      { word: '人', kana: 'ひと', hanviet: 'nhân', meaningVi: 'người' }
    ]
  },
  {
    id: '4',
    kanji: '年',
    hanviet: 'niên',
    level: 'N5',
    color: '',
    onyomi: ['ネン'],
    kunyomi: ['とし'],
    nanori: [],
    meaning: 'year',
    meaningVi: 'năm',
    strokeCount: 6,
    radicals: ['年'],
    memoryTip: 'Người cầm lúa thu hoạch',
    relatedVocabulary: [
      { word: '一年', kana: 'いちねん', hanviet: 'nhất niên', meaningVi: 'một năm' },
      { word: '今年', kana: 'ことし', hanviet: 'kim niên', meaningVi: 'năm nay' }
    ]
  },
  {
    id: '5',
    kanji: '大',
    hanviet: 'đại',
    level: 'N5',
    color: '',
    onyomi: ['ダイ', 'タイ'],
    kunyomi: ['おお', '-おお.きい'],
    nanori: [],
    meaning: 'big, large',
    meaningVi: 'lớn, to',
    strokeCount: 3,
    radicals: ['大'],
    memoryTip: 'Người dang tay rộng',
    relatedVocabulary: [
      { word: '大きい', kana: 'おおきい', hanviet: 'đại', meaningVi: 'lớn' },
      { word: '大学', kana: 'だいがく', hanviet: 'đại học', meaningVi: 'đại học' }
    ]
  },
  {
    id: '6',
    kanji: '本',
    hanviet: 'bản',
    level: 'N5',
    color: '',
    onyomi: ['ホン'],
    kunyomi: ['もと'],
    nanori: [],
    meaning: 'book, origin',
    meaningVi: 'sách, gốc',
    strokeCount: 5,
    radicals: ['本'],
    memoryTip: 'Cây có rễ',
    relatedVocabulary: [
      { word: '日本', kana: 'にほん', hanviet: 'Nhật bản', meaningVi: 'Nhật Bản' },
      { word: '本', kana: 'ほん', hanviet: 'bản', meaningVi: 'sách' }
    ]
  },
  {
    id: '7',
    kanji: '中',
    hanviet: 'trung',
    level: 'N5',
    color: '',
    onyomi: ['チュウ'],
    kunyomi: ['なか'],
    nanori: [],
    meaning: 'middle, center',
    meaningVi: 'giữa, trung tâm',
    strokeCount: 4,
    radicals: ['中'],
    memoryTip: 'Dây xuyên qua giữa',
    relatedVocabulary: [
      { word: '中国', kana: 'ちゅうごく', hanviet: 'Trung quốc', meaningVi: 'Trung Quốc' },
      { word: '中', kana: 'なか', hanviet: 'trung', meaningVi: 'trong' }
    ]
  },
  {
    id: '8',
    kanji: '小',
    hanviet: 'tiểu',
    level: 'N5',
    color: '',
    onyomi: ['ショウ'],
    kunyomi: ['ちい.さい', '-こ', '-さ'],
    nanori: [],
    meaning: 'small',
    meaningVi: 'nhỏ',
    strokeCount: 3,
    radicals: ['小'],
    memoryTip: 'Ba hạt nhỏ',
    relatedVocabulary: [
      { word: '小さい', kana: 'ちいさい', hanviet: 'tiểu', meaningVi: 'nhỏ' },
      { word: '小学校', kana: 'しょうがっこう', hanviet: 'tiểu học', meaningVi: 'tiểu học' }
    ]
  },
  {
    id: '9',
    kanji: '月',
    hanviet: 'nguyệt',
    level: 'N5',
    color: '',
    onyomi: ['ゲツ', 'ガツ'],
    kunyomi: ['つき'],
    nanori: [],
    meaning: 'month, moon',
    meaningVi: 'tháng, mặt trăng',
    strokeCount: 4,
    radicals: ['月'],
    memoryTip: 'Mặt trăng khuyết',
    relatedVocabulary: [
      { word: '一月', kana: 'いちがつ', hanviet: 'nhất nguyệt', meaningVi: 'tháng một' },
      { word: '月', kana: 'つき', hanviet: 'nguyệt', meaningVi: 'mặt trăng' }
    ]
  },
  {
    id: '10',
    kanji: '火',
    hanviet: 'hỏa',
    level: 'N5',
    color: '',
    onyomi: ['カ'],
    kunyomi: ['ひ'],
    nanori: [],
    meaning: 'fire',
    meaningVi: 'lửa',
    strokeCount: 4,
    radicals: ['火'],
    memoryTip: 'Ngọn lửa bùng lên',
    relatedVocabulary: [
      { word: '火曜日', kana: 'かようび', hanviet: 'hỏa diệt nhật', meaningVi: 'thứ ba' },
      { word: '火', kana: 'ひ', hanviet: 'hỏa', meaningVi: 'lửa' }
    ]
  },
  // N4 Kanji
  {
    id: '11',
    kanji: '社',
    hanviet: 'xã',
    level: 'N4',
    color: '',
    onyomi: ['シャ'],
    kunyomi: ['やしろ'],
    nanori: [],
    meaning: 'company, society',
    meaningVi: 'công ty, xã hội',
    strokeCount: 7,
    radicals: ['社'],
    memoryTip: 'Thờ (示) và đất (土) = xã hội',
    relatedVocabulary: [
      { word: '会社', kana: 'かいしゃ', hanviet: 'hội xã', meaningVi: 'công ty' },
      { word: '社会', kana: 'しゃかい', hanviet: 'xã hội', meaningVi: 'xã hội' }
    ]
  },
  {
    id: '12',
    kanji: '会',
    hanviet: 'hội',
    level: 'N4',
    color: '',
    onyomi: ['カイ'],
    kunyomi: ['あ'],
    nanori: [],
    meaning: 'meeting, association',
    meaningVi: 'họp, hội',
    strokeCount: 6,
    radicals: ['会'],
    memoryTip: 'Người (人) tụ họp',
    relatedVocabulary: [
      { word: '会議', kana: 'かいぎ', hanviet: 'hội nghị', meaningVi: 'hội nghị' },
      { word: '会う', kana: 'あう', hanviet: 'hội', meaningVi: 'gặp' }
    ]
  },
  {
    id: '13',
    kanji: '時',
    hanviet: 'thời',
    level: 'N4',
    color: '',
    onyomi: ['ジ'],
    kunyomi: ['とき', '-どき'],
    nanori: [],
    meaning: 'time',
    meaningVi: 'thời gian',
    strokeCount: 10,
    radicals: ['時'],
    memoryTip: 'Mặt trời (日) và chân (寺)',
    relatedVocabulary: [
      { word: '時間', kana: 'じかん', hanviet: 'thời gian', meaningVi: 'thời gian' },
      { word: '時', kana: 'とき', hanviet: 'thời', meaningVi: 'lúc' }
    ]
  },
  {
    id: '14',
    kanji: '場',
    hanviet: 'tràng',
    level: 'N4',
    color: '',
    onyomi: ['ジョウ', 'チョウ'],
    kunyomi: ['ば'],
    nanori: [],
    meaning: 'place',
    meaningVi: 'nơi, chốn',
    strokeCount: 12,
    radicals: ['場'],
    memoryTip: 'Đất (土) và mặt trời (日)',
    relatedVocabulary: [
      { word: '場所', kana: 'ばしょ', hanviet: 'tràng sở', meaningVi: 'nơi chốn' },
      { word: '市場', kana: 'いちば', hanviet: 'thị trường', meaningVi: 'chợ' }
    ]
  },
  {
    id: '15',
    kanji: '物',
    hanviet: 'vật',
    level: 'N4',
    color: '',
    onyomi: ['ブツ', 'モツ'],
    kunyomi: ['もの'],
    nanori: [],
    meaning: 'thing, object',
    meaningVi: 'vật, đồ',
    strokeCount: 8,
    radicals: ['物'],
    memoryTip: 'Bò (牛) và con vật',
    relatedVocabulary: [
      { word: '物', kana: 'もの', hanviet: 'vật', meaningVi: 'đồ vật' },
      { word: '買い物', kana: 'かいもの', hanviet: 'mại vật', meaningVi: 'mua sắm' }
    ]
  },
  // N3 Kanji
  {
    id: '16',
    kanji: '愛',
    hanviet: 'ái',
    level: 'N3',
    color: '',
    onyomi: ['アイ'],
    kunyomi: [''],
    nanori: [],
    meaning: 'love',
    meaningVi: 'tình yêu',
    strokeCount: 13,
    radicals: ['愛'],
    memoryTip: 'Trái tim (心) trong nhà (宀) = tình yêu',
    relatedVocabulary: [
      { word: '愛', kana: 'あい', hanviet: 'ái', meaningVi: 'tình yêu' },
      { word: '愛情', kana: 'あいじょう', hanviet: 'ái tình', meaningVi: 'tình cảm' }
    ]
  },
  {
    id: '17',
    kanji: '安',
    hanviet: 'an',
    level: 'N3',
    color: '',
    onyomi: ['アン'],
    kunyomi: ['やす.い'],
    nanori: [],
    meaning: 'peace, cheap',
    meaningVi: 'bình yên, rẻ',
    strokeCount: 6,
    radicals: ['安'],
    memoryTip: 'Người (女) dưới mái nhà (宀) = an toàn',
    relatedVocabulary: [
      { word: '安全', kana: 'あんぜん', hanviet: 'an toàn', meaningVi: 'an toàn' },
      { word: '安い', kana: 'やすい', hanviet: 'an', meaningVi: 'rẻ' }
    ]
  },
  {
    id: '18',
    kanji: '意',
    hanviet: 'ý',
    level: 'N3',
    color: '',
    onyomi: ['イ'],
    kunyomi: [''],
    nanori: [],
    meaning: 'meaning, intention',
    meaningVi: 'ý nghĩa, ý định',
    strokeCount: 13,
    radicals: ['意'],
    memoryTip: 'Âm thanh (音) trong tâm (心)',
    relatedVocabulary: [
      { word: '意味', kana: 'いみ', hanviet: 'ý vị', meaningVi: 'ý nghĩa' },
      { word: '注意', kana: 'ちゅうい', hanviet: 'chú ý', meaningVi: 'chú ý' }
    ]
  },
  // N2 Kanji
  {
    id: '19',
    kanji: '力',
    hanviet: 'lực',
    level: 'N2',
    color: '',
    onyomi: ['リョク', 'リキ'],
    kunyomi: ['ちから'],
    nanori: [],
    meaning: 'power, strength',
    meaningVi: 'sức mạnh, lực lượng',
    strokeCount: 2,
    radicals: ['力'],
    memoryTip: 'Cánh tay khỏe mạnh',
    relatedVocabulary: [
      { word: '力', kana: 'ちから', hanviet: 'lực', meaningVi: 'sức mạnh' },
      { word: '努力', kana: 'どりょく', hanviet: 'nỗ lực', meaningVi: 'nỗ lực' }
    ]
  },
  {
    id: '20',
    kanji: '能',
    hanviet: 'năng',
    level: 'N2',
    color: '',
    onyomi: ['ノウ'],
    kunyomi: [''],
    nanori: [],
    meaning: 'ability, can',
    meaningVi: 'năng lực, có thể',
    strokeCount: 10,
    radicals: ['能'],
    memoryTip: 'Thú (月) có khả năng',
    relatedVocabulary: [
      { word: '能力', kana: 'のうりょく', hanviet: 'năng lực', meaningVi: 'năng lực' },
      { word: '可能', kana: 'かのう', hanviet: 'khả năng', meaningVi: 'khả năng' }
    ]
  }
];

export const getKanjiByLevel = (level: string): KanjiItem[] => {
  return kanjiData.filter(kanji => kanji.level === level);
};

export const getAllKanji = (): KanjiItem[] => {
  return kanjiData;
};
