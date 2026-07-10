import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data', 'grammar');

mkdirSync(dataDir, { recursive: true });

const lessons = [
  {
    lessonNumber: 1, level: "N5",
    title: "Câu danh từ cơ bản",
    title_jp: "名詞文の基本",
    description: "Cấu trúc câu danh từ, khẳng định, phủ định, nghi vấn và trợ từ も.",
    grammars: [
      { id: "m1_01", title: "Câu khẳng định は〜です", pattern: "〜は〜です", meaning: "A là B", explanation: "**Cấu trúc câu cơ bản nhất trong tiếng Nhật.**\n\n- **は** là trợ từ đánh dấu chủ đề của câu.\n- **です** là trợ động từ thể lịch sự, có nghĩa \"thì/là\".\n\nDùng để giới thiệu hoặc miêu tả một người/vật.", structure: "**[Danh từ 1] は [Danh từ 2] です**", examples: [{ japanese: "私は学生です。", vietnamese: "Tôi là học sinh." }, { japanese: "これは本です。", vietnamese: "Đây là quyển sách." }], category: "basic_sentence_structure" },
      { id: "m1_02", title: "Câu phủ định は〜じゃありません", pattern: "〜は〜じゃありません", meaning: "A không phải là B", explanation: "**Phủ định của câu danh từ.**\n\nDùng **ではありません** hoặc **じゃありません** (thân mật hơn) thay cho **です** để tạo câu phủ định.", structure: "**[Danh từ 1] は [Danh từ 2] ではありません / じゃありません**", examples: [{ japanese: "私は学生ではありません。", vietnamese: "Tôi không phải là học sinh." }, { japanese: "これは本じゃありません。", vietnamese: "Đây không phải là quyển sách." }], category: "negative_form" },
      { id: "m1_03", title: "Câu nghi vấn は〜ですか", pattern: "〜は〜ですか", meaning: "A có phải là B không?", explanation: "**Thêm か vào cuối câu để tạo câu hỏi.**\n\n- か là trợ từ nghi vấn đặt cuối câu.\n- Trả lời: はい、〜です。/ いいえ、〜ではありません。", structure: "**[Danh từ 1] は [Danh từ 2] ですか**", examples: [{ japanese: "あなたは学生ですか。", vietnamese: "Bạn có phải là học sinh không?" }, { japanese: "これは本ですか。", vietnamese: "Đây có phải là quyển sách không?" }], category: "questions" },
      { id: "m1_04", title: "Trợ từ も - Cũng vậy", pattern: "〜も〜", meaning: "cũng là ~", explanation: "**も thay thế は, có nghĩa \"cũng\".**\n\nĐặt ngay sau danh từ chủ đề, nghĩa là \"cũng\".", structure: "**[Danh từ] も [Danh từ] です**", examples: [{ japanese: "私も学生です。", vietnamese: "Tôi cũng là học sinh." }, { japanese: "これも本です。", vietnamese: "Đây cũng là quyển sách." }], category: "basic_sentence_structure" }
    ]
  },
  {
    lessonNumber: 2, level: "N5",
    title: "Chỉ định từ và sở hữu",
    title_jp: "こそあど言葉と所有",
    description: "Các đại từ chỉ định これ・それ・あれ, この・その・あの và trợ từ の.",
    grammars: [
      { id: "m2_01", title: "Đây/Đó/Kia - これ・それ・あれ", pattern: "これ / それ / あれ", meaning: "đây / đó / kia", explanation: "**Ba đại từ chỉ vật:**\n- **これ**: vật gần người nói (đây)\n- **それ**: vật gần người nghe (đó)\n- **あれ**: vật xa cả hai người (kia)", structure: "**これ / それ / あれ は [Danh từ] です**", examples: [{ japanese: "これは本です。", vietnamese: "Đây là quyển sách." }, { japanese: "それは鉛筆ですか。", vietnamese: "Đó có phải là bút chì không?" }, { japanese: "あれは車です。", vietnamese: "Kia là xe hơi." }], category: "demonstratives" },
      { id: "m2_02", title: "Danh từ này/đó/kia - この・その・あの", pattern: "この / その / あの + [Danh từ]", meaning: "danh từ này / đó / kia", explanation: "**Ba từ chỉ định bổ nghĩa danh từ:**\n- **この**: danh từ gần người nói\n- **その**: danh từ gần người nghe\n- **あの**: danh từ xa cả hai", structure: "**この / その / あの [Danh từ] は [Mô tả] です**", examples: [{ japanese: "この本は私の本です。", vietnamese: "Quyển sách này là sách của tôi." }, { japanese: "その鉛筆は誰のですか。", vietnamese: "Cây bút chì đó của ai vậy?" }], category: "demonstratives" },
      { id: "m2_03", title: "そうです / そうじゃありません", pattern: "そうです / そうじゃありません", meaning: "đúng vậy / không phải vậy", explanation: "**Dùng そうです để trả lời \"đúng vậy\" và そうじゃありません để nói \"không phải vậy\".**\n\nLà cách trả lời ngắn gọn cho câu hỏi danh từ.", structure: "**そうです** (đúng vậy)\n**そうじゃありません** (không phải vậy)", examples: [{ japanese: "- 田中さんですか。 はい、そうです。", vietnamese: "- Có phải anh Tanaka không? Vâng, đúng ạ." }, { japanese: "- 先生ですか。 いいえ、そうじゃありません。", vietnamese: "- Có phải giáo viên không? Không, không phải." }], category: "questions" },
      { id: "m2_04", title: "Trợ từ sở hữu の", pattern: "〜の〜", meaning: "của (sở hữu)", explanation: "**の là trợ từ sở hữu, nối hai danh từ.**\n\nDanh từ đứng trước の bổ nghĩa cho danh từ đứng sau.", structure: "**[Danh từ 1] の [Danh từ 2]**", examples: [{ japanese: "私の本です。", vietnamese: "Quyển sách của tôi." }, { japanese: "これは私の本です。", vietnamese: "Đây là quyển sách của tôi." }], category: "possessive" }
    ]
  },
  {
    lessonNumber: 3, level: "N5",
    title: "Địa điểm và danh từ",
    title_jp: "場所と名詞",
    description: "Các đại từ chỉ địa điểm: ここ・そこ・あそこ・こちら・そちら・あちら.",
    grammars: [
      { id: "m3_01", title: "Ở đây/đó/kia - ここ・そこ・あそこ", pattern: "ここ / そこ / あそこ", meaning: "ở đây / ở đó / ở kia", explanation: "**Ba đại từ chỉ địa điểm:**\n- **ここ**: nơi gần người nói (ở đây)\n- **そこ**: nơi gần người nghe (ở đó)\n- **あそこ**: nơi xa cả hai (ở kia)", structure: "**[Địa điểm] は ここ / そこ / あそこ です**", examples: [{ japanese: "トイレはあそこです。", vietnamese: "Nhà vệ sinh ở kia." }, { japanese: "ここは学校です。", vietnamese: "Ở đây là trường học." }], category: "location_words" },
      { id: "m3_02", title: "Hướng này/đó/kia - こちら・そちら・あちら", pattern: "こちら / そちら / あちら", meaning: "phía này / phía đó / phía kia (lịch sự)", explanation: "**Ba đại từ chỉ hướng - lịch sự hơn ここ・そこ・あそこ:**\n- **こちら**: phía này (lịch sự)\n- **そちら**: phía đó (lịch sự)\n- **あちら**: phía kia (lịch sự)\n\nDùng trong giao tiếp trang trọng.", structure: "**[Địa điểm] は こちら / そちら / あちら です**", examples: [{ japanese: "事務所はこちらです。", vietnamese: "Văn phòng ở phía này." }, { japanese: "出口はあちらです。", vietnamese: "Lối ra ở phía kia." }], category: "location_words" },
      { id: "m3_03", title: "Danh từ chỉ nơi chốn", pattern: "〜は〜です", meaning: "[Địa điểm] là ~", explanation: "**Dùng cấu trúc danh từ cơ bản để giới thiệu địa điểm.**\n\nCách hỏi: 〜はどこですか (~ ở đâu?).", structure: "**[Địa điểm] は [Nơi chốn] です**\n**[Địa điểm] は どこですか**", examples: [{ japanese: "学校はどこですか。", vietnamese: "Trường học ở đâu?" }, { japanese: "図書館はあそこです。", vietnamese: "Thư viện ở kia." }], category: "location_words" }
    ]
  },
  {
    lessonNumber: 4, level: "N5",
    title: "Thời gian và động từ ます形",
    title_jp: "時間と動詞のます形",
    description: "Cách nói giờ, thời gian và động từ thể ます (khẳng định, phủ định, quá khứ).",
    grammars: [
      { id: "m4_01", title: "Cách nói giờ - 〜時〜分", pattern: "〜時〜分です", meaning: "bây giờ là ~ giờ ~ phút", explanation: "**Số đếm + 時 (giờ) + 分 (phút).**\n\nChú ý cách đọc đặc biệt: 4時 (よじ), 7時 (しちじ), 9時 (くじ).", structure: "**[Số] 時 [Số] 分です**", examples: [{ japanese: "今は3時です。", vietnamese: "Bây giờ là 3 giờ." }, { japanese: "7時30分に起きます。", vietnamese: "Tôi thức dậy lúc 7 giờ 30." }], notes: "Cách đọc đặc biệt: 4時 (よじ), 7時 (しちじ), 9時 (くじ). 1分 (いっぷん), 3分 (さんぷん), 4分 (よんぷん), 6分 (ろっぷん).", category: "time_telling" },
      { id: "m4_02", title: "Từ chỉ thời gian: 今・今日・明日…", pattern: "今 / 今日 / 明日 / 昨日 / 毎日", meaning: "bây giờ / hôm nay / ngày mai / hôm qua / mỗi ngày", explanation: "**Các từ chỉ thời gian tương đối không dùng に.**\n- 今 (いま): bây giờ\n- 今日 (きょう): hôm nay\n- 明日 (あした): ngày mai\n- 昨日 (きのう): hôm qua\n- 毎日 (まいにち): mỗi ngày", structure: "**[Từ chỉ thời gian] [Động từ]** (không dùng に)", examples: [{ japanese: "今7時です。", vietnamese: "Bây giờ là 7 giờ." }, { japanese: "明日学校へ行きます。", vietnamese: "Ngày mai tôi đi học." }], category: "time" },
      { id: "m4_03", title: "Trợ từ 〜から〜まで", pattern: "〜から〜まで", meaning: "từ ~ đến ~", explanation: "**から chỉ điểm bắt đầu, まで chỉ điểm kết thúc.**\n\nDùng cho cả thời gian và không gian.", structure: "**[Điểm bắt đầu] から [Điểm kết thúc] まで**", examples: [{ japanese: "9時から5時まで働きます。", vietnamese: "Tôi làm việc từ 9 giờ đến 5 giờ." }, { japanese: "大阪から東京まで新幹線で行きます。", vietnamese: "Tôi đi từ Osaka đến Tokyo bằng tàu Shinkansen." }], category: "time" },
      { id: "m4_04", title: "Động từ thể ます・ません・ました・ませんでした", pattern: "〜ます / 〜ません / 〜ました / 〜ませんでした", meaning: "làm / không làm / đã làm / đã không làm", explanation: "**Các dạng của động từ thể lịch sự:**\n- **ます**: hiện tại/tương lai khẳng định\n- **ません**: hiện tại/tương lai phủ định\n- **ました**: quá khứ khẳng định\n- **ませんでした**: quá khứ phủ định", structure: "**[Thân động từ] + ます / ません / ました / ませんでした**", examples: [{ japanese: "毎日勉強します。", vietnamese: "Mỗi ngày tôi đều học." }, { japanese: "昨日勉強しませんでした。", vietnamese: "Hôm qua tôi đã không học." }], category: "verb_forms" }
    ]
  },
  {
    lessonNumber: 5, level: "N5",
    title: "Động từ di chuyển và trợ từ",
    title_jp: "移動動詞と助詞",
    description: "Động từ di chuyển: 行きます・来ます・帰ります, trợ từ へ, で, を, なんで.",
    grammars: [
      { id: "m5_01", title: "Động từ di chuyển 行きます・来ます・帰ります", pattern: "行きます / 来ます / 帰ります", meaning: "đi / đến / về", explanation: "**Ba động từ di chuyển cơ bản:**\n- **行きます** (いきます): đi\n- **来ます** (きます): đến\n- **帰ります** (かえります): về\n\nDùng với trợ từ へ hoặc に để chỉ hướng.", structure: "**[Địa điểm] へ / に 行きます / 来ます / 帰ります**", examples: [{ japanese: "日本へ行きます。", vietnamese: "Tôi đi Nhật Bản." }, { japanese: "家へ帰ります。", vietnamese: "Tôi về nhà." }], category: "direction_words" },
      { id: "m5_02", title: "Trợ từ へ - Hướng di chuyển", pattern: "〜へ行きます", meaning: "đi về hướng ~", explanation: "**へ (đọc là \"e\") chỉ hướng di chuyển.**\n\nDùng với động từ di chuyển như 行きます, 来ます, 帰ります.", structure: "**[Địa điểm] へ [Động từ di chuyển]**", examples: [{ japanese: "学校へ行きます。", vietnamese: "Tôi đi đến trường." }, { japanese: "駅へ向かいます。", vietnamese: "Tôi đi về phía ga." }], category: "direction_words" },
      { id: "m5_03", title: "Trợ từ で - Phương tiện", pattern: "〜で行きます", meaning: "đi bằng ~", explanation: "**で có nghĩa là \"bằng\", chỉ phương tiện giao thông hoặc công cụ.**", structure: "**[Phương tiện] で [Động từ]**", examples: [{ japanese: "バスで学校へ行きます。", vietnamese: "Tôi đi học bằng xe buýt." }, { japanese: "電車で大阪へ行きます。", vietnamese: "Tôi đi Osaka bằng tàu điện." }], category: "basic_sentence_structure" },
      { id: "m5_04", title: "Trợ từ を - Rời khỏi, Trợ từ なんで", pattern: "〜を出ます / なんで", meaning: "rời khỏi ~ / bằng gì", explanation: "**を còn có nghĩa là \"rời khỏi\" một địa điểm (đi ra từ).**\n**なんで** là \"bằng gì\" - dạng nghi vấn của で.", structure: "**[Địa điểm] を [Động từ]**\n**なんで [Động từ] か**", examples: [{ japanese: "8時に家を出ます。", vietnamese: "Tôi rời nhà lúc 8 giờ." }, { japanese: "大学を卒業します。", vietnamese: "Tôi tốt nghiệp đại học." }, { japanese: "なんで学校へ行きますか。", vietnamese: "Bạn đi học bằng gì?" }], category: "basic_sentence_structure" }
    ]
  },
  {
    lessonNumber: 6, level: "N5",
    title: "Ăn uống và trợ từ",
    title_jp: "飲食と助詞",
    description: "Động từ ăn uống, trợ từ を (tân ngữ), で, いっしょに, と.",
    grammars: [
      { id: "m6_01", title: "Động từ ăn uống", pattern: "食べます / 飲みます", meaning: "ăn / uống", explanation: "**Động từ ăn uống cơ bản:**\n- **食べます** (たべます): ăn\n- **飲みます** (のみます): uống\n\nDùng với trợ từ を để chỉ đối tượng.", structure: "**[Đồ ăn/Thức uống] を 食べます / 飲みます**", examples: [{ japanese: "ご飯を食べます。", vietnamese: "Tôi ăn cơm." }, { japanese: "コーヒーを飲みます。", vietnamese: "Tôi uống cà phê." }], category: "verb_forms" },
      { id: "m6_02", title: "Trợ từ を - Tân ngữ", pattern: "〜を〜ます", meaning: "làm gì đó với đối tượng", explanation: "**を là trợ từ đánh dấu tân ngữ trực tiếp của động từ.**\n\nDùng khi hành động tác động trực tiếp lên một đối tượng.", structure: "**[Tân ngữ] を [Động từ]**", examples: [{ japanese: "映画を見ます。", vietnamese: "Tôi xem phim." }, { japanese: "本を読みます。", vietnamese: "Tôi đọc sách." }], category: "basic_sentence_structure" },
      { id: "m6_03", title: "いっしょに - Cùng nhau", pattern: "いっしょに〜ます", meaning: "cùng làm ~", explanation: "**いっしょに (一緒に) có nghĩa là \"cùng nhau\".**\n\nĐặt trước động từ để diễn tả hành động cùng làm với ai đó.", structure: "**いっしょに [Động từ]**", examples: [{ japanese: "いっしょに勉強しましょう。", vietnamese: "Cùng học nào." }, { japanese: "いっしょにご飯を食べます。", vietnamese: "Tôi ăn cơm cùng nhau." }], category: "conjunctions" },
      { id: "m6_04", title: "Trợ từ と - Với ai đó", pattern: "〜と〜ます", meaning: "làm gì với ai đó", explanation: "**と là trợ từ chỉ sự cùng nhau thực hiện hành động.**\n\nNối danh từ chỉ người.", structure: "**[Người] と [Động từ]**", examples: [{ japanese: "友達と映画を見ます。", vietnamese: "Tôi xem phim với bạn." }, { japanese: "誰と日本へ行きますか。", vietnamese: "Bạn đi Nhật với ai?" }], category: "conjunctions" }
    ]
  },
  {
    lessonNumber: 7, level: "N5",
    title: "Cho - Nhận - Mượn - Cho mượn",
    title_jp: "あげる・もらう・貸す・借りる・教える",
    description: "Động từ cho, nhận, cho mượn, mượn và dạy.",
    grammars: [
      { id: "m7_01", title: "あげます - Cho/Tặng", pattern: "〜に〜をあげます", meaning: "cho/tặng ai cái gì", explanation: "**あげます dùng khi người nói cho ai đó vật gì.**\n\nHành động cho đi từ trong ra ngoài.", structure: "**[Người cho] は [Người nhận] に [Vật] をあげます**", examples: [{ japanese: "友達にプレゼントをあげます。", vietnamese: "Tôi tặng quà cho bạn." }, { japanese: "先生に花をあげました。", vietnamese: "Tôi đã tặng hoa cho thầy." }], category: "expressions" },
      { id: "m7_02", title: "もらいます - Nhận", pattern: "〜に〜をもらいます", meaning: "nhận từ ai cái gì", explanation: "**もらいます dùng khi nhận vật gì từ ai đó.**\n\nNhấn mạnh hành động nhận.", structure: "**[Người nhận] は [Người cho] に [Vật] をもらいます**", examples: [{ japanese: "先生に本をもらいました。", vietnamese: "Tôi đã nhận sách từ thầy giáo." }, { japanese: "友達にペンをもらいました。", vietnamese: "Tôi đã nhận bút từ bạn." }], category: "expressions" },
      { id: "m7_03", title: "かします・かります - Cho mượn / Mượn", pattern: "〜をかします / 〜をかります", meaning: "cho mượn / mượn", explanation: "**かします**: cho mượn (từ trong ra ngoài)\n**かります**: mượn (từ ngoài vào trong)\n\nDùng với trợ từ に và を.", structure: "**[Người] に [Vật] をかします (cho mượn)**\n**[Người] に [Vật] をかります (mượn)**", examples: [{ japanese: "友達に本をかしました。", vietnamese: "Tôi đã cho bạn mượn sách." }, { japanese: "図書館で本をかりました。", vietnamese: "Tôi đã mượn sách ở thư viện." }], category: "expressions" },
      { id: "m7_04", title: "おしえます - Dạy/Chỉ", pattern: "〜に〜をおしえます", meaning: "dạy/chỉ cho ai cái gì", explanation: "**おしえます có nghĩa là \"dạy\" hoặc \"chỉ cho\".**\n\nDùng với に (người) và を (nội dung).", structure: "**[Người dạy] は [Người học] に [Nội dung] をおしえます**", examples: [{ japanese: "先生は学生に日本語をおしえます。", vietnamese: "Thầy giáo dạy tiếng Nhật cho học sinh." }, { japanese: "道をおしえてください。", vietnamese: "Làm ơn chỉ đường cho tôi." }], category: "expressions" }
    ]
  },
  {
    lessonNumber: 8, level: "N5",
    title: "Tính từ い và な",
    title_jp: "形容詞",
    description: "Tính từ đuôi い, tính từ đuôi な, phủ định あまり〜ません, とても.",
    grammars: [
      { id: "m8_01", title: "Tính từ đuôi い", pattern: "〜いです", meaning: "tính từ đuôi い", explanation: "**Tính từ đuôi い (い-adj) kết thúc bằng い.**\n\nCó thể đứng trước danh từ để bổ nghĩa (không cần thêm な) hoặc đứng cuối câu với です.", structure: "**[Tính từ い] + です** (cuối câu)\n**[Tính từ い] + [Danh từ]** (bổ nghĩa)", examples: [{ japanese: "この本は面白いです。", vietnamese: "Quyển sách này thú vị." }, { japanese: "高いビルです。", vietnamese: "Tòa nhà cao." }], category: "adjectives" },
      { id: "m8_02", title: "Tính từ đuôi な", pattern: "〜な + [Danh từ] / 〜です", meaning: "tính từ đuôi な", explanation: "**Tính từ đuôi な (な-adj) cần thêm な khi bổ nghĩa danh từ.**\n\nKhi đứng cuối câu, dùng です trực tiếp.", structure: "**[Tính từ な] + な + [Danh từ]** (bổ nghĩa)\n**[Tính từ な] + です** (cuối câu)", examples: [{ japanese: "静かな部屋です。", vietnamese: "Căn phòng yên tĩnh." }, { japanese: "この町は賑やかです。", vietnamese: "Thị trấn này nhộn nhịp." }], category: "adjectives" },
      { id: "m8_03", title: "あまり〜ません - Không... lắm", pattern: "あまり〜ません", meaning: "không ~ lắm", explanation: "**あまり + phủ định có nghĩa là \"không ~ lắm\".**\n\nDùng với tính từ hoặc động từ ở dạng phủ định.", structure: "**あまり [Tính từ/Động từ phủ định]**", examples: [{ japanese: "この本はあまり高くないです。", vietnamese: "Quyển sách này không đắt lắm." }, { japanese: "あまりコーヒーを飲みません。", vietnamese: "Tôi không uống cà phê lắm." }], category: "negative_form" },
      { id: "m8_04", title: "とても - Rất", pattern: "とても〜", meaning: "rất ~", explanation: "**とても có nghĩa là \"rất\".**\n\nĐặt trước tính từ hoặc trạng từ để nhấn mạnh.", structure: "**とても [Tính từ] です**", examples: [{ japanese: "この本はとても面白いです。", vietnamese: "Quyển sách này rất thú vị." }, { japanese: "京都はとてもきれいです。", vietnamese: "Kyoto rất đẹp." }], category: "adjectives" }
    ]
  },
  {
    lessonNumber: 9, level: "N5",
    title: "Sở thích và năng lực",
    title_jp: "趣味と能力",
    description: "わかります, あります, います, 好き, 嫌い, 上手, 下手.",
    grammars: [
      { id: "m9_01", title: "わかります - Hiểu/Biết", pattern: "〜がわかります", meaning: "hiểu/biết ~", explanation: "**わかります có nghĩa \"hiểu\" hoặc \"biết\".**\n\nĐối tượng được đánh dấu bằng が, không dùng を.", structure: "**[Danh từ] がわかります**", examples: [{ japanese: "日本語がわかります。", vietnamese: "Tôi hiểu tiếng Nhật." }, { japanese: "この問題がわかりません。", vietnamese: "Tôi không hiểu bài toán này." }], category: "expressions" },
      { id: "m9_02", title: "あります・います (sở hữu)", pattern: "〜があります / 〜がいます", meaning: "có ~ (sở hữu)", explanation: "**あります/います còn dùng để chỉ sự sở hữu.**\n\n- あります: đồ vật, sự kiện\n- います: người, động vật", structure: "**[Người] は [Vật] があります**\n**[Người] は [Người/Động vật] がいます**", examples: [{ japanese: "私は車があります。", vietnamese: "Tôi có xe hơi." }, { japanese: "田中さんは子供がいます。", vietnamese: "Anh Tanaka có con." }], category: "existence_verbs" },
      { id: "m9_03", title: "好き・嫌い - Thích / Không thích", pattern: "〜が好きです / 〜が嫌いです", meaning: "thích ~ / không thích ~", explanation: "**好き (すき) và 嫌い (きらい) là tính từ đuôi な.**\n\nĐối tượng thích/không thích được đánh dấu bằng が.\nPhủ định: 好きじゃないです / 嫌いじゃないです.", structure: "**[Chủ thể] は [Đối tượng] が好きです / 嫌いです**", examples: [{ japanese: "私は音楽が好きです。", vietnamese: "Tôi thích âm nhạc." }, { japanese: "私は納豆が嫌いです。", vietnamese: "Tôi không thích natto." }], category: "expressions" },
      { id: "m9_04", title: "上手・下手 - Giỏi / Kém", pattern: "〜が上手です / 〜が下手です", meaning: "giỏi ~ / kém ~", explanation: "**上手 (じょうず) và 下手 (へた) là tính từ đuôi な.**\n\nDùng để đánh giá năng lực.\nĐối tượng được đánh dấu bằng が.", structure: "**[Chủ thể] は [Kỹ năng] が上手です / 下手です**", examples: [{ japanese: "私は料理が上手です。", vietnamese: "Tôi giỏi nấu ăn." }, { japanese: "彼はスポーツが下手です。", vietnamese: "Anh ấy kém thể thao." }], category: "expressions" }
    ]
  },
  {
    lessonNumber: 10, level: "N5",
    title: "Vị trí đồ vật - あります・います",
    title_jp: "物の位置 - あります・います",
    description: "Diễn tả vị trí của đồ vật và người với あります・います, の上・下・中, や.",
    grammars: [
      { id: "m10_01", title: "あります - Tồn tại đồ vật", pattern: "〜に〜があります", meaning: "ở ~ có ~", explanation: "**あります dùng cho đồ vật, cây cối.**\n\nĐịa điểm (に) + Đồ vật (が) + あります.", structure: "**[Địa điểm] に [Đồ vật] があります**", examples: [{ japanese: "机の上に本があります。", vietnamese: "Trên bàn có quyển sách." }, { japanese: "部屋にテレビがあります。", vietnamese: "Trong phòng có ti vi." }], category: "existence_verbs" },
      { id: "m10_02", title: "います - Tồn tại người/vật sống", pattern: "〜に〜がいます", meaning: "ở ~ có ~", explanation: "**います dùng cho người, động vật.**", structure: "**[Địa điểm] に [Người/Động vật] がいます**", examples: [{ japanese: "庭に猫がいます。", vietnamese: "Trong vườn có con mèo." }, { japanese: "学校に先生がいます。", vietnamese: "Ở trường có giáo viên." }], category: "existence_verbs" },
      { id: "m10_03", title: "Vị trí: 上・下・中・前・後ろ・隣", pattern: "〜の [Vị trí] に", meaning: "ở trên/dưới/trong/trước/sau/bên cạnh ~", explanation: "**Các danh từ chỉ vị trí kết hợp với の:**\n- 上 (うえ): trên\n- 下 (した): dưới\n- 中 (なか): trong\n- 前 (まえ): trước\n- 後ろ (うしろ): sau\n- 隣 (となり): bên cạnh", structure: "**[Danh từ] の [Vị trí] に [Đồ vật] があります/います**", examples: [{ japanese: "机の上に本があります。", vietnamese: "Trên bàn có quyển sách." }, { japanese: "猫は椅子の下にいます。", vietnamese: "Con mèo ở dưới ghế." }], category: "location_words" },
      { id: "m10_04", title: "Trợ từ や - Liệt kê một phần", pattern: "〜や〜など", meaning: "~, ~ v.v.", explanation: "**や dùng để liệt kê một vài đối tượng tiêu biểu (không đầy đủ).**\n\nCó thể thêm など ở cuối.", structure: "**[Danh từ 1] や [Danh từ 2] (など)**", examples: [{ japanese: "机の上に本や鉛筆があります。", vietnamese: "Trên bàn có sách, bút chì v.v." }, { japanese: "日本へ箱根や京都へ行きました。", vietnamese: "Tôi đã đi Nhật đến Hakone và Kyoto v.v." }], category: "conjunctions" }
    ]
  },
  {
    lessonNumber: 11, level: "N5",
    title: "Số lượng và đơn vị đếm",
    title_jp: "数量詞",
    description: "Cách đếm số lượng: 〜人, 〜台, 〜枚 và どのくらい.",
    grammars: [
      { id: "m11_01", title: "Đếm người - 〜人", pattern: "〜人", meaning: "~ người", explanation: "**Đếm số người:**\n- 1人 (ひとり): 1 người\n- 2人 (ふたり): 2 người\n- 3人 (さんにん): 3 người\n- 4人 (よにん): 4 người\n- Từ 5 trở đi: 5人 (ごにん), 6人 (ろくにん)...", structure: "**[Số] 人 (にん)**", examples: [{ japanese: "家族は4人です。", vietnamese: "Gia đình tôi có 4 người." }, { japanese: "教室に学生が10人います。", vietnamese: "Trong lớp có 10 học sinh." }], category: "expressions" },
      { id: "m11_02", title: "Đếm đồ vật: 〜台・〜枚・〜本…", pattern: "〜台 / 〜枚 / 〜本", meaning: "~ cái (máy móc) / ~ tờ / ~ cây (dài)", explanation: "**Các đơn vị đếm thông dụng:**\n- **〜台 (だい)**: máy móc, xe cộ (車、パソコン)\n- **〜枚 (まい)**: vật mỏng, dẹt (紙、皿、シャツ)\n- **〜本 (ぼん)**: vật dài, hình trụ (鉛筆、傘、ビール)\n- **〜冊 (さつ)**: sách vở\n- **〜杯 (はい)**: cốc, chén\n- **〜匹 (ひき)**: động vật nhỏ\n- **〜階 (かい)**: tầng lầu", structure: "**[Số] + [Đơn vị đếm]**", examples: [{ japanese: "車が2台あります。", vietnamese: "Có 2 chiếc xe hơi." }, { japanese: "紙を5枚ください。", vietnamese: "Làm ơn cho tôi 5 tờ giấy." }], notes: "Chú ý cách đọc thay đổi theo số: 1本 (いっぽん), 3本 (さんぼん), 6本 (ろっぽん).", category: "expressions" },
      { id: "m11_03", title: "どのくらい - Bao nhiêu (hỏi số lượng)", pattern: "どのくらい", meaning: "bao nhiêu (hỏi số lượng/thời gian)", explanation: "**どのくらい dùng để hỏi về số lượng hoặc khoảng thời gian.**\n\nCó thể dùng どのぐらい với nghĩa tương tự.", structure: "**どのくらい [Động từ] か**", examples: [{ japanese: "どのくらい日本語を勉強しましたか。", vietnamese: "Bạn đã học tiếng Nhật bao lâu rồi?" }, { japanese: "かばんはどのくらいですか。", vietnamese: "Cái cặp giá bao nhiêu?" }], category: "questions" }
    ]
  },
  {
    lessonNumber: 12, level: "N5",
    title: "So sánh",
    title_jp: "比較",
    description: "So sánh hơn với より và のほうが, so sánh nhất với いちばん, quá khứ của tính từ.",
    grammars: [
      { id: "m12_01", title: "Quá khứ của tính từ", pattern: "〜かったです / 〜でした", meaning: "đã ~ (tính từ quá khứ)", explanation: "**Quá khứ của tính từ:**\n- **い-adj**: Bỏ い + かったです\n- **な-adj**: + でした\n\nPhủ định quá khứ: くなかったです / ではありませんでした", structure: "**[い-adj] → bỏ い + かったです**\n**[な-adj] + でした**", examples: [{ japanese: "昨日は寒かったです。", vietnamese: "Hôm qua trời đã lạnh." }, { japanese: "京都は賑やかでした。", vietnamese: "Kyoto đã nhộn nhịp." }], category: "adjectives" },
      { id: "m12_02", title: "So sánh hơn - 〜より", pattern: "〜より〜", meaning: "hơn ~", explanation: "**より đánh dấu đối tượng được so sánh, đứng sau đối tượng so sánh.**", structure: "**[A] は [B] より [Tính từ] です**\n→ A hơn B", examples: [{ japanese: "東京は大阪より大きいです。", vietnamese: "Tokyo lớn hơn Osaka." }, { japanese: "日本語は英語より難しいです。", vietnamese: "Tiếng Nhật khó hơn tiếng Anh." }], category: "comparison" },
      { id: "m12_03", title: "So sánh hơn - 〜のほうが", pattern: "〜のほうが〜", meaning: "~ hơn", explanation: "**のほうが đánh dấu đối tượng vượt trội hơn.**\n\nThường kết hợp với より.", structure: "**[B] のほうが [A] より [Tính từ] です**", examples: [{ japanese: "大阪のほうが東京より安いです。", vietnamese: "Osaka rẻ hơn Tokyo." }, { japanese: "電車のほうがバスより速いです。", vietnamese: "Tàu điện nhanh hơn xe buýt." }], category: "comparison" },
      { id: "m12_04", title: "So sánh nhất - いちばん", pattern: "〜でいちばん〜", meaning: "nhất (trong nhóm)", explanation: "**いちばん (一番) có nghĩa là \"nhất\".**\n\nで chỉ phạm vi của nhóm so sánh.", structure: "**[Phạm vi] で いちばん [Tính từ] です**", examples: [{ japanese: "日本でいちばん高い山は富士山です。", vietnamese: "Ngọn núi cao nhất Nhật Bản là núi Phú Sĩ." }, { japanese: "クラスでいちばん背が高い人は誰ですか。", vietnamese: "Người cao nhất trong lớp là ai?" }], category: "comparison" }
    ]
  },
  {
    lessonNumber: 13, level: "N5",
    title: "Muốn làm gì - 〜たい",
    title_jp: "希望 - 〜たい",
    description: "Diễn tả mong muốn làm gì với 〜たい và rủ rê với 〜ませんか.",
    grammars: [
      { id: "m13_01", title: "Muốn làm gì - 〜たいです", pattern: "〜たいです", meaning: "muốn làm ~", explanation: "**たい là trợ động từ, thêm vào thân động từ để diễn tả mong muốn.**\n\nBiến động từ thành tính từ đuôi い.\nTân ngữ có thể dùng が hoặc を.", structure: "**[Thân động từ ます] + たいです**", examples: [{ japanese: "日本へ行きたいです。", vietnamese: "Tôi muốn đi Nhật." }, { japanese: "すしを食べたいです。", vietnamese: "Tôi muốn ăn sushi." }], category: "expressions" },
      { id: "m13_02", title: "Muốn đi đến đâu - 〜へ行きたいです", pattern: "〜へ行きたいです", meaning: "muốn đi ~", explanation: "**Kết hợp たい với động từ di chuyển.**\n\nDùng へ hoặc に để chỉ địa điểm muốn đến.", structure: "**[Địa điểm] へ / に 行きたいです**", examples: [{ japanese: "日本へ行きたいです。", vietnamese: "Tôi muốn đi Nhật." }, { japanese: "どこへ行きたいですか。", vietnamese: "Bạn muốn đi đâu?" }], category: "expressions" },
      { id: "m13_03", title: "Rủ rê - 〜ませんか", pattern: "〜ませんか", meaning: "cùng làm ~ không?", explanation: "**ませんか là cách rủ rê lịch sự.**\n\nNghĩa: \"Cùng làm ~ không?\"\nLịch sự hơn ましょうか.", structure: "**[Thân động từ] + ませんか**", examples: [{ japanese: "いっしょにご飯を食べませんか。", vietnamese: "Cùng ăn cơm không?" }, { japanese: "映画を見ませんか。", vietnamese: "Cùng xem phim không?" }], category: "verb_forms" }
    ]
  },
  {
    lessonNumber: 14, level: "N5",
    title: "Thể て - Cách chia",
    title_jp: "動詞のて形",
    description: "Cách chia động từ thể て và cấu trúc 〜てください.",
    grammars: [
      { id: "m14_01", title: "Chia động từ thể て", pattern: "〜て", meaning: "thể て của động từ", explanation: "**Cách chia thể て theo 3 nhóm:**\n\n**Nhóm 1 (Godan):**\n- う、つ、る → って (会う→会って)\n- む、ぶ、ぬ → んで (読む→読んで)\n- く → いて (書く→書いて)\n- ぐ → いで (泳ぐ→泳いで)\n- す → して (話す→話して)\n\n**Nhóm 2 (Ichidan):** bỏ る + て (食べる→食べて)\n\n**Nhóm 3:** する→して, 来る→来て (きて)", structure: "**[Động từ thể て]**", examples: [{ japanese: "毎日学校に行って、勉強します。", vietnamese: "Mỗi ngày đến trường rồi học." }, { japanese: "朝起きて、歯を磨きます。", vietnamese: "Sáng dậy, tôi đánh răng." }], category: "verb_forms" },
      { id: "m14_02", title: "Yêu cầu - 〜てください", pattern: "〜てください", meaning: "hãy làm ~ / vui lòng làm ~", explanation: "**Dùng để yêu cầu ai đó làm gì một cách lịch sự.**\n\nĐộng từ thể て + ください.", structure: "**[Động từ thể て] ください**", examples: [{ japanese: "名前を書いてください。", vietnamese: "Hãy viết tên vào." }, { japanese: "ここで待ってください。", vietnamese: "Vui lòng đợi ở đây." }], category: "verb_forms" }
    ]
  },
  {
    lessonNumber: 15, level: "N5",
    title: "Thể て - Xin phép và cấm chỉ",
    title_jp: "許可と禁止",
    description: "Xin phép (〜てもいいです) và cấm chỉ (〜てはいけません).",
    grammars: [
      { id: "m15_01", title: "Xin phép - 〜てもいいです", pattern: "〜てもいいですか", meaning: "có thể ~ được không?", explanation: "**Dùng để xin phép làm gì đó một cách lịch sự.**\n\nĐộng từ thể て + もいいですか.\nTrả lời: はい、いいですよ。/ いいえ、だめです。", structure: "**[Động từ thể て] もいいですか**", examples: [{ japanese: "ここに座ってもいいですか。", vietnamese: "Tôi có thể ngồi ở đây không?" }, { japanese: "写真を撮ってもいいですか。", vietnamese: "Tôi có thể chụp ảnh không?" }], category: "verb_forms" },
      { id: "m15_02", title: "Cấm chỉ - 〜てはいけません", pattern: "〜てはいけません", meaning: "không được làm ~", explanation: "**Dùng để diễn tả điều cấm, không được phép làm.**\n\nThường dùng trong nội quy, quy định.", structure: "**[Động từ thể て] はいけません**", examples: [{ japanese: "ここでタバコを吸ってはいけません。", vietnamese: "Không được hút thuốc ở đây." }, { japanese: "授業中にスマホを使ってはいけません。", vietnamese: "Không được dùng điện thoại trong giờ học." }], category: "verb_forms" }
    ]
  },
  {
    lessonNumber: 16, level: "N5",
    title: "Thể ています - Đang làm và trạng thái",
    title_jp: "〜ています",
    description: "Diễn tả hành động đang diễn ra và trạng thái với 〜ています, 〜ても.",
    grammars: [
      { id: "m16_01", title: "Đang làm - 〜ています", pattern: "〜ています", meaning: "đang làm ~ (tiếp diễn)", explanation: "**Dùng để diễn tả hành động đang diễn ra tại thời điểm nói.**\n\nĐộng từ thể て + います.", structure: "**[Động từ thể て] います**", examples: [{ japanese: "今勉強しています。", vietnamese: "Bây giờ tôi đang học." }, { japanese: "雨が降っています。", vietnamese: "Trời đang mưa." }], category: "verb_forms" },
      { id: "m16_02", title: "Nghề nghiệp/Trạng thái - 〜ています", pattern: "〜ています (nghề nghiệp/trạng thái)", meaning: "đang làm nghề ~ / đang ở trạng thái ~", explanation: "**Một số động từ dùng ています để diễn tả nghề nghiệp hoặc trạng thái.**\n\nVí dụ: 働いています (đang làm việc), 住んでいます (đang sống).", structure: "**[Động từ thể て] います**", examples: [{ japanese: "銀行で働いています。", vietnamese: "Tôi đang làm việc ở ngân hàng." }, { japanese: "京都に住んでいます。", vietnamese: "Tôi đang sống ở Kyoto." }], category: "verb_forms" },
      { id: "m16_03", title: "〜ても - Dù có làm gì", pattern: "〜ても", meaning: "dù ~ đi nữa", explanation: "**〜ても có nghĩa là \"dù có làm ~ đi nữa\".**\n\nThể て + も.", structure: "**[Động từ thể て] も**", examples: [{ japanese: "雨が降っても行きます。", vietnamese: "Dù có mưa tôi cũng đi." }, { japanese: "高くても買います。", vietnamese: "Dù đắt tôi cũng mua." }], category: "verb_forms" }
    ]
  },
  {
    lessonNumber: 17, level: "N5",
    title: "Thể ない - Phủ định",
    title_jp: "動詞の否定形",
    description: "Thể ない: 〜ないでください, 〜なければなりません, 〜なくてもいいです.",
    grammars: [
      { id: "m17_01", title: "Yêu cầu phủ định - 〜ないでください", pattern: "〜ないでください", meaning: "xin đừng làm ~", explanation: "**Dùng để yêu cầu ai đó đừng làm gì.**\n\nĐộng từ thể ない + でください.", structure: "**[Động từ thể ない] でください**", examples: [{ japanese: "タバコを吸わないでください。", vietnamese: "Xin đừng hút thuốc." }, { japanese: "ここで写真を撮らないでください。", vietnamese: "Xin đừng chụp ảnh ở đây." }], category: "verb_forms" },
      { id: "m17_02", title: "Nghĩa vụ - 〜なければなりません", pattern: "〜なければなりません", meaning: "phải làm ~", explanation: "**Diễn tả nghĩa vụ hoặc điều bắt buộc phải làm.**\n\nDùng thể ない bỏ ない thêm ければなりません.\nTrong văn nói: なきゃいけない.", structure: "**[Động từ thể ない (bỏ ない)] + ければなりません**", examples: [{ japanese: "宿題をしなければなりません。", vietnamese: "Tôi phải làm bài tập." }, { japanese: "薬を飲まなければなりません。", vietnamese: "Tôi phải uống thuốc." }], category: "expressions" },
      { id: "m17_03", title: "Không cần - 〜なくてもいいです", pattern: "〜なくてもいいです", meaning: "không cần phải làm ~", explanation: "**Diễn tả điều không cần thiết phải làm.**\n\nDạng phủ định của 〜てもいいです.", structure: "**[Động từ thể ない (bỏ ない)] + くてもいいです**", examples: [{ japanese: "明日来なくてもいいです。", vietnamese: "Ngày mai không cần đến cũng được." }, { japanese: "全部食べなくてもいいです。", vietnamese: "Không cần ăn hết cũng được." }], category: "expressions" }
    ]
  },
  {
    lessonNumber: 18, level: "N5",
    title: "Thể từ điển và khả năng",
    title_jp: "辞書形と可能",
    description: "Động từ thể từ điển, 〜ことができます, 趣味は〜ことです.",
    grammars: [
      { id: "m18_01", title: "Động từ thể từ điển (辞書形)", pattern: "〜 (thể từ điển)", meaning: "làm ~ (thể thường)", explanation: "**Thể từ điển là dạng nguyên mẫu của động từ.**\n\n**Nhóm 1:** kết thúc bằng う (書く, 読む, 話す)\n**Nhóm 2:** kết thúc bằng る (食べる, 見る)\n**Nhóm 3:** する, 来る (くる)\n\nDùng trong văn nói thân mật.", structure: "**[Động từ thể từ điển]**", examples: [{ japanese: "毎日学校へ行く。", vietnamese: "Mỗi ngày tôi đi học. (thân mật)" }, { japanese: "朝ご飯を食べる。", vietnamese: "Tôi ăn sáng. (thân mật)" }], category: "verb_forms" },
      { id: "m18_02", title: "Khả năng - 〜ことができます", pattern: "〜ことができます", meaning: "có thể làm ~", explanation: "**Dùng thể từ điển + ことができます để diễn tả khả năng.**\n\nPhủ định: 〜ことができません.", structure: "**[Động từ thể từ điển] ことができます**", examples: [{ japanese: "日本語を話すことができます。", vietnamese: "Tôi có thể nói tiếng Nhật." }, { japanese: "泳ぐことができません。", vietnamese: "Tôi không thể bơi." }], category: "verb_forms" },
      { id: "m18_03", title: "Sở thích - 趣味は〜ことです", pattern: "趣味は〜ことです", meaning: "sở thích là ~", explanation: "**Dùng こと để danh từ hóa động từ.**\n\nThể từ điển + ことで biến động từ thành danh từ.", structure: "**趣味は [Động từ thể từ điển] ことです**", examples: [{ japanese: "趣味は本を読むことです。", vietnamese: "Sở thích của tôi là đọc sách." }, { japanese: "趣味は切手を集めることです。", vietnamese: "Sở thích của tôi là sưu tập tem." }], category: "expressions" }
    ]
  },
  {
    lessonNumber: 19, level: "N5",
    title: "Thể た - Quá khứ và kinh nghiệm",
    title_jp: "た形・経験",
    description: "Thể た của động từ, 〜たことがあります (kinh nghiệm), 〜たり〜たりします.",
    grammars: [
      { id: "m19_01", title: "Chia động từ thể た", pattern: "〜た", meaning: "thể た của động từ", explanation: "**Cách chia thể た tương tự thể て.**\n\n- って → った (会う→会った)\n- んで → んだ (読む→読んだ)\n- いて → いた (書く→書いた)\n- して → した (話す→話した)\n- 食べる→食べた\n- する→した, 来る→来た (きた)", structure: "**[Động từ thể た]**", examples: [{ japanese: "昨日勉強した。", vietnamese: "Hôm qua tôi đã học." }, { japanese: "ご飯を食べた。", vietnamese: "Tôi đã ăn cơm." }], category: "verb_forms" },
      { id: "m19_02", title: "Kinh nghiệm - 〜たことがあります", pattern: "〜たことがあります", meaning: "đã từng làm ~", explanation: "**Dùng thể た + ことがあります để diễn tả kinh nghiệm.**\n\nPhủ định: 〜たことがありません.", structure: "**[Động từ thể た] ことがあります**", examples: [{ japanese: "富士山に登ったことがあります。", vietnamese: "Tôi đã từng leo núi Phú Sĩ." }, { japanese: "すしを食べたことがあります。", vietnamese: "Tôi đã từng ăn sushi." }], category: "expressions" },
      { id: "m19_03", title: "Liệt kê - 〜たり〜たりします", pattern: "〜たり〜たりします", meaning: "làm những việc như ~, ~", explanation: "**Dùng để liệt kê các hành động tiêu biểu.**\n\nĐộng từ thể た + り, lặp lại.", structure: "**[Động từ thể た] り、[Động từ thể た] りします**", examples: [{ japanese: "日曜日は本を読んだり、映画を見たりします。", vietnamese: "Chủ nhật tôi đọc sách, xem phim v.v." }, { japanese: "休みの日は散歩したり、買い物に行ったりします。", vietnamese: "Ngày nghỉ tôi đi dạo, đi mua sắm v.v." }], category: "verb_forms" }
    ]
  },
  {
    lessonNumber: 20, level: "N5",
    title: "Thể thường và trích dẫn",
    title_jp: "普通形と引用",
    description: "Thể thường (普通形) của động từ/tính từ/danh từ, 〜と思います, 〜と言います.",
    grammars: [
      { id: "m20_01", title: "Thể thường (普通形)", pattern: "普通形", meaning: "thể thường (thân mật)", explanation: "**Thể thường dùng trong văn nói thân mật hoặc trước と.**\n\n**Động từ:**\n- Hiện tại: 食べる、行く\n- Phủ định: 食べない、行かない\n- Quá khứ: 食べた、行った\n\n**Tính từ い:**\n- Hiện tại: 高い、安い\n- Phủ định: 高くない\n- Quá khứ: 高かった\n\n**Tính từ な/Danh từ:**\n- Hiện tại: 静かだ、学生だ\n- Phủ định: 静かじゃない、学生じゃない\n- Quá khứ: 静かだった、学生だった", structure: "**[Thể thường của động từ/tính từ/danh từ]**", examples: [{ japanese: "毎日学校へ行く。", vietnamese: "Mỗi ngày tôi đi học." }, { japanese: "この本は面白い。", vietnamese: "Quyển sách này thú vị." }], category: "verb_forms" },
      { id: "m20_02", title: "Tôi nghĩ - 〜と思います", pattern: "〜と思います", meaning: "tôi nghĩ rằng ~", explanation: "**Dùng để diễn tả suy nghĩ, ý kiến.**\n\nDùng thể thường trước と.", structure: "**[Câu thể thường] と思います**", examples: [{ japanese: "明日は晴れると思います。", vietnamese: "Tôi nghĩ ngày mai trời sẽ nắng." }, { japanese: "日本語は難しいと思います。", vietnamese: "Tôi nghĩ tiếng Nhật khó." }], category: "expressions" },
      { id: "m20_03", title: "Dẫn lời - 〜と言います", pattern: "〜と言います", meaning: "nói rằng ~", explanation: "**Dùng để dẫn lại lời nói.**\n\nと là trợ từ trích dẫn.", structure: "**[Nội dung] と言います**", examples: [{ japanese: "田中さんは明日来ると言いました。", vietnamese: "Anh Tanaka nói ngày mai sẽ đến." }, { japanese: "彼は行きたいと言っています。", vietnamese: "Anh ấy nói muốn đi." }], category: "expressions" }
    ]
  },
  {
    lessonNumber: 21, level: "N5",
    title: "Suy nghĩ và phỏng đoán",
    title_jp: "意志と推量",
    description: "〜と思っています, 〜でしょう (phỏng đoán).",
    grammars: [
      { id: "m21_01", title: "Nghĩ rằng (liên tục) - 〜と思っています", pattern: "〜と思っています", meaning: "tôi nghĩ rằng ~ (đang nghĩ)", explanation: "**Dùng khi suy nghĩ đó đang tiếp diễn hoặc là ý kiến đã có từ lâu.**\n\nKhác với と思います (nghĩ nhất thời).", structure: "**[Câu thể thường] と思っています**", examples: [{ japanese: "日本はいい国だと思っています。", vietnamese: "Tôi nghĩ Nhật Bản là đất nước tốt." }, { japanese: "彼は正しいと思っています。", vietnamese: "Tôi nghĩ anh ấy đúng." }], category: "expressions" },
      { id: "m21_02", title: "Phỏng đoán - 〜でしょう", pattern: "〜でしょう", meaning: "chắc là ~ / có lẽ ~", explanation: "**Dùng để phỏng đoán, suy đoán (mức độ chắc chắn cao).**\n\nDùng thể thường trước でしょう.\nTrong văn nói thân mật: 〜だろう.", structure: "**[Câu thể thường] でしょう**", examples: [{ japanese: "明日は雨が降るでしょう。", vietnamese: "Chắc ngày mai trời sẽ mưa." }, { japanese: "彼は来ないでしょう。", vietnamese: "Chắc anh ấy sẽ không đến." }], category: "expressions" }
    ]
  },
  {
    lessonNumber: 22, level: "N5",
    title: "Trước khi và sau khi",
    title_jp: "前と後",
    description: "〜前に (trước khi), 〜てから (sau khi làm gì).",
    grammars: [
      { id: "m22_01", title: "Trước khi - 〜前に", pattern: "〜前に、〜", meaning: "trước khi ~, ~", explanation: "**Diễn tả hành động xảy ra trước một hành động khác.**\n\nDùng thể từ điển + 前に.", structure: "**[Động từ thể từ điển] 前に、[Hành động]**", examples: [{ japanese: "食べる前に、手を洗います。", vietnamese: "Trước khi ăn, tôi rửa tay." }, { japanese: "寝る前に、歯を磨きます。", vietnamese: "Trước khi ngủ, tôi đánh răng." }], category: "time" },
      { id: "m22_02", title: "Sau khi - 〜てから", pattern: "〜てから、〜", meaning: "sau khi ~, ~", explanation: "**Diễn tả hành động xảy ra sau khi hành động khác kết thúc.**\n\nNhấn mạnh thứ tự thời gian.", structure: "**[Động từ thể て] から、[Hành động tiếp theo]**", examples: [{ japanese: "勉強してから、寝ます。", vietnamese: "Sau khi học xong, tôi đi ngủ." }, { japanese: "ご飯を食べてから、出かけます。", vietnamese: "Sau khi ăn cơm, tôi ra ngoài." }], category: "time" }
    ]
  },
  {
    lessonNumber: 23, level: "N5",
    title: "Khi - Trong lúc",
    title_jp: "時・同時動作",
    description: "〜とき (khi), 〜と (khi ~ thì), 〜ながら (vừa ~ vừa).",
    grammars: [
      { id: "m23_01", title: "Khi - 〜とき", pattern: "〜とき、〜", meaning: "khi ~, thì ~", explanation: "**Dùng để diễn tả thời điểm xảy ra hành động.**\n\nNếu hành động trong とき chưa xảy ra: dùng thể từ điển.\nNếu đã xảy ra: dùng thể た.", structure: "**[Động từ/Tính từ thể thường] とき、[Mệnh đề chính]**\n**[Danh từ] のとき、[Mệnh đề chính]**", examples: [{ japanese: "子供のとき、日本に住んでいました。", vietnamese: "Khi còn nhỏ, tôi đã sống ở Nhật." }, { japanese: "駅に着いたとき、電話します。", vietnamese: "Khi đến ga, tôi sẽ gọi điện." }], category: "time" },
      { id: "m23_02", title: "Khi ~ thì - 〜と", pattern: "〜と、〜", meaning: "khi ~ thì ~ (kết quả tất yếu)", explanation: "**と diễn tả kết quả tất yếu hoặc thói quen.**\n\nKhi một hành động xảy ra thì tự động dẫn đến kết quả.\nKhông dùng với ý chí, mong muốn.", structure: "**[Mệnh đề 1] と、[Mệnh đề 2 (kết quả)]**", examples: [{ japanese: "春になると、花が咲きます。", vietnamese: "Khi mùa xuân đến, hoa nở." }, { japanese: "このボタンを押すと、ドアが開きます。", vietnamese: "Khi ấn nút này, cửa sẽ mở." }], category: "conjunctions" },
      { id: "m23_03", title: "Vừa ~ vừa - 〜ながら", pattern: "〜ながら〜ます", meaning: "vừa ~ vừa ~", explanation: "**Dùng để diễn tả hai hành động xảy ra đồng thời.**\n\nThân động từ ます + ながら + động từ chính.", structure: "**[Thân động từ ます] ながら [Động từ chính]**", examples: [{ japanese: "音楽を聞きながら勉強します。", vietnamese: "Tôi vừa nghe nhạc vừa học." }, { japanese: "テレビを見ながらご飯を食べます。", vietnamese: "Tôi vừa xem TV vừa ăn cơm." }], category: "conjunctions" }
    ]
  },
  {
    lessonNumber: 24, level: "N5",
    title: "Đưa và nhận bằng thể て",
    title_jp: "授受のて形",
    description: "〜くれます, 〜てくれます, 〜てもらいます.",
    grammars: [
      { id: "m24_01", title: "くれる - Cho tôi", pattern: "〜が〜をくれます", meaning: "ai đó cho tôi cái gì", explanation: "**くれる dùng khi người khác cho người nói vật gì.**\n\nHành động từ ngoài vào trong.", structure: "**[Người cho] は [Người nhận (tôi)] に [Vật] をくれます**", examples: [{ japanese: "母は本をくれました。", vietnamese: "Mẹ đã cho tôi quyển sách." }, { japanese: "友達がチョコレートをくれました。", vietnamese: "Bạn đã cho tôi sô-cô-la." }], category: "expressions" },
      { id: "m24_02", title: "Làm cho tôi - 〜てくれます", pattern: "〜てくれます", meaning: "làm ~ cho tôi", explanation: "**Dùng khi ai đó làm hành động gì đó cho người nói (mang ơn).**\n\nĐộng từ thể て + くれます.", structure: "**[Người] は [Người nói] に [Động từ thể て] くれます**", examples: [{ japanese: "友達が日本語を教えてくれます。", vietnamese: "Bạn dạy tiếng Nhật cho tôi." }, { japanese: "先生が本を貸してくれました。", vietnamese: "Thầy giáo đã cho tôi mượn sách." }], category: "expressions" },
      { id: "m24_03", title: "Nhờ vả - 〜てもらいます", pattern: "〜てもらいます", meaning: "nhờ ai đó làm ~ cho", explanation: "**Dùng khi nhờ ai đó làm gì cho mình.**\n\nĐộng từ thể て + もらいます.", structure: "**[Người yêu cầu] は [Người thực hiện] に [Động từ thể て] もらいます**", examples: [{ japanese: "医者に診てもらいます。", vietnamese: "Tôi nhờ bác sĩ khám." }, { japanese: "友達に翻訳してもらいました。", vietnamese: "Tôi đã nhờ bạn dịch giúp." }], category: "expressions" }
    ]
  },
  {
    lessonNumber: 25, level: "N5",
    title: "Điều kiện và giả định",
    title_jp: "条件と仮定",
    description: "〜たら (nếu), 〜ても (dù), もし (nếu).",
    grammars: [
      { id: "m25_01", title: "Câu điều kiện - 〜たら", pattern: "〜たら、〜", meaning: "nếu ~ thì ~", explanation: "**たら là dạng điều kiện phổ biến nhất.**\n\nDùng được cho tất cả các loại từ.\nThể た + ら.", structure: "**[Thể た của động từ/tính từ] + ら**\n**[Danh từ + だった] + ら**", examples: [{ japanese: "雨が降ったら、出かけません。", vietnamese: "Nếu trời mưa thì tôi không ra ngoài." }, { japanese: "安かったら、買います。", vietnamese: "Nếu rẻ thì tôi sẽ mua." }], category: "conditionals" },
      { id: "m25_02", title: "Dù - 〜ても", pattern: "〜ても", meaning: "dù ~ đi nữa", explanation: "**Dù có ~ thì vẫn...**\n\nThể て + も.", structure: "**[Động từ thể て] も**", examples: [{ japanese: "雨が降っても行きます。", vietnamese: "Dù có mưa tôi cũng đi." }, { japanese: "高くても買います。", vietnamese: "Dù đắt tôi cũng mua." }], category: "conditionals" },
      { id: "m25_03", title: "もし - Nếu (giả định)", pattern: "もし〜たら", meaning: "nếu ~ (giả định rõ)", explanation: "**もし thêm vào trước câu điều kiện để nhấn mạnh tính giả định.**\n\nCó thể dùng với たら, ば, ても.", structure: "**もし [Câu điều kiện]、[Kết quả]**", examples: [{ japanese: "もし時間があったら、いっしょに行きましょう。", vietnamese: "Nếu có thời gian, chúng ta cùng đi nhé." }, { japanese: "もし安かったら、買います。", vietnamese: "Nếu rẻ thì tôi sẽ mua." }], category: "conditionals" }
    ]
  }
];

