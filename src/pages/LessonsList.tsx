import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lessonAPI } from "../services/api";
import type { Lesson, LessonsResponse } from "../types/lesson";
import { useAppSelector } from "../store/hooks";
import {
  Card,
  Input,
  Button,
  Tag,
  Spin,
  Empty,
  Typography,
  Select,
  Space,
} from "antd";
import {
  BookOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface FilterState {
  status: string[];
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
    status: [],
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

  const getActionButton = (lesson: Lesson) => {
    switch (lesson.status) {
      case "completed":
        return {
          text: "Ôn tập",
          type: "default" as const,
          icon: <ReloadOutlined />,
          className:
            "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-secondary-600 dark:text-secondary-400 dark:hover:border-secondary-500 dark:hover:text-secondary-300",
        };
      case "in_progress":
        return {
          text: "Tiếp tục",
          type: "primary" as const,
          icon: <PlayCircleOutlined />,
          className: "bg-green-500 hover:bg-green-600 border-green-500",
        };
      default:
        return {
          text: "Bắt đầu",
          type: "primary" as const,
          icon: <PlayCircleOutlined />,
          className: "bg-blue-500 hover:bg-blue-600 border-blue-500",
        };
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "completed":
        return {
          className: "bg-green-500 text-white",
          icon: <CheckCircleOutlined />,
        };
      case "in_progress":
        return {
          className: "bg-blue-500 text-white",
          icon: <ClockCircleOutlined />,
        };
      default:
        return {
          className: "bg-secondary-400 text-white",
          icon: <MinusCircleOutlined />,
        };
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

      const statusMatch =
        filters.status.length === 0 ||
        (lesson.status && filters.status.includes(lesson.status));

      return searchMatch && statusMatch;
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
    navigate(`/lessons/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full bg-secondary-50 dark:bg-secondary-950">
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
      <div className="flex items-center justify-center min-h-full bg-secondary-50 dark:bg-secondary-950">
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
    <div className="min-h-full bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100">
      <div className="w-full px-4 sm:px-6 py-6">
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <BookOutlined className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <Title
                  level={3}
                  className="!mb-0 text-gray-900 dark:text-secondary-100"
                >
                  Minna no Nihongo
                </Title>
                <Text className="text-secondary-600 dark:text-secondary-400">
                  Học theo lộ trình JLPT • N5 → N4
                </Text>
              </div>
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
              Tổng {lessons.length} bài
            </div>
          </div>
        </div>

        <Card className="mb-4 shadow-sm" styles={{ body: { padding: "16px" } }}>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Tìm kiếm bài học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              className="flex-1"
              allowClear
            />
            <Space className="shrink-0">
              <Select
                mode="multiple"
                value={filters.status}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
                placeholder="Trạng thái"
                className="min-w-[180px]"
              >
                <Option value="completed">Đã học</Option>
                <Option value="in_progress">Đang học</Option>
                <Option value="not_started">Chưa học</Option>
              </Select>
              <Select
                value={filters.sortBy}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value }))
                }
                placeholder="Sắp xếp"
                className="min-w-[180px]"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="lessonOrder">Thứ tự bài học</Option>
              </Select>
            </Space>
          </div>
        </Card>

        {filteredAndSortedLessons.length === 0 ? (
          <Empty description="Không tìm thấy bài học nào" className="py-12" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
            {filteredAndSortedLessons.map((lesson) => {
              const statusLabel = getStatusLabel(lesson.status);
              const actionButton = getActionButton(lesson);
              return (
                <div
                  key={lesson.id}
                  className="group relative w-[240px] max-w-full rounded-2xl overflow-hidden border-2 border-blue-300 bg-white dark:bg-secondary-900 shadow-sm hover:-translate-y-1 transition-all duration-200"
                >
                  <button
                    className="w-full text-left"
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-white border-b-2 border-b-blue-300 border-blue-300 flex items-center justify-center">
                      {lesson.image_url ? (
                        <img
                          src={lesson.image_url}
                          alt={lesson.title}
                          loading="lazy"
                          className="block w-3/5 h-auto max-h-full object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-secondary-700 dark:text-secondary-300 text-sm font-semibold">
                          Bài {lesson.lessonNumber}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-secondary-900 dark:text-secondary-100 line-clamp-2">
                          Bài {lesson.lessonNumber}: {lesson.title}
                        </div>
                        <div className="mt-2 text-xs font-medium text-secondary-900 dark:text-secondary-200 line-clamp-3">
                          {lesson.description}
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${statusLabel.className}`}>
                      {statusLabel.icon}
                    </span>
                  </div>
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
