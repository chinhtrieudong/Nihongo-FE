import React, { useState } from "react";
import { Badge, Button, Typography, Avatar } from "antd";
import {
    BookOutlined,
    SoundOutlined,
    LeftOutlined,
    RightOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    StarOutlined,
    BulbOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface VocabularyTabProps {
    vocabulary: any[];
}

const VocabularyTab: React.FC<VocabularyTabProps> = ({ vocabulary }) => {
    const [currentCard, setCurrentCard] = useState(0);
    const [showMeaning, setShowMeaning] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    if (vocabulary.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex flex-col items-center">
                    <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                        <BookOutlined className="text-3xl text-secondary-400" />
                    </div>
                    <p className="text-secondary-700 dark:text-secondary-400 text-lg">
                        Chưa có từ vựng cho bài học này.
                    </p>
                </div>
            </div>
        );
    }

    const card = vocabulary[currentCard];

    const handleCardFlip = () => {
        setIsFlipped(!isFlipped);
        setShowMeaning(!showMeaning);
    };

    const handleNext = () => {
        setCurrentCard((prev) => (prev < vocabulary.length - 1 ? prev + 1 : 0));
        setIsFlipped(false);
        setShowMeaning(false);
    };

    const handlePrev = () => {
        setCurrentCard((prev) => (prev > 0 ? prev - 1 : vocabulary.length - 1));
        setIsFlipped(false);
        setShowMeaning(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl">📚</span>
                        Từ vựng
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-400 mt-1 text-sm sm:text-base">
                        Học {vocabulary.length} từ vựng quan trọng
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <Badge
                        count={`${currentCard + 1}/${vocabulary.length}`}
                        style={{ backgroundColor: '#1890ff' }}
                        className="text-xs sm:text-sm"
                    />
                    <Button
                        icon={<SoundOutlined />}
                        type="default"
                        size={"middle"}
                        className="flex items-center"
                    >
                        <span className="hidden sm:inline">Phát âm</span>
                        <span className="sm:hidden">🔊</span>
                    </Button>
                </div>
            </div>

            {/* Flashcard Container */}
            <div className="flex justify-center">
                <div className="relative w-full max-w-md sm:max-w-lg">
                    {/* Progress Dots */}
                    <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                        {vocabulary.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentCard(index);
                                    setIsFlipped(false);
                                    setShowMeaning(false);
                                }}
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${index === currentCard
                                    ? 'w-6 sm:w-8 bg-primary-600'
                                    : 'bg-gray-300 dark:bg-secondary-600 hover:bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Flashcard */}
                    <div
                        className="relative h-64 sm:h-80 cursor-pointer"
                        onClick={handleCardFlip}
                    >
                        <div
                            className={`absolute inset-0 w-full h-full transition-all duration-500 transform-gpu preserve-3d ${isFlipped ? 'rotate-y-180' : ''
                                }`}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front of card */}
                            <div className="absolute inset-0 w-full h-full backface-hidden">
                                <div className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-700 dark:to-primary-800 rounded-2xl shadow-2xl p-4 sm:p-8 h-full flex flex-col justify-center items-center text-white">
                                    <div className="text-3xl sm:text-5xl font-bold mb-2 sm:mb-4 text-center">
                                        {card.kanji}
                                    </div>
                                    <div className="text-lg sm:text-2xl mb-2 sm:mb-3 text-center opacity-90">
                                        {card.hiragana}
                                    </div>
                                    <div className="text-sm sm:text-lg opacity-80 text-center">
                                        {card.romaji}
                                    </div>
                                    <div className="mt-3 sm:mt-6 text-xs sm:text-sm opacity-70">
                                        Nhấn để xem nghĩa
                                    </div>
                                </div>
                            </div>

                            {/* Back of card */}
                            <div
                                className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden"
                                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                            >
                                <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 rounded-2xl shadow-2xl p-4 sm:p-8 h-full flex flex-col justify-center text-white">
                                    <div className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center">
                                        {card.meaningVi}
                                    </div>
                                    <div className="text-sm sm:text-lg mb-3 sm:mb-6 text-center opacity-90">
                                        {card.meaningEn}
                                    </div>
                                    {card.mnemonic && (
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4">
                                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                                <BulbOutlined className="text-yellow-300 text-sm sm:text-base" />
                                                <span className="text-xs sm:text-sm font-medium">Mẹo ghi nhớ:</span>
                                            </div>
                                            <p className="text-xs sm:text-sm opacity-90">{card.mnemonic}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-6 sm:mt-8 gap-2">
                        <Button
                            onClick={handlePrev}
                            icon={<LeftOutlined />}
                            size={"middle"}
                            className="flex items-center flex-1 sm:flex-none"
                        >
                            <span className="hidden sm:inline">Trước</span>
                            <span className="sm:hidden">←</span>
                        </Button>
                        <div className="flex gap-1 sm:gap-2">
                            <Button
                                onClick={handleCardFlip}
                                icon={isFlipped ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                type="default"
                                size={"middle"}
                            >
                                <span className="hidden sm:inline">{isFlipped ? 'Ẩn nghĩa' : 'Hiện nghĩa'}</span>
                                <span className="sm:hidden">{isFlipped ? '👁️' : '👁️‍🗨️'}</span>
                            </Button>
                            <Button
                                icon={<StarOutlined />}
                                type="default"
                                size={"middle"}
                            >
                                <span className="hidden sm:inline">Đánh dấu</span>
                                <span className="sm:hidden">⭐</span>
                            </Button>
                        </div>
                        <Button
                            onClick={handleNext}
                            icon={<RightOutlined />}
                            size={"middle"}
                            type="primary"
                            className="flex items-center flex-1 sm:flex-none"
                        >
                            <span className="hidden sm:inline">Tiếp</span>
                            <span className="sm:hidden">→</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Vocabulary List */}
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                    <BookOutlined />
                    Danh sách từ vựng
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {vocabulary.map((item, index) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                setCurrentCard(index);
                                setIsFlipped(false);
                                setShowMeaning(false);
                            }}
                            className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${index === currentCard
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg"
                                : "border-secondary-200 dark:border-secondary-700 hover:border-primary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="font-bold text-base sm:text-lg text-primary-600 dark:text-primary-400 truncate">
                                    {item.kanji}
                                </div>
                                <Badge count={index + 1} size="small" />
                            </div>
                            <div className="text-xs sm:text-sm text-secondary-700 dark:text-secondary-400 mb-1">
                                {item.hiragana}
                            </div>
                            <div className="text-xs text-secondary-500 dark:text-secondary-500 mb-2">
                                {item.romaji}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-secondary-900 dark:text-secondary-100">
                                {item.meaningVi}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VocabularyTab;
