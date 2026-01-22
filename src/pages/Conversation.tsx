import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Card, Select, Tabs, Badge, Avatar, Typography, Space, Divider, Row, Col, message, Spin, Modal, Progress, Rate } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined, SoundOutlined, BookOutlined, MessageOutlined, StarOutlined, CheckCircleOutlined, PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { useAppSelector } from "../store/hooks";
import { lessonAPI, aiAPI } from "../services/api";
import { Dialog, DialogLine, AIRoleplayResponse } from "../types/lesson";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  romaji?: string;
  meaning?: string;
  timestamp: string;
  grammarErrors?: string[];
  pronunciationScore?: number;
  feedback?: {
    grammar: string;
    pronunciation: string;
    vocabulary: string;
  };
}

interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  scenario: string;
  aiRole: string;
  userRole: string;
  vocabulary: string[];
  grammar: string[];
}

const Conversation: React.FC = () => {
  const { currentUser: user } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("ai-practice");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [conversationId, setConversationId] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<Dialog | null>(null);
  const [dialogLineIndex, setDialogLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [scenarios] = useState<ConversationScenario[]>([
    {
      id: "1",
      title: "Đặt món nhà hàng",
      description: "Luyện tập đặt đồ ăn và thức uống tại nhà hàng Nhật",
      level: "N5",
      category: "Đời sống hàng ngày",
      difficulty: "easy",
      scenario: "Bạn đang ở nhà hàng Nhật. Nhân viên phục vụ sẽ nhận đơn hàng của bạn.",
      aiRole: "Nhân viên phục vụ",
      userRole: "Khách hàng",
      vocabulary: ["menu", "chuumon", "osusume", "nomimono", "dezaato"],
      grammar: ["~ o kudasai", "~ wa arimasu ka", "~ ni shimasu"]
    },
    {
      id: "2",
      title: "Hỏi đường",
      description: "Hỏi và chỉ đường bằng tiếng Nhật",
      level: "N5",
      category: "Du lịch",
      difficulty: "easy",
      scenario: "Bạn bị lạc ở Tokyo và cần hỏi người khác đường đi.",
      aiRole: "Người địa phương",
      userRole: "Khách du lịch",
      vocabulary: ["eki", "byouin", "suupaa", "massugu", "migi", "hidari"],
      grammar: ["~ wa doko desu ka", "~ e ikimasu", "~ de magarimasu"]
    },
    {
      id: "3",
      title: "Phỏng vấn việc làm",
      description: "Luyện tập phỏng vấn xin việc bằng tiếng Nhật",
      level: "N3",
      category: "Kinh doanh",
      difficulty: "hard",
      scenario: "Bạn đang phỏng vấn công việc tại công ty Nhật.",
      aiRole: "Người phỏng vấn",
      userRole: "Ứng viên",
      vocabulary: ["keiken", "sukiru", "tsuyomi", "yowami", "shiboudouki"],
      grammar: ["~ ta koto ga arimasu", "~ koto ga dekimasu", "~ to omoimasu"]
    },
    {
      id: "4",
      title: "Mua sắm",
      description: "Mua quần áo và hỏi về giá cả",
      level: "N5",
      category: "Đời sống hàng ngày",
      difficulty: "medium",
      scenario: "Bạn đang mua sắm tại cửa hàng bách hóa ở Nhật.",
      aiRole: "Nhân viên bán hàng",
      userRole: "Khách hàng",
      vocabulary: ["nedan", "saizu", "iro", "shichaku", "yasui"],
      grammar: ["~ wa ikura desu ka", "~ o shichaku shitemo ii desu ka", "~ wa arimasu ka"]
    },
    {
      id: "5",
      title: "Kết bạn",
      description: "Tự giới thiệu và kết bạn mới",
      level: "N4",
      category: "Xã hội",
      difficulty: "medium",
      scenario: "Bạn đang tại hội chợ câu lạc bộ đại học và muốn tham gia câu lạc bộ.",
      aiRole: "Thành viên CLB",
      userRole: "Sinh viên mới",
      vocabulary: ["shumi", "senkou", "shusshin", "suki", "issho ni"],
      grammar: ["~ wa nan desu ka", "~ ga suki desu", "~ masen ka"]
    }
  ]);

  const [sampleDialogs] = useState<Dialog[]>([
    {
      id: "1",
      title: "Tại nhà hàng",
      scenario: "Đặt món ăn tại nhà hàng Nhật",
      lines: [
        {
          speaker: "Nhân viên",
          japanese: "いらっしゃいませ。何名様ですか？",
          romaji: "Irasshaimase. Nanmei-sama desu ka?",
          vietnamese: "Chào mừng. Mấy người ạ?"
        },
        {
          speaker: "Khách hàng",
          japanese: "二人です。窓際の席をお願いします。",
          romaji: "Futari desu. Madogiwano seki o onegai shimasu.",
          vietnamese: "Hai người. Cho tôi bàn cạnh cửa sổ."
        },
        {
          speaker: "Nhân viên",
          japanese: "かしこまりました。メニューでございます。",
          romaji: "Kashikomarimashita. Menyū de gozaimasu.",
          vietnamese: "Vâng ạ. Đây là thực đơn."
        },
        {
          speaker: "Khách hàng",
          japanese: "ありがとうございます。おすすめは何ですか？",
          romaji: "Arigatō gozaimasu. Osusume wa nan desu ka?",
          vietnamese: "Cảm ơn. Món gì đặc biệt ạ?"
        }
      ]
    },
    {
      id: "2",
      title: "Hỏi đường",
      scenario: "Hỏi đường đến nhà ga",
      lines: [
        {
          speaker: "Khách du lịch",
          japanese: "すみません、駅はどこですか？",
          romaji: "Sumimasen, eki wa doko desu ka?",
          vietnamese: "Xin lỗi, nhà ga ở đâu ạ?"
        },
        {
          speaker: "Người địa phương",
          japanese: "駅ですか。この道をまっすぐ行って、二つ目の角を右に曲がってください。",
          romaji: "Eki desu ka. Kono michi o massugu itte, futatsume no kado o migi ni magatte kudasai.",
          vietnamese: "Nhà ga ạ? Đi thẳng trên con đường này, đến ngã rẽ thứ hai rồi rẽ phải."
        },
        {
          speaker: "Khách du lịch",
          japanese: "どのくらいかかりますか？",
          romaji: "Dono kurai kakarimasu ka?",
          vietnamese: "Mất bao lâu ạ?"
        },
        {
          speaker: "Người địa phương",
          japanese: "歩いて5分ぐらいです。",
          romaji: "Aruite go-fun gurai desu.",
          vietnamese: "Đi bộ khoảng 5 phút."
        }
      ]
    }
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const scenario = scenarios.find(s => s.id === selectedScenario);
      const response = await lessonAPI.aiRoleplay(
        selectedScenario || "1",
        {
          userId: user?.id || "anonymous",
          message: inputMessage,
          context: {
            currentLesson: scenario?.title || "General Conversation",
            difficulty: difficulty
          }
        }
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.response,
        romaji: response.data.romaji,
        meaning: response.data.meaning,
        timestamp: new Date().toISOString(),
        feedback: response.data.feedback
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationId(response.data.conversationId);
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Gửi tin nhắn thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = () => {
    if (!selectedScenario) {
      message.warning("Vui lòng chọn tình huống hội thoại trước.");
      return;
    }

    const scenario = scenarios.find(s => s.id === selectedScenario);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `こんにちは！${scenario?.aiRole}です。${scenario?.scenario} Let's start our conversation!`,
      romaji: "Konnichiwa! [AI Role] desu. [Scenario] Let's start our conversation!",
      meaning: "Hello! I'm the [AI Role]. [Scenario] Let's start our conversation!",
      timestamp: new Date().toISOString()
    };

    setMessages([welcomeMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const playAudio = (text: string) => {
    // Placeholder for audio playback
    message.info("Phát âm sẽ được triển khai ở đây");
  };

  const renderMessage = (msg: Message) => (
    <div
      key={msg.id}
      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`flex max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
        <Avatar
          icon={msg.role === "user" ? <UserOutlined /> : <RobotOutlined />}
          className={`${msg.role === "user" ? "ml-2" : "mr-2"}`}
        />
        <div>
          <Card
            size="small"
            className={`${msg.role === "user" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            <Text className="text-gray-900 dark:text-secondary-100">
              {msg.content}
            </Text>
            {msg.romaji && (
              <div className="mt-1">
                <Text type="secondary" className="text-xs italic">
                  {msg.romaji}
                </Text>
              </div>
            )}
            {msg.meaning && (
              <div className="mt-1">
                <Text type="secondary" className="text-xs">
                  {msg.meaning}
                </Text>
              </div>
            )}
          </Card>
          <div className="flex items-center mt-1 space-x-2">
            <Button
              type="text"
              size="small"
              icon={<SoundOutlined />}
              onClick={() => playAudio(msg.content)}
            />
            {msg.feedback && (
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => setShowFeedback(true)}
              />
            )}
            <Text type="secondary" className="text-xs">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScenarioCard = (scenario: ConversationScenario) => (
    <Card
      key={scenario.id}
      hoverable
      className={`mb-3 ${selectedScenario === scenario.id ? "border-blue-500" : ""}`}
      onClick={() => setSelectedScenario(scenario.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Title level={4} className="text-gray-900 dark:text-secondary-100 mb-2">
            {scenario.title}
          </Title>
          <Text className="text-gray-600 dark:text-secondary-400">
            {scenario.description}
          </Text>
          <div className="mt-2 flex items-center space-x-2">
            <Badge color={scenario.difficulty === "easy" ? "green" : scenario.difficulty === "medium" ? "orange" : "red"} text={scenario.difficulty} />
            <Badge color="blue" text={scenario.level} />
            <Badge color="purple" text={scenario.category} />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderDialogLine = (line: DialogLine, index: number) => (
    <div
      key={index}
      className={`p-4 rounded-lg mb-3 ${index === dialogLineIndex
        ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
        : "bg-gray-50 dark:bg-gray-800"
        }`}
    >
      <div className="flex items-center mb-2">
        <Avatar
          icon={line.speaker === "Waiter" || line.speaker === "Local" || line.speaker === "Club Member" ? <RobotOutlined /> : <UserOutlined />}
          className="mr-2"
        />
        <Text strong className="text-gray-900 dark:text-secondary-100">
          {line.speaker}
        </Text>
      </div>
      <div className="space-y-2">
        <div>
          <Text className="text-gray-900 dark:text-secondary-100">{line.japanese}</Text>
          <Button
            type="text"
            size="small"
            icon={<SoundOutlined />}
            className="ml-2"
            onClick={() => playAudio(line.japanese)}
          />
        </div>
        <Text type="secondary" className="text-sm italic">
          {line.romaji}
        </Text>
        <Text className="text-gray-600 dark:text-secondary-400">
          {line.vietnamese}
        </Text>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 bg-secondary-50 dark:bg-secondary-950 min-h-screen p-6">
      <Title level={2} className="text-gray-900 dark:text-secondary-100">
        <MessageOutlined className="mr-2" />
        Hội thoại - Luyện tập giao tiếp
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="AI Vai diễn" key="ai-practice">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card title="Chọn tình huống" className="h-full">
                <div className="mb-4">
                  <Select
                    placeholder="Chọn độ khó"
                    value={difficulty}
                    onChange={setDifficulty}
                    className="w-full mb-3"
                  >
                    <Option value="easy">Dễ</Option>
                    <Option value="medium">Trung bình</Option>
                    <Option value="hard">Khó</Option>
                  </Select>
                </div>
                <div className="scenario-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {scenarios.map(renderScenarioCard)}
                </div>
                <Button
                  type="primary"
                  block
                  className="mt-4"
                  onClick={handleStartConversation}
                  disabled={!selectedScenario}
                >
                  Bắt đầu hội thoại
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card title="Hội thoại" className="h-full">
                <div className="chat-container" style={{ height: "500px", display: "flex", flexDirection: "column" }}>
                  <div className="messages flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800 rounded-lg mb-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-secondary-400 mt-20">
                        <MessageOutlined className="text-4xl mb-4" />
                        <p>Chọn tình huống và bắt đầu luyện tập giao tiếp tiếng Nhật!</p>
                      </div>
                    ) : (
                      messages.map(renderMessage)
                    )}
                    {isLoading && (
                      <div className="flex justify-start mb-4">
                        <div className="flex">
                          <Avatar icon={<RobotOutlined />} className="mr-2" />
                          <Card size="small" className="bg-gray-100 dark:bg-gray-800">
                            <Spin size="small" />
                            <Text className="ml-2">AI đang suy nghĩ...</Text>
                          </Card>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="input-area">
                    <Space.Compact style={{ width: "100%" }}>
                      <TextArea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn bằng tiếng Nhật..."
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        disabled={!selectedScenario || isLoading}
                      />
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        disabled={!selectedScenario || isLoading || !inputMessage.trim()}
                        className="self-end"
                      >
                        Gửi
                      </Button>
                    </Space.Compact>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Ví dụ hội thoại" key="dialog-examples">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card title="Hội thoại mẫu">
                {sampleDialogs.map((dialog) => (
                  <Card
                    key={dialog.id}
                    size="small"
                    hoverable
                    className={`mb-3 ${currentDialog?.id === dialog.id ? "border-blue-500" : ""}`}
                    onClick={() => {
                      setCurrentDialog(dialog);
                      setDialogLineIndex(0);
                    }}
                  >
                    <Title level={5} className="text-gray-900 dark:text-secondary-100">
                      {dialog.title}
                    </Title>
                    <Text className="text-gray-600 dark:text-secondary-400">
                      {dialog.scenario}
                    </Text>
                  </Card>
                ))}
              </Card>
            </Col>
            <Col xs={24} md={16}>
              {currentDialog ? (
                <Card title={currentDialog.title}>
                  <div className="mb-4">
                    <Progress
                      percent={(dialogLineIndex / (currentDialog.lines?.length || 1)) * 100}
                      showInfo={false}
                    />
                  </div>
                  <div className="dialog-content">
                    {currentDialog.lines?.map((line, index) => renderDialogLine(line, index))}
                  </div>
                  <div className="controls flex justify-between mt-4">
                    <Button
                      onClick={() => setDialogLineIndex(Math.max(0, dialogLineIndex - 1))}
                      disabled={dialogLineIndex === 0}
                    >
                      Trước
                    </Button>
                    <Space>
                      <Button
                        type="primary"
                        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? "Tạm dừng" : "Phát tất cả"}
                      </Button>
                    </Space>
                    <Button
                      onClick={() => setDialogLineIndex(Math.min((currentDialog.lines?.length || 1) - 1, dialogLineIndex + 1))}
                      disabled={dialogLineIndex >= (currentDialog.lines?.length || 1) - 1}
                    >
                      Tiếp theo
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center text-gray-500 dark:text-secondary-400 mt-20">
                    <BookOutlined className="text-4xl mb-4" />
                    <p>Chọn một hội thoại từ bên trái để xem các ví dụ</p>
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Luyện tập giọng nói" key="voice-practice">
          <Card title="Luyện tập ghi âm giọng nói">
            <div className="text-center py-8">
              <div className="mb-6">
                <Title level={4} className="text-gray-900 dark:text-secondary-100">
                  Luyện phát âm của bạn
                </Title>
                <Text className="text-gray-600 dark:text-secondary-400">
                  Ghi âm giọng nói của bạn và nhận phản hồi ngay lập tức về phát âm tiếng Nhật
                </Text>
              </div>

              <div className="flex justify-center mb-6">
                <Button
                  type="primary"
                  size="large"
                  icon={isRecording ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  danger={isRecording}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                </Button>
              </div>

              {isRecording && (
                <div className="mb-6">
                  <Spin size="large" />
                  <div className="mt-2">
                    <Text>Đang ghi âm... Hãy nói rõ ràng bằng tiếng Nhật</Text>
                  </div>
                </div>
              )}

              <Card className="max-w-md mx-auto">
                <div className="space-y-4">
                  <div>
                    <Text strong>Điểm phát âm:</Text>
                    <div className="mt-2">
                      <Rate disabled defaultValue={4} />
                    </div>
                  </div>
                  <div>
                    <Text strong>Phản hồi:</Text>
                    <div className="mt-2">
                      <Text className="text-gray-600 dark:text-secondary-400">
                        Phát âm của bạn tốt! Hãy chú ý đến ngữ điệu của nguyên âm dài.
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="Phản hồi hội thoại"
        open={showFeedback}
        onCancel={() => setShowFeedback(false)}
        footer={[
          <Button key="close" onClick={() => setShowFeedback(false)}>
            Đóng
          </Button>
        ]}
      >
        <div className="space-y-4">
          <div>
            <Text strong>Ngữ pháp:</Text>
            <div className="mt-1">
              <Text>Sử dụng trợ từ và chia động từ tốt!</Text>
            </div>
          </div>
          <div>
            <Text strong>Từ vựng:</Text>
            <div className="mt-1">
              <Text>Lựa chọn từ vựng phù hợp với ngữ cảnh.</Text>
            </div>
          </div>
          <div>
            <Text strong>Phát âm:</Text>
            <div className="mt-1">
              <Text>Phát âm rõ ràng với nhịp điệu tự nhiên.</Text>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Conversation;
