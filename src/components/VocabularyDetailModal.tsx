import React, { useCallback } from 'react';
import {
  Modal,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Tag,
  Tooltip,
  App as AntdApp
} from 'antd';
import {
  SoundOutlined
} from '@ant-design/icons';
import type { VocabularyItem as VocabularyItemType } from '../types/lesson';
import { speakText } from '../utils/vocabularyUtils';

const { Title, Text } = Typography;

interface VocabularyDetailModalProps {
  selectedWord: VocabularyItemType | null;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const VocabularyDetailModal: React.FC<VocabularyDetailModalProps> = ({
  selectedWord,
  showModal,
  setShowModal
}) => {
  const { message } = AntdApp.useApp();
  const handlePlayAudio = useCallback((text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(text);
  }, []);

  const handleCopy = useCallback(() => {
    const text = [
      selectedWord?.kanji,
      selectedWord?.hiragana || selectedWord?.katakana,
      selectedWord?.meaning_vi
    ].filter(Boolean).join(" - ");

    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => message.success("Đã copy nội dung"),
      () => message.error("Không thể copy nội dung")
    );
  }, [message, selectedWord]);

  const formatRomaji = useCallback((romaji?: string) => {
    if (!romaji) return "-";
    const input = romaji.toLowerCase().trim().replace(/\s+/g, "");
    const clusters = [
      "kya","kyu","kyo","gya","gyu","gyo",
      "sha","shu","sho","sya","syu","syo",
      "cha","chu","cho","cya","cyu","cyo",
      "nya","nyu","nyo",
      "hya","hyu","hyo",
      "mya","myu","myo",
      "rya","ryu","ryo",
      "bya","byu","byo",
      "pya","pyu","pyo",
      "ja","ju","jo"
    ];
    const vowels = ["a","i","u","e","o"];
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
      if (two.length === 2 && !vowels.includes(two[0]) && vowels.includes(two[1])) {
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

  return (
    <Modal
      title={
        <div className="flex items-center justify-between pr-8">
          <Title level={3} className="!mb-0">Chi tiết từ vựng</Title>
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={<SoundOutlined />}
              onClick={(e) => {
                const hiraKanaText = selectedWord?.hiragana || selectedWord?.katakana || '';
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
    >
      <Space orientation="vertical" className="w-full" size="large">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong className="text-secondary-900 dark:text-secondary-600">Kanji</Text>
            <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
              <Text className="text-4xl font-bold font-kosugi">
                {selectedWord?.kanji || '-'}
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <Text strong className="text-secondary-900 dark:text-secondary-600">Hira/Kana</Text>
            <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
              {selectedWord?.hiragana ? (
                <div className="flex items-center gap-2">
                  <Tag color="blue">Hiragana</Tag>
                  <Text className="text-2xl font-kosugi">{selectedWord.hiragana}</Text>
                </div>
              ) : null}
              {selectedWord?.katakana ? (
                <div className="flex items-center gap-2 mt-2">
                  <Tag color="purple">Katakana</Tag>
                  <Text className="text-2xl font-kosugi">{selectedWord.katakana}</Text>
                </div>
              ) : null}
              {!selectedWord?.hiragana && !selectedWord?.katakana && (
                <Text className="text-2xl font-kosugi">-</Text>
              )}
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong className="text-secondary-900 dark:text-secondary-600">Hán Việt</Text>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
              <Text className="text-lg text-purple-600 dark:text-purple-400 font-medium">
                {selectedWord?.hanviet ? selectedWord.hanviet.toUpperCase().replace(/,/g, '') : '-'}
              </Text>
            </div>
          </Col>
          <Col span={12}>
            <Text strong className="text-secondary-900 dark:text-secondary-600">Romaji (tách âm)</Text>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <Text className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                {formatRomaji(selectedWord?.romaji)}
              </Text>
            </div>
          </Col>
        </Row>

        <div>
          <Text strong className="text-secondary-900 dark:text-secondary-600">Nghĩa tiếng Việt</Text>
          <div className="p-3 bg-secondary-50 dark:bg-secondary-925 rounded">
            <Text className="text-xl font-semibold text-secondary-900 dark:text-secondary-600">
              {selectedWord?.meaning_vi || '-'}
            </Text>
          </div>
        </div>

        {selectedWord?.kanji && selectedWord.kanji_analysis &&
          Array.isArray(selectedWord.kanji_analysis) && selectedWord.kanji_analysis.length > 0 && (
            <div>
              <Text strong className="text-secondary-900 dark:text-secondary-600">Phân tích Kanji</Text>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                <Space orientation="vertical" className="w-full">
                  {selectedWord.kanji_analysis.map((kanji, index) => (
                    <div key={index} className="border-b border-orange-200 pb-2 last:border-b-0">
                      <Text className="font-semibold text-lg text-orange-800 dark:text-orange-600">
                        {kanji.character}
                      </Text>
                      <div className="text-sm text-secondary-700 dark:text-secondary-800">
                        <Text strong>Hán Việt:</Text> {kanji.hanviet || 'N/A'}
                      </div>
                      <div className="text-sm text-secondary-700 dark:text-secondary-800">
                        <Text strong>Bộ thủ:</Text> {kanji.radicals && kanji.radicals.length > 0 ? (
                          <Space wrap>
                            {kanji.radicals.map((radical, radIndex) => (
                              <Tag key={radIndex} color="blue" className="mb-1">
                                {radical.radical} - {radical.hanviet}
                              </Tag>
                            ))}
                          </Space>
                        ) : "Không có"}
                      </div>
                      <div className="text-sm text-secondary-700 dark:text-secondary-800">
                        <Text strong>Nghĩa:</Text> {kanji.meaning || 'N/A'}
                      </div>
                      {kanji.image_explanation && (
                        <div className="text-sm text-secondary-700 dark:text-secondary-800">
                          <Text strong>Giải thích:</Text> {kanji.image_explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </Space>
              </div>
            </div>
          )}

        <div>
          <Text strong className="text-gray-900 dark:text-gray-100">Ví dụ</Text>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            {selectedWord?.example_jp ? (
              <Tooltip
                title={selectedWord.example_vi || 'Không có bản dịch...'}
                placement="bottom"
                arrow={false}
                overlayInnerStyle={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
                  color: document.documentElement.classList.contains('dark') ? '#ffffff' : 'rgba(0, 0, 0, 0.88)',
                  border: document.documentElement.classList.contains('dark') ? '1px solid #4b5563' : '1px solid #d9d9d9',
                  borderRadius: '6px'
                }}
              >
                <Text
                  className="text-lg text-gray-700 dark:text-gray-300 italic cursor-pointer hover:text-blue-600 transition-colors duration-200"
                  style={{ textDecoration: 'underline dotted' }}
                >
                  {selectedWord.example_jp}
                </Text>
              </Tooltip>
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
  );
};

export default VocabularyDetailModal;
