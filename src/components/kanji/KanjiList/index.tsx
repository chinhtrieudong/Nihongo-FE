import React from 'react';
import { KanjiItem } from '../../../types/kanji';
import KanjiCard from '../KanjiCard';
import { Button, Empty, Spin } from 'antd';

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
            <div className="text-center rounded-2xl border border-[#e6e8ee] bg-white/80 dark:bg-secondary-900/60 py-12">
                <Empty
                    description={
                        <span className="text-secondary-700 dark:text-secondary-800">Không tìm thấy Hán tự nào</span>
                    }
                />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-[#e6e8ee] bg-white/90 dark:bg-secondary-900/70 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                    {selectedLevels.length === 0
                        ? 'Tất cả cấp độ'
                        : `JLPT ${selectedLevels.join(', ')}`}
                </span>
                <span className="rounded-full bg-[#eef2fb] px-2.5 py-1 text-xs font-medium text-[#32435f]">
                    {kanjiList.length} ký tự
                </span>
            </div>

            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 sm:gap-3">
                {kanjiList.map((kanji) => (
                    <KanjiCard
                        key={kanji._id}
                        kanji={kanji}
                        isRadical={isRadicalMode}
                        onClick={onKanjiClick}
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
