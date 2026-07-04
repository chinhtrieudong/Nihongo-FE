import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Row, Col, Card, Tag, Modal, Button, InputNumber } from "antd";
import {
    BookOpen,
    PenTool,
    MessageSquare,
    Languages,
    ArrowRight,
    Bot,
    GraduationCap,
    Scroll,
    BookText,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

interface PracticeCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    route: string;
    tags: string[];
}

const practiceCategories: PracticeCategory[] = [
    {
        id: "conversation",
        title: "Kaiwa",
        description: "Hội thoại mẫu theo từng bài học",
        icon: <MessageSquare className="w-8 h-8" />,
        color: "#1890ff",
        bgColor: "rgba(24, 144, 255, 0.1)",
        route: "/mina/1",
        tags: ["Hội thoại", "Nghe"],
    },
    {
        id: "exercises",
        title: "Mondai",
        description: "Bài tập luyện tập theo từng bài",
        icon: <PenTool className="w-8 h-8" />,
        color: "#52c41a",
        bgColor: "rgba(82, 196, 26, 0.1)",
        route: "/mina/1",
        tags: ["Bài tập", "Thực hành"],
    },
    {
        id: "renshuu",
        title: "Renshuu",
        description: "Bài tập thực hành ứng dụng (練習)",
        icon: <GraduationCap className="w-8 h-8" />,
        color: "#fa8c16",
        bgColor: "rgba(250, 140, 22, 0.1)",
        route: "/mina/1",
        tags: ["Thực hành", "Ứng dụng"],
    },
    {
        id: "reibun",
        title: "Reibun",
        description: "Hội thoại ví dụ mẫu (例文)",
        icon: <Languages className="w-8 h-8" />,
        color: "#722ed1",
        bgColor: "rgba(114, 46, 209, 0.1)",
        route: "/mina/1",
        tags: ["Ví dụ", "Mẫu câu"],
    },
    {
        id: "bunkei",
        title: "Bunkei",
        description: "Mẫu câu ngữ pháp (文型)",
        icon: <Scroll className="w-8 h-8" />,
        color: "#13c2c2",
        bgColor: "rgba(19, 194, 194, 0.1)",
        route: "/mina/1",
        tags: ["Mẫu câu", "Ngữ pháp"],
    },
    {
        id: "ai",
        title: "Luyện với AI",
        description: "Chat và luyện tập cùng AI thông minh",
        icon: <Bot className="w-8 h-8" />,
        color: "#eb2f96",
        bgColor: "rgba(235, 47, 150, 0.1)",
        route: "/mina/1",
        tags: ["AI", "Chat"],
    },
];

const Practice: React.FC = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<number>(1);

    const handleCardClick = (categoryId: string) => {
        const routeMap: Record<string, string> = {
            conversation: "kaiwa",
            exercises: "mondai",
            renshuu: "renshuu",
            reibun: "reibun",
            bunkei: "bunkei",
            ai: "ai",
        };
        const route = routeMap[categoryId] || categoryId;
        
        if (route === "ai") {
            navigate("/grammar");
            return;
        }
        
        setSelectedCategory(route);
        setIsModalOpen(true);
    };

    const handleStartPractice = () => {
        if (selectedCategory) {
            navigate(`/practice/${selectedCategory}/${selectedLesson}`);
            setIsModalOpen(false);
        }
    };

    const generateLessonButtons = () => {
        const buttons = [];
        for (let i = 1; i <= 50; i++) {
            buttons.push(
                <Button
                    key={i}
                    size="small"
                    type={selectedLesson === i ? "primary" : "default"}
                    onClick={() => setSelectedLesson(i)}
                    className="w-full h-10 text-sm font-medium"
                >
                    {i}
                </Button>
            );
        }
        return buttons;
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-3">
                        Luyện tập
                    </h1>
                    <p className="text-text-sub text-lg">
                        Chọn chủ đề để luyện tập và cải thiện kỹ năng tiếng Nhật của bạn
                    </p>
                </div>

                {/* Practice Categories Grid */}
                <Row gutter={[16, 16]}>
                    {practiceCategories.map((category) => (
                        <Col xs={24} md={12} lg={8} key={category.id}>
                            <Card
                                hoverable
                                className="h-full transition-all duration-300 border-border bg-surface-1"
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
                                onClick={() => handleCardClick(category.id)}
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
                                    <div className="flex flex-wrap gap-2 mt-auto">
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
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Lesson Selector Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <BookText className="w-5 h-5 text-primary" />
                            <span>Chọn bài học Minna no Nihongo</span>
                        </div>
                    }
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>,
                        <Button key="start" type="primary" onClick={handleStartPractice}>
                            Bắt đầu học bài {selectedLesson}
                        </Button>,
                    ]}
                    width="min(600px, 92vw)"
                >
                    <div className="py-4">
                        <p className="text-text-sub mb-4">
                            Chọn bài học từ 1 đến 50 để bắt đầu luyện tập:
                        </p>
                        
                        {/* Quick input */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-text-main">Hoặc nhập số bài:</span>
                            <InputNumber
                                min={1}
                                max={50}
                                value={selectedLesson}
                                onChange={(value) => setSelectedLesson(value || 1)}
                                className="w-20"
                            />
                        </div>

                        {/* Lesson grid */}
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                            {generateLessonButtons()}
                        </div>

                        <p className="text-text-sub text-sm mt-4">
                            Bài đã chọn: <strong className="text-primary">{selectedLesson}</strong>
                        </p>
                    </div>
                </Modal>
                <Card className="mt-8 bg-surface-1 border border-border">
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