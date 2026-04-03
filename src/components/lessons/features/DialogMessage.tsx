import React from "react";
import { Avatar, Button } from "antd";
import { Volume2 } from "lucide-react";

interface DialogMessageProps {
    line: {
        speaker: string;
        japanese: string;
        romaji: string;
        vietnamese: string;
    };
    isEven: boolean;
    showRomaji: boolean;
    showTranslation: boolean;
}

const DialogMessage: React.FC<DialogMessageProps> = ({
    line,
    isEven,
    showRomaji,
    showTranslation,
}) => {
    const getSpeakerAvatar = (speaker: string) => {
        const speakerColors: Record<string, string> = {
            'Tanaka': 'bg-blue-500',
            'Yamada': 'bg-green-500',
            'Sato': 'bg-purple-500',
            'Suzuki': 'bg-orange-500',
            'Teacher': 'bg-red-500',
            'Student': 'bg-indigo-500'
        };
        return speakerColors[speaker] || 'bg-gray-500';
    };

    const getSpeakerInitial = (speaker: string) => {
        return speaker.charAt(0).toUpperCase();
    };

    return (
        <div className={`flex items-start gap-4 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
            {/* Speaker Avatar */}
            <div className="flex flex-col items-center flex-shrink-0">
                <Avatar
                    size={48}
                    className={`${getSpeakerAvatar(line.speaker)} text-white font-bold border-2 border-white shadow-lg`}
                >
                    {getSpeakerInitial(line.speaker)}
                </Avatar>
                <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400 mt-2">
                    {line.speaker}
                </span>
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 max-w-md ${isEven ? 'text-left' : 'text-right'}`}>
                <div className={`inline-block p-4 rounded-2xl ${isEven
                    ? 'bg-secondary-100 dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 rounded-tl-none'
                    : 'bg-primary-500 text-white rounded-tr-none'
                    }`}>
                    <div className="font-medium text-lg mb-2">
                        {line.japanese}
                    </div>

                    {showRomaji && (
                        <div className={`text-sm mb-2 ${isEven
                            ? 'text-secondary-600 dark:text-secondary-400 italic'
                            : 'text-white/80 italic'
                            }`}>
                            {line.romaji}
                        </div>
                    )}

                    {showTranslation && (
                        <div className={`text-sm ${isEven
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-green-200'
                            }`}>
                            {line.vietnamese}
                        </div>
                    )}
                </div>

                {/* Audio Button */}
                <div className={`mt-2 ${isEven ? 'text-left' : 'text-right'}`}>
                    <Button
                        type="text"
                        size="small"
                        icon={<Volume2 className="w-4 h-4" />}
                        className="text-secondary-500 hover:text-primary-600"
                    >
                        Nghe
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DialogMessage;
