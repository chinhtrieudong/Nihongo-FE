import React, { useCallback, useMemo } from "react";
import {
  Modal,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Tag,
  App as AntdApp,
} from "antd";
import { SoundOutlined } from "@ant-design/icons";
import type { VocabularyItem as VocabularyItemType } from "../types/lesson";
import { speakText } from "../utils/vocabularyUtils";
import { useAppSelector } from "../store/hooks";
import { getFontPreset } from "../constants/fonts";

const { Title, Text } = Typography;

interface VocabularyDetailModalProps {
  selectedWord: VocabularyItemType | null;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  // Voice settings for TTS
  femaleVoiceName?: string;
}

const VocabularyDetailModal: React.FC<VocabularyDetailModalProps> = ({
  selectedWord,
  showModal,
  setShowModal,
  femaleVoiceName,
}) => {
  const { message } = AntdApp.useApp();
  const { fontPreset } = useAppSelector((state) => state.ui);
  const selectedPreset = getFontPreset(fontPreset);
  const handlePlayAudio = useCallback((text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(text, 'ja-JP');
  }, []);

  const handleCopy = useCallback(() => {
    const text = [
      selectedWord?.kanji,
      selectedWord?.hiragana || selectedWord?.katakana,
      selectedWord?.meaning_vi,
    ]
      .filter(Boolean)
      .join(" - ");

    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => message.success("Đã copy nội dung"),
      () => message.error("Không thể copy nội dung"),
    );
  }, [message, selectedWord]);

  const formatRomaji = useCallback((romaji?: string) => {
    if (!romaji) return "-";
    const input = romaji.toLowerCase().trim().replace(/\s+/g, "");
    const clusters = [
      "kya",
      "kyu",
      "kyo",
      "gya",
      "gyu",
      "gyo",
      "sha",
      "shu",
      "sho",
      "sya",
      "syu",
      "syo",
      "cha",
      "chu",
      "cho",
      "cya",
      "cyu",
      "cyo",
      "nya",
      "nyu",
      "nyo",
      "hya",
      "hyu",
      "hyo",
      "mya",
      "myu",
      "myo",
      "rya",
      "ryu",
      "ryo",
      "bya",
      "byu",
      "byo",
      "pya",
      "pyu",
      "pyo",
      "ja",
      "ju",
      "jo",
    ];
    const vowels = ["a", "i", "u", "e", "o"];
    const parts: string[] = [];
    let i = 0;
    while (i < input.length) {
      const rest = input.slice(i);
      let matched = "";
      for (const c of clusters) {
        if (rest.startsWith(c)) {
          matched = c;
          break;
        }
      }
      if (matched) {
        parts.push(matched);
        i += matched.length;
        continue;
      }
      const two = input.slice(i, i + 2);
      if (
        two.length === 2 &&
        !vowels.includes(two[0]) &&
        vowels.includes(two[1])
      ) {
        parts.push(two);
        i += 2;
        continue;
      }
      const one = input.slice(i, i + 1);
      if (vowels.includes(one)) {
        parts.push(one);
        i += 1;
        continue;
      }
      parts.push(one);
      i += 1;
    }
    return parts.join("·");
  }, []);

  const formatSingleReading = useCallback((reading: unknown) => {
    if (typeof reading === "string") return reading;
    if (reading && typeof reading === "object") {
      const kana = (reading as { kana?: string }).kana || "";
      const romaji = (reading as { romaji?: string }).romaji || "";
      if (kana && romaji) return `${kana} (${romaji})`;
      return kana || romaji || "";
    }
    return "";
  }, []);

  const formatReadings = useCallback(
    (readings: unknown) => {
      if (!Array.isArray(readings) || readings.length === 0) return "N/A";
      const values = readings
        .map((item) => formatSingleReading(item))
        .filter((item) => item && item.trim().length > 0);
      return values.length > 0 ? values.join(", ") : "N/A";
    },
    [formatSingleReading],
  );

  const formatRadical = useCallback((radical: unknown) => {
    if (typeof radical === "string") return radical;
    if (radical && typeof radical === "object") {
      const rad = radical as {
        radical?: string;
        value?: string;
        hanviet?: string;
        meaning?: string;
      };
      const symbol = rad.radical || rad.value || "";
      const hanviet = rad.hanviet ? ` - ${rad.hanviet}` : "";
      const meaning = rad.meaning ? ` (${rad.meaning})` : "";
      const label = `${symbol}${hanviet}${meaning}`.trim();
      return label || "-";
    }
    return "-";
  }, []);

  const normalizedKanjiAnalysis = useMemo(() => {
    const raw = selectedWord?.kanji_analysis;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === "object") return [parsed];
      } catch {
        return [];
      }
      return [];
    }
    if (typeof raw === "object") return [raw];
    return [];
  }, [selectedWord?.kanji_analysis]);

  const displayMeaning = selectedWord?.meaning_vi || selectedWord?.meaningVi;
  const displayJlpt =
    selectedWord?.jlpt ||
    selectedWord?.jpt ||
    selectedWord?.jlpt_level ||
    selectedWord?.jpt_level;
  const displayExampleJp = selectedWord?.example_jp || selectedWord?.exampleSentence;
  const displayExampleVi = selectedWord?.example_vi || selectedWord?.exampleSentenceVi;

  return (
    <>
      <style>{`
        .vocab-detail-modal .ant-modal-wrap {
          padding-bottom: 40px;
        }
      `}</style>
      <Modal
        title={
          <div className="flex items-center justify-between pr-8">
            <Title level={3} className="!mb-0">
              Chi tiết từ vựng
            </Title>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                icon={<SoundOutlined />}
                onClick={(e) => {
                  const hiraKanaText =
                    selectedWord?.hiragana || selectedWord?.katakana || "";
                  if (hiraKanaText) {
                    handlePlayAudio(hiraKanaText, e);
                  }
                }}
                disabled={!selectedWord?.hiragana && !selectedWord?.katakana}
              />
              <Button type="text" onClick={handleCopy}>
                Copy
              </Button>
            </div>
          </div>
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
        rootClassName="vocab-detail-modal"
      >
        <Space orientation="vertical" className="w-full" size="large">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text
                strong
                className="text-secondary-900 dark:text-secondary-600"
              >
                Kanji
              </Text>
              <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
                <Text className="text-4xl font-bold vocab-kanji-text" style={{ fontFamily: selectedPreset.kanjiFontFamily || selectedPreset.fontFamily }}>
                  {selectedWord?.kanji || "-"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text
                strong
                className="text-secondary-900 dark:text-secondary-600"
              >
                Hira/Kana
              </Text>
              <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
                {selectedWord?.hiragana && (
                  <Text className="text-2xl jp-text">
                    {selectedWord.hiragana}
                  </Text>
                )}
                {selectedWord?.katakana && (
                  <Text
                    className={`text-2xl jp-text ${selectedWord?.hiragana ? "ml-3" : ""}`}
                  >
                    {selectedWord.katakana}
                  </Text>
                )}
                {!selectedWord?.hiragana && !selectedWord?.katakana && (
                  <Text className="text-2xl jp-text">-</Text>
                )}
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text
                strong
                className="text-secondary-900 dark:text-secondary-600"
              >
                Hán Việt
              </Text>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                <Text className="text-lg text-purple-600 dark:text-purple-400 font-medium">
                  {selectedWord?.hanviet
                    ? selectedWord.hanviet.toUpperCase().replace(/,/g, "")
                    : "-"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text
                strong
                className="text-secondary-900 dark:text-secondary-600"
              >
                Romaji (tách âm)
              </Text>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <Text className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                  {formatRomaji(selectedWord?.romaji)}
                </Text>
              </div>
            </Col>
          </Row>

          <div>
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <Text strong className="text-secondary-900 dark:text-secondary-600">
                Nghĩa tiếng Việt
              </Text>
              {displayJlpt && (
                <Tag color="green" className="!text-sm !px-2 !py-0.5 !font-semibold !m-0">
                  {displayJlpt}
                </Tag>
              )}
            </div>
            <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
              <Text className="text-xl font-semibold text-secondary-900 dark:text-secondary-600">
                {displayMeaning || "-"}
              </Text>
            </div>
          </div>

          {normalizedKanjiAnalysis.length > 0 && (
            <div>
              <Text
                strong
                className="text-secondary-900 dark:text-secondary-600"
              >
                Phân tích Kanji
              </Text>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                <Space orientation="vertical" className="w-full">
                  {normalizedKanjiAnalysis.map((kanji: any, index: number) => (
                    <div
                      key={index}
                      className="border-b border-orange-200 pb-2 last:border-b-0"
                    >
                      <Text className="font-semibold text-lg text-orange-800 dark:text-orange-600">
                        {kanji.character}
                      </Text>
                      <div className="text-sm text-secondary-700 dark:text-secondary-800">
                        <Text strong>Hán Việt:</Text>{" "}
                        {kanji.hanviet ? kanji.hanviet.toUpperCase() : "N/A"}
                      </div>
                      <div className="text-sm text-secondary-700 dark:text-secondary-800">
                        <Text strong>Âm ON:</Text> {formatReadings(kanji.onyomi)}
                      </div>
                      <div className="text-sm text-secondary-700 dark:text-secondary-800">
                        <Text strong>Âm KUN:</Text> {formatReadings(kanji.kunyomi)}
                      </div>
                      {(kanji.jlpt_level ||
                        kanji.jpt_level ||
                        kanji.jlpt ||
                        kanji.jpt ||
                        displayJlpt) && (
                          <div className="text-sm text-secondary-700 dark:text-secondary-800">
                            {kanji.jlpt_level ||
                              kanji.jpt_level ||
                              kanji.jlpt ||
                              kanji.jpt ||
                              displayJlpt}
                          </div>
                        )}
                      <div className="text-sm text-secondary-700 dark:text-secondary-800">
                        <Text strong>Bộ thủ:</Text>{" "}
                        {kanji.radicals && kanji.radicals.length > 0 ? (
                          <Space wrap>
                            {kanji.radicals.map((radical: unknown, radIndex: number) => (
                              <Tag
                                key={radIndex}
                                color="blue"
                                className="mb-1"
                              >
                                {formatRadical(radical)}
                              </Tag>
                            ))}
                          </Space>
                        ) : (
                          "Không có"
                        )}
                      </div>
                      <div className="text-sm text-secondary-700 dark:text-secondary-800">
                        <Text strong>Nghĩa:</Text> {kanji.meaning || "N/A"}
                      </div>
                      {kanji.image_explanation && (
                        <div className="text-sm text-secondary-700 dark:text-secondary-800">
                          <Text strong>Giải thích:</Text>{" "}
                          {kanji.image_explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </Space>
              </div>
            </div>
          )}

          <div>
            <Text strong className="text-gray-900 dark:text-gray-100">
              Ví dụ
            </Text>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              {displayExampleJp ? (
                <Text className="text-lg text-gray-700 dark:text-gray-300">
                  {displayExampleJp}
                  {displayExampleVi
                    ? ` (${displayExampleVi})`
                    : " (Không có bản dịch...)"}
                </Text>
              ) : (
                <Text className="text-sm text-secondary-600 dark:text-secondary-400">
                  Chưa có ví dụ cho từ này.
                </Text>
              )}
            </div>
          </div>

          <div className="text-center">
            <Text className="text-xs text-secondary-500">
              Mẹo: nghe lại phát âm và đọc theo 2–3 lần để ghi nhớ nhanh hơn.
            </Text>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default VocabularyDetailModal;
