import React, { useState } from "react";
import { Button } from "antd";
import {
    LeftOutlined,
    RightOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    StarOutlined,
    BulbOutlined,
} from "@ant-design/icons";

interface FlashCardProps {
    card: {
        id: string;
        kanji: string;
        hiragana: string;
        romaji: string;
        meaningVi: string;
        meaningEn: string;
        mnemonic?: string;
    };
    currentIndex: number;
    totalCards: number;
    onNext: () => void;
    onPrev: () => void;
    onSelectCard: (index: number) => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
    card,
    currentIndex,
    totalCards,
    onNext,
    onPrev,
    onSelectCard,
}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleCardFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        onNext();
        setIsFlipped(false);
    };

    const handlePrev = () => {
        onPrev();
        setIsFlipped(false);
    };

    return (
        <div className="relative w-full max-w-md">
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: totalCards }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectCard(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'w-8 bg-primary-600'
                            : 'bg-gray-300 dark:bg-secondary-600 hover:bg-gray-400'
                            }`}
                    />
                ))}
            </div>

            {/* Flashcard */}
            <div
                className="relative h-80 cursor-pointer"
                onClick={handleCardFlip}
            >
                <div
                    className={`absolute inset-0 w-full h-full transition-all duration-500 transform-gpu preserve-3d ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front of card */}
                    <div className="absolute inset-0 w-full h-full backface-hidden">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-700 dark:to-primary-800 rounded-2xl shadow-2xl p-8 h-full flex flex-col justify-center items-center text-white">
                            <div className="text-5xl font-bold mb-4 text-center font-kosugi">
                                {card.kanji}
                            </div>
                            <div className="text-2xl mb-3 text-center opacity-90 font-japanese">
                                {card.hiragana}
                            </div>
                            <div className="text-lg opacity-80 text-center">
                                {card.romaji}
                            </div>
                            <div className="mt-6 text-sm opacity-70">
                                Nhấn để xem nghĩa
                            </div>
                        </div>
                    </div>

                    {/* Back of card */}
                    <div
                        className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden"
                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                    >
                        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 rounded-2xl shadow-2xl p-8 h-full flex flex-col justify-center text-white">
                            <div className="text-3xl font-bold mb-4 text-center">
                                {card.meaningVi}
                            </div>
                            <div className="text-lg mb-6 text-center opacity-90">
                                {card.meaningEn}
                            </div>
                            {card.mnemonic && (
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BulbOutlined className="text-yellow-300" />
                                        <span className="text-sm font-medium">Mẹo ghi nhớ:</span>
                                    </div>
                                    <p className="text-sm opacity-90">{card.mnemonic}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
                <Button
                    onClick={handlePrev}
                    icon={<LeftOutlined />}
                    size="large"
                    className="flex items-center"
                >
                    Trước
                </Button>
                <div className="flex gap-2">
                    <Button
                        onClick={handleCardFlip}
                        icon={isFlipped ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        type="default"
                    >
                        {isFlipped ? 'Ẩn nghĩa' : 'Hiện nghĩa'}
                    </Button>
                    <Button
                        icon={<StarOutlined />}
                        type="default"
                    >
                        Đánh dấu
                    </Button>
                </div>
                <Button
                    onClick={handleNext}
                    icon={<RightOutlined />}
                    size="large"
                    type="primary"
                    className="flex items-center"
                >
                    Tiếp
                </Button>
            </div>
        </div>
    );
};

export default FlashCard;
