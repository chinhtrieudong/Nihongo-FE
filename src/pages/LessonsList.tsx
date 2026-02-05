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
  Progress,
} from "antd";
import {
  BookOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface FilterState {
  level: string[];
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
    level: [],
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

  const filteredAndSortedLessons = useMemo(() => {
    let filtered = lessons.filter((lesson) => {
      const searchMatch =
        searchQuery === "" ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `bài ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase()) ||
        `lesson ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase());

      const levelMatch =
        filters.level.length === 0 ||
        !lesson.level ||
        filters.level.includes(lesson.level);
      const statusMatch =
        filters.status.length === 0 ||
        (lesson.status && filters.status.includes(lesson.status));

      return searchMatch && levelMatch && statusMatch;
    });

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "lessonOrder":
          return a.lessonNumber - b.lessonNumber;
        case "progress":
          return (b.progress || 0) - (a.progress || 0);
        case "recentlyLearned":
          return (
            new Date((b as any).updatedAt || 0).getTime() -
            new Date((a as any).updatedAt || 0).getTime()
          );
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <BookOutlined className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <Title level={3} className="!mb-0 text-gray-900 dark:text-secondary-100">
                Minna no Nihongo
              </Title>
              <Text className="text-secondary-600 dark:text-secondary-400">
                Học theo lộ trình JLPT • N5 → N4
              </Text>
            </div>
          </div>
        </div>

        <Card className="mb-4 shadow-sm" styles={{ body: { padding: "16px" } }}>
          <div className="space-y-3">
            <Input
              placeholder="Tìm kiếm bài học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              className="w-full"
              allowClear
            />
            <Space wrap className="w-full">
              <Select
                mode="multiple"
                value={filters.level}
                onChange={(value) => setFilters((prev) => ({ ...prev, level: value }))}
                placeholder="JLPT"
                className="min-w-[140px]"
              >
                <Option value="N5">N5</Option>
                <Option value="N4">N4</Option>
                <Option value="N3">N3</Option>
              </Select>
              <Select
                mode="multiple"
                value={filters.status}
                onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                placeholder="Trạng thái"
                className="min-w-[160px]"
              >
                <Option value="completed">Đã học</Option>
                <Option value="in_progress">Đang học</Option>
                <Option value="not_started">Chưa học</Option>
              </Select>
              <Select
                value={filters.sortBy}
                onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                placeholder="Sắp xếp"
                className="min-w-[160px]"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="lessonOrder">Thứ tự bài học</Option>
                <Option value="progress">Tiến độ %</Option>
                <Option value="recentlyLearned">Gần đây</Option>
              </Select>
            </Space>
          </div>
        </Card>

        {filteredAndSortedLessons.length === 0 ? (
          <Empty description="Không tìm thấy bài học nào" className="py-12" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAndSortedLessons.map((lesson) => {
              const actionButton = getActionButton(lesson);
              return (
                <Card
                  key={lesson.id}
                  className="shadow-sm hover:shadow-md transition-all cursor-pointer border border-secondary-200 dark:border-secondary-800 rounded-lg"
                  onClick={() => handleLessonClick(lesson)}
                  hoverable
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-secondary-700 dark:text-secondary-300 font-semibold text-sm">
                      {lesson.lessonNumber}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Title level={5} className="!mb-1 text-sm text-gray-900 dark:text-secondary-100 line-clamp-1">
                            {lesson.title}
                          </Title>
                          <Text className="text-secondary-600 dark:text-secondary-400 text-xs line-clamp-2">
                            {lesson.description}
                          </Text>
                        </div>
                        {lesson.level && (
                          <Tag color={lesson.level === "N5" ? "green" : "blue"}>
                            {lesson.level}
                          </Tag>
                        )}
                      </div>
                    </div>

                    <Button
                      type={actionButton.type}
                      icon={actionButton.icon}
                      className={actionButton.className}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonClick(lesson);
                      }}
                    >
                      {actionButton.text}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsList;
