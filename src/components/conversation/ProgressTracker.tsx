import React from 'react';
import { Progress, Steps, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProgressTrackerProps {
    currentStep: number;
    totalSteps: number;
    currentExercise: string;
    xp: number;
    hearts: number;
    streak: number;
    onStepChange?: (step: number) => void;
}

const exerciseNames: { [key: string]: string } = {
    'listen': '🎧 Nghe',
    'dictation': '✍️ Viết',
    'comprehension': '🧠 Hiểu',
    'reorder': '🔀 Sắp xếp',
    'roleplay': '🎭 Đóng vai',
    'shadowing': '🔊 Lặp lại',
    'reaction': '⚡ Phản xạ',
    'feedback': '🤖 AI Feedback'
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
    currentStep,
    totalSteps,
    currentExercise,
    xp,
    hearts,
    streak,
    onStepChange
}) => {
    const progressPercent = (currentStep / totalSteps) * 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
            {/* Header with XP and Hearts */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Text strong className="text-lg mr-2">⭐ {xp}</Text>
                        <Text type="secondary" className="text-sm">XP</Text>
                    </div>

                    <div className="flex items-center">
                        <div className="flex space-x-1">
                            {[...Array(3)].map((_, i) => (
                                <span key={i} className={`text-xl ${i < hearts ? 'text-red-500' : 'text-gray-300'}`}>
                                    ❤️
                                </span>
                            ))}
                        </div>
                        <Text type="secondary" className="text-sm ml-2">Mạng</Text>
                    </div>

                    <div className="flex items-center">
                        <Text strong className="text-lg mr-2">🔥 {streak}</Text>
                        <Text type="secondary" className="text-sm">Chuỗi</Text>
                    </div>
                </div>

                <div className="text-right">
                    <Text type="secondary" className="text-sm">
                        Bước {currentStep}/{totalSteps}
                    </Text>
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {exerciseNames[currentExercise] || currentExercise}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <Progress
                percent={progressPercent}
                strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                }}
                className="mb-4"
                showInfo={false}
            />

            {/* Steps */}
            <Steps
                current={currentStep - 1}
                size="small"
                className="mb-2 cursor-pointer"
                onChange={(step) => {
                    console.log('Steps onChange called with step:', step);
                    if (onStepChange) {
                        onStepChange(step + 1); // Convert 0-based to 1-based
                    }
                }}
                items={Object.entries(exerciseNames).map(([key, name], index) => ({
                    title: name,
                    icon: index < currentStep - 1 ? <CheckCircleOutlined /> : <ClockCircleOutlined />
                }))}
            />
        </div>
    );
};

export default ProgressTracker;
