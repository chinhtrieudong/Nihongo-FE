import React from 'react';
import { Card, Typography, Tag, Button, Collapse, Progress } from 'antd';
import {
    RobotOutlined,
    BulbOutlined,
    BookOutlined,
    SoundOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface AITeacherPanelProps {
    weakPoints: string[];
    pronunciationMistakes: string[];
    suggestedPatterns: string[];
    customDrills: string[];
    overallScore: number;
    timeSpent: number;
    onReviewMistakes: () => void;
    onSpeedRun: () => void;
    onShadowingOnly: () => void;
    onRoleplayOnly: () => void;
}

const AITeacherPanel: React.FC<AITeacherPanelProps> = ({
    weakPoints,
    pronunciationMistakes,
    suggestedPatterns,
    customDrills,
    overallScore,
    timeSpent,
    onReviewMistakes,
    onSpeedRun,
    onShadowingOnly,
    onRoleplayOnly
}) => {
    const getScoreColor = (score: number) => {
        if (score >= 90) return '#52c41a';
        if (score >= 70) return '#faad14';
        return '#ff4d4f';
    };

    const getScoreLevel = (score: number) => {
        if (score >= 90) return 'Xuất sắc! 🌟';
        if (score >= 70) return 'Khá tốt! 👍';
        return 'Cần cố gắng hơn! 💪';
    };

    return (
        <div className="space-y-6">
            {/* Overall Performance */}
            <Card className="shadow-lg">
                <div className="text-center mb-6">
                    <RobotOutlined className="text-6xl text-blue-500 mb-4" />
                    <Title level={3}>Phản hồi từ Giáo viên AI 🤖</Title>
                </div>

                {/* Score Display */}
                <div className="text-center mb-6">
                    <div className="text-5xl font-bold mb-2" style={{ color: getScoreColor(overallScore) }}>
                        {overallScore}%</div>
                    <Text className="text-xl">{getScoreLevel(overallScore)}</Text>
                    <div className="mt-2">
                        <Progress percent={overallScore} strokeColor={getScoreColor(overallScore)} />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <BookOutlined className="text-2xl text-blue-500 mb-2" />
                        <div className="text-lg font-semibold">{Math.floor(timeSpent / 60)} phút</div>
                        <Text type="secondary">Thời gian học</Text>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircleOutlined className="text-2xl text-green-500 mb-2" />
                        <div className="text-lg font-semibold">{customDrills.length}</div>
                        <Text type="secondary">Bài tập đề xuất</Text>
                    </div>
                </div>
            </Card>

            {/* Weak Points Analysis */}
            {(weakPoints.length > 0 || pronunciationMistakes.length > 0) && (
                <Card title="🎯 Phân tích điểm yếu" className="shadow-lg">
                    <Collapse className="mb-4">
                        {weakPoints.length > 0 && (
                            <Panel
                                header={
                                    <div className="flex items-center">
                                        <BookOutlined className="mr-2 text-orange-500" />
                                        <span>Ngữ pháp cần cải thiện ({weakPoints.length})</span>
                                    </div>
                                }
                                key="grammar"
                            >
                                <div className="space-y-2">
                                    {weakPoints.map((point, index) => (
                                        <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                            <Text className="text-orange-700 dark:text-orange-300">
                                                <BulbOutlined className="mr-2" />
                                                {point}
                                            </Text>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        )}

                        {pronunciationMistakes.length > 0 && (
                            <Panel
                                header={
                                    <div className="flex items-center">
                                        <SoundOutlined className="mr-2 text-red-500" />
                                        <span>Lỗi phát âm ({pronunciationMistakes.length})</span>
                                    </div>
                                }
                                key="pronunciation"
                            >
                                <div className="space-y-2">
                                    {pronunciationMistakes.map((mistake, index) => (
                                        <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <Text className="text-red-700 dark:text-red-300">
                                                <SoundOutlined className="mr-2" />
                                                {mistake}
                                            </Text>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        )}
                    </Collapse>
                </Card>
            )}

            {/* Suggested Patterns */}
            {suggestedPatterns.length > 0 && (
                <Card title="💡 Mẫu câu đề xuất" className="shadow-lg">
                    <div className="space-y-3">
                        {suggestedPatterns.map((pattern, index) => (
                            <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Text className="text-green-700 dark:text-green-300">
                                    <CheckCircleOutlined className="mr-2" />
                                    {pattern}
                                </Text>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Custom Drills */}
            {customDrills.length > 0 && (
                <Card title="🎯 Bài tập luyện tập thêm" className="shadow-lg">
                    <div className="space-y-3">
                        {customDrills.map((drill, index) => (
                            <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Text className="text-purple-700 dark:text-purple-300">
                                    <BookOutlined className="mr-2" />
                                    {drill}
                                </Text>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Encouragement */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
                <div className="text-center">
                    <RobotOutlined className="text-4xl text-blue-500 mb-3" />
                    <Title level={4}>Tiếp tục cố gắng! 🎉</Title>
                    <Text className="text-gray-600 dark:text-gray-400">
                        Bạn đã làm rất tốt! Hãy luyện tập thường xuyên để cải thiện kỹ năng tiếng Nhật của mình.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default AITeacherPanel;
