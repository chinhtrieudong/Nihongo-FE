import React, { useState, useEffect } from "react";
import { Button, Card, Select, Badge, Avatar, Typography, Row, Col, message, Spin, Tag, Space, Divider, Input, Slider } from "antd";
import { RobotOutlined, UserOutlined, BookOutlined, PlayCircleOutlined, ClockCircleOutlined, StarOutlined, SearchOutlined, FilterOutlined, ClearOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { conversationLessonAPI, type ConversationLesson } from "../services/conversationLessonAPI";

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

export { }; // Export to make it a module for isolatedModules

const ConversationComponent: React.FC = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<ConversationLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        level: '' as 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | '',
        category: '' as string,
        difficulty: 0 as number,
        minDuration: 0 as number,
        maxDuration: 120 as number
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Load lessons on mount and when filters change
    useEffect(() => {
        loadLessons();
    }, [filters, searchTerm]);

    const loadLessons = async () => {
        try {
            setLoading(true);
            const params: any = {
                level: filters.level || undefined,
                category: filters.category || undefined,
                difficulty: filters.difficulty || undefined,
                min_duration: filters.minDuration || undefined,
                max_duration: filters.maxDuration || undefined,
                search: searchTerm || undefined,
                page: pagination.page,
                limit: pagination.limit
            };

            const response = await conversationLessonAPI.getLessons(params);
            if (response.success) {
                setLessons(response.data.lessons);
                setPagination(response.data.pagination);
            } else {
                message.error('Không thể tải danh sách bài học');
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
            message.error('Không thể tải danh sách bài học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleLevelChange = (level: string) => {
        setFilters(prev => ({ ...prev, level: level as any }));
    };

    const handleCategoryChange = (category: string) => {
        setFilters(prev => ({ ...prev, category }));
    };

    const handleDifficultyChange = (difficulty: number) => {
        setFilters(prev => ({ ...prev, difficulty }));
    };

    const handleDurationRangeChange = (range: number | number[]) => {
        if (Array.isArray(range)) {
            setFilters(prev => ({
                ...prev,
                minDuration: range[0],
                maxDuration: range[1]
            }));
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const clearFilters = () => {
        setFilters({
            level: '',
            category: '',
            difficulty: 0,
            minDuration: 0,
            maxDuration: 120
        });
        setSearchTerm('');
    };

    const getDifficultyColor = (difficulty: number) => {
        switch (difficulty) {
            case 1: return '#52c41a';
            case 2: return '#faad14';
            case 3: return '#fa8c16';
            case 4: return '#f5222d';
            case 5: return '#722ed1';
            default: return '#d9d9d9';
        }
    };

    const getDifficultyText = (difficulty: number) => {
        switch (difficulty) {
            case 1: return 'Rất dễ';
            case 2: return 'Dễ';
            case 3: return 'Trung bình';
            case 4: return 'Khó';
            case 5: return 'Rất khó';
            default: return 'Không xác định';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'greetings': return '👋';
            case 'self_introduction': return '🙋';
            case 'daily_life': return '🏠';
            case 'shopping': return '🛒';
            case 'restaurant': return '🍽️';
            case 'travel': return '✈️';
            case 'business': return '💼';
            case 'school': return '🎓';
            case 'hospital': return '🏥';
            default: return '📚';
        }
    };

    const getCategoryText = (category: string) => {
        switch (category) {
            case 'greetings': return 'Chào hỏi';
            case 'self_introduction': return 'Giới thiệu bản thân';
            case 'daily_life': return 'Đời sống hàng ngày';
            case 'shopping': return 'Mua sắm';
            case 'restaurant': return 'Nhà hàng';
            case 'travel': return 'Du lịch';
            case 'business': return 'Công việc';
            case 'school': return 'Trường học';
            case 'hospital': return 'Bệnh viện';
            default: return 'Khác';
        }
    };

    const handleLessonClick = (lesson: ConversationLesson) => {
        navigate(`/conversation/${lesson.lesson_id}`);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.level) count++;
        if (filters.category) count++;
        if (filters.difficulty > 0) count++;
        if (filters.minDuration > 0 || filters.maxDuration < 120) count++;
        if (searchTerm) count++;
        return count;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
            <div className="flex">
                {/* Sidebar Filters */}
                <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-white dark:bg-secondary-900 shadow-lg transition-all duration-300 min-h-screen sticky top-0`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            {!sidebarCollapsed && (
                                <div>
                                    <Title level={4} className="!mb-2 text-secondary-900 dark:text-secondary-100">
                                        <FilterOutlined className="mr-2" />
                                        Bộ lọc
                                    </Title>
                                    <Text type="secondary" className="text-sm">
                                        {getActiveFiltersCount()} bộ lọc đang hoạt động
                                    </Text>
                                </div>
                            )}
                            <Button
                                type="text"
                                icon={sidebarCollapsed ? <FilterOutlined /> : <ClearOutlined />}
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="ml-2"
                            />
                        </div>

                        {!sidebarCollapsed && (
                            <>
                                {/* Search */}
                                <div className="mb-6">
                                    <Text strong className="text-sm mb-2 block">Tìm kiếm:</Text>
                                    <Search
                                        placeholder="Nhập tên bài học..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onSearch={handleSearch}
                                        allowClear
                                    />
                                </div>

                                {/* Level Filter */}
                                <div className="mb-6">
                                    <Text strong className="text-sm mb-2 block">Trình độ:</Text>
                                    <Select
                                        value={filters.level}
                                        onChange={handleLevelChange}
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
                                <div className="mb-6">
                                    <Text strong className="text-sm mb-2 block">Danh mục:</Text>
                                    <Select
                                        value={filters.category}
                                        onChange={handleCategoryChange}
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
                                <div className="mb-6">
                                    <Text strong className="text-sm mb-2 block">Độ khó:</Text>
                                    <Select
                                        value={filters.difficulty || undefined}
                                        onChange={handleDifficultyChange}
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
                                <div className="mb-6">
                                    <Text strong className="text-sm mb-2 block">
                                        Thời lượng: {filters.minDuration}-{filters.maxDuration} phút
                                    </Text>
                                    <Slider
                                        range
                                        min={0}
                                        max={120}
                                        value={[filters.minDuration, filters.maxDuration]}
                                        onChange={handleDurationRangeChange}
                                        marks={{
                                            0: '0',
                                            30: '30',
                                            60: '60',
                                            90: '90',
                                            120: '120'
                                        }}
                                    />
                                </div>

                                {/* Clear Filters */}
                                <Button
                                    type="default"
                                    icon={<ClearOutlined />}
                                    onClick={clearFilters}
                                    className="w-full"
                                    disabled={getActiveFiltersCount() === 0}
                                >
                                    Xóa tất cả bộ lọc
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div>
                                <Title level={1} className="!mb-1 text-gray-900 dark:text-secondary-100">
                                    <MessageOutlined className="mr-2 text-gray-700 dark:text-secondary-400" />
                                    Bài học hội thoại
                                </Title>
                                <Text className="text-gray-600 dark:text-secondary-400 text-lg">
                                    🎭 Học tiếng Nhật qua hội thoại đời sống thực
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Results Info */}
                    <div className="flex items-center justify-between mb-6 px-4 py-2 rounded-lg 
                bg-blue-50 dark:bg-secondary-800 border border-blue-100 dark:border-secondary-700">
                        <div className="flex items-center gap-2">
                            <BookOutlined className="text-blue-500" />
                            <Text className="text-gray-700 dark:text-secondary-200 font-medium">
                                Tìm thấy <span className="text-blue-600 font-semibold">{lessons.length}</span> bài học
                            </Text>

                            {getActiveFiltersCount() > 0 && (
                                <Tag color="blue" className="ml-2">
                                    {getActiveFiltersCount()} bộ lọc đang áp dụng
                                </Tag>
                            )}
                        </div>
                    </div>


                    {/* Lessons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lessons.map((lesson) => (
                            <Card
                                key={lesson.lesson_id}
                                hoverable
                                className="shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                                onClick={() => handleLessonClick(lesson)}
                                cover={
                                    <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <div className="text-4xl mb-2">{getCategoryIcon(lesson.category)}</div>
                                            <div className="text-sm font-medium">{getCategoryText(lesson.category)}</div>
                                        </div>
                                    </div>
                                }
                                actions={[
                                    <Button type="primary" icon={<PlayCircleOutlined />} key="start">
                                        Bắt đầu
                                    </Button>
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
                                                    <Tag color="green">{getDifficultyText(lesson.difficulty)}</Tag>
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
                                Thử thay đổi bộ lọc hoặc tìm kiếm để tìm bài học phù hợp
                            </Text>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationComponent;
