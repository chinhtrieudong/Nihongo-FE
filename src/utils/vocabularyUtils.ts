import type { VocabularyItem } from '../types/lesson';

// Helper function to generate unique ID for vocabulary items
export const generateVocabularyId = (item: VocabularyItem, index: number): string => {
  return item.id || `${item.kanji}_${item.hiragana || item.katakana}_${index}`;
};

// Helper function for Text-to-Speech
const scoreVoice = (name: string) => {
  const lower = name.toLowerCase();
  let score = 0;
  if (lower.includes("microsoft")) score += 3;
  if (lower.includes("natural") || lower.includes("online")) score += 3;
  if (lower.includes("keita")) score += 3;
  if (lower.includes("nanami")) score += 3;
  if (lower.includes("haruka") || lower.includes("ayumi") || lower.includes("sayaka")) score += 2;
  if (lower.includes("ichiro") || lower.includes("otoya")) score += 1;
  if (lower.includes("google")) score += 1;
  return score;
};

export const getJapaneseVoices = () => {
  if (!("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  const japanese = voices.filter((voice) => voice.lang?.toLowerCase().startsWith("ja"));
  return japanese.sort((a, b) => scoreVoice(b.name) - scoreVoice(a.name));
};

export const speakText = (text: string, lang: string = 'ja-JP') => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    const preferredVoice = getJapaneseVoices()[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported in this browser');
  }
};
