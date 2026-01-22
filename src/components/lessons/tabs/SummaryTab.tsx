import React from "react";
import { Badge, Button, Progress } from "antd";
import {
    TrophyOutlined,
    BookOutlined,
    ReadOutlined,
    FireOutlined,
    BulbOutlined,
    ReloadOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";
import type { LessonDetail, VocabularyItem, GrammarPattern } from "../../../types/lesson";

interface SummaryTabProps {
    lessonDetail: LessonDetail;
}

const SummaryTab: React.FC<SummaryTabProps> = ({
    lessonDetail,
}) => {
    const calculateProgress = () => {
        const totalSections = 5; // vocabulary, grammar, dialog, exercises, ai
        const completedSections = Math.floor(Math.random() * totalSections) + 1; // Mock completion
        return Math.round((completedSections / totalSections) * 100);
    };

    const getWeakAreas = () => {
        return [
            { topic: 'Trợ từ は/が', level: 'Cần ôn tập', color: 'red' },
            { topic: 'Động từ thể ます', level: 'Ôn lại', color: 'yellow' },
            { topic: 'Từ vựng đếm', level: 'Khá tốt', color: 'green' },
        ];
    };

    const getRecommendations = () => {
        return [
            'Luyện thêm 15 phút mỗi ngày với mẫu câu 〜です',
            'Ôn tập các trợ từ qua bài tập điền vào chỗ trống',
            'Nghe và nhại lại các đoạn hội thoại mẫu',
            'Sử dụng flashcard để củng cố từ vựng mới',
        ];
    };

    const progress = calculateProgress();
    const weakAreas = getWeakAreas();
    const recommendations = getRecommendations();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                        <span className="text-3xl">📝</span>
                        Tổng kết bài học
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                        Đánh giá tiến độ và gợi ý học tập cá nhân hóa
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                        {progress}%
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                        Hoàn thành
                    </div>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <TrophyOutlined className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Tiến độ học tập</h3>
                        <p className="text-white/80 text-sm">Bạn đã hoàn thành {progress}% bài học này</p>
                    </div>
                </div>

                <Progress
                    percent={progress}
                    strokeColor="#ffffff"
                    trailColor="rgba(255,255,255,0.3)"
                    strokeWidth={12}
                    showInfo={false}
                    className="mb-6"
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{lessonDetail.vocabularies.length}</div>
                        <div className="text-sm text-white/80">Từ vựng</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{lessonDetail.grammars.length}</div>
                        <div className="text-sm text-white/80">Ngữ pháp</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{lessonDetail.dialogs.length}</div>
                        <div className="text-sm text-white/80">Hội thoại</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{lessonDetail.exercises.length}</div>
                        <div className="text-sm text-white/80">Bài tập</div>
                    </div>
                </div>
            </div>

            {/* Key Learning Points */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vocabulary Focus */}
                <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-700 dark:to-teal-700 p-4">
                        <div className="flex items-center gap-2">
                            <BookOutlined className="text-white text-xl" />
                            <h3 className="text-lg font-bold text-white">Từ vựng trọng tâm</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {lessonDetail.vocabularies.slice(0, 5).map((vocab: VocabularyItem) => (
                                <div key={vocab.id} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                            <span className="text-green-600 dark:text-green-400 font-bold text-sm">{vocab.kanji.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-secondary-900 dark:text-secondary-100">{vocab.kanji}</div>
                                            <div className="text-sm text-secondary-600 dark:text-secondary-400">{vocab.hiragana}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-secondary-900 dark:text-secondary-100">{vocab.meaningVi}</div>
                                        <div className="text-xs text-secondary-500 dark:text-secondary-400">{vocab.meaningEn}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grammar Focus */}
                <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-700 dark:to-indigo-700 p-4">
                        <div className="flex items-center gap-2">
                            <ReadOutlined className="text-white text-xl" />
                            <h3 className="text-lg font-bold text-white">Ngữ pháp chính</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {lessonDetail.grammars.slice(0, 3).map((gram: GrammarPattern) => (
                                <div key={gram.id} className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">{gram.pattern.charAt(0)}</span>
                                        </div>
                                        <div className="font-bold text-primary-600 dark:text-primary-400">{gram.pattern}</div>
                                    </div>
                                    <div className="text-sm text-secondary-700 dark:text-secondary-400">{gram.meaning}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Weak Areas Analysis */}
            <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-700 dark:to-red-700 p-4">
                    <div className="flex items-center gap-2">
                        <FireOutlined className="text-white text-xl" />
                        <h3 className="text-lg font-bold text-white">Phân tích điểm yếu</h3>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {weakAreas.map((area, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-2 ${area.color === 'red'
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                        : area.color === 'yellow'
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                                        {area.topic}
                                    </span>
                                    <Badge
                                        color={area.color === 'red' ? 'red' : area.color === 'yellow' ? 'orange' : 'green'}
                                        text={area.level}
                                    />
                                </div>
                                <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${area.color === 'red'
                                                ? 'bg-red-500 w-1/3'
                                                : area.color === 'yellow'
                                                    ? 'bg-yellow-500 w-2/3'
                                                    : 'bg-green-500 w-full'
                                            }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <BulbOutlined className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Gợi ý học tập cá nhân hóa</h3>
                        <p className="text-white/80 text-sm">Dựa trên kết quả học tập của bạn</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold">{index + 1}</span>
                            </div>
                            <p className="text-sm">{rec}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    type="primary"
                    size="large"
                    icon={<ReloadOutlined />}
                    className="flex-1 h-14 text-lg"
                >
                    🔄 Ôn tập thông minh
                </Button>
                <Button
                    size="large"
                    icon={<ArrowRightOutlined />}
                    className="flex-1 h-14 text-lg"
                >
                    ➡️ Bài tiếp theo
                </Button>
            </div>

            {/* Achievement Badge */}
            {progress >= 80 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-600 dark:to-orange-700 rounded-xl shadow-lg p-6 text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrophyOutlined className="text-4xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">🎉 Xuất sắc!</h3>
                    <p className="text-white/90">
                        Bạn đã hoàn thành xuất sắc bài học này. Hãy tiếp tục cố gắng!
                    </p>
                </div>
            )}
        </div>
    );
};

export default SummaryTab;
