import React, { useState, useMemo, useEffect, useCallback } from "react";

import {
  Table,
  Button,
  Card,
  Typography,
  Switch,
  Empty,
  Statistic,
  Row,
  Col,
  Space,
  Modal,
  Tag,
  Tooltip,
  Progress,
} from "antd";

import {
  SoundOutlined,
  BookOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import FlashcardsIcon from "./icons/FlashcardsIcon";
import InfinitejapaneseIcon from "./icons/InfinitejapaneseIcon";

import type { VocabularyItem as VocabularyItemType } from "../types/lesson";
import { generateVocabularyId, speakText } from "../utils/vocabularyUtils";
import VocabularyFlashcard from "./VocabularyFlashcard";
import VocabularyCard from "./VocabularyCard";
import VocabularyDetailModal from "./VocabularyDetailModal";
import { useResponsive } from "../hooks/useResponsive";

const { Title, Text } = Typography;

interface VocabularyTableProps {
  data: VocabularyItemType[];

  loading?: boolean;

  onCloseSidebar?: () => void;
  onEnterFlashcard?: () => void;
  onExitFlashcard?: () => void;
}

const VocabularyTable: React.FC<VocabularyTableProps> = ({
  data,
  loading = false,
  onCloseSidebar,
  onEnterFlashcard,
  onExitFlashcard,
}) => {
  const { screens } = useResponsive();

  const [showRomaji, setShowRomaji] = useState(false);

  const [showHanViet, setShowHanViet] = useState(true);

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

  const [studyMode, setStudyMode] = useState<"all" | "unremembered">("all");

  // Track which cards have been evaluated in this session

  const [evaluatedCards, setEvaluatedCards] = useState<Set<string>>(new Set());

  const [shuffledCards, setShuffledCards] = useState<VocabularyItemType[]>([]);

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

  const handlePlayAudio = useCallback(
    (audioUrl: string, e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => console.error("Audio playback failed:", err));
    },
    [],
  );

  const handlePlayHiraKanaAudio = useCallback(
    (text: string, event?: React.MouseEvent) => {
      if (event) {
        event.stopPropagation();
      }
      speakText(text);
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
      setStudyMode(mode);

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
      setEvaluatedCards(new Set());
    },
    [data, cardStatus],
  );

  // Memoized table columns
  const tableColumns = useMemo(
    () => [
      {
        title: "STT",
        dataIndex: "index",
        key: "index",
        width: screens.lg ? 60 : 50,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Kanji",
        dataIndex: "kanji",
        key: "kanji",
        width: screens.lg ? 90 : 80,
        render: (text: string) => (
          <Typography.Text strong className="font-kosugi text-lg">
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
          <Typography.Text>{text || record.katakana || "-"}</Typography.Text>
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
                <Typography.Text type="secondary">
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
                <span className="text-secondary-800 dark:text-secondary-300">
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
          <Typography.Text>{text || "-"}</Typography.Text>
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
          <Typography.Text strong className="font-kosugi text-lg">
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
          <Typography.Text>{text || record.katakana || "-"}</Typography.Text>
        ),
      },
      {
        title: "Nghĩa",
        dataIndex: "meaning_vi",
        key: "meaning_vi",
        width: 150,
        render: (text: string) => (
          <Typography.Text>{text || "-"}</Typography.Text>
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

    // Đếm số thẻ đã đánh giá (known + unknown)

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

  if (viewMode === "flashcard") {
    // Show completion screen if study session is complete

    if (isStudyComplete) {
      return (
        <div className="p-6">
          <Card className="mb-6">
            <div className="flex justify-between items-center">
              <Title level={2}>Kết thúc buổi học</Title>

              <Button
                type="primary"
                icon={<BookOutlined />}
                onClick={() => setViewMode("table")}
              >
                Xem bảng
              </Button>
            </div>
          </Card>

          <Card className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Title
                level={1}
                className="text-secondary-900 dark:text-secondary-100 mb-6"
              >
                🎉 Hoàn thành!
              </Title>

              <Row gutter={24} className="mb-8">
                <Col span={8}>
                  <Statistic
                    title="Tổng"
                    value={totalCount}
                    styles={{ content: { color: "#1890ff" } }}
                  />
                </Col>

                <Col span={8}>
                  <Statistic
                    title="Đã nhớ"
                    value={knownCount}
                    styles={{ content: { color: "#52c41a" } }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>

                <Col span={8}>
                  <Statistic
                    title="Chưa nhớ"
                    value={unknownCount}
                    styles={{ content: { color: "#ff4d4f" } }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Col>
              </Row>

              <Space size="large" className="justify-center">
                <Button
                  type="primary"
                  size="large"
                  icon={<SwapOutlined />}
                  onClick={() => resetStudySession("all")}
                >
                  Học lại toàn bộ
                </Button>

                {globalUnknownCount > 0 && (
                  <Button
                    type="default"
                    size="large"
                    onClick={() => resetStudySession("unremembered")}
                  >
                    Chỉ học {globalUnknownCount} thẻ chưa nhớ
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </div>
      );
    }

    return (
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
        onCloseSidebar={onCloseSidebar}
        onResetCards={() => resetStudySession("all")}
        onShuffleCards={shuffleCards}
      />
    );
  }

  return (
    <div className={screens.xs ? "px-3 py-2" : "p-6"}>
      {/* Header */}
      <Card className={`mb-4 ${screens.xs ? "shadow-sm" : ""}`}>
        {screens.xs ? (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InfinitejapaneseIcon
                  size={22}
                  color="#000000"
                  strokeWidth={2.5}
                />
                <Typography.Title
                  level={4}
                  className="!mb-0 !text-secondary-900 dark:!text-secondary-100 text-sm tracking-wide"
                >
                  TỪ VỰNG
                </Typography.Title>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="default"
                  onClick={() => {
                    onEnterFlashcard?.();
                    setViewMode("flashcard");
                    setIsFullscreen(true);
                  }}
                  size="small"
                  className="h-9 px-3 text-sm font-semibold rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  FLASHCARD
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="border-t border-secondary-200 dark:border-secondary-800 mt-2 mb-2" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <Typography.Title
                level={2}
                className="!mb-0 !text-secondary-900 dark:!text-secondary-100"
              >
                Từ Vựng
              </Typography.Title>
              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  icon={
                    <FlashcardsIcon
                      size={18}
                      color="#000000"
                      strokeWidth={2.5}
                    />
                  }
                  onClick={() => {
                    onEnterFlashcard?.();
                    setViewMode("flashcard");
                    setIsFullscreen(true);
                  }}
                  size="large"
                >
                  Flashcard
                </Button>
              </div>
            </div>

          </div>
        )}
      </Card>

      {/* Mobile-First Table */}
      <Card className={screens.xs ? "shadow-sm" : ""}>
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
                showHanViet={viewMode === "table" ? showHanViet : false}
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
        ) : (
          /* Desktop/Tablet Table View */
          viewMode === "table" ? (
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
                      <div className="text-sm text-secondary-600 dark:text-secondary-400">
                        {item.hiragana || item.katakana || "-"}
                      </div>
                      <div className="mt-1 text-base text-secondary-900 dark:text-secondary-100">
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
          )
        )}
      </Card>

      <style>{`
        .vocab-table .ant-table-body::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .vocab-table .ant-table-body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      {/* Detail Modal */}
      <VocabularyDetailModal
        selectedWord={selectedWord}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </div>
  );
};

export default VocabularyTable;
