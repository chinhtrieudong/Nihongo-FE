import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Spin, Button } from "antd";
import { lessonAPI } from "../services/api";

type RadicalDetailData = {
  symbol: string;
  hanviet?: string;
  name_vi?: string;
  meaning?: string;
  meaningVi?: string;
  jlpt?: string;
  stroke_count?: number;
  kanji_count?: number;
  variants?: string[];
  example_kanji?: Array<{
    kanji: string;
    hanviet?: string;
    meaning_vi?: string;
  }>;
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

const normalizeJlptLevel = (value?: string) => {
  if (!value) return "";
  const normalized = value.toUpperCase().trim();
  return ["N5", "N4", "N3", "N2", "N1"].includes(normalized) ? normalized : "";
};

const RadicalDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [radical, setRadical] = useState<RadicalDetailData | null>(null);
  const [items, setItems] = useState<KanjiSummary[]>([]);
  const [vocabularyWords, setVocabularyWords] = useState<DemoWord[]>([]);
  const [allRadicals, setAllRadicals] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const listFromPath = (location.state as { from?: string } | null)?.from;

  // Load all radicals for navigation
  useEffect(() => {
    const loadAllRadicals = async () => {
      try {
        const response = await lessonAPI.getRadicals();
        // Response format: { success: true, data: [...], count: ... }
        const radicals = response?.data?.data || response?.data?.items || response?.data || [];
        const symbols = radicals.map((r: any) => r.symbol).filter(Boolean);
        setAllRadicals(symbols);
        const idx = symbols.indexOf(symbol || "");
        setCurrentIndex(idx);
      } catch (error) {
        console.error("Failed to load radicals list:", error);
      }
    };
    loadAllRadicals();
  }, [symbol]);

  useEffect(() => {
    const loadData = async () => {
      if (!symbol) return;
      setLoading(true);
      try {
        const [radicalResponse, kanjiResponse] = await Promise.all([
          lessonAPI.getRadicalDetail(symbol),
          lessonAPI.getKanjiByRadical(symbol, 1, 40),
        ]);

        const rawRadical = radicalResponse?.data?.data || radicalResponse?.data || null;
        const exampleItems: KanjiSummary[] = Array.isArray(rawRadical?.example_kanji)
          ? rawRadical.example_kanji
              .map((item: any, index: number) => ({
                _id: `${item.kanji || "kanji"}-${index}`,
                character: item.kanji || "",
                hanviet: item.hanviet || "",
                meaning_vi: item.meaning_vi || "",
              }))
              .filter((item: KanjiSummary) => Boolean(item.character))
          : [];

        const rawKanjiItems = Array.isArray(kanjiResponse?.data?.data?.items)
          ? kanjiResponse.data.data.items
          : Array.isArray(kanjiResponse?.data?.items)
            ? kanjiResponse.data.items
            : Array.isArray(kanjiResponse?.data)
              ? kanjiResponse.data
              : [];

        const kanjiItems: KanjiSummary[] = rawKanjiItems
          .map((item: any, index: number) => ({
            _id:
              item._id ||
              item.id ||
              `${item.character || item.kanji || "kanji"}-${index}`,
            character: item.character || item.kanji || "",
            hanviet: item.hanviet || item.han_viet || "",
            meaning_vi: item.meaning_vi || item.meaningVi || "",
            stroke_count: item.stroke_count ?? item.strokes,
            jlpt_level: normalizeJlptLevel(
              item.jlpt_level || item.jlpt || item.level,
            ),
          }))
          .filter((item: KanjiSummary) => Boolean(item.character));

        setRadical(
          rawRadical
            ? {
                ...rawRadical,
                meaningVi: rawRadical.meaningVi || rawRadical.meaning_vi,
                variants: Array.isArray(rawRadical.variants)
                  ? rawRadical.variants
                  : [],
                example_kanji: Array.isArray(rawRadical.example_kanji)
                  ? rawRadical.example_kanji
                  : [],
              }
            : null,
        );

        const mergedItems = kanjiItems.length > 0 ? kanjiItems : exampleItems;
        setItems(mergedItems);

        const chars = mergedItems.slice(0, 5).map((item) => item.character);
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

  const navigateToPrev = () => {
    if (currentIndex > 0) {
      const prevSymbol = allRadicals[currentIndex - 1];
      navigate(`/kanji/radicals/${encodeURIComponent(prevSymbol)}`, {
        state: location.state,
      });
    }
  };

  const navigateToNext = () => {
    if (currentIndex < allRadicals.length - 1) {
      const nextSymbol = allRadicals[currentIndex + 1];
      navigate(`/kanji/radicals/${encodeURIComponent(nextSymbol)}`, {
        state: location.state,
      });
    }
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
  const displayHanviet = radical.hanviet || "";
  const displayNameVi = radical.name_vi || radical.meaningVi || "";
  const displayMeaningVi = radical.meaningVi || "";
  const displayMeaningEn = radical.meaning || "";
  const jlptLabel = normalizeJlptLevel(radical.jlpt);
  const exampleKanjiItems: KanjiSummary[] = Array.isArray(radical.example_kanji)
    ? radical.example_kanji
        .map((item, index) => ({
          _id: `${item.kanji || "kanji"}-${index}`,
          character: item.kanji || "",
          hanviet: item.hanviet || "",
          meaning_vi: item.meaning_vi || "",
        }))
        .filter((item) => Boolean(item.character))
    : [];

  return (
    <div className="min-h-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="rounded-xl"
          >
            Quay lại danh sách Hán tự
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<LeftOutlined />}
            onClick={navigateToPrev}
            disabled={currentIndex <= 0}
            className="rounded-xl"
          >
            Trước
          </Button>
          <span className="text-sm text-slate-500">
            {currentIndex + 1} / {allRadicals.length}
          </span>
          <Button
            icon={<RightOutlined />}
            onClick={navigateToNext}
            disabled={currentIndex >= allRadicals.length - 1}
            className="rounded-xl"
          >
            Sau
          </Button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[#d5dfef] bg-[#d6e4f8] bg-[linear-gradient(to_right,rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:24px_24px] p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[160px_minmax(0,1fr)] gap-4 sm:gap-5">
          <div className="rounded-2xl border border-white/70 bg-white/70 p-4 flex flex-col items-center justify-center text-center">
            <div className="text-[68px] sm:text-[80px] leading-none font-kosugi text-[#1f2a44]">
              {displaySymbol}
            </div>
            <div className="mt-1 text-sm font-medium text-[#334155]">
              {displayHanviet || displayNameVi || "Bộ thủ"}
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-4xl font-semibold leading-tight text-[#2a2f3f]">
              Bộ thủ <span className="font-kosugi">{displaySymbol}</span>
            </h1>
            <p className="mt-1 text-sm sm:text-lg text-[#2c3853]">
              {displayHanviet ? `${displayHanviet} • ${displayNameVi || ""}` : (displayNameVi || "Không rõ tên")}{" "}
              {displayMeaningVi || "Không có nghĩa"}
              {displayMeaningEn ? ` (${displayMeaningEn})` : ""}
            </p>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  JLPT
                </div>
                <div className="text-lg font-semibold text-slate-800">
                  {jlptLabel || "-"}
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
              <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Mã bộ thủ
                </div>
                <div className="text-lg font-semibold text-slate-800">
                  {displaySymbol}
                </div>
              </div>
            </div>

            {Array.isArray(radical.variants) && radical.variants.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Biến thể:</span>
                {radical.variants.map((variant) => (
                  <span
                    key={variant}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                  >
                    {variant}
                  </span>
                ))}
              </div>
            ) : null}
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
                onClick={() => {
                  const kanjiList = items.map((k) => k.character);
                  const kanjiIndex = items.findIndex((k) => k._id === item._id);
                  navigate(`/kanji/${item.character}`, {
                    state: {
                      from: `${location.pathname}${location.search}`,
                      fromRadicalList: listFromPath,
                      kanjiList,
                      currentIndex: kanjiIndex,
                    },
                  });
                }}
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

    </div>
  );
};

export default RadicalDetail;
