import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Tag,
  Spin,
  Empty,
  Badge,
  Space,
} from "antd";
import {
  ArrowLeft,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import AudioPlayer from "../../components/AudioPlayer";
import { minaApi } from "../../services/api";

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

  useEffect(() => {
    const fetchRenshuuData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        const response = await minaApi.get<RenshuuResponse>(`/${lessonNumber}/renshuu`);
        
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
      <div className="min-h-full bg-bg flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải bài tập luyện tập...</p>
        </div>
      </div>
    );
  }

  if (error || !renshuuData || !renshuuData.data.length) {
    return (
      <div className="min-h-full bg-bg p-8">
        <Empty description={error || "Không có dữ liệu"} />
        <div className="text-center mt-4">
          <Button onClick={() => navigate("/practice")} icon={<ArrowLeft className="w-4 h-4" />}>
            Quay lại
          </Button>
        </div>
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
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Header */}
        <Button
          onClick={() => navigate("/practice")}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="mb-2"
        >
          Quay lại
        </Button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <Badge count={`Bài ${lesson.lessonNumber}`} style={{ backgroundColor: "#fa8c16" }} />
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
        <Card className="bg-surface-1 border-border mb-3" bodyStyle={{ padding: '12px 16px' }}>
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

          {/* Dialogue Display with Substitutions */}
          <Card className="bg-white dark:bg-secondary-900 border-border mb-3">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-text-sub" />
              <Text strong className="text-text-main">Hội thoại luyện tập</Text>
            </div>

            <div className="space-y-3">
              {speakers.map((speaker) => {
                const line = activeItem.content.dialogue[speaker as keyof Dialogue];
                if (!line) return null;
                const colors = speakerColors[speaker];
                const substitutedText = substituteText(line.text, selectedSubstitution);

                return (
                  <div key={speaker} className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <Tag className={`${colors.bg} ${colors.text} ${colors.border} !border !mb-1 !font-medium`}>
                        {speaker}
                      </Tag>
                      <div className="bg-secondary-50 dark:bg-secondary-800 border border-border rounded-xl px-3 py-2 rounded-tl-none">
                        <Text strong className="text-text-main block">{substitutedText}</Text>
                        <Text className="text-text-sub text-sm">{line.translation}</Text>
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
