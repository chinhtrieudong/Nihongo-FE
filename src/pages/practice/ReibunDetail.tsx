import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Tag,
  Spin,
  List,
} from "antd";
import { EmptyState, LessonNavigation } from "../../components/common";
import {
  ArrowLeft,
  Languages,
  MessageSquare,
  BookOpen,
  Users,
} from "lucide-react";
import AudioPlayer from "../../components/AudioPlayer";
import { minnaAPI } from "../../services/api";

const { Title, Text } = Typography;

interface ReibunDialogueLine {
  speaker: string;
  text: string;
  romaji: string;
  translation: string;
  context: string;
}

interface ReibunItem {
  id: string;
  title: string;
  description: string;
  dialogue: ReibunDialogueLine[];
  total_lines: number;
  grammar_focus: string[];
  vocabulary_focus: string[];
  audioUrl: string;
  type: string;
  characters?: string[];
}

interface LessonInfo {
  lessonNumber: number;
  title: string;
  title_jp: string;
  level: string;
  book: string;
}

interface ReibunResponse {
  success: boolean;
  data: ReibunItem[];
  lesson: LessonInfo;
  total_items: number;
  component: string;
  lesson_number: number;
}

const ReibunDetail: React.FC = () => {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reibunData, setReibunData] = useState<ReibunResponse | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [visibleTranslations, setVisibleTranslations] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchReibunData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        // Note: Reibun endpoint deprecated, use lesson content
        const response = await minnaAPI.getLessonContent(parseInt(lessonNumber));
        
        if (response.data.success) {
          setReibunData(response.data);
        } else {
          setError("Không thể tải dữ liệu reibun");
        }
      } catch (err) {
        console.error("Error fetching reibun:", err);
        setError("Không thể tải dữ liệu reibun");
      } finally {
        setLoading(false);
      }
    };

    fetchReibunData();
  }, [lessonNumber]);

  const toggleTranslation = (index: number) => {
    setVisibleTranslations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải câu ví dụ...</p>
        </div>
      </div>
    );
  }

  if (error || !reibunData) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Không có dữ liệu"}
          description={error || "Không có dữ liệu câu ví dụ cho bài học này."}
          size="default"
          action={{
            label: "Quay lại Practice",
            onClick: () => navigate("/practice"),
          }}
        />
      </div>
    );
  }

  const { lesson, data: reibunItems } = reibunData;
  const activeReibun = reibunItems[0]; // Reibun thường có 1 item chứa toàn bộ dialogue

  // Speaker color mapping
  const speakerColors: Record<string, { bg: string; text: string; border: string }> = {
    A: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
    B: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
    C: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
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
            onPrev={() => navigate(`/practice/reibun/${Number(lessonNumber) - 1}`)}
            onNext={() => navigate(`/practice/reibun/${Number(lessonNumber) + 1}`)}
            onSelectLesson={(value) => navigate(`/practice/reibun/${value}`)}
          />
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
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
                <Languages className="w-3 h-3" />
                {activeReibun.total_lines} câu
              </Tag>
            </div>
          </div>
        </div>

        {/* Reibun Title & Description */}
        <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
          <Text strong className="text-text-main block">{activeReibun.title}</Text>
          <Text className="text-text-sub text-sm">{activeReibun.description}</Text>
        </Card>

        {/* Audio Player */}
        {activeReibun.audioUrl && (
          <div className="mb-4">
            <AudioPlayer src={activeReibun.audioUrl} />
          </div>
        )}

        {/* Characters */}
        <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-text-sub" />
            <Text strong className="text-text-main">Nhân vật</Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {(activeReibun.characters || Array.from(new Set(activeReibun.dialogue.map(d => d.speaker)))).map((char) => {
              const speakerColors: Record<string, { bg: string; text: string; border: string }> = {
                A: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
                B: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
                C: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
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

        {/* Dialogue - Improved UX */}
        <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '20px' } }}>
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-text-sub" />
            <Text strong className="text-text-main">Hội thoại ví dụ</Text>
            <Text type="secondary" className="text-xs ml-auto">💡 Click để xem nghĩa</Text>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            {activeReibun.dialogue.map((line, index) => {
              const speakerColors: Record<string, { bg: string; text: string; border: string }> = {
                A: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
                B: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
                C: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
              };
              const colors = speakerColors[line.speaker] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
              const isSelected = selectedLineIndex === index;
              const showTranslation = visibleTranslations.has(index);

              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedLineIndex(index);
                    toggleTranslation(index);
                  }}
                  className={`
                    relative rounded-xl p-4 cursor-pointer transition-all duration-300 border
                    ${isSelected
                      ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-400 shadow-md scale-[1.02] border-purple-200 dark:border-purple-700'
                      : 'bg-white dark:bg-secondary-800 border-gray-200 dark:border-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-700'
                    }
                  `}
                >
                  {/* Current indicator */}
                  {isSelected && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-500 rounded-full" />
                  )}

                  <div className="flex gap-3">
                    {/* Speaker Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                        ${colors.bg} ${colors.text} border-2 ${colors.border}
                      `}>
                        {line.speaker}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`
                        text-lg font-medium leading-relaxed mb-2 text-gray-900 dark:text-gray-100
                        ${isSelected ? 'text-purple-900 dark:text-purple-200' : ''}
                      `}>
                        {line.text}
                      </p>

                      {/* Translation - Toggleable */}
                      <div className={`
                        overflow-hidden transition-all duration-300
                        ${showTranslation ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
                      `}>
                        <div className="pt-2 border-t border-primary-200 dark:border-primary-800 space-y-1">
                          <p className="text-base text-text-sub">
                            {line.translation}
                          </p>
                          {line.context && (
                            <p className="text-sm text-text-sub/80 italic">
                              {line.context}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Grammar Focus */}
        <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-text-sub" />
            <Text strong className="text-text-main">Ngữ pháp cần chú ý</Text>
          </div>
          <List
            dataSource={activeReibun.grammar_focus}
            renderItem={(grammar) => (
              <List.Item className="!py-2 !border-b !border-border last:!border-b-0">
                <Tag color="purple" className="!px-3 !py-1 !text-sm">{grammar}</Tag>
              </List.Item>
            )}
          />
        </Card>

        {/* Vocabulary Focus */}
        <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-5 h-5 text-text-sub" />
            <Text strong className="text-text-main">Từ vựng cần chú ý</Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeReibun.vocabulary_focus.map((vocab) => (
              <Tag key={vocab} color="blue" className="!px-3 !py-1 !text-sm">{vocab}</Tag>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReibunDetail;
