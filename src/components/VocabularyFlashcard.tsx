import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Progress,
  Tooltip,
  Modal,
  Switch,
  Select,
  Divider,
  Space,
  Collapse,
} from "antd";
import {
  SoundOutlined,
  CloseOutlined,
  CheckOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SwapOutlined,
  LeftOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { VocabularyItem as VocabularyItemType } from "../types/lesson";
import { speakText } from "../utils/vocabularyUtils";

const { Text } = Typography;

interface VocabularyFlashcardProps {
  currentCard: VocabularyItemType | undefined;
  currentCardIndex: number;
  cardsToStudy: VocabularyItemType[];
  isFlipped: boolean;
  isFullscreen: boolean;
  screens: any;
  onFlipCard: () => void;
  onMemoryEvaluation: (status: "known" | "unknown") => void;
  onSetIsFullscreen: (fullscreen: boolean) => void;
  onBackToTable?: () => void;
  onCloseSidebar?: () => void;
  onResetCards?: () => void;
  onShuffleCards?: () => void;
}

const VocabularyFlashcard: React.FC<VocabularyFlashcardProps> = ({
  currentCard,
  currentCardIndex,
  cardsToStudy,
  isFlipped,
  isFullscreen,
  screens,
  onFlipCard,
  onMemoryEvaluation,
  onSetIsFullscreen,
  onBackToTable,
  onCloseSidebar,
  onResetCards,
  onShuffleCards,
}) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [frontFace, setFrontFace] = useState<"japanese" | "vietnamese">(
    "japanese",
  );
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showKanji, setShowKanji] = useState(true);
  const [showJapaneseExample, setShowJapaneseExample] = useState(false);
  const [showHanViet, setShowHanViet] = useState(true);
  const [showVietnameseExample, setShowVietnameseExample] = useState(false);

  const warmUpTTS = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(" ");
      utterance.volume = 0;
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.cancel();
    } catch {
      // ignore warm-up errors
    }
  }, []);

  const handlePlayAudio = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = currentCard?.hiragana || currentCard?.katakana || "";
      if (text) speakText(text);
    },
    [currentCard],
  );

  // Note: keep sidebar open while viewing flashcards

  const getJapaneseText = useCallback(() => {
    return currentCard?.hiragana || currentCard?.katakana || "";
  }, [currentCard]);

  const speakJapaneseNow = useCallback(
    (text: string) => {
      if (!text) return;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      speakText(text);
    },
    []
  );

  // Auto-speak functionality (faster)
  useEffect(() => {
    if (autoSpeak && isFlipped && frontFace === "vietnamese") {
      // When flipped to Japanese face (if front is Vietnamese), auto-speak
      const text = getJapaneseText();
      if (text) {
        setTimeout(() => speakJapaneseNow(text), 0);
      }
    }
  }, [isFlipped, autoSpeak, frontFace, getJapaneseText, speakJapaneseNow]);

  // Speak immediately when enabling auto-speak (if Japanese side is visible)
  useEffect(() => {
    if (!autoSpeak) return;

    const isJapaneseVisible =
      (frontFace === "japanese" && !isFlipped) ||
      (frontFace === "vietnamese" && isFlipped);

    if (isJapaneseVisible) {
      const text = getJapaneseText();
      if (text) speakJapaneseNow(text);
    }
  }, [autoSpeak, frontFace, isFlipped, getJapaneseText, speakJapaneseNow]);

  // Warm up TTS once to reduce first-play delay
  useEffect(() => {
    warmUpTTS();
  }, [warmUpTTS]);

  // Prevent body scroll while fullscreen flashcard is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Helper functions to determine card content based on frontFace setting and display options
  const getFrontContent = () => {
    if (frontFace === "vietnamese") {
      let mainContent = "";
      let subContent = "";

      // Build content in correct order: Hán Việt → Nghĩa → Ví dụ
      const contentParts = [];

      // Add Han-Viet if enabled and available (as main content)
      if (showHanViet && currentCard?.hanviet) {
        contentParts.push(currentCard.hanviet.toUpperCase());
      }

      // Add Vietnamese meaning
      contentParts.push(currentCard?.meaning_vi || "Đang cập nhật");

      // Add Vietnamese example if enabled
      if (showVietnameseExample && currentCard?.example_vi) {
        contentParts.push(`Ví dụ: ${currentCard.example_vi}`);
      }

      // First item is main content, rest are subtitles
      mainContent = contentParts[0] || "";
      subContent = contentParts.slice(1).join("\n");

      return {
        main: mainContent,
        sub: subContent,
        isVietnamese: true,
      };
    } else {
      let mainContent = "";
      let subContent = "";

      // Build content in correct order: Kanji → Hira/kata → Ví dụ
      const subtitleParts = [];

      // Show kanji if enabled and available
      if (showKanji && currentCard?.kanji) {
        mainContent = currentCard.kanji;
        // Add hiragana/katakana as first subtitle part
        if (currentCard?.hiragana || currentCard?.katakana) {
          subtitleParts.push(
            currentCard?.hiragana || currentCard?.katakana || "",
          );
        }
      } else {
        // Use hiragana/katakana as main if kanji is disabled or not available
        mainContent = currentCard?.hiragana || currentCard?.katakana || "";
      }

      // Add Japanese example if enabled
      if (showJapaneseExample && currentCard?.example_jp) {
        subtitleParts.push(`例: ${currentCard.example_jp}`);
      }

      subContent = subtitleParts.join("\n");

      return {
        main: mainContent,
        sub: subContent,
        isVietnamese: false,
      };
    }
  };

  const getBackContent = () => {
    if (frontFace === "vietnamese") {
      let mainContent = "";
      let subContent = "";

      // Build content in correct order: Kanji → Hira/kata → Ví dụ
      const subtitleParts = [];

      // Show kanji if enabled and available
      if (showKanji && currentCard?.kanji) {
        mainContent = currentCard.kanji;
        // Add hiragana/katakana as first subtitle part
        if (currentCard?.hiragana || currentCard?.katakana) {
          subtitleParts.push(
            currentCard?.hiragana || currentCard?.katakana || "",
          );
        }
      } else {
        // Use hiragana/katakana as main if kanji is disabled or not available
        mainContent = currentCard?.hiragana || currentCard?.katakana || "";
      }

      // Add Japanese example if enabled
      if (showJapaneseExample && currentCard?.example_jp) {
        subtitleParts.push(`例: ${currentCard.example_jp}`);
      }

      subContent = subtitleParts.join("\n");

      return {
        main: mainContent,
        sub: subContent,
        isVietnamese: false,
      };
    } else {
      let mainContent = "";
      let subContent = "";

      // Build content in correct order: Hán Việt → Nghĩa → Ví dụ
      const contentParts = [];

      // Add Han-Viet if enabled and available (as main content)
      if (showHanViet && currentCard?.hanviet) {
        contentParts.push(currentCard.hanviet.toUpperCase());
      }

      // Add Vietnamese meaning
      contentParts.push(currentCard?.meaning_vi || "Đang cập nhật");

      // Add Vietnamese example if enabled
      if (showVietnameseExample && currentCard?.example_vi) {
        contentParts.push(`Ví dụ: ${currentCard.example_vi}`);
      }

      // First item is main content, rest are subtitles
      mainContent = contentParts[0] || "";
      subContent = contentParts.slice(1).join("\n");

      return {
        main: mainContent,
        sub: subContent,
        isVietnamese: true,
      };
    }
  };

  if (!currentCard) return null;

  // Debug flashcard data
  console.log("=== FLASHCARD DATA ===");
  console.log("Current Card:", currentCard);
  console.log("Card Index:", currentCardIndex, "of", cardsToStudy.length);
  console.log("Is Flipped:", isFlipped);
  console.log("Is Fullscreen:", isFullscreen);
  console.log("Front Face Setting:", frontFace);
  console.log("Auto Speak:", autoSpeak);
  console.log("========================");

  // Render fullscreen-only view
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* HEADER */}
      <div className="px-4 sm:px-6 pt-4">
        <div className="max-w-[780px] mx-auto">
          <div className="flex items-center justify-between mb-2 gap-3">
            {onBackToTable && (
              <Tooltip title="Quay lại bảng từ vựng" placement="bottom">
                <Button
                  type="text"
                  size="middle"
                  icon={<LeftOutlined className="text-lg" />}
                  onClick={onBackToTable}
                  className="
                      flex items-center justify-center
                      w-9 h-9 rounded-lg
                      text-neutral-600 hover:text-blue-600 dark:text-neutral-300 dark:hover:text-blue-400
                      hover:bg-neutral-100 dark:hover:bg-neutral-800
                      transition-colors duration-200
                      border border-neutral-200 dark:border-neutral-700
                      shadow-sm hover:shadow
                    "
                />
              </Tooltip>
            )}
            <div className="flex-1">
              <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentCardIndex + 1) / cardsToStudy.length) * 100}%`,
                    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                  }}
                />
              </div>
            </div>
            <div className="ml-6 flex items-center space-x-3">
              <span className="text-base font-semibold text-neutral-700 dark:text-neutral-200">
                {currentCardIndex + 1}
                <span className="text-neutral-400">/{cardsToStudy.length}</span>
              </span>
              {onShuffleCards && (
                <Tooltip title="Trộn thẻ" placement="bottom">
                  <Button
                    type="text"
                    size="large"
                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 font-semibold"
                    icon={<SwapOutlined />}
                    onClick={onShuffleCards}
                  />
                </Tooltip>
              )}
              <Tooltip title="Cài đặt" placement="bottom">
                <Button
                  type="text"
                  size="large"
                  className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 font-semibold"
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsVisible(true)}
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* CARD */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
        <div
          onClick={onFlipCard}
          className="
              relative
              w-full
              max-w-[780px]
              h-full
              rounded-3xl
              bg-white
              dark:bg-neutral-800
              border
              border-neutral-200
              dark:border-neutral-700
              shadow-lg
              transition-all
              cursor-pointer
              select-none
            "
        >
          {/* AUDIO */}
          <button
            onClick={handlePlayAudio}
            className="
              absolute
              top-4
              right-4
              p-3
              rounded-full
              text-neutral-400
              hover:text-neutral-700
              dark:hover:text-neutral-200
              transition
              hover:bg-neutral-100
              dark:hover:bg-neutral-700
            "
          >
            <SoundOutlined className="text-xl" />
          </button>

          {/* FRONT */}
          {!isFlipped && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div
                className={`${
                  getFrontContent().isVietnamese
                    ? "text-2xl sm:text-3xl"
                    : "text-[32px]"
                } font-semibold tracking-wide text-neutral-900 dark:text-neutral-100 ${
                  getFrontContent().isVietnamese
                    ? "font-lucida-grande"
                    : "font-osaka"
                } flex flex-col items-center`}
              >
                {getFrontContent().main}
              </div>

              {getFrontContent().sub && (
                <div
                  className={`mt-2 ${
                    getFrontContent().isVietnamese
                      ? "text-2xl sm:text-3xl"
                      : "text-[32px]"
                  } text-neutral-500 dark:text-neutral-400 ${
                    getFrontContent().isVietnamese
                      ? "font-lucida-grande"
                      : "font-osaka"
                  }`}
                >
                  {getFrontContent()
                    .sub.split("\n")
                    .map((line, index) => (
                      <div key={index} className="flex flex-col items-center">
                        {line}
                      </div>
                    ))}
                </div>
              )}

              <div className="absolute bottom-4 text-[11px] text-neutral-400 dark:text-neutral-500">
                {screens?.xs ? "Chạm để lật" : "Phím cách để lật"}
              </div>
            </div>
          )}

          {/* BACK */}
          {isFlipped && (
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div
                className={`${
                  getBackContent().isVietnamese
                    ? "text-2xl sm:text-3xl"
                    : "text-[32px]"
                } font-semibold tracking-wide text-neutral-900 dark:text-neutral-100 ${
                  getBackContent().isVietnamese
                    ? "font-lucida-grande"
                    : "font-osaka"
                } flex flex-col items-center`}
              >
                {getBackContent().main}
              </div>

              {getBackContent().sub && (
                <div
                  className={`mt-2 ${
                    getBackContent().isVietnamese
                      ? "text-2xl sm:text-3xl"
                      : "text-[32px]"
                  } text-neutral-500 dark:text-neutral-400 ${
                    getBackContent().isVietnamese
                      ? "font-lucida-grande"
                      : "font-osaka"
                  }`}
                >
                  {getBackContent()
                    .sub.split("\n")
                    .map((line, index) => (
                      <div key={index} className="flex flex-col items-center">
                        {line}
                      </div>
                    ))}
                </div>
              )}

              <div className="absolute bottom-4 text-[11px] text-neutral-400 dark:text-neutral-500 tracking-wide">
                ← Chưa nhớ · Đã nhớ →
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bottom-0 bg-gradient-to-t from-neutral-50/95 to-neutral-50 dark:from-neutral-900/95 dark:to-neutral-900 px-4 sm:px-8 pb-2 pt-6 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Unknown Button */}
            <button
              onClick={() => onMemoryEvaluation("unknown")}
              className="
                group
                relative
                w-14 h-14
                rounded-2xl
                border-2
                border-red-400
                dark:border-red-600
                bg-white
                dark:bg-neutral-800
                text-red-600
                dark:text-red-400
                hover:border-red-500
                dark:hover:border-red-500
                hover:bg-red-50
                dark:hover:bg-red-500/10
                hover:scale-105
                active:scale-95
                transition-all
                duration-200
                flex items-center justify-center
                shadow-sm
                hover:shadow-md
              "
              title="Chưa nhớ"
            >
              <CloseOutlined className="text-lg" />
              <span className="absolute -bottom-6 text-xs text-neutral-500 dark:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Chưa nhớ
              </span>
            </button>

            {/* Flip Button */}
            <button
              onClick={onFlipCard}
              className="
                group
                relative
                w-14 h-14
                rounded-2xl
                border-2
                border-neutral-300
                dark:border-neutral-600
                bg-white
                dark:bg-neutral-800
                text-neutral-600
                dark:text-neutral-300
                hover:border-neutral-400
                dark:hover:border-neutral-500
                hover:bg-neutral-50
                dark:hover:bg-neutral-700
                hover:scale-105
                active:scale-95
                transition-all
                duration-200
                flex items-center justify-center
                shadow-sm
                hover:shadow-md
              "
              title="Lật thẻ"
            >
              <SwapOutlined className="text-lg" />
              <span className="absolute -bottom-6 text-xs text-neutral-500 dark:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Lật thẻ
              </span>
            </button>

            {/* Known Button */}
            <button
              onClick={() => onMemoryEvaluation("known")}
              className="
                group
                relative
                w-14 h-14
                rounded-2xl
                border-2
                border-green-400
                dark:border-green-600
                bg-white
                dark:bg-neutral-800
                text-green-600
                dark:text-green-400
                hover:border-green-500
                dark:hover:border-green-500
                hover:bg-green-50
                dark:hover:bg-green-500/10
                hover:scale-105
                active:scale-95
                transition-all
                duration-200
                flex items-center justify-center
                shadow-sm
                hover:shadow-md
              "
              title="Đã nhớ"
            >
              <CheckOutlined className="text-lg" />
              <span className="absolute -bottom-6 text-xs text-neutral-500 dark:text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Đã nhớ
              </span>
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="mt-2 text-center pb-2">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Phím tắt:{" "}
              <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                ←
              </kbd>{" "}
              Chưa nhớ •{" "}
              <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                Space
              </kbd>{" "}
              Lật •{" "}
              <kbd className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                →
              </kbd>{" "}
              Đã nhớ
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        title="Cài đặt Flashcard"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={null}
        width={480}
        style={{ top: 40 }}
        className="flashcard-settings-modal"
        styles={{ body: { maxHeight: "none", overflowY: "visible" } }}
      >
        <div className="space-y-5">
          {/* Front Face Setting */}
          <div className="rounded-xl border border-secondary-200/70 dark:border-secondary-800 bg-secondary-50/70 dark:bg-secondary-900/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Text className="font-semibold text-secondary-900 dark:text-secondary-100">
                  Mặt trước
                </Text>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">
                  Chọn nội dung hiển thị khi mở thẻ
                </div>
              </div>
              <Select
                value={frontFace}
                onChange={setFrontFace}
                style={{ width: 180 }}
                options={[
                  { label: "Tiếng Nhật", value: "japanese" },
                  { label: "Tiếng Việt", value: "vietnamese" },
                ]}
              />
            </div>
          </div>

          {/* Face Settings with Collapse */}
          <div className="rounded-xl border border-secondary-200/70 dark:border-secondary-800 bg-white dark:bg-secondary-925">
            <Collapse
              ghost
              items={[
                {
                  key: "japanese",
                  label: "Mặt tiếng Nhật",
                  children: (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Text className="text-secondary-800 dark:text-secondary-200">
                          Hiện Kanji (nếu có)
                        </Text>
                        <Switch checked={showKanji} onChange={setShowKanji} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Text className="text-secondary-800 dark:text-secondary-200">
                          Hiện ví dụ tiếng Nhật
                        </Text>
                        <Switch
                          checked={showJapaneseExample}
                          onChange={setShowJapaneseExample}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: "vietnamese",
                  label: "Mặt tiếng Việt",
                  children: (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Text className="text-secondary-800 dark:text-secondary-200">
                          Hiện Hán Việt (nếu có)
                        </Text>
                        <Switch checked={showHanViet} onChange={setShowHanViet} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Text className="text-secondary-800 dark:text-secondary-200">
                          Hiện nghĩa ví dụ
                        </Text>
                        <Switch
                          checked={showVietnameseExample}
                          onChange={setShowVietnameseExample}
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
              defaultActiveKey={[]}
            />
          </div>

          {/* Auto Speak Setting */}
          <div className="rounded-xl border border-secondary-200/70 dark:border-secondary-800 bg-secondary-50/70 dark:bg-secondary-900/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text className="font-semibold text-secondary-900 dark:text-secondary-100">
                  Chuyển văn bản thành lời nói
                </Text>
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  Tự động phát âm khi lật sang mặt tiếng Nhật
                </div>
              </div>
              <Switch checked={autoSpeak} onChange={setAutoSpeak} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="rounded-xl border border-secondary-200/70 dark:border-secondary-800 bg-white dark:bg-secondary-925 p-4 space-y-3">
            <Button
              type="default"
              block
              danger
              onClick={() => {
                if (onResetCards) {
                  onResetCards();
                  setSettingsVisible(false);
                }
              }}
            >
              Khởi động lại thẻ ghi nhớ
            </Button>
            <Button
              type="default"
              block
              onClick={() => {
                if (onShuffleCards) {
                  onShuffleCards();
                  setSettingsVisible(false);
                }
              }}
            >
              Trộn thẻ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VocabularyFlashcard;
