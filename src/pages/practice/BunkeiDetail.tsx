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
  _id: string;
  lessonId: string;
  textbook: string;
  lessonNumber: number;
  bunkeiNumber: number;
  pattern: string;
  patternJp: string;
  structure: string;
  usageVi: string;
  explanationVi: string;
  explanationJp: string;
  comparison: string;
  commonMistakes: string;
  examples: Array<{
    japanese: string;
    romaji: string;
    meaning: string;
  }>;
  diagramUrl: string;
  pageReference: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-text-sub">Đang tải mẫu câu...</p>
        </div>
      </div>
    );
  }

  if (error || !bunkeiData) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
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

  const { data: bunkeiItems } = bunkeiData;
  const lesson = { lessonNumber: Number(lessonNumber), title: `Lesson ${lessonNumber}`, title_jp: `第${lessonNumber}課`, level: 'N5', book: 'Minna no Nihongo' };

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


        {/* Bunkei List */}
        <div className="space-y-3">
          {bunkeiItems.map((item, index) => (
            <Card
              key={item._id}
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
                    <Text className="text-text-sub text-xs block mb-1">Mẫu câu (VN)</Text>
                    <Text strong className="text-lg text-text-main block">{item.pattern}</Text>
                  </div>

                  {/* PatternJp - Japanese */}
                  <div className="mb-2">
                    <Text className="text-text-sub text-xs block mb-1">Mẫu câu (JP)</Text>
                    <Text strong className="text-lg text-text-main block">{item.patternJp}</Text>
                  </div>

                  {/* Structure */}
                  <div className="mb-2 p-2 bg-secondary-50 dark:bg-secondary-800 rounded">
                    <Text className="text-text-sub text-xs block mb-1">Cấu trúc</Text>
                    <Text className="text-text-main font-mono italic">{item.structure}</Text>
                  </div>

                  {/* Usage */}
                  <div className="mb-2 border-t border-border pt-2 mt-2">
                    <Text className="text-text-sub text-xs block mb-1">Cách dùng</Text>
                    <Text strong className="text-text-main block text-blue-600 dark:text-blue-400">{item.usageVi}</Text>
                  </div>

                  {/* Explanation if available */}
                  {item.explanationVi && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                      <Text className="text-text-sub text-xs block mb-1">Giải thích (VN)</Text>
                      <Text className="text-sm text-text-main">{item.explanationVi}</Text>
                    </div>
                  )}

                  {/* Examples */}
                  {item.examples && item.examples.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800">
                      <Text className="text-text-sub text-xs block mb-1">Ví dụ</Text>
                      <div className="space-y-2">
                        {item.examples.map((ex, exIdx) => (
                          <div key={exIdx} className="text-sm">
                            <Text strong className="text-text-main block">{ex.japanese}</Text>
                            <Text className="text-text-sub block italic">{ex.romaji}</Text>
                            <Text className="text-text-main block">{ex.meaning}</Text>
                          </div>
                        ))}
                      </div>
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
