import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Card, Button, Radio, Typography, Space, Progress, Tag, message, Collapse } from 'antd';
import { SoundOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { MCQExercise } from '../../services/conversationLessonAPI';

const { Text } = Typography;

interface ListeningMCQProps {
    exercises: MCQExercise[];
    onSubmit: (answers: number[]) => void;
    onProgress: (current: number, total: number) => void;
    variant?: 'listening' | 'reading';
}

const ListeningMCQ: React.FC<ListeningMCQProps> = ({
    exercises,
    onSubmit,
    onProgress,
    variant = 'listening'
}) => {
    const isAudioEnabled = variant === 'listening';
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const submittedOnceRef = useRef(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playingAllRef = useRef(false); // Track if currently playing all

    const currentExercise = exercises[currentExerciseIndex];
    const answeredCount = useMemo(
        () => answers.filter((a) => typeof a === 'number').length,
        [answers]
    );
    const progress = exercises.length > 0 ? (answeredCount / exercises.length) * 100 : 0;

    React.useEffect(() => {
        onProgress(answeredCount, exercises.length);

        // Only reset if not playing all
        if (!playingAllRef.current) {
            setSelectedAnswer(null);
            setShowResult(false);
        }

        // Auto-scroll to current exercise when playing
        if (isPlaying || isPlayingAll) {
            requestAnimationFrame(() => {
                scrollToCurrentExercise();
            });
        }
    }, [currentExerciseIndex, answeredCount, exercises.length, onProgress]);

    const scrollToCurrentExercise = useCallback(() => {
        if (containerRef.current) {
            const exerciseElements = containerRef.current.querySelectorAll('.exercise-item');
            const currentElement = exerciseElements[currentExerciseIndex] as HTMLElement;

            if (currentElement) {
                currentElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [currentExerciseIndex]);

    const playTTSForExercise = useCallback((exercise: MCQExercise): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            // Check if browser supports speech synthesis
            if (!('speechSynthesis' in window)) {
                reject(new Error('Browser không hỗ trợ Text-to-Speech'));
                return;
            }

            const utterance = new SpeechSynthesisUtterance(exercise.question_vi);

            // Configure for Vietnamese
            utterance.lang = 'vi-VN';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Try to get Vietnamese voice (prefer Natural if available)
            const voices = window.speechSynthesis.getVoices();
            const vietnameseVoices = voices.filter(voice =>
                voice.lang.startsWith('vi') || voice.name.includes('Vietnamese')
            );
            const naturalVietnamese = vietnameseVoices.find(voice =>
                /natural/i.test(voice.name)
            );
            const preferredVietnamese =
                naturalVietnamese ||
                vietnameseVoices.find(voice => /online/i.test(voice.name)) ||
                vietnameseVoices[0];

            if (preferredVietnamese) {
                utterance.voice = preferredVietnamese;
            }

            utterance.onend = () => {
                resolve();
            };

            utterance.onerror = (event) => {
                reject(new Error('TTS error: ' + event.error));
            };

            // Start speaking
            window.speechSynthesis.speak(utterance);
        });
    }, []);

    const playAudio = useCallback(async () => {
        if (!isAudioEnabled) return;
        if (!currentExercise) return;

        try {
            setIsPlaying(true);

            // Cancel any ongoing speech
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            // Stop any current audio
            if (audioRef.current) {
                audioRef.current.pause();
            }

            // Use TTS
            await playTTSForExercise(currentExercise);
            setIsPlaying(false);
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
            message.warning('Không thể phát âm thanh. Vui lòng thử lại.');
        }
    }, [currentExercise, playTTSForExercise, isAudioEnabled]);

    const playAllAudio = useCallback(async () => {
        if (!isAudioEnabled) return;
        try {
            playingAllRef.current = true;
            setIsPlayingAll(true);
            setIsPlaying(true);

            // Cancel any ongoing speech
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            // Play all exercises one by one
            for (let i = 0; i < exercises.length; i++) {
                // Update current exercise index
                setCurrentExerciseIndex(i);

                // Small delay for smooth transition
                await new Promise(resolve => setTimeout(resolve, 150));

                // Play TTS for current exercise
                await playTTSForExercise(exercises[i]);

                // Wait between exercises (except after the last one)
                if (i < exercises.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            playingAllRef.current = false;
            setIsPlayingAll(false);
            setIsPlaying(false);
            message.success('Đã phát tất cả câu hỏi!');

        } catch (error) {
            console.error('Error playing all audio:', error);
            playingAllRef.current = false;
            setIsPlayingAll(false);
            setIsPlaying(false);
            message.error('Không thể phát tất cả âm thanh. Vui lòng thử lại.');
        }
    }, [exercises, playTTSForExercise, isAudioEnabled]);

    const checkAnswer = useCallback(() => {
        if (selectedAnswer === null) {
            message.warning('Vui lòng chọn một đáp án');
            return;
        }

        const isCorrect = selectedAnswer === currentExercise.correct_index;
        const newAnswers = [...answers];
        newAnswers[currentExerciseIndex] = selectedAnswer;
        setAnswers(newAnswers);
        setShowResult(true);

        if (isCorrect) {
            message.success('Đúng! 🎉');
        } else {
            message.error('Chưa đúng. Xem giải thích nhé!');
        }

        setTimeout(() => {
            if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
            } else {
                if (!submittedOnceRef.current) {
                    submittedOnceRef.current = true;
                    onSubmit(newAnswers);
                }
            }
        }, 3000);
    }, [selectedAnswer, currentExercise, answers, currentExerciseIndex, exercises.length, onSubmit]);

    const handlePrevious = useCallback(() => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(currentExerciseIndex - 1);
        }
    }, [currentExerciseIndex]);

    // Memoize buttons to prevent re-render
    const audioButtons = useMemo(() => {
        if (!isAudioEnabled) return null;
        return (
            <Space className="mb-4">
                <Button
                    type="primary"
                    size="large"
                    icon={<SoundOutlined />}
                    onClick={playAudio}
                    loading={isPlaying && !isPlayingAll}
                    disabled={isPlayingAll}
                    style={{
                        transition: 'opacity 0.3s ease, background-color 0.3s ease',
                        minWidth: '150px'
                    }}
                >
                    {isPlaying && !isPlayingAll ? 'Đang phát...' : 'Nghe câu hỏi'}
                </Button>

                <Button
                    type="default"
                    size="large"
                    icon={<SoundOutlined />}
                    onClick={playAllAudio}
                    loading={isPlayingAll}
                    disabled={isPlaying && !isPlayingAll}
                    style={{
                        transition: 'opacity 0.3s ease, background-color 0.3s ease',
                        minWidth: '150px'
                    }}
                >
                    {isPlayingAll ? 'Đang phát tất cả...' : 'Phát tất cả'}
                </Button>
            </Space>
        );
    }, [isAudioEnabled, isPlaying, isPlayingAll, playAudio, playAllAudio]);

    const actionButtons = useMemo(() => (
        <div className="flex justify-between mt-4" style={{ minHeight: '40px' }}>
            {currentExerciseIndex > 0 ? (
                <Button
                    onClick={handlePrevious}
                    style={{
                        transition: 'all 0.3s ease',
                        minWidth: '100px'
                    }}
                >
                    Câu trước
                </Button>
            ) : (
                <div style={{ minWidth: '100px' }} />
            )}

            <Button
                type="primary"
                onClick={checkAnswer}
                disabled={selectedAnswer === null || showResult}
                style={{
                    transition: 'all 0.3s ease',
                    minWidth: '100px'
                }}
            >
                Kiểm tra
            </Button>
        </div>
    ), [currentExerciseIndex, selectedAnswer, showResult, checkAnswer, handlePrevious]);

    if (!currentExercise) {
        return (
            <Card className="text-center py-8">
                <Text type="secondary">Không có bài tập trắc nghiệm</Text>
            </Card>
        );
    }

    return (
        <Card
            className="shadow-lg"
            title={
                <div className="flex justify-between items-center">
                    <Text strong className="text-lg">
                        {variant === 'listening' ? '🧠 Bài tập nghe-hiểu' : '📖 Bài tập đọc-hiểu'}
                    </Text>
                    <Space>
                        <Tag color="blue">Câu {currentExerciseIndex + 1}/{exercises.length}</Tag>
                        <Tag color="geekblue">{answeredCount}/{exercises.length}</Tag>
                        <Tag color="green">{Math.round(progress)}%</Tag>
                    </Space>
                </div>
            }
        >
            <div ref={containerRef} className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {/* Audio Player */}
                {audioButtons && (
                    <div className="text-center">
                        {audioButtons}
                        <div className="text-sm text-gray-500">
                            Nghe kỹ câu hỏi và chọn đáp án đúng nhất
                        </div>
                    </div>
                )}

                {/* Question */}
                <div className="exercise-item text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Text className="text-lg font-medium">
                        {currentExercise.question_vi}
                    </Text>
                </div>

                <div className="exercise-item">
                    <Radio.Group
                        value={selectedAnswer}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="w-full"
                    >
                        {currentExercise.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect = showResult && index === currentExercise.correct_index;
                            const isWrong = showResult && isSelected && index !== currentExercise.correct_index;

                            return (
                                <div key={index} className="mb-4 last:mb-0">
                                    <label
                                        className={`
                                            flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300
                                            ${isSelected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 hover:bg-gray-50"}
                                            ${isCorrect ? "border-green-500 bg-green-50" : ""}
                                            ${isWrong ? "border-red-500 bg-red-50" : ""}
                                        `}
                                    >
                                        <Radio value={index} />
                                        <span className="flex-1 text-base">{option}</span>

                                        {isCorrect && <CheckCircleOutlined className="text-green-500 text-lg" />}
                                        {isWrong && <CloseCircleOutlined className="text-red-500 text-lg" />}
                                    </label>
                                </div>
                            );
                        })}
                    </Radio.Group>

                    {/* Explanation */}
                    {showResult && currentExercise.explanation_vi && (
                        <Collapse className="mt-4">
                            <Collapse.Panel
                                header={
                                    <div className="flex items-center">
                                        <InfoCircleOutlined className="mr-2" />
                                        <Text>Giải thích</Text>
                                    </div>
                                }
                                key="explanation"
                            >
                                <Text className="text-sm">
                                    {currentExercise.explanation_vi}
                                </Text>
                            </Collapse.Panel>
                        </Collapse>
                    )}

                    {/* Actions */}
                    {actionButtons}

                    {/* Instructions */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Text type="secondary" className="text-xs">
                            {variant === 'listening'
                                ? 'Hướng dẫn: Nghe câu hỏi và chọn đáp án đúng nhất.'
                                : 'Hướng dẫn: Đọc câu hỏi và chọn đáp án đúng nhất.'}
                        </Text>
                    </div>
                </div>
            </div>

            {isAudioEnabled && <audio ref={audioRef} />}
        </Card>
    );
};

export default ListeningMCQ;
