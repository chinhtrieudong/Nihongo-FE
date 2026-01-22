import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

interface TestFiltersProps {
    selectedLevel: string;
    onLevelChange: (level: string) => void;
    availableCount: number;
    completedCount: number;
}

const TestFilters: React.FC<TestFiltersProps> = ({
    selectedLevel,
    onLevelChange,
    availableCount,
    completedCount
}) => {
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <Text type="secondary">Lọc theo cấp độ:</Text>
                <select
                    value={selectedLevel}
                    onChange={(e) => onLevelChange(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md"
                >
                    <option value="all">Tất cả</option>
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                </select>
            </div>
        </Card>
    );
};

export default TestFilters;
