import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Typography, Space, Slider, Switch, Tag } from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    StepForwardOutlined,
    StepBackwardOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { DialogueLine } from '../../services/conversationLessonAPI';

const { Text } = Typography;

interface ConversationPlayerProps {
    dialogue: DialogueLine[];
    onLineChange?: (lineId: number) => void;
    autoPlay?: boolean;
}

const ConversationPlayer: React.FC<ConversationPlayerProps> = ({
    dialogue,
    onLineChange,
    autoPlay = false
}) => {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [showRomaji, setShowRomaji] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [highlightedWord, setHighlightedWord] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentLine = dialogue[currentLineIndex];

    useEffect(() => {
        if (autoPlay && currentLine) {
            playCurrentLine();
        }
    }, [currentLineIndex, autoPlay]);

    const playCurrentLine = async () => {
        if (!currentLine?.audio_url) return;

        try {
            setIsPlaying(true);

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(currentLine.audio_url);
            audioRef.current = audio;
            audio.playbackRate = playbackSpeed;

            audio.onended = () => {
                setIsPlaying(false);
                if (autoPlay && currentLineIndex < dialogue.length - 1) {
                    setTimeout(() => {
                        handleNextLine();
                    }, 1000);
                }
            };

            await audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
        }
    };

    const handlePlayPause = () => {
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            playCurrentLine();
        }
    };

    const handleNextLine = () => {
        if (currentLineIndex < dialogue.length - 1) {
            const newIndex = currentLineIndex + 1;
            setCurrentLineIndex(newIndex);
            onLineChange?.(dialogue[newIndex].line_id);
        }
    };

    const handlePreviousLine = () => {
        if (currentLineIndex > 0) {
            const newIndex = currentLineIndex - 1;
            setCurrentLineIndex(newIndex);
            onLineChange?.(dialogue[newIndex].line_id);
        }
    };

    const handleRepeat = () => {
        playCurrentLine();
    };

    const handleWordClick = (word: string) => {
        setHighlightedWord(highlightedWord === word ? null : word);
    };

    const renderJapaneseText = (text: string) => {
        const words = text.split(/(\s+)/);
        return words.map((word, index) => (
            <span
                key={index}
                className={`cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800 px-1 rounded transition-colors ${highlightedWord === word ? 'bg-yellow-200 dark:bg-yellow-800' : ''
                    }`}
                onClick={() => handleWordClick(word)}
            >
                {word}
            </span>
        ));
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                handlePlayPause();
                break;
            case 'ArrowLeft':
                handlePreviousLine();
                break;
            case 'ArrowRight':
                handleNextLine();
                break;
            case 'r':
            case 'R':
                handleRepeat();
                break;
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentLineIndex, isPlaying]);

    if (!currentLine) {
        return (
            <Card className="text-center py-8">
                <Text type="secondary">Không có dữ liệu hội thoại</Text>
            </Card>
        );
    }

    return (
        <Card
            className="shadow-lg"
            title={
                <div className="flex justify-between items-center">
                    <Text strong className="text-lg">🎧 Nghe hội thoại</Text>
                    <Space>
                        <Tag color="blue">{currentLineIndex + 1}/{dialogue.length}</Tag>
                        <Tag color="green">{currentLine.speaker}</Tag>
                    </Space>
                </div>
            }
        >
            {/* Controls */}
            <div className="mb-6">
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <Button
                        icon={<StepBackwardOutlined />}
                        onClick={handlePreviousLine}
                        disabled={currentLineIndex === 0}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={handlePlayPause}
                    />
                    <Button
                        icon={<StepForwardOutlined />}
                        onClick={handleNextLine}
                        disabled={currentLineIndex === dialogue.length - 1}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRepeat}
                    />
                </div>

                {/* Speed Control */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                    <Text className="text-sm">Tốc độ:</Text>
                    <Slider
                        min={0.75}
                        max={1.25}
                        step={0.25}
                        value={playbackSpeed}
                        onChange={setPlaybackSpeed}
                        className="w-32"
                    />
                    <Text className="text-sm">{playbackSpeed}x</Text>
                </div>

                {/* Toggle Options */}
                <div className="flex justify-center space-x-6">
                    <Space>
                        <Text className="text-sm">Romaji:</Text>
                        <Switch
                            checked={showRomaji}
                            onChange={setShowRomaji}
                            size="small"
                        />
                    </Space>
                    <Space>
                        <Text className="text-sm">Dịch:</Text>
                        <Switch
                            checked={showTranslation}
                            onChange={setShowTranslation}
                            size="small"
                        />
                    </Space>
                </div>
            </div>

            {/* Dialogue Content */}
            <div className="space-y-4">
                {/* Speaker */}
                <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${currentLine.speaker === 'Mai' ? 'bg-pink-500' : 'bg-blue-500'
                        }`}>
                        {currentLine.speaker[0]}
                    </div>
                    <Text strong className="text-lg">{currentLine.speaker}</Text>
                </div>

                {/* Japanese Text */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Text className="text-xl leading-relaxed">
                        {renderJapaneseText(currentLine.text_jp)}
                    </Text>
                </div>

                {/* Romaji */}
                {showRomaji && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Text className="text-lg text-blue-700 dark:text-blue-300 italic">
                            {currentLine.romaji}
                        </Text>
                    </div>
                )}

                {/* Translation */}
                {showTranslation && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Text className="text-lg text-green-700 dark:text-green-300">
                            {currentLine.meaning_vi}
                        </Text>
                    </div>
                )}

                {/* Word Details (if highlighted) */}
                {highlightedWord && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <Text strong>Chi tiết từ: "{highlightedWord}"</Text>
                        <div className="mt-2 space-y-1">
                            <Text className="block text-sm">Kana: {highlightedWord}</Text>
                            <Text className="block text-sm">Hán Việt: (Đang cập nhật)</Text>
                            <Text className="block text-sm">Nghĩa: (Đang cập nhật)</Text>
                        </div>
                    </div>
                )}
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Text type="secondary" className="text-xs">
                    Phím tắt: Space = Play/Pause | ← → = Trước/Sau | R = Lặp lại
                </Text>
            </div>

            <audio ref={audioRef} />
        </Card>
    );
};

export default ConversationPlayer;
