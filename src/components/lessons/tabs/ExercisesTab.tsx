import React, { useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import { lessonAPI } from "../../../services/api";
import { Badge, Button, Input, Progress, message } from "antd";
import {
    EditOutlined,
    ArrowRightOutlined,
    BulbOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
} from "@ant-design/icons";

interface ExercisesTabProps {
    exercises: any[];
    lessonId: string;
}

const ExercisesTab: React.FC<ExercisesTabProps> = ({
    exercises,
    lessonId,
}) => {
    const { currentUser } = useAppSelector((state) => state.user);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [results, setResults] = useState<Record<string, any>>({});
    const [currentExercise, setCurrentExercise] = useState(0);
    const [showHint, setShowHint] = useState(false);

    const submitAnswer = async (exerciseId: string, answer: any) => {
        if (!currentUser) return;

        try {
            const response = await lessonAPI.submitExercise(
                lessonId!,
                exerciseId,
                answer
            );
            if (response.success) {
                setResults((prev) => ({
                    ...prev,
                    [exerciseId]: response.data,
                }));
                message.success('Bài làm đã được nộp!');
            }
        } catch (error) {
            console.error("Failed to submit exercise:", error);
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    if (exercises.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex flex-col items-center">
                    <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                        <EditOutlined className="text-3xl text-secondary-400" />
                    </div>
                    <p className="text-secondary-700 dark:text-secondary-400 text-lg">
                        Chưa có bài tập cho bài học này.
                    </p>
                </div>
            </div>
        );
    }

    const exercise = exercises[currentExercise];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                        <span className="text-3xl">✍</span>
                        Bài tập
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                        Luyện {exercises.length} bài tập củng cố kiến thức
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge
                        count={`${currentExercise + 1}/${exercises.length}`}
                        style={{ backgroundColor: '#fa8c16' }}
                        className="text-sm"
                    />
                    <Button
                        icon={<ArrowRightOutlined />}
                        type="primary"
                        size="large"
                        disabled={currentExercise === exercises.length - 1}
                        onClick={() => setCurrentExercise(prev => prev + 1)}
                    >
                        Bài tiếp
                    </Button>
                </div>
            </div>

            {/* Exercise Navigation */}
            <div className="flex justify-center gap-2">
                {exercises.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentExercise(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentExercise
                            ? 'w-8 bg-orange-500'
                            : results[exercises[index].id]?.isCorrect
                                ? 'bg-green-500'
                                : results[exercises[index].id]
                                    ? 'bg-red-500'
                                    : 'bg-secondary-300 dark:bg-secondary-600'
                            }`}
                    />
                ))}
            </div>

            {/* Exercise Content */}
            <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                {/* Exercise Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-700 dark:to-red-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{currentExercise + 1}</span>
                                </div>
                                <Badge
                                    count={exercise.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Điền vào chỗ trống'}
                                    size="small"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {exercise.title}
                            </h3>
                            <p className="text-white/90">
                                {exercise.question}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="default"
                                size="large"
                                icon={<BulbOutlined />}
                                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                                onClick={() => setShowHint(!showHint)}
                            >
                                Gợi ý
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Exercise Body */}
                <div className="p-8">
                    {exercise.type === "multiple_choice" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                {exercise.content.options.map((option: string, index: number) => (
                                    <label
                                        key={index}
                                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${answers[exercise.id] === option
                                            ? results[exercise.id]?.isCorrect
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : results[exercise.id]
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                    : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                            : 'border-secondary-200 dark:border-secondary-700 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name={`exercise-${exercise.id}`}
                                                value={option}
                                                checked={answers[exercise.id] === option}
                                                onChange={(e) =>
                                                    setAnswers((prev) => ({
                                                        ...prev,
                                                        [exercise.id]: e.target.value,
                                                    }))
                                                }
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="font-medium text-secondary-900 dark:text-secondary-100">
                                                    {String.fromCharCode(65 + index)}. {option}
                                                </div>
                                            </div>
                                            {results[exercise.id] && answers[exercise.id] === option && (
                                                <div className="ml-3">
                                                    {results[exercise.id].isCorrect ? (
                                                        <CheckCircleOutlined className="text-green-500 text-xl" />
                                                    ) : (
                                                        <span className="text-red-500 text-xl">✗</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {exercise.type === "fill_blank" && (
                        <div className="space-y-6">
                            <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-6">
                                <p className="font-mono text-lg text-center leading-relaxed">
                                    {exercise.content.sentence
                                        .split("___")
                                        .map((part: string, index: number, array: string[]) => (
                                            <React.Fragment key={index}>
                                                {part}
                                                {index < array.length - 1 && (
                                                    <Input
                                                        type="text"
                                                        placeholder={`...${index + 1}...`}
                                                        value={(answers[exercise.id] || [])[index] || ''}
                                                        onChange={(e) => {
                                                            const currentAnswers = answers[exercise.id] || [];
                                                            currentAnswers[index] = e.target.value;
                                                            setAnswers((prev) => ({
                                                                ...prev,
                                                                [exercise.id]: currentAnswers,
                                                            }));
                                                        }}
                                                        className={`inline-block w-24 mx-2 text-center ${results[exercise.id]?.correctAnswers?.[index] === (answers[exercise.id] || [])[index]
                                                            ? 'border-green-500'
                                                            : results[exercise.id]
                                                                ? 'border-red-500'
                                                                : ''
                                                            }`}
                                                        size="large"
                                                    />
                                                )}
                                            </React.Fragment>
                                        ))}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Hint Section */}
                    {showHint && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <BulbOutlined className="text-blue-500" />
                                <span className="font-medium text-blue-700 dark:text-blue-300">Gợi ý:</span>
                            </div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                Hãy chú ý đến các trợ từ và mẫu ngữ pháp đã học trong bài.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex items-center justify-between">
                        <Button
                            size="large"
                            onClick={() => setCurrentExercise(prev => Math.max(0, prev - 1))}
                            disabled={currentExercise === 0}
                        >
                            ← Bài trước
                        </Button>

                        <div className="flex items-center gap-4">
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => submitAnswer(exercise.id, answers[exercise.id])}
                                disabled={!answers[exercise.id] || results[exercise.id]}
                                className="px-8"
                            >
                                Nộp bài
                            </Button>

                            {results[exercise.id] && (
                                <div className="flex items-center gap-2">
                                    <div className={`text-lg font-bold ${results[exercise.id].isCorrect ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {results[exercise.id].isCorrect ? '✅ Đúng' : '❌ Sai'}
                                    </div>
                                    <Badge
                                        count={`+${results[exercise.id].score} điểm`}
                                        style={{
                                            backgroundColor: results[exercise.id].isCorrect ? '#52c41a' : '#ff4d4f'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <Button
                            size="large"
                            onClick={() => setCurrentExercise(prev => Math.min(exercises.length - 1, prev + 1))}
                            disabled={currentExercise === exercises.length - 1}
                        >
                            Bài tiếp →
                        </Button>
                    </div>

                    {/* Explanation */}
                    {results[exercise.id] && (
                        <div className="mt-6 p-6 bg-secondary-50 dark:bg-secondary-800 rounded-lg border-l-4 border-orange-500">
                            <div className="flex items-center gap-2 mb-3">
                                <BulbOutlined className="text-orange-500" />
                                <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                                    Giải thích:
                                </span>
                            </div>
                            <p className="text-secondary-700 dark:text-secondary-400 leading-relaxed">
                                {results[exercise.id].explanation}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-700 dark:to-purple-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <TrophyOutlined className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Tiến độ bài tập</h3>
                        <p className="text-white/80 text-sm">
                            Đã hoàn thành {Object.keys(results).length}/{exercises.length} bài
                        </p>
                    </div>
                </div>
                <Progress
                    percent={(Object.keys(results).length / exercises.length) * 100}
                    strokeColor="#ffffff"
                    trailColor="rgba(255,255,255,0.3)"
                    size={8}
                    showInfo={false}
                />
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            {Object.values(results).filter((r: any) => r.isCorrect).length}
                        </div>
                        <div className="text-sm text-white/80">Đúng</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            {Object.values(results).filter((r: any) => !r.isCorrect).length}
                        </div>
                        <div className="text-sm text-white/80">Sai</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            {Object.values(results).reduce((sum: number, r: any) => sum + r.score, 0)}
                        </div>
                        <div className="text-sm text-white/80">Tổng điểm</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExercisesTab;
