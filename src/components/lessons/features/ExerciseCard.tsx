import React from "react";
import { Badge, Button } from "antd";
import {
    CheckCircle,
    Lightbulb,
} from "lucide-react";

interface ExerciseCardProps {
    exercise: {
        id: string;
        type: "multiple_choice" | "fill_blank";
        title: string;
        question: string;
        content: any;
    };
    answer?: any;
    result?: {
        isCorrect: boolean;
        score: number;
        explanation: string;
    };
    onSelect: (answer: any) => void;
    onSubmit: () => void;
    showHint?: boolean;
    onToggleHint?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    answer,
    result,
    onSelect,
    onSubmit,
    showHint = false,
    onToggleHint,
}) => {
    return (
        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
            {/* Exercise Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-700 dark:to-red-700 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Badge
                            count={exercise.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Điền vào chỗ trống'}
                            size="small"
                            style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                            className="mb-2"
                        />
                        <h3 className="text-xl font-bold text-white mb-2">
                            {exercise.title}
                        </h3>
                        <p className="text-white/90">
                            {exercise.question}
                        </p>
                    </div>
                    <Button
                        type="default"
                        size="large"
                        icon={<Lightbulb className="w-4 h-4" />}
                        className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                        onClick={onToggleHint}
                    >
                        Gợi ý
                    </Button>
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
                                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${answer === option
                                        ? result?.isCorrect
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : result
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
                                            checked={answer === option}
                                            onChange={(e) => onSelect(e.target.value)}
                                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                        />
                                        <div className="ml-3 flex-1">
                                            <div className="font-medium text-secondary-900 dark:text-secondary-100">
                                                {String.fromCharCode(65 + index)}. {option}
                                            </div>
                                        </div>
                                        {result && answer === option && (
                                            <div className="ml-3">
                                                {result.isCorrect ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
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

                {/* Hint Section */}
                {showHint && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-blue-700 dark:text-blue-300">Gợi ý:</span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            Hãy chú ý đến các trợ từ và mẫu ngữ pháp đã học trong bài.
                        </p>
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-8 text-center">
                    <Button
                        type="primary"
                        size="large"
                        onClick={onSubmit}
                        disabled={!answer || !!result}
                        className="px-8"
                    >
                        Nộp bài
                    </Button>
                </div>

                {/* Result */}
                {result && (
                    <div className="mt-6 p-6 bg-secondary-50 dark:bg-secondary-800 rounded-lg border-l-4 border-orange-500">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-orange-500" />
                            <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                                Giải thích:
                            </span>
                        </div>
                        <p className="text-secondary-700 dark:text-secondary-400 leading-relaxed">
                            {result.explanation}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseCard;
