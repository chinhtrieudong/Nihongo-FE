import React, { useState } from "react";
import { Badge, Button, Avatar, Switch } from "antd";
import {
    MessageCircle,
    Mic,
    Volume2,
    RefreshCw,
    Edit,
} from "lucide-react";

interface DialogTabProps {
    dialogs: any[];
}

const DialogTab: React.FC<DialogTabProps> = ({ dialogs }) => {
    const [showRomaji, setShowRomaji] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [currentDialog, setCurrentDialog] = useState(0);

    if (dialogs.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-500 dark:text-secondary-400" />
                    </div>
                    <p className="text-secondary-700 dark:text-secondary-400 text-lg">
                        Chưa có hội thoại cho bài học này.
                    </p>
                </div>
            </div>
        );
    }

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                        <span className="text-3xl">💬</span>
                        Hội thoại
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                        Luyện {dialogs.length} đoạn hội thoại thực tế
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge
                        count={dialogs.length}
                        style={{ backgroundColor: '#722ed1' }}
                        className="text-sm"
                    />
                    <Button
                        icon={<Mic className="w-4 h-4" />}
                        type="default"
                        size="large"
                        className="flex items-center"
                    >
                        Nghe toàn bộ
                    </Button>
                </div>
            </div>

            {/* Dialog Navigation */}
            {dialogs.length > 1 && (
                <div className="flex justify-center gap-2">
                    {dialogs.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentDialog(index)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${index === currentDialog
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700 border border-secondary-200 dark:border-secondary-700'
                                }`}
                        >
                            Hội thoại {index + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Display Controls */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={showRomaji}
                                onChange={setShowRomaji}
                                size="small"
                            />
                            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                Hiện Romaji
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={showTranslation}
                                onChange={setShowTranslation}
                                size="small"
                            />
                            <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                Hiện bản dịch
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="default"
                            size="small"
                            icon={<Volume2 className="w-4 h-4" />}
                        >
                            Tốc độ chậm
                        </Button>
                        <Button
                            type="default"
                            size="small"
                            icon={<RefreshCw className="w-4 h-4" />}
                        >
                            Lặp lại
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialog Content */}
            {dialogs.map((dialog, dialogIndex) => (
                <div
                    key={dialog.id}
                    className={`transition-all duration-500 ${dialogIndex === currentDialog ? 'block' : 'hidden'
                        }`}
                >
                    <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                        {/* Dialog Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {dialog.title}
                                    </h3>
                                    <p className="text-white/90">
                                        {dialog.scenario}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="default"
                                        size="large"
                                        icon={<Mic className="w-4 h-4" />}
                                        className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                                    >
                                        Nghe hội thoại
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Conversation Lines */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {dialog.lines.map((line: any, index: number) => {
                                    const isEven = index % 2 === 0;
                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-4 ${isEven ? 'flex-row' : 'flex-row-reverse'
                                                }`}
                                        >
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
                                            <div className={`flex-1 max-w-md ${isEven ? 'text-left' : 'text-right'
                                                }`}>
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
                                                <div className={`mt-2 ${isEven ? 'text-left' : 'text-right'
                                                    }`}>
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
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Practice Section */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-700 dark:to-teal-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Luyện tập hội thoại</h3>
                        <p className="text-white/80 text-sm">Thực hành nói và phản xạ với các tình huống tương tự</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        type="default"
                        size="large"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 h-auto py-4"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Volume2 className="w-6 h-6" />
                            <span>Luyện nghe</span>
                        </div>
                    </Button>
                    <Button
                        type="default"
                        size="large"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 h-auto py-4"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Mic className="w-6 h-6" />
                            <span>Luyện nói</span>
                        </div>
                    </Button>
                    <Button
                        type="default"
                        size="large"
                        className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 h-auto py-4"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Edit className="w-6 h-6" />
                            <span>Vai diễn</span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DialogTab;
