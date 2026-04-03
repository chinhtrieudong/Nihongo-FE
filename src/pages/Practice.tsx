import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Row, Col, Card, Progress, Tag } from "antd";
import {
    BookOpen,
    PenTool,
    Headphones,
    MessageSquare,
    Brain,
    Languages,
    ArrowRight,
    Clock,
    Star,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

interface PracticeCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    progress: number;
    total: number;
    route: string;
    tags: string[];
}

const practiceCategories: PracticeCategory[] = [
    {
        id: "vocabulary",
        title: "Từ vựng",
        description: "Luyện tập từ vựng theo chủ đề và cấp độ JLPT",
        icon: <BookOpen className="w-8 h-8" />,
        color: "#52c41a",
        bgColor: "rgba(82, 196, 26, 0.1)",
        progress: 45,
        total: 500,
        route: "/vocabulary",
        tags: ["N5", "N4", "N3"],
    },
    {
        id: "grammar",
        title: "Ngữ pháp",
        description: "Ôn tập và luyện tập các mẫu ngữ pháp tiếng Nhật",
        icon: <PenTool className="w-8 h-8" />,
        color: "#1890ff",
        bgColor: "rgba(24, 144, 255, 0.1)",
        progress: 30,
        total: 200,
        route: "/grammar",
        tags: ["Cơ bản", "Trung cấp"],
    },
    {
        id: "kanji",
        title: "Kanji",
        description: "Luyện viết và nhớ chữ Hán theo cấp độ",
        icon: <Languages className="w-8 h-8" />,
        color: "#722ed1",
        bgColor: "rgba(114, 46, 209, 0.1)",
        progress: 60,
        total: 300,
        route: "/kanji",
        tags: ["N5", "N4"],
    },
    {
        id: "listening",
        title: "Nghe hiểu",
        description: "Luyện nghe các đoạn hội thoại và bài đọc",
        icon: <Headphones className="w-8 h-8" />,
        color: "#fa8c16",
        bgColor: "rgba(250, 140, 22, 0.1)",
        progress: 25,
        total: 150,
        route: "/pronunciation",
        tags: ["Hội thoại", "Đọc"],
    },
    {
        id: "conversation",
        title: "Hội thoại",
        description: "Luyện nói và giao tiếp tiếng Nhật thực tế",
        icon: <MessageSquare className="w-8 h-8" />,
        color: "#eb2f96",
        bgColor: "rgba(235, 47, 150, 0.1)",
        progress: 15,
        total: 100,
        route: "/conversation",
        tags: ["Giao tiếp", "Thực hành"],
    },
    {
        id: "jlpt",
        title: "Luyện thi JLPT",
        description: "Ôn tập tổng hợp cho kỳ thi JLPT các cấp độ",
        icon: <Brain className="w-8 h-8" />,
        color: "#13c2c2",
        bgColor: "rgba(19, 194, 194, 0.1)",
        progress: 20,
        total: 100,
        route: "/tests",
        tags: ["N5", "N4", "N3", "N2", "N1"],
    },
];

