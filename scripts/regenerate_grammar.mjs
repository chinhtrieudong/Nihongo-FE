import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data', 'grammar');
mkdirSync(dataDir, { recursive: true });

// Helper to add furigana to common kanji words
function addFurigana(text) {
  const furiganaMap = [
    // Common verbs
    [/行きます/g, '{行|い}きます'], [/来ます/g, '{来|き}ます'], [/帰ります/g, '{帰|かえ}ります'],
    [/食べます/g, '{食|た}べます'], [/飲みます/g, '{飲|の}みます'], [/勉強します/g, '{勉強|べんきょう}します'],
    [/働きます/g, '{働|はたら}きます'], [/住みます/g, '{住|す}みます'], [/書きます/g, '{書|か}きます'],
    [/読みます/g, '{読|よ}みます'], [/話します/g, '{話|はな}します'], [/待ちます/g, '{待|ま}ちます'],
    [/出ます/g, '{出|で}ます'], [/起きます/g, '{起|お}きます'], [/寝ます/g, '{寝|ね}ます'],
    [/洗います/g, '{洗|あら}います'], [/磨きます/g, '{磨|みが}きます'], [/登ります/g, '{登|のぼ}ります'],
    [/借ります/g, '{借|か}ります'], [/貸します/g, '{貸|か}します'], [/教えます/g, '{教|おし}えます'],
    [/診ます/g, '{診|み}ます'], [/翻訳します/g, '{翻訳|ほんやく}します'],
    [/集めます/g, '{集|あつ}めます'], [/作ります/g, '{作|つく}ります'],
    // ます form
    [/行って/g, '{行|い}って'], [/行った/g, '{行|い}った'], [/行く/g, '{行|い}く'],
    [/食べて/g, '{食|た}べて'], [/食べた/g, '{食|た}べた'], [/食べる/g, '{食|た}べる'],
    [/来て/g, '{来|き}て'], [/来た/g, '{来|き}た'], [/来る/g, '{来|く}る'],
    [/勉強して/g, '{勉強|べんきょう}して'], [/勉強した/g, '{勉強|べんきょう}した'],
    [/勉強し/g, '{勉強|べんきょう}し'],
    [/帰って/g, '{帰|かえ}って'], [/帰った/g, '{帰|かえ}った'],
    // Common nouns  
    [/私/g, '{私|わたし}'], [/学生/g, '{学生|がくせい}'], [/本/g, '{本|ほん}'],
    [/鉛筆/g, '{鉛筆|えんぴつ}'], [/車/g, '{車|くるま}'], [/学校/g, '{学校|がっこう}'],
    [/先生/g, '{先生|せんせい}'], [/友達/g, '{友達|ともだち}'], [/家族/g, '{家族|かぞく}'],
    [/子供/g, '{子供|こども}'], [/先生/g, '{先生|せんせい}'], [/先生/g, '{先生|せんせい}'],
    [/図書館/g, '{図書館|としょかん}'], [/病院/g, '{病院|びょういん}'], [/駅/g, '{駅|えき}'],
    [/銀行/g, '{銀行|ぎんこう}'], [/電話/g, '{電話|でんわ}'], [/音楽/g, '{音楽|おんがく}'],
    [/映画/g, '{映画|えいが}'], [/日本語/g, '{日本語|にほんご}'], [/英語/g, '{英語|えいご}'],
    [/料理/g, '{料理|りょうり}'], [/音楽/g, '{音楽|おんがく}'], [/猫/g, '{猫|ねこ}'],
    [/机/g, '{机|つくえ}'], [/椅子/g, '{椅子|いす}'], [/部屋/g, '{部屋|へや}'],
    [/庭/g, '{庭|にわ}'], [/出口/g, '{出口|でぐち}'], [/入口/g, '{入口|いりぐち}'],
    [/事務所/g, '{事務所|じむしょ}'], [/公園/g, '{公園|こうえん}'], [/切手/g, '{切手|きって}'],
    [/料理/g, '{料理|りょうり}'], [/質問/g, '{質問|しつもん}'], [/問題/g, '{問題|もんだい}'],
    [/富士山/g, '{富士山|ふじさん}'], [/京都/g, '{京都|きょうと}'], [/東京/g, '{東京|とうきょう}'],
    [/大阪/g, '{大阪|おおさか}'], [/京都/g, '{京都|きょうと}'], [/日本/g, '{日本|にほん}'],
    [/仕事/g, '{仕事|しごと}'], [/奥さん/g, '{奥|おく}さん'],
    // Numbers / counters
    [/一人/g, '{一人|ひとり}'], [/二人/g, '{二人|ふたり}'],
    [/三台/g, '{三台|さんだい}'], [/五枚/g, '{五枚|ごまい}'],
    // Adjectives
    [/高い/g, '{高|たか}い'], [/安い/g, '{安|やす}い'], [/新しい/g, '{新|あたら}しい'],
    [/古い/g, '{古|ふる}い'], [/面白い/g, '{面白|おもしろ}い'], [/大きい/g, '{大|おお}きい'],
    [/小さい/g, '{小|ちい}さい'], [/難しい/g, '{難|むずか}しい'], [/易しい/g, '{易|やさ}しい'],
    [/速い/g, '{速|はや}い'], [/美味しい/g, '{美味|おい}しい'], [/寒い/g, '{寒|さむ}い'],
    [/辛い/g, '{辛|から}い'], [/暑い/g, '{暑|あつ}い'], [/若い/g, '{若|わか}い'],
    [/楽しい/g, '{楽|たの}しい'], [/良い/g, '{良|い}い'],
    [/賑やか/g, '{賑|にぎ}やか'], [/静か/g, '{静|しず}か'], [/有名/g, '{有名|ゆうめい}'],
    [/好き/g, '{好|す}き'], [/嫌い/g, '{嫌|きら}い'], [/上手/g, '{上手|じょうず}'], [/下手/g, '{下手|へた}'],
    [/元気/g, '{元気|げんき}'], [/便利/g, '{便利|べんり}'],
    // Others
    [/皆さん/g, '{皆|みな}さん'], [/一緒に/g, '{一緒|いっしょ}に'],
    [/仕事/g, '{仕事|しごと}'], [/天気/g, '{天気|てんき}'],
    [/自分/g, '{自分|じぶん}'],
    // Time words
    [/今日/g, '{今日|きょう}'], [/昨日/g, '{昨日|きのう}'], [/明日/g, '{明日|あした}'],
    [/毎日/g, '{毎日|まいにち}'], [/今週/g, '{今週|こんしゅう}'], [/来週/g, '{来週|らいしゅう}'],
    [/毎日/g, '{毎日|まいにち}'],
    // Textbook
    [/趣味/g, '{趣味|しゅみ}'], [/約束/g, '{約束|やくそく}'],
    [/薬/g, '{薬|くすり}'], [/宿題/g, '{宿題|しゅくだい}'],
    [/税金/g, '{税金|ぜいきん}'], [/大学/g, '{大学|だいがく}'],
    [/会社/g, '{会社|かいしゃ}'], [/新聞/g, '{新聞|しんぶん}'],
    [/誕生日/g, '{誕生日|たんじょうび}'], [/留学/g, '{留学|りゅうがく}'],
    [/練習/g, '{練習|れんしゅう}'],
    // Colors
    [/赤い/g, '{赤|あか}い'], [/青い/g, '{青|あお}い'], [/白い/g, '{白|しろ}い'], [/黒い/g, '{黒|くろ}い'],
  ];
  
  let result = text;
  for (const [pattern, replacement] of furiganaMap) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// Apply furigana to all Japanese text in examples
function applyFuriganaToGrammars(grammars) {
  return grammars.map(g => ({
    ...g,
    examples: g.examples.map(ex => ({
      japanese: addFurigana(ex.japanese),
      vietnamese: ex.vietnamese,
    }))
  }));
}

const lessons = [
  {lessonNumber:1,level:"N5",title:"Câu danh từ",title_jp:"名詞文",description:"〜は〜です、〜は〜じゃありません、〜は〜ですか、〜も",
   grammars:applyFuriganaToGrammars([
    {id:"m1_01",title:"Khẳng định",pattern:"〜は〜です",meaning:"A là B",explanation:"Cấu trúc câu cơ bản. は đánh dấu chủ đề, です là \"thì/là\".",structure:"**[Danh từ1] は [Danh từ2] です**",examples:[{japanese:"私は学生です。",vietnamese:"Tôi là học sinh."},{japanese:"これは本です。",vietnamese:"Đây là sách."}],category:"basic_sentence_structure"},
    {id:"m1_02",title:"Phủ định",pattern:"〜は〜じゃありません",meaning:"A không phải B",explanation:"です → ではありません (trang trọng) / じゃありません (thân mật).",structure:"**[Danh từ1] は [Danh từ2] じゃありません**",examples:[{japanese:"私は学生じゃありません。",vietnamese:"Tôi không phải học sinh."},{japanese:"これは本じゃありません。",vietnamese:"Đây không phải sách."}],category:"negative_form"},
    {id:"m1_03",title:"Nghi vấn",pattern:"〜は〜ですか",meaning:"A có phải B không?",explanation:"Thêm か cuối câu tạo câu hỏi. Trả lời: はい、〜です。/ いいえ、〜じゃありません。",structure:"**[Danh từ1] は [Danh từ2] ですか**",examples:[{japanese:"あなたは学生ですか。",vietnamese:"Bạn là học sinh không?"},{japanese:"これは本ですか。",vietnamese:"Đây là sách không?"}],category:"questions"},
    {id:"m1_04",title:"Trợ từ も",pattern:"〜も〜です",meaning:"cũng là ~",explanation:"も thay は, nghĩa \"cũng\".",structure:"**[Danh từ] も [Danh từ] です**",examples:[{japanese:"私も学生です。",vietnamese:"Tôi cũng là học sinh."},{japanese:"これも本です。",vietnamese:"Đây cũng là sách."}],category:"basic_sentence_structure"}
  ])},
  {lessonNumber:2,level:"N5",title:"Chỉ định từ",title_jp:"こそあど言葉",description:"これ・それ・あれ, この・その・あの, そうです／そうじゃありません, の",
   grammars:applyFuriganaToGrammars([
    {id:"m2_01",title:"これ・それ・あれ",pattern:"これ/それ/あれ",meaning:"đây/đó/kia",explanation:"これ (gần tôi), それ (gần bạn), あれ (xa cả hai).",structure:"**これ/それ/あれ は [Danh từ] です**",examples:[{japanese:"これは本です。",vietnamese:"Đây là sách."},{japanese:"それは鉛筆ですか。",vietnamese:"Đó là bút chì không?"}],category:"demonstratives"},
    {id:"m2_02",title:"この・その・あの",pattern:"この/その/あの+[Danh từ]",meaning:"N này/đó/kia",explanation:"Bổ nghĩa cho danh từ đứng sau.",structure:"**この/その/あの [Danh từ] は〜です**",examples:[{japanese:"この本は私のです。",vietnamese:"Sách này là của tôi."},{japanese:"その鉛筆は誰のですか。",vietnamese:"Bút chì đó của ai?"}],category:"demonstratives"},
    {id:"m2_03",title:"そうです／そうじゃありません",pattern:"そうです/そうじゃありません",meaning:"đúng vậy/không phải",explanation:"Trả lời ngắn cho câu hỏi danh từ.",structure:"**そうです** / **そうじゃありません**",examples:[{japanese:"田中さんですか。→はい、そうです。",vietnamese:"Anh Tanaka? Vâng."},{japanese:"先生ですか。→いいえ、そうじゃありません。",vietnamese:"Giáo viên? Không."}],category:"questions"},
    {id:"m2_04",title:"の (sở hữu)",pattern:"〜の〜",meaning:"của",explanation:"Nối 2 danh từ, chỉ sở hữu.",structure:"**[Danh từ1] の [Danh từ2]**",examples:[{japanese:"私の本です。",vietnamese:"Sách của tôi."},{japanese:"これは私の本です。",vietnamese:"Đây là sách của tôi."}],category:"possessive"}
  ])},
  {lessonNumber:3,level:"N5",title:"Địa điểm",title_jp:"場所",description:"ここ・そこ・あそこ, こちら・そちら・あちら",
   grammars:applyFuriganaToGrammars([
    {id:"m3_01",title:"ここ・そこ・あそこ",pattern:"ここ/そこ/あそこ",meaning:"ở đây/đó/kia",explanation:"Chỉ địa điểm: ここ (gần tôi), そこ (gần bạn), あそこ (xa).",structure:"**[Địa điểm] は ここ/そこ/あそこ です**",examples:[{japanese:"トイレはあそこです。",vietnamese:"WC ở kia."},{japanese:"ここは学校です。",vietnamese:"Đây là trường."}],category:"location_words"},
    {id:"m3_02",title:"こちら・そちら・あちら",pattern:"こちら/そちら/あちら",meaning:"phía này/đó/kia (lịch sự)",explanation:"Lịch sự hơn ここ・そこ・あそこ.",structure:"**[Địa điểm] は こちら/そちら/あちら です**",examples:[{japanese:"事務所はこちらです。",vietnamese:"Văn phòng ở phía này."},{japanese:"出口はあちらです。",vietnamese:"Lối ra phía kia."}],category:"location_words"},
    {id:"m3_03",title:"Hỏi địa điểm",pattern:"〜はどこですか",meaning:"~ ở đâu?",explanation:"Dùng どこ để hỏi địa điểm.",structure:"**[Địa điểm] はどこですか**",examples:[{japanese:"学校はどこですか。",vietnamese:"Trường ở đâu?"},{japanese:"図書館はあそこです。",vietnamese:"Thư viện ở kia."}],category:"questions"}
  ])},
  {lessonNumber:4,level:"N5",title:"Thời gian & động từ",title_jp:"時間と動詞",description:"〜時〜分, 今・今日・明日, 〜から〜まで, ます・ません・ました・ませんでした",
   grammars:applyFuriganaToGrammars([
    {id:"m4_01",title:"Cách nói giờ",pattern:"〜時〜分です",meaning:"~ giờ ~ phút",explanation:"Số+時(じ)+分(ふん). Chú ý: 4時(よじ),7時(しちじ),9時(くじ).",structure:"**[Số]時[Số]分です**",examples:[{japanese:"今3時です。",vietnamese:"Bây giờ 3 giờ."},{japanese:"7時に起きます。",vietnamese:"Dậy lúc 7 giờ."}],category:"time_telling"},
    {id:"m4_02",title:"Từ chỉ thời gian",pattern:"今/今日/明日/昨日/毎日",meaning:"bây giờ/hôm nay/ngày mai/hôm qua/mỗi ngày",explanation:"Không dùng に với các từ này.",structure:"**[Từ TG] [Động từ]**",examples:[{japanese:"明日学校へ行きます。",vietnamese:"Mai tôi đi học."},{japanese:"毎日勉強します。",vietnamese:"Mỗi ngày tôi học."}],category:"time"},
    {id:"m4_03",title:"〜から〜まで",pattern:"〜から〜まで",meaning:"từ ~ đến ~",explanation:"から: điểm bắt đầu, まで: điểm kết thúc.",structure:"**[Bắt đầu]から[Kết thúc]まで**",examples:[{japanese:"9時から5時まで働きます。",vietnamese:"Làm từ 9h đến 5h."}],category:"time"},
    {id:"m4_04",title:"Thể ます",pattern:"ます/ません/ました/ませんでした",meaning:"làm/ko làm/đã làm/đã ko làm",explanation:"Các dạng lịch sự của động từ.",structure:"**[Thân động từ]+ます/ません/ました/ませんでした**",examples:[{japanese:"毎日勉強します。",vietnamese:"Mỗi ngày tôi học."},{japanese:"昨日勉強しませんでした。",vietnamese:"Hôm qua tôi ko học."}],category:"verb_forms"}
  ])},
  {lessonNumber:5,level:"N5",title:"Di chuyển & trợ từ",title_jp:"移動動詞と助詞",description:"行く・来る・帰る, へ, で, を, なんで",
   grammars:applyFuriganaToGrammars([
    {id:"m5_01",title:"行きます・来ます・帰ります",pattern:"行きます/来ます/帰ります",meaning:"đi/đến/về",explanation:"Ba động từ di chuyển cơ bản.",structure:"**[Địa điểm]へ[Động từ]**",examples:[{japanese:"日本へ行きます。",vietnamese:"Tôi đi Nhật."},{japanese:"家へ帰ります。",vietnamese:"Tôi về nhà."}],category:"direction_words"},
    {id:"m5_02",title:"へ (hướng)",pattern:"〜へ行きます",meaning:"đi về hướng ~",explanation:"へ(đọc là \"e\") chỉ hướng di chuyển.",structure:"**[Địa điểm]へ[Động từ di chuyển]**",examples:[{japanese:"学校へ行きます。",vietnamese:"Tôi đến trường."},{japanese:"駅へ行きます。",vietnamese:"Tôi ra ga."}],category:"direction_words"},
    {id:"m5_03",title:"で (phương tiện)",pattern:"〜で行きます",meaning:"đi bằng ~",explanation:"Chỉ phương tiện giao thông.",structure:"**[PT]で[Động từ]**",examples:[{japanese:"バスで学校へ行きます。",vietnamese:"Đi học bằng bus."},{japanese:"電車で行きます。",vietnamese:"Đi bằng tàu điện."}],category:"basic_sentence_structure"},
    {id:"m5_04",title:"を (rời khỏi) & なんで",pattern:"〜を出ます/なんで",meaning:"rời ~ / bằng gì",explanation:"を: rời khỏi nơi nào. なんで: phương tiện gì.",structure:"**[Địa điểm]を出ます** / **なんで〜か**",examples:[{japanese:"8時に家を出ます。",vietnamese:"8h rời nhà."},{japanese:"なんで行きますか。",vietnamese:"Đi bằng gì?"}],category:"basic_sentence_structure"}
  ])},
  {lessonNumber:6,level:"N5",title:"Ăn uống & trợ từ",title_jp:"飲食と助詞",description:"食べる・飲む, を, いっしょに, と",
   grammars:applyFuriganaToGrammars([
    {id:"m6_01",title:"食べます・飲みます",pattern:"食べます/飲みます",meaning:"ăn/uống",explanation:"Động từ ăn uống cơ bản. Dùng を chỉ đối tượng.",structure:"**[Đồ]を食べます/飲みます**",examples:[{japanese:"ご飯を食べます。",vietnamese:"Tôi ăn cơm."},{japanese:"コーヒーを飲みます。",vietnamese:"Tôi uống cafe."}],category:"verb_forms"},
    {id:"m6_02",title:"を (tân ngữ)",pattern:"〜を〜ます",meaning:"làm gì đó",explanation:"Đánh dấu tân ngữ trực tiếp của động từ.",structure:"**[Tân ngữ]を[Động từ]**",examples:[{japanese:"映画を見ます。",vietnamese:"Xem phim."},{japanese:"本を読みます。",vietnamese:"Đọc sách."}],category:"basic_sentence_structure"},
    {id:"m6_03",title:"いっしょに",pattern:"いっしょに〜ます",meaning:"cùng làm ~",explanation:"Đặt trước động từ, nghĩa \"cùng nhau\".",structure:"**いっしょに[Động từ]**",examples:[{japanese:"いっしょに勉強しましょう。",vietnamese:"Cùng học nào."},{japanese:"いっしょに食べます。",vietnamese:"Cùng ăn."}],category:"conjunctions"},
    {id:"m6_04",title:"と (với)",pattern:"〜と〜ます",meaning:"với ai",explanation:"Chỉ người cùng thực hiện hành động.",structure:"**[Người]と[Động từ]**",examples:[{japanese:"友達と映画を見ます。",vietnamese:"Xem phim với bạn."},{japanese:"誰と行きますか。",vietnamese:"Đi với ai?"}],category:"conjunctions"}
  ])},
  {lessonNumber:7,level:"N5",title:"Cho - Nhận - Mượn",title_jp:"授受動詞",description:"あげる・もらう・貸す・借りる・教える",
   grammars:applyFuriganaToGrammars([
    {id:"m7_01",title:"あげます",pattern:"〜に〜をあげます",meaning:"cho ai cái gì",explanation:"Người nói cho người khác.",structure:"**[Người cho]は[Người nhận]に[Vật]をあげます**",examples:[{japanese:"友達にプレゼントをあげます。",vietnamese:"Tặng quà cho bạn."},{japanese:"先生に花をあげました。",vietnamese:"Đã tặng hoa cho thầy."}],category:"expressions"},
    {id:"m7_02",title:"もらいます",pattern:"〜に〜をもらいます",meaning:"nhận từ ai",explanation:"Người nói nhận từ người khác.",structure:"**[Người nhận]は[Người cho]に[Vật]をもらいます**",examples:[{japanese:"先生に本をもらいました。",vietnamese:"Nhận sách từ thầy."},{japanese:"友達にペンをもらいました。",vietnamese:"Nhận bút từ bạn."}],category:"expressions"},
    {id:"m7_03",title:"かします・かります",pattern:"〜をかします/かります",meaning:"cho mượn/mượn",explanation:"かします: cho mượn. かります: mượn.",structure:"**[Người]に[Vật]をかします/かります**",examples:[{japanese:"本をかしました。",vietnamese:"Cho mượn sách."},{japanese:"本をかりました。",vietnamese:"Đã mượn sách."}],category:"expressions"},
    {id:"m7_04",title:"おしえます",pattern:"〜に〜をおしえます",meaning:"dạy/chỉ cho",explanation:"Dùng に(người) và を(nội dung).",structure:"**[Người]に[Nội dung]をおしえます**",examples:[{japanese:"日本語をおしえます。",vietnamese:"Dạy tiếng Nhật."},{japanese:"道をおしえてください。",vietnamese:"Chỉ đường giúp tôi."}],category:"expressions"}
  ])},
  {lessonNumber:8,level:"N5",title:"Tính từ",title_jp:"形容詞",description:"い形容詞, な形容詞, あまり〜ません, とても",
   grammars:applyFuriganaToGrammars([
    {id:"m8_01",title:"Tính từ い",pattern:"〜いです",meaning:"tính từ い",explanation:"Kết thúc bằng い. Bổ nghĩa danh từ không cần な.",structure:"**[~い]+です / [~い]+[Danh từ]**",examples:[{japanese:"この本は面白いです。",vietnamese:"Sách này thú vị."},{japanese:"高いビルです。",vietnamese:"Tòa nhà cao."}],category:"adjectives"},
    {id:"m8_02",title:"Tính từ な",pattern:"〜な+[Danh từ]/〜です",meaning:"tính từ な",explanation:"Thêm な khi bổ nghĩa danh từ. Cuối câu dùng です.",structure:"**[~な]+[Danh từ] / [~]+です**",examples:[{japanese:"静かな部屋です。",vietnamese:"Phòng yên tĩnh."},{japanese:"この町は賑やかです。",vietnamese:"Phố này nhộn nhịp."}],category:"adjectives"},
    {id:"m8_03",title:"あまり〜ません",pattern:"あまり〜ません",meaning:"không ~ lắm",explanation:"あまり + phủ định = \"không ~ lắm\".",structure:"**あまり[Tính từ/ĐT phủ định]**",examples:[{japanese:"あまり高くないです。",vietnamese:"Không đắt lắm."},{japanese:"あまり飲みません。",vietnamese:"Không uống lắm."}],category:"negative_form"},
    {id:"m8_04",title:"とても",pattern:"とても〜",meaning:"rất ~",explanation:"Đặt trước tính từ để nhấn mạnh.",structure:"**とても[Tính từ]です**",examples:[{japanese:"とても面白いです。",vietnamese:"Rất thú vị."},{japanese:"とてもきれいです。",vietnamese:"Rất đẹp."}],category:"adjectives"}
  ])},
  {lessonNumber:9,level:"N5",title:"Sở thích & năng lực",title_jp:"趣味と能力",description:"わかる, ある・いる, 好き・嫌い, 上手・下手",
   grammars:applyFuriganaToGrammars([
    {id:"m9_01",title:"わかります",pattern:"〜がわかります",meaning:"hiểu/biết ~",explanation:"Dùng が, không dùng を.",structure:"**[Danh từ]がわかります**",examples:[{japanese:"日本語がわかります。",vietnamese:"Tôi biết tiếng Nhật."},{japanese:"この問題がわかりません。",vietnamese:"Ko hiểu bài này."}],category:"expressions"},
    {id:"m9_02",title:"あります・います(sở hữu)",pattern:"〜があります/います",meaning:"có ~",explanation:"あります(đồ), います(người).",structure:"**[Người]は[Vật]があります/います**",examples:[{japanese:"車があります。",vietnamese:"Tôi có xe."},{japanese:"子供がいます。",vietnamese:"Tôi có con."}],category:"existence_verbs"},
    {id:"m9_03",title:"好き・嫌い",pattern:"〜が好き/嫌いです",meaning:"thích/ko thích ~",explanation:"Tính từ な. Dùng が.",structure:"**[Chủ thể]は[Đối tượng]が好き/嫌いです**",examples:[{japanese:"音楽が好きです。",vietnamese:"Thích nhạc."},{japanese:"納豆が嫌いです。",vietnamese:"Ghét natto."}],category:"expressions"},
    {id:"m9_04",title:"上手・下手",pattern:"〜が上手/下手です",meaning:"giỏi/kém ~",explanation:"Tính từ な. Dùng が.",structure:"**[Chủ thể]は[Kỹ năng]が上手/下手です**",examples:[{japanese:"料理が上手です。",vietnamese:"Nấu ăn giỏi."},{japanese:"スポーツが下手です。",vietnamese:"Thể thao kém."}],category:"expressions"}
  ])},
  {lessonNumber:10,level:"N5",title:"Vị trí",title_jp:"位置",description:"ある・いる(vị trí), 上・下・中, や",
   grammars:applyFuriganaToGrammars([
    {id:"m10_01",title:"あります(vị trí)",pattern:"〜に〜があります",meaning:"ở ~ có ~",explanation:"Đồ vật tồn tại ở đâu.",structure:"**[Địa điểm]に[Đồ vật]があります**",examples:[{japanese:"机の上に本があります。",vietnamese:"Trên bàn có sách."},{japanese:"部屋にテレビがあります。",vietnamese:"Phòng có TV."}],category:"existence_verbs"},
    {id:"m10_02",title:"います(vị trí)",pattern:"〜に〜がいます",meaning:"ở ~ có ~ (người/vật)",explanation:"Người, động vật tồn tại ở đâu.",structure:"**[Địa điểm]に[Người/ĐV]がいます**",examples:[{japanese:"庭に猫がいます。",vietnamese:"Trong vườn có mèo."},{japanese:"学校に先生がいます。",vietnamese:"Trường có giáo viên."}],category:"existence_verbs"},
    {id:"m10_03",title:"上・下・中・前・後ろ・隣",pattern:"〜の[Vị trí]に",meaning:"trên/dưới/trong/trước/sau/cạnh",explanation:"Kết hợp の + vị trí + に.",structure:"**[Nơi]の[Vị trí]に[Đồ]があります**",examples:[{japanese:"机の上に本があります。",vietnamese:"Trên bàn có sách."},{japanese:"猫は椅子の下にいます。",vietnamese:"Mèo ở dưới ghế."}],category:"location_words"},
    {id:"m10_04",title:"や (liệt kê)",pattern:"〜や〜など",meaning:"~, ~ v.v.",explanation:"Liệt kê một phần, không đầy đủ.",structure:"**[Danh từ1]や[Danh từ2](など)**",examples:[{japanese:"本や鉛筆があります。",vietnamese:"Có sách, bút v.v."},{japanese:"京都や大阪へ行きました。",vietnamese:"Đã đi Kyoto, Osaka v.v."}],category:"conjunctions"}
  ])},
  {lessonNumber:11,level:"N5",title:"Số lượng",title_jp:"数量",description:"〜人, 〜台・〜枚・〜本, どのくらい",
   grammars:applyFuriganaToGrammars([
    {id:"m11_01",title:"Đếm người",pattern:"〜人",meaning:"~ người",explanation:"1人(ひとり),2人(ふたり),3人(さんにん),4人(よにん).",structure:"**[Số]人**",examples:[{japanese:"家族は4人です。",vietnamese:"GĐ có 4 người."},{japanese:"学生が10人います。",vietnamese:"Có 10 học sinh."}],category:"expressions"},
    {id:"m11_02",title:"Đơn vị đếm",pattern:"〜台/枚/本/冊/杯/匹",meaning:"~ cái/tờ/cây/quyển/chén/con",explanation:"台(máy), 枚(vật mỏng), 本(vật dài), 冊(sách), 杯(ly), 匹(động vật).",structure:"**[Số]+[Đơn vị]**",examples:[{japanese:"車が2台あります。",vietnamese:"Có 2 xe."},{japanese:"紙を5枚ください。",vietnamese:"Cho 5 tờ giấy."}],category:"expressions"},
    {id:"m11_03",title:"どのくらい",pattern:"どのくらい",meaning:"bao nhiêu/lâu",explanation:"Hỏi số lượng hoặc thời gian.",structure:"**どのくらい〜か**",examples:[{japanese:"どのくらい勉強しましたか。",vietnamese:"Học bao lâu rồi?"},{japanese:"どのくらいですか。",vietnamese:"Bao nhiêu?"}],category:"questions"}
  ])},
  {lessonNumber:12,level:"N5",title:"So sánh",title_jp:"比較",description:"Quá khứ tính từ, より, のほうが, いちばん",
   grammars:applyFuriganaToGrammars([
    {id:"m12_01",title:"Quá khứ tính từ",pattern:"〜かった/でした",meaning:"đã ~",explanation:"い: bỏい+かった. な: +でした.",structure:"**[い]→かった / [な]+でした**",examples:[{japanese:"昨日は寒かったです。",vietnamese:"Hôm qua lạnh."},{japanese:"京都は賑やかでした。",vietnamese:"Kyoto nhộn nhịp."}],category:"adjectives"},
    {id:"m12_02",title:"〜より",pattern:"〜より〜",meaning:"hơn",explanation:"AはBより = A hơn B.",structure:"**[A]は[B]より[Tính từ]です**",examples:[{japanese:"東京は大阪より大きい。",vietnamese:"Tokyo lớn hơn Osaka."},{japanese:"日本語は英語より難しい。",vietnamese:"Nhật khó hơn Anh."}],category:"comparison"},
    {id:"m12_03",title:"〜のほうが",pattern:"〜のほうが〜",meaning:"~ hơn",explanation:"のほうが đánh dấu cái vượt trội.",structure:"**[B]のほうが[A]より[Tính từ]です**",examples:[{japanese:"大阪のほうが安いです。",vietnamese:"Osaka rẻ hơn."},{japanese:"電車のほうが速いです。",vietnamese:"Tàu nhanh hơn."}],category:"comparison"},
    {id:"m12_04",title:"いちばん",pattern:"〜でいちばん〜",meaning:"nhất",explanation:"いちばん = nhất. で = phạm vi.",structure:"**[Phạm vi]でいちばん[Tính từ]です**",examples:[{japanese:"日本でいちばん高い山は富士山。",vietnamese:"Núi cao nhất NB là Phú Sĩ."}],category:"comparison"}
  ])},
  {lessonNumber:13,level:"N5",title:"〜たい",title_jp:"希望",description:"〜たい, 〜へ行きたい, 〜ませんか",
   grammars:applyFuriganaToGrammars([
    {id:"m13_01",title:"〜たい",pattern:"〜たいです",meaning:"muốn làm ~",explanation:"Thân động từ + たい (tính từ い).",structure:"**[ThânĐT]+たいです**",examples:[{japanese:"日本へ行きたいです。",vietnamese:"Muốn đi Nhật."},{japanese:"すしを食べたいです。",vietnamese:"Muốn ăn sushi."}],category:"expressions"},
    {id:"m13_02",title:"〜へ行きたい",pattern:"〜へ行きたいです",meaning:"muốn đi ~",explanation:"Địa điểm + へ + 行きたい.",structure:"**[Địa điểm]へ行きたいです**",examples:[{japanese:"日本へ行きたいです。",vietnamese:"Muốn đi Nhật."},{japanese:"どこへ行きたいですか。",vietnamese:"Muốn đi đâu?"}],category:"expressions"},
    {id:"m13_03",title:"〜ませんか",pattern:"〜ませんか",meaning:"cùng ~ không?",explanation:"Rủ rê lịch sự.",structure:"**[ThânĐT]+ませんか**",examples:[{japanese:"いっしょに食べませんか。",vietnamese:"Cùng ăn không?"},{japanese:"映画を見ませんか。",vietnamese:"Xem phim không?"}],category:"verb_forms"}
  ])},
  {lessonNumber:14,level:"N5",title:"Thể て",title_jp:"て形",description:"Cách chia thể て, 〜てください",
   grammars:applyFuriganaToGrammars([
    {id:"m14_01",title:"Chia thể て",pattern:"〜て",meaning:"thể て",explanation:"Nhóm1: う・つ・る→って, む・ぶ・ぬ→んで, く→いて, ぐ→いで, す→して. Nhóm2: bỏる+て. Nhóm3: する→して, 来る→来て.",structure:"**[Động từ thể て]**",examples:[{japanese:"朝起きて、歯を磨きます。",vietnamese:"Dậy, đánh răng."},{japanese:"学校に行って、勉強します。",vietnamese:"Đến trường, học."}],category:"verb_forms"},
    {id:"m14_02",title:"〜てください",pattern:"〜てください",meaning:"hãy/vui lòng ~",explanation:"Yêu cầu lịch sự.",structure:"**[ĐT thể て]ください**",examples:[{japanese:"名前を書いてください。",vietnamese:"Viết tên."},{japanese:"ここで待ってください。",vietnamese:"Đợi ở đây."}],category:"verb_forms"}
  ])},
  {lessonNumber:15,level:"N5",title:"Xin phép & cấm",title_jp:"許可と禁止",description:"〜てもいいです, 〜てはいけません",
   grammars:applyFuriganaToGrammars([
    {id:"m15_01",title:"〜てもいいです",pattern:"〜てもいいですか",meaning:"có thể ~ không?",explanation:"Xin phép lịch sự. Trả lời: はい、いいですよ。",structure:"**[ĐT thể て]もいいですか**",examples:[{japanese:"座ってもいいですか。",vietnamese:"Ngồi được ko?"},{japanese:"写真を撮ってもいいですか。",vietnamese:"Chụp ảnh được ko?"}],category:"verb_forms"},
    {id:"m15_02",title:"〜てはいけません",pattern:"〜てはいけません",meaning:"không được ~",explanation:"Diễn tả điều cấm.",structure:"**[ĐT thể て]はいけません**",examples:[{japanese:"タバコを吸ってはいけません。",vietnamese:"Ko được hút thuốc."},{japanese:"スマホを使ってはいけません。",vietnamese:"Ko được dùng đt."}],category:"verb_forms"}
  ])},
  {lessonNumber:16,level:"N5",title:"〜ています",title_jp:"〜ています",description:"Đang làm, nghề nghiệp/trạng thái, 〜ても",
   grammars:applyFuriganaToGrammars([
    {id:"m16_01",title:"Đang làm",pattern:"〜ています",meaning:"đang ~",explanation:"Diễn tả hành động đang diễn ra.",structure:"**[ĐT thể て]います**",examples:[{japanese:"今勉強しています。",vietnamese:"Đang học."},{japanese:"雨が降っています。",vietnamese:"Trời đang mưa."}],category:"verb_forms"},
    {id:"m16_02",title:"Nghề/trạng thái",pattern:"〜ています",meaning:"đang là ~",explanation:"Dùng cho nghề nghiệp, nơi ở.",structure:"**[ĐT thể て]います**",examples:[{japanese:"銀行で働いています。",vietnamese:"Làm ở ngân hàng."},{japanese:"京都に住んでいます。",vietnamese:"Sống ở Kyoto."}],category:"verb_forms"},
    {id:"m16_03",title:"〜ても",pattern:"〜ても",meaning:"dù ~",explanation:"Dù có làm gì đi nữa.",structure:"**[ĐT thể て]も**",examples:[{japanese:"雨が降っても行きます。",vietnamese:"Dù mưa cũng đi."},{japanese:"高くても買います。",vietnamese:"Dù đắt cũng mua."}],category:"verb_forms"}
  ])},
  {lessonNumber:17,level:"N5",title:"Thể ない",title_jp:"否定形",description:"〜ないでください, 〜なければなりません, 〜なくてもいいです",
   grammars:applyFuriganaToGrammars([
    {id:"m17_01",title:"〜ないでください",pattern:"〜ないでください",meaning:"xin đừng ~",explanation:"Yêu cầu phủ định lịch sự.",structure:"**[ĐT thể ない]でください**",examples:[{japanese:"タバコを吸わないでください。",vietnamese:"Đừng hút thuốc."},{japanese:"写真を撮らないでください。",vietnamese:"Đừng chụp ảnh."}],category:"verb_forms"},
    {id:"m17_02",title:"〜なければなりません",pattern:"〜なければなりません",meaning:"phải ~",explanation:"Diễn tả nghĩa vụ. Văn nói: なきゃ。",structure:"**[ないthân]+ければなりません**",examples:[{japanese:"宿題をしなければなりません。",vietnamese:"Phải làm bài tập."},{japanese:"薬を飲まなければなりません。",vietnamese:"Phải uống thuốc."}],category:"expressions"},
    {id:"m17_03",title:"〜なくてもいいです",pattern:"〜なくてもいいです",meaning:"ko cần ~",explanation:"Không cần phải làm.",structure:"**[ないthân]+くてもいいです**",examples:[{japanese:"明日来なくてもいいです。",vietnamese:"Mai ko cần đến."},{japanese:"全部食べなくてもいいです。",vietnamese:"Ko cần ăn hết."}],category:"expressions"}
  ])},
  {lessonNumber:18,level:"N5",title:"Từ điển & khả năng",title_jp:"辞書形と可能",description:"辞書形, 〜ことができる, 趣味〜こと",
   grammars:applyFuriganaToGrammars([
    {id:"m18_01",title:"Thể từ điển",pattern:"〜(thể từ điển)",meaning:"làm ~ (thường)",explanation:"Nhóm1: kết thúc bằng う. Nhóm2: bằng る. Nhóm3: する, 来る.",structure:"**[Động từ thể từ điển]**",examples:[{japanese:"毎日学校へ行く。",vietnamese:"Mỗi ngày đi học."},{japanese:"朝ご飯を食べる。",vietnamese:"Ăn sáng."}],category:"verb_forms"},
    {id:"m18_02",title:"〜ことができます",pattern:"〜ことができます",meaning:"có thể ~",explanation:"Thể từ điển + ことができます.",structure:"**[ĐT từ điển]ことができます**",examples:[{japanese:"日本語を話すことができます。",vietnamese:"Có thể nói tiếng Nhật."},{japanese:"泳ぐことができません。",vietnamese:"Ko thể bơi."}],category:"verb_forms"},
    {id:"m18_03",title:"趣味〜こと",pattern:"趣味は〜ことです",meaning:"sở thích là ~",explanation:"こと danh từ hóa động từ.",structure:"**趣味は[ĐT từ điển]ことです**",examples:[{japanese:"趣味は本を読むことです。",vietnamese:"Thích đọc sách."},{japanese:"趣味は料理を作ることです。",vietnamese:"Thích nấu ăn."}],category:"expressions"}
  ])},
  {lessonNumber:19,level:"N5",title:"Thể た",title_jp:"た形",description:"〜た形, 〜たことがある, 〜たり〜たり",
   grammars:applyFuriganaToGrammars([
    {id:"m19_01",title:"Chia thể た",pattern:"〜た",meaning:"thể た",explanation:"Giống thể て: って→った, んで→んだ, いて→いた, して→した.",structure:"**[Động từ thể た]**",examples:[{japanese:"昨日勉強した。",vietnamese:"Hqua đã học."},{japanese:"ご飯を食べた。",vietnamese:"Đã ăn cơm."}],category:"verb_forms"},
    {id:"m19_02",title:"〜たことがある",pattern:"〜たことがあります",meaning:"đã từng ~",explanation:"Diễn tả kinh nghiệm.",structure:"**[ĐT thể た]ことがあります**",examples:[{japanese:"富士山に登ったことがあります。",vietnamese:"Đã từng leo Phú Sĩ."},{japanese:"すしを食べたことがあります。",vietnamese:"Đã từng ăn sushi."}],category:"expressions"},
    {id:"m19_03",title:"〜たり〜たり",pattern:"〜たり〜たりします",meaning:"làm như ~,~",explanation:"Liệt kê hành động tiêu biểu.",structure:"**[ĐTた]り、[ĐTた]りします**",examples:[{japanese:"本を読んだり、映画を見たりします。",vietnamese:"Đọc sách, xem phim..."},{japanese:"散歩したり、買い物したりします。",vietnamese:"Đi dạo, mua sắm..."}],category:"verb_forms"}
  ])},
  {lessonNumber:20,level:"N5",title:"Thể thường",title_jp:"普通形",description:"普通形, 〜と思う, 〜と言う",
   grammars:applyFuriganaToGrammars([
    {id:"m20_01",title:"Thể thường",pattern:"普通形",meaning:"thể thường (thân mật)",explanation:"ĐT: 食べる/食べない/食べた. いadj: 高い/高くない/高かった. なadj: 静かだ/じゃない/だった. N: 学生だ/じゃない/だった.",structure:"**[Thể thường của ĐT/TT/Danh từ]**",examples:[{japanese:"毎日学校へ行く。",vietnamese:"Mỗi ngày đi học."},{japanese:"この本は面白い。",vietnamese:"Sách này thú vị."}],category:"verb_forms"},
    {id:"m20_02",title:"〜と思う",pattern:"〜と思います",meaning:"tôi nghĩ ~",explanation:"Dùng thể thường trước と.",structure:"**[Câu thể thường]と思います**",examples:[{japanese:"明日は晴れると思います。",vietnamese:"Tôi nghĩ mai nắng."},{japanese:"日本語は難しいと思います。",vietnamese:"Tôi nghĩ Nhật khó."}],category:"expressions"},
    {id:"m20_03",title:"〜と言う",pattern:"〜と言います",meaning:"nói rằng ~",explanation:"Dẫn lời nói.",structure:"**[Nội dung]と言います**",examples:[{japanese:"明日来ると言いました。",vietnamese:"Anh ấy nói mai đến."},{japanese:"行きたいと言っています。",vietnamese:"Anh ấy nói muốn đi."}],category:"expressions"}
  ])},
  {lessonNumber:21,level:"N5",title:"Suy nghĩ & đoán",title_jp:"意志と推量",description:"〜と思っている, 〜でしょう",
   grammars:applyFuriganaToGrammars([
    {id:"m21_01",title:"〜と思っている",pattern:"〜と思っています",meaning:"nghĩ rằng (đang nghĩ)",explanation:"Suy nghĩ tiếp diễn hoặc ý kiến lâu dài.",structure:"**[Thể thường]と思っています**",examples:[{japanese:"日本はいい国だと思っています。",vietnamese:"Tôi nghĩ NB là nước tốt."}],category:"expressions"},
    {id:"m21_02",title:"〜でしょう",pattern:"〜でしょう",meaning:"chắc là ~",explanation:"Phỏng đoán (mức độ chắc chắn cao).",structure:"**[Thể thường]でしょう**",examples:[{japanese:"明日は雨でしょう。",vietnamese:"Chắc mai mưa."},{japanese:"彼は来ないでしょう。",vietnamese:"Chắc anh ấy ko đến."}],category:"expressions"}
  ])},
  {lessonNumber:22,level:"N5",title:"Trước/Sau",title_jp:"前と後",description:"〜前に, 〜てから",
   grammars:applyFuriganaToGrammars([
    {id:"m22_01",title:"〜前に",pattern:"〜前に、〜",meaning:"trước khi ~",explanation:"Thể từ điển + 前に.",structure:"**[ĐT từ điển]前に、[Hành động]**",examples:[{japanese:"食べる前に、手を洗います。",vietnamese:"Trước khi ăn, rửa tay."},{japanese:"寝る前に、歯を磨きます。",vietnamese:"Trước ngủ, đánh răng."}],category:"time"},
    {id:"m22_02",title:"〜てから",pattern:"〜てから、〜",meaning:"sau khi ~",explanation:"Thể て + から.",structure:"**[ĐT thể て]から、[Hành động]**",examples:[{japanese:"勉強してから、寝ます。",vietnamese:"Học xong rồi ngủ."},{japanese:"食べてから、出かけます。",vietnamese:"Ăn xong rồi ra ngoài."}],category:"time"}
  ])},
  {lessonNumber:23,level:"N5",title:"Khi - Trong lúc",title_jp:"時・同時",description:"〜とき, 〜と, 〜ながら",
   grammars:applyFuriganaToGrammars([
    {id:"m23_01",title:"〜とき",pattern:"〜とき、〜",meaning:"khi ~",explanation:"ときchưa xảy ra: thể từ điển. ときđã xảy ra: thể た.",structure:"**[Thể thường]とき、[Mệnh đề]**",examples:[{japanese:"子供のとき、日本に住んでいました。",vietnamese:"Khi nhỏ, sống ở Nhật."},{japanese:"駅に着いたとき、電話します。",vietnamese:"Khi đến ga, sẽ gọi."}],category:"time"},
    {id:"m23_02",title:"〜と",pattern:"〜と、〜",meaning:"khi ~ thì ~",explanation:"Kết quả tất yếu, không dùng ý chí.",structure:"**[Mệnh đề1]と、[Mệnh đề2]**",examples:[{japanese:"春になると、花が咲きます。",vietnamese:"Xuân đến, hoa nở."},{japanese:"ボタンを押すと、開きます。",vietnamese:"Ấn nút thì mở."}],category:"conjunctions"},
    {id:"m23_03",title:"〜ながら",pattern:"〜ながら〜ます",meaning:"vừa ~ vừa ~",explanation:"Hai hành động xảy ra đồng thời.",structure:"**[ThânĐT]ながら[ĐT chính]**",examples:[{japanese:"音楽を聞きながら勉強します。",vietnamese:"Vừa nghe nhạc vừa học."},{japanese:"テレビを見ながら食べます。",vietnamese:"Vừa xem TV vừa ăn."}],category:"conjunctions"}
  ])},
  {lessonNumber:24,level:"N5",title:"Đưa nhận thể て",title_jp:"授受のて形",description:"〜くれる, 〜てくれる, 〜てもらう",
   grammars:applyFuriganaToGrammars([
    {id:"m24_01",title:"くれる",pattern:"〜が〜をくれます",meaning:"ai đó cho tôi",explanation:"Người khác cho tôi (từ ngoài vào trong).",structure:"**[Người]は[Người(tôi)]に[Vật]をくれます**",examples:[{japanese:"母は本をくれました。",vietnamese:"Mẹ cho tôi sách."},{japanese:"友達がチョコをくれました。",vietnamese:"Bạn cho tôi socola."}],category:"expressions"},
    {id:"m24_02",title:"〜てくれる",pattern:"〜てくれます",meaning:"làm ~ cho tôi",explanation:"Ai đó làm gì cho tôi.",structure:"**[Người]は[ĐT thể て]くれます**",examples:[{japanese:"友達が日本語を教えてくれます。",vietnamese:"Bạn dạy Nhật cho tôi."},{japanese:"先生が本を貸してくれました。",vietnamese:"Thầy cho mượn sách."}],category:"expressions"},
    {id:"m24_03",title:"〜てもらう",pattern:"〜てもらいます",meaning:"nhờ ai ~",explanation:"Nhờ ai làm gì cho mình.",structure:"**[Người]に[ĐT thể て]もらいます**",examples:[{japanese:"医者に診てもらいます。",vietnamese:"Nhờ bác sĩ khám."},{japanese:"友達に翻訳してもらいました。",vietnamese:"Nhờ bạn dịch."}],category:"expressions"}
  ])},
  {lessonNumber:25,level:"N5",title:"Điều kiện",title_jp:"条件",description:"〜たら, 〜ても, もし",
   grammars:applyFuriganaToGrammars([
    {id:"m25_01",title:"〜たら",pattern:"〜たら、〜",meaning:"nếu ~ thì ~",explanation:"Điều kiện phổ biến nhất. Thể た+ら.",structure:"**[Thể た]+ら、[Kết quả]**",examples:[{japanese:"雨が降ったら、出かけません。",vietnamese:"Nếu mưa thì ko ra ngoài."},{japanese:"安かったら、買います。",vietnamese:"Nếu rẻ thì mua."}],category:"conditionals"},
    {id:"m25_02",title:"〜ても",pattern:"〜ても",meaning:"dù ~",explanation:"Dù có ~ thì vẫn...",structure:"**[ĐT thể て]も**",examples:[{japanese:"雨が降っても行きます。",vietnamese:"Dù mưa cũng đi."},{japanese:"高くても買います。",vietnamese:"Dù đắt cũng mua."}],category:"conditionals"},
    {id:"m25_03",title:"もし",pattern:"もし〜たら",meaning:"nếu (giả định)",explanation:"Thêm もし để nhấn mạnh giả định.",structure:"**もし[Câu điều kiện]、[Kết quả]**",examples:[{japanese:"もし時間があったら、行きましょう。",vietnamese:"Nếu có TG, cùng đi."}],category:"conditionals"}
  ])}
];

const categories = [
  {value:"basic_sentence_structure",label:"Cấu trúc câu"},
  {value:"questions",label:"Câu hỏi"},
  {value:"possessive",label:"Sở hữu"},
  {value:"demonstratives",label:"Chỉ định từ"},
  {value:"adjectives",label:"Tính từ"},
  {value:"negative_form",label:"Phủ định"},
  {value:"verb_forms",label:"Động từ"},
  {value:"conjunctions",label:"Liên từ"},
  {value:"time",label:"Thời gian"},
  {value:"time_telling",label:"Cách nói giờ"},
  {value:"existence_verbs",label:"Động từ tồn tại"},
  {value:"location_words",label:"Từ chỉ địa điểm"},
  {value:"direction_words",label:"Từ chỉ hướng"},
  {value:"comparison",label:"So sánh"},
  {value:"expressions",label:"Biểu hiện"},
  {value:"conditionals",label:"Điều kiện"},
];

lessons.forEach(lesson => {
  const n = String(lesson.lessonNumber).padStart(2,'0');
  writeFileSync(join(dataDir,`lesson-${n}.json`), JSON.stringify(lesson,null,2)+'\n');
});

const imports = lessons.map(l => `import lesson${String(l.lessonNumber).padStart(2,'0')} from './lesson-${String(l.lessonNumber).padStart(2,'0')}.json';`).join('\n');
const exports = lessons.map(l => `  lesson${String(l.lessonNumber).padStart(2,'0')},`).join('\n');

writeFileSync(join(dataDir,'index.ts'), `// Grammar index - Minna N5\n${imports}\n\nexport const lessons = [\n${exports}\n];\n\nexport const categories = ${JSON.stringify(categories,null,2)};\n\nexport const levels = ['N5'];\n`);

console.log('✅ Regenerated all 25 lessons with furigana!');