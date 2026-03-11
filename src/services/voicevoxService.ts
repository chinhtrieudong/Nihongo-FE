// Japanese TTS Service using Web Speech API
// Simplified implementation focusing on reliability

const SPEAKERS = {
  ZUNDAMON_FEMALE: 3,
  DEFAULT: 3,
};

// Voice quality presets
const VOICE_QUALITY = {
  NORMAL: { rate: 1.0, pitch: 1.0, volume: 1.0 },
  CLEAR: { rate: 0.95, pitch: 1.1, volume: 1.0 }, // Slightly slower + higher pitch for clarity
  FAST: { rate: 1.2, pitch: 1.0, volume: 1.0 }, // Faster delivery
  NATURAL: { rate: 0.9, pitch: 1.05, volume: 1.0 }, // Natural sounding
} as const;

type QualityPresetType = keyof typeof VOICE_QUALITY;

let isSpeaking = false;
let speechUtterance: SpeechSynthesisUtterance | null = null;
let currentQualityPreset: QualityPresetType = "CLEAR"; // Default to CLEAR for better pronunciation

// Get available voices from the system
export const getAvailableSpeakers = async () => {
  const synth = window.speechSynthesis;

  // Load voices
  const voices = synth.getVoices();

  // Filter Japanese voices
  const japaneseVoices = voices.filter((v) => v.lang.startsWith("ja"));

  // Convert to speaker format
  const speakers = japaneseVoices.map((voice, index) => ({
    id: index,
    name: voice.name,
    lang: voice.lang,
    nativeVoice: voice,
  }));

  return speakers;
};

// Get all available voices (not just Japanese)
export const getAllAvailableVoices = () => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  return voices.map((voice, index) => ({
    id: index,
    name: voice.name,
    lang: voice.lang,
    nativeVoice: voice,
  }));
};

// Speak text using Web Speech API with optional voice selection
export const speakWithVoicevox = async (
  text: string,
  speaker: number = SPEAKERS.DEFAULT,
) => {
  return new Promise<void>((resolve, reject) => {
    if (!text || !text.trim()) {
      cancel();
      reject(new Error("Text is required"));
      return;
    }

    // Cancel any existing speech
    if (isSpeaking) {
      cancel();
    }

    const synth = window.speechSynthesis;

    // Cancel pending utterances
    synth.cancel();

    // Create new utterance
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = "ja-JP";

    // Apply quality preset
    const preset = VOICE_QUALITY[currentQualityPreset] || VOICE_QUALITY.CLEAR;
    speechUtterance.rate = preset.rate;
    speechUtterance.pitch = preset.pitch;
    speechUtterance.volume = preset.volume;

    // Get all voices
    const voices = synth.getVoices();

    // If speaker ID is provided and valid, use it directly
    if (
      speaker >= 0 &&
      speaker < voices.length &&
      voices[speaker].lang.startsWith("ja")
    ) {
      speechUtterance.voice = voices[speaker];
    } else {
      // Voice preference order: Google > Natural > Microsoft Ayumi > Any Japanese
      let selectedVoice = voices.find(
        (v) => v.name.includes("Google") && v.lang.startsWith("ja"),
      );

      // Fallback: Natural voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) => v.name.includes("Natural") && v.lang.startsWith("ja"),
        );
      }

      // Fallback: Microsoft Ayumi
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) => v.name.includes("Ayumi") && v.lang.startsWith("ja"),
        );
      }

      // Last fallback: any Microsoft Japanese voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) => v.name.includes("Microsoft") && v.lang.startsWith("ja"),
        );
      }

      // Ultimate fallback: any Japanese voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) => v.lang.startsWith("ja") && !v.name.includes("Google"),
        );
      }

      if (selectedVoice) {
        speechUtterance.voice = selectedVoice;
      }
    }

    isSpeaking = true;

    speechUtterance.onstart = () => {};

    speechUtterance.onend = () => {
      isSpeaking = false;
      resolve();
    };

    speechUtterance.onerror = (event) => {
      console.error("❌ Speech error:", event.error);
      isSpeaking = false;
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    synth.speak(speechUtterance);

    // Timeout fallback - max 30 seconds
    const timeout = setTimeout(() => {
      if (isSpeaking) {
        cancel();
        resolve();
      }
    }, 30000);

    speechUtterance.onend = () => {
      clearTimeout(timeout);
      isSpeaking = false;
      resolve();
    };
  });
};

// Cancel current speech
export const cancel = () => {
  window.speechSynthesis.cancel();
  isSpeaking = false;
  speechUtterance = null;
};

// Speak with a specific voice by name
export const speakWithVoiceName = async (text: string, voiceName: string) => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  const voice = voices.find(
    (v) =>
      v.name.toLowerCase().includes(voiceName.toLowerCase()) &&
      v.lang.startsWith("ja"),
  );

  if (!voice) {
    console.error(`❌ Voice "${voiceName}" not found`);
    return;
  }

  const voiceIndex = voices.indexOf(voice);
  await speakWithVoicevox(text, voiceIndex);
};

// Check if speaking
export const getIsSpeaking = () => isSpeaking;

// Set voice quality preset
export const setQualityPreset = (preset: QualityPresetType) => {
  if (preset in VOICE_QUALITY) {
    currentQualityPreset = preset;
  }
};

// Get current quality preset
export const getQualityPreset = () => currentQualityPreset;

// Get available quality presets
export const getAvailableQualityPresets = () => Object.keys(VOICE_QUALITY);

// Aliases for compatibility  with existing code
export const speakText = (text: string) => speakWithVoicevox(text);
export const stopVoicevox = cancel;
export const isVoicevoxSpeaking = getIsSpeaking;
