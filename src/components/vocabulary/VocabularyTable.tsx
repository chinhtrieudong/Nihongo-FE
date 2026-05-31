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
import CompletionModal from "./CompletionModal";

// Removed inline CompletionModal component
import type { VocabularyItem as VocabularyItemType } from "../../types/lesson";
import { generateVocabularyId, speakText } from "../../utils/vocabularyUtils";
import VocabularyFlashcard from "./VocabularyFlashcard";
import VocabularyCard from "./VocabularyCard";
import VocabularyDetailModal from "./VocabularyDetailModal";
import { useResponsive } from "../../hooks/useResponsive";
import { useAppSelector } from "../../store/hooks";
import { getFontPreset } from "../../constants/fonts";
import { useFlashcardSettings } from "../../hooks/useFlashcardSettings";
import FlashcardSettingsModal from "./FlashcardSettingsModal";

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
    const { settings, updateSettings, isSettingsModalOpen, openSettings, closeSettings } = useFlashcardSettings();

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
    
    console.log("[VocabularyTable] RENDER - viewMode:", viewMode);

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
        console.log("[MemoryEval] Called with status:", status, "currentCard:", currentCard?.kanji || currentCard?.word);
        if (!currentCard) {
          console.log("[MemoryEval] No currentCard, returning");
          return;
        }

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
          dataIndex: "meaningVi",
          key: "meaningVi",
          width: screens.lg ? 150 : 130,
          render: (_: string, record: VocabularyItemType) => (
            <Typography.Text className="!text-lg">
              {record.meaningVi || record.meaning || "-"}
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
          dataIndex: "meaningVi",
          key: "meaningVi",
          width: 150,
          render: (_: string, record: VocabularyItemType) => (
            <Typography.Text className="!text-lg">
              {record.meaningVi || record.meaning || "-"}
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

    // Keyboard shortcuts - log whenever effect runs
    useEffect(() => {
      console.log("[Keyboard] Effect RUNNING - viewMode:", viewMode, "isStudyComplete:", isStudyComplete);
      
      const handleKeyDown = (e: KeyboardEvent) => {
        console.log("[Keyboard] Key pressed:", e.key, "in viewMode:", viewMode);
        
        switch (e.key) {
          case " ":
            e.preventDefault();
            flipCard();
            break;

          case "ArrowLeft":
            e.preventDefault();
            console.log("[Keyboard] ArrowLeft - marking UNKNOWN");
            handleMemoryEvaluation("unknown");
            break;

          case "ArrowRight":
            e.preventDefault();
            console.log("[Keyboard] ArrowRight - marking KNOWN");
            handleMemoryEvaluation("known");
            break;

          case "s":
          case "S":
            shuffleCards();
            break;
        }
      };

      // ✅ Chỉ kích hoạt phím tắt khi chưa hoàn thành
      const shouldAttach = viewMode === "flashcard" && !isStudyComplete;
      console.log("[Keyboard] Should attach?", shouldAttach);
      
      if (shouldAttach) {
        console.log("[Keyboard] ✅ ATTACHING event listener");
        window.addEventListener("keydown", handleKeyDown, true); // capture phase

        return () => {
          console.log("[Keyboard] ❌ DETACHING event listener");
          window.removeEventListener("keydown", handleKeyDown, true);
        };
      } else {
        console.log("[Keyboard] ⏭️ NOT attaching - condition not met");
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
                  kanjiFontFamily={kanjiFont}
                />
              ))}
              {filteredData.length === 0 && (
                <EmptyState
                  type="search"
                  title="Không tìm thấy từ vựng"
                  description="Không tìm thấy từ vựng nào phù hợp"
                  size="small"
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
                          {item.meaningVi || item.meaning || "-"}
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
                    type="search"
                    title="Không tìm thấy từ vựng"
                    description="Không tìm thấy từ vựng nào"
                    size="small"
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
          kanjiFontFamily={kanjiFont}
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
