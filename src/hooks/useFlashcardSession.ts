import { useState, useCallback, useEffect } from 'react';
import type { VocabularyItem } from '../types/vocabulary';

export const useFlashcardSession = (items: VocabularyItem[]) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState<Record<string, 'known' | 'unknown'>>({});

  const currentCard = items[currentCardIndex];
  const isStudyComplete = items.length > 0 && currentCardIndex >= items.length;

  const nextCard = useCallback(() => {
    if (currentCardIndex < items.length) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex, items.length]);

  const prevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const markKnown = useCallback(() => {
    if (currentCard) {
      setCardStatus((prev) => ({ ...prev, [currentCard.id]: 'known' }));
      nextCard();
    }
  }, [currentCard, nextCard]);

  const markUnknown = useCallback(() => {
    if (currentCard) {
      setCardStatus((prev) => ({ ...prev, [currentCard.id]: 'unknown' }));
      nextCard();
    }
  }, [currentCard, nextCard]);

  const resetSession = useCallback(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCardStatus({});
  }, []);

  return {
    currentCard,
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
  };
};
