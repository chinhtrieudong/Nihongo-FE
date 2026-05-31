import { useState, useEffect, useCallback } from 'react';

/**
 * Settings controlling the flashcard UI.
 */
export interface FlashcardSettings {
  /** Which side of the card is shown by default */
  frontFace: 'japanese' | 'vietnamese';
  /** Automatically speak the reading when the card flips */
  autoSpeak: boolean;
  /** Show kanji characters (font family) */
  showKanji: boolean;
  /** Show example sentence in Japanese */
  showJapaneseExample: boolean;
  /** Show example sentence in Vietnamese */
  showVietnameseExample: boolean;
}

/**
 * Hook that manages flashcard settings state, persisting them to localStorage.
 * Also provides modal open/close helpers for the settings modal.
 */
export const useFlashcardSettings = () => {
  const defaultSettings: FlashcardSettings = {
    frontFace: 'japanese',
    autoSpeak: false,
    showKanji: true,
    showJapaneseExample: false,
    showVietnameseExample: false,
  };

  const [settings, setSettings] = useState<FlashcardSettings>(() => {
    try {
      const stored = localStorage.getItem('flashcard-settings');
      return stored ? (JSON.parse(stored) as FlashcardSettings) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Persist settings when they change
  useEffect(() => {
    try {
      localStorage.setItem('flashcard-settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSettings = useCallback((newPartial: Partial<FlashcardSettings>) => {
    setSettings(prev => ({ ...prev, ...newPartial }));
  }, []);

  const openSettings = useCallback(() => setIsSettingsModalOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsModalOpen(false), []);

  return {
    settings,
    updateSettings,
    isSettingsModalOpen,
    openSettings,
    closeSettings,
  };
};
