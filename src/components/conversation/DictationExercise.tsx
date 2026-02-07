import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Typography, Space, Progress, Tag, message } from 'antd';
import { SoundOutlined, BulbOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DictationExercise } from '../../services/conversationLessonAPI';
import { getNanamiNaturalVoice } from '../../utils/vocabularyUtils';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface DictationExerciseProps {
    exercises: DictationExercise[];
    onSubmit: (answers: string[]) => void;
    onProgress: (current: number, total: number) => void;
}

const DictationExerciseComponent: React.FC<DictationExerciseProps> = ({
    exercises,
    onSubmit,
    onProgress
}) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [answers, setAnswers] = useState<string[]>([]);
    const [results, setResults] = useState<boolean[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [isCompleted, setIsCompleted] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const inputRef = useRef<any>(null);

    const currentExercise = exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

    useEffect(() => {
        onProgress(currentExerciseIndex + 1, exercises.length);
        setUserInput('');
        setShowHint(false);
        setStartTime(Date.now());
    }, [currentExerciseIndex]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const playAudio = async () => {
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

            // Try to use provided audio URL first, fallback to TTS
            // For now, always use TTS since DictationExercise doesn't have audio_url
            await playTTSAudio();
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
            message.warning('Không thể phát âm thanh. Vui lòng thử lại.');
        }
    };

    const playTTSAudio = async () => {
        if (!currentExercise) return;

        return new Promise<void>((resolve, reject) => {
            // Check if browser supports speech synthesis
            if (!('speechSynthesis' in window)) {
                reject(new Error('Browser không hỗ trợ Text-to-Speech'));
                return;
            }

            // Speak the complete sentence with the answer filled in
            const completeSentence = currentExercise.text_with_blank.replace('___', currentExercise.answer);
            const utterance = new SpeechSynthesisUtterance(completeSentence);

            // Configure for Japanese
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8; // Slower for dictation
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Try to get Japanese voice (prefer Natural if available)
            const voices = window.speechSynthesis.getVoices();
            const japaneseVoices = voices.filter(voice =>
                voice.lang.startsWith('ja') || voice.name.includes('Japanese')
            );

            // CHỈ sử dụng Microsoft Nanami Online (Natural)
            const nanamiNatural = getNanamiNaturalVoice();
            const preferredJapanese = nanamiNatural;

            if (preferredJapanese) {
                utterance.voice = preferredJapanese;
            } else {
                // Nếu không có Microsoft Nanami, không phát âm
                console.warn('Microsoft Nanami Online (Natural) not available. Please install the voice.');
                reject(new Error('Microsoft Nanami Online (Natural) not available'));
                return;
            }

            utterance.onend = () => {
                setIsPlaying(false);
                resolve();
            };

            utterance.onerror = (event) => {
                setIsPlaying(false);
                reject(new Error('TTS error: ' + event.error));
            };

            console.log('Speaking complete sentence:', completeSentence);
            window.speechSynthesis.speak(utterance);
        });
    };

    const checkAnswer = () => {
        if (!currentExercise || !userInput.trim()) return;

        const isCorrect = userInput.trim().toLowerCase() === currentExercise.answer.toLowerCase();
        const newAnswers = [...answers];
        const newResults = [...results];

        newAnswers[currentExerciseIndex] = userInput.trim();
        newResults[currentExerciseIndex] = isCorrect;

        setAnswers(newAnswers);
        setResults(newResults);

        if (isCorrect) {
            message.success('Đúng! 🎉');
            setTimeout(() => {
                if (currentExerciseIndex < exercises.length - 1) {
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                } else {
                    setIsCompleted(true);
                    onSubmit(newAnswers);
                }
            }, 1500);
        } else {
            message.error('Chưa đúng. Thử lại nhé!');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            checkAnswer();
        }
    };

    const showHintHandler = () => {
        setShowHint(true);
    };

    const getAccuracy = () => {
        const correct = results.filter(r => r).length;
        return Math.round((correct / results.length) * 100);
    };

    const getTimeBonus = () => {
        const totalTime = (Date.now() - startTime) / 1000;
        return Math.max(0, Math.round(100 - totalTime));
    };

    if (isCompleted) {
        return (
            <Card className="text-center py-8">
                <div className="space-y-4">
                    <CheckCircleOutlined className="text-6xl text-green-500" />
                    <Title level={3}>Hoàn thành! 🎉</Title>
                    <div className="space-y-2">
                        <Text className="text-lg">Độ chính xác: {getAccuracy()}%</Text>
                        <Text className="text-lg">Thời gian: {getTimeBonus()} điểm</Text>
                        <Text className="text-xl font-bold text-blue-600">
                            Tổng điểm: {getAccuracy() + getTimeBonus()}
                        </Text>
                    </div>
                    <Button type="primary" size="large" onClick={() => onSubmit(answers)}>
                        Tiếp tục
                    </Button>
                </div>
            </Card>
        );
    }

    if (!currentExercise) {
        return (
            <Card className="text-center py-8">
                <Text type="secondary">Không có bài tập dictation</Text>
            </Card>
        );
    }

    return (
        <Card
            className="shadow-lg"
            title={
                <div className="flex justify-between items-center">
                    <Text strong className="text-lg">✍️ Bài tập nghe-viết</Text>
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
                {/* Audio Player */}
                <div className="text-center">
                    <Button
                        type="primary"
                        size="large"
                        icon={<SoundOutlined />}
                        onClick={playAudio}
                        loading={isPlaying}
                        className="mb-4"
                    >
                        {isPlaying ? 'Đang phát...' : 'Nghe câu'}
                    </Button>

                    <div className="text-sm text-gray-500">
                        Nhấn để nghe câu, sau đó viết lại chính xác những gì bạn nghe được
                    </div>
                </div>

                {/* Exercise */}
                <div className="space-y-4">
                    <div className="text-center">
                        <Text className="text-lg">
                            {currentExercise.text_with_blank}
                        </Text>
                    </div>

                    {/* Input */}
                    <div>
                        <TextArea
                            ref={inputRef}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập câu hoàn chỉnh..."
                            className="text-lg"
                            rows={3}
                            style={{
                                borderColor: results[currentExerciseIndex] === false ? '#ff4d4f' : undefined
                            }}
                        />

                        {/* Feedback */}
                        {results[currentExerciseIndex] !== undefined && (
                            <div className="mt-2 flex items-center space-x-2">
                                {results[currentExerciseIndex] ? (
                                    <>
                                        <CheckCircleOutlined className="text-green-500" />
                                        <Text className="text-green-500">Đúng!</Text>
                                    </>
                                ) : (
                                    <>
                                        <CloseCircleOutlined className="text-red-500" />
                                        <Text className="text-red-500">
                                            Đáp án đúng: {currentExercise.answer}
                                        </Text>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Hint */}
                    {showHint && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <Text className="text-sm">
                                <BulbOutlined className="mr-1" />
                                Gợi ý: Bắt đầu bằng "{currentExercise.answer.charAt(0)}"
                            </Text>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between">
                        <Button
                            icon={<BulbOutlined />}
                            onClick={showHintHandler}
                            disabled={showHint}
                        >
                            Gợi ý
                        </Button>

                        <Space>
                            {currentExerciseIndex > 0 && (
                                <Button onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}>
                                    Câu trước
                                </Button>
                            )}

                            <Button
                                type="primary"
                                onClick={checkAnswer}
                                disabled={!userInput.trim()}
                            >
                                Kiểm tra
                            </Button>
                        </Space>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Text type="secondary" className="text-xs">
                        Hướng dẫn: Nghe câu audio và viết lại chính xác. Nhấn Enter để kiểm tra đáp án.
                    </Text>
                </div>
            </div>

            <audio ref={audioRef} />
        </Card>
    );
};

export default DictationExerciseComponent;
