import React from 'react';
import { KanjiItem } from '../../../types/kanji.js';
import { Card } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

interface KanjiCardProps {
    kanji: KanjiItem;
    isRadical?: boolean;
    onClick?: (kanji: KanjiItem) => void;
    allKanji?: string[];
    currentIndex?: number;
}

const normalizeLevel = (value?: string) => {
    if (!value) return undefined;
    const normalized = value.toUpperCase().trim();
    if (['N5', 'N4', 'N3', 'N2', 'N1'].includes(normalized)) {
        return normalized;
    }
    return undefined;
};

const getLevelStyles = (level?: string) => {
    switch (level) {
        case 'N5':
            return {
                card: 'border-emerald-200 bg-emerald-50/35 hover:border-emerald-400',
                char: 'text-emerald-900',
                divider: 'border-emerald-100',
                hanviet: 'text-emerald-700',
                badge: 'bg-emerald-100 text-emerald-800',
            };
        case 'N4':
            return {
                card: 'border-sky-200 bg-sky-50/35 hover:border-sky-400',
                char: 'text-sky-900',
                divider: 'border-sky-100',
                hanviet: 'text-sky-700',
                badge: 'bg-sky-100 text-sky-800',
            };
        case 'N3':
            return {
                card: 'border-amber-200 bg-amber-50/35 hover:border-amber-400',
                char: 'text-amber-900',
                divider: 'border-amber-100',
                hanviet: 'text-amber-700',
                badge: 'bg-amber-100 text-amber-800',
            };
        case 'N2':
            return {
                card: 'border-rose-200 bg-rose-50/35 hover:border-rose-400',
                char: 'text-rose-900',
                divider: 'border-rose-100',
                hanviet: 'text-rose-700',
                badge: 'bg-rose-100 text-rose-800',
            };
        case 'N1':
            return {
                card: 'border-violet-200 bg-violet-50/35 hover:border-violet-400',
                char: 'text-violet-900',
                divider: 'border-violet-100',
                hanviet: 'text-violet-700',
                badge: 'bg-violet-100 text-violet-800',
            };
        default:
            return {
                card: 'border-[#dce4f2] bg-white hover:border-[#8fa8d6]',
                char: 'text-[#1f2a44]',
                divider: 'border-[#edf1f7]',
                hanviet: 'text-[#4f6285]',
                badge: 'bg-[#eef2fb] text-[#42577c]',
            };
    }
};

const KanjiCard: React.FC<KanjiCardProps> = ({ kanji, isRadical = false, onClick, allKanji, currentIndex }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const colorLevel = normalizeLevel(kanji.jlpt) || normalizeLevel(kanji.color);
    const levelStyles = getLevelStyles(colorLevel);
    const onyomiText =
        kanji.onyomi && kanji.onyomi.length > 0
            ? kanji.onyomi.join(", ")
            : "Không có";
    const kunyomiText =
        kanji.kunyomi && kanji.kunyomi.length > 0
            ? kanji.kunyomi.join(", ")
            : "Không có";
    const bottomMetaText = isRadical
        ? `${kanji.meaningVi || 'Bộ thủ'} • ${kanji.stroke_count ?? "-"} nét`
        : `${onyomiText} • ${kunyomiText}`;

    const handleCardClick = () => {
        const targetPath = isRadical
            ? `/kanji/radicals/${encodeURIComponent(kanji.kanji || '')}`
            : `/kanji/${kanji.kanji || ''}`;

        navigate(targetPath, {
            state: {
                from: `${location.pathname}${location.search}`,
                kanjiList: allKanji,
                currentIndex,
            },
        });

        // Also call onClick if provided
        if (onClick) {
            onClick(kanji);
        }
    };

    return (
        <Card
            hoverable
            className={`h-[140px] sm:h-[150px] w-full rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer border-2 ${levelStyles.card}`}
            onClick={handleCardClick}
            styles={{ body: { padding: '10px', height: '100%', width: '100%' } }}
        >
            <div className="h-full flex flex-col text-center">
                <div className="flex-1 flex items-center justify-center">
                    <div className={`text-[40px] sm:text-[44px] font-bold font-kosugi leading-none ${levelStyles.char}`}>
                        {kanji.kanji}
                    </div>
                </div>
                <div className={`w-full border-t pt-1.5 ${levelStyles.divider}`}>
                    {isRadical ? (
                        <>
                            <div className={`text-[12px] font-medium truncate ${levelStyles.hanviet}`}>
                                {kanji.hanviet || 'Không có Hán Việt'}
                            </div>
                            <div className="mt-1 text-[11px] leading-tight text-secondary-700 truncate">
                                {bottomMetaText}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mt-1 text-[11px] leading-tight text-secondary-700 truncate">
                                {bottomMetaText}
                            </div>
                            <div className={`text-[12px] font-medium truncate ${levelStyles.hanviet}`}>
                                {kanji.hanviet || 'Không có Hán Việt'}
                            </div>
                        </>
                    )}
                </div>
                <div className="sr-only">
                    Mở chi tiết ký tự {kanji.kanji}
                </div>
            </div>
        </Card>
    );
};

export default KanjiCard;
