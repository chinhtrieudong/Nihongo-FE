import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { lessonAPI } from "../services/api";
import type { Lesson, LessonsResponse } from "../types/lesson";
import { useAppSelector } from "../store/hooks";
import {
  Card,
  Input,
  Button,
  Spin,
  Empty,
  Typography,
  Select,
} from "antd";
import {
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";

const { Title, Text } = Typography;
const { Option } = Select;

interface FilterState {
  level: string;
}

interface TextbookInfo {
  name: string;
  nameJp: string;
  description: string;
}

const textbookInfo: Record<string, TextbookInfo> = {
  minna_no_nihongo: {
    name: "Minna no Nihongo",
    nameJp: "みんなの日本語",
    description: "Học theo lộ trình JLPT • N5 → N4"
  },
  tango: {
    name: "Tango",
    nameJp: "たんご",
    description: "Từ vựng theo chủ đề • N5 → N4"
  }
};

const LessonsList: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const textbookId = searchParams.get('textbook') || 'minna_no_nihongo';

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    level: "all",
  });

  useEffect(() => {
    loadLessons();
  }, [currentUser, textbookId]);

  const loadLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: LessonsResponse = await lessonAPI.getLessons(undefined, undefined, undefined, textbookId);
      if (response.success && response.data) {
        setLessons(response.data.lessons);
      } else {
        setError("Failed to load lessons");
      }
    } catch (err) {
      setError("Lỗi khi tải bài học");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedLessons = useMemo(() => {
    let filtered = lessons.filter((lesson) => {
      const searchMatch =
        searchQuery === "" ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `bài ${lesson.lesson_number}`.includes(searchQuery.toLowerCase()) ||
        `lesson ${lesson.lesson_number}`.includes(searchQuery.toLowerCase());

      const levelMatch = filters.level === "all" || lesson.level === filters.level;

      return searchMatch && levelMatch;
    });

    filtered.sort((a, b) => a.lesson_number - b.lesson_number);

    return filtered;
  }, [lessons, searchQuery, filters]);

  const handleLessonClick = (lesson: Lesson) => {
    navigate(`/mina/${lesson.lesson_number}`);
  };
  const isMobile = typeof window !== "undefined" && window.innerWidth < 576;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-secondary-700 dark:text-secondary-400">
            Đang tải bài học...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center px-4">
          <Title level={3} className="text-red-600">
            Lỗi
          </Title>
          <Text className="text-secondary-700 dark:text-secondary-400">
            {error}
          </Text>
          <div className="mt-4">
            <Button type="primary" onClick={loadLessons}>
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col gap-4">
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/')}
              className="rounded-xl w-fit"
            >
              Quay lại
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-secondary-100">
              {textbookInfo[textbookId]?.name || "Minna no Nihongo"}
            </h1>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card
          className="mb-8 rounded-2xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm"
          styles={{ body: { padding: isMobile ? "12px" : "16px" } }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <Input
              placeholder="Tìm kiếm bài học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              size="middle"
              className="w-full md:flex-1"
              allowClear
            />
            <div className="grid grid-cols-1 md:flex md:w-auto gap-3 md:min-w-[120px]">
              <Select
                value={filters.level}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, level: value }))
                }
                placeholder="Cấp độ"
                className="w-full md:w-[120px]"
                size="middle"
              >
                <Option value="all">Tất cả</Option>
                <Option value="N5">N5</Option>
                <Option value="N4">N4</Option>
              </Select>
            </div>
          </div>
        </Card>

        {filteredAndSortedLessons.length === 0 ? (
          <Empty
            description="Không tìm thấy bài học nào"
            className="py-8 sm:py-12"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredAndSortedLessons.map((lesson, index) => {
              return (
                <div
                  key={lesson.lesson_number || lesson.id || index}
                  className="group relative w-full rounded-xl sm:rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  {/* Color strip */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: lesson.level === 'N5' ? 'var(--primary)' : 'var(--secondary)' }}
                  />
                  <button
                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl sm:rounded-2xl"
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className="relative h-32 sm:h-40 md:h-44 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-secondary-700 dark:to-secondary-800">
                      {lesson.image_url ? (
                        <img
                          src={lesson.image_url}
                          alt={lesson.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold text-blue-500 dark:text-blue-400 mb-2">
                              {lesson.lesson_number}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-secondary-400">
                              Bài học
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-secondary-100 line-clamp-2 mb-1">
                          Bài {lesson.lesson_number}: {lesson.title_vi || lesson.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-secondary-400 line-clamp-2 sm:line-clamp-3">
                          {lesson.description_vi || lesson.description}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsList;
