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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                            <Badge
                                count={selectedLesson.lessonNumber}
                                style={{ backgroundColor: '#1890ff' }}
                                className="text-xl sm:text-2xl"
                            >
                                <Avatar size={40} icon={<BookOutlined />} className="bg-blue-100 dark:bg-primary-900" />
                            </Badge>
                            <div className="flex-1 min-w-0">
                                <Title level={2} className="!mb-0 text-secondary-900 dark:text-secondary-100 text-xl sm:text-2xl truncate">
                                    {selectedLesson.title}
                                </Title>
                                <Text className="text-secondary-600 dark:text-secondary-400 text-xs sm:text-sm block truncate">
                                    {selectedLesson.description}
                                </Text>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                            <Badge
                                color={getLevelColor(selectedLesson.level || 'N5')}
                                className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium"
                            >
                                {selectedLesson.level}
                            </Badge>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                                <ClockCircleOutlined className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">Thời gian: 45 phút</span>
                                <span className="sm:hidden">45 phút</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                                <FireOutlined className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">Độ khó: Trung bình</span>
                                <span className="sm:hidden">Trung bình</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-3">
                        <div className="text-center lg:text-right">
                            <div className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
                                {lessonDetail.lesson.progress}%
                            </div>
                            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                                {lessonDetail.lesson.status === "completed"
                                    ? "✅ Hoàn thành"
                                    : lessonDetail.lesson.status === "in_progress"
                                        ? "🔓 Đang học"
                                        : "🔒 Chưa bắt đầu"}
                            </div>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            className="shadow-lg w-full sm:w-auto"
                        >
                            <span className="hidden sm:inline">Tiếp tục học</span>
                            <span className="sm:hidden">Học</span>
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 sm:mt-6">
                    <Progress
                        percent={lessonDetail.lesson.progress}
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#52c41a',
                        }}
                        trailColor="#f0f0f0"
                        strokeWidth={6}
                        showInfo={false}
                        className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600 dark:text-secondary-400 overflow-x-auto">
                        <span className="flex-shrink-0">Bắt đầu</span>
                        <span className="flex-shrink-0 hidden xs:inline">Vocabulary</span>
                        <span className="flex-shrink-0 xs:hidden">T.vựng</span>
                        <span className="flex-shrink-0 hidden xs:inline">Grammar</span>
                        <span className="flex-shrink-0 xs:hidden">Ng.pháp</span>
                        <span className="flex-shrink-0 hidden xs:inline">Dialog</span>
                        <span className="flex-shrink-0 xs:hidden">H.thoại</span>
                        <span className="flex-shrink-0 hidden xs:inline">Exercises</span>
                        <span className="flex-shrink-0 xs:hidden">B.tập</span>
                        <span className="flex-shrink-0">Hoàn thành</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonHeader;
