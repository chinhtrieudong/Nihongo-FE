import type { VocabularyItem } from "../types/lesson";
import {
  speakWithVoicevox,
  stopVoicevox,
} from "../services/voicevoxService";

// Helper function to generate unique ID for vocabulary items
export const generateVocabularyId = (
  item: VocabularyItem,
  index: number,
): string => {
  return item.id || `${item.kanji}_${item.hiragana || item.katakana}_${index}`;
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

export const speakText = (
  text: string,
  lang: string = "ja-JP",
  voiceName?: string,
) => {
  // Use Voicevox for speech synthesis instead of Web Speech API
  speakWithVoicevox(text);
};

// Warm-up function (no longer needed with Voicevox)
export const warmUpNaturalVoice = () => {
  console.log("✅ Voicevox ready (no warm-up needed)");
};

// Cancel current speech
export const cancelSpeech = () => {
  stopVoicevox();
  console.log("🛑 Speech cancelled");
};
