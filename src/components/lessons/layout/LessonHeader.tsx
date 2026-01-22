import React from "react";
import { Badge, Button, Progress, Typography, Avatar } from "antd";
import {
    BookOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined,
    FireOutlined,
} from "@ant-design/icons";
import type { Lesson, LessonDetail } from "../../../types/lesson";

const { Title, Text } = Typography;

interface LessonHeaderProps {
    selectedLesson: Lesson;
    lessonDetail: LessonDetail;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({
    selectedLesson,
    lessonDetail,
}) => {
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'N5': return 'green';
            case 'N4': return 'blue';
            case 'N3': return 'orange';
            case 'N2': return 'red';
            case 'N1': return 'purple';
            default: return 'blue';
        }
    };

    return (
        <div className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-800">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <Badge
                                count={selectedLesson.lessonNumber}
                                style={{ backgroundColor: '#1890ff' }}
                                className="text-2xl"
                            >
                                <Avatar size={48} icon={<BookOutlined />} className="bg-blue-100 dark:bg-primary-900" />
                            </Badge>
                            <div>
                                <Title level={2} className="!mb-0 text-secondary-900 dark:text-secondary-100">
                                    {selectedLesson.title}
                                </Title>
                                <Text className="text-secondary-600 dark:text-secondary-400 text-sm">
                                    {selectedLesson.description}
                                </Text>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <Badge
                                color={getLevelColor(selectedLesson.level || 'N5')}
                                className="px-3 py-1 text-sm font-medium"
                            >
                                {selectedLesson.level}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                                <ClockCircleOutlined />
                                <span>Thời gian: 45 phút</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                                <FireOutlined />
                                <span>Độ khó: Trung bình</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                {lessonDetail.lesson.progress}%
                            </div>
                            <div className="text-sm text-secondary-600 dark:text-secondary-400">
                                {lessonDetail.lesson.status === "completed"
                                    ? "✅ Hoàn thành"
                                    : lessonDetail.lesson.status === "in_progress"
                                        ? "🔄 Đang học"
                                        : "⏳ Chưa bắt đầu"}
                            </div>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            className="shadow-lg"
                        >
                            Tiếp tục học
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <Progress
                        percent={lessonDetail.lesson.progress}
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#52c41a',
                        }}
                        trailColor="#f0f0f0"
                        strokeWidth={8}
                        showInfo={false}
                        className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-secondary-400">
                        <span>Bắt đầu</span>
                        <span>Vocabulary</span>
                        <span>Grammar</span>
                        <span>Dialog</span>
                        <span>Exercises</span>
                        <span>Hoàn thành</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonHeader;
