import React, { useState } from 'react';
import { Collapse, Typography, Tag, Badge, Divider, Space, Button } from 'antd';
import { CaretRightOutlined, BookOutlined, BulbOutlined, MessageOutlined, SwapOutlined, TranslationOutlined, CheckCircleOutlined, ClockCircleOutlined, MinusCircleOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface GrammarSection {
  id: string;
  title: string;
  subtitle?: string;
  structure?: string[];
  meaning?: string[];
  examples?: Array<{ japanese: string; vietnamese: string }>;
  comparison?: string[];
  formation?: string;
  usage?: string;
  level?: string;
  importance?: string;
  preview?: string;
  status?: 'not_started' | 'in_progress' | 'completed';
}

interface GrammarSectionAccordionProps {
  sections: GrammarSection[];
}

const GrammarSectionAccordion: React.FC<GrammarSectionAccordionProps> = ({ sections }) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const onChange = (keys: string[]) => {
    setActiveKeys(keys);
  };

  const toggleKey = (key: string) => {
    setActiveKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const getImportanceColor = (importance?: string) => {
    switch (importance) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getImportanceText = (importance?: string) => {
    switch (importance) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1">
            <FireOutlined />
            Bắt buộc
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1">
            <StarOutlined />
            Cơ bản
          </span>
        );
      case 'low': return '✨ Mở rộng';
      default: return 'Không xác định';
    }
  };

  const getStatusConfig = (status?: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return {
          label: (
            <span className="inline-flex items-center gap-1">
              <CheckCircleOutlined />
              Đã học
            </span>
          ),
          color: 'green'
        };
      case 'in_progress':
        return {
          label: (
            <span className="inline-flex items-center gap-1">
              <ClockCircleOutlined />
              Đang học
            </span>
          ),
          color: 'gold'
        };
      default:
        return {
          label: (
            <span className="inline-flex items-center gap-1">
              <MinusCircleOutlined />
              Chưa học
            </span>
          ),
          color: 'default'
        };
    }
  };

  const getFrequencyLabel = (frequency?: number) => {
    if (!frequency && frequency !== 0) return null;
    if (frequency >= 7) return { label: 'Hay ra đề', color: 'purple' };
    if (frequency >= 4) return { label: 'Có thể ra', color: 'blue' };
    return { label: 'Ít gặp', color: 'default' };
  };

  const getPrimaryActionLabel = (status?: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return 'Ôn';
      case 'in_progress':
        return 'Tiếp tục';
      default:
        return 'Học';
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'N5': return 'green';
      case 'N4': return 'blue';
      case 'N3': return 'orange';
      case 'N2': return 'red';
      case 'N1': return 'purple';
      default: return 'default';
    }
  };

  return (
    <>
      <Collapse
        bordered={false}
        expandIcon={() => null}
        activeKey={activeKeys}
        onChange={onChange}
        className="grammar-accordion bg-transparent dark:bg-transparent"
        items={sections.map((section) => ({
          key: section.id,
          label: (() => {
            const isActive = activeKeys.includes(section.id);
            return (
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-center flex-1 min-w-0 gap-3">
                    <BookOutlined className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100 text-sm break-words whitespace-normal" style={{ marginBottom: 0 }}>
                      {section.title}
                    </Title>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 flex-shrink-0">
                    {section.level && (
                      <Tag color={getLevelColor(section.level)} className="text-xs">
                        {section.level}
                      </Tag>
                    )}
                    {section.importance && (
                      <Tag color={getImportanceColor(section.importance)} className="text-xs">
                        {getImportanceText(section.importance)}
                      </Tag>
                    )}
                    {section.status && (
                      <Tag color={getStatusConfig(section.status).color} className="text-xs">
                        {getStatusConfig(section.status).label}
                      </Tag>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex-1 min-w-0">
                    {section.subtitle && (
                      <div className="flex items-start gap-2 min-w-0">
                        <TranslationOutlined className="text-orange-500 dark:text-orange-400 flex-shrink-0" />
                        <Text className="flex-1 min-w-0 text-gray-600 dark:text-secondary-400 text-sm break-words whitespace-normal">
                          {section.subtitle}
                        </Text>
                      </div>
                    )}
                    {section.preview && (
                      <Text className="block text-secondary-500 dark:text-secondary-400 mt-1 text-sm break-words whitespace-normal">
                        Ví dụ: {section.preview}
                      </Text>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKey(section.id);
                    }}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex-shrink-0 mt-0.5"
                    aria-label={isActive ? "Thu gọn" : "Mở rộng"}
                  >
                    <CaretRightOutlined className={isActive ? "rotate-90 transition-transform" : "transition-transform"} />
                  </button>
                </div>
              </div>
            );
          })(),
          children: (
            <div className="px-2 py-4 sm:px-3 sm:py-6 bg-transparent dark:bg-transparent border-t border-gray-200 dark:border-gray-600">
              {/* Meaning/Explanation */}
              {section.meaning && section.meaning.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center mb-3">
                    <BulbOutlined className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                    <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Nghĩa</Title>
                  </div>
                  <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                    {section.meaning.map((item, index) => (
                      <Paragraph
                        key={index}
                        className="text-secondary-700 dark:text-secondary-300 break-words"
                        style={{ marginBottom: 0 }}
                      >
                        {item}
                      </Paragraph>
                    ))}
                  </div>
                </div>
              )}

              {/* Pattern/Structure */}
              {section.structure && section.structure.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center mb-3">
                    <BookOutlined className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                    <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Cấu trúc</Title>
                  </div>
                  <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                    {section.structure.map((item, index) => (
                      <Paragraph
                        key={`${section.id}-structure-${index}`}
                        className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400 break-words"
                        style={{ marginBottom: 0 }}
                      >
                        {item}
                      </Paragraph>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage (Merged) */}
              {(section.formation || section.usage) && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center mb-3">
                    <MessageOutlined className="text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" />
                    <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Cách dùng</Title>
                  </div>
                  <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700 space-y-2">
                    {section.formation && (
                      <Paragraph className="text-secondary-700 dark:text-secondary-300 break-words font-semibold" style={{ marginBottom: 0 }}>
                        {section.formation}
                      </Paragraph>
                    )}
                    {section.usage && (
                      <Paragraph className="text-secondary-700 dark:text-secondary-300 break-words" style={{ marginBottom: 0 }}>
                        {section.usage}
                      </Paragraph>
                    )}
                  </div>
                </div>
              )}

              {/* Examples */}
              {section.examples && section.examples.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center mb-3">
                    <MessageOutlined className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                    <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Ví dụ</Title>
                  </div>
                  <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                    {section.examples.map((example, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <div className="inline-flex items-center gap-2">
                          <span className="text-secondary-900 dark:text-secondary-100 font-medium">
                            {example.japanese}
                          </span>
                          <span className="text-secondary-900 dark:text-secondary-100 font-medium text-sm">
                            ({example.vietnamese})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison */}
              {section.comparison && section.comparison.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center mb-3">
                    <SwapOutlined className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                    <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>So sánh</Title>
                  </div>
                  <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                    {section.comparison.map((item, index) => (
                      <Paragraph
                        key={index}
                        className="text-secondary-700 dark:text-secondary-300 break-words"
                        style={{ marginBottom: 0 }}
                      >
                        {item}
                      </Paragraph>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
          className: "mb-4 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all"
        }))}
      />
    </>
  );
};

export default GrammarSectionAccordion;
