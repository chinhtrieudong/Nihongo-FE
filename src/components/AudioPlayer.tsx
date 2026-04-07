import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
    src: string;
    title?: string;
    className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, className = "" }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const time = parseFloat(e.target.value);
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div 
            className={`bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4 shadow-lg ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Title */}
            {title && (
                <div className="text-white/90 text-sm font-medium mb-3 flex items-center gap-2 justify-start w-full">
                    <span className="text-lg">🎧</span>
                    <span className="truncate">{title}</span>
                </div>
            )}
            
            <div className="flex items-center gap-4">
                {/* Large Play Button */}
                <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-105 hover:shadow-xl transition-all duration-200 flex-shrink-0"
                >
                    {isPlaying ? (
                        <Pause className="w-7 h-7" />
                    ) : (
                        <Play className="w-7 h-7 ml-1" />
                    )}
                </button>

                {/* Progress Section */}
                <div className="flex-1 min-w-0">
                    {/* Time display */}
                    <div className="flex items-center justify-between text-white/80 text-sm mb-2">
                        <span className="font-mono">{formatTime(currentTime)}</span>
                        <span className="font-mono">{formatTime(duration)}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-2 bg-white/30 rounded-full overflow-hidden">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div 
                            className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-100"
                            style={{ width: `${progressPercent}%` }}
                        />
                        {/* Progress dot */}
                        <div 
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-100 ${isHovered ? 'scale-100' : 'scale-0'}`}
                            style={{ left: `calc(${progressPercent}% - 8px)` }}
                        />
                    </div>
                </div>

                {/* Volume */}
                <button
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            <audio ref={audioRef} src={src} preload="metadata" />
        </div>
    );
};

export default AudioPlayer;
