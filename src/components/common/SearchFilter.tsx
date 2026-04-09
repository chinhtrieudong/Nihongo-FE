import React from 'react';
import { Input, Select, Space } from 'antd';
import { Search } from 'lucide-react';
import type { SelectProps } from 'antd';

export interface FilterOption {
  value: string;
  label: React.ReactNode;
}

export interface FilterConfig {
  key: string;
  value: string | string[];
  placeholder: string;
  options: FilterOption[];
  onChange: (value: any) => void;
  mode?: 'multiple' | 'tags';
  allowClear?: boolean;
  maxTagCount?: number | 'responsive';
  width?: string;
  /** Custom tag render (Ant Design Select tagRender) */
  tagRender?: SelectProps['tagRender'];
}

export interface SearchFilterProps {
  /** Search input value */
  searchValue: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Callback when search changes */
  onSearchChange: (value: string) => void;
  /** Filter configurations */
  filters: FilterConfig[];
  /** Additional className */
  className?: string;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  searchPlaceholder = 'Tìm kiếm...',
  onSearchChange,
  filters,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl border border-border bg-surface-1 shadow-none p-2.5 sm:p-3 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-1.5">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            size="middle"
            prefix={<Search className="w-4 h-4 text-secondary-500" />}
            className="w-full [&_.ant-input-prefix]:text-secondary-500"
          />
        </div>

        {/* Filter Selects */}
        {filters.map((filter) => (
          <div key={filter.key} className="w-full md:w-[180px]">
            <Select
              mode={filter.mode}
              value={filter.value}
              onChange={filter.onChange}
              placeholder={filter.placeholder}
              maxTagCount={filter.maxTagCount || 'responsive'}
              maxTagTextLength={3}
              maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
              allowClear={filter.allowClear !== false}
              tagRender={filter.tagRender}
              className="w-full [&_.ant-select]:!h-8 [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!max-h-8 [&_.ant-select-selector]:!py-0 [&_.ant-select-selector]:!px-2 [&_.ant-select-selection-wrap]:!h-8 [&_.ant-select-selection-overflow]:!h-8 [&_.ant-select-selection-overflow]:!items-center [&_.ant-select-selection-item]:!my-0.5 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-[#d9dce5] [&_.ant-select-selector]:!bg-white"
              options={filter.options}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;
