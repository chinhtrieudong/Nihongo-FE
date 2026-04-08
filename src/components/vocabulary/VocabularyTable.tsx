import React, { useState, useMemo, useEffect, useCallback } from "react";

import {
  Table,
  Button,
  Typography,
  Statistic,
  Row,
  Col,
  Space,
} from "antd";

import { Volume2, CheckCircle, XCircle, RotateCcw, Trophy, Target, BookOpen, Flame, Zap, PartyPopper } from "lucide-react";
import { EmptyState } from "../common";

// Animated counter hook
const useAnimatedCounter = (target: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + (target - startValue) * easeOutQuart);
      
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    return () => setCount(0);
  }, [target, duration]);
  
  return count;
};

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <div
    className="absolute w-2 h-2 rounded-full"
    style={{
      backgroundColor: color,
      animation: `confetti-fall 1.5s ease-out ${delay}s forwards`,
      left: `${Math.random() * 100}%`,
      top: '-10px',
    }}
  />
);

interface CompletionModalProps {
  totalCount: number;
  knownCount: number;
  unknownCount: number;
  accuracyPercent: number;
  unknownItems: VocabularyItemType[];
  globalUnknownCount: number;
  onClose: () => void;
  onResetAll: () => void;
  onResetUnknown: () => void;
}

