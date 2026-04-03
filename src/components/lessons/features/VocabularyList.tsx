import React from "react";
import { Badge } from "antd";
import { Book } from "lucide-react";

interface VocabularyListProps {
    vocabulary: Array<{
        id: string;
        kanji: string;
        hiragana: string;
        romaji: string;
        meaningVi: string;
        meaningEn: string;
    }>;
    currentIndex: number;
    onSelectCard: (index: number) => void;
}

const VocabularyList: React.FC<VocabularyListProps> = ({
    vocabulary,
    currentIndex,
    onSelectCard,
}) => {
    return (
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                <Book className="w-5 h-5" />
                Danh sách từ vựng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vocabulary.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => onSelectCard(index)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${index === currentIndex
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg"
                            : "border-secondary-200 dark:border-secondary-700 hover:border-primary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="font-bold text-lg text-primary-600 dark:text-primary-400 font-kosugi">
                                {item.kanji}
                            </div>
                            <Badge count={index + 1} size="small" />
                        </div>
                        <div className="text-sm text-secondary-700 dark:text-secondary-400 mb-1 font-japanese">
                            {item.hiragana}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-500 mb-2">
                            {item.romaji}
                        </div>
                        <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                            {item.meaningVi}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VocabularyList;
