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
import { minnaAPI } from "../../services/api";

const { Title, Text } = Typography;

// Main Mondai item
interface MondaiItem {
  _id: string;
  lessonId: string;
  textbook: string;
  lessonNumber: number;
  mondaiNumber: number;
  type: "multiple-choice" | "fill-blank" | "listening";
  question: string;
  questionJp: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  explanationJp: string;
  audioUrl: string;
  pageReference: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchMondaiData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        const response = await minnaAPI.getMondai(parseInt(lessonNumber));
        
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

  const handleSubmit = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setUserAnswer('');
    setShowResult(false);
  };

  const isCorrect = userAnswer === mondaiData?.data[activeIndex]?.correctAnswer;

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

  if (error || !mondaiData || !mondaiData.data.length) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Không có dữ liệu"}
          description={error || "Không có dữ liệu bài tập cho bài học này."}
          size="default"
          action={{
            label: "Quay lại Practice",
            onClick: () => navigate("/practice"),
          }}
        />
      </div>
    );
  }

  const { data: mondaiItems } = mondaiData;
  const lesson = { lessonNumber: Number(lessonNumber), title: `Lesson ${lessonNumber}`, title_jp: `第${lessonNumber}課`, level: 'N5', book: 'Minna no Nihongo' };
  const activeMondai = mondaiItems[activeIndex];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
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
                setShowResult(false);
                setUserAnswer('');
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
                setShowResult(false);
                setUserAnswer('');
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
              <Tag color={activeMondai.type === "multiple-choice" ? "blue" : activeMondai.type === "listening" ? "green" : "purple"}>
                {activeMondai.type === "multiple-choice" ? (
                  <span className="flex items-center gap-1">Trắc nghiệm</span>
                ) : activeMondai.type === "listening" ? (
                  <span className="flex items-center gap-1"><Headphones className="w-3 h-3" /> Nghe</span>
                ) : (
                  <span className="flex items-center gap-1">Điền vào chỗ trống</span>
                )}
              </Tag>
            </div>
            <Text strong className="text-text-main block text-lg">Bài {activeMondai.mondaiNumber}</Text>
            <Text className="text-text-sub block">Độ khó: {activeMondai.difficulty}</Text>
          </div>

          {/* Audio Player */}
          {activeMondai.audioUrl && (
            <div className="mb-4">
              <AudioPlayer src={activeMondai.audioUrl} />
            </div>
          )}

          {/* Score display */}
          {showResult && (
            <Card className="mb-4 bg-success/10 border-success/30">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-success" />
                <div>
                  <Text strong className={isCorrect ? "text-lg text-success" : "text-lg text-error"}>
                    {isCorrect ? "Chính xác!" : "Chưa chính xác"}
                  </Text>
                  <Text className="text-text-sub block">
                    Đáp án đúng: {activeMondai.correctAnswer}
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Question */}
          <div className="mb-4">
            <Text strong className="text-text-main block text-base mb-2">{activeMondai.question}</Text>
            {activeMondai.questionJp && (
              <Text className="text-text-sub block italic">{activeMondai.questionJp}</Text>
            )}
          </div>

          {/* Options for multiple-choice */}
          {activeMondai.type === "multiple-choice" && (
            <div className="space-y-2">
              {activeMondai.options.map((option) => (
                <Radio
                  key={option}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={showResult}
                  className="block w-full"
                >
                  {option}
                </Radio>
              ))}
            </div>
          )}

          {/* Input for fill-blank */}
          {activeMondai.type === "fill-blank" && (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              disabled={showResult}
              className="w-full"
            />
          )}

          {/* Explanation */}
          {showResult && activeMondai.explanation && (
            <div className="mt-4 p-3 bg-secondary-50 dark:bg-secondary-800 rounded">
              <Text strong className="text-text-main block mb-1">Giải thích:</Text>
              <Text className="text-text-sub">{activeMondai.explanation}</Text>
              {activeMondai.explanationJp && (
                <Text className="text-text-sub block mt-1 italic">{activeMondai.explanationJp}</Text>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-center gap-3 mt-4">
            {!showResult ? (
              <Button
                type="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={handleSubmit}
                disabled={!userAnswer}
              >
                Nộp bài
              </Button>
            ) : (
              <Button onClick={handleReset}>
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
