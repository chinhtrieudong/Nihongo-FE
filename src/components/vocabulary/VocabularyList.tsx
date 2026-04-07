import React, { useState, useEffect } from "react";
import { Card, Table, Typography, Button, Spin, Tag, Tooltip, Space } from "antd";
import { Volume2, Book } from "lucide-react";
import { vocabularyAPI } from "../../services/api";
import { EmptyState } from "../common";
import type { VocabularyItem } from "../../types/lesson";
import { speakText } from "../../utils/vocabularyUtils";
import { useAppSelector } from "../../store/hooks";
import { getFontPreset } from "../../constants/fonts";

const { Title, Text } = Typography;

interface VocabularyListProps {
  lessonNumber: number;
  femaleVoiceName?: string;
}

const VocabularyList: React.FC<VocabularyListProps> = ({
  lessonNumber,
  femaleVoiceName
}) => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fontPreset } = useAppSelector((state) => state.ui);
  const selectedPreset = getFontPreset(fontPreset);

  // Set CSS variable for kanji font family based on selected preset
  useEffect(() => {
    const kanjiFont = selectedPreset.kanjiFontFamily || selectedPreset.fontFamily;
    document.documentElement.style.setProperty('--kanji-font-family', kanjiFont);
  }, [selectedPreset]);

  useEffect(() => {
    loadVocabulary();
  }, [lessonNumber]);

  const loadVocabulary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vocabularyAPI.getVocabularyByLesson(lessonNumber);
      if (response.success && response.data) {
        // Transform data to match VocabularyItem interface
        const transformedVocabulary = response.data.map((item: any) => ({
          id: item.kanji || item.hiragana,
          kanji: item.kanji,
          hiragana: item.hiragana,
          katakana: item.katakana || null,
          romaji: item.romaji,
          hanviet: item.hanviet,
          meaning_vi: item.meaningVi,
          meaning_en: item.meaningEn || "",
          example_jp: item.exampleSentence,
          example_vi: item.exampleSentenceVi || item.exampleSentence,
          example_en: item.exampleEn || "",
          audio_url: item.audioUrl,
          difficulty: item.difficulty || "easy",
          frequency: item.frequency || "high",
          kanji_analysis: item.kanji_analysis || [],
          jlpt: item.jlpt || "N5",
          mnemonic: item.mnemonic || "",
          part_of_speech: item.part_of_speech || "",
          notes: item.notes || ""
        }));
        setVocabulary(transformedVocabulary);
      } else {
        setError("Failed to load vocabulary");
      }
    } catch (err) {
      setError("Error loading vocabulary");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (text: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    speakText(text, 'ja-JP', femaleVoiceName);
  };

  const columns = [
    {
      title: "Kanji",
      dataIndex: "kanji",
      key: "kanji",
      width: 120,
      render: (text: string, record: VocabularyItem) => (
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100 kanji-text">
            {text || "-"}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 jp-text">
            {record.katakana || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Hiragana",
      dataIndex: "hiragana",
      key: "hiragana",
      width: 120,
      render: (text: string) => (
        <div className="text-center">
          <div className="text-blue-600 dark:text-blue-400 font-medium jp-text">
            {text}
          </div>
        </div>
      ),
    },
    {
      title: "Romaji",
      dataIndex: "romaji",
      key: "romaji",
      width: 120,
      render: (text: string) => (
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
          {text}
        </div>
      ),
    },
    {
      title: "Hán Việt",
      dataIndex: "hanviet",
      key: "hanviet",
      width: 100,
      render: (text: string) => (
        <div className="text-center text-purple-600 dark:text-purple-400 font-medium">
          {text}
        </div>
      ),
    },
    {
      title: "Nghĩa",
      dataIndex: "meaning_vi",
      key: "meaning_vi",
      render: (text: string) => (
        <div className="text-gray-800 dark:text-gray-200">
          {text}
        </div>
      ),
    },
    {
      title: "Ví dụ",
      key: "example",
      render: (record: VocabularyItem) => (
        <div className="space-y-1">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {record.example_jp}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {record.example_vi}
          </div>
        </div>
      ),
    },
    {
      title: "Level",
      dataIndex: "jlpt",
      key: "jlpt",
      width: 80,
      render: (level: string) => (
        <Tag color={level === "N5" ? "green" : level === "N4" ? "blue" : "orange"}>
          {level}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (record: VocabularyItem) => (
        <Space>
          <Tooltip title="Phát âm">
            <Button
              type="text"
              size="small"
              icon={<Volume2 className="w-4 h-4" />}
              onClick={(e) => handlePlayAudio(record.hiragana || record.kanji, e)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <Card className="text-center">
          <Title level={4} type="danger">
            Lỗi
          </Title>
          <Text type="secondary">{error}</Text>
          <Button
            type="primary"
            onClick={loadVocabulary}
            style={{ marginTop: 16 }}
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  if (vocabulary.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <EmptyState description="Không có từ vựng cho bài học này" />
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-4">
        <Title level={4}>
          <Book className="w-5 h-5" /> Danh sách từ vựng - Bài {lessonNumber}
        </Title>
        <Text type="secondary">
          Tổng cộng: {vocabulary.length} từ
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={vocabulary}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} từ`,
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />
    </Card>
  );
};

export default VocabularyList;
