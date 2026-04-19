import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Modal,
  Switch,
  Select,
} from "antd";
import { Volume2, X, Check, Settings, Shuffle, RotateCcw } from "lucide-react";
import type { VocabularyItem as VocabularyItemType } from "../../types/lesson";
import { speakText } from "../../utils/vocabularyUtils";

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
  onPrevCard?: () => void;
  onNextCard?: () => void;
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
  onPrevCard,
  onNextCard,
  femaleVoiceName,
}) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [frontFace, setFrontFace] = useState<"japanese" | "vietnamese">(
    "japanese",
  );
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showKanji] = useState(true);
  const [showJapaneseExample, setShowJapaneseExample] = useState(false);
  const [showVietnameseExample, setShowVietnameseExample] = useState(false);

  const getReading = useCallback(() => {
    return currentCard?.hiragana || currentCard?.katakana || currentCard?.reading || currentCard?.word || "";
  }, [currentCard]);

  const getMeaningVi = useCallback(() => {
    return currentCard?.meaningVi || currentCard?.meaning || "";
  }, [currentCard]);

  const getHanViet = useCallback(() => {
    return currentCard?.hanviet || currentCard?.han_viet || "";
  }, [currentCard]);

  const getExampleJp = useCallback(() => {
    return currentCard?.example || currentCard?.exampleSentence || "";
  }, [currentCard]);

  const getExampleVi = useCallback(() => {
    return currentCard?.exampleMeaning || currentCard?.exampleSentenceVi || "";
  }, [currentCard]);

  const containsJapaneseChars = useCallback((value: string) => {
    // Hiragana, Katakana, CJK Unified Ideographs
    return /[\u3040-\u30FF\u3400-\u9FFF]/.test(value);
  }, []);

  // Highlight vocabulary word in example sentence
  const highlightWordInExample = useCallback((example: string, word: string, reading: string) => {
    if (!example || (!word && !reading)) return example;

    // Words to highlight: kanji/word and its reading
    const wordsToHighlight = [word, reading].filter(Boolean);
    if (wordsToHighlight.length === 0) return example;

    // Sort by length (longest first) to avoid partial replacements
    wordsToHighlight.sort((a, b) => b.length - a.length);

    let result = example;
    const highlights: Array<{ before: string; after: string }> = [];

    for (const targetWord of wordsToHighlight) {
      if (!targetWord || targetWord.length < 1) continue;

      // Escape special regex characters
      const escaped = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'g');

      // Replace with placeholder to avoid double-highlighting
      const placeholder = `__HIGHLIGHT_${highlights.length}__`;
      result = result.replace(regex, placeholder);
      highlights.push({ before: targetWord, after: `<span class="text-blue-600 dark:text-blue-400 font-bold">${targetWord}</span>` });
    }

    // Replace placeholders with actual HTML
    for (let i = 0; i < highlights.length; i++) {
      result = result.replace(new RegExp(`__HIGHLIGHT_${i}__`, 'g'), highlights[i].after);
    }

    return result;
  }, []);

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
      const text = getReading();
      if (text) speakText(text, 'ja-JP', femaleVoiceName);
    },
    [getReading, femaleVoiceName],
  );

  // Note: keep sidebar open while viewing flashcards

  const getJapaneseText = useCallback(() => {
    return getReading();
  }, [getReading]);

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

  // Keyboard event handler - handle all flashcard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (settingsVisible) return; // Don't handle keys when settings modal is open
      
      switch (e.key) {
        case ' ':
        case 'Space':
          e.preventDefault();
          onFlipCard();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          console.log('[Flashcard] ArrowLeft - marking UNKNOWN');
          onMemoryEvaluation('unknown');
          break;
        case 'ArrowRight':
          e.preventDefault();
          console.log('[Flashcard] ArrowRight - marking KNOWN');
          onMemoryEvaluation('known');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFlipCard, onMemoryEvaluation, settingsVisible]);

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

      // Vietnamese face: Han-Viet as main (corresponds to kanji position),
      // meaning as subtitle
      const subtitleParts: string[] = [];

      // Sub: Vietnamese meaning
      subtitleParts.push(getMeaningVi() || "Đang cập nhật");

      // Sub: Vietnamese example (if enabled)
      const exVi = getExampleVi();
      if (showVietnameseExample && exVi && !containsJapaneseChars(exVi)) {
        subtitleParts.push(`Ví dụ: ${exVi}`);
      }

      // Main: Han-Viet (uppercase, like kanji)
      const hv = getHanViet();
      mainContent = hv ? hv.toUpperCase() : (getMeaningVi() || "Đang cập nhật");
      subContent = subtitleParts.join("\n");

      // If first subtitle part equals main (hanViet), remove it to avoid duplication
      const firstPart = subtitleParts[0];
      if (firstPart === mainContent || firstPart === mainContent.toLowerCase()) {
        // Remove the first part (meaning) if it equals hanViet
        const filteredParts = subtitleParts.slice(1);
        subContent = filteredParts.join("\n");
      }

      return { main: mainContent, sub: subContent, isVietnamese: true };
    } else {
      let mainContent = "";
      let subContent = "";

      // Build content in correct order: Kanji → Hira/kata → Ví dụ
      const subtitleParts = [];

      // Show kanji if enabled and available
      if (showKanji && currentCard?.kanji) {
        mainContent = currentCard.kanji;
        // Add hiragana/katakana as first subtitle part
        const r = getReading();
        if (r) {
          subtitleParts.push(r);
        }
      } else {
        // Use hiragana/katakana as main if kanji is disabled or not available
        mainContent = getReading();
      }

      // Add Japanese example if enabled (with highlighted vocabulary)
      const exJp = getExampleJp();
      if (showJapaneseExample && exJp) {
        const word = currentCard?.kanji || currentCard?.word || "";
        const reading = getReading();
        const highlightedExample = highlightWordInExample(exJp, word, reading);
        subtitleParts.push(`例: ${highlightedExample}`);
      }

      subContent = subtitleParts.join("\n");

      // If first subtitle part (reading) equals main (kanji or reading), remove it
      const firstPart = subtitleParts[0];
      if (firstPart === mainContent || firstPart === currentCard?.kanji) {
        const filteredParts = subtitleParts.slice(1);
        subContent = filteredParts.join("\n");
      }

      return { main: mainContent, sub: subContent, isVietnamese: false };
    }
  };

  const getBackContent = () => {
    // If front is Japanese, back should show Vietnamese meaning.
    // If front is Japanese, back is Vietnamese face: Han-Viet as main, meaning as subtitle
    if (frontFace === "japanese") {
      const meaning = getMeaningVi();
      const exVi = getExampleVi();
      const hv = getHanViet();

      const subtitleParts: string[] = [];

      // Sub: Vietnamese meaning
      subtitleParts.push(meaning || "Đang cập nhật");

      // Sub: Vietnamese example if enabled and available (with highlighted meaning)
      if (showVietnameseExample && exVi && !containsJapaneseChars(exVi)) {
        const highlightedExample = highlightWordInExample(exVi, meaning, "");
        subtitleParts.push(`Ví dụ: ${highlightedExample}`);
      }

      // Main: Han-Viet (uppercase, like kanji position)
      const main = hv ? hv.toUpperCase() : (meaning || "Đang cập nhật");
      const subJoined = subtitleParts.join("\n");

      // If first subtitle part equals main (hanViet), remove it to avoid duplication
      const firstPart = subtitleParts[0];
      if (firstPart === main || firstPart === main.toLowerCase()) {
        // Remove the first part (meaning) if it equals hanViet
        const filteredParts = subtitleParts.slice(1);
        return { main, sub: filteredParts.join("\n"), isVietnamese: true };
      }

      return { main, sub: subJoined, isVietnamese: true };
    }

    // frontFace === "vietnamese" → back is Japanese (kanji → reading → example JP)
    let mainContent = "";
    const subtitleParts: string[] = [];

    if (showKanji && currentCard?.kanji) {
      mainContent = currentCard.kanji;
      const r = getReading();
      if (r) subtitleParts.push(r);
    } else {
      mainContent = getReading();
    }

    // Add Japanese example if enabled (with highlighted vocabulary)
    const exJp = getExampleJp();
    if (showJapaneseExample && exJp) {
      const word = currentCard?.kanji || currentCard?.word || "";
      const reading = getReading();
      const highlightedExample = highlightWordInExample(exJp, word, reading);
      subtitleParts.push(`例: ${highlightedExample}`);
    }

    let subContent = subtitleParts.join("\n");

    // If first subtitle part (reading) equals main (kanji), remove it
    const firstPart = subtitleParts[0];
    if (firstPart === mainContent || firstPart === currentCard?.kanji) {
      const filteredParts = subtitleParts.slice(1);
      subContent = filteredParts.join("\n");
    }

    return { main: mainContent, sub: subContent, isVietnamese: false };
  };

  // Cache content to prevent re-computation and log spam
  const frontContent = React.useMemo(() => getFrontContent(), [currentCard, frontFace, isFlipped, showJapaneseExample, showVietnameseExample]);
  const backContent = React.useMemo(() => getBackContent(), [currentCard, frontFace, isFlipped, showJapaneseExample, showVietnameseExample]);

  // Log only when card changes (not on every render)
  React.useEffect(() => {
    if (currentCard) {
      console.log("[Flashcard Debug] currentCard:", {
        kanji: currentCard?.kanji,
        hiragana: currentCard?.hiragana,
        katakana: currentCard?.katakana,
        hanViet: currentCard?.hanviet,
        meaning: currentCard?.meaningVi || currentCard?.meaning,
        example: currentCard?.example,
        exampleMeaning: currentCard?.exampleMeaning,
        reading: currentCard?.reading,
        word: currentCard?.word,
      });
      console.log("[Flashcard Debug] frontContent:", frontContent);
      console.log("[Flashcard Debug] backContent:", backContent);
    }
  }, [currentCard?.id, frontFace]);

  if (!currentCard) return null;

  const visibleFaceLabel = (() => {
    const isVietnameseFaceVisible =
      (frontFace === "vietnamese" && !isFlipped) ||
      (frontFace === "japanese" && isFlipped);
    return isVietnameseFaceVisible ? "VI" : "JP";
  })();

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
        className="w-full max-w-[700px] sm:max-w-[720px] md:max-w-[760px] bg-white dark:bg-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-slate-600"
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
              bg-white dark:bg-slate-700
              border-b
              border-gray-200 dark:border-slate-500
              shadow-lg
              transition-all
              cursor-pointer
              select-none
            "
          >
            {/* Face indicator */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <span className="inline-flex items-center rounded-full border border-gray-200/70 dark:border-slate-500/70 bg-white/70 dark:bg-slate-800/70 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:text-neutral-100 backdrop-blur">
                {visibleFaceLabel}
              </span>
            </div>

            {/* AUDIO */}
            <button
              onClick={handlePlayAudio}
              className="
              absolute
              top-4
              right-4
              p-3
              rounded-full
              text-gray-400 dark:text-neutral-400
              hover:text-gray-700 dark:hover:text-neutral-200
              transition
              hover:bg-gray-100 dark:hover:bg-neutral-700
            "
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* NAVIGATION - PREVIOUS */}
            {currentCardIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPrevCard) onPrevCard();
                }}
                className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                p-3
                rounded-full
                bg-white/80 dark:bg-slate-600/80
                text-gray-600 dark:text-neutral-300
                hover:text-gray-900 dark:hover:text-white
                hover:bg-white dark:hover:bg-slate-500
                transition
                shadow-md
                z-10
              "
                title="Thẻ trước (←)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* NAVIGATION - NEXT */}
            {currentCardIndex < cardsToStudy.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNextCard) onNextCard();
                }}
                className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                p-3
                rounded-full
                bg-white/80 dark:bg-slate-600/80
                text-gray-600 dark:text-neutral-300
                hover:text-gray-900 dark:hover:text-white
                hover:bg-white dark:hover:bg-slate-500
                transition
                shadow-md
                z-10
              "
                title="Thẻ sau (→)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* FRONT */}
            {!isFlipped && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div
                  className={`text-[40px] sm:text-[52px] font-semibold tracking-wide text-gray-900 dark:text-neutral-100 flex flex-col items-center`}
                  style={
                    frontContent.isVietnamese
                      ? undefined
                      : { fontFamily: "var(--kanji-font-family)" }
                  }
                >
                  {frontContent.main}
                </div>

                {frontContent.sub && (
                  <div
                    className={`mt-2 text-[28px] sm:text-[36px] text-gray-500 dark:text-neutral-300`}
                    style={
                      frontContent.isVietnamese
                        ? undefined
                        : { fontFamily: "var(--kanji-font-family)" }
                    }
                  >
                    {frontContent.sub
                      .split("\n")
                      .map((line, index) => (
                        <div key={index} className="flex flex-col items-center">
                          {line.includes('<span') ? (
                            <span dangerouslySetInnerHTML={{ __html: line }} />
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                  </div>
                )}

                <div
                  className="absolute bottom-4 text-[11px] text-gray-400 dark:text-neutral-400"
                >
                  {screens?.xs ? "Chạm để lật" : "Phím cách để lật"}
                </div>
              </div>
            )}

            {/* BACK */}
            {isFlipped && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div
                  className={`text-[40px] sm:text-[52px] font-semibold tracking-wide text-gray-900 dark:text-neutral-100 flex flex-col items-center`}
                  style={
                    backContent.isVietnamese
                      ? undefined
                      : { fontFamily: "var(--kanji-font-family)" }
                  }
                >
                  {backContent.main}
                </div>

                {backContent.sub && (
                  <div
                    className={`mt-2 text-[28px] sm:text-[36px] text-gray-500 dark:text-neutral-300`}
                    style={
                      backContent.isVietnamese
                        ? undefined
                        : { fontFamily: "var(--kanji-font-family)" }
                    }
                  >
                    {backContent.sub
                      .split("\n")
                      .map((line, index) => (
                        <div key={index} className="flex flex-col items-center">
                          {line.includes('<span') ? (
                            <span dangerouslySetInnerHTML={{ __html: line }} />
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                  </div>
                )}

                <div
                  className="absolute bottom-4 text-[11px] text-gray-400 dark:text-neutral-400 tracking-wide"
                >
                  ← Chưa nhớ · Đã nhớ →
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flashcard-action-bar relative bg-gray-100 dark:bg-slate-900 px-4 sm:px-8 pb-7 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-[120px] justify-start">
              <Button
                type="text"
                size="large"
                className="text-gray-600 dark:text-neutral-200 hover:text-gray-900 dark:hover:text-white font-semibold hover:bg-gray-200 dark:hover:bg-white/10"
                icon={<Settings className="w-4 h-4" />}
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
                bg-red-500/10 dark:bg-red-500/20
                text-red-600 dark:text-red-200
                hover:border-red-500
                hover:bg-red-500/20 dark:hover:bg-red-500/30
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
                <X className="w-5 h-5 text-red-500 dark:text-red-100" />
              </button>

              {/* Progress Counter */}
              <div className="min-w-[4.5rem] text-center">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-base font-semibold text-gray-800 dark:text-neutral-100">
                  {currentCardIndex + 1}
                  <span className="mx-1 text-gray-400 dark:text-neutral-400">/</span>
                  <span className="text-gray-600 dark:text-neutral-300">
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
                bg-green-500/10 dark:bg-green-500/20
                text-green-600 dark:text-green-200
                hover:border-green-500
                hover:bg-green-500/20 dark:hover:bg-green-500/30
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
                <Check className="w-5 h-5 text-green-500 dark:text-green-100" />
              </button>
            </div>
            <div className="flex items-center gap-2 justify-end w-[120px]">
              {onResetCards && (
                <Button
                  type="text"
                  size="large"
                  className="text-gray-600 dark:text-neutral-200 hover:text-gray-900 dark:hover:text-white font-semibold hover:bg-gray-200 dark:hover:bg-white/10"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={onResetCards}
                />
              )}
              {onShuffleCards && (
                <Button
                  type="text"
                  size="large"
                  className="text-gray-600 dark:text-neutral-200 hover:text-gray-900 dark:hover:text-white font-semibold hover:bg-gray-200 dark:hover:bg-white/10"
                  icon={<Shuffle className="w-4 h-4" />}
                  onClick={onShuffleCards}
                />
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-1.5 w-full bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
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
        title={<span className="text-gray-900 dark:text-white">Cài đặt Flashcard</span>}
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={null}
        width={480}
        className="flashcard-settings-modal"
        rootClassName="fix-modal-bg"
        styles={{
          mask: {
            backgroundColor: "rgba(15, 23, 42, 0.35)",
            backdropFilter: "blur(6px)",
          },
          body: {
            background: "transparent",
            padding: 0,
            maxHeight: "none",
            overflowY: "visible",
          },
          header: {
            background: "transparent",
            borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
          },
        }}
      >
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5 text-gray-900 dark:text-white shadow-2xl">
          {/* Front Face Setting */}
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Text
                  className="font-semibold text-gray-900 dark:text-white"
                >
                  Mặt trước
                </Text>
                <div className="text-xs text-gray-500 dark:text-white/80">
                  Chọn nội dung hiển thị khi mở thẻ
                </div>
              </div>
              <Select
                value={frontFace}
                onChange={setFrontFace}
                style={{ width: 140 }}
                className="flashcard-settings-select-trigger bg-white dark:bg-slate-900"
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
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text
                  className="font-semibold text-gray-900 dark:text-white"
                >
                  Hiển thị ví dụ
                </Text>
                <div className="text-sm text-gray-500 dark:text-white/80">
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
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text
                  className="font-semibold text-gray-900 dark:text-white"
                >
                  Chuyển văn bản thành lời nói
                </Text>
                <div className="text-sm text-gray-500 dark:text-white/80">
                  Tự động phát âm khi lật sang mặt tiếng Nhật
                </div>
              </div>
              <Switch checked={autoSpeak} onChange={setAutoSpeak} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-4 space-y-3">
            <Button
              type="default"
              block
              danger
              icon={<RotateCcw className="w-4 h-4" />}
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
              icon={<Shuffle className="w-4 h-4" />}
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
