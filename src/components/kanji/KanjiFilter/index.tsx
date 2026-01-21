import React from 'react';
import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

interface KanjiFilterProps {
    selectedLevel: string;
    searchTerm: string;
    onLevelChange: (level: string) => void;
    onSearch: (term: string) => void;
}

const KanjiFilter: React.FC<KanjiFilterProps> = ({
    selectedLevel,
    searchTerm,
    onLevelChange,
    onSearch,
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
                <Input
                    placeholder="Tìm kiếm Hán tự, âm Hán Việt hoặc nghĩa..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full"
                    size="large"
                />
            </div>
            <div className="w-full sm:w-48">
                <Select
                    value={selectedLevel}
                    onChange={onLevelChange}
                    className="w-full"
                    size="large"
                >
                    <Option value="all">Tất cả cấp độ</Option>
                    <Option value="N5">N5</Option>
                    <Option value="N4">N4</Option>
                    <Option value="N3">N3</Option>
                    <Option value="N2">N2</Option>
                    <Option value="N1">N1</Option>
                </Select>
            </div>
        </div>
    );
};

export default KanjiFilter;
