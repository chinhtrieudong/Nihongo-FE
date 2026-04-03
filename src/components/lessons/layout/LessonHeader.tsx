import React from "react";
import { Badge, Button, Typography, Avatar, Drawer } from "antd";
import { Grid } from "antd";
import {
    Book,
    Play,
    Clock,
    Flame,
    ArrowLeft,
    Menu,
} from "lucide-react";
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
    const screens = Grid.useBreakpoint();
    const [mobileMenuVisible, setMobileMenuVisible] = React.useState(false);
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
        <>
            {/* Mobile-First Header */}
            <div className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-800 sticky top-0 z-30">
                <div className="px-4 py-3">
                    {/* Mobile Header Layout */}
                    <div className="flex items-center justify-between gap-3">
                        {/* Left: Back Button */}
                        <Button
                            icon={<ArrowLeft className="w-4 h-4" />}
                            className="border-0 shadow-sm flex-shrink-0"
                            size={screens.xs ? 'small' : 'middle'}
                            onClick={() => window.history.back()}
                        />

                        {/* Center: Title */}
                        <div className="flex-1 min-w-0 px-3">
                            <Typography.Title
                                level={screens.xs ? 5 : 4}
                                className="!mb-0 !text-secondary-900 dark:!text-secondary-100 line-clamp-1"
                            >
                                {selectedLesson.title}
                            </Typography.Title>
                            {!screens.xs && (
                                <Typography.Text className="text-xs text-secondary-600 dark:text-secondary-400 line-clamp-1">
                                    {selectedLesson.description}
                                </Typography.Text>
                            )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {screens.xs && (
                                <Button
                                    icon={<Menu className="w-4 h-4" />}
                                    onClick={() => setMobileMenuVisible(true)}
                                    className="border-0 shadow-sm"
                                    size="small"
                                />
                            )}
                            {!screens.xs && (
                                <Button
                                    type="primary"
                                    icon={<Play className="w-4 h-4" />}
                                    className="shadow-lg"
                                >
                                    Tiếp tục học
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Status */}
                    <div className="mt-3 text-sm text-secondary-600 dark:text-secondary-400">
                        {lessonDetail.lesson.status === "completed"
                            ? "✅ Hoàn thành"
                            : lessonDetail.lesson.status === "in_progress"
                                ? "🔓 Đang học"
                                : "🔒 Chưa bắt đầu"}
                    </div>
                </div>
            </div>

            {/* Desktop Header */}
            {!screens.xs && (
                <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <Badge
                                        count={selectedLesson.lesson_number}
                                        style={{ backgroundColor: '#1890ff' }}
                                        className="text-2xl"
                                    >
                                        <Avatar size={48} icon={<Book className="w-4 h-4" />} className="bg-blue-100 dark:bg-primary-900" />
                                    </Badge>
                                    <div className="flex-1">
                                        <Typography.Title level={2} className="!mb-2 !text-secondary-900 dark:!text-secondary-100">
                                            {selectedLesson.title}
                                        </Typography.Title>
                                        <Typography.Text className="text-secondary-600 dark:text-secondary-400">
                                            {selectedLesson.description}
                                        </Typography.Text>
                                    </div>
                                </div>

                                {/* Status Tags */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <Badge
                                        color={getLevelColor(selectedLesson.level || 'N5')}
                                        className="px-3 py-1 text-sm font-medium"
                                    >
                                        {selectedLesson.level}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                                        <Clock className="w-4 h-4" />
                                        <span>45 phút</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                                        <Flame className="w-4 h-4" />
                                        <span>Trung bình</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Section */}
                            <div className="text-center">
                                <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                                    {lessonDetail.lesson.status === "completed"
                                        ? "✅ Hoàn thành"
                                        : lessonDetail.lesson.status === "in_progress"
                                            ? "🔓 Đang học"
                                            : "🔒 Chưa bắt đầu"}
                                </div>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<Play className="w-4 h-4" />}
                                    className="shadow-lg w-full"
                                >
                                    Tiếp tục học
                                </Button>
                            </div>
                        </div>

                        {/* Desktop Progress Details removed */}
                    </div>
                </div>
            )}

            {/* Mobile Menu Drawer */}
            <Drawer
                title="Thông tin bài học"
                placement="bottom"
                onClose={() => setMobileMenuVisible(false)}
                open={mobileMenuVisible}
                height="70vh"
            >
                <div className="space-y-6">
                    {/* Lesson Info */}
                    <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                            {selectedLesson.title}
                        </h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                            {selectedLesson.description}
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                                <span className="text-sm font-medium">Trình độ</span>
                                <Badge color={getLevelColor(selectedLesson.level || 'N5')}>
                                    {selectedLesson.level}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                                <span className="text-sm font-medium">Thời gian</span>
                                <span className="text-sm">45 phút</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                                <span className="text-sm font-medium">Độ khó</span>
                                <span className="text-sm">Trung bình</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div>
                        <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
                            Trạng thái học tập
                        </h4>
                        <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                            {lessonDetail.lesson.status === "completed"
                                ? "✅ Hoàn thành"
                                : lessonDetail.lesson.status === "in_progress"
                                    ? "🔓 Đang học"
                                    : "🔒 Chưa bắt đầu"}
                        </div>
                        <Button
                            type="primary"
                            icon={<Play className="w-4 h-4" />}
                            className="w-full shadow-lg"
                            size="large"
                        >
                            Tiếp tục học
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default LessonHeader;
