import React from "react";
import { Typography, Select } from "antd";

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
        <div className="tests-filter inline-flex items-center gap-2">
            <style>
                {`
                  .tests-select-dropdown .ant-select-item {
                    font-size: 14px;
                  }
                  .dark .tests-select-dropdown .ant-select-item {
                    color: #e5e7eb;
                  }
                  .dark .tests-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
                    background: #1f2937;
                  }
                  .dark .tests-select-dropdown {
                    background: #111827;
                  }
                `}
            </style>
            <Text className="text-sm !text-secondary-700 dark:!text-secondary-400 whitespace-nowrap">
                Lọc theo cấp độ:
            </Text>
            <Select
                value={selectedLevel}
                onChange={(value) => onLevelChange(value)}
                className="w-40 sm:w-44 tests-select"
                size="middle"
                classNames={{ popup: { root: "tests-select-dropdown" } }}
                options={[
                    { value: "all", label: <span className="text-secondary-900 dark:text-secondary-100 font-medium">Tất cả</span> },
                    { value: "N5", label: <span className="text-green-500 font-medium">N5</span> },
                    { value: "N4", label: <span className="text-blue-500 font-medium">N4</span> },
                    { value: "N3", label: <span className="text-orange-500 font-medium">N3</span> },
                    { value: "N2", label: <span className="text-red-500 font-medium">N2</span> },
                    { value: "N1", label: <span className="text-purple-500 font-medium">N1</span> },
                ]}
            />
        </div>
    );
};

export default TestFilters;
