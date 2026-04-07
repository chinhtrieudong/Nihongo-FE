import React from 'react';
import { KanjiItem } from '../../../types/kanji.js';
import { Card } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { getFontPreset } from '../../../constants/fonts';

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

const getLevelStyles = (level?: string, isRadical?: boolean) => {
    // Bộ thủ sử dụng một màu duy nhất
    if (isRadical) {
        return {
            card: 'border-teal-200 bg-teal-50/35 hover:border-teal-400 dark:border-teal-700 dark:bg-teal-900/40 dark:hover:border-teal-500',
            char: 'text-teal-900 dark:text-teal-300',
            divider: 'border-teal-100 dark:border-teal-700',
            hanviet: 'text-teal-700 dark:text-teal-400',
            badge: 'bg-teal-100 text-teal-800 dark:bg-teal-800/60 dark:text-teal-200',
        };
    }

    switch (level) {
        case 'N5':
            return {
                card: 'border-emerald-200 bg-emerald-50/35 hover:border-emerald-400 dark:border-emerald-700 dark:bg-emerald-900/40 dark:hover:border-emerald-500',
                char: 'text-emerald-900 dark:text-emerald-300',
                divider: 'border-emerald-100 dark:border-emerald-700',
                hanviet: 'text-emerald-700 dark:text-emerald-400',
                badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-200',
            };
        case 'N4':
            return {
                card: 'border-sky-200 bg-sky-50/35 hover:border-sky-400 dark:border-sky-700 dark:bg-sky-900/40 dark:hover:border-sky-500',
                char: 'text-sky-900 dark:text-sky-300',
                divider: 'border-sky-100 dark:border-sky-700',
                hanviet: 'text-sky-700 dark:text-sky-400',
                badge: 'bg-sky-100 text-sky-800 dark:bg-sky-800/60 dark:text-sky-200',
            };
        case 'N3':
            return {
                card: 'border-amber-200 bg-amber-50/35 hover:border-amber-400 dark:border-amber-700 dark:bg-amber-900/40 dark:hover:border-amber-500',
                char: 'text-amber-900 dark:text-amber-300',
                divider: 'border-amber-100 dark:border-amber-700',
                hanviet: 'text-amber-700 dark:text-amber-400',
                badge: 'bg-amber-100 text-amber-800 dark:bg-amber-800/60 dark:text-amber-200',
            };
        case 'N2':
            return {
                card: 'border-rose-200 bg-rose-50/35 hover:border-rose-400 dark:border-rose-700 dark:bg-rose-900/40 dark:hover:border-rose-500',
                char: 'text-rose-900 dark:text-rose-300',
                divider: 'border-rose-100 dark:border-rose-700',
                hanviet: 'text-rose-700 dark:text-rose-400',
                badge: 'bg-rose-100 text-rose-800 dark:bg-rose-800/60 dark:text-rose-200',
            };
        case 'N1':
            return {
                card: 'border-violet-200 bg-violet-50/35 hover:border-violet-400 dark:border-violet-700 dark:bg-violet-900/40 dark:hover:border-violet-500',
                char: 'text-violet-900 dark:text-violet-300',
                divider: 'border-violet-100 dark:border-violet-700',
                hanviet: 'text-violet-700 dark:text-violet-400',
                badge: 'bg-violet-100 text-violet-800 dark:bg-violet-800/60 dark:text-violet-200',
            };
        default:
            return {
                card: 'border-[#dce4f2] bg-white hover:border-[#8fa8d6] dark:border-[#3d4a63] dark:bg-[#252d3d] dark:hover:border-[#6b8cce]',
                char: 'text-[#1f2a44] dark:text-[#e2e8f0]',
                divider: 'border-[#edf1f7] dark:border-[#3d4a63]',
                hanviet: 'text-[#4f6285] dark:text-[#94a3b8]',
                badge: 'bg-[#eef2fb] text-[#42577c] dark:bg-[#3d4a63]/60 dark:text-[#e2e8f0]',
            };
    }
};

const KanjiCard: React.FC<KanjiCardProps> = ({ kanji, isRadical = false, onClick, allKanji, currentIndex }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fontPreset } = useAppSelector((state) => state.ui);
    const selectedPreset = getFontPreset(fontPreset);
    const colorLevel = normalizeLevel(kanji.jlpt) || normalizeLevel(kanji.color);
    const levelStyles = getLevelStyles(colorLevel, isRadical);
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
                    <div className={`text-[40px] sm:text-[44px] font-bold kanji-text leading-none ${levelStyles.char}`}>
                        {kanji.kanji}
                    </div>
                </div>
                <div className={`w-full border-t pt-1.5 ${levelStyles.divider}`}>
                    {isRadical ? (
                        <>
                            <div className={`text-[12px] font-medium truncate ${levelStyles.hanviet}`}>
                                {kanji.hanviet || 'Không có Hán Việt'}
                            </div>
                            <div className="mt-1 text-[11px] leading-tight text-secondary-700 dark:text-secondary-400 truncate">
                                {bottomMetaText}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mt-1 text-[11px] leading-tight text-secondary-700 dark:text-secondary-400 truncate">
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
