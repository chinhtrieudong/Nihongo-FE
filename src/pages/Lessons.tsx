import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { lessonAPI } from "../services/api";
import type {
  Lesson,
  LessonDetail,
  VocabularyItem,
  GrammarPattern,
  Dialog,
  Exercise,
  UserProgress
} from "../types/lesson";
import {
  useChatMutation,
  useAnalyzePronunciationMutation,
  useSubmitExerciseMutation,
} from "../services/aiService";
import {
  AI_SYSTEM_PROMPTS,
  formatPrompt,
  CONVERSATION_STARTERS,
} from "../services/aiService";
import {
  Card,
  Tabs,
  Tag,
  Button,
  Progress,
  Space,
  Typography,
  Avatar,
  Spin,
  Empty,
  List,
  Divider
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  EditOutlined,
  ReadOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LeftOutlined,
  RightOutlined,
  AudioOutlined,
  BulbOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

type TabType =
  | "vocabulary"
  | "grammar"
  | "dialog"
  | "exercises"
  | "ai"
  | "summary";

const Lessons: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("vocabulary");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadLessons();
    }
  }, [currentUser]);

  useEffect(() => {
    if (lessonId && lessons.length > 0) {
      const lesson = lessons.find((l) => l.id === lessonId);
      if (lesson) {
        setSelectedLesson(lesson);
      }
    } else if (lessons.length > 0 && !selectedLesson) {
      setSelectedLesson(lessons[0]);
    }
  }, [lessonId, lessons]);

  useEffect(() => {
    if (selectedLesson) {
      loadLessonDetail(selectedLesson.id);
      // Update URL if not already set
      if (lessonId !== selectedLesson.id) {
        navigate(`/lessons/${selectedLesson.id}`);
      }
    }
  }, [selectedLesson, navigate]);

  const loadLessons = async () => {
    try {
      const response = await lessonAPI.getLessons(currentUser?.id);
      if (response.success && response.data) {
        setLessons(response.data.lessons);
        // Auto-select first lesson
        if (response.data.lessons.length > 0 && !selectedLesson) {
          setSelectedLesson(response.data.lessons[0]);
        }
      } else {
        console.error("API response missing success or data:", response);
        setLessons([]);
      }
    } catch (error) {
      console.error("Failed to load lessons:", error);
      setLessons([]);
    }
  };

  const loadLessonDetail = async (lessonId: string) => {
    setLoading(true);
    try {
      const response = await lessonAPI.getLessonDetail(
        lessonId,
        currentUser?.id
      );
      if (response.success && response.data) {
        setLessonDetail(response.data);
      } else {
        console.error(
          "API response missing success for lesson detail:",
          response
        );
      }
    } catch (error) {
      console.error("Failed to load lesson detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✔";
      case "in_progress":
        return "🔄";
      case "review":
        return "🔄";
      default:
        return "⏳";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      case "review":
        return "text-orange-600";
      default:
        return "text-gray-400";
    }
  };

  const tabs = [
    { id: "vocabulary" as TabType, label: "📚 Từ vựng", icon: "📚" },
    { id: "grammar" as TabType, label: "📘 Ngữ pháp", icon: "📘" },
    { id: "dialog" as TabType, label: "💬 Hội thoại", icon: "💬" },
    { id: "exercises" as TabType, label: "✍ Bài tập", icon: "✍" },
    { id: "ai" as TabType, label: "🤖 Luyện AI", icon: "🤖" },
    { id: "summary" as TabType, label: "📝 Tổng kết", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedLesson && lessonDetail ? (
        <>
          {/* Lesson Header */}
          <Card className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <Title level={2}>
                  Lesson {selectedLesson.lessonNumber}: {selectedLesson.title}
                </Title>
                <Text type="secondary">
                  {selectedLesson.description}
                </Text>
              </div>
              <Tag color={selectedLesson.level === 'N5' ? 'green' : selectedLesson.level === 'N4' ? 'blue' : selectedLesson.level === 'N3' ? 'orange' : 'red'}>
                {selectedLesson.level}
              </Tag>
            </div>
          </Card>

          {/* Progress Bar */}
          {lessonDetail.userProgress && (
            <Card className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Text strong>Tiến độ: {lessonDetail.lesson.progress}%</Text>
                <Text type="secondary">
                  {lessonDetail.lesson.status === "completed"
                    ? "Hoàn thành"
                    : lessonDetail.lesson.status === "in_progress"
                      ? "Đang học"
                      : "Chưa bắt đầu"}
                </Text>
              </div>
              <Progress
                percent={lessonDetail.lesson.progress}
                strokeColor="#52c41a"
                showInfo={false}
              />
            </Card>
          )}

          {/* Tabs */}
          <Card>
            <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as TabType)}>
              <Tabs.TabPane tab="📚 Từ vựng" key="vocabulary">
                <VocabularyTab vocabulary={lessonDetail.vocabularies} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="📘 Ngữ pháp" key="grammar">
                <GrammarTab grammar={lessonDetail.grammars} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="💬 Hội thoại" key="dialog">
                <DialogTab dialogs={lessonDetail.dialogs} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="✍ Bài tập" key="exercises">
                <ExercisesTab
                  exercises={lessonDetail.exercises}
                  lessonId={selectedLesson.id}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="🤖 Luyện AI" key="ai">
                <AITab lesson={lessonDetail.lesson} />
              </Tabs.TabPane>
              <Tabs.TabPane tab="📝 Tổng kết" key="summary">
                <SummaryTab lessonDetail={lessonDetail} />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </>
      ) : (
        <Spin size="large" className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Title level={3}>Đang tải bài học...</Title>
          </div>
        </Spin>
      )}
    </div>
  );
};

