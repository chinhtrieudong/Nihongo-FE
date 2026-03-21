import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Select,
  Typography,
  message,
  Spin,
  Tag,
  Space,
  Input,
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  FilterOutlined,
  ClearOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  conversationLessonAPI,
  type ConversationLesson,
} from "../services/conversationLessonAPI";

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

export {}; // Export to make it a module for isolatedModules

const ConversationComponent: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<ConversationLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    level: [] as Array<"N5" | "N4" | "N3" | "N2" | "N1">,
    category: [] as string[],
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
  });

  // Load lessons on mount and when filters change
  useEffect(() => {
    loadLessons();
  }, [filters, searchTerm]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const params: any = {
        level: filters.level.length ? filters.level.join(",") : undefined,
        category: filters.category.length ? filters.category.join(",") : undefined,
        search: searchTerm || undefined,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await conversationLessonAPI.getLessons(params);
      if (response.success) {
        setLessons(response.data.lessons);
        setPagination(response.data.pagination);
      } else {
        message.error("Không thể tải danh sách bài học");
      }
    } catch (error) {
      console.error("Lỗi khi tải data:", error);
      message.error("Không thể tải danh sách bài học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (levels: string[]) => {
    setFilters((prev) => ({ ...prev, level: (levels || []) as any }));
  };

  const handleCategoryChange = (categories: string[]) => {
    setFilters((prev) => ({ ...prev, category: categories || [] }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const clearFilters = () => {
    setFilters({
      level: [],
      category: [],
    });
    setSearchTerm("");
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "#52c41a";
      case 2:
        return "#faad14";
      case 3:
        return "#fa8c16";
      case 4:
        return "#f5222d";
      case 5:
        return "#722ed1";
      default:
        return "#d9d9d9";
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Rất dễ";
      case 2:
        return "Dễ";
      case 3:
        return "Trung bình";
      case 4:
        return "Khó";
      case 5:
        return "Rất khó";
      default:
        return "Không xác định";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "greetings":
        return "👋";
      case "self_introduction":
        return "🙋";
      case "daily_life":
        return "🏠";
      case "shopping":
        return "🛒";
      case "restaurant":
        return "🍽️";
      case "travel":
        return "✈️";
      case "business":
        return "💼";
      case "school":
        return "🎓";
      case "hospital":
        return "🏥";
      default:
        return "📚";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "greetings":
        return "Chào hỏi";
      case "self_introduction":
        return "Giới thiệu bản thân";
      case "daily_life":
        return "Đời sống hàng ngày";
      case "shopping":
        return "Mua sắm";
      case "restaurant":
        return "Nhà hàng";
      case "travel":
        return "Du lịch";
      case "business":
        return "Công việc";
      case "school":
        return "Trường học";
      case "hospital":
        return "Bệnh viện";
      default:
        return "Khác";
    }
  };

  const handleLessonClick = (lesson: ConversationLesson) => {
    navigate(`/conversation/${lesson.lesson_id}`);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.level.length) count++;
    if (filters.category.length) count++;
    if (searchTerm) count++;
    return count;
  };

  const isInitialLoading = loading && lessons.length === 0;
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-secondary-900 academic-canvas">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-secondary-100 mb-3">
            Luyện hội thoại theo ngữ cảnh
          </h1>
          <p className="text-gray-600 dark:text-secondary-400 text-lg">
            Học nhanh qua tình huống đời sống, ngắn gọn và dễ nhớ.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 text-secondary-700 dark:text-secondary-300">
              <FilterOutlined />
              <Text strong>Bộ lọc nhanh</Text>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <Select
                value={filters.level}
                onChange={handleLevelChange}
                className="w-full sm:w-40"
                mode="multiple"
                maxTagCount="responsive"
                allowClear
                placeholder="Trình độ"
              >
                <Option value="N5">
                  <span className="text-green-500 font-medium">N5</span>
                </Option>
                <Option value="N4">
                  <span className="text-blue-500 font-medium">N4</span>
                </Option>
                <Option value="N3">
                  <span className="text-orange-500 font-medium">N3</span>
                </Option>
                <Option value="N2">
                  <span className="text-red-500 font-medium">N2</span>
                </Option>
                <Option value="N1">
                  <span className="text-purple-500 font-medium">N1</span>
                </Option>
              </Select>
              <Select
                value={filters.category}
                onChange={handleCategoryChange}
                className="w-full sm:flex-1"
                mode="multiple"
                maxTagCount="responsive"
                allowClear
                placeholder="Danh mục"
              >
                <Option value="greetings">👋 Chào hỏi</Option>
                <Option value="self_introduction">
                  🙋 Giới thiệu bản thân
                </Option>
                <Option value="daily_life">🏠 Đời sống hàng ngày</Option>
                <Option value="shopping">🛒 Mua sắm</Option>
                <Option value="restaurant">🍽️ Nhà hàng</Option>
                <Option value="travel">✈️ Du lịch</Option>
                <Option value="business">💼 Công việc</Option>
                <Option value="school">🎓 Trường học</Option>
                <Option value="hospital">🏥 Bệnh viện</Option>
                <Option value="other">📚 Khác</Option>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                type="default"
                icon={<ClearOutlined />}
                onClick={clearFilters}
                disabled={getActiveFiltersCount() === 0}
              >
                Xóa lọc
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Search
            placeholder="Tìm bài hội thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            allowClear
            className="w-full"
          />
        </div>

        <Spin spinning={loading}>
          <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => (
              <Card
                key={lesson.lesson_id}
                hoverable
                className="shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => handleLessonClick(lesson)}
                styles={{ body: { padding: 0 } }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-fuchsia-500 flex items-center justify-center text-white text-xl">
                        {getCategoryIcon(lesson.category)}
                      </div>
                      <div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {getCategoryText(lesson.category)}
                        </div>
                        <Text strong className="text-base line-clamp-2">
                          {lesson.lesson_title}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarOutlined className="text-yellow-500 text-xs" />
                      <span
                        className="font-medium text-xs"
                        style={{ color: getDifficultyColor(lesson.difficulty) }}
                      >
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>

                  <Text className="text-sm text-slate-600 dark:text-secondary-400 line-clamp-2 mt-3 block">
                    {lesson.situation_vi}
                  </Text>

                  <div className="mt-4 flex items-center justify-between">
                    <Space size="small" wrap>
                      <Tag color="blue" className="text-xs px-2">
                        {lesson.level}
                      </Tag>
                      <Tag color="green" className="text-xs px-2">
                        {getDifficultyText(lesson.difficulty)}
                      </Tag>
                    </Space>
                    <div className="flex items-center text-xs text-secondary-500">
                      <ClockCircleOutlined className="mr-1" />
                      {lesson.estimated_duration}p
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {lesson.usage_count > 0 ? (
                      <div className="text-xs text-secondary-500">
                        Đã học {lesson.usage_count} lần
                      </div>
                    ) : (
                      <div />
                    )}
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      size="small"
                      className="rounded-full"
                    >
                      <span className="hidden sm:inline">Bắt đầu</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Spin>

        {lessons.length === 0 && !loading && (
          <Card className="text-center py-8 lg:py-12">
            <BookOutlined className="text-5xl text-secondary-300 mb-4" />
            <Title level={4} className="text-secondary-500">
              Không tìm thấy bài học nào
            </Title>
            <Text className="text-secondary-400">
              Thử thay đổi bộ lọc hoặc tìm kiếm để tìm bài học phù hợp
            </Text>
          </Card>
        )}
      </div>
    </div>
  );
};
export default ConversationComponent;