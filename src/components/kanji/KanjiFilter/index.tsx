import React from 'react';
import { Input, Select } from 'antd';
import { Search } from 'lucide-react';

interface KanjiFilterProps {
    selectedLevels: string[];
    searchTerm: string;
    strokeFilters: string[];
    onLevelChange: (levels: string[]) => void;
    onSearch: (term: string) => void;
    onStrokeFilterChange: (value: string | undefined) => void;
}

const KanjiFilter: React.FC<KanjiFilterProps> = ({
    selectedLevels,
    searchTerm,
    strokeFilters,
    onLevelChange,
    onSearch,
    onStrokeFilterChange,
}) => {
    return (
        <div className="mb-4 rounded-2xl border border-[#e6e8ee] dark:border-[#3d4a63] bg-[#f3f4f8] dark:bg-[#1f242d] shadow-none p-2.5 sm:p-3">
            <div className="flex flex-col md:flex-row md:items-center gap-1.5">
                <div className="flex-1 min-w-0">
                    <Input
                        placeholder="Tìm kiếm Hán tự, âm Hán Việt hoặc nghĩa..."
                        prefix={<Search className="w-4 h-4 text-secondary-500" />}
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full [&_.ant-input-prefix]:text-secondary-500 dark:[&_.ant-input-prefix]:text-secondary-400"
                        size="small"
                        allowClear
                    />
                </div>
                <div className="w-full md:w-[180px]">
                    <Select
                        mode="multiple"
                        value={selectedLevels}
                        onChange={onLevelChange}
                        placeholder="Chọn cấp độ"
                        maxTagCount="responsive"
                        className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-[#d9dce5] dark:[&_.ant-select-selector]:!border-[#3d4a63] [&_.ant-select-selector]:!bg-white dark:[&_.ant-select-selector]:!bg-[#252d3d]"
                        size="small"
                        options={[
                            { value: 'all', label: <span className="font-medium text-gray-700 dark:text-gray-300">Tất cả</span> },
                            { value: 'N5', label: <span className="font-medium text-emerald-700 dark:text-emerald-400">N5</span> },
                            { value: 'N4', label: <span className="font-medium text-sky-700 dark:text-sky-400">N4</span> },
                            { value: 'N3', label: <span className="font-medium text-amber-700 dark:text-amber-400">N3</span> },
                            { value: 'N2', label: <span className="font-medium text-rose-700 dark:text-rose-400">N2</span> },
                            { value: 'N1', label: <span className="font-medium text-violet-700 dark:text-violet-400">N1</span> },
                        ]}
                    >
                    </Select>
                </div>
                <div className="w-full md:w-[160px]">
                    <Select
                        value={strokeFilters[0]}
                        onChange={onStrokeFilterChange}
                        placeholder="Lọc số nét"
                        className="w-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-[#d9dce5] dark:[&_.ant-select-selector]:!border-[#3d4a63] [&_.ant-select-selector]:!bg-white dark:[&_.ant-select-selector]:!bg-[#252d3d]"
                        size="small"
                        options={[
                            { value: 'hantu', label: 'Hán tự' },
                            { value: 'radical214', label: '214 bộ thủ' },
                        ]}
                        allowClear
                    />
                </div>
            </div>
        </div>
    );
};

export default KanjiFilter;
