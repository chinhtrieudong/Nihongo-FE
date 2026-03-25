export type FontPresetKey =
  | "noto_sans_jp"
  | "noto_serif_jp"
  | "zen_maru_gothic"
  | "yuji_syuku"
  | "rocknroll_one"
  | "itim";

export type FontPreset = {
  key: FontPresetKey;
  label: string;
  fontFamily: string;
  kanjiFontFamily?: string;
  japaneseFontFamily?: string;
  previewFontFamily?: string;
};

export const FONT_PRESETS: FontPreset[] = [
  {
    key: "noto_sans_jp",
    label: "Sans - Noto Sans JP",
    fontFamily: '"Noto Sans JP", "Noto Sans", system-ui, sans-serif',
    kanjiFontFamily: '"Noto Sans JP", "Noto Sans", system-ui, sans-serif',
    japaneseFontFamily: '"Noto Sans JP", "Noto Sans", system-ui, sans-serif',
  },
  {
    key: "noto_serif_jp",
    label: "Serif - Noto Serif Japanese",
    fontFamily: '"Noto Serif JP", "Noto Sans", system-ui, serif',
    kanjiFontFamily: '"Noto Serif JP", "Noto Sans", system-ui, serif',
    japaneseFontFamily: '"Noto Serif JP", "Noto Sans", system-ui, serif',
  },
  {
    key: "zen_maru_gothic",
    label: "Rounded - Zen Maru Gothic",
    fontFamily:
      '"Zen Maru Gothic", "Noto Serif JP", "Noto Sans", system-ui, sans-serif',
    kanjiFontFamily: '"Zen Maru Gothic", "Noto Serif JP", "Noto Sans", system-ui, sans-serif',
    japaneseFontFamily: '"Zen Maru Gothic", "Noto Serif JP", "Noto Sans", system-ui, sans-serif',
  },
  {
    key: "yuji_syuku",
    label: "Handwriting - Yuji Syuku",
    fontFamily: '"Yuji Syuku", "Noto Serif JP", "Noto Sans", system-ui, serif',
    kanjiFontFamily: '"Yuji Syuku", "Noto Serif JP", "Noto Sans", system-ui, serif',
    japaneseFontFamily: '"Yuji Syuku", "Noto Serif JP", "Noto Sans", system-ui, serif',
  },
  {
    key: "rocknroll_one",
    label: "Bold Display - RocknRoll One",
    fontFamily:
      '"RocknRoll One", "Noto Sans JP", "Noto Sans", system-ui, sans-serif',
    kanjiFontFamily: '"RocknRoll One", "Noto Sans JP", "Noto Sans", system-ui, sans-serif',
    japaneseFontFamily: '"RocknRoll One", "Noto Sans JP", "Noto Sans", system-ui, sans-serif',
  },
  {
    key: "itim",
    label: "Itim",
    fontFamily: '"Itim", "Noto Sans JP", "Noto Sans", system-ui, sans-serif',
    kanjiFontFamily: '"Itim", "Noto Sans JP", "Noto Sans", system-ui, sans-serif',
    japaneseFontFamily: '"Itim", "Noto Sans JP", "Noto Sans", system-ui, sans-serif',
  },
];

export const getFontPreset = (key: FontPresetKey): FontPreset =>
  FONT_PRESETS.find((preset) => preset.key === key) ?? FONT_PRESETS[0];
