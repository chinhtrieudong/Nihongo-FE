import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Spin, Button } from "antd";
import { lessonAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { getFontPreset } from "../../constants/fonts";

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
  N5: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
  N4: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700",
  N3: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  N2: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700",
  N1: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700",
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
  const { fontPreset } = useAppSelector((state) => state.ui);
  const selectedPreset = getFontPreset(fontPreset);
  const [loading, setLoading] = useState(true);

  // Set CSS variable for kanji font family based on selected preset
  useEffect(() => {
    const kanjiFont = selectedPreset.kanjiFontFamily || selectedPreset.fontFamily;
    document.documentElement.style.setProperty('--kanji-font-family', kanjiFont);
  }, [selectedPreset]);
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
        <p className="text-secondary-700 dark:text-secondary-400">Không tìm thấy thông tin bộ thủ.</p>
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
    <div className="min-h-full bg-bg academic-canvas px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      {/* Header Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
            className="rounded-xl"
          >
            Quay lại danh sách bộ thủ
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={navigateToPrev}
            disabled={currentIndex <= 0}
            className="rounded-xl"
          >
            Trước
          </Button>
          <span className="text-sm text-text-sub dark:text-secondary-400 min-w-[60px] text-center">
            {currentIndex + 1} / {allRadicals.length}
          </span>
          <Button
            icon={<ChevronRight className="w-4 h-4" />}
            onClick={navigateToNext}
            disabled={currentIndex >= allRadicals.length - 1}
            className="rounded-xl"
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Main Radical Info Card */}
      <div className="mb-6 rounded-2xl border border-border bg-surface-1 p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-5 sm:gap-6">
          {/* Radical Symbol Display */}
          <div className="rounded-2xl border border-border bg-surface-1 p-5 flex flex-col items-center justify-center text-center">
            <div className="text-[72px] sm:text-[88px] leading-none kanji-text text-teal-900 dark:text-teal-300">
              {displaySymbol}
            </div>
            <div className="mt-2 text-sm font-semibold text-teal-700 dark:text-teal-400">
              {displayHanviet || displayNameVi || "Bộ thủ"}
            </div>
          </div>

          {/* Radical Details */}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-text-main dark:text-secondary-100">
              Bộ thủ <span className="kanji-text text-teal-700 dark:text-teal-400">{displaySymbol}</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-text-secondary dark:text-secondary-400">
              {displayHanviet ? `${displayHanviet} • ${displayNameVi || ""}` : (displayNameVi || "Không rõ tên")}{" "}
              {displayMeaningVi || "Không có nghĩa"}
              {displayMeaningEn ? ` (${displayMeaningEn})` : ""}
            </p>

            {/* Stats Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-teal-200 dark:border-teal-600 bg-white/70 dark:bg-[#252d3d]/70 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-teal-600 dark:text-teal-400 font-medium">
                  Số nét
                </div>
                <div className="text-xl font-bold text-text-main dark:text-secondary-100">
                  {radical.stroke_count ?? "-"}
                </div>
              </div>
              <div className="rounded-xl border border-teal-200 dark:border-teal-600 bg-white/70 dark:bg-[#252d3d]/70 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-teal-600 dark:text-teal-400 font-medium">
                  JLPT
                </div>
                <div className="text-xl font-bold text-text-main dark:text-secondary-100">
                  {jlptLabel || "-"}
                </div>
              </div>
              <div className="rounded-xl border border-teal-200 dark:border-teal-600 bg-white/70 dark:bg-[#252d3d]/70 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-teal-600 dark:text-teal-400 font-medium">
                  Số Kanji
                </div>
                <div className="text-xl font-bold text-text-main dark:text-secondary-100">
                  {kanjiCount}
                </div>
              </div>
              <div className="rounded-xl border border-teal-200 dark:border-teal-600 bg-white/70 dark:bg-[#252d3d]/70 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-teal-600 dark:text-teal-400 font-medium">
                  Mã bộ thủ
                </div>
                <div className="text-xl font-bold text-text-main dark:text-secondary-100 kanji-text">
                  {displaySymbol}
                </div>
              </div>
            </div>

            {/* Variants */}
            {Array.isArray(radical.variants) && radical.variants.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Biến thể:</span>
                {radical.variants.map((variant) => (
                  <span
                    key={variant}
                    className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-600 bg-white/70 dark:bg-[#252d3d]/70 px-3 py-1 text-sm font-semibold text-teal-800 dark:text-teal-300 kanji-text"
                  >
                    {variant}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Kanji by Radical Section */}
      <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-text-main dark:text-secondary-100">Kanji theo bộ thủ</h2>
          <div className="rounded-full border border-teal-200 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/40 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
            {items.length} mục
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-1 p-8 text-center text-secondary-600 dark:text-secondary-400">
            Chưa có Kanji nào cho bộ thủ này.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {items.map((item) => (
              <button
                key={item._id}
                className="rounded-xl border-2 border-border bg-surface-1 p-4 text-left transition-all duration-200 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-lg hover:-translate-y-1"
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
                <div className="text-4xl kanji-text leading-none text-center mb-3 text-teal-900 dark:text-teal-300">
                  {item.character}
                </div>
                <div className="text-sm sm:text-base font-bold leading-tight truncate text-teal-800 dark:text-teal-400 mb-1 text-center">
                  {item.hanviet || "-"}
                </div>
                <div className="text-[11px] text-secondary-600 dark:text-secondary-400 truncate text-center">
                  {item.meaning_vi || "-"}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    {item.stroke_count ?? "-"} nét
                  </span>
                  {item.jlpt_level ? (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${JLPT_BADGE_CLASS[item.jlpt_level] ||
                        "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
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