import React, { useState } from "react";
import {
  Button,
  Card,
  Tag,
  Avatar,
  Typography,
  Space,
  Badge,
  Divider,
  Row,
  Col,
  Input,
  Select,
  Slider,
  Drawer
} from "antd";
import {
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  FilterOutlined,
  SwapOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  StarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  SearchOutlined,
  ClearOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// Mock data
const mockLessons = [
  {
    id: 1,
    title: "Chào hỏi cơ bản",
    titleJp: "基本的な挨拶",
    icon: "👋",
    level: "N5",
    difficulty: "Rất dễ",
    duration: 10,
    rating: 4.5,
    category: "greetings"
  },
  {
    id: 2,
    title: "Giới thiệu bản thân",
    titleJp: "自己紹介",
    icon: "🙋",
    level: "N5",
    difficulty: "Dễ",
    duration: 15,
    rating: 4.8,
    category: "self_introduction"
  },
  {
    id: 3,
    title: "Đi mua sắm",
    titleJp: "買い物に行く",
    icon: "🛒",
    level: "N4",
    difficulty: "Trung bình",
    duration: 20,
    rating: 4.2,
    category: "shopping"
  }
];

const ConversationMobile: React.FC = () => {
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    difficulty: 0,
    minDuration: 0,
    maxDuration: 120,
    searchTerm: ''
  });

  // Auto-generate active filters from filters state
  const activeFilters = React.useMemo(() => {
    const result = [];

    if (filters.level)
      result.push({ key: "level", label: filters.level });

    if (filters.category) {
      const categoryLabels: { [key: string]: string } = {
        greetings: "Chào hỏi",
        self_introduction: "Giới thiệu bản thân",
        daily_life: "Đời sống hàng ngày",
        shopping: "Mua sắm",
        restaurant: "Nhà hàng",
        travel: "Du lịch",
        business: "Công việc",
        school: "Trường học",
        hospital: "Bệnh viện",
        other: "Khác"
      };
      result.push({ key: "category", label: categoryLabels[filters.category] || filters.category });
    }

    if (filters.difficulty) {
      const difficultyLabels = ["", "Rất dễ", "Dễ", "Trung bình", "Khó", "Rất khó"];
      result.push({
        key: "difficulty",
        label: difficultyLabels[filters.difficulty]
      });
    }

    if (filters.minDuration !== 0 || filters.maxDuration !== 120)
      result.push({
        key: "duration",
        label: `${filters.minDuration}-${filters.maxDuration} phút`
      });

    if (filters.searchTerm)
      result.push({ key: "searchTerm", label: `"${filters.searchTerm}"` });

    return result;
  }, [filters]);

  const removeFilter = (filter: any) => {
    setFilters(prev => {
      const copy = { ...prev };
      if (filter.key === "duration") {
        copy.minDuration = 0;
        copy.maxDuration = 120;
      } else {
        // @ts-ignore
        copy[filter.key] = filter.key === "difficulty" ? 0 : "";
      }
      return copy;
    });
  };

  const handleFilterClick = () => {
    setFilterDrawerVisible(true);
  };

  const clearAllFilters = () => {
    setFilters({
      level: '',
      category: '',
      difficulty: 0,
      minDuration: 0,
      maxDuration: 120,
      searchTerm: ''
    });
  };

  const FilterBar = () => (
    <div className="px-4 py-3 bg-gray-800 dark:bg-secondary-900">
      <Row gutter={8} justify="space-between">
        <Col span={14}>
          <Button
            size="large"
            className="w-full h-12 rounded-full border border-blue-400 text-blue-300 bg-blue-900/30 hover:bg-blue-900/40"
            icon={<FilterOutlined />}
            onClick={handleFilterClick}
          >
            Bộ lọc
            {activeFilters.length > 0 && (
              <Badge
                count={activeFilters.length}
                className="ml-2"
                style={{ backgroundColor: "#1677ff" }}
              />
            )}
          </Button>
        </Col>
        <Col span={9}>
          <Button
            size="large"
            className="w-full h-12 rounded-full border border-gray-600 text-gray-300 bg-gray-700/50 hover:bg-gray-700/70"
            icon={<SwapOutlined />}
          >
            Sắp xếp
          </Button>
        </Col>
      </Row>
    </div>
  );

  const ActiveFilters = () => {
    if (activeFilters.length === 0) return null;

    return (
      <div className="px-4 py-2 bg-gray-800 dark:bg-secondary-900">
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Tag
              key={index}
              closable
              onClose={() => removeFilter(filter)}
              closeIcon={<CloseOutlined className="text-xs" />}
              className="m-0 px-2 py-[2px] bg-gray-700 border border-gray-600 text-gray-200 rounded-full text-xs"
            >
              {filter.label}
            </Tag>
          ))}
        </div>
      </div>
    );
  };

  const LessonCard = ({ lesson }: { lesson: any }) => (
    <Card
      className="mx-4 mb-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border-0 hover:scale-[1.02] active:scale-[0.98]"
      styles={{ body: { padding: '16px' } }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{lesson.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <Title level={5} className="!mb-1 !text-gray-900 dark:!text-gray-100 text-base font-semibold line-clamp-1">
              {lesson.title}
            </Title>
            <Text className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
              {lesson.titleJp}
            </Text>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <StarOutlined className="text-yellow-500" />
              <span>{lesson.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOutlined />
              <span>{lesson.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockCircleOutlined />
              <span>{lesson.duration} phút</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-3">
            <Tag className="m-0 px-2 py-1 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 text-xs">
              {lesson.level}
            </Tag>
            <Tag className="m-0 px-2 py-1 bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 text-xs">
              {lesson.difficulty}
            </Tag>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="primary"
          shape="circle"
          icon={<PlayCircleOutlined />}
          className="flex-shrink-0 w-11 h-11 bg-blue-500 shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-200 active:scale-95"
        />
      </div>
    </Card>
  );

  const FilterDrawer = () => (
    <Drawer
      title="Bộ lọc"
      placement="bottom"
      onClose={() => setFilterDrawerVisible(false)}
      open={filterDrawerVisible}
      height="80%"
      className="filter-drawer"
    >
      <div className="space-y-6">
        {/* Search */}
        <div>
          <Text strong className="block mb-2">Tìm kiếm:</Text>
          <Search
            placeholder="Nhập tên bài học..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            allowClear
          />
        </div>

        {/* Level Filter */}
        <div>
          <Text strong className="block mb-2">Trình độ:</Text>
          <Select
            value={filters.level}
            onChange={(value) => setFilters(prev => ({ ...prev, level: value }))}
            className="w-full"
            allowClear
            placeholder="Chọn trình độ"
          >
            <Option value="N5">N5</Option>
            <Option value="N4">N4</Option>
            <Option value="N3">N3</Option>
            <Option value="N2">N2</Option>
            <Option value="N1">N1</Option>
          </Select>
        </div>

        {/* Category Filter */}
        <div>
          <Text strong className="block mb-2">Danh mục:</Text>
          <Select
            value={filters.category}
            onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            className="w-full"
            allowClear
            placeholder="Chọn danh mục"
          >
            <Option value="greetings">👋 Chào hỏi</Option>
            <Option value="self_introduction">🙋 Giới thiệu bản thân</Option>
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

        {/* Difficulty Filter */}
        <div>
          <Text strong className="block mb-2">Độ khó:</Text>
          <Select
            value={filters.difficulty || undefined}
            onChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
            className="w-full"
            allowClear
            placeholder="Chọn độ khó"
          >
            <Option value={1}>⭐ Rất dễ</Option>
            <Option value={2}>⭐⭐ Dễ</Option>
            <Option value={3}>⭐⭐⭐ Trung bình</Option>
            <Option value={4}>⭐⭐⭐⭐ Khó</Option>
            <Option value={5}>⭐⭐⭐⭐⭐ Rất khó</Option>
          </Select>
        </div>

        {/* Duration Range */}
        <div>
          <Text strong className="block mb-2">
            Thời lượng: {filters.minDuration}-{filters.maxDuration} phút
          </Text>
          <Slider
            range
            min={0}
            max={120}
            value={[filters.minDuration, filters.maxDuration]}
            onChange={(range) => setFilters(prev => ({
              ...prev,
              minDuration: range[0],
              maxDuration: range[1]
            }))}
            marks={{
              0: '0',
              30: '30',
              60: '60',
              90: '90',
              120: '120'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="default"
            icon={<ClearOutlined />}
            onClick={clearAllFilters}
            className="flex-1"
          >
            Xóa tất cả
          </Button>
          <Button
            type="primary"
            onClick={() => setFilterDrawerVisible(false)}
            className="flex-1"
          >
            Áp dụng bộ lọc
          </Button>
        </div>
      </div>
    </Drawer>
  );

  return (
    <div className="min-h-full bg-secondary-50 dark:bg-secondary-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-secondary-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Row justify="space-between" align="middle">
          <Col>
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="text-gray-700 dark:text-gray-300"
            />
          </Col>
          <Col>
            <Title level={4} className="!mb-0 !text-gray-900 dark:!text-gray-100 text-lg">
              Hội thoại
            </Title>
          </Col>
          <Col>
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-gray-700 dark:text-gray-300"
              />
            </Badge>
          </Col>
        </Row>
      </div>

      {/* Page Title */}
      <div className="px-4 py-6 bg-secondary-50 dark:bg-secondary-950">
        <Title level={2} className="!mb-2 !text-gray-900 dark:!text-gray-100 text-2xl font-bold">
          Bài học hội thoại
        </Title>
        <Text className="text-gray-600 dark:text-gray-400 text-base">
          Học tiếng Nhật qua hội thoại đời sống thực
        </Text>
      </div>

      {/* Filter Bar - Sticky */}
      <div className="sticky top-[56px] z-10">
        <FilterBar />
        <ActiveFilters />
      </div>

      {/* Results Count - Status Bar */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-secondary-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Tìm thấy <span className="font-medium text-gray-900 dark:text-gray-100">{mockLessons.length}</span> bài học
          </Text>
          <Button
            type="text"
            size="small"
            icon={<FilterOutlined />}
            onClick={handleFilterClick}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            {activeFilters.length > 0 && (
              <Badge
                count={activeFilters.length}
                size="small"
                style={{ backgroundColor: "#1677ff" }}
              />
            )}
          </Button>
        </div>
      </div>

      {/* Lesson List */}
      <div className="py-4">
        {mockLessons.map(lesson => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>

      {/* Filter Drawer */}
      <FilterDrawer />
    </div>
  );
};

export default ConversationMobile;
