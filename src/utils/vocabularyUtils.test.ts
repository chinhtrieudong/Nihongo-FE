import { describe, expect, it, vi } from "vitest";
import {
  generateVocabularyId,
  getBestFemaleNaturalVoice,
  getBestNaturalVoice,
  getJapaneseVoices,
  speakText,
  toLegacyVocabularyItem,
} from "./vocabularyUtils";

describe("vocabularyUtils", () => {
  it("converts normalized vocabulary items to the legacy shape", () => {
    const legacy = toLegacyVocabularyItem({
      id: "1",
      kanji: "学校",
      hiragana: "がっこう",
      hanViet: "hoc hieu",
      meaning: "truong hoc",
      example: "学校へ行きます。",
      exampleMeaning: "Toi di den truong.",
      level: "N5",
      tags: [],
      lessonId: "lesson-1",
      createdAt: "2026-07-04",
      updatedAt: "2026-07-04",
    });

    expect(legacy).toMatchObject({
      id: "1",
      kanji: "学校",
      hiragana: "がっこう",
      hanviet: "hoc hieu",
      meaningVi: "truong hoc",
      jlpt: "N5",
      jlpt_level: "N5",
      romaji: "",
    });
  });

  it("generates a stable fallback vocabulary id", () => {
    expect(
      generateVocabularyId(
        {
          id: "",
          kanji: "雨",
          hiragana: "あめ",
          katakana: "",
          romaji: "ame",
          meaningVi: "mua",
          meaningEn: "rain",
          jlpt: "N5",
        },
        3,
      ),
    ).toBe("雨_あめ_3");
  });

  it("selects preferred speech synthesis voices", () => {
    const voices = [
      { name: "Microsoft Nanami Online (Natural)", lang: "ja-JP" },
      { name: "Google 日本語", lang: "ja-JP" },
      { name: "English Voice", lang: "en-US" },
    ] as SpeechSynthesisVoice[];

    vi.stubGlobal("speechSynthesis", {
      getVoices: () => voices,
      speak: vi.fn(),
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    expect(getJapaneseVoices()).toEqual(voices);
    expect(getBestNaturalVoice()?.name).toBe("Google 日本語");
    expect(getBestFemaleNaturalVoice()?.name).toBe("Microsoft Nanami Online (Natural)");
  });

  it("speaks non-empty text with the best matching Japanese voice", () => {
    const speak = vi.fn();
    const voices = [
      { name: "Default English", lang: "en-US" },
      { name: "Nanami", lang: "ja-JP" },
    ] as SpeechSynthesisVoice[];

    vi.stubGlobal("speechSynthesis", {
      getVoices: () => voices,
      speak,
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    speakText("こんにちは");
    speakText("   ");

    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0]).toMatchObject({
      text: "こんにちは",
      lang: "ja-JP",
      voice: voices[1],
    });
  });
});