// Completion Modal Component - Redesigned for better UX
const CompletionModal: React.FC<CompletionModalProps> = ({
  totalCount,
  knownCount,
  unknownCount,
  accuracyPercent,
  onClose,
  onResetAll,
  onResetUnknown,
}) => {
  const animatedPercent = useAnimatedCounter(accuracyPercent, 1500);
  const animatedKnown = useAnimatedCounter(knownCount, 1000);
  
  const isPerfect = accuracyPercent === 100;
  const isGood = accuracyPercent >= 80;
  const hasUnknown = unknownCount > 0;
  
  // Get celebration message
  const getTitle = () => {
    if (isPerfect) return "Xuất sắc! 🎉";
    if (isGood) return "Rất tốt! �";
    return "Hoàn thành! �";
  };
  
  const getMessage = () => {
    if (isPerfect) return "Bạn đã nhớ toàn bộ từ vựng";
    if (isGood) return `Bạn đã nhớ ${accuracyPercent}% từ vựng`;
    return `Còn ${unknownCount} từ cần ôn thêm`;
  };
  
  const confettiColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
  
  // Get color theme based on performance
  const getTheme = () => {
    if (isPerfect) return { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-400', border: 'border-emerald-400/50', glow: 'shadow-emerald-500/30' };
    if (isGood) return { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', border: 'border-blue-400/50', glow: 'shadow-blue-500/30' };
    return { bg: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-400', border: 'border-amber-400/50', glow: 'shadow-amber-500/30' };
  };
  
  const theme = getTheme();
  
  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Confetti - more particles for celebration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: isPerfect ? 40 : 20 }).map((_, i) => (
          <ConfettiParticle 
            key={i} 
            delay={i * 0.03} 
            color={confettiColors[i % confettiColors.length]} 
          />
        ))}
      </div>
      
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(1080deg) scale(0.3); opacity: 0; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px currentColor; }
          50% { box-shadow: 0 0 60px currentColor; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      <div
        className="w-full max-w-sm relative"
        style={{ animation: 'scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow */}
        <div className={`absolute -top-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-br ${theme.bg} blur-3xl opacity-60`} />
        <div className={`absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br ${theme.bg} blur-3xl opacity-60`} />
        
        <div className="relative rounded-3xl border border-white/10 bg-slate-900/95 p-10 text-white shadow-2xl overflow-hidden">
          {/* Close button - subtle */}
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center z-10"
          >
            ✕
          </button>
          
          <div className="text-center space-y-8">
            
            {/* 🎯 HERO: Big Percentage - THE FOCAL POINT */}
            <div className="relative flex justify-center">
              {/* Outer glow ring */}
              <div 
                className={`absolute inset-0 w-40 h-40 rounded-full ${theme.text} opacity-20`}
                style={{ 
                  animation: 'pulse-glow 2s ease-in-out infinite',
                  margin: 'auto',
                  top: 0, bottom: 0, left: 0, right: 0
                }}
              />
              
              {/* Main circle */}
              <div 
                className={`relative w-36 h-36 rounded-full border-4 ${theme.border} bg-slate-800 flex items-center justify-center`}
                style={{ boxShadow: `0 0 40px currentColor` }}
              >
                <div className="text-center">
                  <div className={`text-6xl font-bold ${theme.text} tabular-nums`}>
                    {animatedPercent}
                  </div>
                  <div className="text-sm font-medium text-slate-500">%</div>
                </div>
                
                {/* Perfect badge */}
                {isPerfect && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center" style={{ animation: 'float 2s ease-in-out infinite' }}>
                    <Trophy className="w-5 h-5 text-slate-900" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Title & Message */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">
                {getTitle()}
              </h2>
              <p className="text-slate-400 text-lg">
                {getMessage()}
              </p>
            </div>
            
            {/* Compact Stats - Horizontal */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-slate-500 text-xs uppercase">Tổng</div>
                  <div className="font-semibold text-white">{totalCount}</div>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/10" />
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="text-slate-500 text-xs uppercase">Đã nhớ</div>
                  <div className="font-semibold text-emerald-400">{animatedKnown}</div>
                </div>
              </div>
              
              {hasUnknown && (
                <>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-slate-500 text-xs uppercase">Chưa nhớ</div>
                      <div className="font-semibold text-red-400">{unknownCount}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* 🔥 Streak Badge */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium">Chuỗi 3 ngày 🔥</span>
              </div>
            </div>
            
            {/* Unknown Words Summary - Compact */}
            {hasUnknown && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Cần ôn lại: <span className="text-red-400 font-medium">{unknownCount}</span> từ</span>
              </div>
            )}
            
            {/* 🎯 CTA SECTION - Clear hierarchy */}
            <div className="space-y-3 pt-6 mt-6 border-t border-white/10">
              {/* Primary Action */}
              {hasUnknown ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={onResetUnknown}
                  className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 border-none hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Ôn lại {unknownCount} từ chưa nhớ
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  onClick={onResetAll}
                  className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 border-none hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Tiếp tục bài tiếp theo
                </Button>
              )}
              
              {/* Secondary Actions */}
              <div className="flex gap-3">
                <Button
                  size="large"
                  className="flex-1 h-11 rounded-xl bg-transparent text-slate-400 border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all"
                  onClick={onResetAll}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Học lại
                </Button>
                <Button
                  size="large"
                  className="flex-1 h-11 rounded-xl bg-transparent text-slate-400 border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all"
                  onClick={onClose}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import type { VocabularyItem as VocabularyItemType } from "../../types/lesson";
import { generateVocabularyId, speakText } from "../../utils/vocabularyUtils";
import VocabularyFlashcard from "./VocabularyFlashcard";
import VocabularyCard from "./VocabularyCard";
import VocabularyDetailModal from "./VocabularyDetailModal";
import { useResponsive } from "../../hooks/useResponsive";
import { useAppSelector } from "../../store/hooks";
import { getFontPreset } from "../../constants/fonts";

const { Title } = Typography;

export type VocabularyTableHandle = {
  enterFlashcard: () => void;
};

interface VocabularyTableProps {
  data: VocabularyItemType[];

  loading?: boolean;

  onCloseSidebar?: () => void;
  onEnterFlashcard?: () => void;
  onExitFlashcard?: () => void;

  // Voice settings for TTS
  femaleVoiceName?: string;
}

const VocabularyTable = React.forwardRef<
  VocabularyTableHandle,
  VocabularyTableProps
>(
  (
    {
      data,
      loading = false,
      onCloseSidebar,
      onEnterFlashcard,
      onExitFlashcard,
    },
    ref,
  ) => {
    const { screens } = useResponsive();
    const { fontPreset } = useAppSelector((state) => state.ui);
    const selectedPreset = getFontPreset(fontPreset);

    // Force re-render when font preset changes
    const kanjiFont = React.useMemo(() => {
      const font = selectedPreset.kanjiFontFamily || selectedPreset.fontFamily;
      return font;
    }, [selectedPreset]);

    // Font CSS variables are owned by the app-level FontProvider/ThemeProvider.

    const [showRomaji] = useState(false);

    const [showHanViet] = useState(true);

    const [selectedWord, setSelectedWord] = useState<VocabularyItemType | null>(
      null,
    );

    const [showModal, setShowModal] = useState(false);

    const [viewMode, setViewMode] = useState<"table" | "study" | "flashcard">(
      "table",
    );

    type SessionStatus = "unanswered" | "known" | "unknown";

    const [cardStatus, setCardStatus] = useState<Record<string, SessionStatus>>(
      {},
    );

    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const [showAnswer, setShowAnswer] = useState(false);

    const [isFlipped, setIsFlipped] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(false);

    const [isStudyComplete, setIsStudyComplete] = useState(false);

    const [shuffledCards, setShuffledCards] = useState<VocabularyItemType[]>(
      [],
    );

    // Replace duplicate ID generation with helper function
    useEffect(() => {
      const initialStatus: Record<string, SessionStatus> = {};
      data.forEach((item, index) => {
        const uniqueId = generateVocabularyId(item, index);
        initialStatus[uniqueId] = "unanswered";
      });
      setCardStatus(initialStatus);

      if (data.length > 0 && shuffledCards.length === 0) {
        const cardsWithIds = data.map((item, index) => ({
          ...item,
          id: generateVocabularyId(item, index),
        }));
        setShuffledCards(cardsWithIds);
      }
    }, [data]);

    const cardsToStudy = useMemo(() => {
      if (shuffledCards.length > 0) {
        return shuffledCards;
      }
      return data.map((item, index) => ({
        ...item,
        id: generateVocabularyId(item, index),
      }));
    }, [shuffledCards, data]);

    // Memoized count calculations
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
    const globalUnknownCount = Object.values(cardStatus).filter(
      (s) => s === "unknown",
    ).length;
    const accuracyPercent = totalCount ? Math.round((knownCount / totalCount) * 100) : 0;

    const unknownItems = useMemo(() => {
      const ids = new Set(
        Object.entries(cardStatus)
          .filter(([, status]) => status === "unknown")
          .map(([id]) => id),
      );
      return cardsToStudy.filter((c) => ids.has(c.id)).slice(0, 12);
    }, [cardStatus, cardsToStudy]);
    const currentCard = cardsToStudy[currentCardIndex];

    const filteredData = data;

    // Memoized event handlers
    const handleWordClick = useCallback((word: VocabularyItemType) => {
      setSelectedWord(word);
      setShowModal(true);
    }, []);

    const handlePlayHiraKanaAudio = useCallback(
      (text: string, event?: React.MouseEvent, voiceName?: string) => {
        if (event) {
          event.stopPropagation();
        }
        speakText(text, 'ja-JP', voiceName);
      },
      [],
    );

    // Memoized handlers
    const handleMemoryEvaluation = useCallback(
      (status: "unknown" | "known") => {
        if (!currentCard) return;

        setCardStatus((prev) => ({
          ...prev,
          [currentCard.id]: status,
        }));

        moveToNextCard();
      },
      [currentCard],
    );

    const moveToNextCard = useCallback(() => {
      if (currentCardIndex < cardsToStudy.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
        setIsFlipped(false);
        setShowAnswer(false);
      } else {
        setIsStudyComplete(true);
      }
    }, [currentCardIndex, cardsToStudy.length]);

    const shuffleCards = useCallback(() => {
      const shuffled = [...cardsToStudy].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowAnswer(false);
    }, [cardsToStudy]);

    const resetStudySession = useCallback(
      (mode: "all" | "unremembered" = "all") => {
        const dataWithIds = data.map((item, index) => ({
          ...item,
          id: generateVocabularyId(item, index),
        }));

        const cardsToUse =
          mode === "unremembered"
            ? dataWithIds.filter((card) => cardStatus[card.id] === "unknown")
            : dataWithIds;

        // Keep the natural order by default; user can manually shuffle.
        const ordered = [...cardsToUse];

        const resetStatus: Record<string, SessionStatus> = {};
        cardsToUse.forEach((c) => (resetStatus[c.id] = "unanswered"));

        const newStatus = { ...cardStatus };
        Object.keys(resetStatus).forEach((id) => {
          newStatus[id] = "unanswered";
        });

        setCardStatus(newStatus);
        setShuffledCards(ordered);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowAnswer(false);
        setIsStudyComplete(false);
      },
      [data, cardStatus],
    );

    React.useImperativeHandle(ref, () => ({
      enterFlashcard: () => {
        onEnterFlashcard?.();
        setViewMode("flashcard");
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowAnswer(false);
        setIsFullscreen(false);
        setIsStudyComplete(false);
      },
    }));

    // Memoized table columns
    const tableColumns = useMemo(
      () => [
        {
          title: "Kanji",
          dataIndex: "kanji",
          key: "kanji",
          width: screens.lg ? 90 : 80,
          render: (text: string) => {
            return (
              <span
                className="text-2xl leading-none font-bold kanji-text"
                style={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  lineHeight: '1'
                }}
              >
                {text || "-"}
              </span>
            );
          },
        },
        {
          title: "Hira/Kana",
          dataIndex: "hiragana",
          key: "hiragana",
          width: screens.lg ? 150 : 130,
          render: (text: string, record: any) => (
            <Typography.Text className="!text-lg jp-text">
              {text || record.katakana || "-"}
            </Typography.Text>
          ),
        },
        ...(showRomaji
          ? [
            {
              title: "Romaji",
              dataIndex: "romaji",
              key: "romaji",
              width: screens.lg ? 110 : 90,
              render: (text: string) => (
                <Typography.Text type="secondary" className="!text-base">
                  {text || "-"}
                </Typography.Text>
              ),
            },
          ]
          : []),
        ...(showHanViet
          ? [
            {
              title: "Hán Việt",
              dataIndex: "hanviet",
              key: "hanviet",
              width: screens.lg ? 110 : 90,
              render: (_: string, record: VocabularyItemType) => (
                <span className="text-lg font-medium text-secondary-800 dark:text-secondary-300">
                  {(record.hanviet || record.han_viet)
                    ? String(record.hanviet || record.han_viet).toUpperCase().replace(/,/g, "")
                    : "-"}
                </span>
              ),
            },
          ]
          : []),
        {
          title: "Nghĩa tiếng Việt",
          dataIndex: "meaning_vi",
          key: "meaning_vi",
          width: screens.lg ? 150 : 130,
          render: (_: string, record: VocabularyItemType) => (
            <Typography.Text className="!text-lg">
              {record.meaning_vi || record.meaningVi || record.meaning || "-"}
            </Typography.Text>
          ),
        },
        {
          title: "Nghe",
          key: "audio",
          width: screens.lg ? 80 : 70,
          align: "center" as const,
          render: (_: any, record: any) => {
            const hiraKanaText = record.hiragana || record.katakana || "";
            return (
              <Button
                type="text"
                icon={<Volume2 className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hiraKanaText) {
                    handlePlayHiraKanaAudio(hiraKanaText, e);
                  }
                }}
                disabled={!hiraKanaText}
              />
            );
          },
        },
      ],
      [showRomaji, showHanViet, handlePlayHiraKanaAudio, screens.lg],
    );

    const tabletColumns = useMemo(
      () => [
        {
          title: "Kanji",
          dataIndex: "kanji",
          key: "kanji",
          width: 80,
          render: (text: string) => (
            <Typography.Text strong className="text-2xl leading-none kanji-text">
              {text || "-"}
            </Typography.Text>
          ),
        },
        {
          title: "Hira/Kana",
          dataIndex: "hiragana",
          key: "hiragana",
          width: 120,
          render: (text: string, record: any) => (
            <Typography.Text className="!text-lg jp-text">
              {text || record.katakana || "-"}
            </Typography.Text>
          ),
        },
        {
          title: "Nghĩa",
          dataIndex: "meaning_vi",
          key: "meaning_vi",
          width: 150,
          render: (_: string, record: VocabularyItemType) => (
            <Typography.Text className="!text-lg">
              {record.meaning_vi || record.meaningVi || record.meaning || "-"}
            </Typography.Text>
          ),
        },
        {
          title: "Nghe",
          key: "audio",
          width: 60,
          align: "center" as const,
          render: (_: any, record: any) => {
            const hiraKanaText = record.hiragana || record.katakana || "";
            return (
              <Button
                type="text"
                icon={<Volume2 className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hiraKanaText) {
                    handlePlayHiraKanaAudio(hiraKanaText, e);
                  }
                }}
                disabled={!hiraKanaText}
              />
            );
          },
        },
      ],
      [handlePlayHiraKanaAudio],
    );

    const flipCard = () => {
      setIsFlipped(!isFlipped);
      setShowAnswer(!showAnswer);
    };

    // Removed duplicate currentCard declaration

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case " ":
            e.preventDefault();

            flipCard();

            break;

          case "ArrowLeft":
            handleMemoryEvaluation("unknown");

            break;

          case "ArrowRight":
            handleMemoryEvaluation("known");

            break;

          case "s":

          case "S":
            shuffleCards();

            break;
        }
      };

      // ✅ Chỉ kích hoạt phím tắt khi chưa hoàn thành

      if (viewMode === "flashcard" && !isStudyComplete) {
        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
      }
    }, [
      viewMode,
      currentCardIndex,
      cardsToStudy,
      isFlipped,
      currentCard,
      isStudyComplete,
    ]);

    useEffect(() => {
      // ✅ Chỉ hoàn thành khi đã đánh giá HẾT tất cả thẻ (không còn 'unanswered')

      const currentCardIds = new Set(cardsToStudy.map((c) => c.id));

      const unansweredCount = Object.entries(cardStatus)

        .filter(
          ([id, status]) => currentCardIds.has(id) && status === "unanswered",
        ).length;

      // Đếm số thẻ đã đánh giá (known + unknown）

      const evaluatedCount = Object.entries(cardStatus)

        .filter(
          ([id, status]) =>
            currentCardIds.has(id) &&
            (status === "known" || status === "unknown"),
        ).length;

      // Chỉ hoàn thành khi: không còn unanswered VÀ đã có ít nhất 1 thẻ được đánh giá

      if (
        unansweredCount === 0 &&
        evaluatedCount > 0 &&
        cardsToStudy.length > 0
      ) {
        setIsStudyComplete(true);
      }
    }, [cardStatus, cardsToStudy]);

    const showFlashcard = viewMode === "flashcard" && !isStudyComplete;
    const showCompletion = viewMode === "flashcard" && isStudyComplete;

    // Debug
    useEffect(() => {
      console.log("[Debug] isStudyComplete:", isStudyComplete);
      console.log("[Debug] showFlashcard:", showFlashcard);
      console.log("[Debug] showCompletion:", showCompletion);
      console.log("[Debug] viewMode:", viewMode);
      console.log("[Debug] currentCardIndex:", currentCardIndex);
      console.log("[Debug] cardsToStudy.length:", cardsToStudy.length);
    }, [isStudyComplete, showFlashcard, showCompletion, viewMode, currentCardIndex, cardsToStudy.length]);

    useEffect(() => {
      const isFlashcardView = viewMode === "flashcard";
      document.body.classList.toggle("flashcard-open", isFlashcardView);
      return () => {
        document.body.classList.remove("flashcard-open");
      };
    }, [viewMode]);

    return (
      <div className={"p-0"}>
        {/* Mobile-First Table */}
        <div
          className={`border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-925 rounded-lg ${screens.xs ? "shadow-sm p-3" : "p-6"}`}
        >
          {screens.xs ? (
            /* Mobile Card View */
            <div className="space-y-3">
              {filteredData.map((item, index) => (
                <VocabularyCard
                  key={
                    item.id ||
                    `${item.kanji}_${item.hiragana || item.katakana}_${index}`
                  }
                  item={item}
                  index={index}
                  showHanViet={
                    viewMode === "table" || viewMode === "flashcard"
                      ? showHanViet
                      : false
                  }
                  onWordClick={handleWordClick}
                />
              ))}
              {filteredData.length === 0 && (
                <EmptyState
                  description="Không tìm thấy từ vựng nào"
                  className="py-8"
                />
              )}
            </div>
          ) : /* Desktop/Tablet Table View */
            viewMode === "table" || viewMode === "flashcard" ? (
              <Table
                dataSource={filteredData}
                loading={loading}
                rowKey={(record) =>
                  record.id ||
                  `${record.kanji}_${record.hiragana || record.katakana}_${Math.random().toString(36).substr(2, 9)}`
                }
                pagination={false}
                scroll={{ x: "max-content" }}
                className="vocab-table"
                columns={screens.md ? tableColumns : tabletColumns}
                onRow={(record: VocabularyItemType) => ({
                  onClick: () => handleWordClick(record),
                  style: { cursor: "pointer" },
                })}
              />
            ) : (
              <div className="space-y-3">
                {filteredData.map((item, index) => (
                  <div
                    key={
                      item.id ||
                      `${item.kanji}_${item.hiragana || item.katakana}_${index}`
                    }
                    className="rounded-lg border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-925 p-3 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handleWordClick(item)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl font-bold kanji-text text-secondary-900 dark:text-secondary-100">
                          {item.kanji || item.hiragana || item.katakana || "-"}
                        </div>
                        <div className="text-base text-secondary-600 dark:text-secondary-400">
                          {item.hiragana || item.katakana || "-"}
                        </div>
                        <div className="mt-1 text-lg text-secondary-900 dark:text-secondary-100">
                          {item.meaning_vi || "-"}
                        </div>
                      </div>
                      <Button
                        type="text"
                        icon={<Volume2 className="w-4 h-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          const hiraKanaText =
                            item.hiragana || item.katakana || "";
                          if (hiraKanaText) {
                            handlePlayHiraKanaAudio(hiraKanaText, e);
                          }
                        }}
                        disabled={!item.hiragana && !item.katakana}
                      />
                    </div>
                  </div>
                ))}
                {filteredData.length === 0 && (
                  <EmptyState
                    description="Không tìm thấy từ vựng nào"
                    className="py-8"
                  />
                )}
              </div>
            )}
        </div>

        <style>{`
        .vocab-table .ant-table-body::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .vocab-table .ant-table-body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .vocab-table .ant-table-thead > tr > th {
          font-size: 1.08rem;
          font-weight: 700;
        }
        .vocab-table .ant-table-tbody > tr > td {
          font-size: 1.06rem;
          line-height: 1.7;
        }
      `}</style>

        {/* Detail Modal */}
        <VocabularyDetailModal
          selectedWord={selectedWord}
          showModal={showModal}
          setShowModal={setShowModal}
        />

        {showFlashcard && (
          <VocabularyFlashcard
            currentCard={currentCard}
            currentCardIndex={currentCardIndex}
            cardsToStudy={cardsToStudy}
            isFlipped={isFlipped}
            isFullscreen={isFullscreen}
            screens={screens}
            onFlipCard={flipCard}
            onMemoryEvaluation={handleMemoryEvaluation}
            onSetIsFullscreen={setIsFullscreen}
            onBackToTable={() => {
              onExitFlashcard?.();
              setViewMode("table");
              setCurrentCardIndex(0);
              setIsFlipped(false);
              setIsFullscreen(false);
            }}
            onResetCards={() => resetStudySession("all")}
            onShuffleCards={shuffleCards}
          />
        )}

        {showCompletion && (
          <CompletionModal
            totalCount={totalCount}
            knownCount={knownCount}
            unknownCount={unknownCount}
            accuracyPercent={accuracyPercent}
            unknownItems={unknownItems}
            globalUnknownCount={globalUnknownCount}
            onClose={() => {
              onExitFlashcard?.();
              setViewMode("table");
            }}
            onResetAll={() => resetStudySession("all")}
            onResetUnknown={() => resetStudySession("unremembered")}
          />
        )}
      </div>
    );
  },
);

export default VocabularyTable;
