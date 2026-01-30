import React, { useState, useRef } from 'react';
import { Card, Button, Typography, Select, message, Avatar } from 'antd';
import {
    AudioOutlined,
    StopOutlined,
    CheckCircleOutlined,
    UserOutlined,
    RobotOutlined
} from '@ant-design/icons';
import { RoleplayExercise } from '../../services/conversationLessonAPI';

const { Text, Title } = Typography;
const { Option } = Select;

interface RolePlayProps {
    exercise: RoleplayExercise;
    onSubmit: (role: string, audioBlob?: Blob) => void;
    onProgress: (current: number, total: number) => void;
}

const RolePlay: React.FC<RolePlayProps> = ({
    exercise,
    onSubmit,
    onProgress
}) => {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        onProgress(1, 1);
    }, [onProgress]);

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
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            message.error('Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const playRecording = () => {
        if (audioBlob && audioRef.current) {
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current.src = audioUrl;
            audioRef.current.play();
            setIsPlaying(true);

            audioRef.current.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };
        }
    };

    const handleSubmit = () => {
        if (!selectedRole) {
            message.warning('Vui lòng chọn vai diễn');
            return;
        }

        if (!audioBlob) {
            message.warning('Vui lòng ghi âm câu trả lời');
            return;
        }

        setIsCompleted(true);
        onSubmit(selectedRole, audioBlob);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isCompleted) {
        return (
            <Card className="text-center py-8">
                <div className="space-y-4">
                    <CheckCircleOutlined className="text-6xl text-green-500" />
                    <Title level={3}>Hoàn thành đóng vai! 🎭</Title>
                    <div className="space-y-2">
                        <Text className="text-lg">Vai diễn: {selectedRole}</Text>
                        <Text className="text-lg">Thời gian ghi âm: {formatTime(recordingTime)}</Text>
                    </div>
                    <Button type="primary" size="large" onClick={() => onSubmit(selectedRole, audioBlob || undefined)}>
                        Tiếp tục
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card
            className="shadow-lg"
            title={
                <div className="flex justify-between items-center">
                    <Text strong className="text-lg">🎭 Bài tập đóng vai</Text>
                    <span className="text-blue-600">1/1</span>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Role Selection */}
                <div>
                    <Text strong className="text-base mb-3 block">
                        Chọn vai diễn của bạn:
                    </Text>

                    <Select
                        value={selectedRole}
                        onChange={setSelectedRole}
                        placeholder="Chọn vai diễn"
                        className="w-full mb-4"
                        size="large"
                    >
                        {exercise.roles.map((role, index) => (
                            <Option key={index} value={role}>
                                <div className="flex items-center">
                                    <Avatar
                                        icon={index === 0 ? <UserOutlined /> : <RobotOutlined />}
                                        className="mr-2"
                                        style={{
                                            backgroundColor: index === 0 ? '#1890ff' : '#52c41a'
                                        }}
                                    />
                                    {role}
                                </div>
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Text strong className="text-base mb-2 block">
                        Hướng dẫn:
                    </Text>
                    <Text className="text-sm">
                        {exercise.instruction_vi}
                    </Text>
                </div>

                {/* Recording Interface */}
                {selectedRole && (
                    <div className="space-y-4">
                        {/* Current Role Display */}
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Text className="text-lg font-medium">
                                Bạn đang đóng vai: <span className="text-green-600 font-bold">{selectedRole}</span>
                            </Text>
                        </div>

                        {/* Recording Controls */}
                        <div className="text-center">
                            {!isRecording ? (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<AudioOutlined />}
                                    onClick={startRecording}
                                    className="mb-4"
                                >
                                    Bắt đầu ghi âm
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-500 mb-2">
                                            🔴 Đang ghi âm...
                                        </div>
                                        <div className="text-lg">
                                            {formatTime(recordingTime)}
                                        </div>
                                    </div>

                                    <Button
                                        danger
                                        size="large"
                                        icon={<StopOutlined />}
                                        onClick={stopRecording}
                                    >
                                        Dừng ghi âm
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Playback Controls */}
                        {audioBlob && !isRecording && (
                            <div className="text-center space-y-3">
                                <Button
                                    icon={isPlaying ? <StopOutlined /> : <AudioOutlined />}
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

                        {/* Submit Button */}
                        {audioBlob && !isRecording && (
                            <div className="text-center">
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleSubmit}
                                    className="mt-4"
                                >
                                    Nộp bài
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Text type="secondary" className="text-xs">
                        Hướng dẫn: Chọn vai diễn, sau đó ghi âm câu trả lời của bạn. Hãy cố gắng thể hiện cảm xúc và ngữ điệu tự nhiên.
                    </Text>
                </div>
            </div>

            <audio ref={audioRef} />
        </Card>
    );
};

export default RolePlay;
