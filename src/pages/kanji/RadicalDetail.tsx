import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Lightbulb, BookOpen } from "lucide-react";
import { Spin, Button, Tag } from "antd";
import { EmptyState } from "../../components/common";
import { useAppSelector } from "../../store/hooks";
import { getFontPreset } from "../../constants/fonts";
import fakeKanjiData from "../../data/fakeKanjiData.json";
import fakeRadicalsData from "../../data/fakeRadicalsData.json";

const resolveKanjiChar = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return Array.from(trimmed)[0] || "";
};

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
  description?: string;
  memory_tip?: string;
  onyomi?: string[];
  kunyomi?: string[];
};

type KanjiSummary = {
  _id: string;
  character: string;
  hanviet?: string;
  meaning_vi?: string;
  stroke_count?: number;
  jlpt_level?: string;
  onyomi?: string[];
  kunyomi?: string[];
};

const JLPT_BADGE_CLASS: Record<string, string> = {
  N5: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
  N4: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700",
  N3: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
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

  const [radical, setRadical] = useState<RadicalDetailData | null>(null);
  const [allRadicals, setAllRadicals] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [strokeOrderSvg, setStrokeOrderSvg] = useState<string>("");
  const [loadingStrokeOrder, setLoadingStrokeOrder] = useState(true);
  const [relatedKanji, setRelatedKanji] = useState<KanjiSummary[]>([]);
  const listFromPath = (location.state as { from?: string } | null)?.from;

  // Load all radicals for navigation
  useEffect(() => {
    const symbols = fakeRadicalsData.radicalsList.map(r => r.symbol).filter(Boolean);
    setAllRadicals(symbols);
    const idx = symbols.indexOf(symbol || "");
    setCurrentIndex(idx);
  }, [symbol]);

  // Load stroke order SVG for radical
  useEffect(() => {
    const fetchStrokeOrder = async () => {
      if (!symbol) return;
      setLoadingStrokeOrder(true);
      try {
        const primaryChar = resolveKanjiChar(symbol);
        if (!primaryChar) {
          setStrokeOrderSvg("");
          return;
        }

        const codePoint = primaryChar.codePointAt(0);
        if (typeof codePoint !== "number") {
          setStrokeOrderSvg("");
          return;
        }

        const codePointHex = codePoint.toString(16).padStart(5, "0");
        const response = await fetch(
          `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePointHex}.svg`,
        );

        if (!response.ok) {
          setStrokeOrderSvg("");
          return;
        }

        const svg = await response.text();
        const cleanedSvg = svg
          .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<\?xml.*?\?>/g, "")
          .replace(/<!DOCTYPE.*?>/g, "")
          .replace(/>/g, ">")
          .replace(/</g, "<")
          .replace(/&/g, "&")
          .replace(/"/g, '"')
          .replace(/&#x27;/g, "'")
          .trim();

        const svgMatch = cleanedSvg.match(/<svg[^>]*>[\s\S]*<\/svg>/);
        const finalSvg = svgMatch ? svgMatch[0] : cleanedSvg;
        setStrokeOrderSvg(finalSvg);
      } catch (error) {
        console.log("[v0] SVG fetch error:", error);
        setStrokeOrderSvg("");
      } finally {
        setLoadingStrokeOrder(false);
      }
    };

    fetchStrokeOrder();
  }, [symbol]);

  useEffect(() => {
    const loadData = async () => {
      if (!symbol) return;
      setLoading(true);
      try {
        // Find radical from fakeRadicalsData
        const foundRadical = fakeRadicalsData.radicalsList.find(r => r.symbol === symbol);
        
        if (foundRadical) {
          setRadical(foundRadical as RadicalDetailData);

          // Find kanji that contain this radical
          const kanjiWithRadical = fakeKanjiData.kanjiList.filter(k => 
            k.radicals && k.radicals.includes(symbol)
          ).map((k, idx) => ({
            _id: `${k.kanji}-${idx}`,
            character: k.kanji,
            hanviet: k.hanviet,
            meaning_vi: k.meaningVi,
            stroke_count: k.strokeCount,
            jlpt_level: k.level,
            onyomi: k.onyomi,
            kunyomi: k.kunyomi,
          }));

          setRelatedKanji(kanjiWithRadical);
        } else {
          setRadical(null);
          setRelatedKanji([]);
        }
      } catch (error) {
        console.error("Failed to load radical detail:", error);
        setRadical(null);
        setRelatedKanji([]);
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

  const navigateToIndex = (index: number) => {
    if (index >= 0 && index < allRadicals.length) {
      const targetSymbol = allRadicals[index];
      navigate(`/kanji/radicals/${encodeURIComponent(targetSymbol)}`, {
        state: location.state,
      });
    }
  };

  const navigateToPrev = () => {
    if (currentIndex > 0) {
      navigateToIndex(currentIndex - 1);
    }
  };

  const navigateToNext = () => {
    if (currentIndex < allRadicals.length - 1) {
      navigateToIndex(currentIndex + 1);
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
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <EmptyState
          type="error"
          title="Không tìm thấy bộ thủ"
          description="Không tìm thấy thông tin bộ thủ bạn đang tìm kiếm."
          size="default"
          action={{
            label: "Quay lại danh sách bộ thủ",
            onClick: handleBack,
          }}
        />
      </div>
    );
  }

  const displaySymbol = radical.symbol || symbol || "—";
  const displayHanviet = radical.hanviet || "";
  const displayNameVi = radical.name_vi || "";
  const jlptLabel = normalizeJlptLevel(radical.jlpt);

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
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
      <div className="mb-6 rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-5 sm:gap-6">
          {/* Radical Symbol Display with Stroke Order */}
          <div className="rounded-2xl border border-border bg-surface-1 p-5 flex flex-col items-center justify-center text-center">
            {loadingStrokeOrder ? (
              <div className="flex items-center justify-center h-32">
                <Spin size="small" />
              </div>
            ) : strokeOrderSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: strokeOrderSvg }}
                className="w-full h-32 flex items-center justify-center"
                style={{
                  background: "white",
                  transform: "scale(1.2)",
                  transformOrigin: "center",
                }}
              />
            ) : (
              <div className="text-[72px] sm:text-[88px] leading-none kanji-text text-teal-900 dark:text-teal-300">
                {displaySymbol}
              </div>
            )}
          </div>

          {/* Radical Details */}
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-text-main dark:text-secondary-100">
                  Bộ <span className="kanji-text text-teal-700 dark:text-teal-400">{displayHanviet || displaySymbol}</span>
                </h1>
                {displayNameVi && (
                  <p className="mt-1 text-sm text-text-secondary dark:text-secondary-400">
                    {displayNameVi}
                  </p>
                )}
              </div>
              {jlptLabel && (
                <Tag color={jlptLabel === 'N5' ? 'green' : jlptLabel === 'N4' ? 'blue' : 'default'} className="mt-1">
                  {jlptLabel}
                </Tag>
              )}
            </div>

            {radical.description && radical.description !== `Bộ thủ ${displayHanviet} - ${radical.meaning}` && (
              <p className="text-sm sm:text-base text-text-secondary dark:text-secondary-400 mb-4">
                {radical.description}
              </p>
            )}

            {/* Readings */}
            {(radical.onyomi || radical.kunyomi) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {radical.onyomi && radical.onyomi.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Âm On
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 jp-text">
                      {radical.onyomi.join(", ")}
                    </div>
                  </div>
                )}
                {radical.kunyomi && radical.kunyomi.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Âm Kun
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 jp-text">
                      {radical.kunyomi.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  Số Kanji
                </div>
                <div className="text-xl font-bold text-text-main dark:text-secondary-100">
                  {relatedKanji.length}
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
              <div className="rounded-xl border border-teal-200 dark:border-teal-600 bg-white/70 dark:bg-[#252d3d]/70 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-teal-600 dark:text-teal-400 font-medium">
                  Tần suất
                </div>
                <div className="text-xl font-bold text-text-main dark:text-secondary-100">
                  {radical.kanji_count ?? relatedKanji.length}
                </div>
              </div>
            </div>

            {/* Memory Tip */}
            {radical.memory_tip && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Cách nhớ</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {radical.memory_tip}
                </p>
              </div>
            )}

            {/* Variants */}
            {Array.isArray(radical.variants) && radical.variants.length > 0 && (
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
            )}
          </div>
        </div>
      </div>

      {/* Related Kanji Section */}
      <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700 dark:text-teal-400" />
            <h2 className="text-lg font-bold text-text-main dark:text-secondary-100">Kanji sử dụng bộ thủ này</h2>
          </div>
          <div className="rounded-full border border-teal-200 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/40 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
            {relatedKanji.length} mục
          </div>
        </div>

        {relatedKanji.length === 0 ? (
          <EmptyState
            type="data"
            title="Chưa có Kanji"
            description="Chưa có dữ liệu kanji cho bộ thủ này."
            size="default"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {relatedKanji.map((item) => (
              <button
                key={item._id}
                className="rounded-xl border-2 border-border bg-surface-1 p-4 text-left transition-all duration-200 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-lg hover:-translate-y-1"
                onClick={() => {
                  const kanjiList = relatedKanji.map((k) => k.character);
                  const kanjiIndex = relatedKanji.findIndex((k) => k._id === item._id);
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
                <div className="text-4xl kanji-text leading-none text-center mb-2 text-teal-900 dark:text-teal-300">
                  {item.character}
                </div>
                <div className="text-sm font-bold leading-tight truncate text-teal-800 dark:text-teal-400 mb-1 text-center">
                  {item.hanviet || "-"}
                </div>
                <div className="text-[11px] text-secondary-600 dark:text-secondary-400 truncate text-center mb-2">
                  {item.meaning_vi || "-"}
                </div>
                {item.onyomi && item.onyomi.length > 0 && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center mb-1 jp-text">
                    {item.onyomi[0]}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    {item.stroke_count ?? "-"} nét
                  </span>
                  {item.jlpt_level && (
                    <Tag
                      color={item.jlpt_level === 'N5' ? 'green' : item.jlpt_level === 'N4' ? 'blue' : 'default'}
                      className="m-0 !px-1 !py-0 text-[10px]"
                    >
                      {item.jlpt_level}
                    </Tag>
                  )}
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