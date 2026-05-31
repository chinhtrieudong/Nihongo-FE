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
import type { FlashcardSettings } from "../../hooks/useFlashcardSettings";

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
  settings: FlashcardSettings;
  onOpenSettings: () => void;
}

export const VocabularyFlashcard: React.FC<VocabularyFlashcardProps> = ({
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
  settings,
  onOpenSettings,
}) => {
  const {
    frontFace,
    autoSpeak,
    showKanji,
    showJapaneseExample,
    showVietnameseExample,
  } = settings;

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
    return currentCard?.example?.jp ?? "";
  }, [currentCard]);

  const getExampleVi = useCallback(() => {
    return currentCard?.example?.vn ?? "";
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

  const handlePlayAudio = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = getReading();
      if (text) speakText(text, 'ja-JP', femaleVoiceName);
    },
    [getReading, femaleVoiceName],
  );

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
      switch (e.key) {
        case ' ':
        case 'Space':
          e.preventDefault();
          onFlipCard();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onMemoryEvaluation('unknown');
          break;
        case 'ArrowRight':
          e.preventDefault();
          onMemoryEvaluation('known');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFlipCard, onMemoryEvaluation]);

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
      onClick={onBackToTable}
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
                onClick={onOpenSettings}
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
</div>
    
    
  );
};

export default VocabularyFlashcard;
