import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Typography, Space, Progress, Tag, message, Rate } from 'antd';
import {
    SoundOutlined,
    AudioOutlined,
    StopOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import { ShadowingExercise, DialogueLine } from '../../services/conversationLessonAPI';

const { Text, Title } = Typography;

interface ShadowingTrainerProps {
    exercises: ShadowingExercise[];
    dialogue: DialogueLine[];
    onSubmit: (scores: number[]) => void;
    onProgress: (current: number, total: number) => void;
}

const ShadowingTrainer: React.FC<ShadowingTrainerProps> = ({
    exercises,
    dialogue,
    onSubmit,
    onProgress
}) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isPlayingNative, setIsPlayingNative] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlayingUser, setIsPlayingUser] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
    const [scores, setScores] = useState<number[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);

    const currentExercise = exercises[currentExerciseIndex];
    const currentLine = dialogue.find(line => line.line_id === currentExercise?.line_id);
    const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        onProgress(currentExerciseIndex + 1, exercises.length);
    }, [currentExerciseIndex, onProgress]);

    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdown === 0 && isRecording) {
            startRecording();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [countdown, isRecording]);

    const playNativeAudio = async () => {
        if (!currentLine) return;

        try {
            setIsPlayingNative(true);

            // Cancel any ongoing speech
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            // Try to use provided audio URL first, fallback to TTS
            if (currentLine.audio_url) {
                const audio = new Audio(currentLine.audio_url);

                audio.onended = () => {
                    setIsPlayingNative(false);
                    // Start countdown after native audio
                    setCountdown(3);
                };

                audio.onerror = () => {
                    setIsPlayingNative(false);
                    // Fallback to TTS
                    playTTSAudio();
                };

                await audio.play();
            } else {
                // Use TTS directly
                await playTTSAudio();
            }
        } catch (error) {
            console.error('Error playing native audio:', error);
            setIsPlayingNative(false);
            message.warning('Không thể phát âm thanh. Vui lòng thử lại.');
        }
    };

    const playTTSAudio = async () => {
        if (!currentLine) return;

        return new Promise<void>((resolve, reject) => {
            // Check if browser supports speech synthesis
            if (!('speechSynthesis' in window)) {
                reject(new Error('Browser không hỗ trợ Text-to-Speech'));
                return;
            }

            const utterance = new SpeechSynthesisUtterance(currentLine.text_jp);

            // Configure for Japanese
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8; // Slower for shadowing
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Try to get Japanese voice (prefer Natural if available)
            const voices = window.speechSynthesis.getVoices();
            const japaneseVoices = voices.filter(voice =>
                voice.lang.startsWith('ja') || voice.name.includes('Japanese')
            );
            const naturalJapanese = japaneseVoices.find(voice =>
                /natural/i.test(voice.name)
            );
            const preferredJapanese =
                naturalJapanese ||
                japaneseVoices.find(voice => /online/i.test(voice.name)) ||
                japaneseVoices[0];

            if (preferredJapanese) {
                utterance.voice = preferredJapanese;
            }

            utterance.onend = () => {
                setIsPlayingNative(false);
                // Start countdown after TTS
                setCountdown(3);
                resolve();
            };

            utterance.onerror = (event) => {
                setIsPlayingNative(false);
                reject(new Error('TTS error: ' + event.error));
            };

            // Start speaking
            window.speechSynthesis.speak(utterance);
        });
    };

    const startCountdown = () => {
        setCountdown(3);
        setIsRecording(true);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: BlobPart[] = [];
            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                setUserAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());

                // Auto analyze and score (mock implementation)
                const score = Math.floor(Math.random() * 30) + 70; // 70-100
                const newScores = [...scores];
                newScores[currentExerciseIndex] = score;
                setScores(newScores);

                message.success(`Hoàn thành! Điểm: ${score}/100`);
            };

            mediaRecorder.start();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            message.error('Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const playUserRecording = () => {
        if (userAudioBlob && audioRef.current) {
            const audioUrl = URL.createObjectURL(userAudioBlob);
            audioRef.current.src = audioUrl;
            audioRef.current.play();
            setIsPlayingUser(true);

            audioRef.current.onended = () => {
                setIsPlayingUser(false);
                URL.revokeObjectURL(audioUrl);
            };
        }
    };

    const nextExercise = () => {
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setUserAudioBlob(null);
        } else {
            setIsCompleted(true);
            onSubmit(scores);
        }
    };

    const getAverageScore = () => {
        if (scores.length === 0) return 0;
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    };

    const getFocusLabel = (focus: string) => {
        switch (focus) {
            case 'intonation': return 'Ngữ điệu';
            case 'speed': return 'Tốc độ';
            case 'emotion': return 'Cảm xúc';
            default: return focus;
        }
    };

    if (isCompleted) {
        return (
            <Card className="text-center py-8">
                <div className="space-y-4">
                    <CheckCircleOutlined className="text-6xl text-green-500" />
                    <Title level={3}>Hoàn thành Shadowing! 🔊</Title>
                    <div className="space-y-2">
                        <Text className="text-lg">Điểm trung bình: {getAverageScore()}/100</Text>
                        <div className="flex justify-center">
                            <Rate disabled value={getAverageScore() / 20} />
                        </div>
                    </div>
                    <Button type="primary" size="large" onClick={() => onSubmit(scores)}>
                        Tiếp tục
                    </Button>
                </div>
            </Card>
        );
    }

    if (!currentExercise || !currentLine) {
        return (
            <Card className="text-center py-8">
                <Text type="secondary">Không có bài tập shadowing</Text>
            </Card>
        );
    }

    return (
        <Card
            className="shadow-lg"
            title={
                <div className="flex justify-between items-center">
                    <Text strong className="text-lg">🔊 Bài tập Shadowing</Text>
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
                {/* Exercise Info */}
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Text className="text-lg font-medium">
                        Tập trung vào: <span className="text-blue-600 font-bold">{getFocusLabel(currentExercise.focus)}</span>
                    </Text>
                </div>

                {/* Native Audio */}
                <div className="space-y-3">
                    <Text strong className="text-base">Nghe audio gốc:</Text>
                    <div className="text-center">
                        <Button
                            type="primary"
                            size="large"
                            icon={<SoundOutlined />}
                            onClick={playNativeAudio}
                            loading={isPlayingNative}
                            disabled={isRecording}
                        >
                            {isPlayingNative ? 'Đang phát...' : 'Nghe câu gốc'}
                        </Button>
                    </div>

                    {/* Display Text */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Text className="text-lg">{currentLine.text_jp}</Text>
                        <div className="mt-2 text-sm text-gray-500">{currentLine.romaji}</div>
                    </div>
                </div>

                {/* Recording Section */}
                <div className="space-y-4">
                    <Text strong className="text-base">Lặp lại và ghi âm:</Text>

                    {/* Countdown */}
                    {countdown > 0 && (
                        <div className="text-center">
                            <div className="text-6xl font-bold text-red-500 mb-2">
                                {countdown}
                            </div>
                            <Text className="text-lg">Chuẩn bị ghi âm...</Text>
                        </div>
                    )}

                    {/* Recording Controls */}
                    <div className="text-center space-y-3">
                        {!isRecording && countdown === 0 && (
                            <Button
                                type="primary"
                                size="large"
                                icon={<AudioOutlined />}
                                onClick={startCountdown}
                                disabled={isPlayingNative}
                            >
                                Bắt đầu ghi âm
                            </Button>
                        )}

                        {isRecording && (
                            <Button
                                danger
                                size="large"
                                icon={<StopOutlined />}
                                onClick={stopRecording}
                            >
                                Dừng ghi âm
                            </Button>
                        )}
                    </div>

                    {/* User Recording Playback */}
                    {userAudioBlob && !isRecording && (
                        <div className="text-center space-y-3">
                            <Button
                                icon={isPlayingUser ? <StopOutlined /> : <PlayCircleOutlined />}
                                onClick={playUserRecording}
                                disabled={isPlayingUser}
                            >
                                {isPlayingUser ? 'Đang phát...' : 'Nghe lại'}
                            </Button>

                            {scores[currentExerciseIndex] && (
                                <div className="space-y-2">
                                    <Text className="text-lg">Điểm: {scores[currentExerciseIndex]}/100</Text>
                                    <Rate disabled value={scores[currentExerciseIndex] / 20} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Next Button */}
                {userAudioBlob && !isRecording && scores[currentExerciseIndex] && (
                    <div className="text-center">
                        <Button
                            type="primary"
                            size="large"
                            onClick={nextExercise}
                            className="mt-4"
                        >
                            {currentExerciseIndex < exercises.length - 1 ? 'Tiếp theo' : 'Hoàn thành'}
                        </Button>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Text type="secondary" className="text-xs">
                        Hướng dẫn: Nghe audio gốc, sau đó lặp lại chính xác. Tập trung vào {getFocusLabel(currentExercise.focus)}.
                    </Text>
                </div>
            </div>

            <audio ref={audioRef} />
        </Card>
    );
};

export default ShadowingTrainer;
