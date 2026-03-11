import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { lessonAPI } from "../services/api";

type RadicalDetailData = {
  symbol: string;
  hanviet?: string;
  name_vi?: string;
  meaning?: string;
  stroke_count?: number;
  kanji_count?: number;
};

type KanjiSummary = {
  _id: string;
  character: string;
  hanviet?: string;
  meaning_vi?: string;
  stroke_count?: number;
  jlpt_level?: string;
};

type DemoWord = {
  word: string;
  reading: string;
  meaning: string;
};

const JLPT_BADGE_CLASS: Record<string, string> = {
  N5: "bg-emerald-50 text-emerald-700 border-emerald-200",
  N4: "bg-sky-50 text-sky-700 border-sky-200",
  N3: "bg-amber-50 text-amber-700 border-amber-200",
  N2: "bg-orange-50 text-orange-700 border-orange-200",
  N1: "bg-rose-50 text-rose-700 border-rose-200",
};

const RadicalDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [radical, setRadical] = useState<RadicalDetailData | null>(null);
  const [items, setItems] = useState<KanjiSummary[]>([]);
  const [vocabularyWords, setVocabularyWords] = useState<DemoWord[]>([]);
  const listFromPath = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    const loadData = async () => {
      if (!symbol) return;
      setLoading(true);
      try {
        const [radicalResponse, kanjiResponse] = await Promise.all([
          lessonAPI.getRadicalDetail(symbol),
          lessonAPI.getKanjiByRadical(symbol, 1, 40),
        ]);

        const kanjiItems: KanjiSummary[] = kanjiResponse?.data?.items || [];
        setRadical(radicalResponse?.data || null);
        setItems(kanjiItems);

        const chars = kanjiItems.slice(0, 5).map((item) => item.character);
        const detailResponses = await Promise.all(
          chars.map((char) => lessonAPI.getKanji(char).catch(() => null)),
        );

        const endpointWords: DemoWord[] = detailResponses
          .flatMap((res: any) => res?.data?.vocabulary_examples || [])
          .map((word: any) => ({
            word: word.word || "",
            reading: word.hiragana || "",
            meaning: word.meaning_vi || "",
          }))
          .filter((word: DemoWord) => Boolean(word.word))
          .filter(
            (word: DemoWord, index: number, arr: DemoWord[]) =>
              arr.findIndex(
                (w) => w.word === word.word && w.reading === word.reading,
              ) === index,
          )
          .slice(0, 9);

        setVocabularyWords(endpointWords);
      } catch (error) {
        console.error("Failed to load radical detail:", error);
        setRadical(null);
        setItems([]);
        setVocabularyWords([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [symbol]);

  const handleBack = () => {
    const fromPath = (location.state as { from?: string } | null)?.from;
    if (fromPath) {
      navigate(fromPath);
      return;
    }
    navigate("/kanji?stroke=radical214");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!radical) {
    return (
      <div className="text-center py-10">
        <p className="text-secondary-700">Không tìm thấy thông tin bộ thủ.</p>
      </div>
    );
  }

  const displaySymbol = radical.symbol || symbol || "—";
  const kanjiCount = radical.kanji_count ?? items.length;

  return (
    <div className="min-h-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <button
        onClick={handleBack}
        className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:text-slate-900"
      >
        <ArrowLeftOutlined />
        Về danh sách bộ thủ
      </button>

      <div className="mb-4 rounded-2xl border border-[#d5dfef] bg-[#d6e4f8] bg-[linear-gradient(to_right,rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:24px_24px] p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[160px_minmax(0,1fr)] gap-4 sm:gap-5">
          <div className="rounded-2xl border border-white/70 bg-white/70 p-4 flex flex-col items-center justify-center text-center">
            <div className="text-[68px] sm:text-[80px] leading-none font-kosugi text-[#1f2a44]">
              {displaySymbol}
            </div>
            <div className="mt-1 text-sm font-medium text-[#334155]">
              {radical.hanviet || radical.name_vi || "Bộ thủ"}
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-4xl font-semibold leading-tight text-[#2a2f3f]">
              Bộ thủ <span className="font-kosugi">{displaySymbol}</span>
            </h1>
            <p className="mt-1 text-sm sm:text-lg text-[#2c3853]">
              {radical.hanviet || radical.name_vi || "Không rõ tên"} •{" "}
              {radical.meaning || "Không có nghĩa"}
            </p>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Số nét
                </div>
                <div className="text-lg font-semibold text-slate-800">
                  {radical.stroke_count ?? "-"}
                </div>
              </div>
              <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Số Kanji
                </div>
                <div className="text-lg font-semibold text-slate-800">
                  {kanjiCount}
                </div>
              </div>
              <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2 col-span-2 sm:col-span-1">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Mã bộ thủ
                </div>
                <div className="text-lg font-semibold text-slate-800">
                  {displaySymbol}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e6e8ee] bg-white/95 p-4 sm:p-5 mb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#1f2a44]">Kanji theo bộ thủ</h2>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            {items.length} mục
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center text-secondary-600">
            Chưa có Kanji nào cho bộ thủ này.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {items.map((item) => (
              <button
                key={item._id}
                className="rounded-xl border-2 border-slate-200 bg-white p-3 text-left transition-all hover:border-slate-400 hover:shadow-sm"
                onClick={() =>
                  navigate(`/kanji/${item.character}`, {
                    state: {
                      from: `${location.pathname}${location.search}`,
                      fromRadicalList: listFromPath,
                    },
                  })
                }
              >
                <div className="text-4xl font-kosugi leading-none text-center mb-2 text-[#1f2a44]">
                  {item.character}
                </div>
                <div className="text-sm sm:text-[15px] font-semibold leading-tight truncate text-slate-800 mb-1 text-center">
                  {item.hanviet || "-"}
                </div>
                <div className="text-[11px] text-secondary-600 truncate">
                  {item.meaning_vi || "-"}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {item.stroke_count ?? "-"} nét
                  </span>
                  {item.jlpt_level ? (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        JLPT_BADGE_CLASS[item.jlpt_level] ||
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {item.jlpt_level}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#e6e8ee] bg-white/95 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-[#1f2a44] mb-3">Từ vựng tham khảo</h2>
        {vocabularyWords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center text-secondary-600">
            Chưa có dữ liệu từ vựng từ endpoint cho bộ thủ này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vocabularyWords.map((word, index) => (
              <div
                key={`${word.word}-${index}`}
                className="rounded-xl border border-secondary-200 bg-slate-50/60 p-3"
              >
                <div className="text-lg font-semibold text-slate-900">{word.word}</div>
                <div className="text-sm text-secondary-600">{word.reading}</div>
                <div className="text-sm text-slate-700">{word.meaning}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RadicalDetail;
