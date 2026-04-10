import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Tag,
  Spin,
  Badge,
  Collapse,
  List,
} from "antd";
import { EmptyState } from "../../components/common";
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
          <Button
            onClick={() => navigate("/practice")}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="mb-2"
          >
            Quay lại
          </Button>

          {/* Compact Title */}
          <div className="flex items-center gap-3 mb-3">
            <Badge count={`Bài ${lesson.lessonNumber}`} style={{ backgroundColor: "#1890ff" }} />
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

          {/* Dialogue */}
          <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Hội thoại</Text>
            </div>
            
            <div className="space-y-4">
              {activeKaiwa.dialogue.map((line, index) => {
                const lineColors = getSpeakerColor(line.speaker);
                return (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div className={`max-w-[80%] ${index % 2 === 0 ? "" : "text-right"}`}>
                      {/* Speaker Badge */}
                      <Tag
                        className={`${lineColors.bg} ${lineColors.text} ${lineColors.border} !border !mb-2 !font-medium`}
                      >
                        {line.speaker}
                      </Tag>
                      
                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          index % 2 === 0
                            ? "bg-white dark:bg-secondary-800 border border-border rounded-tl-none"
                            : "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-tr-none"
                        }`}
                      >
                        <p className="text-lg font-medium text-text-main mb-1 leading-relaxed">
                          {line.jpText}
                        </p>
                        <p className="text-sm text-text-sub mb-1">{line.romaji}</p>
                        <p className="text-sm text-primary-600 dark:text-primary-400 italic">
                          {line.viTranslation}
                        </p>
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
              renderItem={(grammar) => (
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
