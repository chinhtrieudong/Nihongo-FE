import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Select,
  Badge,
  Avatar,
  Typography,
  Row,
  Col,
  message,
  Spin,
  Tag,
  Space,
} from "antd";
import {
  RobotOutlined,
  UserOutlined,
  BookOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  conversationLessonAPI,
  type ConversationLesson,
} from "../services/conversationLessonAPI";

const { Option } = Select;
const { Title, Text } = Typography;

export {}; // Export to make it a module for isolatedModules

const ConversationComponent: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<ConversationLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: "N5" as "N5" | "N4" | "N3" | "N2" | "N1",
    category: "" as string,
    difficulty: 0 as number,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
  });

  // Load lessons on mount
  useEffect(() => {
    loadLessons();
  }, [filters]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const params: any = {
        level: filters.level || undefined,
        category: filters.category || undefined,
        difficulty: filters.difficulty || undefined,
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

  const handleLevelChange = (level: string) => {
    setFilters((prev) => ({ ...prev, level: level as any }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleDifficultyChange = (difficulty: number) => {
    setFilters((prev) => ({ ...prev, difficulty }));
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-secondary-50 dark:bg-secondary-950 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Title
            level={1}
            className="!mb-2 text-secondary-900 dark:text-secondary-100"
          >
            🗣️ Bài học hội thoại
          </Title>
          <Text className="text-lg text-secondary-600 dark:text-secondary-400">
            Luyện tập hội thoại tiếng Nhật theo phương pháp Duolingo - Nghe →
            Hiểu → Nói → Lặp lại
          </Text>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <Title
            level={4}
            className="!mb-4 text-secondary-900 dark:text-secondary-100"
          >
            Bộ lọc
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text strong className="text-sm">
                  Trình độ:
                </Text>
              </div>
              <Select
                value={filters.level}
                onChange={handleLevelChange}
                className="w-full"
                size="large"
              >
                <Option value="">Tất cả</Option>
                <Option value="N5">N5</Option>
                <Option value="N4">N4</Option>
                <Option value="N3">N3</Option>
                <Option value="N2">N2</Option>
                <Option value="N1">N1</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text strong className="text-sm">
                  Danh mục:
                </Text>
              </div>
              <Select
                value={filters.category}
                onChange={handleCategoryChange}
                className="w-full"
                size="large"
                allowClear
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
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="mb-2">
                <Text strong className="text-sm">
                  Độ khó:
                </Text>
              </div>
              <Select
                value={filters.difficulty || undefined}
                onChange={handleDifficultyChange}
                className="w-full"
                size="large"
                allowClear
              >
                <Option value={1}>⭐ Rất dễ</Option>
                <Option value={2}>⭐⭐ Dễ</Option>
                <Option value={3}>⭐⭐⭐ Trung bình</Option>
                <Option value={4}>⭐⭐⭐⭐ Khó</Option>
                <Option value={5}>⭐⭐⭐⭐⭐ Rất khó</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card
              key={lesson.lesson_id}
              hoverable
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleLessonClick(lesson)}
              cover={
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">
                      {getCategoryIcon(lesson.category)}
                    </div>
                    <div className="text-sm font-medium">
                      {getCategoryText(lesson.category)}
                    </div>
                  </div>
                </div>
              }
              actions={[
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  key="start"
                >
                  Bắt đầu
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div className="flex justify-between items-start">
                    <Text strong className="text-lg flex-1">
                      {lesson.lesson_title}
                    </Text>
                    <div className="flex items-center space-x-1">
                      <StarOutlined className="text-yellow-500 text-sm" />
                      <span
                        className="text-sm font-medium"
                        style={{ color: getDifficultyColor(lesson.difficulty) }}
                      >
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                }
                description={
                  <div className="space-y-2">
                    <Text className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {lesson.situation_vi}
                    </Text>

                    <div className="flex items-center justify-between">
                      <Space>
                        <Tag color="blue">{lesson.level}</Tag>
                        <Tag color="green">
                          {getDifficultyText(lesson.difficulty)}
                        </Tag>
                      </Space>

                      <div className="flex items-center text-xs text-gray-500">
                        <ClockCircleOutlined className="mr-1" />
                        {lesson.estimated_duration} phút
                      </div>
                    </div>

                    {lesson.usage_count > 0 && (
                      <div className="text-xs text-gray-500">
                        Đã học {lesson.usage_count} lần
                      </div>
                    )}
                  </div>
                }
              />
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {lessons.length === 0 && !loading && (
          <Card className="text-center py-12">
            <BookOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={4} className="text-gray-500">
              Không tìm thấy bài học nào
            </Title>
            <Text className="text-gray-400">
              Thử thay đổi bộ lọc để tìm kiếm bài học phù hợp
            </Text>
          </Card>
        )}

        {/* Pagination Info */}
        {lessons.length > 0 && (
          <div className="mt-6 text-center">
            <Text type="secondary">
              Hiển thị {lessons.length}/{pagination.total} bài học
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationComponent;
