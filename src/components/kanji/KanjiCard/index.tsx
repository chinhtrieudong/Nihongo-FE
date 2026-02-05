import React, { useState } from 'react';
import { KanjiItem } from '../../../types/kanji.js';
import { Card, Tag } from 'antd';

interface KanjiCardProps {
    kanji: KanjiItem;
    onClick: (kanji: KanjiItem) => void;
}

const KanjiCard: React.FC<KanjiCardProps> = ({ kanji, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const getJlptColor = (level: string): string => {
        switch (level) {
            case 'N5': return 'green';
            case 'N4': return 'blue';
            case 'N3': return 'orange';
            case 'N2': return 'red';
            case 'N1': return 'purple';
            default: return 'default';
        }
    };


    return (
        <Card
            hoverable
            className="h-full transition-all duration-200 hover:scale-105 cursor-pointer"
            onClick={() => onClick(kanji)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="text-center">
                {!isHovered ? (
                    // Front content
                    <>
                        <div className="text-5xl font-bold mb-2 font-kosugi">{kanji.character}</div>
                        <div className="text-lg text-purple-600 dark:text-purple-400 font-medium">{kanji.hanviet}</div>
                        <div className="flex justify-center gap-2 mb-3">
                            <Tag color={getJlptColor(kanji.jlpt_level)}>{kanji.jlpt_level}</Tag>
                            <Tag color="geekblue">{kanji.stroke_count} nét</Tag>
                        </div>
                        <div className="text-sm text-secondary-700 dark:text-secondary-800">Click để xem chi tiết</div>
                    </>
                ) : (
                    // Back content
                    <div className="flex flex-col justify-center items-center h-full w-full">
                        <div className="text-6xl font-bold text-secondary-900 dark:text-secondary-600 font-kosugi">{kanji.character}</div>
                        <div className="text-xl font-semibold text-secondary-900 dark:text-secondary-600 mt-2">{kanji.meaning_vi}</div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default KanjiCard;
