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
  },
  {
    lessonNumber: 6,
    level: "N5",
    title: "Bài 6",
    vocabularies: [
      { kanji: "食べます", hiragana: "たべます", romaji: "tabemasu", meaning: "Ăn", hanViet: "THỰC", partOfSpeech: "verb" },
      { kanji: "飲みます", hiragana: "のみます", romaji: "nomimasu", meaning: "Uống", hanViet: "ẨM", partOfSpeech: "verb" },
      { kanji: "吸います", hiragana: "すいます", romaji: "suimasu", meaning: "[thuốc lá] Phút", hanViet: "HẤP", partOfSpeech: "verb" },
      { kanji: "見ます", hiragana: "みます", romaji: "mimasu", meaning: "Nhìn, xem", hanViet: "KIẾN", partOfSpeech: "verb" },
      { kanji: "聞きます", hiragana: "ききます", romaji: "kikimasu", meaning: "Nghe", hanViet: "VĂN", partOfSpeech: "verb" },
      { kanji: "読みます", hiragana: "よみます", romaji: "yomimasu", meaning: "Đọc", hanViet: "ĐỘC", partOfSpeech: "verb" },
      { kanji: "書きます", hiragana: "かきます", romaji: "kakimasu", meaning: "Viết, vẽ", hanViet: "THƯ", partOfSpeech: "verb" },
      { kanji: "買います", hiragana: "かいます", romaji: "kaimasu", meaning: "Mua", hanViet: "MÃI", partOfSpeech: "verb" },
      { kanji: "撮ります", hiragana: "とります", romaji: "torimasu", meaning: "[ảnh] Chụp", hanViet: "TOÁT", partOfSpeech: "verb" },
      { kanji: "します", hiragana: "します", romaji: "shimasu", meaning: "Làm, chơi", hanViet: "", partOfSpeech: "verb" },
      { kanji: "会います", hiragana: "あいます", romaji: "aimasu", meaning: "[bạn] Gặp", hanViet: "HỘI", partOfSpeech: "verb" },
      { kanji: "ご飯", hiragana: "ごはん", romaji: "gohan", meaning: "Cơm, bữa ăn", hanViet: "", partOfSpeech: "noun" },
      { kanji: "朝ご飯", hiragana: "あさごはん", romaji: "asagohan", meaning: "Cơm sáng", hanViet: "TRIỀU PHẠN", partOfSpeech: "noun" },
      { kanji: "昼ご飯", hiragana: "ひるごはん", romaji: "hirugohan", meaning: "Cơm trưa", hanViet: "TRÚ PHẠN", partOfSpeech: "noun" },
      { kanji: "晩ご飯", hiragana: "ばんごはん", romaji: "bangohan", meaning: "Cơm tối", hanViet: "VÃN PHẠN", partOfSpeech: "noun" },
      { kanji: "パン", hiragana: "パン", romaji: "pan", meaning: "Bánh mì", hanViet: "", partOfSpeech: "noun" },
      { kanji: "卵", hiragana: "たまご", romaji: "tamago", meaning: "Trứng", hanViet: "NOÃN", partOfSpeech: "noun" },
      { kanji: "肉", hiragana: "にく", romaji: "niku", meaning: "Thịt", hanViet: "NHỤC", partOfSpeech: "noun" },
      { kanji: "魚", hiragana: "さかな", romaji: "sakana", meaning: "Cá", hanViet: "NGƯ", partOfSpeech: "noun" },
      { kanji: "野菜", hiragana: "やさい", romaji: "yasai", meaning: "Rau", hanViet: "DÃ THÁI", partOfSpeech: "noun" },
      { kanji: "果物", hiragana: "くだもの", romaji: "kudamono", meaning: "Hoa quả, trái cây", hanViet: "QUẢ VẬT", partOfSpeech: "noun" },
      { kanji: "水", hiragana: "みず", romaji: "mizu", meaning: "Nước", hanViet: "THỦY", partOfSpeech: "noun" },
      { kanji: "お茶", hiragana: "おちゃ", romaji: "ocha", meaning: "Trà, nước chè", hanViet: "TRÀ", partOfSpeech: "noun" },
      { kanji: "紅茶", hiragana: "こうちゃ", romaji: "koucha", meaning: "Trà hồng (hồng trà)", hanViet: "HỒNG TRÀ", partOfSpeech: "noun" },
      { kanji: "牛乳", hiragana: "ぎゅうにゅう", romaji: "gyuunyuu", meaning: "Sữa bò", hanViet: "NGƯU NHŨ", partOfSpeech: "noun" },
      { kanji: "ジュース", hiragana: "ジュース", romaji: "juusu", meaning: "Nước trái cây", hanViet: "", partOfSpeech: "noun" },
      { kanji: "ビール", hiragana: "ビール", romaji: "biiru", meaning: "Bia", hanViet: "", partOfSpeech: "noun" },
      { kanji: "お酒", hiragana: "おさけ", romaji: "osake", meaning: "Rượu, rượu sake", hanViet: "TỬU", partOfSpeech: "noun" },
      { kanji: "ビデオ", hiragana: "ビデオ", romaji: "bideo", meaning: "Video", hanViet: "", partOfSpeech: "noun" },
      { kanji: "映画", hiragana: "えいが", romaji: "eiga", meaning: "Phim, điện ảnh", hanViet: "ÁNH HỌA", partOfSpeech: "noun" },
      { kanji: "CD", hiragana: "CD", romaji: "CD", meaning: "Đĩa CD", hanViet: "", partOfSpeech: "noun" },
      { kanji: "手紙", hiragana: "てがみ", romaji: "tegami", meaning: "Thư", hanViet: "THỦ CHỈ", partOfSpeech: "noun" },
      { kanji: "レポート", hiragana: "レポート", romaji: "repooto", meaning: "Báo cáo", hanViet: "", partOfSpeech: "noun" },
      { kanji: "写真", hiragana: "しゃしん", romaji: "shashin", meaning: "Ảnh", hanViet: "TẢ CHÂN", partOfSpeech: "noun" },
      { kanji: "店", hiragana: "みせ", romaji: "mise", meaning: "Cửa hàng, tiệm", hanViet: "ĐIẾM", partOfSpeech: "noun" },
      { kanji: "レストラン", hiragana: "レストラン", romaji: "resutoran", meaning: "Nhà hàng", hanViet: "", partOfSpeech: "noun" },
      { kanji: "庭", hiragana: "にわ", romaji: "niwa", meaning: "Vườn", hanViet: "ĐÌNH", partOfSpeech: "noun" },
      { kanji: "宿題", hiragana: "しゅくだい", romaji: "shukudai", meaning: "Bài tập về nhà", hanViet: "TÚC ĐỀ", partOfSpeech: "noun" },
      { kanji: "テニス", hiragana: "テニス", romaji: "tenisu", meaning: "Tennis", hanViet: "", partOfSpeech: "noun" },
      { kanji: "サッカー", hiragana: "サッカー", romaji: "sakkaa", meaning: "Bóng đá", hanViet: "", partOfSpeech: "noun" },
      { kanji: "お花見", hiragana: "おはなみ", romaji: "ohanami", meaning: "Việc ngắm hoa anh đào", hanViet: "HOA KIẾN", partOfSpeech: "noun" },
      { kanji: "何", hiragana: "なに", romaji: "nani", meaning: "Cái gì", hanViet: "HÀ", partOfSpeech: "pronoun" },
      { kanji: "一緒に", hiragana: "いっしょに", romaji: "isshoni", meaning: "Cùng nhau", hanViet: "NHẤT TỬ", partOfSpeech: "adverb" },
      { kanji: "少し", hiragana: "ちょっと", romaji: "chotto", meaning: "Một chút, một lát", hanViet: "THIỂU", partOfSpeech: "adverb" },
      { kanji: "いつも", hiragana: "いつも", romaji: "itsumo", meaning: "Luôn luôn, lúc nào cũng", hanViet: "", partOfSpeech: "adverb" },
      { kanji: "時々", hiragana: "ときどき", romaji: "tokidoki", meaning: "Thỉnh thoảng", hanViet: "THỜI", partOfSpeech: "adverb" },
      { kanji: "それから", hiragana: "それから", romaji: "sorekara", meaning: "Sau đó, tiếp theo", hanViet: "", partOfSpeech: "conjunction" },
      { kanji: "ええ", hiragana: "ええ", romaji: "ee", meaning: "Vâng, ừ (cách nói thân mật)", hanViet: "", partOfSpeech: "interjection" },
      { kanji: "いいですね", hiragana: "いいですね", romaji: "iidesune", meaning: "Được đấy nhỉ / Hay quá nhỉ", hanViet: "", partOfSpeech: "phrase" },
      { kanji: "分かりました", hiragana: "わかりました", romaji: "wakarimashita", meaning: "Tôi hiểu rồi / Vâng ạ", hanViet: "PHÂN", partOfSpeech: "phrase" },
      { kanji: "何ですか", hiragana: "なんですか", romaji: "nandesuka", meaning: "Có chuyện gì thế?", hanViet: "HÀ", partOfSpeech: "phrase" },
      { kanji: "じゃ、また", hiragana: "じゃ、また", romaji: "ja, mata", meaning: "Hẹn gặp lại [ngày mai]", hanViet: "", partOfSpeech: "phrase" }
    ]
  },
  {
    lessonNumber: 7,
    level: "N5",
    title: "Bài 7",
    vocabularies: [
      { kanji: "泳ぎます", hiragana: "およぎます", romaji: "oyogimasu", meaning: "Bơi", hanViet: "ỒNG", partOfSpeech: "verb" },
      { kanji: "あつめます", hiragana: "あつめます", romaji: "atsumemasu", meaning: "Sưu tập", hanViet: "TỤ", partOfSpeech: "verb" },
      { kanji: "整理します", hiragana: "せいりします", romaji: "seerishimasu", meaning: "Sắp xếp", hanViet: "CHUNG LÝ", partOfSpeech: "verb" },
      { kanji: "掃除します", hiragana: "そうじします", romaji: "soujishimasu", meaning: "Dọn dẹp", hanViet: "SẠO", partOfSpeech: "verb" },
      { kanji: "洗います", hiragana: "あらいます", romaji: "araimasu", meaning: "Rửa", hanViet: "TẨM", partOfSpeech: "verb" },
      { kanji: "乗ります", hiragana: "のります", romaji: "norimasu", meaning: "Lên, đi", hanViet: "SƯỢNG", partOfSpeech: "verb" },
      { kanji: "降ります", hiragana: "おります", romaji: "orimasu", meaning: "Xuống", hanViet: "GIẢNG", partOfSpeech: "verb" },
      { kanji: "届けます", hiragana: "とどけます", romaji: "todokemasu", meaning: "Giao hàng", hanViet: "ĐỘN", partOfSpeech: "verb" },
      { kanji: "案内します", hiragana: "あんないします", romaji: "annai-shimasu", meaning: "Hướng dẫn", hanViet: "ÁN NỘI", partOfSpeech: "verb" },
      { kanji: "もう一度", hiragana: "もういちど", romaji: "mouichido", meaning: "Một lần nữa", hanViet: "TƯỚNG NHẤT ĐỘ", partOfSpeech: "adverb" },
      { kanji: "また", hiragana: "また", romaji: "mata", meaning: "Lại nữa", hanViet: "", partOfSpeech: "adverb" },
      { kanji: "そうですね", hiragana: "そうですね", romaji: "soudesune", meaning: "Đúng vậy nhỉ", hanViet: "", partOfSpeech: "phrase" },
      { kanji: "でも", hiragana: "でも", romaji: "demo", meaning: "Nhưng", hanViet: "", partOfSpeech: "conjunction" },
      { kanji: "でしょう", hiragana: "でしょう", romaji: "deshou", meaning: "Chắc chắn", hanViet: "THẤT", partOfSpeech: "phrase" },
      { kanji: "かもしれません", hiragana: "かもしれません", romaji: "kamoshiremasen", meaning: "Có thể", hanViet: "CƠ", partOfSpeech: "phrase" },
      { kanji: "だから", hiragana: "だから", romaji: "dakara", meaning: "Vì vậy", hanViet: "TƯỚNG", partOfSpeech: "conjunction" },
      { kanji: "だけど", hiragana: "だけど", romaji: "dakedo", meaning: "Nhưng", hanViet: "CHỈ", partOfSpeech: "conjunction" },
      { kanji: "それでは", hiragana: "それでは", romaji: "soredewa", meaning: "Vậy thì", hanViet: "", partOfSpeech: "phrase" },
      { kanji: "そうしました", hiragana: "そうしました", romaji: "sou shimashita", meaning: "Làm vậy rồi", hanViet: "TƯỚNG", partOfSpeech: "verb" }
    ]
  },
  {
    lessonNumber: 8,
    level: "N5",
    title: "Bài 8",
    vocabularies: [
      { kanji: "あります", hiragana: "あります", romaji: "arimasu", meaning: "Có (đối tượng vật)", hanViet: "NHƯ", partOfSpeech: "verb" },
      { kanji: "います", hiragana: "います", romaji: "imasu", meaning: "Có (đối tượng người, động vật)", hanViet: "NHƯ", partOfSpeech: "verb" },
      { kanji: "ある", hiragana: "ある", romaji: "aru", meaning: "Có (đối tượng vật)", hanViet: "NHƯ", partOfSpeech: "verb" },
      { kanji: "いる", hiragana: "いる", romaji: "iru", meaning: "Có (đối tượng người, động vật)", hanViet: "NHƯ", partOfSpeech: "verb" },
      { kanji: "ありますか", hiragana: "ありますか", romaji: "arimasuka", meaning: "Có không?", hanViet: "NHƯ", partOfSpeech: "verb" },
      { kanji: "いますか", hiragana: "いますか", romaji: "imasuka", meaning: "Có không?", hanViet: "NHƯ", partOfSpeech: "verb" },
      { kanji: "どこに", hiragana: "どこに", romaji: "dokoni", meaning: "Ở đâu", hanViet: "ĐỊA", partOfSpeech: "adverb" },
      { kanji: "どこにありますか", hiragana: "どこにありますか", romaji: "dokoni arimasuka", meaning: "Ở đâu?", hanViet: "ĐỊA", partOfSpeech: "phrase" },
      { kanji: "どこにいますか", hiragana: "どこにいますか", romaji: "dokoni imasuka", meaning: "Ở đâu?", hanViet: "ĐỊA", partOfSpeech: "phrase" },
      { kanji: "近く", hiragana: "ちかく", romaji: "chikaku", meaning: "Gần", hanViet: "CẠNH", partOfSpeech: "noun" },
      { kanji: "前", hiragana: "まえ", romaji: "mae", meaning: "Trước", hanViet: "TIỀN", partOfSpeech: "noun" },
      { kanji: "後ろ", hiragana: "うしろ", romaji: "ushiro", meaning: "Sau", hanViet: "HẬU", partOfSpeech: "noun" },
      { kanji: "右", hiragana: "みぎ", romaji: "migi", meaning: "Phải", hanViet: "HỮU", partOfSpeech: "noun" },
      { kanji: "左", hiragana: "ひだり", romaji: "hidari", meaning: "Trái", hanViet: "TẢI", partOfSpeech: "noun" },
      { kanji: "間", hiragana: "あいだ", romaji: "aida", meaning: "Giữa", hanViet: "GIAN", partOfSpeech: "noun" },
      { kanji: "中", hiragana: "なか", romaji: "naka", meaning: "Trong", hanViet: "TRUNG", partOfSpeech: "noun" },
      { kanji: "下", hiragana: "した", romaji: "shita", meaning: "Dưới", hanViet: "HẠ", partOfSpeech: "noun" },
      { kanji: "上", hiragana: "うえ", romaji: "ue", meaning: "Trên", hanViet: "THƯỢNG", partOfSpeech: "noun" },
      { kanji: "近くにあります", hiragana: "ちかくにあります", romaji: "chikaku ni arimasu", meaning: "Gần đây", hanViet: "CẠNH", partOfSpeech: "phrase" }
    ]
  },
  {
    lessonNumber: 9,
    level: "N5",
    title: "Bài 9",
    vocabularies: [
      { kanji: "いちばん", hiragana: "いちばん", romaji: "ichiban", meaning: "Nhất", hanViet: "NHẤT", partOfSpeech: "adverb" },
      { kanji: "一番", hiragana: "いちばん", romaji: "ichiban", meaning: "Nhất", hanViet: "NHẤT", partOfSpeech: "adverb" },
      { kanji: "大きい", hiragana: "おおきい", romaji: "ookii", meaning: "Lớn", hanViet: "ĐẠI", partOfSpeech: "adjective" },
      { kanji: "小さい", hiragana: "ちいさい", romaji: "chiisai", meaning: "Nhỏ", hanViet: "TIỂU", partOfSpeech: "adjective" },
      { kanji: "多い", hiragana: "おおい", romaji: "ooi", meaning: "Nhiều", hanViet: "ĐA", partOfSpeech: "adjective" },
      { kanji: "少ない", hiragana: "すくない", romaji: "sukunai", meaning: "Ít", hanViet: "THIẾU", partOfSpeech: "adjective" },
      { kanji: "新しい", hiragana: "あたらしい", romaji: "atarashii", meaning: "Mới", hanViet: "TÂN", partOfSpeech: "adjective" },
      { kanji: "古い", hiragana: "ふるい", romaji: "furui", meaning: "Cũ", hanViet: "CỔ", partOfSpeech: "adjective" },
      { kanji: "いい", hiragana: "いい", romaji: "ii", meaning: "Tốt", hanViet: "", partOfSpeech: "adjective" },
      { kanji: "悪い", hiragana: "わるい", romaji: "warui", meaning: "Xấu", hanViet: "ÁCH", partOfSpeech: "adjective" },
      { kanji: "暗い", hiragana: "くらい", romaji: "kurai", meaning: "Tối", hanViet: "ẨM", partOfSpeech: "adjective" },
      { kanji: "明るい", hiragana: "あかるい", romaji: "akarui", meaning: "Sáng", hanViet: "MINH", partOfSpeech: "adjective" },
      { kanji: "広い", hiragana: "ひろい", romaji: "hiroi", meaning: "Rộng", hanViet: "QUỐC", partOfSpeech: "adjective" },
      { kanji: "狭い", hiragana: "せまい", romaji: "semai", meaning: "Hẹp", hanViet: "HIỀM", partOfSpeech: "adjective" },
      { kanji: "たかい", hiragana: "たかい", romaji: "takai", meaning: "Cao", hanViet: "THÁNH", partOfSpeech: "adjective" },
      { kanji: "低い", hiragana: "ひくい", romaji: "hikui", meaning: "Thấp", hanViet: "ĐẬT", partOfSpeech: "adjective" },
      { kanji: "重い", hiragana: "おもしろい", romaji: "omoshiroi", meaning: "Nặng, thú vị", hanViet: "TRỌNG", partOfSpeech: "adjective" },
      { kanji: "軽い", hiragana: "かるい", romaji: "karui", meaning: "Nhẹ", hanViet: "KHẢI", partOfSpeech: "adjective" },
      { kanji: "忙しい", hiragana: "いそがしい", romaji: "isogashii", meaning: "Bận", hanViet: "BANG", partOfSpeech: "adjective" },
      { kanji: "楽しい", hiragana: "たのしい", romaji: "tanoshii", meaning: "Vui", hanViet: "LAC", partOfSpeech: "adjective" },
      { kanji: "面白い", hiragana: "おもしろい", romaji: "omoshiroi", meaning: "Thú vị", hanViet: "DIỆN", partOfSpeech: "adjective" },
      { kanji: "つまらない", hiragana: "つまらない", romaji: "tsumaranai", meaning: "Nhàm chán", hanViet: "TỰ", partOfSpeech: "adjective" },
      { kanji: "ほしい", hiragana: "ほしい", romaji: "hoshii", meaning: "Muốn", hanViet: "VỊ", partOfSpeech: "adjective" },
      { kanji: "ふるい", hiragana: "ふるい", romaji: "furui", meaning: "Cũ", hanViet: "CỔ", partOfSpeech: "adjective" }
    ]
  },
  {
    lessonNumber: 10,
    level: "N5",
    title: "Bài 10",
    vocabularies: [
      { kanji: "てんき", hiragana: "てんき", romaji: "tenki", meaning: "Thời tiết", hanViet: "THIÊN KHÍ", partOfSpeech: "noun" },
      { kanji: "天気", hiragana: "てんき", romaji: "tenki", meaning: "Thời tiết", hanViet: "THIÊN KHÍ", partOfSpeech: "noun" },
      { kanji: "晴れ", hiragana: "はれ", romaji: "hare", meaning: "Trời nắng", hanViet: "TƯƠNG", partOfSpeech: "noun" },
      { kanji: "雨", hiragana: "あめ", romaji: "ame", meaning: "Mưa", hanViet: "VŨ", partOfSpeech: "noun" },
      { kanji: "雪", hiragana: "ゆき", romaji: "yuki", meaning: "Tuyết", hanViet: "TUYẾT", partOfSpeech: "noun" },
      { kanji: "曇り", hiragana: "くもり", romaji: "kumori", meaning: "Trời mây", hanViet: "ĐỘNG", partOfSpeech: "noun" },
      { kanji: "暑い", hiragana: "あつい", romaji: "atsui", meaning: "Nóng", hanViet: "NHIỄM", partOfSpeech: "adjective" },
      { kanji: "寒い", hiragana: "さむい", romaji: "samui", meaning: "Lạnh", hanViet: "HAN", partOfSpeech: "adjective" },
      { kanji: "涼しい", hiragana: "すずしい", romaji: "suzushii", meaning: "Mát", hanViet: "LƯƠNG", partOfSpeech: "adjective" },
      { kanji: "あたたかい", hiragana: "あたたかい", romaji: "atataka", meaning: "Ấm", hanViet: "NHIỆT", partOfSpeech: "adjective" },
      { kanji: "すき", hiragana: "すき", romaji: "suki", meaning: "Thích", hanViet: "THÍCH", partOfSpeech: "adjective" },
      { kanji: "きらい", hiragana: "きらい", romaji: "kirai", meaning: "Ghét", hanViet: "SỠ", partOfSpeech: "adjective" },
      { kanji: "ぐあん", hiragana: "ぐあん", romaji: "gu-an", meaning: "Bất ngờ", hanViet: "NGỘ", partOfSpeech: "noun" },
      { kanji: "ふつか", hiragana: "ふつか", romaji: "futsuka", meaning: "Ngày làm việc", hanViet: "PHẤT", partOfSpeech: "noun" },
      { kanji: "かぶとか", hiragana: "かぶとか", romaji: "kabutaka", meaning: "Ngày nghỉ", hanViet: "BÁT", partOfSpeech: "noun" }
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

console.log('✅ Created vocabulary data for lessons 1-10 with furigana support');
