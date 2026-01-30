import React, { useState, useRef } from 'react';
import { Card, Button, Typography, Space, Progress, Tag, message } from 'antd';
import {
    AudioOutlined,
    StopOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { ReactionSpeakingExercise } from '../../services/conversationLessonAPI';

const { Text, Title } = Typography;

interface SituationResponseProps {
    exercises: ReactionSpeakingExercise[];
    onSubmit: (responses: string[]) => void;
    onProgress: (current: number, total: number) => void;
}

const SituationResponse: React.FC<SituationResponseProps> = ({
    exercises,
    onSubmit,
    onProgress
}) => {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [userAudioBlob, setUserAudioBlob] = useState<Blob | null>(null);
    const [responses, setResponses] = useState<string[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);

    const currentExercise = exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        onProgress(currentExerciseIndex + 1, exercises.length);
    }, [currentExerciseIndex, onProgress]);

    React.useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 5) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

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

                // Save response (mock implementation)
                const newResponses = [...responses];
                newResponses[currentExerciseIndex] = 'User response recorded';
                setResponses(newResponses);

                message.success('Đã ghi âm phản hồi!');
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            message.error('Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const playRecording = () => {
        if (userAudioBlob && audioRef.current) {
            const audioUrl = URL.createObjectURL(userAudioBlob);
            audioRef.current.src = audioUrl;
            audioRef.current.play();
            setIsPlaying(true);

            audioRef.current.onended = () => {
                setIsPlaying(false);
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
            onSubmit(responses);
        }
    };

    const formatTime = (seconds: number) => {
        return `${seconds}s`;
    };

    if (isCompleted) {
        return (
            <Card className="text-center py-8">
                <div className="space-y-4">
                    <CheckCircleOutlined className="text-6xl text-green-500" />
                    <Title level={3}>Hoàn thành phản xạ! ⚡</Title>
                    <div className="space-y-2">
                        <Text className="text-lg">
                            Đã hoàn thành {responses.length}/{exercises.length} tình huống
                        </Text>
                    </div>
                    <Button type="primary" size="large" onClick={() => onSubmit(responses)}>
                        Tiếp tục
                    </Button>
                </div>
            </Card>
        );
    }

    if (!currentExercise) {
        return (
            <Card className="text-center py-8">
                <Text type="secondary">Không có bài tập phản xạ</Text>
            </Card>
        );
    }

    return (
        <Card
            className="shadow-lg"
            title={
                <div className="flex justify-between items-center">
                    <Text strong className="text-lg">⚡ Bài tập phản xạ</Text>
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
                {/* Situation */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Text strong className="text-base mb-2 block">
                        Tình huống:
                    </Text>
                    <Text className="text-lg">
                        {currentExercise.situation_vi}
                    </Text>
                </div>

                {/* Expected Pattern */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Text strong className="text-base mb-2 block">
                        Mẫu câu gợi ý:
                    </Text>
                    <div className="space-y-2">
                        <Text className="text-base">{currentExercise.expected_pattern}</Text>
                        <Text className="text-sm text-gray-600">{currentExercise.example_answer_jp}</Text>
                        <Text className="text-sm text-gray-500">{currentExercise.example_answer_vi}</Text>
                    </div>
                </div>

                {/* Timer */}
                {isRecording && (
                    <div className="text-center">
                        <div className="relative inline-flex items-center justify-center">
                            <ClockCircleOutlined className="text-4xl text-red-500 mr-2" />
                            <div className="text-2xl font-bold text-red-500">
                                {formatTime(recordingTime)}
                            </div>
                            <div className="text-sm text-red-500 ml-2">
                                / 5s
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                            Nói phản hồi của bạn...
                        </div>
                    </div>
                )}

                {/* Recording Controls */}
                <div className="text-center space-y-3">
                    {!isRecording ? (
                        <Button
                            type="primary"
                            size="large"
                            icon={<AudioOutlined />}
                            onClick={startRecording}
                            className="mb-4"
                        >
                            Bắt đầu ghi âm (5s)
                        </Button>
                    ) : (
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

                {/* Playback Controls */}
                {userAudioBlob && !isRecording && (
                    <div className="text-center space-y-3">
                        <Button
                            icon={isPlaying ? <StopOutlined /> : <PlayCircleOutlined />}
                            onClick={playRecording}
                            disabled={isPlaying}
                        >
                            {isPlaying ? 'Đang phát...' : 'Nghe lại'}
                        </Button>

                        <div className="text-sm text-gray-500">
                            Thời gian ghi âm: {formatTime(recordingTime)}
                        </div>
                    </div>
                )}

                {/* Next Button */}
                {userAudioBlob && !isRecording && (
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
                        Hướng dẫn: Đọc tình huống và đưa ra phản hồi nhanh chóng trong 5 giây. Tập trung vào sự tự nhiên và đúng ngữ cảnh.
                    </Text>
                </div>
            </div>

            <audio ref={audioRef} />
        </Card>
    );
};

export default SituationResponse;
