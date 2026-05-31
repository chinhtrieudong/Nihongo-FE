import React, { useCallback } from 'react';
import {
  Card,
  Button
} from 'antd';
import { Volume2 } from 'lucide-react';
import type { VocabularyItem as VocabularyItemType } from '../../types/lesson';
import { speakText } from '../../utils/vocabularyUtils';

interface VocabularyCardProps {
  index: number;
  item: VocabularyItemType;
  showHanViet: boolean;
  onWordClick: (word: VocabularyItemType) => void;
  kanjiFontFamily?: string;

  // Voice settings for TTS
  femaleVoiceName?: string;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  index,
  showHanViet,
  onWordClick,
  kanjiFontFamily,
  femaleVoiceName
}) => {
  const displayKanji = item.kanji || item.word || "";
  const displayReading = item.hiragana || item.katakana || item.reading || item.word || "";
  const displayHanViet = item.hanviet || item.han_viet || "";
  const displayMeaning = item.meaningVi || item.meaning || "-";

  const handlePlayAudio = useCallback((text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(text, 'ja-JP', femaleVoiceName);
  }, [femaleVoiceName]);

  return (
    <Card
      key={item.id || `${displayKanji}_${displayReading}_${index}`}
      className="cursor-pointer hover:shadow-md transition-all duration-300 border-0 rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-secondary-800 dark:to-secondary-900"
      onClick={() => onWordClick(item)}
      styles={{ body: { padding: "12px 16px" } }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Kanji + Reading */}
          <div className="flex items-baseline gap-2 mb-1">
            {displayKanji ? (
              <>
                <span className="text-xl font-bold text-secondary-900 dark:text-secondary-100 kanji-text">
                  {displayKanji}
                </span>
                <span className="text-sm text-secondary-500 dark:text-secondary-400 jp-text">
                  {displayReading || "-"}
                </span>
              </>
            ) : (
              <span className="text-lg font-medium text-secondary-900 dark:text-secondary-100 jp-text">
                {displayReading || "-"}
              </span>
            )}
          </div>
          
          {/* Han Viet */}
          {showHanViet && displayHanViet && (
            <div className="text-xs uppercase tracking-wide text-primary-600 dark:text-primary-400 font-medium mb-1">
              {displayHanViet.toUpperCase().replace(/,/g, '')}
            </div>
          )}
          
          {/* Meaning - Main focus */}
          <div className="text-sm font-medium text-secondary-800 dark:text-secondary-200 line-clamp-2 leading-relaxed">
            {displayMeaning}
          </div>
        </div>
        
        {/* Audio Button */}
        <Button
          type="primary"
          shape="circle"
          icon={<Volume2 className="w-4 h-4" />}
          onClick={(e) => {
            e.stopPropagation();
            if (displayReading) {
              handlePlayAudio(displayReading, e);
            }
          }}
          disabled={!displayReading}
          size="small"
          className="flex-shrink-0 shadow-sm"
        />
      </div>
    </Card>
  );
};

export default VocabularyCard;
