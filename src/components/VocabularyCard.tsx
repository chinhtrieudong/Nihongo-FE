import React, { useCallback } from 'react';
import {
  Card,
  Button,
  Typography
} from 'antd';
import {
  SoundOutlined
} from '@ant-design/icons';
import type { VocabularyItem as VocabularyItemType } from '../types/lesson';
import { speakText } from '../utils/vocabularyUtils';

const { Text } = Typography;

interface VocabularyCardProps {
  item: VocabularyItemType;
  index: number;
  showHanViet: boolean;
  onWordClick: (word: VocabularyItemType) => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  item,
  index,
  showHanViet,
  onWordClick
}) => {
  const handlePlayAudio = useCallback((text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(text);
  }, []);

  return (
    <Card
      key={item.id || `${item.kanji}_${item.hiragana || item.katakana}_${index}`}
      className="cursor-pointer hover:shadow-sm transition-all duration-200 border border-gray-200 dark:border-secondary-700 rounded-md"
      onClick={() => onWordClick(item)}
      size="small"
      styles={{ body: { padding: "6px 8px" } }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {item.kanji ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-secondary-900 dark:text-secondary-100">
                {item.kanji}
              </span>
              <span className="text-xs text-secondary-500 dark:text-secondary-400">•</span>
              <span className="text-xs text-secondary-700 dark:text-secondary-300">
                {item.hiragana || item.katakana || "-"}
              </span>
            </div>
          ) : (
            <div className="text-xs text-secondary-700 dark:text-secondary-300">
              {item.hiragana || item.katakana || "-"}
            </div>
          )}
          <div className="flex items-baseline gap-1.5 mt-0.5">
            {showHanViet && item.hanviet && (
              <span className="text-[10px] uppercase tracking-wide text-secondary-900 dark:text-secondary-100 font-semibold">
                {item.hanviet.toUpperCase().replace(/,/g, '')}
              </span>
            )}
            {showHanViet && item.hanviet && (
              <span className="text-[10px] text-secondary-500 dark:text-secondary-400">•</span>
            )}
            <span className="text-xs font-normal text-secondary-900 dark:text-secondary-100 line-clamp-1">
              {item.meaning_vi || '-'}
            </span>
          </div>
        </div>
        <Button
          type="text"
          icon={<SoundOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            const hiraKanaText = item.hiragana || item.katakana || '';
            if (hiraKanaText) {
              handlePlayAudio(hiraKanaText, e);
            }
          }}
          disabled={!item.hiragana && !item.katakana}
          size="small"
          className="px-1"
        />
      </div>
    </Card>
  );
};

export default VocabularyCard;
