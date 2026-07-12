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
// import { minnaAPI } from "../../services/api"; // Disabled - using local JSON data

const { Title, Text } = Typography;

// Main Mondai item
interface MondaiItem {
  id: number;
  type: "fill_blank" | "multiple_choice" | "translation" | "matching";
  question: string;
  japanese?: string;
  romaji?: string;
  vietnamese?: string;
  answer: string | number;
  options?: string[];
  explanation: string;
  pairs?: Array<{ japanese: string; vietnamese: string }>;
  prompts?: Array<{ vietnamese: string; template: string; romaji: string }>;
}

interface MondaiData {
  lessonNumber: number;
  title: string;
  description: string;
  mondai: MondaiItem[];
}

const MondaiDetail: React.FC = () => {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mondaiData, setMondaiData] = useState<MondaiData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | number>('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchMondaiData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        // Load local JSON data instead of API call
        const data = await import(`../../data/practice/mondai/lesson${lessonNumber}.json`);
        setMondaiData(data.default);
      } catch (err) {
        console.error("Error loading mondai data:", err);
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

  const isCorrect = String(userAnswer) === String(mondaiData?.mondai[activeIndex]?.answer);

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

  if (error || !mondaiData || !mondaiData.mondai.length) {
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

  const mondaiItems = mondaiData?.mondai || [];
  const lesson = { lessonNumber: Number(lessonNumber), title: mondaiData?.title || `Lesson ${lessonNumber}`, title_jp: `第${lessonNumber}課`, level: 'N5', book: 'Minna no Nihongo' };
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
              <Tag color={activeMondai.type === "multiple_choice" ? "blue" : activeMondai.type === "fill_blank" ? "purple" : activeMondai.type === "translation" ? "green" : "orange"}>
                {activeMondai.type === "multiple_choice" ? (
                  <span className="flex items-center gap-1">Trắc nghiệm</span>
                ) : activeMondai.type === "fill_blank" ? (
                  <span className="flex items-center gap-1">Điền vào chỗ trống</span>
                ) : activeMondai.type === "translation" ? (
                  <span className="flex items-center gap-1">Dịch</span>
                ) : (
                  <span className="flex items-center gap-1">Nối từ</span>
                )}
              </Tag>
            </div>
            <Text strong className="text-text-main block text-lg">Bài {activeMondai.id}</Text>
          </div>

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
                    Đáp án đúng: {activeMondai.answer}
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Question */}
          <div className="mb-4">
            <Text strong className="text-text-main block text-base mb-2">{activeMondai.question}</Text>
            {activeMondai.japanese && (
              <Text className="text-text-main block mb-1">{activeMondai.japanese}</Text>
            )}
            {/* Romaji - Hidden */}
            {/* {activeMondai.romaji && (
              <Text className="text-text-sub block italic mb-1">{activeMondai.romaji}</Text>
            )} */}
            {activeMondai.vietnamese && (
              <Text className="text-text-sub block">{activeMondai.vietnamese}</Text>
            )}
          </div>

          {/* Options for multiple_choice */}
          {activeMondai.type === "multiple_choice" && activeMondai.options && (
            <div className="space-y-2">
              {activeMondai.options.map((option, idx) => (
                <Radio
                  key={option}
                  value={idx}
                  checked={userAnswer === idx}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={showResult}
                  className="block w-full"
                >
                  {option}
                </Radio>
              ))}
            </div>
          )}

          {/* Input for fill_blank */}
          {activeMondai.type === "fill_blank" && (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              disabled={showResult}
              className="w-full"
            />
          )}

          {/* Input for translation */}
          {activeMondai.type === "translation" && (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Nhập bản dịch tiếng Nhật..."
              disabled={showResult}
              className="w-full"
            />
          )}

          {/* Explanation */}
          {showResult && activeMondai.explanation && (
            <div className="mt-4 p-3 bg-secondary-50 dark:bg-secondary-800 rounded">
              <Text strong className="text-text-main block mb-1">Giải thích:</Text>
              <Text className="text-text-sub">{activeMondai.explanation}</Text>
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