const categories = [
  { value: 'basic_sentence_structure', label: 'Cấu trúc câu cơ bản' },
  { value: 'questions', label: 'Câu hỏi' },
  { value: 'possessive', label: 'Sở hữu' },
  { value: 'demonstratives', label: 'Chỉ định từ' },
  { value: 'adjectives', label: 'Tính từ' },
  { value: 'negative_form', label: 'Thể phủ định' },
  { value: 'verb_forms', label: 'Động từ' },
  { value: 'conjunctions', label: 'Liên từ' },
  { value: 'time', label: 'Thời gian' },
  { value: 'time_telling', label: 'Cách nói giờ' },
  { value: 'dates', label: 'Ngày tháng' },
  { value: 'existence_verbs', label: 'Động từ tồn tại' },
  { value: 'location_words', label: 'Từ chỉ địa điểm' },
  { value: 'location_sentences', label: 'Câu chỉ địa điểm' },
  { value: 'direction_words', label: 'Từ chỉ hướng' },
  { value: 'comparison', label: 'So sánh' },
  { value: 'expressions', label: 'Biểu hiện ngữ pháp' },
  { value: 'conditionals', label: 'Câu điều kiện' },
];

mkdirSync(dataDir, { recursive: true });

// Write individual lesson files
lessons.forEach((lesson) => {
  const lessonNum = String(lesson.lessonNumber).padStart(2, '0');
  const filePath = join(dataDir, `lesson-${lessonNum}.json`);
  const content = { ...lesson, grammars: lesson.grammars.map(g => {
    if (!g.notes) { const { notes, ...rest } = g; return rest; }
    return g;
  })};
  writeFileSync(filePath, JSON.stringify(lesson, null, 2) + '\n');
  console.log(`Written: lesson-${lessonNum}.json (${lesson.grammars.length} grammars)`);
});

// Write index.ts
const imports = lessons.map((l, i) => {
  const n = String(l.lessonNumber).padStart(2, '0');
  return `import lesson${n} from './lesson-${n}.json';`;
}).join('\n');

const exportLessons = lessons.map((l, i) => {
  const n = String(l.lessonNumber).padStart(2, '0');
  return `  lesson${n},`;
}).join('\n');

const indexContent = `// Auto-generated grammar index
${imports}

export const lessons = [
${exportLessons}
];

export const categories = ${JSON.stringify(categories, null, 2)};

export const levels = ['N5'];
`;

writeFileSync(join(dataDir, 'index.ts'), indexContent);
console.log('\nWritten: index.ts');
console.log('Done! All 25 lessons regenerated.');