import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { lessonAPI } from "../services/api";
import { SoundOutlined, ArrowLeftOutlined, PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Card, Button, Row, Col } from "antd";

// Utility functions to transform backend data
const getSimpleReadings = (kanjiData: KanjiData) => ({
  onyomi: (kanjiData.onyomi ?? []).map((o) => o.kana),
  kunyomi: (kanjiData.kunyomi ?? []).map((k) => k.kana),
});

const getSimpleWords = (kanjiData: KanjiData) =>
  (kanjiData.vocabulary_examples ?? []).map((v) => ({
    word: v.word,
    reading: v.hiragana,
    romaji: v.romaji,
    hanviet: v.hanviet,
    meaning: v.meaning_vi,
    example: v.example_jp,
    exampleVi: v.example_vi,
    audio_url: v.audio_url,
  }));

const getJLPTColor = (level: string) => {
  switch (level) {
    case "N5":
      return "green";
    case "N4":
      return "blue";
    case "N3":
      return "orange";
    case "N2":
      return "red";
    case "N1":
      return "purple";
    default:
      return "default";
  }
};

// Backend response interfaces
interface OnyomiReading {
  kana: string;
  romaji: string;
  _id?: string;
}

interface KunyomiReading {
  kana: string;
  romaji: string;
  _id?: string;
}

interface Radical {
  symbol: string;
  hanviet: string;
  name_vi: string;
  meaning: string;
}

interface KanjiAnalysis {
  component: string;
  hanviet: string;
  role: string;
  meaning: string;
  position: string;
  _id?: string;
}

interface VocabularyExample {
  word: string;
  hiragana: string;
  romaji: string;
  hanviet: string;
  meaning_vi: string;
  example_jp: string;
  example_vi: string;
  audio_url: string;
  _id?: string;
}

// Main KanjiData interface matching backend
interface KanjiData {
  _id: string;
  character: string;
  hanviet: string;
  meaning_vi: string;
  onyomi: OnyomiReading[];
  kunyomi: KunyomiReading[];
  stroke_count: number;
  jlpt_level: string;
  frequency: string;
  radical: Radical;
  structure: string;
  image_explanation: string;
  memory_tip?: string;
  "memory-tip"?: string;
  kanji_analysis: KanjiAnalysis[];
  vocabulary_examples: VocabularyExample[];
  category: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const getMemoryTip = (kanjiData: KanjiData) =>
  kanjiData.memory_tip || kanjiData["memory-tip"] || kanjiData.image_explanation || "Chưa có";

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

  const [kanjiData, setKanjiData] = useState<KanjiData | null>(null);
  const [loading, setLoading] = useState(true);
  const navState = (location.state as {
    from?: string;
    fromRadicalList?: string;
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

  // KanjiVG Stroke Order Component
  const KanjiStrokeOrder: React.FC<{ kanji: string }> = ({ kanji }) => {
    const [svgContent, setSvgContent] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const fetchKanjiSVG = async () => {
        try {
          setLoading(true)
          // Get Unicode code point for the character
          const codePoint = kanji.charCodeAt(0).toString(16).padStart(5, '0')

          // Fetch from KanjiVG (free SVG kanji resource)
          const response = await fetch(
            `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${codePoint}.svg`
          )

          if (!response.ok) {
            // Fallback: display character in large text if SVG not found
            setSvgContent('not-found')
            setLoading(false)
            return
          }

          const svg = await response.text()
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
            .trim()

          // Extract SVG content between <svg> tags
          const svgMatch = cleanedSvg.match(/<svg[^>]*>[\s\S]*<\/svg>/)
          const finalSvg = svgMatch ? svgMatch[0] : cleanedSvg

          setSvgContent(finalSvg)
        } catch (error) {
          console.log('[v0] SVG fetch error:', error)
          setSvgContent('error')
        } finally {
          setLoading(false)
        }
      }

      if (kanji) {
        fetchKanjiSVG()
      }
    }, [kanji])

    if (loading) {
      return (
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 flex items-center justify-center w-full h-64">
          <p className="text-secondary-600 dark:text-secondary-400">Đang tải nét viết...</p>
        </div>
      )
    }

    if (svgContent === 'error' || svgContent === 'not-found') {
      return (
        <div className="bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 flex items-center justify-center w-full h-64">
          <div className="text-center">
            <p className="text-[15rem] font-bold text-secondary-900 dark:text-secondary-100 mb-2">{kanji}</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">Không có dữ liệu nét viết</p>
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
          <button
            onClick={handleBack}
            className="flex items-center text-black dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors font-sans"
          >
            <ArrowLeftOutlined className="mr-2" />
            {backLabel}
          </button>

          <div className="flex items-center gap-2">
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <Row gutter={[24, 24]} className="mb-6">
        {/* Left Column - Kanji Display */}
        <Col xs={24} md={8}>
          <Card title="Thứ tự nét viết">
            <KanjiStrokeOrder kanji={kanjiData.character} />
          </Card>
        </Col>

        {/* Middle Column - Basic Info */}
        <Col xs={24} md={8}>
          <Card title={`${kanjiData.character} - ${kanjiData.hanviet}`}>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Ý nghĩa:</h3>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {kanjiData.meaning_vi}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Trình độ JLPT:</h3>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {kanjiData.jlpt_level}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Âm On:</h3>
                <p className="text-lg font-osaka font-semibold text-blue-600 dark:text-blue-400">
                  {getSimpleReadings(kanjiData).onyomi.join(", ")}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Âm Kun:</h3>
                <p className="text-lg font-osaka font-semibold text-blue-600 dark:text-blue-400">
                  {getSimpleReadings(kanjiData).kunyomi.join(", ")}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Số nét:</h3>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {kanjiData.stroke_count}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">Bộ thủ:</h3>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {kanjiData.radical.symbol}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300 mt-1">Cách nhớ: <span className="font-semibold text-blue-600 dark:text-blue-400 leading-relaxed flex-1">
                  {getMemoryTip(kanjiData)}
                </span></h3>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Vocabulary */}
        <Col xs={24} md={8}>
          <Card title="Từ vựng liên quan">
            <div className="space-y-4">
              {getSimpleWords(kanjiData).slice(0, 5).map((word, index) => (
                <div
                  key={index}
                  className="p-3 border border-secondary-200 dark:border-secondary-800 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-secondary-900 dark:text-white">
                          {word.word}
                        </span>
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          {word.hanviet}
                        </span>
                      </div>
                      <div className="text-sm text-secondary-800 dark:text-secondary-400 mt-1">
                        {word.reading} - {word.meaning}
                      </div>
                      {word.example && (
                        <div className="mt-2 text-sm text-secondary-500 dark:text-secondary-400 italic">
                          <div>Ví dụ: {word.example}</div>
                          <div>{word.exampleVi}</div>
                        </div>
                      )}
                    </div>
                    {word.audio_url && (
                      <Button
                        icon={<SoundOutlined />}
                        size="small"
                        onClick={() => console.log("Play audio:", word.audio_url)}
                        className="ml-2"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KanjiDetail;
