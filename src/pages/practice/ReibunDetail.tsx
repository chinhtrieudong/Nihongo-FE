import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Tag,
  Spin,
  Badge,
  List,
} from "antd";
import { EmptyState } from "../../components/common";
import {
  ArrowLeft,
  Languages,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import AudioPlayer from "../../components/AudioPlayer";
import { minaApi } from "../../services/api";

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

  useEffect(() => {
    const fetchReibunData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        const response = await minaApi.get<ReibunResponse>(`/${lessonNumber}/reibun`);
        
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

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải câu ví dụ...</p>
        </div>
      </div>
    );
  }

  if (error || !reibunData) {
    return (
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Không có dữ liệu"}
          description={error || "Không có dữ liệu câu ví dụ cho bài học này."}
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
          <Badge count={`Bài ${lesson.lessonNumber}`} style={{ backgroundColor: "#722ed1" }} />
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

        {/* Dialogue */}
        <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-text-sub" />
            <Text strong className="text-text-main">Hội thoại ví dụ</Text>
          </div>

          <div className="space-y-3">
            {activeReibun.dialogue.map((line, index) => {
              const speakerColors: Record<string, { bg: string; text: string; border: string }> = {
                A: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
                B: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
                C: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
              };
              const colors = speakerColors[line.speaker] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
              return (
                <div key={index} className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <Tag className={`${colors.bg} ${colors.text} ${colors.border} !border !mb-1 !font-medium`}>
                      {line.speaker}
                    </Tag>
                    <div className="bg-white dark:bg-secondary-800 border border-border rounded-xl px-3 py-2 rounded-tl-none">
                      <Text strong className="text-text-main block">{line.text}</Text>
                      <Text className="text-text-sub text-sm block">{line.romaji}</Text>
                      <Text className="text-primary-600 dark:text-primary-400 text-sm italic">{line.translation}</Text>
                      <Text className="text-text-sub text-xs block mt-1"> {line.context}</Text>
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
