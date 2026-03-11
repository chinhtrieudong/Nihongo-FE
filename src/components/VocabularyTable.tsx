import React, { useState, useMemo, useEffect, useCallback } from "react";

import {
  Table,
  Button,
  Typography,
  Empty,
  Statistic,
  Row,
  Col,
  Space,
} from "antd";

import {
  SoundOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

import type { VocabularyItem as VocabularyItemType } from "../types/lesson";
import { generateVocabularyId, speakText } from "../utils/vocabularyUtils";
import VocabularyFlashcard from "./VocabularyFlashcard";
import VocabularyCard from "./VocabularyCard";
import VocabularyDetailModal from "./VocabularyDetailModal";
import { useResponsive } from "../hooks/useResponsive";

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

        const shuffled = [...cardsToUse].sort(() => Math.random() - 0.5);

        const resetStatus: Record<string, SessionStatus> = {};
        cardsToUse.forEach((c) => (resetStatus[c.id] = "unanswered"));

        const newStatus = { ...cardStatus };
        Object.keys(resetStatus).forEach((id) => {
          newStatus[id] = "unanswered";
        });

        setCardStatus(newStatus);
        setShuffledCards(shuffled);
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
          render: (text: string) => (
            <Typography.Text strong className="font-kosugi text-2xl leading-none">
              {text || "-"}
            </Typography.Text>
          ),
        },
        {
          title: "Hira/Kana",
          dataIndex: "hiragana",
          key: "hiragana",
          width: screens.lg ? 150 : 130,
          render: (text: string, record: any) => (
            <Typography.Text className="!text-lg">
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
              render: (text: string) => (
                <span className="text-lg font-medium text-secondary-800 dark:text-secondary-300">
                  {text ? text.toUpperCase().replace(/,/g, "") : "-"}
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
          render: (text: string) => (
            <Typography.Text className="!text-lg">{text || "-"}</Typography.Text>
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
                icon={<SoundOutlined />}
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
            <Typography.Text strong className="font-kosugi text-2xl leading-none">
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
            <Typography.Text className="!text-lg">
              {text || record.katakana || "-"}
            </Typography.Text>
          ),
        },
        {
          title: "Nghĩa",
          dataIndex: "meaning_vi",
          key: "meaning_vi",
          width: 150,
          render: (text: string) => (
            <Typography.Text className="!text-lg">{text || "-"}</Typography.Text>
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
                icon={<SoundOutlined />}
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
                <Empty
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
                        <div className="text-2xl font-bold font-kosugi text-secondary-900 dark:text-secondary-100">
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
                        icon={<SoundOutlined />}
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
                  <Empty
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
          <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
            onClick={() => {
              onExitFlashcard?.();
              setViewMode("table");
            }}
          >
            <div
              className="flashcard-complete-modal w-full max-w-xl text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-xl border border-slate-600 bg-slate-900 p-8 text-white min-h-[300px] flex flex-col justify-between relative overflow-hidden">
                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                <button
                  type="button"
                  aria-label="Đóng"
                  onClick={() => {
                    onExitFlashcard?.();
                    setViewMode("table");
                  }}
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
                          valueStyle={{ color: "#93c5fd" }}
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
                          valueStyle={{ color: "#86efac" }}
                          prefix={
                            <CheckCircleOutlined style={{ color: "#86efac" }} />
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
                          valueStyle={{ color: "#fca5a5" }}
                          prefix={
                            <CloseCircleOutlined style={{ color: "#fca5a5" }} />
                          }
                          className="text-white"
                        />
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="flex items-center justify-center pt-0">
                  <Space size="large">
                    <Button
                      type="primary"
                      size="large"
                      icon={<FontAwesomeIcon icon={faRotateLeft} />}
                      onClick={() => resetStudySession("all")}
                    >
                      Học lại toàn bộ
                    </Button>

                    {globalUnknownCount > 0 && (
                      <Button
                        type="default"
                        size="large"
                        className="bg-transparent text-neutral-200 border-neutral-500 hover:text-white hover:border-neutral-300 hover:bg-white/10"
                        onClick={() => resetStudySession("unremembered")}
                      >
                        Chỉ học {globalUnknownCount} thẻ chưa nhớ
                      </Button>
                    )}
                  </Space>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default VocabularyTable;
