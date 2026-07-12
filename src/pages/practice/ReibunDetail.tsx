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
// import { minnaAPI } from "../../services/api"; // Disabled - using local JSON data

const { Title, Text } = Typography;

interface ReibunItem {
  id: number;
  japanese: string;
  romaji: string;
  vietnamese: string;
  grammarPoint: string;
  context: string;
}

interface ReibunData {
  lessonNumber: number;
  title: string;
  description: string;
  reibun: ReibunItem[];
}

const ReibunDetail: React.FC = () => {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reibunData, setReibunData] = useState<ReibunData | null>(null);

  useEffect(() => {
    const fetchReibunData = async () => {
      if (!lessonNumber) return;

      try {
        setLoading(true);
        // Load local JSON data instead of API call
        const data = await import(`../../data/practice/reibun/lesson${lessonNumber}.json`);
        setReibunData(data.default);
      } catch (err) {
        console.error("Error loading reibun data:", err);
        setError("Không thể tải dữ liệu reibun");
      } finally {
        setLoading(false);
      }
    };

    fetchReibunData();
  }, [lessonNumber]);

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

  const reibunItems = reibunData?.reibun || [];
  const lesson = { lessonNumber: Number(lessonNumber), title: reibunData?.title || `Lesson ${lessonNumber}`, title_jp: `第${lessonNumber}課`, level: 'N5', book: 'Minna no Nihongo' };

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
                {reibunItems.length} câu
              </Tag>
            </div>
          </div>
        </div>

        {/* Description */}
        {reibunData?.description && (
          <Card className="bg-surface-1 border-border mb-3" styles={{ body: { padding: '12px 16px' } }}>
            <Text className="text-text-sub text-sm">{reibunData.description}</Text>
          </Card>
        )}

        {/* Reibun List */}
        <div className="space-y-3">
          {reibunItems.map((item: ReibunItem, index: number) => (
            <Card
              key={item.id}
              className="bg-surface-1 border-border"
              styles={{ body: { padding: '12px 16px' } }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Text strong className="text-purple-600 text-sm">{index + 1}</Text>
                </div>
                <div className="flex-1 min-w-0">
                  {/* Japanese */}
                  <div className="mb-2">
                    <Text strong className="text-lg text-text-main block">{item.japanese}</Text>
                  </div>

                  {/* Romaji - Hidden */}
                  {/* <div className="mb-2">
                    <Text className="text-text-sub block italic">{item.romaji}</Text>
                  </div> */}

                  {/* Vietnamese */}
                  <div className="mb-2">
                    <Text className="text-text-main block">{item.vietnamese}</Text>
                  </div>

                  {/* Grammar Point */}
                  {item.grammarPoint && (
                    <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-100 dark:border-purple-800">
                      <Text className="text-text-sub text-xs block mb-1">Ngữ pháp</Text>
                      <Text className="text-sm text-text-main">{item.grammarPoint}</Text>
                    </div>
                  )}

                  {/* Context */}
                  {item.context && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                      <Text className="text-text-sub text-xs block mb-1">Ngữ cảnh</Text>
                      <Text className="text-sm text-text-main">{item.context}</Text>
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

export default ReibunDetail;
