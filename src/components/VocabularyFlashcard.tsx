import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Modal,
  Switch,
  Select,
} from "antd";
import {
  SoundOutlined,
  CloseOutlined,
  CheckOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShuffle, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import type { VocabularyItem as VocabularyItemType } from "../types/lesson";
import { speakText } from "../utils/vocabularyUtils";

const { Text } = Typography;

interface VocabularyFlashcardProps {
  currentCard: VocabularyItemType | null;
  currentCardIndex: number;
  cardsToStudy: VocabularyItemType[];
  isFlipped: boolean;
  isFullscreen: boolean;
  screens: any;
  onFlipCard: () => void;
  onMemoryEvaluation: (status: "unknown" | "known") => void;
  onSetIsFullscreen: (fullscreen: boolean) => void;
  onBackToTable: () => void;
  onResetCards?: () => void;
  onShuffleCards?: () => void;
  // Voice settings for TTS
  femaleVoiceName?: string;
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
  onResetCards,
  onShuffleCards,
  femaleVoiceName,
}) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [frontFace, setFrontFace] = useState<"japanese" | "vietnamese">(
    "japanese",
  );
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showKanji] = useState(true);
  const [showJapaneseExample, setShowJapaneseExample] = useState(false);
  const [showHanViet] = useState(true);
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
      if (text) speakText(text, 'ja-JP', femaleVoiceName);
    },
    [currentCard, femaleVoiceName],
  );

  // Note: keep sidebar open while viewing flashcards

  const getJapaneseText = useCallback(() => {
    return currentCard?.hiragana || currentCard?.katakana || "";
  }, [currentCard]);

  const speakJapaneseNow = useCallback((text: string) => {
    if (!text) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    speakText(text, 'ja-JP', femaleVoiceName);
  }, [femaleVoiceName]);

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
  // Render fullscreen-only view
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      onClick={() => {
        if (!settingsVisible) {
          onBackToTable?.();
        }
      }}
    >
      <div
        className="w-full max-w-[700px] sm:max-w-[720px] md:max-w-[760px] bg-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ transform: "scale(1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CARD */}
        <div className="flex-1 flex items-center justify-center">
          <div
            onClick={onFlipCard}
            className="
              relative
              w-full
              h-[50vh]
              sm:h-[60vh]
              md:h-[65vh]
              rounded-t-3xl rounded-b-none
              bg-slate-700
              border-b
              border-slate-500
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
                  className={`${getFrontContent().isVietnamese
                    ? "text-[26px] sm:text-[32px]"
                    : "text-[34px]"
                    } font-semibold tracking-wide text-neutral-100 flex flex-col items-center`}
                  style={
                    getFrontContent().isVietnamese
                      ? undefined
                      : { fontFamily: "var(--kanji-font-family)" }
                  }
                >
                  {getFrontContent().main}
                </div>

                {getFrontContent().sub && (
                  <div
                    className={`mt-2 ${getFrontContent().isVietnamese
                      ? "text-[26px] sm:text-[32px]"
                      : "text-[34px]"
                      } text-neutral-300`}
                    style={
                      getFrontContent().isVietnamese
                        ? undefined
                        : { fontFamily: "var(--kanji-font-family)" }
                    }
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

                <div
                  className="absolute bottom-4 text-[11px] text-neutral-400"
                >
                  {screens?.xs ? "Chạm để lật" : "Phím cách để lật"}
                </div>
              </div>
            )}

            {/* BACK */}
            {isFlipped && (
              <div className="h-full flex flex-col items-center justify-center text-center px-8">
                <div
                  className={`${getBackContent().isVietnamese
                    ? "text-[26px] sm:text-[32px]"
                    : "text-[34px]"
                    } font-semibold tracking-wide text-neutral-100 flex flex-col items-center`}
                  style={
                    getBackContent().isVietnamese
                      ? undefined
                      : { fontFamily: "var(--kanji-font-family)" }
                  }
                >
                  {getBackContent().main}
                </div>

                {getBackContent().sub && (
                  <div
                    className={`mt-2 ${getBackContent().isVietnamese
                      ? "text-[26px] sm:text-[32px]"
                      : "text-[34px]"
                      } text-neutral-300`}
                    style={
                      getBackContent().isVietnamese
                        ? undefined
                        : { fontFamily: "var(--kanji-font-family)" }
                    }
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

                <div
                  className="absolute bottom-4 text-[11px] text-neutral-400 tracking-wide"
                >
                  ← Chưa nhớ · Đã nhớ →
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flashcard-action-bar relative bg-slate-900 px-4 sm:px-8 pb-7 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-[120px] justify-start">
              <Button
                type="text"
                size="large"
                className="text-neutral-200 hover:text-white font-semibold hover:bg-white/10"
                icon={<SettingOutlined />}
                onClick={() => setSettingsVisible(true)}
              />
            </div>
            <div className="flex items-center justify-center gap-6 flex-1">
              {/* Unknown Button */}
              <button
                onClick={() => onMemoryEvaluation("unknown")}
                className="
                group
                relative
                w-14 h-14
                rounded-2xl
                border-2
                border-red-400/70
                bg-red-500/20
                text-red-200
                hover:border-red-300
                hover:bg-red-500/30
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
                <CloseOutlined className="text-lg text-red-100" />
              </button>

              {/* Progress Counter */}
              <div className="min-w-[4.5rem] text-center">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-base font-semibold text-neutral-100">
                  {currentCardIndex + 1}
                  <span className="mx-1 text-neutral-400">/</span>
                  <span className="text-neutral-300">
                    {cardsToStudy.length}
                  </span>
                </span>
              </div>

              {/* Known Button */}
              <button
                onClick={() => onMemoryEvaluation("known")}
                className="
                group
                relative
                w-14 h-14
                rounded-2xl
                border-2
                border-green-400/70
                bg-green-500/20
                text-green-200
                hover:border-green-300
                hover:bg-green-500/30
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
                <CheckOutlined className="text-lg text-green-100" />
              </button>
            </div>
            <div className="flex items-center gap-2 justify-end w-[120px]">
              {onResetCards && (
                <Button
                  type="text"
                  size="large"
                  className="text-neutral-200 hover:text-white font-semibold hover:bg-white/10"
                  icon={<FontAwesomeIcon icon={faRotateLeft} />}
                  onClick={onResetCards}
                />
              )}
              {onShuffleCards && (
                <Button
                  type="text"
                  size="large"
                  className="text-neutral-200 hover:text-white font-semibold hover:bg-white/10"
                  icon={<FontAwesomeIcon icon={faShuffle} />}
                  onClick={onShuffleCards}
                />
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
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
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        title="Cài đặt Flashcard"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={null}
        width={480}
        style={{ top: 50 }}
        className="flashcard-settings-modal"
        wrapClassName="flashcard-settings-wrap"
        getContainer={false}
        styles={{
          body: {
            background: "rgba(15, 23, 42, 0.6)",
            padding: 0,
            maxHeight: "none",
            overflowY: "visible",
          },
        }}
      >
        <div className="rounded-xl  border-slate-700 bg-slate-1000 p-6 space-y-5 text-white shadow-2xl">
          {/* Front Face Setting */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Text
                  className="font-semibold text-white"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                >
                  Mặt trước
                </Text>
                <div className="text-xs text-white/80">
                  Chọn nội dung hiển thị khi mở thẻ
                </div>
              </div>
              <Select
                value={frontFace}
                onChange={setFrontFace}
                style={{ width: 140 }}
                className="flashcard-settings-select-trigger bg-slate-900"
                getPopupContainer={(trigger) =>
                  trigger.parentElement || document.body
                }
                classNames={{ popup: { root: "flashcard-settings-dropdown" } }}
                styles={{ popup: { root: { backgroundColor: "#111827" } } }}
                options={[
                  { label: "Tiếng Nhật", value: "japanese" },
                  { label: "Tiếng Việt", value: "vietnamese" },
                ]}
              />
            </div>
          </div>

          {/* Example Visibility */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text
                  className="font-semibold text-white"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                >
                  Hiển thị ví dụ
                </Text>
                <div className="text-sm text-white/80">
                  Áp dụng cho cả mặt tiếng Nhật và tiếng Việt
                </div>
              </div>
              <Switch
                checked={showJapaneseExample && showVietnameseExample}
                onChange={(checked) => {
                  setShowJapaneseExample(checked);
                  setShowVietnameseExample(checked);
                }}
              />
            </div>
          </div>

          {/* Auto Speak Setting */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text
                  className="font-semibold text-white"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                >
                  Chuyển văn bản thành lời nói
                </Text>
                <div className="text-sm text-white/80">
                  Tự động phát âm khi lật sang mặt tiếng Nhật
                </div>
              </div>
              <Switch checked={autoSpeak} onChange={setAutoSpeak} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
            <Button
              type="default"
              block
              danger
              icon={<FontAwesomeIcon icon={faRotateLeft} />}
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
              icon={<FontAwesomeIcon icon={faShuffle} />}
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
