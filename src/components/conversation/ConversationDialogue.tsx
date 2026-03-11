import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Typography, Space, Slider, Switch, Tag, Avatar, message } from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    ReloadOutlined,
    EyeOutlined,
    EyeInvisibleOutlined
} from '@ant-design/icons';
import { DialogueLine } from '../../services/conversationLessonAPI';
import { getNanamiNaturalVoice } from '../../utils/vocabularyUtils';

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
    const [showTranslation, setShowTranslation] = useState(false);
    const [showRomaji, setShowRomaji] = useState(false);
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const [japaneseVoices, setJapaneseVoices] = useState<SpeechSynthesisVoice[]>([]);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isStartingAllRef = useRef(false);
    const playingIndexRef = useRef<number | null>(null);
    const isPlayingAllRef = useRef(false);
    const playbackTokenRef = useRef(0);

    const [nextLineToPlay, setNextLineToPlay] = useState<number | null>(null);

    const currentLine = dialogue[currentLineIndex];
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
        isPlayingAllRef.current = isPlayingAll;
    }, [isPlayingAll]);

    // Handle progression to next line
    useEffect(() => {
        if (nextLineToPlay !== null) {
            playLineAtIndex(nextLineToPlay);
            setNextLineToPlay(null);
        }
    }, [nextLineToPlay]);

    useEffect(() => {
        if (!('speechSynthesis' in window)) return;

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const japanese = voices.filter(voice =>
                voice.lang?.startsWith('ja') || voice.name.includes('Japanese')
            );
            const naturalJapanese = japanese.filter(voice =>
                /natural/i.test(voice.name)
            );
            setJapaneseVoices(naturalJapanese.length > 0 ? naturalJapanese : japanese);
        };

        loadVoices();
        const handler = () => loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', handler);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handler);
        };
    }, []);



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

    const playLineAtIndex = async (lineIndex: number) => {
        const line = dialogue[lineIndex];
        if (!line) return;

        console.log(`🎵 Starting playback for line ${lineIndex}:`, line.text_jp);

        try {
            // Invalidate any previous callbacks from older playback sessions.
            const token = ++playbackTokenRef.current;

            setIsPlaying(true);
            playingIndexRef.current = lineIndex;

            // Stop any current audio only
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }

            // Always cancel ongoing TTS before starting a new line to avoid overlap.
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            // Try to use provided audio URL first
            if (line.audio_url) {
                try {
                    const audio = new Audio(line.audio_url);
                    audio.playbackRate = playbackSpeed;
                    audioRef.current = audio;

                    audio.onended = () => {
                        if (token !== playbackTokenRef.current) return;
                        const currentPlayingIndex = playingIndexRef.current;
                        console.log(`🎵 Audio ended for line ${currentPlayingIndex}`);
                        setIsPlaying(false);
                        playingIndexRef.current = null;

                        const wasPlayingAll = isPlayingAllRef.current;

                        // Auto advance to next line (only in "play all" mode)
                        if (
                            wasPlayingAll &&
                            currentPlayingIndex !== null &&
                            currentPlayingIndex < dialogue.length - 1
                        ) {
                            const nextIndex = currentPlayingIndex + 1;
                            console.log(`🎵 Advancing to line ${nextIndex} after 100ms delay`);
                            setTimeout(() => {
                                if (token !== playbackTokenRef.current) return;
                                console.log(`🎵 Setting current line index to ${nextIndex} and starting playback`);
                                setCurrentLineIndex(nextIndex);
                                playLineAtIndex(nextIndex);
                            }, 100);
                            return;
                        }

                        // Completed (only mark step complete when finishing "play all")
                        if (wasPlayingAll) {
                            console.log(`🎵 Completed play-all (total: ${dialogue.length})`);
                            setIsPlayingAll(false);
                            if (onStepComplete) {
                                onStepComplete();
                            }
                        } else {
                            console.log(`🎵 Completed single-line playback`);
                        }
                    };

                    audio.onerror = () => {
                        if (token !== playbackTokenRef.current) return;
                        setIsPlaying(false);
                        playingIndexRef.current = null;
                        // Fallback to TTS
                        try {
                            playTTSDirectly(line.text_jp, playbackSpeed, line.speaker, lineIndex, token);
                        } catch (ttsError) {
                            // TTS errors are already handled in playTTSDirectly
                        }
                    };

                    await audio.play();
                } catch (audioError) {
                    // Fallback to TTS
                    try {
                        await playTTSDirectly(line.text_jp, playbackSpeed, line.speaker, lineIndex, token);
                    } catch (ttsError) {
                        // TTS errors are already handled in playTTSDirectly
                    }
                }
            } else {
                // Use Text-to-Speech directly
                console.log(`🎵 Using TTS for line ${lineIndex}:`, line.text_jp);
                try {
                    await playTTSDirectly(line.text_jp, playbackSpeed, line.speaker, lineIndex, token);
                } catch (ttsError) {
                    // TTS errors are already handled in playTTSDirectly
                }
            }
        } catch (error) {
            console.error('Error in playCurrentLine:', error);
            setIsPlaying(false);
            playingIndexRef.current = null;
            message.error('Không thể phát âm thanh. Vui lòng thử lại.');
        }
    };

    const playCurrentLine = async () => {
        return playLineAtIndex(currentLineIndex);
    };

    const playTTSDirectly = async (
        text: string,
        speed: number,
        speaker?: string,
        lineIndex?: number,
        playToken?: number
    ): Promise<void> => {
        const token = playToken ?? playbackTokenRef.current;
        return new Promise((resolve, reject) => {
            // Check if browser supports speech synthesis
            if (!('speechSynthesis' in window)) {
                reject(new Error('Browser không hỗ trợ Text-to-Speech'));
                return;
            }

            // Load voices if not loaded yet
            let voices = window.speechSynthesis.getVoices();
            const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
                return new Promise((resolve) => {
                    const handler = () => {
                        window.speechSynthesis.removeEventListener('voiceschanged', handler);
                        resolve(window.speechSynthesis.getVoices());
                    };
                    window.speechSynthesis.addEventListener('voiceschanged', handler);
                });
            };

            const speakWithVoice = (availableVoices: SpeechSynthesisVoice[]) => {
                const utterance = new SpeechSynthesisUtterance(text);
                const preferredVoices = japaneseVoices.length > 0 ? japaneseVoices : availableVoices;

                // Configure for Japanese
                utterance.lang = 'ja-JP';
                utterance.rate = speed * 0.9; // Slightly slower for Japanese
                utterance.pitch = 1.0;
                utterance.volume = 1.0;

                const lowerSpeaker = (speaker || '').toLowerCase();
                const femaleKeywords = ['nanami online (natural)', 'nanami', 'haruka', 'sayaka', 'ayumi', 'female'];
                const maleKeywords = ['keita online (natural)', 'keita', 'ichiro', 'male'];

                const byName = (keys: string[]) =>
                    preferredVoices.find(voice =>
                        keys.some(k => voice.name.toLowerCase().includes(k))
                    );

                // Ưu tiên Microsoft Nanami Online (Natural) cho giọng nữ
                const microsoftNanami = getNanamiNaturalVoice();
                const femaleVoice = microsoftNanami;

                // CHỈ sử dụng Microsoft Nanami Online (Natural) cho tất cả speakers
                const maleVoice = microsoftNanami; // Dùng Nanami cho cả nam và nữ

                const japaneseVoice = microsoftNanami; // Chỉ dùng Nanami

                if (lowerSpeaker === 'mai') {
                    utterance.voice = femaleVoice || japaneseVoice || null;
                } else if (lowerSpeaker === 'john') {
                    utterance.voice = maleVoice || japaneseVoice || null;
                } else {
                    utterance.voice = femaleVoice || maleVoice || japaneseVoice || null;
                }

                // 🔥 FIX CỐT LÕI: Set playingIndexRef before speaking
                if (typeof lineIndex === 'number') {
                    playingIndexRef.current = lineIndex;
                }
                setIsPlaying(true);

                utterance.onend = () => {
                    if (token !== playbackTokenRef.current) {
                        resolve();
                        return;
                    }
                    const currentPlayingIndex = playingIndexRef.current;
                    console.log(`🎵 TTS ended for line ${currentPlayingIndex}`);
                    setIsPlaying(false);
                    playingIndexRef.current = null;

                    const wasPlayingAll = isPlayingAllRef.current;

                    // Auto advance to next line (only in "play all" mode)
                    if (
                        wasPlayingAll &&
                        currentPlayingIndex !== null &&
                        currentPlayingIndex < dialogue.length - 1
                    ) {
                        const nextIndex = currentPlayingIndex + 1;
                        console.log(`🎵 TTS advancing to line ${nextIndex} after 100ms delay`);
                        setTimeout(() => {
                            if (token !== playbackTokenRef.current) return;
                            console.log(`🎵 TTS setting current line index to ${nextIndex} and starting playback`);
                            setCurrentLineIndex(nextIndex);
                            playLineAtIndex(nextIndex);
                        }, 100);
                        resolve();
                        return;
                    }

                    // Completed (only mark step complete when finishing "play all")
                    if (wasPlayingAll) {
                        console.log(`🎵 TTS completed play-all (total: ${dialogue.length})`);
                        setIsPlayingAll(false);
                        if (onStepComplete) {
                            onStepComplete();
                        }
                    } else {
                        console.log(`🎵 TTS completed single-line playback`);
                    }
                    resolve();
                };

                utterance.onerror = (event) => {
                    if (token !== playbackTokenRef.current) {
                        resolve();
                        return;
                    }
                    // Handle 'interrupted' gracefully - it's expected when user cancels
                    if (event.error === 'interrupted') {
                        console.log('TTS interrupted by user');
                        setIsPlaying(false);
                        playingIndexRef.current = null;
                        resolve();
                        return;
                    } else {
                        setIsPlaying(false);
                        playingIndexRef.current = null;
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
                waitForVoices().then((loaded) => {
                    voices = loaded;
                    speakWithVoice(voices);
                });
            } else {
                speakWithVoice(voices);
            }
        });
    };

    const togglePlayPause = () => {
        if (isPlaying || isPlayingAll) {
            // Invalidate any pending callbacks.
            playbackTokenRef.current += 1;
            // Cancel any ongoing TTS
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            // Stop any audio playback
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            // Reset all playing states
            setIsPlaying(false);
            setIsPlayingAll(false);
            isPlayingAllRef.current = false;
            playingIndexRef.current = null;
            isStartingAllRef.current = false;
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
        // Invalidate any pending callbacks.
        playbackTokenRef.current += 1;
        // Cancel any ongoing TTS first
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        setCurrentLineIndex(0);
        setIsPlaying(false);
        setIsPlayingAll(false);
        isPlayingAllRef.current = false;
        playingIndexRef.current = null;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
    };

    const playAllFromStart = () => {
        console.log(`🎵 Starting play all from beginning, total dialogues: ${dialogue.length}`);
        // Invalidate any pending callbacks.
        playbackTokenRef.current += 1;
        // Stop any current playback first
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        // Reset states
        setIsPlaying(false);
        setIsPlayingAll(true);
        isPlayingAllRef.current = true;
        playingIndexRef.current = null;
        isStartingAllRef.current = true;

        // Start from first line
        setCurrentLineIndex(0);
        playLineAtIndex(0).finally(() => {
            isStartingAllRef.current = false;
        });
    };

    const handleLineClick = (index: number) => {
        // If user manually navigates to a line while auto-playing, stop auto-play mode.
        if (isPlayingAllRef.current) {
            setIsPlayingAll(false);
            isPlayingAllRef.current = false;
        }

        // Clicking the current active line while playing acts as a stop.
        if (index === currentLineIndex && (isPlaying || isPlayingAll)) {
            togglePlayPause();
            return;
        }

        setCurrentLineIndex(index);
        if (onLineChange) {
            onLineChange(index);
        }
        playLineAtIndex(index);
    };


    const getSpeakerAvatar = (speaker: string) => {
        const label = speaker?.trim() || '?';
        const colorClass = label.toLowerCase() === 'mai' ? 'bg-pink-500' : 'bg-blue-500';
        return (
            <Avatar className={colorClass}>
                {label.charAt(0).toUpperCase()}
            </Avatar>
        );
    };

    const getSpeakerName = (speaker: string) => {
        return speaker?.trim() || 'Nhân vật';
    };

    return (
        <div className="space-y-6">
            {/* Full Dialogue Display */}
            <Card className="shadow-sm">
                <div ref={containerRef} className="space-y-3 max-h-[520px] overflow-y-auto p-2">
                    {dialogue.map((line, index) => (
                        (() => {
                            const isMai = (line.speaker || '').toLowerCase() === 'mai';
                            const isActive = index === currentLineIndex;
                            return (
                                <div
                                    key={line.line_id}
                                    className={`dialogue-line flex ${isMai ? 'justify-start' : 'justify-end'} cursor-pointer`}
                                    onClick={() => handleLineClick(index)}
                                >
                                    <div className={`flex items-end gap-3 max-w-[78%] ${isMai ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className="flex-shrink-0">
                                            {getSpeakerAvatar(line.speaker)}
                                        </div>
                                        <div
                                            className={[
                                                'relative rounded-2xl px-4 py-3 border transition-all',
                                                isMai
                                                    ? 'bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-800'
                                                    : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
                                                isActive ? 'ring-2 ring-blue-400/50 dark:ring-blue-500/40' : '',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-center justify-between gap-3 mb-1">
                                                <Text strong className="text-xs text-secondary-600 dark:text-secondary-300">
                                                    {getSpeakerName(line.speaker)}
                                                </Text>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Text className="text-base block">
                                                    {line.text_jp}
                                                </Text>

                                                {showRomaji && line.romaji && (
                                                    <Text className="text-xs text-slate-500 dark:text-slate-400 block">
                                                        {line.romaji}
                                                    </Text>
                                                )}

                                                {showTranslation && line.meaning_vi && (
                                                    <Text className="text-xs text-slate-600 dark:text-slate-400 block">
                                                        {line.meaning_vi}
                                                    </Text>
                                                )}
                                            </div>

                                            {!line.audio_url && (
                                                <Tag color="orange" className="mt-2">
                                                    🗣️ TTS
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    ))}
                </div>
            </Card>

            {/* Playback Controls */}
            <Card className="shadow-sm">
                <div className="flex flex-col gap-4 overflow-x-hidden">
                    {/* Main Controls */}
                    <div className="flex items-center gap-3 flex-wrap rounded-xl border border-secondary-200/70 dark:border-secondary-800 bg-white/70 dark:bg-secondary-925/70 px-4 py-3">
                        <Button
                            type="primary"
                            size="large"
                            icon={(isPlayingAll || isPlaying) ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={(isPlayingAll || isPlaying) ? togglePlayPause : playAllFromStart}
                            loading={isPlayingAll}
                        >
                            {(isPlayingAll || isPlaying) ? 'Dừng' : 'Phát'}
                        </Button>

                        <Button
                            type="default"
                            size="large"
                            icon={<PauseCircleOutlined />}
                            onClick={togglePlayPause}
                            disabled={!(isPlayingAll || isPlaying)}
                        >
                            Dừng
                        </Button>

                        <Button
                            icon={<ReloadOutlined />}
                            onClick={restart}
                        >
                            Phát lại
                        </Button>
                    </div>

                    {/* Speed (left) + Toggles (right) */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 items-stretch">
                        <div className="rounded-xl border border-secondary-200/70 dark:border-secondary-800 bg-white/70 dark:bg-secondary-925/70 px-4 py-3">
                            <Text className="text-xs uppercase tracking-wide text-secondary-500 dark:text-secondary-400 block">
                                Tốc độ phát
                            </Text>
                            <div className="mt-1 flex items-center justify-between">
                                <Text className="text-sm font-semibold text-secondary-800 dark:text-secondary-100">
                                    {playbackSpeed}x
                                </Text>
                                <Text className="text-xs text-secondary-500 dark:text-secondary-400">
                                    0.5x – 2.0x
                                </Text>
                            </div>
                            <div className="mt-2">
                                <Slider
                                    min={0.5}
                                    max={2.0}
                                    step={0.1}
                                    value={playbackSpeed}
                                    onChange={setPlaybackSpeed}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-secondary-200/70 dark:border-secondary-800 bg-white/70 dark:bg-secondary-925/70 px-4 py-3">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <Text className="text-sm text-secondary-800 dark:text-secondary-100">
                                        Hiển thị Romaji
                                    </Text>
                                    <Switch
                                        checked={showRomaji}
                                        onChange={setShowRomaji}
                                        checkedChildren={<EyeOutlined />}
                                        unCheckedChildren={<EyeInvisibleOutlined />}
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Text className="text-sm text-secondary-800 dark:text-secondary-100">
                                        Hiển thị bản dịch
                                    </Text>
                                    <Switch
                                        checked={showTranslation}
                                        onChange={setShowTranslation}
                                        checkedChildren={<EyeOutlined />}
                                        unCheckedChildren={<EyeInvisibleOutlined />}
                                    />
                                </div>
                            </div>
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
