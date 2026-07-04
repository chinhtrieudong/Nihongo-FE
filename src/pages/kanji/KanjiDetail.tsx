import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Volume2, ArrowLeft } from "lucide-react";
import { Card, Button, Row, Col } from "antd";
import { EmptyState, LessonNavigation } from "../../components/common";
import { KanjiItem, KanjiDetailResponse } from "../../types/kanji";
import { useAppSelector } from "../../store/hooks";
import { getFontPreset } from "../../constants/fonts";
import fakeKanjiData from "../../data/fakeKanjiData.json";

interface KanjiDetailProps {
  lessonId?: string;
}

const KanjiDetail: React.FC<KanjiDetailProps> = ({
  lessonId: propLessonId,
}) => {
  const { kanji, lessonId: urlLessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const lessonId = propLessonId || urlLessonId;
  const { fontPreset } = useAppSelector((state) => state.ui);
  const selectedPreset = getFontPreset(fontPreset);

  const [kanjiData, setKanjiData] = useState<KanjiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [allKanji, setAllKanji] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const navState = (location.state as {
    from?: string;
    fromRadicalList?: string;
    kanjiList?: string[];
    currentIndex?: number;
  } | null);
  const backLabel =
    navState?.from && navState.from.startsWith("/kanji/radicals/")
      ? "Quay lại chi tiết bộ thủ"
      : "Quay lại danh sách Hán tự";

  const handleBack = () => {
    const fromPath = navState?.from;
    if (fromPath) {
      const nextState =
        navState?.fromRadicalList && fromPath.startsWith("/kanji/radicals/")
          ? { from: navState.fromRadicalList }
          : undefined;
      navigate(fromPath, nextState ? { state: nextState } : undefined);
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/kanji");
  };

  // Initialize kanji list and current index from navigation state
  useEffect(() => {
    if (navState?.kanjiList) {
      setAllKanji(navState.kanjiList);
      if (navState.currentIndex !== undefined) {
        setCurrentIndex(navState.currentIndex);
      } else if (kanji) {
        const idx = navState.kanjiList.indexOf(kanji);
        setCurrentIndex(idx);
      }
    }
  }, [navState, kanji]);

  useEffect(() => {
    const fetchKanjiData = async () => {
      try {
        setLoading(true);
        
        // Use fake data temporarily
        if (kanji) {
          const found = fakeKanjiData.kanjiList.find(k => k.kanji === kanji);
          if (found) {
            setKanjiData(found as KanjiItem);
          }
        } else {
          // Default to first kanji if no specific kanji selected
          if (fakeKanjiData.kanjiList.length > 0) {
            setKanjiData(fakeKanjiData.kanjiList[0] as KanjiItem);
          }
        }
      } catch (error) {
        console.error("Failed to fetch kanji data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKanjiData();
  }, [kanji, lessonId]);

  const navigateToPrev = () => {
    if (currentIndex > 0 && allKanji.length > 0) {
      const prevKanji = allKanji[currentIndex - 1];
      navigate(`/kanji/${encodeURIComponent(prevKanji)}`, {
        state: {
          ...navState,
          currentIndex: currentIndex - 1,
        },
      });
    }
  };

  const navigateToNext = () => {
    if (currentIndex < allKanji.length - 1 && allKanji.length > 0) {
      const nextKanji = allKanji[currentIndex + 1];
      navigate(`/kanji/${encodeURIComponent(nextKanji)}`, {
        state: {
          ...navState,
          currentIndex: currentIndex + 1,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!kanjiData) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <EmptyState
          type="error"
          title="Không tìm thấy Hán tự"
          description="Vui lòng kiểm tra lại đường dẫn hoặc thử tìm kiếm Hán tự khác."
          action={{
            label: backLabel,
            onClick: handleBack,
          }}
        />
      </div>
    );
  }

  const resolveKanjiChar = (value?: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    return Array.from(trimmed)[0] || "";
  };

  // KanjiVG Stroke Order Component
  const KanjiStrokeOrder: React.FC<{ kanji?: string }> = ({ kanji }) => {
    const [svgContent, setSvgContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const primaryChar = resolveKanjiChar(kanji);

    useEffect(() => {
      const fetchKanjiSVG = async () => {
        try {
          setLoading(true);
          setError(null);

          if (!primaryChar) {
            setSvgContent("not-found");
            return;
          }

          const codePoint = primaryChar.codePointAt(0);
          if (typeof codePoint !== "number") {
            setSvgContent("not-found");
            return;
          }

          const codePointHex = codePoint.toString(16).padStart(5, "0");
          const response = await fetch(
            `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePointHex}.svg`,
          );

          if (!response.ok) {
            setSvgContent("not-found");
            return;
          }

          const svg = await response.text();
          const cleanedSvg = svg
            .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<\?xml.*?\?>/g, '')
            .replace(/<!DOCTYPE.*?>/g, '')
            .replace(/>/g, '>')
            .replace(/</g, '<')
            .replace(/&/g, '&')
            .replace(/"/g, '"')
            .replace(/&#x27;/g, "'")
            .trim();

          const svgMatch = cleanedSvg.match(/<svg[^>]*>[\s\S]*<\/svg>/)
          const finalSvg = svgMatch ? svgMatch[0] : cleanedSvg;

          setSvgContent(finalSvg);
        } catch (error) {
          console.log("[v0] SVG fetch error:", error);
          setSvgContent("error");
          setError("Không thể tải dữ liệu nét viết");
        } finally {
          setLoading(false);
        }
      }

      fetchKanjiSVG();
    }, [primaryChar]);

    if (loading) {
      return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center h-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-3"></div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Đang tải nét viết...</p>
          </div>
        </div>
      )
    }

    if (svgContent === "error" || svgContent === "not-found") {
      return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center h-80">
          <div className="text-center">
            <p className="text-[12rem] font-bold text-slate-800 dark:text-slate-200 leading-none kanji-text mb-2">
              {primaryChar || "?"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {error || "Không có dữ liệu nét viết"}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="w-full h-80 flex items-center justify-center p-4"
          style={{
            background: 'white',
            transform: 'scale(1.5)',
            transformOrigin: 'center',
          }}
        />
      </div>
    )
  };

  const getJLPTColor = (level: string) => {
    const colors: Record<string, string> = {
      'N5': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'N4': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'N3': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'N2': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'N1': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[level] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
            className="rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
          >
            {backLabel}
          </Button>

          {allKanji.length > 0 && (
            <LessonNavigation
              currentLesson={currentIndex + 1}
              totalLessons={allKanji.length}
              onPrev={navigateToPrev}
              onNext={navigateToNext}
              showSelect={false}
              showCounter={true}
            />
          )}
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          {/* Left Column - Stroke Order */}
          <Col xs={24} lg={10}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Thứ tự nét viết</h2>
              <KanjiStrokeOrder kanji={kanjiData.kanji ?? (kanjiData as any).character} />
            </div>

            {/* Kanji Info Card - Below Stroke Order */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-center mb-4">
                <p className="text-2xl text-slate-600 dark:text-slate-400 jp-text mb-3">{(kanjiData.hanviet || '').toUpperCase()}</p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getJLPTColor(kanjiData.level)}`}>
                    {kanjiData.level}
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {kanjiData.strokeCount} nét
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold">
                    {kanjiData.meaningVi}
                  </p>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column - Details & Vocabulary */}
          <Col xs={24} lg={14}>

            {/* Details Card */}
            <Card className="mb-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Âm On</h3>
                  <p className="text-lg font-medium text-slate-800 dark:text-slate-200 jp-text">
                    {kanjiData.onyomi.join(", ")}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Âm Kun</h3>
                  <p className="text-lg font-medium text-slate-800 dark:text-slate-200 jp-text">
                    {kanjiData.kunyomi.join(", ")}
                  </p>
                </div>
                {kanjiData.memoryTip && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Cách nhớ</h3>
                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {kanjiData.memoryTip}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Vocabulary Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Từ vựng liên quan</h2>
              <div className="space-y-3">
                {(kanjiData.relatedVocabulary || []).slice(0, 8).map((word, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {/* Kanji with furigana */}
                    <div className="flex flex-col items-center justify-center min-w-[70px] flex-shrink-0">
                      <span className="text-xs text-slate-500 dark:text-slate-400 jp-text leading-tight mb-1">
                        {word.kana}
                      </span>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 kanji-text leading-none">
                        {word.word}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-px h-12 bg-slate-300 dark:bg-slate-600"></div>

                    {/* Right side - 2 rows */}
                    <div className="flex-1 flex flex-col gap-2">
                      {/* Top row: Hán Việt and Meaning */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{(word.hanviet || '').toUpperCase()}</span>
                        <span className="text-slate-400 dark:text-slate-500">|</span>
                        <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
                          {word.meaningVi ? word.meaningVi.charAt(0).toUpperCase() + word.meaningVi.slice(1) : ''}
                        </span>
                      </div>

                      {/* Bottom row: Examples (separated) */}
                      {(word.exampleJp || word.exampleVi) && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-600">
                          {word.exampleJp && <span className="jp-text">{word.exampleJp}</span>}
                          {word.exampleJp && word.exampleVi && <span className="text-slate-400">|</span>}
                          {word.exampleVi && <span>{word.exampleVi}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(!kanjiData.relatedVocabulary || kanjiData.relatedVocabulary.length === 0) && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    Chưa có từ vựng liên quan
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default KanjiDetail;