// Tab Components
const VocabularyTab: React.FC<{ vocabulary: any[] }> = ({ vocabulary }) => {
  const [currentCard, setCurrentCard] = useState(0);
  // ... rest of the code remains the same ...
  const [showMeaning, setShowMeaning] = useState(false);

  if (vocabulary.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 dark:text-secondary-400">
          Chưa có từ vựng cho bài học này.
        </p>
      </div>
    );
  }

  const card = vocabulary[currentCard];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Từ vựng</h2>

      {/* Flashcard */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="text-sm text-secondary-500">
            {currentCard + 1} / {vocabulary.length}
          </div>

          <div className="text-4xl font-bold text-primary-600 mb-4">
            {card.kanji}
          </div>

          <div className="text-xl text-secondary-700 dark:text-secondary-300 mb-4">
            {card.hiragana}
          </div>

          <div className="text-lg text-secondary-600 dark:text-secondary-400 mb-6">
            {card.romaji}
          </div>

          {showMeaning && (
            <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6 space-y-3">
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {card.meaningVi}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {card.meaningEn}
              </div>
              {card.mnemonic && (
                <div className="text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800 p-3 rounded-lg">
                  💡 {card.mnemonic}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className="text-sm text-secondary-500 hover:text-secondary-700"
          >
            {showMeaning ? "Ẩn nghĩa" : "Hiện nghĩa"}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() =>
            setCurrentCard((prev) =>
              prev > 0 ? prev - 1 : vocabulary.length - 1
            )
          }
          className="btn-secondary"
        >
          ← Trước
        </button>
        <button
          onClick={() =>
            setCurrentCard((prev) =>
              prev < vocabulary.length - 1 ? prev + 1 : 0
            )
          }
          className="btn-primary"
        >
          Tiếp →
        </button>
      </div>

      {/* Vocabulary List */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Danh sách từ vựng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabulary.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                setCurrentCard(index);
                setShowMeaning(false);
              }}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${index === currentCard
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-secondary-200 dark:border-secondary-700 hover:border-primary-300"
                }`}
            >
              <div className="font-semibold text-primary-600">{item.kanji}</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {item.meaningVi}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GrammarTab: React.FC<{ grammar: any[] }> = ({ grammar }) => {
  if (grammar.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 dark:text-secondary-400">
          Chưa có ngữ pháp cho bài học này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Ngữ pháp</h2>

      {grammar.map((item, index) => (
        <div
          key={item.id}
          className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center mb-4">
            <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
              Mẫu {index + 1}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-2">
                {item.pattern}
              </h3>
              <p className="text-secondary-700 dark:text-secondary-300">
                {item.meaning}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                Tình huống sử dụng:
              </h4>
              <p className="text-secondary-600 dark:text-secondary-400">
                {item.usageContext}
              </p>
            </div>

            {item.examples && item.examples.length > 0 && (
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">
                  Ví dụ:
                </h4>
                <div className="space-y-2">
                  {item.examples.map((example: string, i: number) => (
                    <div
                      key={i}
                      className="bg-secondary-50 dark:bg-secondary-800 p-3 rounded"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const DialogTab: React.FC<{ dialogs: any[] }> = ({ dialogs }) => {
  const [showRomaji, setShowRomaji] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  if (dialogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 dark:text-secondary-400">
          Chưa có hội thoại cho bài học này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Hội thoại</h2>

      {/* Controls */}
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showRomaji}
            onChange={(e) => setShowRomaji(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Hiện romaji</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={(e) => setShowTranslation(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Hiện bản dịch</span>
        </label>
      </div>

      {dialogs.map((dialog) => (
        <div
          key={dialog.id}
          className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-4">{dialog.title}</h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {dialog.scenario}
          </p>

          <div className="space-y-4">
            {dialog.lines.map((line: any, index: number) => (
              <div key={index} className="flex space-x-4">
                <div className="font-medium text-primary-600 min-w-[60px]">
                  {line.speaker}:
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{line.japanese}</div>
                  {showRomaji && (
                    <div className="text-sm text-secondary-600 dark:text-secondary-400 italic">
                      {line.romaji}
                    </div>
                  )}
                  {showTranslation && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {line.vietnamese}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ExercisesTab: React.FC<{ exercises: any[]; lessonId: string }> = ({
  exercises,
  lessonId,
}) => {
  const { currentUser } = useAppSelector((state) => state.user);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [results, setResults] = useState<Record<string, any>>({});

  const submitAnswer = async (exerciseId: string, answer: any) => {
    if (!currentUser) return;

    try {
      const response = await lessonAPI.submitExercise(
        lessonId!,
        exerciseId,
        currentUser.id,
        answer
      );
      if (response.success) {
        setResults((prev) => ({
          ...prev,
          [exerciseId]: response.data,
        }));
      }
    } catch (error) {
      console.error("Failed to submit exercise:", error);
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 dark:text-secondary-400">
          Chưa có bài tập cho bài học này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Bài tập</h2>

      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
          <p className="text-secondary-700 dark:text-secondary-300 mb-4">
            {exercise.question}
          </p>

          {exercise.type === "multiple_choice" && (
            <div className="space-y-2">
              {exercise.content.options.map((option: string, index: number) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`exercise-${exercise.id}`}
                    value={option}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [exercise.id]: e.target.value,
                      }))
                    }
                    className="text-primary-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {exercise.type === "fill_blank" && (
            <div className="space-y-2">
              <p className="font-mono text-lg">
                {exercise.content.sentence
                  .split("___")
                  .map((part: string, index: number, array: string[]) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <input
                          type="text"
                          className="border-b-2 border-primary-600 mx-1 px-2 py-1 w-20 text-center"
                          onChange={(e) => {
                            const currentAnswers = answers[exercise.id] || [];
                            currentAnswers[index] = e.target.value;
                            setAnswers((prev) => ({
                              ...prev,
                              [exercise.id]: currentAnswers,
                            }));
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={() => submitAnswer(exercise.id, answers[exercise.id])}
              className="btn-primary"
              disabled={!answers[exercise.id]}
            >
              Nộp bài
            </button>

            {results[exercise.id] && (
              <div
                className={`text-sm ${results[exercise.id].isCorrect
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {results[exercise.id].isCorrect ? "✓ Đúng" : "✗ Sai"} (+
                {results[exercise.id].score} điểm)
              </div>
            )}
          </div>

          {results[exercise.id] && (
            <div className="mt-4 p-4 bg-secondary-50 dark:bg-secondary-800 rounded">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {results[exercise.id].explanation}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AITab: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; timestamp: string }>
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [pronunciationResult, setPronunciationResult] = useState<any>(null);

  const [chatMutation] = useChatMutation();
  const [pronunciationMutation] = useAnalyzePronunciationMutation();
  const [exerciseMutation] = useSubmitExerciseMutation();

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
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      const response = await chatMutation({
        userId: "user123", // Replace with actual user ID
        lessonId: lesson.id,
        messages: [...chatMessages, userMessage],
        context: {
          currentLesson: lesson.title,
          learnedVocabulary: [],
          learnedGrammar: [],
          difficulty: "easy",
        },
      });

      if (response.data?.success) {
        setChatMessages((prev) => [...prev, response.data.data.message]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const startPronunciationTest = async () => {
    // Mock pronunciation test
    setPronunciationResult({
      score: 7.5,
      feedback: "Phát âm khá tốt, cần chú ý âm つ và し",
      errors: ["Âm つ chưa rõ"],
      suggestions: ["Luyện phát âm hàng ngày", "Nghe và nhại theo audio mẫu"],
    });
  };

  const startCustomExercise = async () => {
    setCurrentExercise({
      type: "conversation",
      prompt: "Hãy giới thiệu về bản thân bằng tiếng Nhật",
      expectedResponse: "私の名前は___です。___歳です。___から来ました。",
      difficulty: "easy",
    });
  };

  const submitExercise = async (userResponse: string) => {
    try {
      const response = await exerciseMutation({
        userId: "user123",
        lessonId: lesson.id,
        exerciseType: "conversation",
        prompt: currentExercise.prompt,
        userResponse,
      });

      if (response.data?.success) {
        setCurrentExercise({
          ...currentExercise,
          result: response.data.data,
        });
      }
    } catch (error) {
      console.error("Failed to submit exercise:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Luyện tập với AI</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Chat */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            🤖 Hội thoại với AI
          </h3>

          {!isChatting ? (
            <div className="space-y-4">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Bắt đầu hội thoại với thầy giáo AI để luyện tập tiếng Nhật
              </p>
              <button
                onClick={startConversation}
                className="btn-primary w-full"
              >
                🗣 Bắt đầu hội thoại
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 h-64 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"
                      }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${msg.role === "user"
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                        : "bg-secondary-200 dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100"
                        }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-xs text-secondary-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button onClick={sendMessage} className="btn-primary">
                  Gửi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Features */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📝 Các tính năng AI</h3>

            <div className="space-y-3">
              <button
                onClick={startPronunciationTest}
                className="btn-secondary w-full text-left p-3"
              >
                🎤 Kiểm tra phát âm
              </button>
              <button
                onClick={startCustomExercise}
                className="btn-secondary w-full text-left p-3"
              >
                🧠 Bài tập cá nhân hóa
              </button>
              <button className="btn-secondary w-full text-left p-3">
                ❓ Giải thích ngữ pháp
              </button>
              <button className="btn-secondary w-full text-left p-3">
                📚 Ôn tập thông minh
              </button>
            </div>
          </div>

          {/* Pronunciation Result */}
          {pronunciationResult && (
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">🎤 Kết quả phát âm</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Điểm số:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {pronunciationResult.score}/10
                  </span>
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  {pronunciationResult.feedback}
                </div>
                {pronunciationResult.errors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Lỗi cần sửa:</span>
                    <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                      {pronunciationResult.errors.map(
                        (error: string, index: number) => (
                          <li key={index}>{error}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium">Gợi ý cải thiện:</span>
                  <ul className="list-disc list-inside text-sm text-green-600 mt-1">
                    {pronunciationResult.suggestions.map(
                      (suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Custom Exercise */}
          {currentExercise && (
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">🧠 Bài tập</h3>
              <div className="space-y-4">
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {currentExercise.prompt}
                </p>
                <input
                  type="text"
                  placeholder="Nhập câu trả lời của bạn..."
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) =>
                    e.key === "Enter" && submitExercise(e.currentTarget.value)
                  }
                />
                <button
                  onClick={(event) =>
                    submitExercise((event.target as HTMLInputElement).value)
                  }
                  className="btn-primary"
                >
                  Nộp bài
                </button>

                {currentExercise.result && (
                  <div className="mt-4 p-3 bg-secondary-50 dark:bg-secondary-800 rounded">
                    <div className="text-sm font-medium">Kết quả:</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                      {currentExercise.result.feedback}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryTab: React.FC<{ lessonDetail: LessonDetail }> = ({
  lessonDetail,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Tổng kết bài học</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📚 Từ vựng trọng tâm</h3>
          <div className="space-y-2">
            {lessonDetail.vocabularies.slice(0, 5).map((vocab: VocabularyItem) => (
              <div key={vocab.id} className="flex justify-between">
                <span className="font-medium">{vocab.kanji}</span>
                <span className="text-secondary-600 dark:text-secondary-400">
                  {vocab.meaningVi}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📘 Ngữ pháp chính</h3>
          <div className="space-y-2">
            {lessonDetail.grammars.slice(0, 3).map((gram: GrammarPattern) => (
              <div key={gram.id}>
                <div className="font-medium text-primary-600">
                  {gram.pattern}
                </div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  {gram.meaning}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Điểm yếu cần ôn tập</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
            <span>Trợ từ は/が</span>
            <span className="text-red-600">Cần ôn tập</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <span>Động từ thể ます</span>
            <span className="text-yellow-600">Ôn lại</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button className="btn-primary">🔄 Ôn tập thông minh</button>
        <button className="btn-secondary">➡️ Bài tiếp theo</button>
      </div>
    </div>
  );
};

export default Lessons;
