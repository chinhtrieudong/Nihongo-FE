import React, { useRef, useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Progress, Tag, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { ReorderExercise } from '../../services/conversationLessonAPI';

const { Text } = Typography;

interface WordChipProps {
    word: string;
    index: number;
    onClick: (index: number) => void;
    isSelected: boolean;
    isCorrect?: boolean;
    showResult?: boolean;
}

const WordChip: React.FC<WordChipProps> = ({ word, index, onClick, isSelected, isCorrect, showResult }) => {
    return (
        <div
            onClick={() => !showResult && onClick(index)}
            className={`inline-block px-3 py-2 m-1 bg-white dark:bg-gray-700 border-2 rounded-lg cursor-pointer transition-all ${isSelected && !showResult
                    ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 scale-105'
                    : showResult && isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : showResult && !isCorrect
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 hover:border-blue-400 hover:scale-105'
                } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <Text className="text-base font-medium">{word}</Text>
        </div>
    );
};

interface SentenceReorderProps {
    exercises: ReorderExercise[];
    onSubmit: (answers: string[]) => void;
    onProgress: (current: number, total: number) => void;
}

const SentenceReorder: React.FC<SentenceReorderProps> = ({
    exercises,
    onSubmit,
    onProgress
}) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [orderedWords, setOrderedWords] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState<string[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const submittedOnceRef = useRef(false);

    const currentExercise = exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

    const normalizeJaForCompare = (value: string) => {
        const normalized = value.normalize("NFKC");
        const noWhitespace = normalized.replace(/\s+/g, "");
        return noWhitespace.replace(/[。．\.！!？?、,，]+$/g, "");
    };

    useEffect(() => {
        onProgress(currentExerciseIndex + 1, exercises.length);
        if (currentExercise) {
            setAvailableWords([...currentExercise.scrambled]);
            setOrderedWords([]);
            setShowResult(false);
        }
    }, [currentExerciseIndex, currentExercise]);

    const handleWordClick = (index: number, fromAvailable: boolean = true) => {
        if (showResult) return;

        if (fromAvailable) {
            // Move from available to ordered
            const newAvailable = [...availableWords];
            const newOrdered = [...orderedWords];
            const word = newAvailable.splice(index, 1)[0];
            newOrdered.push(word);
            setAvailableWords(newAvailable);
            setOrderedWords(newOrdered);
        } else {
            // Move from ordered back to available
            const newAvailable = [...availableWords];
            const newOrdered = [...orderedWords];
            const word = newOrdered.splice(index, 1)[0];
            newAvailable.push(word);
            setAvailableWords(newAvailable);
            setOrderedWords(newOrdered);
        }
    };

    const checkAnswer = () => {
        if (!currentExercise) return;

        const userAnswer = orderedWords.join('');
        const isCorrect =
            normalizeJaForCompare(userAnswer) ===
            normalizeJaForCompare(currentExercise.correct);
        const newAnswers = [...answers];
        newAnswers[currentExerciseIndex] = userAnswer;
        setAnswers(newAnswers);
        setShowResult(true);

        if (isCorrect) {
            message.success('Đúng! 🎉');
        } else {
            message.error('Chưa đúng. Thử sắp xếp lại nhé!');
        }

        setTimeout(() => {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
            } else {
                setIsCompleted(true);
                if (!submittedOnceRef.current) {
                    submittedOnceRef.current = true;
                    onSubmit(newAnswers);
                }
            }
        }, 3000);
    };

    const userAnswer = orderedWords.join('');
    const isCorrectAnswer =
        !!currentExercise &&
        normalizeJaForCompare(userAnswer) ===
            normalizeJaForCompare(currentExercise.correct);

    const resetWords = () => {
        setAvailableWords([...currentExercise.scrambled]);
        setOrderedWords([]);
        setShowResult(false);
    };

    const getScore = () => {
        const correct = answers.filter((answer, index) =>
            answer === exercises[index]?.correct
        ).length;
        return Math.round((correct / exercises.length) * 100);
    };

    if (!currentExercise) {
        return (
            <Card className="text-center py-8">
                <Text type="secondary">Không có bài tập sắp xếp câu</Text>
            </Card>
        );
    }

    return (
        <Card
            className="shadow-lg"
            title={
                <div className="flex justify-between items-center">
                    <Text strong className="text-lg">🔀 Bài tập sắp xếp câu</Text>
                    <Space>
                        <Tag color="blue">{currentExerciseIndex + 1}/{exercises.length}</Tag>
                        <Tag color="green">{Math.round(progress)}%</Tag>
                    </Space>
                </div>
            }
        >
            {/* Progress */}
            <Progress percent={progress} className="mb-6" />

            <div className="space-y-6">
                {/* Meaning */}
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Text className="text-lg font-medium">
                        {currentExercise.meaning_vi}
                    </Text>
                </div>

                {/* Available Words */}
                <div>
                    <Text strong className="text-base mb-3 block">
                        Từ có sẵn:
                    </Text>

                    <div className="min-h-[60px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="flex flex-wrap justify-center items-center">
                            {availableWords.map((word, index) => (
                                <WordChip
                                    key={`available-${index}`}
                                    word={word}
                                    index={index}
                                    onClick={(i) => handleWordClick(i, true)}
                                    isSelected={false}
                                    showResult={showResult}
                                />
                            ))}
                            {availableWords.length === 0 && (
                                <Text type="secondary" className="text-sm">
                                    Đã sử dụng hết từ
                                </Text>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ordered Words */}
                <div>
                    <Text strong className="text-base mb-3 block">
                        Câu của bạn:
                    </Text>

                    <div className="min-h-[80px] p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600">
                        <div className="flex flex-wrap justify-center items-center">
                            {orderedWords.map((word, index) => (
                                <WordChip
                                    key={`ordered-${index}`}
                                    word={word}
                                    index={index}
                                    onClick={(i) => handleWordClick(i, false)}
                                    isSelected={false}
                                    isCorrect={showResult && isCorrectAnswer}
                                    showResult={showResult}
                                />
                            ))}
                            {orderedWords.length === 0 && (
                                <Text type="secondary" className="text-sm">
                                    Chưa có từ nào. Chọn từ ở trên để bắt đầu.
                                </Text>
                            )}
                        </div>
                    </div>
                </div>

                {/* Result Display */}
                {showResult && (
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <Text className="text-green-700 dark:text-green-300">
                                <CheckCircleOutlined className="mr-2" />
                                Đáp án đúng: {currentExercise.correct}
                            </Text>
                        </div>

                        {!isCorrectAnswer && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <Text className="text-red-700 dark:text-red-300">
                                    <CloseCircleOutlined className="mr-2" />
                                    Câu của bạn: {userAnswer}
                                </Text>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-between">
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={resetWords}
                        >
                            Làm lại
                        </Button>

                        {currentExerciseIndex > 0 && (
                            <Button onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}>
                                Câu trước
                            </Button>
                        )}
                    </Space>

                    <Button
                        type="primary"
                        onClick={checkAnswer}
                        disabled={orderedWords.length === 0 || showResult || isCompleted}
                        className="ml-auto"
                    >
                        Kiểm tra
                    </Button>
                </div>

                {/* Instructions */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Text type="secondary" className="text-xs">
                        Hướng dẫn: Chọn từ để thêm vào câu. Chọn từ trong câu để xóa.
                    </Text>
                </div>
            </div>
        </Card>
    );
};

export default SentenceReorder;
