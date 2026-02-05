import React from "react";
import VocabularyTable from "../../components/VocabularyTable";
import type { VocabularyItem } from "../../types/lesson";

type VocabularyTabProps = {
  vocabularies: VocabularyItem[];
  loading: boolean;
  bookmarkedVocab: Set<string>;
  onCloseSidebar: () => void;
};

const VocabularyTab: React.FC<VocabularyTabProps> = ({
  vocabularies,
  loading,
  bookmarkedVocab,
  onCloseSidebar,
}) => {
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
      exampleSentence: vocab.example_jp,
      example_jp: vocab.example_jp || "",
      example_vi: vocab.example_vi,
      audioUrl: vocab.audio_url || vocab.audioUrl,
      audio_url: vocab.audio_url || vocab.audioUrl || "",
      difficulty: vocab.difficulty,
      frequency: vocab.frequency,
      kanji_analysis: vocab.kanji_analysis,
      is_starred: bookmarkedVocab.has(vocab.id),
      is_mastered: false,
      status: undefined,
    };
  });

  return <VocabularyTable data={data} loading={loading} onCloseSidebar={onCloseSidebar} />;
};

export default VocabularyTab;
