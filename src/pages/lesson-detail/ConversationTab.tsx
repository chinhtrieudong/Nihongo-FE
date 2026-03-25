import React from "react";
import { Card, Space, Typography, Switch, Tag } from "antd";
import { TranslationOutlined } from "@ant-design/icons";
import type { Dialog } from "../../types/lesson";

const { Title, Text } = Typography;

type ConversationTabProps = {
  dialogs: Dialog[];
  showDialogTranslation: Record<string, boolean>;
  setShowDialogTranslation: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  renderDialogConversation: (dialog: Dialog) => React.ReactNode;
  speakEntireConversation: (dialog: Dialog, rate?: number) => void;
  lessonInfo?: {
    title?: string;
    lessonNumber?: number;
    level?: string;
  };
};

const ConversationTab: React.FC<ConversationTabProps> = ({
  dialogs,
  showDialogTranslation,
  setShowDialogTranslation,
  renderDialogConversation,
  speakEntireConversation,
  lessonInfo,
}) => {
  const renderKaiwaConversation = (dialog: Dialog, showTranslation: boolean) => {
    if (!dialog.dialogue) return null;

    return (
      <div className="space-y-6">
        {dialog.dialogue.map((line, lineIndex) => (
          <div key={lineIndex} className="flex items-start gap-4">
            {/* Speaker Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {line.speaker === "はじめまして" || line.speaker === "佐藤" || line.speaker === "山田" || line.speaker === "ミラー"
                    ? line.speaker.charAt(0)
                    : line.speaker.length > 1 ? line.speaker.charAt(0) : line.speaker}
                </span>
              </div>
            </div>

            {/* Dialogue Content */}
            <div className="flex-1 min-w-0">
              {/* Speaker Name and Role */}
              <div className="flex items-baseline gap-3 mb-2">
                <Text strong className="text-gray-900 dark:text-white text-base">
                  {line.speaker}
                </Text>
                <Text className="text-xs !text-secondary-700 dark:!text-secondary-400">
                  {line.speaker_role === "greeting" && "Lời chào"}
                  {line.speaker_role === "greeting_response" && "Trả lời lời chào"}
                  {line.speaker_role === "introduction" && "Giới thiệu"}
                  {line.speaker_role === "self_introduction" && "Tự giới thiệu"}
                  {line.speaker_role === "origin" && "Xuất xứ"}
                  {line.speaker_role === "closing" && "Kết thúc"}
                </Text>
              </div>

              {/* Japanese Text */}
              <div className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-1 font-japanese">
                {line.jpText}
              </div>

              {/* Vietnamese Translation */}
              {showTranslation && (
                <div className="text-sm text-green-600 dark:text-green-400 border-l-4 border-green-200 dark:border-green-800 pl-3">
                  {line.viTranslation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Space orientation="vertical" size="large" className="w-full">
        {dialogs.map((dialog, index) => {
          const translationKey = String(dialog.id || index);

          return (
            <Card
              key={dialog.id || index}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <div>
                    <Title level={3} className="!mb-0 text-xl !text-secondary-900 dark:!text-secondary-100">
                      {dialog.title || "Kaiwa - 会話"}
                    </Title>
                    {dialog.title_jp && (
                      <Text className="text-base !text-secondary-700 dark:!text-secondary-400">
                        {dialog.title_jp}
                      </Text>
                    )}
                  </div>
                </div>


                {dialog.setting && (
                  <Card size="small" className="mb-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <Text className="text-sm text-gray-700 dark:text-gray-300">
                      📍 <strong>Ngữ cảnh:</strong> {dialog.setting}
                    </Text>
                  </Card>
                )}

                {dialog.characters && dialog.characters.length > 0 && (
                  <Card size="small" className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">👥 Nhân vật:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dialog.characters.map((character, charIndex) => (
                        <Tag key={charIndex} color="blue">
                          {character}
                        </Tag>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Individual Audio Control for each Kaiwa Dialog - Moved to Top */}
              {dialog.audioUrl && (
                <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="space-y-3">
                    <Text strong className="text-blue-700 dark:text-blue-300 block">
                      {dialog.title || `Hội thoại ${index + 1}`}
                    </Text>
                    <Text className="block text-sm text-secondary-700 dark:text-secondary-400">
                      Nghe hội thoại để làm quen với cách giao tiếp tiếng Nhật
                    </Text>
                    <audio controls preload="metadata" className="w-full">
                      <source src={dialog.audioUrl} />
                    </audio>
                  </div>
                </Card>
              )}

              <div className="mb-4">
                {dialog.dialogue ? renderKaiwaConversation(dialog, showDialogTranslation[translationKey]) : renderDialogConversation(dialog)}
              </div>

              {(dialog.viTranslation || dialog.dialogue) && (
                <div className="mt-4">
                  <div className="inline-flex items-center gap-2">
                    <TranslationOutlined className="text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Hiển thị bản dịch
                    </span>
                    <Switch
                      checked={!!showDialogTranslation[translationKey]}
                      onChange={(checked) =>
                        setShowDialogTranslation((prev) => ({
                          ...prev,
                          [translationKey]: checked,
                        }))
                      }
                      size="small"
                    />
                  </div>
                </div>
              )}

              {/* Vocabulary Focus */}
              {dialog.vocabulary_focus && dialog.vocabulary_focus.length > 0 && (
                <Card size="small" className="mt-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">📝 Từ vựng chính:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dialog.vocabulary_focus.map((vocab, vocabIndex) => (
                      <Tag key={vocabIndex} color="orange">
                        {vocab}
                      </Tag>
                    ))}
                  </div>
                </Card>
              )}

              {/* Grammar Focus */}
              {dialog.grammar_focus && dialog.grammar_focus.length > 0 && (
                <Card size="small" className="mt-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-600 dark:text-purple-400 font-medium">📚 Ngữ pháp chính:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dialog.grammar_focus.map((grammar, grammarIndex) => (
                      <Tag key={grammarIndex} color="purple">
                        {grammar}
                      </Tag>
                    ))}
                  </div>
                </Card>
              )}

            </Card>
          );
        })}
      </Space>
    </div>
  );
};

export default ConversationTab;
