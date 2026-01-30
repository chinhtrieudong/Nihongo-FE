import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { lessonAPI, userStatsAPI } from "../services/api";
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
  Col,
  Drawer,
  Dropdown
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
  UserOutlined,
  MenuOutlined,
  MoreOutlined
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
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Dashboard data - should be fetched from API
  const [learningStreak, setLearningStreak] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({ lessonsThisWeek: 0, studyTimeThisWeek: 0, averageScore: 0 });

  useEffect(() => {
    loadLessons();
    loadDashboardStats();
  }, [currentUser]); // Load lại lessons khi user thay đổi

  const loadDashboardStats = async () => {
    try {
      console.log('🚀 LessonsList: Loading dashboard stats using accessToken');

      // Calculate progress from lessons data
      const completedLessons = lessons.filter(l => l.status === "completed").length;
      const totalLessons = lessons.length;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      setOverallProgress(progress);

      // Load dashboard statistics from API using accessToken
      const [dashboardStats, weeklyStatsData] = await Promise.all([
        userStatsAPI.getDashboardStats(),
        userStatsAPI.getWeeklyStats()
      ]);

      // Set dashboard stats
      if (dashboardStats.success) {
        setLearningStreak(dashboardStats.data.learningStreak || 0);
        setTotalHours(dashboardStats.data.totalStudyTime || 0);
      }

      // Set weekly stats
      if (weeklyStatsData.success) {
        setWeeklyStats({
          lessonsThisWeek: weeklyStatsData.data.lessonsCompleted || 0,
          studyTimeThisWeek: weeklyStatsData.data.studyHours || 0,
          averageScore: weeklyStatsData.data.averageScore || 0
        });
      }

    } catch (err) {
      console.error('❌ LessonsList: Failed to load dashboard stats:', err);
      // Set default values on error
      setLearningStreak(0);
      setTotalHours(0);
      setWeeklyStats({ lessonsThisWeek: 0, studyTimeThisWeek: 0, averageScore: 0 });
    }
  };

  const loadLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🚀 LessonsList: Calling loadLessons using accessToken');

      const response: LessonsResponse = await lessonAPI.getLessons();

      console.log('📥 LessonsList API Response:', response);

      if (response.success && response.data) {
        setLessons(response.data.lessons);
        console.log(`✅ LessonsList: Loaded ${response.data.lessons.length} lessons with progress`);

        // Load dashboard stats after lessons are loaded
        loadDashboardStats();

        // Log status và progress của từng lesson
        response.data.lessons.forEach((lesson: any, index: number) => {
          console.log(`LessonsList - Lesson ${index + 1}: ${lesson.title} - Status: ${lesson.status}, Progress: ${lesson.progress}%`);
        });
      } else {
        setError("Failed to load lessons");
        console.error('❌ LessonsList: API response failed:', response);
      }
    } catch (err) {
      setError("Error loading lessons");
      console.error("❌ LessonsList: Failed to load lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadLessonsByLevel = async (level: string) => {
    setLoading(true);
    try {
      console.log(`🚀 LessonsList: Loading ${level} lessons using accessToken`);

      const response: LessonsResponse = await lessonAPI.getLessons(level);

      if (response.success && response.data) {
        setLessons(response.data.lessons);
        console.log(`✅ LessonsList: Loaded ${response.data.lessons.length} ${level} lessons`);
      }
    } catch (err) {
      console.error(`❌ LessonsList: Failed to load ${level} lessons:`, err);
    } finally {
      setLoading(false);
    }
  };

  const loadLessonsWithPagination = async (limit: number, offset: number) => {
    setLoading(true);
    try {
      console.log(`🚀 LessonsList: Loading lessons with pagination - limit: ${limit}, offset: ${offset}`);

      const response: LessonsResponse = await lessonAPI.getLessons(undefined, limit, offset);

      if (response.success && response.data) {
        setLessons(response.data.lessons);
        console.log(`✅ LessonsList: Loaded ${response.data.lessons.length} lessons (page ${Math.floor(offset / limit) + 1})`);
      }
    } catch (err) {
      console.error('❌ LessonsList: Failed to load lessons with pagination:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✔";
      case "in_progress":
        return "🔓";
      default:
        return "🔒";
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
          text: "Ôn tập",
          type: "default" as const,
          icon: <ReloadOutlined />,
          className: "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-secondary-600 dark:text-secondary-400 dark:hover:border-secondary-500 dark:hover:text-secondary-300"
        };
      case "in_progress":
        return {
          text: "Tiếp tục",
          type: "primary" as const,
          icon: <PlayCircleOutlined />,
          className: "bg-green-500 hover:bg-green-600 border-green-500"
        };
      default:
        return {
          text: "Bắt đầu",
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
      const courseMatch = selectedCourse === "minna1"
        ? lesson.lessonNumber <= 25
        : lesson.lessonNumber > 25;

      const searchMatch = searchQuery === '' ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `bài ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase()) ||
        `lesson ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase());

      const levelMatch = filters.level.length === 0 || (lesson.level && filters.level.includes(lesson.level));
      const statusMatch = filters.status.length === 0 || (lesson.status && filters.status.includes(lesson.status));

      return courseMatch && searchMatch && levelMatch && statusMatch;
    });

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

  // Update dashboard stats when lesson is completed
  const updateDashboardStatsOnComplete = async (lesson: Lesson) => {
    try {
      console.log('📊 Updating dashboard stats after completing lesson:', lesson.title);

      // Calculate new stats (this could also be done on backend)
      const completedLessons = lessons.filter(l => l.status === "completed").length;
      const newLearningStreak = learningStreak + 1;
      const newTotalHours = totalHours + (lesson.estimatedTime || 1); // Default 1 hour if not specified

      // Update dashboard stats using new endpoint
      await userStatsAPI.updateDashboardStats({
        learningStreak: newLearningStreak,
        totalStudyTime: newTotalHours
      });

      // Update local state
      setLearningStreak(newLearningStreak);
      setTotalHours(newTotalHours);

      console.log('✅ Dashboard stats updated successfully');
    } catch (error) {
      console.error('❌ Failed to update dashboard stats:', error);
    }
  };

  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-4 lg:space-y-6">
      <Card className="shadow-sm">
        <Title level={4} className={`!mb-3 lg:!mb-4 ${isMobile ? 'text-base' : 'text-base lg:text-lg'} text-gray-900 dark:text-secondary-100`}>
          Khóa học
        </Title>
        <div className="space-y-2">
          <Button
            size={isMobile ? "middle" : "large"}
            block
            type={selectedCourse === "minna1" ? "primary" : "default"}
            className={selectedCourse === "minna1" ? "bg-blue-500 border-blue-500" : ""}
            onClick={() => {
              setSelectedCourse("minna1");
              setFilterDrawerVisible(false);
            }}
          >
            <BookOutlined /> Minna I
          </Button>
          <Button
            size={isMobile ? "middle" : "large"}
            block
            type={selectedCourse === "minna2" ? "primary" : "default"}
            className={selectedCourse === "minna2" ? "bg-purple-500 border-purple-500" : ""}
            onClick={() => {
              setSelectedCourse("minna2");
              setFilterDrawerVisible(false);
            }}
          >
            <BookOutlined /> Minna II
          </Button>
        </div>
      </Card>

      <Card className="shadow-sm">
        <Title level={4} className={`!mb-3 lg:!mb-4 ${isMobile ? 'text-base' : 'text-base lg:text-lg'} text-gray-900 dark:text-secondary-100`}>
          Tiến độ học tập
        </Title>
        <div className="space-y-3">
          <Statistic
            title="Đã hoàn thành"
            value={lessons.filter(l => l.status === "completed").length}
            suffix={`/ ${lessons.length}`}
            styles={{ content: { color: '#52c41a', fontSize: '20px' } }}
          />
          <Statistic
            title="Đang học"
            value={lessons.filter(l => l.status === "in_progress").length}
            styles={{ content: { color: '#1890ff', fontSize: '20px' } }}
          />
          <Statistic
            title="Chưa bắt đầu"
            value={lessons.filter(l => l.status !== "completed" && l.status !== "in_progress").length}
            styles={{ content: { color: '#8c8c8c', fontSize: '20px' } }}
          />
        </div>
      </Card>

      <Card className="shadow-sm">
        <Title level={4} className={`!mb-3 lg:!mb-4 ${isMobile ? 'text-base' : 'text-base lg:text-lg'} text-gray-900 dark:text-secondary-100`}>
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
              onChange={(value) => {
                setFilters(prev => ({ ...prev, level: value }));
                if (isMobile) {
                  setFilterDrawerVisible(false);
                }
              }}
              className="w-full"
              size={isMobile ? "middle" : "large"}
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
              onChange={(value) => {
                setFilters(prev => ({ ...prev, status: value }));
                if (isMobile) {
                  setFilterDrawerVisible(false);
                }
              }}
              className="w-full"
              size={isMobile ? "middle" : "large"}
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
              onChange={(value) => {
                setFilters(prev => ({ ...prev, sortBy: value }));
                if (isMobile) {
                  setFilterDrawerVisible(false);
                }
              }}
              className="w-full"
              size={isMobile ? "middle" : "large"}
            >
              <Option value="lessonOrder">Thứ tự bài học</Option>
              <Option value="progress">Tiến độ %</Option>
              <Option value="recentlyLearned">Gần đây</Option>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );

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
        <div className="text-center px-4">
          <Title level={3} className="text-red-600">Lỗi</Title>
          <Text className="text-secondary-700 dark:text-secondary-400">{error}</Text>
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
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 pb-20 md:pb-6">
      {/* Hero Section */}
      <div className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary-100 dark:bg-primary-900 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOutlined className="text-2xl sm:text-3xl text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <Title level={2} className="!mb-0 sm:!mb-1 text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-900 dark:text-secondary-100">
                  Minna no Nihongo
                </Title>
                <Text className="text-gray-600 dark:text-secondary-400 text-xs sm:text-sm lg:text-base">
                  50 Bài | N5 → N4
                </Text>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <div className="text-center">
                <div className="flex items-center gap-1 sm:gap-2 text-orange-500">
                  <FireOutlined className="text-lg sm:text-xl lg:text-2xl" />
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-secondary-100">
                    {learningStreak}
                  </span>
                </div>
                <Text className="text-gray-600 dark:text-secondary-400 text-xs sm:text-sm">Chuỗi</Text>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-1 sm:gap-2 text-blue-500">
                  <ClockCircleOutlined className="text-lg sm:text-xl lg:text-2xl" />
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-secondary-100">
                    {totalHours}h
                  </span>
                </div>
                <Text className="text-gray-600 dark:text-secondary-400 text-xs sm:text-sm hidden sm:block">Tổng thời gian</Text>
                <Text className="text-gray-600 dark:text-secondary-400 text-xs sm:hidden">Giờ học</Text>
              </div>

              <div className="text-center min-w-20 sm:min-w-32 lg:min-w-48">
                <Progress
                  percent={overallProgress}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#52c41a',
                  }}
                  className="mb-1 sm:mb-2"
                  size="small"
                />
                <Text className="text-gray-600 dark:text-secondary-400 text-xs sm:text-sm hidden sm:block">Tiến trình học</Text>
                <Text className="text-gray-600 dark:text-secondary-400 text-xs sm:hidden">Tiến độ</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Left Sidebar - Desktop & Tablet */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <FilterSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                <Input
                  placeholder="Tìm kiếm bài học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined />}
                  size="large"
                  className="flex-1"
                  allowClear
                />

                <Button
                  size="large"
                  icon={<FilterOutlined />}
                  onClick={() => setFilterDrawerVisible(true)}
                  className="md:hidden flex-shrink-0"
                >
                  <span className="hidden sm:inline ml-1">Lọc</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Text className="text-gray-600 dark:text-secondary-400 text-xs sm:text-sm flex-shrink-0">Lọc nhanh:</Text>
                {['N5', 'N4'].map(level => (
                  <Tag
                    key={level}
                    color={filters.level.includes(level) ? 'blue' : 'default'}
                    className="cursor-pointer text-xs sm:text-sm m-0"
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
                    className="cursor-pointer text-xs sm:text-sm m-0"
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              <Card className="shadow-sm">
                <Statistic
                  title={<span className="text-xs sm:text-sm">Tuần này</span>}
                  value={weeklyStats.lessonsThisWeek}
                  suffix="bài"
                  prefix={<TrophyOutlined className="text-yellow-500" />}
                  styles={{ content: { fontSize: '18px', fontWeight: 600 } }}
                />
              </Card>
              <Card className="shadow-sm">
                <Statistic
                  title={<span className="text-xs sm:text-sm">Thời gian học</span>}
                  value={weeklyStats.studyTimeThisWeek}
                  suffix="giờ"
                  prefix={<ClockCircleOutlined className="text-blue-500" />}
                  styles={{ content: { fontSize: '18px', fontWeight: 600 } }}
                />
              </Card>
              <Card className="shadow-sm col-span-2 lg:col-span-1">
                <Statistic
                  title={<span className="text-xs sm:text-sm">Điểm trung bình</span>}
                  value={weeklyStats.averageScore}
                  suffix="%"
                  prefix={<StarOutlined className="text-orange-500" />}
                  styles={{ content: { fontSize: '18px', fontWeight: 600 } }}
                />
              </Card>
            </div>

            {/* Lesson List */}
            <div className="space-y-3 sm:space-y-4">
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
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-primary-900 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-primary-700">
                              <span className="text-blue-700 dark:text-primary-400 font-bold text-base sm:text-lg">
                                {lesson.lessonNumber}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white dark:border-secondary-900 ${lesson.status === 'completed' ? 'bg-green-500' :
                              lesson.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                              }`} />
                          </div>

                          <div className="sm:hidden flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <Title level={5} className="!mb-0 text-base text-gray-900 dark:text-secondary-100 flex-1 line-clamp-2">
                                {lesson.title}
                              </Title>
                              <Tag color={lesson.level === 'N5' ? 'green' : 'blue'} className="text-xs flex-shrink-0">
                                {lesson.level}
                              </Tag>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="hidden sm:flex items-center gap-2 mb-1">
                            <Title level={4} className="!mb-0 text-base lg:text-lg text-gray-900 dark:text-secondary-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 flex-1">
                              {lesson.title}
                            </Title>
                            <Tag color={lesson.level === 'N5' ? 'green' : 'blue'} className="flex-shrink-0">
                              {lesson.level}
                            </Tag>
                          </div>

                          <Text className="text-gray-600 dark:text-secondary-400 text-xs sm:text-sm mb-2 block line-clamp-2">
                            {lesson.description}
                          </Text>

                          <div className="mb-2 sm:mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <Text className="text-xs text-gray-500 dark:text-secondary-400">
                                Tiến độ
                              </Text>
                              <Text className="text-xs font-medium text-gray-700 dark:text-secondary-300">
                                {lesson.progress || 0}%
                              </Text>
                            </div>
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

                          <div className="flex items-center gap-2 sm:gap-3">
                            {skills.map((skill, index) => (
                              <Tooltip key={index} title={skill.label}>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 dark:bg-secondary-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-secondary-400 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-xs sm:text-sm">
                                  {skill.icon}
                                </div>
                              </Tooltip>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-between sm:justify-end sm:flex-col sm:items-end">
                          <Button
                            type={actionButton.type}
                            icon={actionButton.icon}
                            className={actionButton.className}
                            size="middle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(lesson);
                            }}
                          >
                            <span className="hidden sm:inline">{actionButton.text}</span>
                          </Button>

                          <Tooltip title={isBookmarked ? "Xóa đánh dấu" : "Đánh dấu"}>
                            <Button
                              type="text"
                              size="middle"
                              icon={isBookmarked ? <BookmarkFilled className="text-yellow-500" /> : <BookmarkOutlined />}
                              onClick={(e) => toggleBookmark(lesson.id, e)}
                              className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            />
                          </Tooltip>
                        </div>
                      </div>

                      <div className="hidden md:block mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
      </div>

      <Drawer
        title="Bộ lọc & Sắp xếp"
        placement="right"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={320}
        className="sm:!w-80"
      >
        <FilterSidebar isMobile={true} />
      </Drawer>
    </div>
  );
};

export default LessonsList;
