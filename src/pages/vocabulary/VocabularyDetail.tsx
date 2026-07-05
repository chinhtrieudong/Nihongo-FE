/**
 * VocabularyDetail - Updated to use normalized core data
 * Clean implementation without legacy data fetching
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography, Spin, Tabs, Statistic, Row, Col, Space, Dropdown, MenuProps } from "antd";
import { EmptyState, LessonNavigation } from "../../components/common";
import { ArrowLeft, Volume2, BookOpen, Layers, Star, CheckCircle, XCircle, RotateCcw, Target, Download, Clock } from "lucide-react";
import { VocabularyFlashcard } from "../../components/vocabulary/VocabularyFlashcard";
import { useResponsive } from "../../hooks/useResponsive";
import { useVocabulary, useLessons } from "../../hooks/useVocabulary";
import { useAppSelector } from "../../store/hooks";
import { useSRSManager } from "../../hooks/useSRSManager";
import { useQuizManager } from "../../hooks/useQuizManager";
import { useFlashcardSettings } from "../../hooks/useFlashcardSettings";
import FlashcardSettingsModal from "../../components/vocabulary/FlashcardSettingsModal";
import { useFlashcardSession } from "../../hooks/useFlashcardSession";
import type { VocabularyItem } from "../../types/vocabulary";
import { toLegacyVocabularyItem, speakText, getBestFemaleNaturalVoice } from "../../utils/vocabularyUtils";
import type { VocabularyItem as LegacyVocabularyItem } from "../../types/lesson";

const { Title, Text } = Typography;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Export functions
const exportToCSV = (items: VocabularyItem[], lessonNumber: number) => {
  const headers = ['Kanji', 'Hiragana', 'Hán Việt', 'Nghĩa', 'Ví dụ JP', 'Ví dụ VN'];
  const rows = items.map(item => [
    item.kanji || '',
    item.hiragana || '',
    item.hanViet || '',
    item.meaning || '',
    item.example || '',
    item.exampleMeaning || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vocabulary-lesson-${lessonNumber}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportToJSON = (items: VocabularyItem[], lessonNumber: number) => {
  const data = items.map(item => ({
    kanji: item.kanji,
    hiragana: item.hiragana,
    hanViet: item.hanViet,
    meaning: item.meaning,
    example: item.example,
    exampleMeaning: item.exampleMeaning,
    textbook: item.textbook,
    level: item.level,
    lesson: item.lesson,
    topic: item.topic
  }));

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vocabulary-lesson-${lessonNumber}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportToTXT = (items: VocabularyItem[], lessonNumber: number) => {
  const content = items.map(item => {
    let text = `【${item.kanji || item.hiragana}】\n`;
    text += `  Hiragana: ${item.hiragana}\n`;
    text += `  Hán Việt: ${item.hanViet}\n`;
    text += `  Nghĩa: ${item.meaning}\n`;
    if (item.example) {
      text += `  Ví dụ: ${item.example}\n`;
      if (item.exampleMeaning) {
        text += `  Nghĩa ví dụ: ${item.exampleMeaning}\n`;
      }
    }
    text += '\n';
    return text;
  }).join('');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vocabulary-lesson-${lessonNumber}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
};

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
  const [flashcardBaseCards, setFlashcardBaseCards] = useState<VocabularyItem[]>([]);
  const [shuffledCards, setShuffledCards] = useState<VocabularyItem[]>([]);
  const lessonKey = `${textbookId || ""}::${lessonNum}`;
  const [flashcardLessonKey, setFlashcardLessonKey] = useState<string>("");
  // Session status type is defined in useFlashcardSession, reuse here for consistency
  type SessionStatus = "unanswered" | "known" | "unknown";



  const { settings, updateSettings, isSettingsModalOpen, openSettings, closeSettings } = useFlashcardSettings();

  // Flashcard session hook
  const {
    currentCardIndex,
    isFlipped,
    cardStatus,
    isStudyComplete,
    nextCard,
    prevCard,
    flipCard,
    markKnown,
    markUnknown,
    resetSession,
    setIsFlipped,
    setCurrentCardIndex,
  } = useFlashcardSession(vocabularyItems);

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('vocabulary-favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('vocabulary-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  }, []);

  const { currentUser } = useAppSelector((state) => state.user);
  const { srsData, updateSRS, getDueWords } = useSRSManager(currentUser?.id, textbookId, lessonNum);
  const dueWords = getDueWords(vocabularyItems);
  
  const {
    showQuiz,
    quizQuestionIndex,
    quizQuestions,
    quizScore,
    quizMode,
    selectedAnswer,
    showAnswerResult,
    isAnswerCorrect,
    startQuiz,
    handleQuizAnswer,
    nextQuizQuestion,
    endQuiz,
    currentQuizQuestion,
    quizProgress,
  } = useQuizManager(vocabularyItems, updateSRS);

  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Get best voice for TTS
  const femaleVoiceName = useMemo(() => {
    const voice = getBestFemaleNaturalVoice();
    return voice?.name;
  }, []);

  // Reset flashcard state when navigating between lessons/textbooks
  useEffect(() => {
    setShowFlashcard(false);
    setFlashcardBaseCards([]);
    setShuffledCards([]);
    setFlashcardLessonKey("");
    // Reset hook session state
    resetSession();
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [textbookId, lessonNum, resetSession, setCurrentCardIndex, setIsFlipped]);

  // Convert to legacy format for flashcard component
  const legacyItems = useMemo(() => toLegacyItems(vocabularyItems), [vocabularyItems]);
  // Compute cards to study as legacy items
  const cardsToStudy = useMemo(() => {
    const inScope = flashcardLessonKey === "" || flashcardLessonKey === lessonKey;
    const base = inScope && flashcardBaseCards.length > 0 ? flashcardBaseCards : vocabularyItems;
    const active = inScope && shuffledCards.length > 0 ? shuffledCards : base;
    return toLegacyItems(active);
  }, [flashcardBaseCards, shuffledCards, vocabularyItems, flashcardLessonKey, lessonKey]);

  // Current card derived from legacy cards
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

  // Renamed flip handler to avoid name clash with hook's flipCard
  const toggleFlipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleMemoryEvaluation = useCallback((status: "unknown" | "known") => {
    if (!currentCard) return;
    updateSRS(currentCard.id, status === "known");
    if (status === "known") {
      markKnown();
    } else {
      markUnknown();
    }
  }, [currentCard, updateSRS, markKnown, markUnknown]);

  const shuffleCards = useCallback(() => {
    // Always shuffle within the current lesson scope
    setFlashcardLessonKey(lessonKey);
    const base = flashcardBaseCards.length > 0 ? flashcardBaseCards : vocabularyItems;
    const shuffled = [...base].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [flashcardBaseCards, vocabularyItems, lessonKey]);

  // Reset study session, hook manages isStudyComplete internally
  const resetStudySession = useCallback((mode: "all" | "unremembered" = "all") => {
    setFlashcardLessonKey(lessonKey);
    const base = flashcardBaseCards.length > 0 ? flashcardBaseCards : vocabularyItems;
    const cardsToUse = mode === "unremembered"
      ? base.filter((card: VocabularyItem) => cardStatus[card.id] === "unknown")
      : base;
    // Reset session via hook and update local UI state
    resetSession();
    // Keep the natural order by default; user can manually shuffle.
    setShuffledCards([...cardsToUse]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [flashcardBaseCards, vocabularyItems, cardStatus, lessonKey, resetSession, setCurrentCardIndex, setIsFlipped]);

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
      // Keep the natural order by default; user can manually shuffle.
      setShuffledCards([...items]);
    }

    // Initialize hook session with current cards
    resetSession();
    setShowFlashcard(true);
  }, [vocabularyItems, shuffledCards, lessonKey, resetSession]);

  const closeFlashcard = useCallback(() => {
    setShowFlashcard(false);
    resetSession();
  }, [resetSession]);

  const handleBack = () => {
    navigate(`/textbook/${textbookId}`);
  };

  const handlePrevCard = useCallback(() => {
    prevCard();
  }, [prevCard]);

  const handleNextCard = useCallback(() => {
    nextCard();
  }, [nextCard]);

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
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  if (error || vocabularyItems.length === 0) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Chưa có từ vựng"}
          description={error || "Bài học này chưa có từ vựng nào."}
          size="default"
          action={{
            label: "Quay lại",
            onClick: handleBack,
          }}
        />
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
              className="bg-white dark:bg-slate-800 rounded-xl border border-border p-4 hover:shadow-lg hover:border-blue-400/30 transition-all duration-300 group"
            >
              {/* Main Word Section */}
              <div className="flex items-start gap-3">
                {/* Left Content: Kanji + HanViet */}
                <div
                  className={`w-16 min-w-[4rem] text-center flex flex-col items-center ${
                    item.hanViet ? "justify-start" : "justify-center"
                  }`}
                >
                  <Text className="text-xl sm:text-2xl font-bold text-text-main block kanji-text leading-tight">
                    {item.kanji || item.hiragana}
                  </Text>
                  {item.hanViet && (
                    <Text className="text-xs font-medium text-amber-600 uppercase tracking-wide block mt-0.5 line-clamp-1">
                      {item.hanViet}
                    </Text>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="w-px self-stretch" style={{ borderLeft: '1px solid rgba(148, 163, 184, 0.25)' }} />

                {/* Right Content: Hiragana + Meaning */}
                <div className="flex-1 min-w-0">
                  <Text className="text-base sm:text-lg text-blue-500 font-medium block jp-text truncate">
                    {item.hiragana}
                  </Text>
                  <Text className="text-base sm:text-lg text-text-main block mt-0.5 truncate">
                    {item.meaning}
                  </Text>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.has(item.id)
                        ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                        : "text-text-sub hover:text-yellow-500 hover:bg-yellow-500/10"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${favorites.has(item.id) ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => speakText(item.hiragana, 'ja-JP', femaleVoiceName)}
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
                      onClick={() => speakText(item.example, 'ja-JP', femaleVoiceName)}
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
    {
      key: "review",
      label: (
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Review
          {dueWords.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {dueWords.length}
            </span>
          )}
        </span>
      ),
      children: (
        <div className="py-6">
          {dueWords.length === 0 ? (
            <EmptyState
              type="data"
              title="Không có từ cần ôn tập"
              description="Tuyệt vời! Bạn đã hoàn thành tất cả các bài ôn tập."
              size="default"
            />
          ) : (
            <>
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-text-main mb-2">
                  {dueWords.length} từ cần ôn tập
                </h3>
                <Text className="text-text-sub">
                  Dựa trên thuật toán Spaced Repetition (SRS)
                </Text>
              </div>
              <div className="grid gap-3">
                {dueWords.map((item) => {
                  const srsItem = srsData[item.id];
                  const nextReviewDate = srsItem?.nextReview
                    ? new Date(srsItem.nextReview).toLocaleDateString('vi-VN')
                    : 'Ngay bây giờ';
                  const accuracy = srsItem?.reviewCount > 0
                    ? Math.round((srsItem.correctCount / srsItem.reviewCount) * 100)
                    : 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-border p-4"
                    >
                      <div className="flex items-start gap-3">
                        {/* Kanji */}
                        <div className="w-16 min-w-[4rem] text-center flex flex-col items-center">
                          <div className="text-xl sm:text-2xl font-bold text-text-main kanji-text leading-tight">
                            {item.kanji || item.hiragana}
                          </div>
                          {item.kanji && item.hiragana !== item.kanji && (
                            <div className="text-sm text-blue-500 jp-text mt-0.5">
                              {item.hiragana}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <Text className="text-base sm:text-lg text-blue-500 font-medium block jp-text">
                            {item.hiragana}
                          </Text>
                          <Text className="text-base sm:text-lg text-text-main block mt-0.5">
                            {item.meaning}
                          </Text>
                          {item.hanViet && (
                            <Text className="text-xs text-purple-500 block mt-0.5">
                              {item.hanViet}
                            </Text>
                          )}
                          <div className="flex gap-3 mt-1">
                            <div className="text-xs text-text-sub">
                              Chính xác: <span className="font-semibold">{accuracy}%</span>
                            </div>
                            <div className="text-xs text-text-sub">
                              Ôn: <span className="font-semibold">{srsItem?.reviewCount || 0}</span> lần
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              favorites.has(item.id)
                                ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                                : "text-text-sub hover:text-yellow-500 hover:bg-yellow-500/10"
                            }`}
                          >
                            <Star className={`w-4 h-4 ${favorites.has(item.id) ? "fill-current" : ""}`} />
                          </button>
                          <button
                            onClick={() => speakText(item.hiragana, 'ja-JP', femaleVoiceName)}
                            className="p-2 rounded-lg text-text-sub hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: "quiz",
      label: (
        <span className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          Quiz
        </span>
      ),
      children: (
        <div className="py-8">
          {!showQuiz ? (
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-text-main mb-2">Chọn chế độ quiz</h3>
                <p className="text-text-sub">Kiểm tra kiến thức từ vựng của bạn</p>
              </div>
              {isQuizLoading ? (
                <Spin size="large" />
              ) : (
                <div className="flex justify-center gap-4">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      setIsQuizLoading(true);
                      startQuiz('jp-to-vi');
                      setIsQuizLoading(false);
                    }}
                    className="h-12 px-8 rounded-xl"
                  >
                    Tiếng Nhật → Tiếng Việt
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    onClick={() => {
                      setIsQuizLoading(true);
                      startQuiz('vi-to-jp');
                      setIsQuizLoading(false);
                    }}
                    className="h-12 px-8 rounded-xl"
                  >
                    Tiếng Việt → Tiếng Nhật
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Quiz Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Text className="text-text-sub">
                    Câu {quizQuestionIndex + 1} / {quizQuestions.length}
                  </Text>
                  <Text className="text-text-sub">
                    Điểm: {quizScore}
                  </Text>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${quizProgress}%` }}
                  />
                </div>
              </div>

              {/* Quiz Question */}
              {currentQuizQuestion && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-border p-6 mb-6">
                  <div className="text-center mb-6">
                    {quizMode === 'jp-to-vi' ? (
                      <>
                        <div className="text-4xl font-bold text-text-main kanji-text mb-2">
                          {currentQuizQuestion.kanji || currentQuizQuestion.hiragana}
                        </div>
                        {currentQuizQuestion.kanji && currentQuizQuestion.hiragana !== currentQuizQuestion.kanji && (
                          <div className="text-xl text-blue-500 jp-text">
                            {currentQuizQuestion.hiragana}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-3xl font-semibold text-text-main">
                        {currentQuizQuestion.meaning}
                      </div>
                    )}
                  </div>

                  {/* Answer Options */}
                  {!showAnswerResult ? (
                    <div className="grid gap-3">
                      {(() => {
                        const options = quizMode === 'jp-to-vi'
                          ? (() => {
                              const allMeanings = vocabularyItems.map(v => v.meaning);
                              const wrongAnswers = allMeanings
                                .filter(m => m !== currentQuizQuestion.meaning)
                                .sort(() => Math.random() - 0.5)
                                .slice(0, 3);
                              return [...wrongAnswers, currentQuizQuestion.meaning].sort(() => Math.random() - 0.5);
                            })()
                          : (() => {
                              const allWords = vocabularyItems.map(v => ({ word: v.kanji || v.hiragana, hiragana: v.hiragana }));
                              const wrongAnswers = allWords
                                .filter(w => w.word !== (currentQuizQuestion.kanji || currentQuizQuestion.hiragana))
                                .sort(() => Math.random() - 0.5)
                                .slice(0, 3);
                              return [...wrongAnswers, { word: currentQuizQuestion.kanji || currentQuizQuestion.hiragana, hiragana: currentQuizQuestion.hiragana }].sort(() => Math.random() - 0.5);
                            })();

                        return options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const isCorrect = quizMode === 'jp-to-vi'
                                ? option === currentQuizQuestion.meaning
                                : typeof option === 'object' && option.word === (currentQuizQuestion.kanji || currentQuizQuestion.hiragana);
                              handleQuizAnswer(quizMode === 'jp-to-vi' ? option as string : (option as any).word, isCorrect);
                            }}
                            className="w-full p-4 text-left rounded-lg border border-border hover:border-blue-400 hover:bg-surface-2 transition-all"
                          >
                            <span className="text-lg">
                              {quizMode === 'jp-to-vi'
                                ? option as string
                                : typeof option === 'object'
                                  ? `${(option as any).word}${(option as any).hiragana !== (option as any).word ? ` (${(option as any).hiragana})` : ''}`
                                  : option
                              }
                            </span>
                          </button>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-4 ${isAnswerCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {isAnswerCorrect ? '✓ Chính xác!' : '✗ Sai rồi!'}
                      </div>
                      {!isAnswerCorrect && (
                        <div className="mb-4">
                          <Text className="text-text-sub">Đáp án đúng: </Text>
                          <Text className="text-text-main font-semibold">
                            {quizMode === 'jp-to-vi'
                              ? currentQuizQuestion.meaning
                              : `${currentQuizQuestion.kanji || currentQuizQuestion.hiragana} (${currentQuizQuestion.hiragana})`
                            }
                          </Text>
                        </div>
                      )}
                      <Button
                        type="primary"
                        size="large"
                        onClick={nextQuizQuestion}
                        className="h-12 px-8 rounded-xl"
                      >
                        {quizQuestionIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Kết thúc'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Complete */}
              {quizQuestionIndex >= quizQuestions.length - 1 && showAnswerResult && (
                <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-border p-6 text-center">
                  <h3 className="text-2xl font-bold text-text-main mb-2">Hoàn thành!</h3>
                  <div className="text-4xl font-bold text-blue-500 mb-4">
                    {quizScore} / {quizQuestions.length}
                  </div>
                  <Text className="text-text-sub mb-4">
                    {Math.round((quizScore / quizQuestions.length) * 100)}% chính xác
                  </Text>
                  <Button
                    type="primary"
                    size="large"
                    onClick={endQuiz}
                    className="h-12 px-8 rounded-xl"
                  >
                    Đóng
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header with Navigation - Mobile Optimized */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <Button
            onClick={handleBack}
            icon={<ArrowLeft className="w-5 h-5" />}
            size={screens.xs ? "large" : "middle"}
            className="flex-shrink-0"
          >
            {screens.xs ? "" : "Quay lại"}
          </Button>

          <LessonNavigation
            currentLesson={lessonNum}
            totalLessons={lessons.length || 25}
            onPrev={handlePrevLesson}
            onNext={handleNextLesson}
            showSelect={false}
          />
        </div>

        {/* Title Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-2xl font-bold text-white">{lessonNum}</span>
          </div>
          <div className="flex-1">
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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'csv',
                  label: 'Export CSV',
                  onClick: () => exportToCSV(vocabularyItems, lessonNum),
                },
                {
                  key: 'json',
                  label: 'Export JSON',
                  onClick: () => exportToJSON(vocabularyItems, lessonNum),
                },
                {
                  key: 'txt',
                  label: 'Export TXT',
                  onClick: () => exportToTXT(vocabularyItems, lessonNum),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button
              type="default"
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </Dropdown>
        </div>

        {/* Study Statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border">
              <div className="text-text-sub text-sm mb-1">Tổng số từ</div>
              <div className="text-2xl font-bold text-text-main">{vocabularyItems.length}</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border">
              <div className="text-text-sub text-sm mb-1">Cần ôn tập</div>
              <div className="text-2xl font-bold text-orange-500">{dueWords.length}</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border">
              <div className="text-text-sub text-sm mb-1">Đã học</div>
              <div className="text-2xl font-bold text-green-500">
                {Object.keys(srsData).filter(id => vocabularyItems.some(item => item.id === id)).length}
              </div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border">
              <div className="text-text-sub text-sm mb-1">Yêu thích</div>
              <div className="text-2xl font-bold text-yellow-500">{favorites.size}</div>
            </div>
          </Col>
        </Row>

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
            onFlipCard={toggleFlipCard}
            onMemoryEvaluation={handleMemoryEvaluation}
            onSetIsFullscreen={() => {}}
            onBackToTable={closeFlashcard}
            onResetCards={() => resetStudySession("all")}
            onShuffleCards={shuffleCards}
            onPrevCard={handlePrevCard}
            onNextCard={handleNextCard}
            settings={settings}
            onOpenSettings={openSettings}
          />
        )}

        <FlashcardSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={closeSettings}
          settings={settings}
          onSettingsChange={updateSettings}
          onResetCards={() => resetStudySession("all")}
          onShuffleCards={shuffleCards}
        />

        {/* Completion Modal */}
        {showFlashcard && isStudyComplete && (
          <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
            onClick={closeFlashcard}
          >
            <div
              className="w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl border border-border bg-white dark:bg-slate-800 p-6 sm:p-8 text-text-main min-h-[300px] flex flex-col justify-between relative overflow-hidden shadow-xl">
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
                <button
                  type="button"
                  aria-label="Đóng"
                  onClick={closeFlashcard}
                  className="absolute top-3 right-3 h-9 w-9 rounded-full text-text-sub hover:text-text-main hover:bg-surface-2 transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
                <div className="text-center">
                  <Title level={2} className="!mb-1 !text-text-main">
                    Hoàn thành
                  </Title>
                  <div className="text-sm text-text-sub mb-4">
                    Bạn đã hoàn thành phiên học hôm nay
                  </div>

                  <Row gutter={16} className="mb-2">
                    <Col span={8}>
                      <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-text-sub mb-1">
                          Tổng
                        </div>
                        <Statistic
                          value={totalCount}
                          styles={{ content: { color: "var(--primary)" } }}
                          className="text-text-main"
                        />
                      </div>
                    </Col>

                    <Col span={8}>
                      <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-text-sub mb-1">
                          Đã nhớ
                        </div>
                        <Statistic
                          value={knownCount}
                          styles={{ content: { color: "var(--success)" } }}
                          prefix={
                            <CheckCircle className="w-4 h-4" style={{ color: "var(--success)" }} />
                          }
                          className="text-text-main"
                        />
                      </div>
                    </Col>

                    <Col span={8}>
                      <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-text-sub mb-1">
                          Chưa nhớ
                        </div>
                        <Statistic
                          value={unknownCount}
                          styles={{ content: { color: "var(--error)" } }}
                          prefix={
                            <XCircle className="w-4 h-4" style={{ color: "var(--error)" }} />
                          }
                          className="text-text-main"
                        />
                      </div>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-text-main">
                      <span className="font-semibold">Độ nhớ</span>
                      <span className="text-text-sub">•</span>
                      <span
                        className="font-bold"
                        style={{
                          color:
                            accuracyPercent >= 80
                              ? "var(--success)"
                              : accuracyPercent >= 50
                                ? "var(--primary)"
                                : "var(--error)",
                        }}
                      >
                        {accuracyPercent}%
                      </span>
                    </div>
                  </div>

                  {unknownItems.length > 0 && (
                    <div className="mt-2 text-left">
                      <div className="text-xs uppercase tracking-wide text-text-sub mb-2">
                        Từ chưa nhớ ({unknownItems.length})
                      </div>
                      <div className="max-h-44 overflow-auto rounded-xl border border-border bg-surface-2">
                        {unknownItems.slice(0, 12).map((it) => {
                          const hasKanji = it.kanji && it.kanji.trim();
                          const hasHira = it.hiragana && it.hiragana.trim();
                          const isSame = hasKanji && hasHira && it.kanji === it.hiragana;
                          const hanViet = it.hanViet;
                          
                          return (
                            <div
                              key={it.id}
                              className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-b-0"
                            >
                              <div className="min-w-0 flex-1">
                                {/* Row 1: Kanji + Hiragana (dedupe if same) */}
                                <div className="flex items-center gap-2">
                                  {hasKanji && (
                                    <span className="text-base font-semibold text-text-main kanji-text truncate">
                                      {it.kanji}
                                    </span>
                                  )}
                                  {hasHira && !isSame && (
                                    <span className="text-sm text-text-sub jp-text truncate">
                                      {it.hiragana}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Row 2: HanViet + Meaning */}
                                <div className="text-sm truncate">
                                  {hanViet && (
                                    <span className="text-amber-500/80 font-medium">
                                      {hanViet}
                                    </span>
                                  )}
                                  {hanViet && it.meaning && (
                                    <span className="text-text-sub mx-1">·</span>
                                  )}
                                  <span className="text-text-main/80">
                                    {it.meaning}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => speakText(it.hiragana, 'ja-JP', femaleVoiceName)}
                                className="p-2 rounded-lg text-text-sub hover:text-text-main hover:bg-white dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                                aria-label="Phát âm"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                        {unknownItems.length > 12 && (
                          <div className="px-4 py-2 text-xs text-text-sub">
                            Và {unknownItems.length - 12} từ nữa…
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center pt-0 mt-4">
                  <Space size="middle">
                    {unknownCount > 0 ? (
                      <>
                        {/* Primary: Review unknown */}
                        <Button
                          type="primary"
                          size="large"
                          className="h-11 min-w-[160px] rounded-xl bg-amber-500 hover:bg-amber-600 border-amber-500 font-medium shadow-lg shadow-amber-500/25 inline-flex items-center gap-1.5"
                          onClick={() => resetStudySession("unremembered")}
                        >
                          <Target className="w-4 h-4" />
                          <span>Ôn lại {unknownCount} từ</span>
                        </Button>
                        {/* Secondary: Study all */}
                        <Button
                          size="large"
                          className="h-11 min-w-[160px] rounded-xl bg-transparent text-text-main border border-border hover:border-white/30 hover:bg-surface-2 transition-all inline-flex items-center gap-1.5"
                          onClick={() => resetStudySession("all")}
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Học lại toàn bộ</span>
                        </Button>
                      </>
                    ) : (
                      /* Primary: Study all when perfect */
                      <Button
                        type="primary"
                        size="large"
                        className="h-11 min-w-[200px] rounded-xl bg-emerald-500 hover:bg-emerald-600 border-emerald-500 font-medium shadow-lg shadow-emerald-500/25 inline-flex items-center gap-1.5"
                        onClick={() => resetStudySession("all")}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Học lại toàn bộ</span>
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
