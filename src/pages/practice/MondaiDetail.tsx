import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Tag,
  Spin,
  Radio,
  Space,
  Input,
} from "antd";
import { EmptyState, LessonNavigation } from "../../components/common";
import {
  ArrowLeft,
  PenTool,
  CheckCircle,
  Headphones,
  MessageSquare,
  Trophy,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import AudioPlayer from "../../components/AudioPlayer";
import { minaApi } from "../../services/api";

const { Title, Text } = Typography;

// Types for listening comprehension
interface ListeningItem {
  question: string;
  question_translation: string;
  type: "fill_blank";
  correct_answer: string;
  correct_answer_translation: string;
  explanation: string;
}

// Types for dialogue comprehension
interface DialogueContent {
  speaker: string;
  japanese: string;
  translation: string;
}

interface DialogueQuestion {
  question: string;
  type: "multiple_choice";
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface DialogueItem {
  dialogue_number: number;
  content: DialogueContent[];
  questions: DialogueQuestion[];
}

// Main Mondai item
interface MondaiItem {
  id: string;
  title: string;
  type: "listening_comprehension" | "dialogue_comprehension";
  description: string;
  instructions: string;
  audioUrl: string;
  items?: ListeningItem[];
  dialogues?: DialogueItem[];
  characters?: string[];
}

interface LessonInfo {
  lessonNumber: number;
  title: string;
  title_jp: string;
  level: string;
  book: string;
}

interface MondaiResponse {
  success: boolean;
  data: MondaiItem[];
  lesson: LessonInfo;
  total_items: number;
  component: string;
  lesson_number: number;
}

const MondaiDetail: React.FC = () => {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mondaiData, setMondaiData] = useState<MondaiResponse | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [expandedDialogues, setExpandedDialogues] = useState<number[]>([]);
  const [selectedLineKey, setSelectedLineKey] = useState<string | null>(null);
  const [visibleTranslations, setVisibleTranslations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchMondaiData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        const response = await minaApi.get<MondaiResponse>(`/${lessonNumber}/mondai`);
        
        if (response.data.success) {
          setMondaiData(response.data);
        } else {
          setError("Không thể tải bài tập");
        }
      } catch (err) {
        console.error("Error fetching mondai:", err);
        setError("Không thể tải dữ liệu bài tập");
      } finally {
        setLoading(false);
      }
    };

    fetchMondaiData();
  }, [lessonNumber]);

  const handleAnswer = (questionKey: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionKey]: answer }));
  };

  const calculateScore = () => {
    if (!mondaiData) return { correct: 0, total: 0 };
    let correct = 0;
    let total = 0;

    const activeMondai = mondaiData.data[activeIndex];
    
    if (activeMondai.type === "listening_comprehension" && activeMondai.items) {
      activeMondai.items.forEach((item, idx) => {
        total++;
        const key = `${activeMondai.id}_item_${idx}`;
        if (userAnswers[key]?.toLowerCase().trim() === item.correct_answer.toLowerCase().trim()) {
          correct++;
        }
      });
    } else if (activeMondai.type === "dialogue_comprehension" && activeMondai.dialogues) {
      activeMondai.dialogues.forEach((dialogue, dIdx) => {
        dialogue.questions.forEach((q, qIdx) => {
          total++;
          const key = `${activeMondai.id}_dialogue_${dIdx}_q_${qIdx}`;
          if (userAnswers[key] === q.correct_answer) {
            correct++;
          }
        });
      });
    }

    return { correct, total };
  };

  const toggleDialogue = (idx: number) => {
    setExpandedDialogues(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const toggleTranslation = (key: string) => {
    setVisibleTranslations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  if (error || !mondaiData || !mondaiData.data.length) {
    return (
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Không có dữ liệu"}
          description={error || "Không có dữ liệu bài tập cho bài học này."}
          action={{
            label: "Quay lại Practice",
            onClick: () => navigate("/practice"),
          }}
        />
      </div>
    );
  }

  const { lesson, data: mondaiItems } = mondaiData;
  const activeMondai = mondaiItems[activeIndex];
  const { correct, total } = calculateScore();

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Button
            onClick={() => navigate("/practice")}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Quay lại
          </Button>
          
          <LessonNavigation
            currentLesson={Number(lessonNumber)}
            totalLessons={50}
            onPrev={() => navigate(`/practice/mondai/${Number(lessonNumber) - 1}`)}
            onNext={() => navigate(`/practice/mondai/${Number(lessonNumber) + 1}`)}
            onSelectLesson={(value) => navigate(`/practice/mondai/${value}`)}
          />
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {lesson.lessonNumber}
          </div>
          <div className="flex-1 min-w-0">
            <Title level={4} className="!mb-0 !text-text-main truncate">
              {lesson.title}
            </Title>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <Text className="text-text-sub">{lesson.title_jp} • {lesson.level}</Text>
              <Tag color="blue" className="text-xs px-2 py-0.5">{lesson.book}</Tag>
              <Tag className="text-xs px-2 py-0.5 flex items-center gap-1">
                <PenTool className="w-3 h-3" />
                {mondaiItems.length} bài tập
              </Tag>
            </div>
          </div>
        </div>

        {/* Navigation between mondai items */}
        {mondaiItems.length > 1 && (
          <div className="flex justify-between items-center mb-3">
            <Button
              size="small"
              disabled={activeIndex === 0}
              onClick={() => {
                setActiveIndex(prev => prev - 1);
                setShowResults(false);
                setUserAnswers({});
              }}
            >
              Bài trước
            </Button>
            <Text className="text-text-sub">
              {activeIndex + 1} / {mondaiItems.length}
            </Text>
            <Button
              size="small"
              disabled={activeIndex === mondaiItems.length - 1}
              onClick={() => {
                setActiveIndex(prev => prev + 1);
                setShowResults(false);
                setUserAnswers({});
              }}
            >
              Bài sau
            </Button>
          </div>
        )}

        {/* Active Mondai */}
        <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
          {/* Mondai Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag color={activeMondai.type === "listening_comprehension" ? "blue" : "purple"}>
                {activeMondai.type === "listening_comprehension" ? (
                  <span className="flex items-center gap-1"><Headphones className="w-3 h-3" /> Nghe</span>
                ) : (
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Hội thoại</span>
                )}
              </Tag>
            </div>
            <Text strong className="text-text-main block text-lg">{activeMondai.title}</Text>
            <Text className="text-text-sub block">{activeMondai.description}</Text>
            <Text className="text-text-sub text-sm block mt-1 italic">💡 {activeMondai.instructions}</Text>
          </div>

          {/* Audio Player */}
          {activeMondai.audioUrl && (
            <div className="mb-4">
              <AudioPlayer src={activeMondai.audioUrl} />
            </div>
          )}

          {/* Score display */}
          {showResults && total > 0 && (
            <Card className="mb-4 bg-success/10 border-success/30">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-success" />
                <div>
                  <Text strong className="text-lg text-success">Kết quả: {correct}/{total}</Text>
                  <Text className="text-text-sub block">
                    Đúng {Math.round((correct / total) * 100)}%
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Listening Comprehension */}
          {activeMondai.type === "listening_comprehension" && activeMondai.items && (
            <div className="space-y-3">
              {activeMondai.items.map((item, idx) => {
                const key = `${activeMondai.id}_item_${idx}`;
                const userAnswer = userAnswers[key] || "";
                const isCorrect = userAnswer.toLowerCase().trim() === item.correct_answer.toLowerCase().trim();

                return (
                  <Card
                    key={idx}
                    className={`border-border ${showResults ? (isCorrect ? "border-success" : "border-error") : ""}`}
                    styles={{ body: { padding: '12px 16px' } }}
                  >
                    <div className="mb-3">
                      <Tag color="blue" className="mb-2">Câu {idx + 1}</Tag>
                      <Text strong className="text-text-main block text-base">{item.question}</Text>
                    </div>

                    {!showResults ? (
                      <Input
                        value={userAnswer}
                        onChange={(e) => handleAnswer(key, e.target.value)}
                        placeholder="Nhập câu trả lời của bạn..."
                        className="w-full"
                      />
                    ) : (
                      <div className="space-y-2">
                        <div className={`p-2 rounded ${isCorrect ? "bg-success/10" : "bg-error/10"}`}>
                          <Text strong className={isCorrect ? "text-success" : "text-error"}>
                            Câu trả lời của bạn: {userAnswer || "(trống)"}
                          </Text>
                        </div>
                        {!isCorrect && (
                          <div className="p-2 bg-info/10 rounded">
                            <Text strong className="text-info">Đáp án: {item.correct_answer}</Text>
                          </div>
                        )}
                        <div className="p-2 bg-secondary-50 dark:bg-secondary-800 rounded text-sm">
                          <Text strong>Giải thích:</Text> {item.explanation}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Dialogue Comprehension */}
          {activeMondai.type === "dialogue_comprehension" && activeMondai.dialogues && (
            <div className="space-y-4">
              {/* Characters */}
              <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-text-sub" />
                  <Text strong className="text-text-main">Nhân vật</Text>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(activeMondai.characters || Array.from(new Set(activeMondai.dialogues.flatMap(d => d.content.map(c => c.speaker))))).map((char) => {
                    const speakerColors: Record<string, { bg: string; text: string; border: string }> = {
                      A: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
                      B: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
                      C: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
                    };
                    const colors = speakerColors[char] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
                    return (
                      <Tag
                        key={char}
                        className={`${colors.bg} ${colors.text} ${colors.border} !border !px-3 !py-1 !text-sm !font-medium`}
                      >
                        {char}
                      </Tag>
                    );
                  })}
                </div>
              </Card>

              {activeMondai.dialogues.map((dialogue, dIdx) => (
                <Card key={dIdx} className="border-border" styles={{ body: { padding: '12px 16px' } }}>
                  {/* Dialogue Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-3"
                    onClick={() => toggleDialogue(dIdx)}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-text-sub" />
                      <Text strong>Hội thoại {dialogue.dialogue_number}</Text>
                    </div>
                    {expandedDialogues.includes(dIdx) ? (
                      <ChevronUp className="w-4 h-4 text-text-sub" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-sub" />
                    )}
                  </div>

                  {/* Dialogue Content - Improved UX */}
                  {expandedDialogues.includes(dIdx) && (
                    <div className="mb-4 p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                      <div className="text-xs text-text-sub/60 mb-3 italic">💡 Click vào câu để xem nghĩa</div>
                      <div className="space-y-2 max-w-2xl">
                        {dialogue.content.map((line, lIdx) => {
                          const lineKey = `${dIdx}_${lIdx}`;
                          const isSelected = selectedLineKey === lineKey;
                          const showTranslation = visibleTranslations.has(lineKey);

                          return (
                            <div
                              key={lIdx}
                              onClick={() => {
                                setSelectedLineKey(lineKey);
                                toggleTranslation(lineKey);
                              }}
                              className={`
                                flex gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 border
                                ${isSelected
                                  ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-400 border-green-200 dark:border-green-700'
                                  : 'bg-white dark:bg-secondary-800 border-gray-200 dark:border-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-700'
                                }
                              `}
                            >
                              {/* Speaker Avatar */}
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-300">
                                  {line.speaker}
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`
                                  text-base font-medium leading-relaxed text-gray-900 dark:text-gray-100
                                  ${isSelected ? 'text-green-900 dark:text-green-200' : ''}
                                `}>
                                  {line.japanese}
                                </p>

                                {/* Translation - Toggleable */}
                                <div className={`
                                  overflow-hidden transition-all duration-300
                                  ${showTranslation ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}
                                `}>
                                  <div className="pt-2 border-t border-primary-200 dark:border-primary-800">
                                    <p className="text-sm text-text-sub">
                                      {line.translation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  <div className="space-y-3">
                    {dialogue.questions.map((question, qIdx) => {
                      const key = `${activeMondai.id}_dialogue_${dIdx}_q_${qIdx}`;
                      const userAnswer = userAnswers[key];
                      const isCorrect = userAnswer === question.correct_answer;

                      return (
                        <div key={qIdx} className={`p-3 rounded-lg border ${showResults ? (isCorrect ? "border-success bg-success/5" : "border-error bg-error/5") : "border-border bg-surface-2"}`}>
                          <Text strong className="text-text-main block mb-2">{question.question}</Text>
                          
                          {!showResults ? (
                            <Radio.Group
                              value={userAnswer}
                              onChange={(e) => handleAnswer(key, e.target.value)}
                              className="w-full"
                            >
                              <Space direction="vertical" className="w-full">
                                {question.options.map((option) => (
                                  <Radio key={option} value={option} className="block w-full">
                                    {option}
                                  </Radio>
                                ))}
                              </Space>
                            </Radio.Group>
                          ) : (
                            <div className="space-y-2">
                              <div className={`p-2 rounded ${isCorrect ? "bg-success/10" : "bg-error/10"}`}>
                                <Text className={isCorrect ? "text-success" : "text-error"}>
                                  Bạn chọn: {userAnswer || "(chưa chọn)"}
                                </Text>
                              </div>
                              {!isCorrect && (
                                <div className="p-2 bg-info/10 rounded">
                                  <Text strong className="text-info">Đáp án đúng: {question.correct_answer}</Text>
                                </div>
                              )}
                              <div className="p-2 bg-secondary-50 dark:bg-secondary-800 rounded text-sm">
                                <Text strong>Giải thích:</Text> {question.explanation}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-center gap-3 mt-4">
            {!showResults ? (
              <Button
                type="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setShowResults(true)}
              >
                Nộp bài
              </Button>
            ) : (
              <Button onClick={() => { setShowResults(false); setUserAnswers({}); }}>
                Làm lại
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MondaiDetail;
