import React from "react";
import { Card, Typography } from "antd";
import VocabularyTable, { type VocabularyTableHandle } from "../../components/VocabularyTable";
import type { VocabularyItem } from "../../types/lesson";

const { Text } = Typography;

type VocabularyTabProps = {
  vocabularies: VocabularyItem[];
  loading: boolean;
  bookmarkedVocab: Set<string>;
  onCloseSidebar: () => void;
  lessonInfo?: {
    title?: string;
    lessonNumber?: number;
    level?: string;
  };
};

const VocabularyTab = React.forwardRef<VocabularyTableHandle, VocabularyTabProps>(({
  vocabularies,
  loading,
  bookmarkedVocab,
  onCloseSidebar,
  lessonInfo,
}, ref) => {
  // console.log('🔍 VocabularyTab received vocabularies:', vocabularies);
  // console.log('🔍 VocabularyTab loading:', loading);
  const data = vocabularies.map((vocab) => {
    let hanViet = "";

    if (Array.isArray(vocab.kanji_analysis) && vocab.kanji_analysis.length > 0) {
      hanViet = vocab.kanji_analysis.map((item) => item.hanviet).join(", ");
    }

    return {
      id: vocab.id,
      kanji: vocab.kanji,
      hiragana: vocab.hiragana,
      katakana: vocab.katakana,
      kana: vocab.hiragana || vocab.katakana || "",
      romaji: vocab.romaji,
      hanviet: hanViet || vocab.hanviet,
      meaning_vi: vocab.meaning_vi,
      meaningVi: vocab.meaning_vi || vocab.meaningVi,
      exampleSentence: vocab.example_jp,
      exampleSentenceVi: vocab.example_vi,
      example_jp: vocab.example_jp || "",
      example_vi: vocab.example_vi,
      audioUrl: vocab.audio_url || vocab.audioUrl,
      audio_url: vocab.audio_url || vocab.audioUrl || "",
      jlpt: vocab.jlpt || vocab.jpt || vocab.jlpt_level || vocab.jpt_level || "N5",
      jpt: vocab.jpt || vocab.jpt_level,
      difficulty: vocab.difficulty,
      frequency: vocab.frequency,
      kanji_analysis: vocab.kanji_analysis,
      is_starred: bookmarkedVocab.has(vocab.id),
      is_mastered: false,
      status: undefined,
    };
  });

  return (
    <div style={{ padding: "24px" }}>
      <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
        <div className="mb-4 flex items-center gap-4">
          <Text className="!text-secondary-700 dark:!text-secondary-400">
            Tổng số từ vựng: <strong>{vocabularies.length}</strong>
          </Text>
          {lessonInfo?.level && (
            <Text className="!text-secondary-700 dark:!text-secondary-400">
              Cấp độ: <strong>{lessonInfo.level}</strong>
            </Text>
          )}
        </div>

        <VocabularyTable
          ref={ref}
          data={data}
          loading={loading}
          onCloseSidebar={onCloseSidebar}
        />
      </Card>
    </div>
  );
});

export default VocabularyTab;
