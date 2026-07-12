import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Tag,
  Spin,
  Space,
} from "antd";
import { EmptyState, LessonNavigation } from "../../components/common";
import {
  ArrowLeft,
  GraduationCap,
  MessageSquare,
  Users,
} from "lucide-react";
import AudioPlayer from "../../components/AudioPlayer";
// import { minnaAPI } from "../../services/api"; // Disabled - using local JSON data

const { Title, Text } = Typography;

interface Sentence {
  japanese: string;
  romaji: string;
  vietnamese: string;
}

interface RenshuuItem {
  id: number;
  type: "speaking" | "listening" | "writing" | "conversation";
  title: string;
  instruction: string;
  sentences?: Sentence[];
  prompts?: Array<{ vietnamese: string; template: string; romaji: string }>;
  dialogue?: Array<{ speaker: string; japanese: string; romaji: string; vietnamese: string }>;
}

interface RenshuuData {
  lessonNumber: number;
  title: string;
  description: string;
  renshuu: RenshuuItem[];
}

// Speaker color mapping
const speakerColors: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  B: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
  C: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
};

const RenshuuDetail: React.FC = () => {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renshuuData, setRenshuuData] = useState<RenshuuData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchRenshuuData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        // Load local JSON data instead of API call
        const data = await import(`../../data/practice/renshuu/lesson${lessonNumber}.json`);
        setRenshuuData(data.default);
      } catch (err) {
        console.error("Error loading renshuu data:", err);
        setError("Không thể tải dữ liệu renshuu");
      } finally {
        setLoading(false);
      }
    };

    fetchRenshuuData();
  }, [lessonNumber]);

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải bài tập luyện tập...</p>
        </div>
      </div>
    );
  }

  if (error || !renshuuData || !renshuuData.renshuu.length) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Không có dữ liệu"}
          description={error || "Không có dữ liệu bài luyện tập cho bài học này."}
          size="default"
          action={{
            label: "Quay lại Practice",
            onClick: () => navigate("/practice"),
          }}
        />
      </div>
    );
  }

  const renshuuItems = renshuuData?.renshuu || [];
  const lesson = { lessonNumber: Number(lessonNumber), title: renshuuData?.title || `Lesson ${lessonNumber}`, title_jp: `第${lessonNumber}課`, level: 'N5', book: 'Minna no Nihongo' };
  const activeItem = renshuuItems[activeIndex];

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < renshuuItems.length - 1) {
      setActiveIndex(prev => prev + 1);
    }
  };

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
            onPrev={() => navigate(`/practice/renshuu/${Number(lessonNumber) - 1}`)}
            onNext={() => navigate(`/practice/renshuu/${Number(lessonNumber) + 1}`)}
            onSelectLesson={(value) => navigate(`/practice/renshuu/${value}`)}
          />
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
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
                <GraduationCap className="w-3 h-3" />
                {renshuuItems.length} bài
              </Tag>
            </div>
          </div>
        </div>

        {/* Navigation between renshuu items */}
        {renshuuItems.length > 1 && (
          <div className="flex justify-between items-center mb-3">
            <Button
              size="small"
              disabled={activeIndex === 0}
              onClick={handlePrev}
            >
              Bài trước
            </Button>
            <Text className="text-text-sub">
              {activeIndex + 1} / {renshuuItems.length}
            </Text>
            <Button
              size="small"
              disabled={activeIndex === renshuuItems.length - 1}
              onClick={handleNext}
            >
              Bài sau
            </Button>
          </div>
        )}

        {/* Active Renshuu Item */}
        <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
          <div className="mb-3">
            <Text strong className="text-text-main block">{activeItem.title}</Text>
            <Text className="text-text-sub text-sm">{activeItem.instruction}</Text>
          </div>

          {/* Sentences */}
          {activeItem.sentences && activeItem.sentences.length > 0 && (
            <div className="space-y-2">
              {activeItem.sentences.map((sentence, idx) => (
                <div key={idx} className="p-2 bg-secondary-50 dark:bg-secondary-800 rounded">
                  <Text strong className="text-text-main block">{sentence.japanese}</Text>
                  {/* Romaji - Hidden */}
                  {/* <Text className="text-text-sub block italic">{sentence.romaji}</Text> */}
                  <Text className="text-text-main block">{sentence.vietnamese}</Text>
                </div>
              ))}
            </div>
          )}

          {/* Dialogue */}
          {activeItem.dialogue && activeItem.dialogue.length > 0 && (
            <div className="space-y-2">
              {activeItem.dialogue.map((line, idx) => (
                <div key={idx} className="p-2 bg-secondary-50 dark:bg-secondary-800 rounded">
                  <Text strong className="text-text-sub text-xs block">{line.speaker}</Text>
                  <Text className="text-text-main block">{line.japanese}</Text>
                  {/* Romaji - Hidden */}
                  {/* <Text className="text-text-sub block italic">{line.romaji}</Text> */}
                  <Text className="text-text-main block">{line.vietnamese}</Text>
                </div>
              ))}
            </div>
          )}

          {/* Prompts */}
          {activeItem.prompts && activeItem.prompts.length > 0 && (
            <div className="space-y-2">
              {activeItem.prompts.map((prompt, idx) => (
                <div key={idx} className="p-2 bg-secondary-50 dark:bg-secondary-800 rounded">
                  <Text className="text-text-sub block">{prompt.vietnamese}</Text>
                  <Text className="text-text-main block font-mono">{prompt.template}</Text>
                  {/* Romaji - Hidden */}
                  {/* <Text className="text-text-sub block italic">{prompt.romaji}</Text> */}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RenshuuDetail;
