import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, Button, Typography, Space, Slider, Switch, Tag, Progress, Avatar, Tooltip, message } from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    StepForwardOutlined,
    StepBackwardOutlined,
    ReloadOutlined,
    SoundOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    UserOutlined,
    RobotOutlined
} from '@ant-design/icons';
import { DialogueLine } from '../../services/conversationLessonAPI';

const { Text, Title } = Typography;

interface ConversationDialogueProps {
    dialogue: DialogueLine[];
    onLineChange?: (lineId: number) => void;
    onProgress?: (current: number, total: number) => void;
    onStepComplete?: () => void;
    autoPlay?: boolean;
    showStepNavigation?: boolean;
}

const ConversationDialogue: React.FC<ConversationDialogueProps> = ({
    dialogue,
    onLineChange,
    onProgress,
    onStepComplete,
    autoPlay = false,
    showStepNavigation = true
}) => {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [showTranslation, setShowTranslation] = useState(true);
    const [showRomaji, setShowRomaji] = useState(true);
    const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());
    const [isPlayingAll, setIsPlayingAll] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentLine = dialogue[currentLineIndex];
    const completedCount = useMemo(() => completedLines.size, [completedLines]);
    const progressPercentage = useMemo(() => dialogue.length > 0 ? (completedCount / dialogue.length) * 100 : 0, [completedCount, dialogue.length]);

    // Call onProgress only when currentLineIndex changes
    useEffect(() => {
        if (onProgress) {
            onProgress(currentLineIndex + 1, dialogue.length);
        }
    }, [currentLineIndex, dialogue.length, onProgress]); // Add dialogue.length to dependency array

    // Auto-scroll to current line when playing
    useEffect(() => {
        if (isPlaying || isPlayingAll) {
            scrollToCurrentLine();
        }
    }, [currentLineIndex]);

    useEffect(() => {
        if (isPlayingAll && !isPlaying && currentLine) {
            playCurrentLine();
        }
    }, [currentLineIndex]);


    const scrollToCurrentLine = () => {
        if (containerRef.current) {
            const lineElements = containerRef.current.querySelectorAll('.dialogue-line');
            const currentElement = lineElements[currentLineIndex] as HTMLElement;

            if (currentElement) {
                currentElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };

    const playCurrentLine = async () => {
        if (!currentLine) return;

        try {
            setIsPlaying(true);

            // Stop any current audio only
            if (audioRef.current) {
                audioRef.current.pause();
            }

            console.log('Playing line:', currentLine);
            console.log('Has audio_url:', !!currentLine.audio_url);

            // Try to use provided audio URL first
            if (currentLine.audio_url) {
                console.log('Attempting to play audio URL:', currentLine.audio_url);
                try {
                    const audio = new Audio(currentLine.audio_url);
                    audio.playbackRate = playbackSpeed;
                    audioRef.current = audio;

                    audio.onended = () => {
                        console.log('Audio ended');
                        setIsPlaying(false);
                        markLineAsCompleted(currentLineIndex);

                        // Auto advance to next line
                        if (currentLineIndex < dialogue.length - 1) {
                            setTimeout(() => {
                                setCurrentLineIndex(prev => prev + 1);
                            }, 500);
                        } else {
                            // All lines completed
                            setIsPlayingAll(false);
                            if (onStepComplete) {
                                onStepComplete();
                            }
                        }
                    };

                    audio.onerror = (error) => {
                        console.log('Audio error, falling back to TTS:', error);
                        setIsPlaying(false);
                        // Fallback to TTS
                        try {
                            playTTSDirectly(currentLine.text_jp, playbackSpeed);
                        } catch (ttsError) {
                            console.log('TTS fallback failed:', ttsError);
                            // TTS errors are already handled in playTTSDirectly
                        }
                    };

                    await audio.play();
                } catch (audioError) {
                    console.log('Audio play failed, using TTS:', audioError);
                    // Fallback to TTS
                    try {
                        await playTTSDirectly(currentLine.text_jp, playbackSpeed);
                    } catch (ttsError) {
                        console.log('TTS fallback failed:', ttsError);
                        // TTS errors are already handled in playTTSDirectly
                    }
                }
            } else {
                // Use Text-to-Speech directly
                console.log('Using TTS directly for:', currentLine.text_jp);
                try {
                    await playTTSDirectly(currentLine.text_jp, playbackSpeed);
                } catch (ttsError) {
                    console.log('TTS failed:', ttsError);
                    // TTS errors are already handled in playTTSDirectly
                }
            }
        } catch (error) {
            console.error('Error in playCurrentLine:', error);
            setIsPlaying(false);
            message.error('Không thể phát âm thanh. Vui lòng thử lại.');
        }
    };

    const playTTSDirectly = async (text: string, speed: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Check if browser supports speech synthesis
            if (!('speechSynthesis' in window)) {
                reject(new Error('Browser không hỗ trợ Text-to-Speech'));
                return;
            }

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Load voices if not loaded yet
            let voices = window.speechSynthesis.getVoices();

            const speakWithVoice = (availableVoices: SpeechSynthesisVoice[]) => {
                const utterance = new SpeechSynthesisUtterance(text);

                // Configure for Japanese
                utterance.lang = 'ja-JP';
                utterance.rate = speed * 0.9; // Slightly slower for Japanese
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                // Try to get Japanese voice
                const japaneseVoice = availableVoices.find(voice =>
                    voice.lang.startsWith('ja') || voice.name.includes('Japanese')
                );

                if (japaneseVoice) {
                    utterance.voice = japaneseVoice;
                }

                utterance.onend = () => {
                    setIsPlaying(false);
                    markLineAsCompleted(currentLineIndex);

                    // Auto advance to next line
                    if (currentLineIndex < dialogue.length - 1) {
                        setTimeout(() => {
                            setCurrentLineIndex(prev => prev + 1);
                        }, 500);
                    } else {
                        // All lines completed
                        setIsPlayingAll(false);
                        if (onStepComplete) {
                            onStepComplete();
                        }
                    }
                    resolve();
                };

                utterance.onerror = (event) => {
                    // Handle 'interrupted' gracefully - it's expected when user cancels
                    if (event.error === 'interrupted') {
                        console.log('TTS interrupted by user, ignore');
                        return; // KHÔNG setIsPlaying(false)
                    } else {
                        setIsPlaying(false);
                        console.error('TTS error:', event.error);
                        message.error('Không thể phát âm thanh. Vui lòng thử lại.');
                        reject(new Error('TTS error: ' + event.error));
                    }
                };

                // Start speaking
                window.speechSynthesis.speak(utterance);
            };

            if (voices.length === 0) {
                // Wait for voices to be loaded
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices();
                    speakWithVoice(voices);
                };
            } else {
                speakWithVoice(voices);
            }
        });
    };

    const markLineAsCompleted = (lineIndex: number) => {
        setCompletedLines(prev => new Set(Array.from(prev).concat(lineIndex)));
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            // Cancel any ongoing TTS
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
            setIsPlayingAll(false);
        } else {
            playCurrentLine();
        }
    };

    const goToPreviousLine = () => {
        if (currentLineIndex > 0) {
            setCurrentLineIndex(prev => prev - 1);
            if (onLineChange) {
                onLineChange(currentLineIndex - 1);
            }
        }
    };

    const goToNextLine = () => {
        if (currentLineIndex < dialogue.length - 1) {
            setCurrentLineIndex(prev => prev + 1);
            if (onLineChange) {
                onLineChange(currentLineIndex + 1);
            }
        }
    };

    const restart = () => {
        // Cancel any ongoing TTS first
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        setCurrentLineIndex(0);
        setCompletedLines(new Set());
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const playAllFromStart = () => {
        restart();
        setIsPlayingAll(true);
        setTimeout(() => playCurrentLine(), 100);
    };

    const handleLineClick = (index: number) => {
        setCurrentLineIndex(index);
        if (onLineChange) {
            onLineChange(index);
        }
    };

    const getSpeakerAvatar = (speaker: string) => {
        return speaker === 'user' ?
            <Avatar icon={<UserOutlined />} className="bg-blue-500" /> :
            <Avatar icon={<RobotOutlined />} className="bg-green-500" />;
    };

    const getSpeakerName = (speaker: string) => {
        return speaker === 'user' ? 'Bạn' : 'Người Nhật';
    };

    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <Card className="shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <Title level={4} className="!mb-0">📝 Đoạn hội thoại</Title>
                    <div className="flex items-center gap-4">
                        <Text type="secondary">
                            Tiến độ: {completedCount}/{dialogue.length}
                        </Text>
                        <Tag color={progressPercentage === 100 ? 'green' : 'blue'}>
                            {Math.round(progressPercentage)}%
                        </Tag>
                    </div>
                </div>
                <Progress
                    percent={progressPercentage}
                    strokeColor={progressPercentage === 100 ? '#52c41a' : '#1890ff'}
                    showInfo={false}
                />
            </Card>

            {/* Full Dialogue Display */}
            <Card className="shadow-sm">
                <div ref={containerRef} className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {dialogue.map((line, index) => (
                        <div
                            key={line.line_id}
                            className={`dialogue-line p-4 rounded-lg border transition-all cursor-pointer ${index === currentLineIndex
                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                : completedLines.has(index)
                                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => handleLineClick(index)}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    {getSpeakerAvatar(line.speaker)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Text strong className="text-sm">
                                            {getSpeakerName(line.speaker)}
                                        </Text>
                                        {index === currentLineIndex && (
                                            <Tag color="blue">Đang phát</Tag>
                                        )}
                                        {completedLines.has(index) && (
                                            <Tag color="green">✓ Hoàn thành</Tag>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Text className="text-lg block">
                                            {line.text_jp}
                                        </Text>

                                        {showRomaji && line.romaji && (
                                            <Text type="secondary" className="text-sm block">
                                                {line.romaji}
                                            </Text>
                                        )}

                                        {showTranslation && line.meaning_vi && (
                                            <Text className="text-sm text-gray-600 dark:text-gray-400 block">
                                                {line.meaning_vi}
                                            </Text>
                                        )}
                                    </div>

                                    {/* Audio Controls for each line */}
                                    <div className="mt-2 flex items-center gap-2">
                                        <Button
                                            size="small"
                                            type={index === currentLineIndex ? 'primary' : 'default'}
                                            icon={<SoundOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLineClick(index);
                                                setTimeout(() => playCurrentLine(), 100);
                                            }}
                                        >
                                            {index === currentLineIndex && isPlaying ? 'Đang phát...' : 'Nghe'}
                                        </Button>
                                        {!line.audio_url && (
                                            <Tag color="orange">
                                                🗣️ TTS
                                            </Tag>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Playback Controls */}
            <Card className="shadow-sm">
                <div className="space-y-4">
                    {/* Main Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            icon={<StepBackwardOutlined />}
                            onClick={goToPreviousLine}
                            disabled={currentLineIndex === 0}
                        >
                            Câu trước
                        </Button>

                        <Button
                            type="primary"
                            size="large"
                            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? 'Tạm dừng' : 'Phát'}
                        </Button>

                        <Button
                            icon={<StepForwardOutlined />}
                            onClick={goToNextLine}
                            disabled={currentLineIndex === dialogue.length - 1}
                        >
                            Câu tiếp
                        </Button>

                        <Button
                            icon={<ReloadOutlined />}
                            onClick={restart}
                        >
                            Làm lại
                        </Button>

                        <Button
                            type="default"
                            icon={<PlayCircleOutlined />}
                            onClick={playAllFromStart}
                        >
                            Phát tất cả
                        </Button>
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Text className="text-sm mb-2 block">Tốc độ phát: {playbackSpeed}x</Text>
                            <Slider
                                min={0.5}
                                max={2.0}
                                step={0.1}
                                value={playbackSpeed}
                                onChange={setPlaybackSpeed}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Space>
                                <Switch
                                    checked={showRomaji}
                                    onChange={setShowRomaji}
                                    checkedChildren={<EyeOutlined />}
                                    unCheckedChildren={<EyeInvisibleOutlined />}
                                />
                                <Text>Hiển thị Romaji</Text>
                            </Space>
                        </div>

                        <div className="flex items-center gap-4">
                            <Space>
                                <Switch
                                    checked={showTranslation}
                                    onChange={setShowTranslation}
                                    checkedChildren={<EyeOutlined />}
                                    unCheckedChildren={<EyeInvisibleOutlined />}
                                />
                                <Text>Hiển thị bản dịch</Text>
                            </Space>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Hidden audio element */}
            <audio ref={audioRef} />
        </div>
    );
};

export default ConversationDialogue;
