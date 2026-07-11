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
      { kanji: "私", hiragana: "わたし", romaji: "watashi", meaning: "Tôi", hanViet: "TƯ", partOfSpeech: "noun" },
      { kanji: "私たち", hiragana: "わたしたち", romaji: "watashitachi", meaning: "Chúng tôi", hanViet: "TƯ", partOfSpeech: "noun" },
      { kanji: "あなた", hiragana: "あなた", romaji: "anata", meaning: "Bạn", hanViet: "", partOfSpeech: "noun" },
      { kanji: "あの人", hiragana: "あのひと", romaji: "ano hito", meaning: "Người kia", hanViet: "NHÂN", partOfSpeech: "noun" },
      { kanji: "あの方", hiragana: "あのかた", romaji: "ano kata", meaning: "Quý vị, người kia (lịch sự)", hanViet: "PHƯƠNG", partOfSpeech: "noun" },
      { kanji: "皆さん", hiragana: "みなさん", romaji: "minasan", meaning: "Mọi người", hanViet: "GIAI", partOfSpeech: "noun" },
      { kanji: "～さん", hiragana: "", romaji: "~san", meaning: "Ông/Bà/Anh/Chị", hanViet: "", partOfSpeech: "suffix" },
      { kanji: "～ちゃん", hiragana: "", romaji: "~chan", meaning: "Bé, em", hanViet: "", partOfSpeech: "suffix" },
      { kanji: "～君", hiragana: "", romaji: "~kun", meaning: "Bạn (nam)", hanViet: "QUÂN", partOfSpeech: "suffix" },
      { kanji: "～人", hiragana: "", romaji: "~jin", meaning: "Người nước...", hanViet: "NHÂN", partOfSpeech: "suffix" },
      { kanji: "先生", hiragana: "せんせい", romaji: "sensei", meaning: "Thầy/Cô", hanViet: "TIÊN SINH", partOfSpeech: "noun" },
      { kanji: "教師", hiragana: "きょうし", romaji: "kyoushi", meaning: "Giáo viên", hanViet: "GIÁO SƯ", partOfSpeech: "noun" },
      { kanji: "学生", hiragana: "がくせい", romaji: "gakusei", meaning: "Học sinh, sinh viên", hanViet: "HỌC SINH", partOfSpeech: "noun" },
      { kanji: "会社員", hiragana: "かいしゃいん", romaji: "kaisha-in", meaning: "Nhân viên công ty", hanViet: "HỘI XÃ VIÊN", partOfSpeech: "noun" },
      { kanji: "社員", hiragana: "しゃいん", romaji: "sha-in", meaning: "Nhân viên", hanViet: "XÃ VIÊN", partOfSpeech: "noun" },
      { kanji: "銀行員", hiragana: "ぎんこういん", romaji: "ginkouin", meaning: "Nhân viên ngân hàng", hanViet: "NGÂN HÀNH VIÊN", partOfSpeech: "noun" },
      { kanji: "医者", hiragana: "いしゃ", romaji: "isha", meaning: "Bác sĩ", hanViet: "Y GIẢ", partOfSpeech: "noun" },
      { kanji: "研究者", hiragana: "けんきゅうしゃ", romaji: "kenkyuushi", meaning: "Nhà nghiên cứu", hanViet: "NGHIÊN CỨU GIẢ", partOfSpeech: "noun" },
      { kanji: "エンジニア", hiragana: "", romaji: "enjinia", meaning: "Kỹ sư", hanViet: "", partOfSpeech: "noun" },
      { kanji: "大学", hiragana: "だいがく", romaji: "daigaku", meaning: "Đại học", hanViet: "ĐẠI HỌC", partOfSpeech: "noun" },
      { kanji: "病院", hiragana: "びょういん", romaji: "byouin", meaning: "Bệnh viện", hanViet: "BỆNH VIỆN", partOfSpeech: "noun" },
      { kanji: "電気", hiragana: "でんき", romaji: "denki", meaning: "Điện, công ty điện lực", hanViet: "ĐIỆN KHÍ", partOfSpeech: "noun" },
      { kanji: "誰", hiragana: "だれ", romaji: "dare", meaning: "Ai", hanViet: "THÙY", partOfSpeech: "pronoun" },
      { kanji: "どなた", hiragana: "どなた", romaji: "donata", meaning: "Ai (lịch sự)", hanViet: "", partOfSpeech: "pronoun" },
      { kanji: "～歳", hiragana: "", romaji: "~sai", meaning: "... tuổi", hanViet: "TUẾ", partOfSpeech: "suffix" },
      { kanji: "何歳", hiragana: "なんさい", romaji: "nansai", meaning: "Mấy tuổi", hanViet: "HÀ TUẾ", partOfSpeech: "noun" },
      { kanji: "おいくつ", hiragana: "おいくつ", romaji: "oikutsu", meaning: "Mấy tuổi (lịch sự)", hanViet: "", partOfSpeech: "noun" }
    ]
  },
  {
    lessonNumber: 2,
    level: "N5",
    title: "Bài 2",
    vocabularies: [
      { kanji: "これ", hiragana: "これ", romaji: "kore", meaning: "Cái này", hanViet: "", partOfSpeech: "pronoun" },
      { kanji: "それ", hiragana: "それ", romaji: "sore", meaning: "Cái đó", hanViet: "", partOfSpeech: "pronoun" },
      { kanji: "あれ", hiragana: "あれ", romaji: "are", meaning: "Cái kia", hanViet: "", partOfSpeech: "pronoun" },
      { kanji: "この～", hiragana: "この～", romaji: "kono~", meaning: "... này", hanViet: "", partOfSpeech: "prefix" },
      { kanji: "その～", hiragana: "その～", romaji: "sono~", meaning: "... đó", hanViet: "", partOfSpeech: "prefix" },
      { kanji: "あの～", hiragana: "あの～", romaji: "ano~", meaning: "... kia", hanViet: "", partOfSpeech: "prefix" },
      { kanji: "本", hiragana: "ほん", romaji: "hon", meaning: "Sách", hanViet: "BẢN", partOfSpeech: "noun" },
      { kanji: "辞書", hiragana: "じしょ", romaji: "jisho", meaning: "Từ điển", hanViet: "TỪ THƯ", partOfSpeech: "noun" },
      { kanji: "雑誌", hiragana: "ざっし", romaji: "zasshi", meaning: "Tạp chí", hanViet: "TẠP CHÍ", partOfSpeech: "noun" },
      { kanji: "新聞", hiragana: "しんぶん", romaji: "shinbun", meaning: "Báo", hanViet: "TÂN VĂN", partOfSpeech: "noun" },
      { kanji: "ノート", hiragana: "", romaji: "note", meaning: "Vở", hanViet: "", partOfSpeech: "noun" },
      { kanji: "手帳", hiragana: "てちょう", romaji: "techo", meaning: "Sổ tay", hanViet: "THỦ TRƯỚNG", partOfSpeech: "noun" },
      { kanji: "名刺", hiragana: "めいし", romaji: "meishi", meaning: "Danh thiếp", hanViet: "DANH THÍCH", partOfSpeech: "noun" },
      { kanji: "カード", hiragana: "", romaji: "cardo", meaning: "Thẻ", hanViet: "", partOfSpeech: "noun" },
      { kanji: "テレホンカード", hiragana: "てれほんかーど", romaji: "telehon kado", meaning: "Thẻ điện thoại", hanViet: "", partOfSpeech: "noun" },
      { kanji: "鉛筆", hiragana: "えんぴつ", romaji: "enpitsu", meaning: "Bút chì", hanViet: "DUYÊN BÚT", partOfSpeech: "noun" },
      { kanji: "ボールペン", hiragana: "", romaji: "bo-rupen", meaning: "Bút bi", hanViet: "", partOfSpeech: "noun" },
      { kanji: "シャープペンシル", hiragana: "", romaji: "sha-pu pen shiru", meaning: "Bút chì kim", hanViet: "", partOfSpeech: "noun" },
      { kanji: "鍵", hiragana: "かぎ", romaji: "kagi", meaning: "Chìa khóa", hanViet: "KIỆN", partOfSpeech: "noun" },
      { kanji: "時計", hiragana: "とけい", romaji: "tokei", meaning: "Đồng hồ", hanViet: "THỜI KẾ", partOfSpeech: "noun" },
      { kanji: "傘", hiragana: "かさ", romaji: "kasa", meaning: "Ô", hanViet: "TẢN", partOfSpeech: "noun" },
      { kanji: "鞄", hiragana: "かばん", romaji: "kaban", meaning: "Cặp, túi", hanViet: "BẠC", partOfSpeech: "noun" },
      { kanji: "CD", hiragana: "", romaji: "CD", meaning: "Đĩa CD", hanViet: "", partOfSpeech: "noun" },
      { kanji: "テレビ", hiragana: "", romaji: "terebi", meaning: "Tivi", hanViet: "", partOfSpeech: "noun" },
      { kanji: "ラジオ", hiragana: "", romaji: "rajio", meaning: "Radio", hanViet: "", partOfSpeech: "noun" },
      { kanji: "カメラ", hiragana: "", romaji: "kamera", meaning: "Máy ảnh", hanViet: "", partOfSpeech: "noun" },
      { kanji: "コンピューター", hiragana: "", romaji: "konpyu-ta-", meaning: "Máy tính", hanViet: "", partOfSpeech: "noun" },
      { kanji: "車", hiragana: "くるま", romaji: "kuruma", meaning: "Ô tô", hanViet: "XA", partOfSpeech: "noun" },
      { kanji: "机", hiragana: "つくえ", romaji: "tsukue", meaning: "Bàn", hanViet: "KỶ", partOfSpeech: "noun" },
      { kanji: "椅子", hiragana: "いす", romaji: "isu", meaning: "Ghế", hanViet: "Y TỬ", partOfSpeech: "noun" }
    ]
  },
  {
    lessonNumber: 3,
    level: "N5",
    title: "Bài 3",
    vocabularies: [
      { kanji: "ここ", hiragana: "ここ", romaji: "koko", meaning: "Đây", hanViet: "", partOfSpeech: "noun" },
      { kanji: "そこ", hiragana: "そこ", romaji: "soko", meaning: "Đó", hanViet: "", partOfSpeech: "noun" },
      { kanji: "あそこ", hiragana: "あそこ", romaji: "asoko", meaning: "Kia", hanViet: "", partOfSpeech: "noun" },
      { kanji: "どこ", hiragana: "どこ", romaji: "doko", meaning: "Đâu", hanViet: "", partOfSpeech: "noun" },
      { kanji: "こちら", hiragana: "こちら", romaji: "kochira", meaning: "Đây (lịch sự)", hanViet: "", partOfSpeech: "noun" },
      { kanji: "そちら", hiragana: "そちら", romaji: "sochira", meaning: "Đó (lịch sự)", hanViet: "", partOfSpeech: "noun" },
      { kanji: "あちら", hiragana: "あちら", romaji: "achira", meaning: "Kia (lịch sự)", hanViet: "", partOfSpeech: "noun" },
      { kanji: "どちら", hiragana: "どちら", romaji: "dochira", meaning: "Đâu (lịch sự)", hanViet: "", partOfSpeech: "noun" },
      { kanji: "教室", hiragana: "きょうしつ", romaji: "kyoushitsu", meaning: "Lớp học", hanViet: "GIÁO THẤT", partOfSpeech: "noun" },
      { kanji: "食堂", hiragana: "しょくどう", romaji: "shoku-dou", meaning: "Nhà ăn", hanViet: "THỰC ĐƯỜNG", partOfSpeech: "noun" },
      { kanji: "事務所", hiragana: "じむしょ", romaji: "jimusho", meaning: "Văn phòng", hanViet: "SỰ VỤ SỞ", partOfSpeech: "noun" },
      { kanji: "受付", hiragana: "うけつけ", romaji: "uketsuke", meaning: "Quầy lễ tân", hanViet: "THỤ PHÓ", partOfSpeech: "noun" },
      { kanji: "ロビー", hiragana: "", romaji: "robi-", meaning: "Sảnh", hanViet: "", partOfSpeech: "noun" },
      { kanji: "部屋", hiragana: "へや", romaji: "heya", meaning: "Phòng", hanViet: "BỘ ỐC", partOfSpeech: "noun" },
      { kanji: "トイレ", hiragana: "", romaji: "toire", meaning: "Nhà vệ sinh", hanViet: "", partOfSpeech: "noun" },
      { kanji: "階段", hiragana: "かいだん", romaji: "kaidan", meaning: "Cầu thang", hanViet: "GIAI ĐOẠN", partOfSpeech: "noun" },
      { kanji: "エレベーター", hiragana: "", romaji: "erebe-ta-", meaning: "Thang máy", hanViet: "", partOfSpeech: "noun" },
      { kanji: "エスカレーター", hiragana: "", romaji: "esukare-ta-", meaning: "Thang cuốn", hanViet: "", partOfSpeech: "noun" },
      { kanji: "自動販売機", hiragana: "じどうはんばいき", romaji: "jidoohanbai-ki", meaning: "Máy bán hàng tự động", hanViet: "TỰ ĐỘNG PHÁN MẠI CƠ", partOfSpeech: "noun" },
      { kanji: "電話", hiragana: "でんわ", romaji: "denwa", meaning: "Điện thoại", hanViet: "ĐIỆN THOẠI", partOfSpeech: "noun" },
      { kanji: "国", hiragana: "くに", romaji: "kuni", meaning: "Quốc gia", hanViet: "QUỐC", partOfSpeech: "noun" },
      { kanji: "会社", hiragana: "かいしゃ", romaji: "kaisha", meaning: "Công ty", hanViet: "HỘI XÃ", partOfSpeech: "noun" },
      { kanji: "家", hiragana: "うち", romaji: "uchi", meaning: "Nhà", hanViet: "GIA", partOfSpeech: "noun" }
    ]
  },
  {
    lessonNumber: 4,
    level: "N5",
    title: "Bài 4",
    vocabularies: [
      { kanji: "起きます", hiragana: "おきます", romaji: "okimasu", meaning: "Thức dậy", hanViet: "KHỞI", partOfSpeech: "verb" },
      { kanji: "寝ます", hiragana: "ねます", romaji: "nemasu", meaning: "Ngủ", hanViet: "TẨM", partOfSpeech: "verb" },
      { kanji: "働きます", hiragana: "はたらきます", romaji: "hatarakimasu", meaning: "Làm việc", hanViet: "ĐỘNG", partOfSpeech: "verb" },
      { kanji: "休みます", hiragana: "やすみます", romaji: "yasumimasu", meaning: "Nghỉ", hanViet: "HƯU", partOfSpeech: "verb" },
      { kanji: "勉強します", hiragana: "べんきょうします", romaji: "benkyou shimasu", meaning: "Học", hanViet: "MIỄN CƯỜNG", partOfSpeech: "verb" },
      { kanji: "終わります", hiragana: "おわります", romaji: "owarimasu", meaning: "Kết thúc", hanViet: "CHUNG", partOfSpeech: "verb" },
      { kanji: "今", hiragana: "いま", romaji: "ima", meaning: "Bây giờ", hanViet: "KIM", partOfSpeech: "noun" },
      { kanji: "～時", hiragana: "～じ", romaji: "~ji", meaning: "... giờ", hanViet: "THỜI", partOfSpeech: "suffix" },
      { kanji: "～分", hiragana: "～ふん・ぷん", romaji: "~fun/pun", meaning: "... phút", hanViet: "PHÂN", partOfSpeech: "suffix" },
      { kanji: "半", hiragana: "はん", romaji: "han", meaning: "Rưỡi", hanViet: "BÁN", partOfSpeech: "noun" },
      { kanji: "何時", hiragana: "なんじ", romaji: "nanji", meaning: "Mấy giờ", hanViet: "HÀ THỜI", partOfSpeech: "noun" },
      { kanji: "何分", hiragana: "なんぷん", romaji: "nanpun", meaning: "Mấy phút", hanViet: "HÀ PHÂN", partOfSpeech: "noun" },
      { kanji: "朝", hiragana: "あさ", romaji: "asa", meaning: "Buổi sáng", hanViet: "TRIÊU", partOfSpeech: "noun" },
      { kanji: "昼", hiragana: "ひる", romaji: "hiru", meaning: "Buổi trưa", hanViet: "TRÚ", partOfSpeech: "noun" },
      { kanji: "夜", hiragana: "よる", romaji: "yoru", meaning: "Buổi tối", hanViet: "DẠ", partOfSpeech: "noun" },
      { kanji: "一昨日", hiragana: "おととい", romaji: "ototoui", meaning: "Hôm kia", hanViet: "NHẤT TẠC NHẬT", partOfSpeech: "noun" },
      { kanji: "昨日", hiragana: "きのう", romaji: "kinou", meaning: "Hôm qua", hanViet: "TẠC NHẬT", partOfSpeech: "noun" },
      { kanji: "今日", hiragana: "きょう", romaji: "kyou", meaning: "Hôm nay", hanViet: "KIM NHẬT", partOfSpeech: "noun" },
      { kanji: "明日", hiragana: "あした", romaji: "ashita", meaning: "Ngày mai", hanViet: "MINH NHẬT", partOfSpeech: "noun" },
      { kanji: "明後日", hiragana: "あさって", romaji: "asatte", meaning: "Ngày kia", hanViet: "MINH HẬU NHẬT", partOfSpeech: "noun" },
      { kanji: "今朝", hiragana: "けさ", romaji: "kesa", meaning: "Sáng nay", hanViet: "KIM TRIÊU", partOfSpeech: "noun" },
      { kanji: "今晩", hiragana: "こんばん", romaji: "konban", meaning: "Tối nay", hanViet: "KIM VÃN", partOfSpeech: "noun" },
      { kanji: "休み", hiragana: "やすみ", romaji: "yasumi", meaning: "Ngày nghỉ", hanViet: "HƯU", partOfSpeech: "noun" }
    ]
  },
  {
    lessonNumber: 5,
    level: "N5",
    title: "Bài 5",
    vocabularies: [
      { kanji: "行きます", hiragana: "いきます", romaji: "ikimasu", meaning: "Đi", hanViet: "HÀNH", partOfSpeech: "verb" },
      { kanji: "来ます", hiragana: "きます", romaji: "kimasu", meaning: "Đến", hanViet: "LAI", partOfSpeech: "verb" },
      { kanji: "帰ります", hiragana: "かえります", romaji: "kaerimasu", meaning: "Về", hanViet: "QUY", partOfSpeech: "verb" },
      { kanji: "学校", hiragana: "がっこう", romaji: "gakkou", meaning: "Trường học", hanViet: "HỌC HIỆU", partOfSpeech: "noun" },
      { kanji: "スーパー", hiragana: "", romaji: "su-pa-", meaning: "Siêu thị", hanViet: "", partOfSpeech: "noun" },
      { kanji: "駅", hiragana: "えき", romaji: "eki", meaning: "Nhà ga", hanViet: "DỊCH", partOfSpeech: "noun" },
      { kanji: "飛行機", hiragana: "ひこうき", romaji: "hikouki", meaning: "Máy bay", hanViet: "PHI HÀNH CƠ", partOfSpeech: "noun" },
      { kanji: "船", hiragana: "ふね", romaji: "fune", meaning: "Tàu thuy", hanViet: "THUYỀN", partOfSpeech: "noun" },
      { kanji: "電車", hiragana: "でんしゃ", romaji: "densha", meaning: "Tàu điện", hanViet: "ĐIỆN XA", partOfSpeech: "noun" },
      { kanji: "地下鉄", hiragana: "ちかてつ", romaji: "chikatetsu", meaning: "Tàu điện ngầm", hanViet: "ĐỊA HẠ THIẾT", partOfSpeech: "noun" },
      { kanji: "新幹線", hiragana: "しんかんせん", romaji: "shinkansen", meaning: "Tàu Shinkansen", hanViet: "TÂN CÁN TUYẾN", partOfSpeech: "noun" },
      { kanji: "バス", hiragana: "", romaji: "basu", meaning: "Xe buýt", hanViet: "", partOfSpeech: "noun" },
      { kanji: "タクシー", hiragana: "", romaji: "takushii", meaning: "Taxi", hanViet: "", partOfSpeech: "noun" },
      { kanji: "自転車", hiragana: "じてんしゃ", romaji: "jitensya", meaning: "Xe đạp", hanViet: "TỰ CHUYỂN XA", partOfSpeech: "noun" },
      { kanji: "歩いて", hiragana: "あるいて", romaji: "aruite", meaning: "Đi bộ", hanViet: "BỘ", partOfSpeech: "verb" },
      { kanji: "人", hiragana: "ひと", romaji: "hito", meaning: "Người", hanViet: "NHÂN", partOfSpeech: "noun" },
      { kanji: "友達", hiragana: "ともだち", romaji: "tomodachi", meaning: "Bạn", hanViet: "HỮU ĐẠT", partOfSpeech: "noun" },
      { kanji: "彼", hiragana: "かれ", romaji: "kare", meaning: "Anh ấy", hanViet: "BỈ", partOfSpeech: "pronoun" },
      { kanji: "彼女", hiragana: "かのじょ", romaji: "kanojo", meaning: "Cô ấy", hanViet: "BỈ NỮ", partOfSpeech: "pronoun" },
      { kanji: "家族", hiragana: "かぞく", romaji: "kazoku", meaning: "Gia đình", hanViet: "GIA TỘC", partOfSpeech: "noun" },
      { kanji: "一人で", hiragana: "ひとりで", romaji: "hitoride", meaning: "Một mình", hanViet: "NHẤT NHÂN", partOfSpeech: "adverb" },
      { kanji: "先週", hiragana: "せんしゅう", romaji: "senshuu", meaning: "Tuần trước", hanViet: "TIÊN CHU", partOfSpeech: "noun" },
      { kanji: "今週", hiragana: "こんしゅう", romaji: "konshuu", meaning: "Tuần này", hanViet: "KIM CHU", partOfSpeech: "noun" },
      { kanji: "来週", hiragana: "らいしゅう", romaji: "raishuu", meaning: "Tuần sau", hanViet: "LAI CHU", partOfSpeech: "noun" },
      { kanji: "何曜日", hiragana: "なんようび", romaji: "nanyoubi", meaning: "Thứ mấy", hanViet: "HÀ DIỆU NHẬT", partOfSpeech: "noun" }
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