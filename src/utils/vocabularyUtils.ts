import type { VocabularyItem } from "../types/lesson";
import {
  speakWithVoicevox,
  isVoicevoxSpeaking,
  stopVoicevox,
} from "../services/voicevoxService";

// Helper function to generate unique ID for vocabulary items
export const generateVocabularyId = (
  item: VocabularyItem,
  index: number,
): string => {
  return item.id || `${item.kanji}_${item.hiragana || item.katakana}_${index}`;
};

// Helper function for Text-to-Speech
const scoreVoice = (name: string) => {
  const lower = name.toLowerCase();
  let score = 0;

  // Ưu tiên cao nhất cho Google 日本語 - giọng yêu cầu chính xác
  if (lower.includes("google") && lower.includes("日本語")) score += 100;

  // Ưu tiên cho Google 日本語 khác
  if (lower.includes("google") && lower.includes("japanese")) score += 80;

  // Ưu tiên cao nhất cho Microsoft Nanami Online (Natural) - giọng yêu cầu chính xác
  if (
    lower.includes("microsoft") &&
    lower.includes("nanami") &&
    lower.includes("online (natural)")
  )
    score += 50;

  // Ưu tiên cho Microsoft Nanami Online (Natural) khác
  if (lower.includes("nanami") && lower.includes("online (natural)"))
    score += 40;

  // Ưu tiên cao cho các giọng natural quality khác
  if (lower.includes("natural")) score += 10;
  if (lower.includes("online (natural)")) score += 15;
  if (lower.includes("premium")) score += 8;
  if (lower.includes("neural")) score += 8;
  if (lower.includes("enhanced")) score += 7;

  // Ưu tiên cho các giọng nói chất lượng cao
  if (lower.includes("microsoft")) score += 5;
  if (lower.includes("google")) score += 4;

  // Ưu tiên cho Nanami (bất kể version nào)
  if (lower.includes("nanami")) score += 6;

  // Ưu tiên cho các giọng nói Nhật Bản phổ biến khác
  if (lower.includes("keita")) score += 6;
  if (lower.includes("haruka")) score += 4;
  if (lower.includes("ayumi")) score += 4;
  if (lower.includes("sayaka")) score += 4;
  if (lower.includes("ichiro")) score += 3;
  if (lower.includes("otoya")) score += 3;

  // Ưu tiên cho giọng nữ (thường tự nhiên hơn cho tiếng Nhật)
  if (lower.includes("female")) score += 2;
  if (lower.includes("josei")) score += 2;
  if (lower.includes("onna")) score += 2;

  // Ưu tiên cho giọng nam
  if (lower.includes("male")) score += 1;
  if (lower.includes("dan")) score += 1;
  if (lower.includes("otoko")) score += 1;

  return score;
};

export const getJapaneseVoices = () => {
  if (!("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices; // Lấy tất cả voices, không filter
};
export const getBestNaturalVoice = () => {
  const voices = getJapaneseVoices();

  // Ưu tiên Google 日本語 - giọng yêu cầu chính xác
  const googleJapanese = voices.find(
    (voice) =>
      voice.name.toLowerCase().includes("google") &&
      voice.name.toLowerCase().includes("日本語"),
  );
  if (googleJapanese) return googleJapanese;

  // Ưu tiên Microsoft Nanami Online (Natural) - giọng yêu cầu chính xác
  const microsoftNanami = voices.find(
    (voice) =>
      voice.name.toLowerCase().includes("microsoft") &&
      voice.name.toLowerCase().includes("nanami") &&
      voice.name.toLowerCase().includes("online (natural)"),
  );
  if (microsoftNanami) return microsoftNanami;

  // Ưu tiên các giọng natural quality khác
  const naturalVoices = voices.filter(
    (voice) =>
      voice.name.toLowerCase().includes("natural") ||
      voice.name.toLowerCase().includes("online (natural)") ||
      voice.name.toLowerCase().includes("premium") ||
      voice.name.toLowerCase().includes("neural"),
  );

  if (naturalVoices.length > 0) return naturalVoices[0];

  // Nếu không có giọng natural, trả về giọng tốt nhất
  return voices[0];
};

// Get best female local voice
export const getBestFemaleNaturalVoice = () => {
  const voices = getJapaneseVoices();
  const japaneseVoices = voices.filter(
    (v) => v.lang.includes("ja") && !v.name.toLowerCase().includes("google"),
  );
  return japaneseVoices[0] || voices[0];
};

// Get best male local voice
export const getBestMaleNaturalVoice = () => {
  const voices = getJapaneseVoices();
  const japaneseVoices = voices.filter(
    (v) => v.lang.includes("ja") && !v.name.toLowerCase().includes("google"),
  );
  return japaneseVoices[0] || voices[0];
};

// Get local Japanese voice - no cloud, no natural, no online
export const getNanamiNaturalVoice = () => {
  const voices = getJapaneseVoices();
  const japaneseVoices = voices.filter(
    (v) => v.lang.includes("ja") && !v.name.toLowerCase().includes("google"),
  );
  return japaneseVoices[0] || voices[0];
};

// Helper để đảm bảo speech synthesis sẵn sàng
export const waitForSpeechSynthesis = () => {
  return new Promise<void>((resolve) => {
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }

    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged,
      );
      resolve();
    };

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      handleVoicesChanged,
    );

    // Fallback timeout
    setTimeout(() => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged,
      );
      resolve();
    }, 1000);
  });
};

// Interface cho speech queue item
interface SpeechQueueItem {
  text: string;
  lang?: string;
  voiceName?: string;
  id: string;
}

// Simple queue for instant speech
let speechQueue: SpeechQueueItem[] = [];
let isProcessing = false;
let lastSpeechTime = 0;
const MIN_SPEECH_INTERVAL = 150; // Minimum ms between speech requests (local voices are stable)
const MAX_CHUNK_LENGTH = 120; // Max chars per utterance chunk when splitting long text

export const speakText = (
  text: string,
  lang: string = "ja-JP",
  voiceName?: string,
) => {
  // Use Voicevox for speech synthesis instead of Web Speech API
  speakWithVoicevox(text);
};

const processSpeechQueue = () => {
  // Voicevox handles queueing internally, no need for manual queue
};

const speakNatural = (
  text: string,
  lang: string = "ja-JP",
  voiceName?: string,
) => {
  // Voicevox handles speech synthesis
  speakWithVoicevox(text);
};

// Warm-up function (no longer needed with Voicevox)
let isWarmedUp = false;
export const warmUpNaturalVoice = () => {
  console.log("✅ Voicevox ready (no warm-up needed)");
  isWarmedUp = true;
};

// Cancel current speech
export const cancelSpeech = () => {
  stopVoicevox();
  speechQueue = [];
  isProcessing = false;
  console.log("🛑 Speech cancelled");
};
