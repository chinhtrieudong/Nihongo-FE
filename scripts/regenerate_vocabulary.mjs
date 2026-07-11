import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data', 'vocabulary');
mkdirSync(dataDir, { recursive: true });

// Vocabulary data for Minna no Nihongo N5 - 25 lessons
const lessons = [
  {
    lessonNumber: 1,
    level: "N5",
    title: "Bài 1",
    vocabularies: [
      { kanji: "わたし", hiragana: "わたし", romaji: "watashi", meaning: "Tôi", partOfSpeech: "noun" },
      { kanji: "わたしたち", hiragana: "わたしたち", romaji: "watashitachi", meaning: "Chúng tôi", partOfSpeech: "noun" },
      { kanji: "あなた", hiragana: "あなた", romaji: "anata", meaning: "Bạn", partOfSpeech: "noun" },
      { kanji: "あのひと", hiragana: "あのひと", romaji: "ano hito", meaning: "Người kia", partOfSpeech: "noun" },
      { kanji: "あのかた", hiragana: "あのかた", romaji: "ano kata", meaning: "Quý vị, người kia (lịch sự)", partOfSpeech: "noun" },
      { kanji: "みなさん", hiragana: "みなさん", romaji: "minasan", meaning: "Mọi người", partOfSpeech: "noun" },
      { kanji: "～さん", hiragana: "", romaji: "~san", meaning: "Ông/Bà/Anh/Chị", partOfSpeech: "suffix" },
      { kanji: "～ちゃん", hiragana: "", romaji: "~chan", meaning: "Bé, em", partOfSpeech: "suffix" },
      { kanji: "～くん", hiragana: "", romaji: "~kun", meaning: "Bạn (nam)", partOfSpeech: "suffix" },
      { kanji: "～じん", hiragana: "", romaji: "~jin", meaning: "Người nước...", partOfSpeech: "suffix" },
      { kanji: "せんせい", hiragana: "せんせい", romaji: "sensei", meaning: "Thầy/Cô", partOfSpeech: "noun" },
      { kanji: "きょうし", hiragana: "きょうし", romaji: "kyoushi", meaning: "Giáo viên", partOfSpeech: "noun" },
      { kanji: "がくせい", hiragana: "がくせい", romaji: "gakusei", meaning: "Học sinh, sinh viên", partOfSpeech: "noun" },
      { kanji: "かいしゃいん", hiragana: "かいしゃいん", romaji: "kaisha-in", meaning: "Nhân viên công ty", partOfSpeech: "noun" },
      { kanji: "しゃいん", hiragana: "しゃいん", romaji: "sha-in", meaning: "Nhân viên", partOfSpeech: "noun" },
      { kanji: "ぎんこういん", hiragana: "ぎんこういん", romaji: "ginkouin", meaning: "Nhân viên ngân hàng", partOfSpeech: "noun" },
      { kanji: "いしゃ", hiragana: "いしゃ", romaji: "isha", meaning: "Bác sĩ", partOfSpeech: "noun" },
      { kanji: "けんきゅうしゃ", hiragana: "けんきゅうしゃ", romaji: "kenkyuushi", meaning: "Nhà nghiên cứu", partOfSpeech: "noun" },
      { kanji: "エンジニア", hiragana: "", romaji: "enjinia", meaning: "Kỹ sư", partOfSpeech: "noun" },
      { kanji: "だいがく", hiragana: "だいがく", romaji: "daigaku", meaning: "Đại học", partOfSpeech: "noun" },
      { kanji: "びょういん", hiragana: "びょういん", romaji: "byouin", meaning: "Bệnh viện", partOfSpeech: "noun" },
      { kanji: "でんき", hiragana: "でんき", romaji: "denki", meaning: "Điện, công ty điện lực", partOfSpeech: "noun" },
      { kanji: "だれ", hiragana: "だれ", romaji: "dare", meaning: "Ai", partOfSpeech: "pronoun" },
      { kanji: "どなた", hiragana: "どなた", romaji: "donata", meaning: "Ai (lịch sự)", partOfSpeech: "pronoun" },
      { kanji: "～さい", hiragana: "", romaji: "~sai", meaning: "... tuổi", partOfSpeech: "suffix" },
      { kanji: "なんさい", hiragana: "なんさい", romaji: "nansai", meaning: "Mấy tuổi", partOfSpeech: "noun" },
      { kanji: "おいくつ", hiragana: "おいくつ", romaji: "oikutsu", meaning: "Mấy tuổi (lịch sự)", partOfSpeech: "noun" }
    ]
  },
  {
    lessonNumber: 2,
    level: "N5",
    title: "Bài 2",
    vocabularies: [
      { kanji: "これ", hiragana: "これ", romaji: "kore", meaning: "Cái này", partOfSpeech: "pronoun" },
      { kanji: "それ", hiragana: "それ", romaji: "sore", meaning: "Cái đó", partOfSpeech: "pronoun" },
      { kanji: "あれ", hiragana: "あれ", romaji: "are", meaning: "Cái kia", partOfSpeech: "pronoun" },
      { kanji: "この～", hiragana: "この～", romaji: "kono~", meaning: "... này", partOfSpeech: "prefix" },
      { kanji: "その～", hiragana: "その～", romaji: "sono~", meaning: "... đó", partOfSpeech: "prefix" },
      { kanji: "あの～", hiragana: "あの～", romaji: "ano~", meaning: "... kia", partOfSpeech: "prefix" },
      { kanji: "ほん", hiragana: "ほん", romaji: "hon", meaning: "Sách", partOfSpeech: "noun" },
      { kanji: "じしょ", hiragana: "じしょ", romaji: "jisho", meaning: "Từ điển", partOfSpeech: "noun" },
      { kanji: "ざっし", hiragana: "ざっし", romaji: "zasshi", meaning: "Tạp chí", partOfSpeech: "noun" },
      { kanji: "しんぶん", hiragana: "しんぶん", romaji: "shinbun", meaning: "Báo", partOfSpeech: "noun" },
      { kanji: "ノート", hiragana: "", romaji: "note", meaning: "Vở", partOfSpeech: "noun" },
      { kanji: "てちょう", hiragana: "てちょう", romaji: "techo", meaning: "Sổ tay", partOfSpeech: "noun" },
      { kanji: "めいし", hiragana: "めいし", romaji: "meishi", meaning: "Danh thiếp", partOfSpeech: "noun" },
      { kanji: "カード", hiragana: "", romaji: "cardo", meaning: "Thẻ", partOfSpeech: "noun" },
      { kanji: "テレホンカード", hiragana: "てれほんかーど", romaji: "telehon kado", meaning: "Thẻ điện thoại", partOfSpeech: "noun" },
      { kanji: "えんぴつ", hiragana: "えんぴつ", romaji: "enpitsu", meaning: "Bút chì", partOfSpeech: "noun" },
      { kanji: "ボールペン", hiragana: "", romaji: "bo-rupen", meaning: "Bút bi", partOfSpeech: "noun" },
      { kanji: "シャープペンシル", hiragana: "", romaji: "sha-pu pen shiru", meaning: "Bút chì kim", partOfSpeech: "noun" },
      { kanji: "かぎ", hiragana: "かぎ", romaji: "kagi", meaning: "Chìa khóa", partOfSpeech: "noun" },
      { kanji: "とけい", hiragana: "とけい", romaji: "tokei", meaning: "Đồng hồ", partOfSpeech: "noun" },
      { kanji: "かさ", hiragana: "かさ", romaji: "kasa", meaning: "Ô", partOfSpeech: "noun" },
      { kanji: "かばん", hiragana: "かばん", romaji: "kaban", meaning: "Cặp, túi", partOfSpeech: "noun" },
      { kanji: "CD", hiragana: "", romaji: "CD", meaning: "Đĩa CD", partOfSpeech: "noun" },
      { kanji: "テレビ", hiragana: "", romaji: "terebi", meaning: "Tivi", partOfSpeech: "noun" },
      { kanji: "ラジオ", hiragana: "", romaji: "rajio", meaning: "Radio", partOfSpeech: "noun" },
      { kanji: "カメラ", hiragana: "", romaji: "kamera", meaning: "Máy ảnh", partOfSpeech: "noun" },
      { kanji: "コンピューター", hiragana: "", romaji: "konpyu-ta-", meaning: "Máy tính", partOfSpeech: "noun" },
      { kanji: "くるま", hiragana: "くるま", romaji: "kuruma", meaning: "Ô tô", partOfSpeech: "noun" },
      { kanji: "つくえ", hiragana: "つくえ", romaji: "tsukue", meaning: "Bàn", partOfSpeech: "noun" },
      { kanji: "いす", hiragana: "いす", romaji: "isu", meaning: "Ghế", partOfSpeech: "noun" }
    ]
  },
  {
    lessonNumber: 3,
    level: "N5",
    title: "Bài 3",
    vocabularies: [
      { kanji: "ここ", hiragana: "ここ", romaji: "koko", meaning: "Đây", partOfSpeech: "noun" },
      { kanji: "そこ", hiragana: "そこ", romaji: "soko", meaning: "Đó", partOfSpeech: "noun" },
      { kanji: "あそこ", hiragana: "あそこ", romaji: "asoko", meaning: "Kia", partOfSpeech: "noun" },
      { kanji: "どこ", hiragana: "どこ", romaji: "doko", meaning: "Đâu", partOfSpeech: "noun" },
      { kanji: "こちら", hiragana: "こちら", romaji: "kochira", meaning: "Đây (lịch sự)", partOfSpeech: "noun" },
      { kanji: "そちら", hiragana: "そちら", romaji: "sochira", meaning: "Đó (lịch sự)", partOfSpeech: "noun" },
      { kanji: "あちら", hiragana: "あちら", romaji: "achira", meaning: "Kia (lịch sự)", partOfSpeech: "noun" },
      { kanji: "どちら", hiragana: "どちら", romaji: "dochira", meaning: "Đâu (lịch sự)", partOfSpeech: "noun" },
      { kanji: "きょうしつ", hiragana: "きょうしつ", romaji: "kyoushitsu", meaning: "Lớp học", partOfSpeech: "noun" },
      { kanji: "しょくどう", hiragana: "しょくどう", romaji: "shoku-dou", meaning: "Nhà ăn", partOfSpeech: "noun" },
      { kanji: "じむしょ", hiragana: "じむしょ", romaji: "jimusho", meaning: "Văn phòng", partOfSpeech: "noun" },
      { kanji: "うけつけ", hiragana: "うけつけ", romaji: "uketsuke", meaning: "Quầy lễ tân", partOfSpeech: "noun" },
      { kanji: "ロビー", hiragana: "", romaji: "robi-", meaning: "Sảnh", partOfSpeech: "noun" },
      { kanji: "へや", hiragana: "へや", romaji: "heya", meaning: "Phòng", partOfSpeech: "noun" },
      { kanji: "トイレ", hiragana: "", romaji: "toire", meaning: "Nhà vệ sinh", partOfSpeech: "noun" },
      { kanji: "かいだん", hiragana: "かいだん", romaji: "kaidan", meaning: "Cầu thang", partOfSpeech: "noun" },
      { kanji: "エレベーター", hiragana: "", romaji: "erebe-ta-", meaning: "Thang máy", partOfSpeech: "noun" },
      { kanji: "エスカレーター", hiragana: "", romaji: "esukare-ta-", meaning: "Thang cuốn", partOfSpeech: "noun" },
      { kanji: "じどうはんばいき", hiragana: "じどうはんばいき", romaji: "jidoohanbai-ki", meaning: "Máy bán hàng tự động", partOfSpeech: "noun" },
      { kanji: "でんわ", hiragana: "でんわ", romaji: "denwa", meaning: "Điện thoại", partOfSpeech: "noun" },
      { kanji: "くに", hiragana: "くに", romaji: "kuni", meaning: "Quốc gia", partOfSpeech: "noun" },
      { kanji: "かいしゃ", hiragana: "かいしゃ", romaji: "kaisha", meaning: "Công ty", partOfSpeech: "noun" },
      { kanji: "うち", hiragana: "うち", romaji: "uchi", meaning: "Nhà", partOfSpeech: "noun" }
    ]
  },
  {
    lessonNumber: 4,
    level: "N5",
    title: "Bài 4",
    vocabularies: [
      { kanji: "おきます", hiragana: "おきます", romaji: "okimasu", meaning: "Thức dậy", partOfSpeech: "verb" },
      { kanji: "ねます", hiragana: "ねます", romaji: "nemasu", meaning: "Ngủ", partOfSpeech: "verb" },
      { kanji: "はたらきます", hiragana: "はたらきます", romaji: "hatarakimasu", meaning: "Làm việc", partOfSpeech: "verb" },
      { kanji: "やすみます", hiragana: "やすみます", romaji: "yasumimasu", meaning: "Nghỉ", partOfSpeech: "verb" },
      { kanji: "べんきょうします", hiragana: "べんきょうします", romaji: "benkyou shimasu", meaning: "Học", partOfSpeech: "verb" },
      { kanji: "おわります", hiragana: "おわります", romaji: "owarimasu", meaning: "Kết thúc", partOfSpeech: "verb" },
      { kanji: "いま", hiragana: "いま", romaji: "ima", meaning: "Bây giờ", partOfSpeech: "noun" },
      { kanji: "～じ", hiragana: "～じ", romaji: "~ji", meaning: "... giờ", partOfSpeech: "suffix" },
      { kanji: "～ふん・ぷん", hiragana: "～ふん・ぷん", romaji: "~fun/pun", meaning: "... phút", partOfSpeech: "suffix" },
      { kanji: "はん", hiragana: "はん", romaji: "han", meaning: "Rưỡi", partOfSpeech: "noun" },
      { kanji: "なんじ", hiragana: "なんじ", romaji: "nanji", meaning: "Mấy giờ", partOfSpeech: "noun" },
      { kanji: "なんぷん", hiragana: "なんぷん", romaji: "nanpun", meaning: "Mấy phút", partOfSpeech: "noun" },
      { kanji: "あさ", hiragana: "あさ", romaji: "asa", meaning: "Buổi sáng", partOfSpeech: "noun" },
      { kanji: "ひる", hiragana: "ひる", romaji: "hiru", meaning: "Buổi trưa", partOfSpeech: "noun" },
      { kanji: "よる", hiragana: "よる", romaji: "yoru", meaning: "Buổi tối", partOfSpeech: "noun" },
      { kanji: "おととい", hiragana: "おととい", romaji: "ototoui", meaning: "Hôm kia", partOfSpeech: "noun" },
      { kanji: "きのう", hiragana: "きのう", romaji: "kinou", meaning: "Hôm qua", partOfSpeech: "noun" },
      { kanji: "きょう", hiragana: "きょう", romaji: "kyou", meaning: "Hôm nay", partOfSpeech: "noun" },
      { kanji: "あした", hiragana: "あした", romaji: "ashita", meaning: "Ngày mai", partOfSpeech: "noun" },
      { kanji: "あさって", hiragana: "あさって", romaji: "asatte", meaning: "Ngày kia", partOfSpeech: "noun" },
      { kanji: "けさ", hiragana: "けさ", romaji: "kesa", meaning: "Sáng nay", partOfSpeech: "noun" },
      { kanji: "こんばん", hiragana: "こんばん", romaji: "konban", meaning: "Tối nay", partOfSpeech: "noun" },
      { kanji: "やすみ", hiragana: "やすみ", romaji: "yasumi", meaning: "Ngày nghỉ", partOfSpeech: "noun" }
    ]
  },
  {
    lessonNumber: 5,
    level: "N5",
    title: "Bài 5",
    vocabularies: [
      { kanji: "いきます", hiragana: "いきます", romaji: "ikimasu", meaning: "Đi", partOfSpeech: "verb" },
      { kanji: "きます", hiragana: "きます", romaji: "kimasu", meaning: "Đến", partOfSpeech: "verb" },
      { kanji: "かえります", hiragana: "かえります", romaji: "kaerimasu", meaning: "Về", partOfSpeech: "verb" },
      { kanji: "がっこう", hiragana: "がっこう", romaji: "gakkou", meaning: "Trường học", partOfSpeech: "noun" },
      { kanji: "スーパー", hiragana: "", romaji: "su-pa-", meaning: "Siêu thị", partOfSpeech: "noun" },
      { kanji: "えき", hiragana: "えき", romaji: "eki", meaning: "Nhà ga", partOfSpeech: "noun" },
      { kanji: "ひこうき", hiragana: "ひこうき", romaji: "hikouki", meaning: "Máy bay", partOfSpeech: "noun" },
      { kanji: "ふね", hiragana: "ふね", romaji: "fune", meaning: "Tàu thuy", partOfSpeech: "noun" },
      { kanji: "でんしゃ", hiragana: "でんしゃ", romaji: "densha", meaning: "Tàu điện", partOfSpeech: "noun" },
      { kanji: "ちかてつ", hiragana: "ちかてつ", romaji: "chikatetsu", meaning: "Tàu điện ngầm", partOfSpeech: "noun" },
      { kanji: "しんかんせん", hiragana: "しんかんせん", romaji: "shinkansen", meaning: "Tàu Shinkansen", partOfSpeech: "noun" },
      { kanji: "バス", hiragana: "", romaji: "basu", meaning: "Xe buýt", partOfSpeech: "noun" },
      { kanji: "タクシー", hiragana: "", romaji: "takushii", meaning: "Taxi", partOfSpeech: "noun" },
      { kanji: "じてんしゃ", hiragana: "じてんしゃ", romaji: "jitensya", meaning: "Xe đạp", partOfSpeech: "noun" },
      { kanji: "あるいて", hiragana: "あるいて", romaji: "aruite", meaning: "Đi bộ", partOfSpeech: "verb" },
      { kanji: "ひと", hiragana: "ひと", romaji: "hito", meaning: "Người", partOfSpeech: "noun" },
      { kanji: "ともだち", hiragana: "ともだち", romaji: "tomodachi", meaning: "Bạn", partOfSpeech: "noun" },
      { kanji: "かれ", hiragana: "かれ", romaji: "kare", meaning: "Anh ấy", partOfSpeech: "pronoun" },
      { kanji: "かのじょ", hiragana: "かのじょ", romaji: "kanojo", meaning: "Cô ấy", partOfSpeech: "pronoun" },
      { kanji: "かぞく", hiragana: "かぞく", romaji: "kazoku", meaning: "Gia đình", partOfSpeech: "noun" },
      { kanji: "ひとりで", hiragana: "ひとりで", romaji: "hitoride", meaning: "Một mình", partOfSpeech: "adverb" },
      { kanji: "せんしゅう", hiragana: "せんしゅう", romaji: "senshuu", meaning: "Tuần trước", partOfSpeech: "noun" },
      { kanji: "こんしゅう", hiragana: "こんしゅう", romaji: "konshuu", meaning: "Tuần này", partOfSpeech: "noun" },
      { kanji: "らいしゅう", hiragana: "らいしゅう", romaji: "raishuu", meaning: "Tuần sau", partOfSpeech: "noun" },
      { kanji: "なんじょうび", hiragana: "なんじょうび", romaji: "nanjyoubi", meaning: "Thứ mấy", partOfSpeech: "noun" }
    ]
  }
];

// Write individual lesson files
lessons.forEach(lesson => {
  const n = String(lesson.lessonNumber).padStart(2, '0');
  writeFileSync(join(dataDir, `lesson-${n}.json`), JSON.stringify(lesson, null, 2) + '\n');
});

// Write index.ts
const imports = lessons.map(l => `import lesson${String(l.lessonNumber).padStart(2, '0')} from './lesson-${String(l.lessonNumber).padStart(2, '0')}.json';`).join('\n');
const exports = lessons.map(l => `  lesson${String(l.lessonNumber).padStart(2, '0')},`).join('\n');

writeFileSync(join(dataDir, 'index.ts'), `// Vocabulary index - Minna N5
${imports}

export const lessons = [
${exports}
];

export const levels = ['N5'];
`);

console.log('✅ Created vocabulary data for lessons 1-5 with furigana support');