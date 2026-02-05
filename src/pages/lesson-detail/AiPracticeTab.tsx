import React from "react";
import { Button, Card, Input, Space, Typography } from "antd";

const { Title, Text } = Typography;

type AiPracticeTabProps = {
  lessonNumber?: number;
  aiMessages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  currentMessage: string;
  setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
  aiLoading: boolean;
  handleAIMessage: () => void;
};

const AiPracticeTab: React.FC<AiPracticeTabProps> = ({
  lessonNumber,
  aiMessages,
  currentMessage,
  setCurrentMessage,
  aiLoading,
  handleAIMessage,
}) => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={3} className="mb-6">
        LUYỆN VỚI AI
      </Title>
      <Card className="max-w-4xl mx-auto bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
        <div className="mb-4">
          <Title level={4} className="mb-2">
            Luyện tập với AI theo bài Minna
          </Title>
          <Text type="secondary">
            Hãy thực hành hội thoại theo ngữ pháp của bài {lessonNumber}
          </Text>
        </div>

        <div
          className="h-96 border border-secondary-200 dark:border-secondary-900 rounded-lg p-4 overflow-y-auto mb-4"
          style={{ backgroundColor: "var(--ant-color-bg-container)" }}
        >
          {aiMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Text type="secondary">Bắt đầu cuộc hội thoại với AI...</Text>
            </div>
          ) : (
            <Space orientation="vertical" className="w-full">
              {aiMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card
                    className={`max-w-md ${
                      message.role === "user"
                        ? "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                        : "bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700"
                    }`}
                    size="small"
                  >
                    <Text strong className="text-sm">
                      {message.role === "user" ? "You" : "AI"}
                    </Text>
                    <div className="text-sm mt-1">{message.content}</div>
                  </Card>
                </div>
              ))}
            </Space>
          )}
        </div>

        <Space className="w-full">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleAIMessage();
              }
            }}
            className="flex-1 bg-white dark:bg-secondary-925 border-secondary-300 dark:border-secondary-700"
            size="large"
          />
          <Button
            type="primary"
            onClick={handleAIMessage}
            disabled={!currentMessage.trim() || aiLoading}
            loading={aiLoading}
            size="large"
          >
            Gửi
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default AiPracticeTab;
