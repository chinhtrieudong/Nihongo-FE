import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface FilterState {
  sortBy: string;
}

const LessonsList: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "lessonOrder",
  });

  useEffect(() => {
    loadLessons();
  }, [currentUser]);

  const loadLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: LessonsResponse = await lessonAPI.getLessons();
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
        `bài ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase()) ||
        `lesson ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase());
      return searchMatch;
    });

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "lessonOrder":
          return a.lessonNumber - b.lessonNumber;
        default:
          return a.lessonNumber - b.lessonNumber;
      }
    });

    return filtered;
  }, [lessons, searchQuery, filters]);

  const handleLessonClick = (lesson: Lesson) => {
    navigate(`/lessons/${lesson.lessonNumber}`);
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
    <div className="min-h-full text-secondary-900 dark:text-secondary-100">
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-5 rounded-2xl border border-[#d5dfef] bg-[#d6e4f8] bg-[linear-gradient(to_right,rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:24px_24px] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center text-secondary-700 dark:text-secondary-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="72"
                height="72"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 1 }}
              >
                <path
                  fill="none"
                  d="M24 5.5v37M6.704 16.092h34.592m-17.296 0c0 4.964-12.925 16.087-17.24 18.88M24 16.092c0 4.964 12.925 16.087 17.24 18.88"
                />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl sm:text-4xl font-semibold leading-tight text-[#2a2f3f]">
                Minna no Nihongo
              </h1>
              <p className="mt-1 text-sm sm:text-lg text-[#2c3853]">
                Học theo lộ trình JLPT • N5 → N4
              </p>
            </div>
          </div>
        </div>

        <Card
          className="mb-4 rounded-2xl border border-[#e6e8ee] bg-[#f3f4f8] shadow-none"
          styles={{ body: { padding: isMobile ? "8px" : "10px" } }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-1.5">
            <Input
              placeholder="Tìm kiếm bài học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              size="small"
              className="w-full md:flex-1 [&_.ant-input-prefix]:text-secondary-500"
              allowClear
            />
            <div className="grid grid-cols-1 md:flex md:w-auto gap-1.5 md:min-w-[180px]">
              <Select
                value={filters.sortBy}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value }))
                }
                placeholder="Sắp xếp"
                className="w-full md:w-[180px] [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-[#d9dce5] [&_.ant-select-selector]:!bg-white [&_.ant-select-selection-item]:!text-[#111827]"
                suffixIcon={<FilterOutlined />}
                size="small"
              >
                <Option value="lessonOrder">Thứ tự bài học</Option>
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
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredAndSortedLessons.map((lesson) => {
              return (
                <div
                  key={lesson.id}
                  className="group relative w-full rounded-xl sm:rounded-2xl overflow-hidden border-2 border-blue-300 bg-white dark:bg-secondary-900 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <button
                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-xl sm:rounded-2xl"
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className="relative h-32 sm:h-40 md:h-44 w-full overflow-hidden bg-white border-b-2 border-b-blue-300 border-blue-300 flex items-center justify-center">
                      {lesson.image_url ? (
                        <img
                          src={lesson.image_url}
                          alt={lesson.title}
                          loading="lazy"
                          className="block w-3/5 h-auto max-h-full object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-secondary-700 dark:text-secondary-300 text-xs sm:text-sm font-semibold">
                          Bài {lesson.lessonNumber}
                        </div>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-secondary-900 dark:text-secondary-100 line-clamp-2">
                          Bài {lesson.lessonNumber}: {lesson.title}
                        </div>
                        <div className="mt-1 sm:mt-2 text-xs text-secondary-900 dark:text-secondary-200 line-clamp-2 sm:line-clamp-3">
                          {lesson.description}
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
