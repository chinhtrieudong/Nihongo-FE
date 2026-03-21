import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { lessonAPI } from "../services/api";
import { SoundOutlined, ArrowLeftOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Card, Button, Row, Col } from "antd";
import { KanjiItem, KanjiDetailResponse } from "../types/kanji";

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
        let response;

        if (kanji) {
          response = await lessonAPI.getKanji(kanji);
        } else if (lessonId) {
          response = await lessonAPI.getLessonKanji(lessonId);
        } else {
          response = await lessonAPI.getAllKanji({});
        }

        if (response.success) {
          setKanjiData(response.data);
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
      <div className="text-center py-12">
        <div className="text-6xl mb-4 font-kosugi">漢</div>
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-600 mb-2 font-sans">
          Không tìm thấy Hán tự
        </h3>
        <p className="text-secondary-600 dark:text-secondary-800 font-sans">
          Vui lòng kiểm tra lại đường dẫn hoặc thử tìm kiếm Hán tự khác.
        </p>
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

          // Get Unicode code point for the character (supports surrogate pairs)
          const codePoint = primaryChar.codePointAt(0);
          if (typeof codePoint !== "number") {
            setSvgContent("not-found");
            return;
          }

          const codePointHex = codePoint.toString(16).padStart(5, "0");

          // Fetch from KanjiVG (free SVG kanji resource)
          const response = await fetch(
            `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePointHex}.svg`,
          );

          if (!response.ok) {
            // Fallback: display character in large text if SVG not found
            setSvgContent("not-found");
            return;
          }

          const svg = await response.text();
          // Clean SVG content by removing HTML entities and extracting only the SVG element
          const cleanedSvg = svg
            .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '') // Remove CDATA sections
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/<\?xml.*?\?>/g, '') // Remove XML declarations
            .replace(/<!DOCTYPE.*?>/g, '') // Remove DOCTYPE declarations
            .replace(/&gt;/g, '>') // Decode HTML entities
            .replace(/&lt;/g, '<')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .trim();

          // Extract SVG content between <svg> tags
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
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 flex items-center justify-center w-full h-64">
          <p className="text-secondary-600 dark:text-secondary-400">Đang tải nét viết...</p>
        </div>
      )
    }

    if (svgContent === "error" || svgContent === "not-found") {
      return (
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 flex items-center justify-center w-full h-64">
          <div className="text-center">
            <p className="text-[15rem] font-bold text-secondary-900 dark:text-secondary-100 mb-2">
              {primaryChar || "?"}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              {error || "Không có dữ liệu nét viết"}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden">
        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="w-full h-64 flex items-center justify-center"
          style={{
            background: 'white',
            transform: 'scale(1.8)',
            transformOrigin: 'center',
          }}
        />
      </div>
    )
  };

  return (
    <div className="min-h-full font-kosugi p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="rounded-xl"
          >
            {backLabel}
          </Button>

          {allKanji.length > 0 && (
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
                {currentIndex + 1} / {allKanji.length}
              </span>
              <Button
                icon={<RightOutlined />}
                onClick={navigateToNext}
                disabled={currentIndex >= allKanji.length - 1}
                className="rounded-xl"
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <Row gutter={[24, 24]} className="mb-6">
        {/* Left Column - Kanji Display */}
        <Col xs={24} md={6}>
          <Card title="Thứ tự nét viết">
            <KanjiStrokeOrder kanji={kanjiData.kanji ?? (kanjiData as any).character} />
          </Card>
        </Col>

        {/* Middle Column - Basic Info */}
        <Col xs={24} md={9}>
          <Card 
            title={
              <span>
                {(kanjiData as any).character || kanjiData.kanji}
                <span className="text-secondary-400 dark:text-secondary-600 mx-1">|</span>
                {kanjiData.hanviet}
              </span>
            }
          >
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Ý nghĩa:</h3>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {(kanjiData as any).meaning_vi || kanjiData.meaningVi}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Trình độ JLPT:</h3>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {(kanjiData as any).jlpt_level || kanjiData.jlpt}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Âm On:</h3>
                <p className="text-lg font-osaka font-semibold text-blue-600 dark:text-blue-400">
                  {kanjiData.onyomi.join(", ")}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Âm Kun:</h3>
                <p className="text-lg font-osaka font-semibold text-blue-600 dark:text-blue-400">
                  {kanjiData.kunyomi.join(", ")}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Số nét:</h3>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {(kanjiData as any).stroke_count || kanjiData.strokeCount}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300 whitespace-nowrap">Cách nhớ:</h3>
                <div className="flex-1 flex flex-col text-left">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 leading-relaxed whitespace-pre-line">
                    {((kanjiData as any).memory_tip || kanjiData.memoryTip || '').replace(/\. /g, '.\n').replace(/: /g, ':\n')}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Vocabulary */}
        <Col xs={24} md={9}>
          <Card title="Từ vựng liên quan" className="h-full">
            <div className="space-y-3">
              {(kanjiData.related_vocabulary || []).slice(0, 5).map((word, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {word.vocab_kanji}
                  </span>
                  {word.vocab_kanji !== word.vocab_reading && (
                    <>
                      <span className="text-base text-blue-600 dark:text-blue-400 font-japanese">
                        ({word.vocab_reading})
                      </span>
                      <span className="text-black dark:text-white">|</span>
                    </>
                  )}
                  <span className="text-sm text-black dark:text-white">
                    {word.hanviet}
                  </span>
                  <span className="text-black dark:text-white">|</span>
                  <span className="text-base text-black dark:text-white">
                    {word.meaning_vi ? word.meaning_vi.charAt(0).toUpperCase() + word.meaning_vi.slice(1) : ''}
                  </span>
                </div>
              ))}
              
              {(!kanjiData.related_vocabulary || kanjiData.related_vocabulary.length === 0) && (
                <div className="text-center py-6 text-secondary-500 dark:text-secondary-400">
                  Chưa có từ vựng liên quan
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KanjiDetail;
