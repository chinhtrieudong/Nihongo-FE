/**
 * VocabularyDetail - Updated to use normalized core data
 * Clean implementation without legacy data fetching
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography, Empty, Spin, Tabs, Statistic, Row, Col, Space } from "antd";
import { ArrowLeft, Volume2, BookOpen, Layers, Star, CheckCircle, XCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import VocabularyFlashcard from "../../components/vocabulary/VocabularyFlashcard";
import { useResponsive } from "../../hooks/useResponsive";
import { useVocabulary, useLessons } from "../../hooks/useVocabulary";
import type { VocabularyItem } from "../../types/vocabulary";
import { toLegacyVocabularyItem, speakText } from "../../utils/vocabularyUtils";
import type { VocabularyItem as LegacyVocabularyItem } from "../../types/lesson";

const { Title, Text } = Typography;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightExample = (example: string, item: Pick<VocabularyItem, "kanji" | "hiragana">): React.ReactNode => {
  const query = (item.kanji || "").trim() || (item.hiragana || "").trim();
  if (!query) return example;

  const re = new RegExp(escapeRegExp(query), "g");
  if (!re.test(example)) return example;

  const parts = example.split(re);
  const matches = example.match(re) || [];

  const highlighted = [];
  for (let i = 0; i < parts.length; i++) {
    highlighted.push(parts[i]);
    if (i < matches.length) {
      highlighted.push(
        <mark
          key={`${i}-${matches[i]}`}
          className="rounded px-1 font-semibold bg-yellow-200/80 text-text-main dark:bg-yellow-500/20"
        >
          {matches[i]}
        </mark>,
      );
    }
  }
  return <>{highlighted}</>;
};

// Convert new items to legacy format for flashcard compatibility
const toLegacyItems = (items: VocabularyItem[]): LegacyVocabularyItem[] => {
  return items.map(toLegacyVocabularyItem);
};

const VocabularyDetail: React.FC = () => {
  const { textbookId, lessonNumber } = useParams<{ textbookId: string; lessonNumber: string }>();
  const navigate = useNavigate();
  const { screens } = useResponsive();

  const lessonNum = parseInt(lessonNumber || "1", 10);

  // Use new data hooks
  const { items: vocabularyItems, loading, error, refresh } = useVocabulary({
    textbookId: textbookId || "",
    lessonNumber: lessonNum,
  });

  const { lessons } = useLessons(textbookId);

  // Find current lesson info
  const currentLesson = useMemo(() => {
    return lessons.find(l => l.lessonNumber === lessonNum);
  }, [lessons, lessonNum]);

  // Flashcard states
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudyComplete, setIsStudyComplete] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<VocabularyItem[]>([]);
  const [flashcardBaseCards, setFlashcardBaseCards] = useState<VocabularyItem[]>([]);
  const lessonKey = `${textbookId || ""}::${lessonNum}`;
  const [flashcardLessonKey, setFlashcardLessonKey] = useState<string>("");
  type SessionStatus = "unanswered" | "known" | "unknown";
  const [cardStatus, setCardStatus] = useState<Record<string, SessionStatus>>({});

  // Reset flashcard state when navigating between lessons/textbooks
  useEffect(() => {
    setShowFlashcard(false);
    setFlashcardBaseCards([]);
    setShuffledCards([]);
    setFlashcardLessonKey("");
    setCardStatus({});
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsStudyComplete(false);
  }, [textbookId, lessonNum]);

  // Convert to legacy format for flashcard component
  const legacyItems = useMemo(() => toLegacyItems(vocabularyItems), [vocabularyItems]);
  const cardsToStudy = useMemo(() => {
    const inScope = flashcardLessonKey === "" || flashcardLessonKey === lessonKey;
    const base = inScope && flashcardBaseCards.length > 0 ? flashcardBaseCards : vocabularyItems;
    const active = inScope && shuffledCards.length > 0 ? shuffledCards : base;
    return toLegacyItems(active);
  }, [flashcardBaseCards, shuffledCards, vocabularyItems, flashcardLessonKey, lessonKey]);

  const currentCard = cardsToStudy[currentCardIndex];

  const sessionKnownCount = useMemo(() => {
    const currentCardIds = new Set(cardsToStudy.map((c) => c.id));
    return Object.entries(cardStatus).filter(
      ([id, status]) => currentCardIds.has(id) && status === "known",
    ).length;
  }, [cardStatus, cardsToStudy]);

  const sessionUnknownCount = useMemo(() => {
    const currentCardIds = new Set(cardsToStudy.map((c) => c.id));
    return Object.entries(cardStatus).filter(
      ([id, status]) => currentCardIds.has(id) && status === "unknown",
    ).length;
  }, [cardStatus, cardsToStudy]);

  const totalCount = cardsToStudy.length;
  const knownCount = sessionKnownCount;
  const unknownCount = sessionUnknownCount;
  const accuracyPercent = useMemo(() => {
    if (!totalCount) return 0;
    return Math.round((knownCount / totalCount) * 100);
  }, [knownCount, totalCount]);

  const unknownItems = useMemo(() => {
    const source = flashcardBaseCards.length > 0 ? flashcardBaseCards : vocabularyItems;
    const ids = new Set(Object.entries(cardStatus).filter(([, s]) => s === "unknown").map(([id]) => id));
    return source.filter((i) => ids.has(i.id));
  }, [cardStatus, flashcardBaseCards, vocabularyItems]);

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleMemoryEvaluation = useCallback((status: "unknown" | "known") => {
    if (!currentCard) return;
    setCardStatus((prev) => ({ ...prev, [currentCard.id]: status }));
    if (currentCardIndex < cardsToStudy.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsStudyComplete(true);
    }
  }, [currentCard, currentCardIndex, cardsToStudy.length]);

  const shuffleCards = useCallback(() => {
    // Always shuffle within the current lesson scope
    setFlashcardLessonKey(lessonKey);
    const base = flashcardBaseCards.length > 0 ? flashcardBaseCards : vocabularyItems;
    const shuffled = [...base].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [flashcardBaseCards, vocabularyItems, lessonKey]);

  const resetStudySession = useCallback((mode: "all" | "unremembered" = "all") => {
    setFlashcardLessonKey(lessonKey);
    const base = flashcardBaseCards.length > 0 ? flashcardBaseCards : vocabularyItems;
    const cardsToUse = mode === "unremembered"
      ? base.filter((card: VocabularyItem) => cardStatus[card.id] === "unknown")
      : base;
    const shuffled = [...cardsToUse].sort(() => Math.random() - 0.5);
    const resetStatus: Record<string, SessionStatus> = {};
    cardsToUse.forEach((c: VocabularyItem) => (resetStatus[c.id] = "unanswered"));
    setCardStatus((prev) => ({ ...prev, ...resetStatus }));
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsStudyComplete(false);
  }, [flashcardBaseCards, vocabularyItems, cardStatus, lessonKey]);

  const startFlashcard = useCallback(() => {
    const items = vocabularyItems;
    // Snapshot the exact list shown for this lesson
    setFlashcardBaseCards(items);
    setFlashcardLessonKey(lessonKey);

    // Don't reshuffle every time user opens flashcard.
    // Only shuffle if we don't already have a valid shuffled list for this lesson's items.
    const hasSameSet =
      shuffledCards.length === items.length &&
      shuffledCards.every((c) => items.some((i) => i.id === c.id));

    if (!hasSameSet) {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
    }

    const initialStatus: Record<string, SessionStatus> = {};
    items.forEach((item: VocabularyItem) => (initialStatus[item.id] = "unanswered"));
    setCardStatus(initialStatus);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsStudyComplete(false);
    setShowFlashcard(true);
  }, [vocabularyItems, shuffledCards, lessonKey]);

  const closeFlashcard = useCallback(() => {
    setShowFlashcard(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsStudyComplete(false);
  }, []);

  const handleBack = () => {
    navigate(`/textbook/${textbookId}`);
  };

  const handlePrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const handleNextCard = useCallback(() => {
    if (currentCardIndex < cardsToStudy.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex, cardsToStudy.length]);

  const handlePrevLesson = () => {
    if (!lessonNumber) return;
    const prevLesson = parseInt(lessonNumber, 10) - 1;
    if (prevLesson >= 1) {
      navigate(`/textbook/${textbookId}/vocabulary/${prevLesson}`);
    }
  };

  const handleNextLesson = () => {
    if (!lessonNumber) return;
    const nextLesson = parseInt(lessonNumber, 10) + 1;
    const maxLessons = lessons.length || (textbookId?.startsWith('tango') ? 10 : 25);
    if (nextLesson <= maxLessons) {
      navigate(`/textbook/${textbookId}/vocabulary/${nextLesson}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  if (error || vocabularyItems.length === 0) {
    return (
      <div className="min-h-full bg-bg p-8">
        <Empty description={error || "Không có dữ liệu từ vựng"} />
        <div className="text-center mt-4">
          <Button onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: "list",
      label: (
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Danh sách
        </span>
      ),
      children: (
        <div className="grid gap-3">
          {vocabularyItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-1 rounded-xl border border-border p-4 hover:shadow-lg hover:border-blue-400/30 transition-all duration-300 group"
            >
              {/* Main Word Section */}
              <div className="flex items-start gap-3">
                {/* Left Content: Kanji + HanViet */}
                <div
                  className={`flex-[0.3] text-center flex flex-col items-center h-16 ${
                    item.hanViet ? "justify-start" : "justify-center"
                  }`}
                >
                  <Text className="text-2xl font-bold text-text-main block kanji-text">
                    {item.kanji || item.hiragana}
                  </Text>
                  {item.hanViet && (
                    <Text className="text-sm font-medium text-amber-600 uppercase tracking-wide block mt-1">
                      {item.hanViet}
                    </Text>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-16" style={{ borderLeft: '1px solid rgba(148, 163, 184, 0.25)' }} />

                {/* Right Content: Hiragana + Meaning */}
                <div className="flex-[0.7]">
                  <Text className="text-lg text-blue-500 font-medium block jp-text">
                    {item.hiragana}
                  </Text>
                  <Text className="text-lg text-text-main block mt-1">
                    {item.meaning}
                  </Text>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="p-2 rounded-lg text-text-sub hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => speakText(item.hiragana)}
                    className="p-2 rounded-lg text-text-sub hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Examples Section */}
              {item.example && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.25)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Text className="text-text-main text-base block leading-relaxed tracking-wide jp-text">
                        {highlightExample(item.example, item)}
                      </Text>
                      {item.exampleMeaning && (
                        <Text className="text-text-sub text-base mt-1 block">
                          {item.exampleMeaning}
                        </Text>
                      )}
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={<Volume2 className="w-3.5 h-3.5" />}
                      onClick={() => speakText(item.example)}
                      className="text-text-sub hover:text-blue-500 flex-shrink-0"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleBack}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Quay lại
          </Button>

          <Space>
            <Button
              onClick={handlePrevLesson}
              disabled={lessonNum <= 1}
            >
              <span className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Bài trước
              </span>
            </Button>
            <Button
              onClick={handleNextLesson}
              disabled={lessonNum >= (lessons.length || 25)}
            >
              <span className="flex items-center gap-1">
                Bài sau <ChevronRight className="w-4 h-4" />
              </span>
            </Button>
          </Space>
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-2xl font-bold text-white">{lessonNum}</span>
          </div>
          <div>
            {currentLesson?.topic ? (
              <>
                <h1 className="text-2xl font-bold text-text-main">
                  {currentLesson.topic}
                </h1>
                <p className="text-lg text-text-sub">
                  {textbookId?.replace('tango-', 'Tango ').replace('minna-', 'Minna ').replace('speed_master-', 'Speed Master ').toUpperCase()}
                </p>
              </>
            ) : (
              <h1 className="text-2xl font-bold text-text-main">
                Từ vựng Bài {lessonNum}
              </h1>
            )}
            <p className="text-sm text-text-sub mt-1">
              {vocabularyItems.length} từ vựng
            </p>
          </div>
        </div>

        {/* Tabs */}
        <style>{`
          .vocabulary-tabs .ant-tabs-nav {
            background: #f1f5f9;
            border-radius: 12px;
            padding: 4px;
            margin-bottom: 16px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10);
          }
          .vocabulary-tabs .ant-tabs-nav::before {
            border-bottom: none;
          }
          .vocabulary-tabs .ant-tabs-tab {
            border-radius: 8px;
            padding: 8px 16px;
            color: #64748b;
            transition: all 0.2s;
          }
          .vocabulary-tabs .ant-tabs-tab:hover {
            color: #475569;
            background: rgba(255,255,255,0.5);
          }
          .vocabulary-tabs .ant-tabs-tab-active {
            background: #ffffff;
            color: #3b82f6 !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .vocabulary-tabs .ant-tabs-ink-bar {
            display: none;
          }
          .dark .vocabulary-tabs .ant-tabs-nav {
            background: #1e293b;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
          }
          .dark .vocabulary-tabs .ant-tabs-tab:hover {
            background: rgba(255,255,255,0.1);
          }
          .dark .vocabulary-tabs .ant-tabs-tab-active {
            background: #334155;
            color: #60a5fa !important;
          }
        `}</style>
        <Tabs
          defaultActiveKey="list"
          items={tabItems}
          className="vocabulary-tabs"
          tabBarExtraContent={
            <Button
              type="primary"
              icon={<Layers className="w-4 h-4" />}
              onClick={startFlashcard}
              className="flex items-center gap-2 ml-2"
            >
              Flashcard
            </Button>
          }
        />

        {/* Flashcard Modal */}
        {showFlashcard && !isStudyComplete && (
          <VocabularyFlashcard
            currentCard={currentCard}
            currentCardIndex={currentCardIndex}
            cardsToStudy={cardsToStudy}
            isFlipped={isFlipped}
            isFullscreen={false}
            screens={screens}
            onFlipCard={flipCard}
            onMemoryEvaluation={handleMemoryEvaluation}
            onSetIsFullscreen={() => {}}
            onBackToTable={closeFlashcard}
            onResetCards={() => resetStudySession("all")}
            onShuffleCards={shuffleCards}
            onPrevCard={handlePrevCard}
            onNextCard={handleNextCard}
          />
        )}

        {/* Completion Modal */}
        {showFlashcard && isStudyComplete && (
          <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
            onClick={closeFlashcard}
          >
            <div
              className="w-full max-w-xl text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-xl border border-slate-600 bg-slate-900 p-8 text-white min-h-[300px] flex flex-col justify-between relative overflow-hidden">
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                <button
                  type="button"
                  aria-label="Đóng"
                  onClick={closeFlashcard}
                  className="absolute top-3 right-3 h-9 w-9 rounded-full text-white/80 hover:text-white transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
                <div className="text-center">
                  <Title level={1} className="!mb-2 text-white">
                    🎉 Hoàn thành!
                  </Title>
                  <div className="text-sm text-white/70 mb-4">
                    Bạn đã hoàn thành phiên học hôm nay
                  </div>

                  <Row gutter={16} className="mb-2">
                    <Col span={8}>
                      <div className="rounded-lg border border-slate-600/60 bg-white/5 px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-white/60 mb-1">
                          Tổng
                        </div>
                        <Statistic
                          value={totalCount}
                          styles={{ content: { color: "#93c5fd" } }}
                          className="text-white"
                        />
                      </div>
                    </Col>

                    <Col span={8}>
                      <div className="rounded-lg border border-slate-600/60 bg-white/5 px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-white/60 mb-1">
                          Đã nhớ
                        </div>
                        <Statistic
                          value={knownCount}
                          styles={{ content: { color: "#86efac" } }}
                          prefix={
                            <CheckCircle className="w-4 h-4" style={{ color: "#86efac" }} />
                          }
                          className="text-white"
                        />
                      </div>
                    </Col>

                    <Col span={8}>
                      <div className="rounded-lg border border-slate-600/60 bg-white/5 px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-white/60 mb-1">
                          Chưa nhớ
                        </div>
                        <Statistic
                          value={unknownCount}
                          styles={{ content: { color: "#fca5a5" } }}
                          prefix={
                            <XCircle className="w-4 h-4" style={{ color: "#fca5a5" }} />
                          }
                          className="text-white"
                        />
                      </div>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-600/60 bg-white/5 px-4 py-2 text-sm text-white/90">
                      <span className="font-semibold">Độ nhớ</span>
                      <span className="text-white/50">•</span>
                      <span className="font-bold" style={{ color: accuracyPercent >= 80 ? "#86efac" : accuracyPercent >= 50 ? "#93c5fd" : "#fca5a5" }}>
                        {accuracyPercent}%
                      </span>
                    </div>
                  </div>

                  {unknownItems.length > 0 && (
                    <div className="mt-5 text-left">
                      <div className="text-xs uppercase tracking-wide text-white/60 mb-2">
                        Từ chưa nhớ ({unknownItems.length})
                      </div>
                      <div className="max-h-44 overflow-auto rounded-xl border border-slate-600/60 bg-white/5">
                        {unknownItems.slice(0, 12).map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-600/40 last:border-b-0"
                          >
                            <div className="min-w-0">
                              <div className="text-base font-semibold text-white kanji-text truncate">
                                {it.kanji || it.hiragana}
                              </div>
                              <div className="text-sm text-white/70 jp-text truncate">
                                {it.hiragana}
                              </div>
                              <div className="text-sm text-white/80 truncate">
                                {it.meaning}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => speakText(it.hiragana)}
                              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                              aria-label="Phát âm"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {unknownItems.length > 12 && (
                          <div className="px-4 py-2 text-xs text-white/60">
                            Và {unknownItems.length - 12} từ nữa…
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center pt-0">
                  <Space size="large">
                    <Button
                      type="primary"
                      size="large"
                      icon={<RotateCcw className="w-4 h-4" />}
                      onClick={() => resetStudySession("all")}
                    >
                      Học lại toàn bộ
                    </Button>

                    {unknownCount > 0 && (
                      <Button
                        type="default"
                        size="large"
                        className="bg-transparent text-neutral-200 border-neutral-500 hover:text-white hover:border-neutral-300 hover:bg-white/10"
                        onClick={() => resetStudySession("unremembered")}
                      >
                        Chỉ học {unknownCount} thẻ chưa nhớ
                      </Button>
                    )}
                  </Space>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyDetail;
