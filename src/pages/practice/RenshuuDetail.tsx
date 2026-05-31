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
import { minnaAPI } from "../../services/api";

const { Title, Text } = Typography;

interface DialogueLine {
  text: string;
  translation: string;
}

interface Dialogue {
  A: DialogueLine;
  B: DialogueLine;
  C?: DialogueLine;
}

interface PracticeItem {
  substitutions: Record<string, string>;
}

interface RenshuuItem {
  id: string;
  title: string;
  title_jp: string;
  type: string;
  description: string;
  audioUrl: string;
  content: {
    dialogue: Dialogue;
    practice: PracticeItem[];
  };
  characters?: string[];
}

interface LessonInfo {
  lessonNumber: number;
  title: string;
  title_jp: string;
  level: string;
  book: string;
}

interface RenshuuResponse {
  success: boolean;
  data: RenshuuItem[];
  lesson: LessonInfo;
  total_items: number;
  component: string;
  lesson_number: number;
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
  const [renshuuData, setRenshuuData] = useState<RenshuuResponse | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSubstitution, setSelectedSubstitution] = useState<Record<string, string>>({});
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
  const [visibleTranslations, setVisibleTranslations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRenshuuData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        // Note: Renshuu endpoint deprecated, use lesson content
        const response = await minnaAPI.getLessonContent(parseInt(lessonNumber));
        
        if (response.data.success && response.data.data.length > 0) {
          setRenshuuData(response.data);
          // Set first substitution as default
          const firstItem = response.data.data[0];
          if (firstItem.content?.practice?.[0]?.substitutions) {
            setSelectedSubstitution(firstItem.content.practice[0].substitutions);
          }
        } else {
          setError("Không thể tải dữ liệu renshuu");
        }
      } catch (err) {
        console.error("Error fetching renshuu:", err);
        setError("Không thể tải dữ liệu renshuu");
      } finally {
        setLoading(false);
      }
    };

    fetchRenshuuData();
  }, [lessonNumber]);

  const toggleTranslation = (speaker: string) => {
    setVisibleTranslations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(speaker)) {
        newSet.delete(speaker);
      } else {
        newSet.add(speaker);
      }
      return newSet;
    });
  };

  const substituteText = (text: string, substitutions: Record<string, string>) => {
    if (!text || !substitutions) return text;
    let result = text;
    Object.entries(substitutions).forEach(([key, value]) => {
      result = result.replace(key, value);
    });
    return result;
  };

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

  if (error || !renshuuData || !renshuuData.data.length) {
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

  const { lesson, data: renshuuItems } = renshuuData;
  const activeItem = renshuuItems[activeIndex];
  const speakers = activeItem?.content?.dialogue ? Object.keys(activeItem.content.dialogue) : [];

  const handlePrev = () => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      const item = renshuuItems[newIndex];
      if (item.content?.practice?.[0]?.substitutions) {
        setSelectedSubstitution(item.content.practice[0].substitutions);
      }
    }
  };

  const handleNext = () => {
    if (activeIndex < renshuuItems.length - 1) {
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      const item = renshuuItems[newIndex];
      if (item.content?.practice?.[0]?.substitutions) {
        setSelectedSubstitution(item.content.practice[0].substitutions);
      }
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
            <Text className="text-text-sub text-sm">{activeItem.title_jp} - {activeItem.description}</Text>
          </div>

          {/* Audio Player */}
          {activeItem.audioUrl && (
            <div className="mb-4">
              <AudioPlayer src={activeItem.audioUrl} />
            </div>
          )}

          {/* Practice Substitution Selector */}
          {activeItem.content?.practice && activeItem.content.practice.length > 0 && (
            <div className="mb-4 p-3 bg-secondary-50 dark:bg-secondary-800 rounded">
              <Text strong className="text-text-main block mb-2">� Thay đổi luyện tập:</Text>
              <Space wrap>
                {activeItem.content.practice.map((p, idx) => (
                  <Button
                    key={idx}
                    size="small"
                    type={JSON.stringify(selectedSubstitution) === JSON.stringify(p.substitutions) ? "primary" : "default"}
                    onClick={() => setSelectedSubstitution(p.substitutions)}
                  >
                    Mẫu {idx + 1}
                  </Button>
                ))}
              </Space>
            </div>
          )}

          {/* Characters */}
          <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Nhân vật</Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {(activeItem.characters || speakers).map((char) => {
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

          {/* Dialogue Display with Substitutions - Improved UX */}
          <Card className="bg-white dark:bg-secondary-900 border-border mb-3" styles={{ body: { padding: '20px' } }}>
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Hội thoại luyện tập</Text>
              <Text type="secondary" className="text-xs ml-auto">💡 Click để xem nghĩa</Text>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              {speakers.map((speaker) => {
                const line = activeItem.content.dialogue[speaker as keyof Dialogue];
                if (!line) return null;
                const colors = speakerColors[speaker];
                const substitutedText = substituteText(line.text, selectedSubstitution);
                const isSelected = selectedSpeaker === speaker;
                const showTranslation = visibleTranslations.has(speaker);

                return (
                  <div
                    key={speaker}
                    onClick={() => {
                      setSelectedSpeaker(speaker);
                      toggleTranslation(speaker);
                    }}
                    className={`
                      relative rounded-xl p-4 cursor-pointer transition-all duration-300 border
                      ${isSelected
                        ? 'bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-400 shadow-md scale-[1.02] border-orange-200 dark:border-orange-700'
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
                          {speaker}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`
                          text-lg font-medium leading-relaxed mb-2 text-gray-900 dark:text-gray-100
                          ${isSelected ? 'text-orange-900 dark:text-orange-200' : ''}
                        `}>
                          {substitutedText}
                        </p>

                        {/* Translation - Toggleable */}
                        <div className={`
                          overflow-hidden transition-all duration-300
                          ${showTranslation ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}
                        `}>
                          <div className="pt-2 border-t border-primary-200 dark:border-primary-800">
                            <p className="text-base text-text-sub">
                              {line.translation}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Current Substitutions Info */}
          {Object.keys(selectedSubstitution).length > 0 && (
            <div className="text-sm">
              <Text strong className="text-text-main">Thay thế hiện tại:</Text>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(selectedSubstitution).map(([key, value]) => (
                  <Tag key={key} color="orange" className="text-xs">
                    {key} → {value}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RenshuuDetail;
