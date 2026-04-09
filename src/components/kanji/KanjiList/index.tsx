import React from 'react';
import { KanjiItem } from '../../../types/kanji';
import KanjiCard from '../KanjiCard';
import { Button, Spin } from 'antd';
import { EmptyState } from '../../common';

interface KanjiListProps {
    kanjiList: KanjiItem[];
    loading: boolean;
    selectedLevels?: string[];
    isRadicalMode?: boolean;
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
    onKanjiClick?: (kanji: KanjiItem) => void;
}

const KanjiList: React.FC<KanjiListProps> = ({
    kanjiList,
    loading,
    selectedLevels = [],
    isRadicalMode = false,
    hasMore = false,
    loadingMore = false,
    onLoadMore,
    onKanjiClick
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (kanjiList.length === 0) {
        return (
            <EmptyState
                type="search"
                title="Không tìm thấy Hán tự"
                description="Không có Hán tự nào phù hợp với bộ lọc hiện tại."
                size="small"
            />
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-surface-1 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                    {selectedLevels.length === 0
                        ? 'Tất cả cấp độ'
                        : `JLPT ${selectedLevels.join(', ')}`}
                </span>
                <span className="rounded-full bg-[#eef2fb] dark:bg-[#3d4a63]/60 px-2.5 py-1 text-xs font-medium text-[#32435f] dark:text-[#e2e8f0]">
                    {kanjiList.length} ký tự
                </span>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
                {kanjiList.map((kanji, index) => (
                    <KanjiCard
                        key={`${kanji.kanji}-${kanji.jlpt || 'na'}-${kanji.stroke_count || 'na'}-${kanji.hanviet || 'na'}-${index}`}
                        kanji={kanji}
                        isRadical={isRadicalMode}
                        onClick={onKanjiClick}
                        allKanji={kanjiList.map((k) => k.kanji || '')}
                        currentIndex={index}
                    />
                ))}
            </div>

            {hasMore && !isRadicalMode && (
                <div className="mt-4 flex justify-center">
                    <Button
                        onClick={onLoadMore}
                        loading={loadingMore}
                        className="rounded-xl"
                    >
                        {loadingMore ? 'Đang tải...' : 'Xem thêm'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default KanjiList;
