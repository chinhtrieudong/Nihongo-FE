import React, { useRef, useEffect, useState } from "react";
import { Button, Card, Input, Space, Typography } from "antd";
import { ChevronDown } from "lucide-react";
import { formatAIText } from "../../utils/textFormatter";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  return (
    <div style={{ padding: "24px" }}>
      <Card className="w-full bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700" styles={{ body: { padding: 12 } }}>
        <div className="mb-4">
          <Title level={5} className="mb-1 text-base">
            Luyện tập với AI theo bài Minna
          </Title>
          <Text className="text-sm text-gray-700 dark:text-secondary-400">
            Hãy thực hành hội thoại theo ngữ pháp của bài {lessonNumber}
          </Text>
        </div>

        <div className="relative">
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="h-80 border border-secondary-200 dark:border-secondary-700 rounded-lg p-3 overflow-y-auto mb-3"
            style={{ backgroundColor: "var(--ant-color-bg-container)" }}
          >
            {aiMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Text className="text-sm !text-secondary-700 dark:!text-secondary-400">
                  Bắt đầu cuộc hội thoại với AI...
                </Text>
              </div>
            ) : (
              <Space orientation="vertical" className="w-full">
                {aiMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <Card
                      className={`max-w-[85%] ${message.role === "user"
                        ? "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                        : "bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700"
                        }`}
                      size="small"
                      styles={{ body: { padding: 10 } }}
                    >
                      <Text strong className="text-sm">
                        {message.role === "user" ? "You" : "AI"}
                      </Text>
                      <div className="text-sm mt-1">
                        {message.role === "assistant" ? formatAIText(message.content) : message.content}
                      </div>
                    </Card>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <Card
                      className="max-w-[85%] bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700"
                      size="small"
                      styles={{ body: { padding: 10 } }}
                    >
                      <Text strong className="text-sm">AI</Text>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-secondary-500">AI đang tạo phản hồi...</span>
                      </div>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </Space>
            )}
          </div>
          {showScrollButton && (
            <Button
              type="default"
              shape="round"
              icon={<ChevronDown className="w-4 h-4" />}
              onClick={scrollToBottom}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              style={{ zIndex: 10 }}
            >
              Xuống dưới
            </Button>
          )}
        </div>

        <div className="flex w-full gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleAIMessage();
              }
            }}
            className="flex-1 bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-700"
            size="middle"
          />
          <Button
            type="primary"
            onClick={handleAIMessage}
            disabled={!currentMessage.trim() || aiLoading}
            loading={aiLoading}
            size="middle"
            className="shrink-0"
          >
            Gửi
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AiPracticeTab;