const Practice: React.FC = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const totalProgress = practiceCategories.reduce(
        (acc, cat) => acc + cat.progress,
        0
    );
    const totalItems = practiceCategories.reduce(
        (acc, cat) => acc + cat.total,
        0
    );
    const overallPercentage = Math.round((totalProgress / totalItems) * 100);

    return (
        <div className="min-h-full bg-bg academic-canvas">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-secondary-100 mb-3">
                        Luyện tập
                    </h1>
                    <p className="text-gray-600 dark:text-secondary-400 text-lg">
                        Chọn chủ đề để luyện tập và cải thiện kỹ năng tiếng Nhật của bạn
                    </p>
                </div>

                {/* Overall Progress */}
                <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                                <Star className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <Text className="text-text-sub text-sm">Tiến độ tổng thể</Text>
                                <div className="flex items-baseline gap-2">
                                    <Title level={2} className="!mb-0 !text-primary">
                                        {overallPercentage}%
                                    </Title>
                                    <Text className="text-text-sub">
                                        ({totalProgress}/{totalItems} bài)
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-text-sub">
                            <Clock className="w-4 h-4" />
                            <Text className="text-sm">Học mỗi ngày để đạt hiệu quả tốt nhất</Text>
                        </div>
                    </div>
                    <Progress
                        percent={overallPercentage}
                        showInfo={false}
                        strokeColor="var(--primary)"
                        className="mt-4"
                    />
                </Card>

                {/* Practice Categories Grid */}
                <Row gutter={[16, 16]}>
                    {practiceCategories.map((category) => (
                        <Col xs={24} md={12} lg={8} key={category.id}>
                            <Card
                                hoverable
                                className="h-full transition-all duration-300 border-border"
                                style={{
                                    borderColor:
                                        hoveredCard === category.id
                                            ? category.color
                                            : undefined,
                                    boxShadow:
                                        hoveredCard === category.id
                                            ? `0 8px 24px ${category.color}20`
                                            : undefined,
                                }}
                                onMouseEnter={() => setHoveredCard(category.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => navigate(category.route)}
                            >
                                <div className="flex flex-col h-full">
                                    {/* Icon & Title */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                            style={{ backgroundColor: category.bgColor }}
                                        >
                                            <span style={{ color: category.color }}>
                                                {category.icon}
                                            </span>
                                        </div>
                                        <ArrowRight
                                            className="w-5 h-5 text-text-sub transition-transform duration-300"
                                            style={{
                                                transform:
                                                    hoveredCard === category.id
                                                        ? "translateX(4px)"
                                                        : "none",
                                                color:
                                                    hoveredCard === category.id
                                                        ? category.color
                                                        : undefined,
                                            }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <Title level={4} className="!mb-2 !text-text-main">
                                        {category.title}
                                    </Title>
                                    <Paragraph className="!text-text-sub !mb-4 flex-1">
                                        {category.description}
                                    </Paragraph>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {category.tags.map((tag) => (
                                            <Tag
                                                key={tag}
                                                className="!m-0"
                                                style={{
                                                    backgroundColor: category.bgColor,
                                                    color: category.color,
                                                    borderColor: category.color,
                                                }}
                                            >
                                                {tag}
                                            </Tag>
                                        ))}
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between mb-2">
                                            <Text className="text-sm text-text-sub">Tiến độ</Text>
                                            <Text
                                                className="text-sm font-semibold"
                                                style={{ color: category.color }}
                                            >
                                                {category.progress}/{category.total}
                                            </Text>
                                        </div>
                                        <Progress
                                            percent={Math.round(
                                                (category.progress / category.total) * 100
                                            )}
                                            size="small"
                                            showInfo={false}
                                            strokeColor={category.color}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Tips Section */}
                <Card className="mt-8">
                    <Title level={4} className="!mb-4 !text-text-main">
                        💡 Mẹo học tập hiệu quả
                    </Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-success font-bold">1</span>
                                </div>
                                <div>
                                    <Text className="font-semibold text-text-main block">
                                        Học đều đặn mỗi ngày
                                    </Text>
                                    <Text className="text-sm text-text-sub">
                                        Dành 15-30 phút mỗi ngày để luyện tập
                                    </Text>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-info font-bold">2</span>
                                </div>
                                <div>
                                    <Text className="font-semibold text-text-main block">
                                        Ôn tập theo chu kỳ
                                    </Text>
                                    <Text className="text-sm text-text-sub">
                                        Quay lại ôn bài cũ để ghi nhớ lâu hơn
                                    </Text>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8}>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-warning font-bold">3</span>
                                </div>
                                <div>
                                    <Text className="font-semibold text-text-main block">
                                        Kết hợp nhiều kỹ năng
                                    </Text>
                                    <Text className="text-sm text-text-sub">
                                        Luyện tập xen kẽ các kỹ năng nghe, nói, đọc, viết
                                    </Text>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>
        </div>
    );
};

export default Practice;