import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Tag,
  Spin,
  Collapse,
  List,
  Select,
} from "antd";
import { EmptyState, LessonNavigation } from "../../components/common";
import {
  ArrowLeft,
  MessageSquare,
  BookOpen,
  Volume2,
  Users,
  Clock,
} from "lucide-react";
import AudioPlayer from "../../components/AudioPlayer";
// import { minnaAPI } from "../../services/api"; // Disabled - using local JSON data

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Types based on local JSON data
interface DialogueLine {
  speaker: string;
  japanese: string;
  romaji: string;
  vietnamese: string;
}

interface KaiwaItem {
  id: number;
  title: string;
  speakers: string[];
  dialogue: DialogueLine[];
}

interface KaiwaData {
  lessonNumber: number;
  title: string;
  description: string;
  kaiwa: KaiwaItem[];
}

// Speaker color mapping
const speakerColors: Record<string, { bg: string; text: string; border: string }> = {
  ミラー: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  山田: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  佐藤: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
  A: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  B: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
};

const getSpeakerColor = (speaker: string) => {
  return (
    speakerColors[speaker] || {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
    }
  );
};

const KaiwaDetail: React.FC = () => {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kaiwaData, setKaiwaData] = useState<KaiwaData | null>(null);
  const [activeKaiwa, setActiveKaiwa] = useState<KaiwaItem | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [visibleTranslations, setVisibleTranslations] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchKaiwaData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        setError(null);
        // Load local JSON data instead of API call
        const data = await import(`../../data/practice/kaiwa/lesson${lessonNumber}.json`);
        setKaiwaData(data.default);
        if (data.default.kaiwa.length > 0) {
          setActiveKaiwa(data.default.kaiwa[0]);
        }
      } catch (err) {
        console.error("Error loading kaiwa data:", err);
        setError("Không thể tải dữ liệu kaiwa. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchKaiwaData();
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
          <p className="mt-4 text-text-sub">Đang tải dữ liệu kaiwa...</p>
        </div>
      </div>
    );
  }

  if (error || !kaiwaData || !activeKaiwa) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Không có dữ liệu"}
          description={error || "Không có dữ liệu kaiwa cho bài học này."}
          size="default"
          action={{
            label: "Quay lại Practice",
            onClick: () => navigate("/practice"),
          }}
        />
      </div>
    );
  }

  const kaiwaItems = kaiwaData?.kaiwa || [];
  const lesson = { lessonNumber: Number(lessonNumber), title: kaiwaData?.title || `Lesson ${lessonNumber}`, title_jp: `第${lessonNumber}課`, title_vi: `Bài ${lessonNumber}`, level: 'N5', book: 'Minna no Nihongo', description_jp: '', description_vi: '' };
  const colors = getSpeakerColor(activeKaiwa.speakers[0] || 'A');

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-4">
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
              onPrev={() => navigate(`/practice/kaiwa/${Number(lessonNumber) - 1}`)}
              onNext={() => navigate(`/practice/kaiwa/${Number(lessonNumber) + 1}`)}
              onSelectLesson={(value) => navigate(`/practice/kaiwa/${value}`)}
            />
          </div>

          {/* Compact Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
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
                  <Clock className="w-3 h-3" />
                  {activeKaiwa.dialogue.length} câu
                </Tag>
              </div>
            </div>
          </div>

          {/* Characters */}
          <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Nhân vật</Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeKaiwa.speakers.map((speaker) => {
                const charColors = getSpeakerColor(speaker);
                return (
                  <Tag
                    key={speaker}
                    className={`${charColors.bg} ${charColors.text} ${charColors.border} !border !px-3 !py-1 !text-sm !font-medium`}
                  >
                    {speaker}
                  </Tag>
                );
              })}
            </div>
          </Card>

          {/* Dialogue - Improved UX */}
          <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '20px' } }}>
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Hội thoại</Text>
              <Text type="secondary" className="text-xs ml-auto">💡 Click để xem nghĩa</Text>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              {activeKaiwa.dialogue.map((line: DialogueLine, index: number) => {
                const lineColors = getSpeakerColor(line.speaker);
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
                        ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400 shadow-md scale-[1.02] border-blue-200 dark:border-blue-700'
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
                          ${lineColors.bg} ${lineColors.text} border-2 ${lineColors.border}
                        `}>
                          {line.speaker.charAt(0)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`
                          text-lg font-medium leading-relaxed mb-2 text-gray-900 dark:text-gray-100
                          ${isSelected ? 'text-blue-900 dark:text-blue-200' : ''}
                        `}>
                          {line.japanese}
                        </p>
                        {/* Romaji - Hidden */}
                        {/* <p className="text-sm text-text-sub italic mb-2">
                          {line.romaji}
                        </p> */}

                        {/* Translation - Toggleable */}
                        <div className={`
                          overflow-hidden transition-all duration-300
                          ${showTranslation ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}
                        `}>
                          <div className="pt-2 border-t border-primary-200 dark:border-primary-800">
                            <p className="text-base text-text-sub">
                              {line.vietnamese}
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

          {/* Navigation */}
          {kaiwaItems.length > 1 && (
            <div className="flex justify-between items-center">
              <Button
                disabled={kaiwaItems.indexOf(activeKaiwa) === 0}
                onClick={() => {
                  const currentIndex = kaiwaItems.indexOf(activeKaiwa);
                  if (currentIndex > 0) {
                    setActiveKaiwa(kaiwaItems[currentIndex - 1]);
                  }
                }}
              >
                Kaiwa trước
              </Button>
              <Text className="text-text-sub">
                {kaiwaItems.indexOf(activeKaiwa) + 1} / {kaiwaItems.length}
              </Text>
              <Button
                disabled={
                  kaiwaItems.indexOf(activeKaiwa) === kaiwaItems.length - 1
                }
                onClick={() => {
                  const currentIndex = kaiwaItems.indexOf(activeKaiwa);
                  if (currentIndex < kaiwaItems.length - 1) {
                    setActiveKaiwa(kaiwaItems[currentIndex + 1]);
                  }
                }}
              >
                Kaiwa sau
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KaiwaDetail;
