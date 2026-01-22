import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { lessonAPI } from "../services/api";
import type { LessonsResponse, Lesson } from "../types/lesson";
import {
  Card,
  Input,
  Button,
  Tag,
  Spin,
  Empty,
  Typography,
  Progress,
  Avatar,
  Badge,
  Tooltip,
  Select,
  Space,
  Divider,
  Switch,
  Calendar,
  Statistic,
  Row,
  Col
} from "antd";
import {
  BookOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  FireOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  StarOutlined,
  StarFilled,
  FilterOutlined,
  SortAscendingOutlined,
  AudioOutlined,
  ReadOutlined,
  EditOutlined,
  TranslationOutlined,
  QuestionCircleOutlined,
  BookOutlined as BookmarkOutlined,
  BookFilled as BookmarkFilled,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  BookOutlined as BookIcon,
  CommentOutlined,
  UserOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface FilterState {
  level: string[];
  status: string[];
  content: string[];
  sortBy: string;
}

const LessonsList: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<"minna1" | "minna2">("minna1");
  const [filters, setFilters] = useState<FilterState>({
    level: [],
    status: [],
    content: [],
    sortBy: "lessonOrder"
  });
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());

  // Mock data for dashboard widgets
  const [learningStreak] = useState(15);
  const [totalHours] = useState(127);
  const [overallProgress] = useState(68);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: LessonsResponse = await lessonAPI.getLessons(
        currentUser?.id,
        undefined,
        50,
        0
      );

      if (response.success && response.data) {
        setLessons(response.data.lessons);
      } else {
        setError("Failed to load lessons");
      }
    } catch (err) {
      setError("Error loading lessons");
      console.error("Failed to load lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✔";
      case "in_progress":
        return "🔄";
      default:
        return "⏳";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      default:
        return "bg-secondary-100 text-secondary-700 border-secondary-200 dark:bg-secondary-800 dark:text-secondary-400 dark:border-secondary-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã xong";
      case "in_progress":
        return "Đang học";
      default:
        return "Chưa học";
    }
  };

  const getSkillIcons = (lesson: Lesson) => {
    const skills = [
      { icon: <AudioOutlined />, label: "Listening", available: true },
      { icon: <BookOutlined />, label: "Vocabulary", available: true },
      { icon: <EditOutlined />, label: "Grammar", available: true },
      { icon: <TranslationOutlined />, label: "Kanji", available: lesson.level !== "N5" },
      { icon: <QuestionCircleOutlined />, label: "Quiz", available: true }
    ];

    return skills.filter(skill => skill.available);
  };

  const getActionButton = (lesson: Lesson) => {
    switch (lesson.status) {
      case "completed":
        return {
          text: "Review",
          type: "default" as const,
          icon: <ReloadOutlined />,
          className: "border-secondary-300 text-secondary-600 hover:border-secondary-400 hover:text-secondary-700"
        };
      case "in_progress":
        return {
          text: "Continue",
          type: "primary" as const,
          icon: <PlayCircleOutlined />,
          className: "bg-green-500 hover:bg-green-600 border-green-500"
        };
      default:
        return {
          text: "Start",
          type: "primary" as const,
          icon: <PlayCircleOutlined />,
          className: "bg-blue-500 hover:bg-blue-600 border-blue-500"
        };
    }
  };

  const toggleBookmark = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarks = new Set(bookmarkedLessons);
    if (newBookmarks.has(lessonId)) {
      newBookmarks.delete(lessonId);
    } else {
      newBookmarks.add(lessonId);
    }
    setBookmarkedLessons(newBookmarks);
  };

  const filteredAndSortedLessons = useMemo(() => {
    let filtered = lessons.filter(lesson => {
      // Course filter
      const courseMatch = selectedCourse === "minna1"
        ? lesson.lessonNumber <= 25
        : lesson.lessonNumber > 25;

      // Search filter
      const searchMatch = searchQuery === '' ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `bài ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase()) ||
        `lesson ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase());

      // Level filter
      const levelMatch = filters.level.length === 0 || (lesson.level && filters.level.includes(lesson.level));

      // Status filter
      const statusMatch = filters.status.length === 0 || (lesson.status && filters.status.includes(lesson.status));

      return courseMatch && searchMatch && levelMatch && statusMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "lessonOrder":
          return a.lessonNumber - b.lessonNumber;
        case "progress":
          return (b.progress || 0) - (a.progress || 0);
        case "recentlyLearned":
          return new Date((b as any).updatedAt || 0).getTime() - new Date((a as any).updatedAt || 0).getTime();
        default:
          return a.lessonNumber - b.lessonNumber;
      }
    });

    return filtered;
  }, [lessons, searchQuery, selectedCourse, filters]);

  const handleLessonClick = (lesson: Lesson) => {
    navigate(`/lessons/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-50 dark:bg-secondary-950">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600 dark:text-secondary-400">Đang tải bài học...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary-50 dark:bg-secondary-950">
        <div className="text-center">
          <Title level={3} className="text-red-600">Lỗi</Title>
          <Text className="text-secondary-700 dark:text-secondary-400">{error}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center">
                <BookOutlined className="text-3xl text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <Title level={1} className="!mb-1 text-gray-900 dark:text-secondary-100">
                  Minna no Nihongo
                </Title>
                <Text className="text-gray-600 dark:text-secondary-400 text-lg">
                  50 Lessons | N5 → N4
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="flex items-center gap-2 text-orange-500">
                  <FireOutlined className="text-2xl" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-secondary-100">
                    {learningStreak}
                  </span>
                </div>
                <Text className="text-gray-600 dark:text-secondary-400 text-sm">Day streak</Text>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-2 text-blue-500">
                  <ClockCircleOutlined className="text-2xl" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-secondary-100">
                    {totalHours}h
                  </span>
                </div>
                <Text className="text-gray-600 dark:text-secondary-400 text-sm">Total studied</Text>
              </div>

              <div className="text-center min-w-48">
                <Progress
                  percent={overallProgress}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#52c41a',
                  }}
                  className="mb-2"
                />
                <Text className="text-gray-600 dark:text-secondary-400 text-sm">Overall progress</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Course Switcher */}
              <Card className="shadow-sm">
                <Title level={4} className="!mb-4 text-gray-900 dark:text-secondary-100">
                  Khóa học
                </Title>
                <div className="space-y-2">
                  <Button
                    size="large"
                    block
                    type={selectedCourse === "minna1" ? "primary" : "default"}
                    className={selectedCourse === "minna1" ? "bg-blue-500 border-blue-500" : ""}
                    onClick={() => setSelectedCourse("minna1")}
                  >
                    <BookOutlined /> Minna I
                  </Button>
                  <Button
                    size="large"
                    block
                    type={selectedCourse === "minna2" ? "primary" : "default"}
                    className={selectedCourse === "minna2" ? "bg-purple-500 border-purple-500" : ""}
                    onClick={() => setSelectedCourse("minna2")}
                  >
                    <BookOutlined /> Minna II
                  </Button>
                </div>
              </Card>

              {/* Progress Summary */}
              <Card className="shadow-sm">
                <Title level={4} className="!mb-4 text-gray-900 dark:text-secondary-100">
                  Tiến độ học tập
                </Title>
                <div className="space-y-3">
                  <Statistic
                    title="Đã hoàn thành"
                    value={lessons.filter(l => l.status === "completed").length}
                    suffix={`/ ${lessons.length}`}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic
                    title="Đang học"
                    value={lessons.filter(l => l.status === "in_progress").length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Statistic
                    title="Chưa bắt đầu"
                    value={lessons.filter(l => l.status !== "completed" && l.status !== "in_progress").length}
                    valueStyle={{ color: '#8c8c8c' }}
                  />
                </div>
              </Card>

              {/* Filters */}
              <Card className="shadow-sm">
                <Title level={4} className="!mb-4 text-gray-900 dark:text-secondary-100">
                  <FilterOutlined /> Bộ lọc
                </Title>

                <div className="space-y-4">
                  <div>
                    <Text className="text-gray-700 dark:text-secondary-300 text-sm font-medium mb-2 block">
                      Trình độ
                    </Text>
                    <Select
                      mode="multiple"
                      placeholder="Chọn trình độ"
                      value={filters.level}
                      onChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
                      className="w-full"
                    >
                      <Option value="N5">N5</Option>
                      <Option value="N4">N4</Option>
                    </Select>
                  </div>

                  <div>
                    <Text className="text-gray-700 dark:text-secondary-300 text-sm font-medium mb-2 block">
                      Trạng thái
                    </Text>
                    <Select
                      mode="multiple"
                      placeholder="Chọn trạng thái"
                      value={filters.status}
                      onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                      className="w-full"
                    >
                      <Option value="completed">Đã hoàn thành</Option>
                      <Option value="in_progress">Đang học</Option>
                      <Option value="not_started">Chưa bắt đầu</Option>
                    </Select>
                  </div>

                  <div>
                    <Text className="text-gray-700 dark:text-secondary-300 text-sm font-medium mb-2 block">
                      Sắp xếp
                    </Text>
                    <Select
                      value={filters.sortBy}
                      onChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                      className="w-full"
                    >
                      <Option value="lessonOrder">Thứ tự bài học</Option>
                      <Option value="progress">Tiến độ %</Option>
                      <Option value="recentlyLearned">Gần đây</Option>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Input
                  placeholder="Tìm kiếm bài học, ngữ pháp, kanji (ví dụ: て形, ない形)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined />}
                  size="large"
                  className="flex-1"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <Text className="text-gray-600 dark:text-secondary-400 text-sm">Lọc nhanh:</Text>
                {['N5', 'N4'].map(level => (
                  <Tag
                    key={level}
                    color={filters.level.includes(level) ? 'blue' : 'default'}
                    className="cursor-pointer"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        level: prev.level.includes(level)
                          ? prev.level.filter(l => l !== level)
                          : [...prev.level, level]
                      }));
                    }}
                  >
                    {level}
                  </Tag>
                ))}
                {['completed', 'in_progress', 'not_started'].map(status => (
                  <Tag
                    key={status}
                    color={filters.status.includes(status) ? 'green' : 'default'}
                    className="cursor-pointer"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        status: prev.status.includes(status)
                          ? prev.status.filter(s => s !== status)
                          : [...prev.status, status]
                      }));
                    }}
                  >
                    {status === 'completed' ? 'Đã xong' : status === 'in_progress' ? 'Đang học' : 'Mới'}
                  </Tag>
                ))}
              </div>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-sm">
                <Statistic
                  title="Tuần này"
                  value={5}
                  suffix="bài học"
                  prefix={<TrophyOutlined className="text-yellow-500" />}
                />
              </Card>
              <Card className="shadow-sm">
                <Statistic
                  title="Thời gian học"
                  value={12.5}
                  suffix="giờ"
                  prefix={<ClockCircleOutlined className="text-blue-500" />}
                />
              </Card>
              <Card className="shadow-sm">
                <Statistic
                  title="Điểm trung bình"
                  value={85}
                  suffix="%"
                  prefix={<StarOutlined className="text-orange-500" />}
                />
              </Card>
            </div>

            {/* Lesson List */}
            <div className="space-y-4">
              {filteredAndSortedLessons.length === 0 ? (
                <Empty
                  description="Không tìm thấy bài học nào"
                  className="py-12"
                />
              ) : (
                filteredAndSortedLessons.map((lesson) => {
                  const actionButton = getActionButton(lesson);
                  const skills = getSkillIcons(lesson);
                  const isBookmarked = bookmarkedLessons.has(lesson.id);

                  return (
                    <Card
                      key={lesson.id}
                      className="shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => handleLessonClick(lesson)}
                      hoverable
                    >
                      <div className="flex items-center gap-4">
                        {/* Left - Lesson Number & Status */}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-primary-900 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-primary-700">
                              <span className="text-blue-700 dark:text-primary-400 font-bold text-lg">
                                {lesson.lessonNumber}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-secondary-900 ${lesson.status === 'completed' ? 'bg-green-500' :
                              lesson.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                              }`} />
                          </div>
                        </div>

                        {/* Center - Lesson Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Title level={4} className="!mb-0 text-gray-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {lesson.title}
                            </Title>
                            <Tag color={lesson.level === 'N5' ? 'green' : 'blue'}>
                              {lesson.level}
                            </Tag>
                          </div>

                          <Text className="text-gray-600 dark:text-secondary-400 text-sm mb-2 block">
                            {lesson.description}
                          </Text>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <Progress
                              percent={lesson.progress || 0}
                              strokeColor={
                                lesson.status === 'completed' ? '#52c41a' :
                                  lesson.status === 'in_progress' ? '#1890ff' : '#d9d9d9'
                              }
                              size="small"
                              showInfo={false}
                            />
                          </div>

                          {/* Skill Icons */}
                          <div className="flex items-center gap-3">
                            {skills.map((skill, index) => (
                              <Tooltip key={index} title={skill.label}>
                                <div className="w-8 h-8 bg-gray-100 dark:bg-secondary-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-secondary-400 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                  {skill.icon}
                                </div>
                              </Tooltip>
                            ))}
                          </div>
                        </div>

                        {/* Right - Actions */}
                        <div className="flex items-center gap-3">
                          <Button
                            type={actionButton.type}
                            icon={actionButton.icon}
                            className={actionButton.className}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                            }}
                          >
                            {actionButton.text}
                          </Button>

                          <Tooltip title={isBookmarked ? "Xóa đánh dấu" : "Đánh dấu"}>
                            <Button
                              type="text"
                              icon={isBookmarked ? <BookmarkFilled className="text-yellow-500" /> : <BookmarkOutlined />}
                              onClick={(e) => toggleBookmark(lesson.id, e)}
                              className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            />
                          </Tooltip>
                        </div>
                      </div>

                      {/* Quick Actions (shown on hover) */}
                      <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Text className="text-gray-600 dark:text-secondary-400 text-sm">
                              Trạng thái:
                            </Text>
                            <Tag className={getStatusColor(lesson.status)}>
                              {getStatusIcon(lesson.status)}
                              <span className="ml-1">{getStatusText(lesson.status)}</span>
                            </Tag>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button size="small" icon={<EyeOutlined />}>
                              Xem trước
                            </Button>
                            <Button size="small" icon={<ReloadOutlined />}>
                              Làm lại
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center justify-around py-2">
            <Button type="text" icon={<HomeOutlined />} className="flex flex-col items-center py-2">
              <span className="text-xs mt-1">Home</span>
            </Button>
            <Button type="text" icon={<BookIcon />} className="flex flex-col items-center py-2 text-primary-600">
              <span className="text-xs mt-1">Lessons</span>
            </Button>
            <Button type="text" icon={<CommentOutlined />} className="flex flex-col items-center py-2">
              <span className="text-xs mt-1">Review</span>
            </Button>
            <Button type="text" icon={<UserOutlined />} className="flex flex-col items-center py-2">
              <span className="text-xs mt-1">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsList;
