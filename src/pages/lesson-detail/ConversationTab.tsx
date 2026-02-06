import React from "react";
import { Button, Card, Space, Typography, Select } from "antd";
import { SoundOutlined, TranslationOutlined } from "@ant-design/icons";
import type { Dialog } from "../../types/lesson";

const { Title, Paragraph, Text } = Typography;

type ConversationTabProps = {
  dialogs: Dialog[];
  showDialogTranslation: Record<string, boolean>;
  setShowDialogTranslation: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  renderDialogConversation: (dialog: Dialog) => React.ReactNode;
  speakEntireConversation: (dialog: Dialog) => void;
  japaneseVoices: SpeechSynthesisVoice[];
  maleVoiceName: string;
  setMaleVoiceName: React.Dispatch<React.SetStateAction<string>>;
  femaleVoiceName: string;
  setFemaleVoiceName: React.Dispatch<React.SetStateAction<string>>;
};

const ConversationTab: React.FC<ConversationTabProps> = ({
  dialogs,
  showDialogTranslation,
  setShowDialogTranslation,
  renderDialogConversation,
  speakEntireConversation,
  japaneseVoices,
  maleVoiceName,
  setMaleVoiceName,
  femaleVoiceName,
  setFemaleVoiceName,
}) => {
  return (
    <div style={{ padding: "24px" }}>
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select
            className="w-full sm:w-64"
            size="middle"
            value={maleVoiceName || undefined}
            placeholder="Giọng Nam (A)"
            onChange={(value) => setMaleVoiceName(value)}
            options={japaneseVoices.map((voice) => ({
              label: voice.name,
              value: voice.name,
            }))}
            dropdownStyle={{ maxWidth: 320 }}
            variant="filled"
          />
          <Select
            className="w-full sm:w-64"
            size="middle"
            value={femaleVoiceName || undefined}
            placeholder="Giọng Nữ (B)"
            onChange={(value) => setFemaleVoiceName(value)}
            options={japaneseVoices.map((voice) => ({
              label: voice.name,
              value: voice.name,
            }))}
            dropdownStyle={{ maxWidth: 320 }}
            variant="filled"
          />
        </div>
      </div>
      <Space orientation="vertical" size="large" className="w-full">
        {dialogs.map((dialog, index) => {
          const translationKey = String(dialog.id || index);

          return (
            <Card
              key={dialog.id || index}
              className="bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900"
            >
              <Title level={4}>
                {dialog.title || `Hội thoại ${index + 1}`}
              </Title>
              <Paragraph style={{ color: "#374151" }} className="dark:text-secondary-400">
                {dialog.scenario || "Thực hành hội thoại theo bài học"}
              </Paragraph>
              {renderDialogConversation(dialog)}

              {dialog.viTranslation && (
                <div className="mt-4">
                  <Button
                    icon={<TranslationOutlined />}
                    onClick={() =>
                      setShowDialogTranslation((prev) => ({
                        ...prev,
                        [translationKey]: !prev[translationKey],
                      }))
                    }
                  >
                    {showDialogTranslation[translationKey]
                      ? "Ẩn nghĩa"
                      : "Xem nghĩa"}
                  </Button>

                  {showDialogTranslation[translationKey] && (
                    <Card className="mt-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <Title level={5}>Bản dịch tiếng Việt:</Title>
                      <Paragraph className="whitespace-pre-line">
                        {dialog.viTranslation}
                      </Paragraph>
                    </Card>
                  )}
                </div>
              )}

              <div className="mt-4 text-center">
                {dialog.audioUrl ? (
                  <Button
                    type="primary"
                    icon={<SoundOutlined />}
                    onClick={() => {
                      const audio = new Audio(dialog.audioUrl!);
                      audio.play().catch(() => {
                        speakEntireConversation(dialog);
                      });
                    }}
                  >
                    Nghe âm thanh
                  </Button>
                ) : (
                  <Button
                    icon={<SoundOutlined />}
                    onClick={() => speakEntireConversation(dialog)}
                  >
                    Nghe hội thoại
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </Space>
    </div>
  );
};

export default ConversationTab;
