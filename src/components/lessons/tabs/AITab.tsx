import React, { useState } from "react";
import {
    AI_SYSTEM_PROMPTS,
    formatPrompt,
    CONVERSATION_STARTERS,
} from "../../../services/aiService";
import { aiAPI } from "../../../services/api";
import {
    Badge, Button, Input
} from "antd";
import {
    MessageOutlined,
    AudioOutlined,
    EditOutlined,
    ReadOutlined,
    ReloadOutlined,
    BookOutlined,
    ArrowRightOutlined,
    RobotOutlined,
    BulbOutlined,
    SoundOutlined,
    TrophyOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import type { Lesson } from "../../../types/lesson";
import { formatAIText } from "../../../utils/textFormatter";

interface AITabProps {
    lesson: Lesson;
}

const AITab: React.FC<AITabProps> = ({ lesson }) => {
    const [chatMessages, setChatMessages] = useState<
        Array<{ role: "user" | "assistant"; content: string; timestamp: string }>
    >([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isChatting, setIsChatting] = useState(false);
    const [currentExercise, setCurrentExercise] = useState<any>(null);
    const [pronunciationResult, setPronunciationResult] = useState<any>(null);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [isLoadingChat, setIsLoadingChat] = useState(false);

    const startConversation = async () => {
        setIsChatting(true);
        const starter =
            CONVERSATION_STARTERS.easy[
            Math.floor(Math.random() * CONVERSATION_STARTERS.easy.length)
            ];
        setChatMessages([
            {
                role: "assistant",
                content: starter,
                timestamp: new Date().toISOString(),
            },
        ]);
    };

    const sendMessage = async () => {
        console.log("🚀 sendMessage called with inputMessage:", inputMessage);
        console.log("🚀 isLoadingChat:", isLoadingChat);

        if (!inputMessage.trim()) {
            console.log("❌ Input message is empty, returning");
            return;
        }

        console.log("✅ Input message valid, proceeding...");

        const userMessage = {
            role: "user" as const,
            content: inputMessage,
            timestamp: new Date().toISOString(),
        };

        setChatMessages((prev) => [...prev, userMessage]);
        const messageToSend = inputMessage;
        setInputMessage("");
        setIsLoadingChat(true);

        try {
            console.log("Sending message to AI:", {
                lessonId: lesson.id,
                messages: [...chatMessages, userMessage],
                context: {
                    currentLesson: lesson.title,
                    learnedVocabulary: [],
                    learnedGrammar: [],
                    difficulty: "easy",
                },
            });

            const data = await aiAPI.chat({
                lessonId: lesson.id,
                messages: [...chatMessages, userMessage],
                context: {
                    currentLesson: lesson.title,
                    learnedVocabulary: [],
                    learnedGrammar: [],
                    difficulty: "easy",
                },
            });

            console.log("AI API response:", data);

            if (data.success) {
                // Add AI response to chat
                setChatMessages((prev) => [...prev, data.data.message]);

                // Optional: Show feedback if available
                if (data.data.feedback) {
                    console.log("AI Feedback:", data.data.feedback);
                }
            } else {
                throw new Error('AI response failed');
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            message.error('Không thể gửi tin nhắn, vui lòng thử lại!');

            // Revert the user message on error
            setChatMessages((prev) => prev.slice(0, -1));
            setInputMessage(messageToSend);
        } finally {
            setIsLoadingChat(false);
        }
    };

    const startPronunciationTest = async () => {
        setActiveFeature('pronunciation');
        // Mock pronunciation test
        setPronunciationResult({
            score: 7.5,
            feedback: "Phát âm khá tốt, cần chú ý âm つ và し",
            errors: ["Âm つ chưa rõ"],
            suggestions: ["Luyện phát âm hàng ngày", "Nghe và nhại theo audio mẫu"],
        });
    };

    const startCustomExercise = async () => {
        setActiveFeature('exercise');
        setCurrentExercise({
            type: "conversation",
            prompt: "Hãy giới thiệu về bản thân bằng tiếng Nhật",
            expectedResponse: "私の名前は___です。___歳です。___から来ました。",
            difficulty: "easy",
        });
    };

    const submitExercise = async (userResponse: string) => {
        // Mock implementation for personalized exercise feature
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock successful response
            const mockResult = {
                score: Math.floor(Math.random() * 30) + 70, // 70-100 score
                feedback: userResponse.trim()
                    ? "Bài làm của bạn rất tốt! Hãy tiếp tục luyện tập nhé! 👍"
                    : "Hãy thử nhập câu trả lời của bạn trước khi nộp bài!",
                corrections: userResponse.trim() ? [] : ["Cần nhập câu trả lời"],
                explanation: "Đây là tính năng bài tập cá nhân hóa đang được phát triển."
            };

            setCurrentExercise({
                ...currentExercise,
                result: mockResult,
            });
            message.success('Bài tập đã được nộp!');
        } catch (error) {
            console.error("Failed to submit exercise:", error);
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    const aiFeatures = [
        {
            id: 'conversation',
            title: 'Hội thoại với AI',
            description: 'Thực hành giao tiếp với giáo viên AI thông minh',
            icon: <MessageOutlined />,
            color: 'from-blue-500 to-cyan-500',
            action: startConversation
        },
        {
            id: 'pronunciation',
            title: 'Kiểm tra phát âm',
            description: 'Phân tích và cải thiện phát âm tiếng Nhật',
            icon: <AudioOutlined />,
            color: 'from-green-500 to-teal-500',
            action: startPronunciationTest
        },
        {
            id: 'exercise',
            title: 'Bài tập cá nhân hóa',
            description: 'Bài tập được tạo riêng cho trình độ của bạn',
            icon: <EditOutlined />,
            color: 'from-purple-500 to-pink-500',
            action: startCustomExercise
        },
        {
            id: 'grammar',
            title: 'Giải thích ngữ pháp',
            description: 'Hiểu sâu các mẫu ngữ pháp khó',
            icon: <ReadOutlined />,
            color: 'from-orange-500 to-red-500',
            action: () => setActiveFeature('grammar')
        },
        {
            id: 'review',
            title: 'Ôn tập thông minh',
            description: 'Hệ thống ôn tập dựa trên trí nhớ',
            icon: <ReloadOutlined />,
            color: 'from-indigo-500 to-purple-500',
            action: () => setActiveFeature('review')
        },
        {
            id: 'vocabulary',
            title: 'Luyện từ vựng',
            description: 'Học từ vựng theo phương pháp khoa học',
            icon: <BookOutlined />,
            color: 'from-pink-500 to-rose-500',
            action: () => setActiveFeature('vocabulary')
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                        <span className="text-3xl">🤖</span>
                        Luyện tập với AI
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                        Trợ lý AI thông minh giúp bạn học hiệu quả hơn
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        count="6 tính năng"
                        style={{ backgroundColor: '#1890ff' }}
                        className="text-sm"
                    />
                </div>
            </div>

            {/* AI Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiFeatures.map((feature) => (
                    <div
                        key={feature.id}
                        onClick={feature.action}
                        className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${activeFeature === feature.id ? 'scale-105' : ''
                            }`}
                    >
                        <div className={`bg-gradient-to-br ${feature.color} rounded-xl shadow-lg p-6 text-white h-full`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <div className="text-2xl">{feature.icon}</div>
                                </div>
                                {activeFeature === feature.id && (
                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-white/80 text-sm mb-4">{feature.description}</p>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span>Bắt đầu</span>
                                <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Feature Content */}
            {activeFeature === 'pronunciation' && pronunciationResult && (
                <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-700 dark:to-teal-700 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <AudioOutlined className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Kết quả phát âm</h3>
                                <p className="text-white/80 text-sm">Phân tích chi tiết phát âm của bạn</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                                {pronunciationResult.score}/10
                            </div>
                            <div className="text-secondary-600 dark:text-secondary-400">
                                {pronunciationResult.feedback}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">Lỗi cần sửa:</h4>
                                <ul className="space-y-2">
                                    {pronunciationResult.errors.map((error: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                            <span>•</span>
                                            <span>{error}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">Gợi ý cải thiện:</h4>
                                <ul className="space-y-2">
                                    {pronunciationResult.suggestions.map((suggestion: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                            <span>•</span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button type="primary" size="large" icon={<AudioOutlined />} className="flex-1">
                                Thử lại
                            </Button>
                            <Button size="large" icon={<SoundOutlined />} className="flex-1">
                                Nghe mẫu
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeFeature === 'conversation' && (
                <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-700 dark:to-cyan-700 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <MessageOutlined className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Hội thoại với AI</h3>
                                <p className="text-white/80 text-sm">Thực hành giao tiếp với giáo viên AI thông minh</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {!isChatting ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageOutlined className="text-3xl text-blue-600 dark:text-blue-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                                    Bắt đầu hội thoại với AI
                                </h4>
                                <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                                    Giáo viên AI sẽ giúp bạn luyện tập giao tiếp tiếng Nhật
                                </p>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<MessageOutlined />}
                                    onClick={startConversation}
                                    className="px-8"
                                >
                                    Bắt đầu hội thoại
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 h-96 overflow-y-auto">
                                    {chatMessages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}
                                        >
                                            <div
                                                className={`inline-block max-w-xs p-3 rounded-2xl ${msg.role === "user"
                                                    ? "bg-blue-500 text-white rounded-tr-none"
                                                    : "bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 rounded-tl-none border border-secondary-200 dark:border-secondary-600"
                                                    }`}
                                            >
                                                {msg.role === "assistant" ? formatAIText(msg.content) : msg.content}
                                            </div>
                                            <div className="text-xs text-secondary-500 mt-1">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoadingChat && (
                                        <div className="mb-4 text-left">
                                            <div className="inline-block max-w-xs p-3 rounded-2xl bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 rounded-tl-none border border-secondary-200 dark:border-secondary-600">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                    <span className="text-sm text-secondary-500">AI đang tạo phản hồi...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && !isLoadingChat && sendMessage()}
                                        placeholder="Nhập tin nhắn..."
                                        size="large"
                                        className="flex-1"
                                        disabled={isLoadingChat}
                                    />
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={() => {
                                            console.log("🔘 Send button clicked!");
                                            sendMessage();
                                        }}
                                        loading={isLoadingChat}
                                        disabled={!inputMessage.trim() || isLoadingChat}
                                        icon={<ArrowRightOutlined />}
                                    >
                                        Gửi
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeFeature === 'exercise' && currentExercise && (
                <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <EditOutlined className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Bài tập cá nhân hóa</h3>
                                <p className="text-white/80 text-sm">Bài tập được tạo riêng cho trình độ của bạn</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Yêu cầu:</h4>
                                <p className="text-secondary-700 dark:text-secondary-400">{currentExercise.prompt}</p>
                            </div>

                            <div>
                                <Input.TextArea
                                    placeholder="Nhập câu trả lời của bạn..."
                                    rows={4}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => submitExercise('')}
                                    className="flex-1"
                                >
                                    Nộp bài
                                </Button>
                                <Button
                                    size="large"
                                    icon={<BulbOutlined />}
                                    className="flex-1"
                                >
                                    Gợi ý
                                </Button>
                            </div>

                            {currentExercise.result && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Kết quả:</h4>
                                    <p className="text-secondary-700 dark:text-secondary-400">{currentExercise.result.feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Stats Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <RobotOutlined className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Thống kê học tập AI</h3>
                        <p className="text-white/80 text-sm">Theo dõi tiến độ học tập với trợ lý AI</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold">15</div>
                        <div className="text-sm text-white/80">Buổi hội thoại</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">8.2</div>
                        <div className="text-sm text-white/80">Điểm phát âm TB</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">23</div>
                        <div className="text-sm text-white/80">Bài tập hoàn thành</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">92%</div>
                        <div className="text-sm text-white/80">Độ chính xác</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITab;
