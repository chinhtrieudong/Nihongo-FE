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
} from "antd";
import { EmptyState, LessonNavigation } from "../../components/common";
import {
  ArrowLeft,
  Scroll,
} from "lucide-react";
import AudioPlayer from "../../components/AudioPlayer";
import { minnaAPI } from "../../services/api";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface BunkeiItem {
  id: string;
  pattern: string;
  romaji: string;
  meaning: string;
  type: string;
  explanation?: string;
}

interface LessonInfo {
  lessonNumber: number;
  title: string;
  title_jp: string;
  level: string;
  book: string;
}

interface BunkeiResponse {
  success: boolean;
  data: BunkeiItem[];
  lesson: LessonInfo;
  total_items: number;
  component: string;
  lesson_number: number;
  audioUrl?: string;
}

const BunkeiDetail: React.FC = () => {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bunkeiData, setBunkeiData] = useState<BunkeiResponse | null>(null);

  useEffect(() => {
    const fetchBunkeiData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        const response = await minnaAPI.getBunkei(parseInt(lessonNumber));
        
        if (response.data.success) {
          setBunkeiData(response.data);
        } else {
          setError("Không thể tải dữ liệu bunkei");
        }
      } catch (err) {
        console.error("Error fetching bunkei:", err);
        setError("Không thể tải dữ liệu bunkei");
      } finally {
        setLoading(false);
      }
    };

    fetchBunkeiData();
  }, [lessonNumber]);

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải mẫu câu...</p>
        </div>
      </div>
    );
  }

  if (error || !bunkeiData) {
    return (
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type={error ? "error" : "data"}
          title={error ? "Không thể tải dữ liệu" : "Không có dữ liệu"}
          description={error || "Không có dữ liệu mẫu câu cho bài học này."}
          size="default"
          action={{
            label: "Quay lại Practice",
            onClick: () => navigate("/practice"),
          }}
        />
      </div>
    );
  }

  const { lesson, data: bunkeiItems, audioUrl } = bunkeiData;

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-4xl mx-auto px-4 py-4">
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
            onPrev={() => navigate(`/practice/bunkei/${Number(lessonNumber) - 1}`)}
            onNext={() => navigate(`/practice/bunkei/${Number(lessonNumber) + 1}`)}
            onSelectLesson={(value) => navigate(`/practice/bunkei/${value}`)}
          />
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
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
                <Scroll className="w-3 h-3" />
                {bunkeiItems.length} mẫu
              </Tag>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="mb-4">
            <AudioPlayer src={audioUrl} />
          </div>
        )}

        {/* Bunkei List */}
        <div className="space-y-3">
          {bunkeiItems.map((item, index) => (
            <Card
              key={item.id}
              className="bg-surface-1 border-border"
              styles={{ body: { padding: '12px 16px' } }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Text strong className="text-primary-600 text-sm">{index + 1}</Text>
                </div>
                <div className="flex-1 min-w-0">
                  {/* Pattern - Japanese */}
                  <div className="mb-2">
                    <Text className="text-text-sub text-xs block mb-1">Mẫu câu</Text>
                    <Text strong className="text-lg text-text-main block">{item.pattern}</Text>
                  </div>

                  {/* Romaji */}
                  <div className="mb-2 p-2 bg-secondary-50 dark:bg-secondary-800 rounded">
                    <Text className="text-text-sub text-xs block mb-1">Phiên âm</Text>
                    <Text className="text-text-main font-mono italic">{item.romaji}</Text>
                  </div>

                  {/* Meaning - Vietnamese */}
                  <div className="border-t border-border pt-2 mt-2">
                    <Text className="text-text-sub text-xs block mb-1">Ý nghĩa</Text>
                    <Text strong className="text-text-main block text-blue-600 dark:text-blue-400">{item.meaning}</Text>
                  </div>

                  {/* Explanation if available */}
                  {item.explanation && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                      <Text className="text-text-sub text-xs block mb-1">Giải thích</Text>
                      <Text className="text-sm text-text-main">{item.explanation}</Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BunkeiDetail;
