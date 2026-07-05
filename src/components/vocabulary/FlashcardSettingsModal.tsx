import React from 'react';
import { Modal, Switch, Select, Typography, Button } from 'antd';
import { RotateCcw, Shuffle } from 'lucide-react';
import type { FlashcardSettings } from '../../hooks/useFlashcardSettings';

const { Text } = Typography;

export interface FlashcardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FlashcardSettings;
  onSettingsChange: (newSettings: Partial<FlashcardSettings>) => void;
  onResetCards?: () => void;
  onShuffleCards?: () => void;
}

const FlashcardSettingsModal: React.FC<FlashcardSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onResetCards,
  onShuffleCards,
}) => {
  return (
    <Modal
      title="Cài đặt Flashcard"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={400}
      zIndex={1200}
    >
      <div className="space-y-6 py-4">
        <div className="flex justify-between items-center">
          <Text strong>Mặt trước</Text>
          <Select
            value={settings.frontFace}
            onChange={(val: "japanese" | "vietnamese") =>
              onSettingsChange({ frontFace: val })
            }
            className="w-40"
            options={[
              { label: "Tiếng Nhật", value: "japanese" },
              { label: "Tiếng Việt", value: "vietnamese" },
            ]}
          />
        </div>

        <div className="flex justify-between items-center">
          <Text strong>Tự động phát âm</Text>
          <Switch
            checked={settings.autoSpeak}
            onChange={(val) => onSettingsChange({ autoSpeak: val })}
          />
        </div>

        <div className="flex justify-between items-center">
          <Text strong>Hiển thị Kanji</Text>
          <Switch
            checked={settings.showKanji}
            onChange={(val) => onSettingsChange({ showKanji: val })}
          />
        </div>

        <div className="flex justify-between items-center">
          <Text strong>Hiện VD tiếng Nhật (Mặt sau)</Text>
          <Switch
            checked={settings.showJapaneseExample}
            onChange={(val) => onSettingsChange({ showJapaneseExample: val })}
          />
        </div>

        <div className="flex justify-between items-center">
          <Text strong>Hiện VD tiếng Việt (Mặt sau)</Text>
          <Switch
            checked={settings.showVietnameseExample}
            onChange={(val) => onSettingsChange({ showVietnameseExample: val })}
          />
        </div>

        {/* Action Buttons */}
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-4 space-y-3">
          <Button
            type="default"
            block
            danger
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => {
              if (onResetCards) {
                onResetCards();
                onClose();
              }
            }}
          >
            Khởi động lại thẻ ghi nhớ
          </Button>
          <Button
            type="default"
            block
            icon={<Shuffle className="w-4 h-4" />}
            onClick={() => {
              if (onShuffleCards) {
                onShuffleCards();
                onClose();
              }
            }}
          >
            Trộn thẻ
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FlashcardSettingsModal;
