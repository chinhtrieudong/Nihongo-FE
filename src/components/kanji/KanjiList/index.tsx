import React from 'react';
import { KanjiItem } from '../../../types/kanji';
import KanjiCard from '../KanjiCard';
import { Empty, Spin } from 'antd';

interface KanjiListProps {
    kanjiList: KanjiItem[];
    loading: boolean;
    onKanjiClick: (kanji: KanjiItem) => void;
}

const KanjiList: React.FC<KanjiListProps> = ({ kanjiList, loading, onKanjiClick }) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (kanjiList.length === 0) {
        return (
            <div className="text-center py-12">
                <Empty
                    description={
                        <span className="text-secondary-700 dark:text-secondary-800">Không tìm thấy Hán tự nào</span>
                    }
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {kanjiList.map((kanji) => (
                <KanjiCard
                    key={kanji._id}
                    kanji={kanji}
                    onClick={onKanjiClick}
                />
            ))}
        </div>
    );
};

export default KanjiList;
