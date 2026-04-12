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
import { minaApi } from "../../services/api";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Types based on API response
interface DialogueLine {
  speaker: string;
  jpText: string;
  romaji: string;
  viTranslation: string;
  speaker_role: string;
}

interface KaiwaItem {
  id: string;
  title: string;
  title_jp: string;
  setting: string;
  characters: string[];
  dialogue: DialogueLine[];
  audioUrl: string;
  total_lines: number;
  vocabulary_focus: string[];
  grammar_focus: string[];
}

interface LessonInfo {
  lessonNumber: number;
  title: string;
  title_jp: string;
  title_vi: string;
  level: string;
  book: string;
  description_jp: string;
  description_vi: string;
}

interface KaiwaResponse {
  success: boolean;
  data: KaiwaItem[];
  lesson: LessonInfo;
  total_items: number;
  component: string;
  lesson_number: number;
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
  const [kaiwaData, setKaiwaData] = useState<KaiwaResponse | null>(null);
  const [activeKaiwa, setActiveKaiwa] = useState<KaiwaItem | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [visibleTranslations, setVisibleTranslations] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchKaiwaData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        setError(null);

        const response = await minaApi.get<KaiwaResponse>(`/${lessonNumber}/kaiwa`);
        
        if (response.data.success) {
          setKaiwaData(response.data);
          if (response.data.data.length > 0) {
            setActiveKaiwa(response.data.data[0]);
          }
        } else {
          setError("Không thể tải dữ liệu kaiwa");
        }
      } catch (err) {
        console.error("Error fetching kaiwa data:", err);
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
      <div className="min-h-full bg-bg flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải dữ liệu kaiwa...</p>
        </div>
      </div>
    );
  }

  if (error || !kaiwaData || !activeKaiwa) {
    return (
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Không có dữ liệu"}
          description={error || "Không có dữ liệu kaiwa cho bài học này."}
          action={{
            label: "Quay lại Practice",
            onClick: () => navigate("/practice"),
          }}
        />
      </div>
    );
  }

  const { lesson } = kaiwaData;
  const colors = getSpeakerColor(activeKaiwa.characters[0]);

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-4xl mx-auto px-4 py-4">
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
                  {activeKaiwa.total_lines} câu
                </Tag>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          {activeKaiwa.audioUrl && (
            <div className="mb-4">
              <AudioPlayer
                src={activeKaiwa.audioUrl}
              />
            </div>
          )}

          {/* Characters */}
          <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Nhân vật</Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeKaiwa.characters.map((char) => {
                const charColors = getSpeakerColor(char);
                return (
                  <Tag
                    key={char}
                    className={`${charColors.bg} ${charColors.text} ${charColors.border} !border !px-3 !py-1 !text-sm !font-medium`}
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
              <Text strong className="text-text-main">Hội thoại</Text>
              <Text type="secondary" className="text-xs ml-auto">💡 Click để xem nghĩa</Text>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              {activeKaiwa.dialogue.map((line, index) => {
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
                          {line.jpText}
                        </p>

                        {/* Translation - Toggleable */}
                        <div className={`
                          overflow-hidden transition-all duration-300
                          ${showTranslation ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}
                        `}>
                          <div className="pt-2 border-t border-primary-200 dark:border-primary-800">
                            <p className="text-base text-text-sub">
                              {line.viTranslation}
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

          {/* Vocabulary Focus */}
          <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Từ vựng cần chú ý</Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeKaiwa.vocabulary_focus.map((vocab) => (
                <Tag
                  key={vocab}
                  color="blue"
                  className="!px-3 !py-1 !text-sm"
                >
                  {vocab}
                </Tag>
              ))}
            </div>
          </Card>

          {/* Grammar Focus */}
          <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Ngữ pháp cần chú ý</Text>
            </div>
            <List
              dataSource={activeKaiwa.grammar_focus}
              renderItem={(grammar: string) => (
                <List.Item className="!py-2 !border-b !border-border last:!border-b-0">
                  <Tag color="green" className="!px-3 !py-1 !text-sm">
                    {grammar}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>

          {/* Navigation */}
          {kaiwaData.data.length > 1 && (
            <div className="flex justify-between items-center">
              <Button
                disabled={kaiwaData.data.indexOf(activeKaiwa) === 0}
                onClick={() => {
                  const currentIndex = kaiwaData.data.indexOf(activeKaiwa);
                  if (currentIndex > 0) {
                    setActiveKaiwa(kaiwaData.data[currentIndex - 1]);
                  }
                }}
              >
                Kaiwa trước
              </Button>
              <Text className="text-text-sub">
                {kaiwaData.data.indexOf(activeKaiwa) + 1} / {kaiwaData.data.length}
              </Text>
              <Button
                disabled={
                  kaiwaData.data.indexOf(activeKaiwa) === kaiwaData.data.length - 1
                }
                onClick={() => {
                  const currentIndex = kaiwaData.data.indexOf(activeKaiwa);
                  if (currentIndex < kaiwaData.data.length - 1) {
                    setActiveKaiwa(kaiwaData.data[currentIndex + 1]);
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
