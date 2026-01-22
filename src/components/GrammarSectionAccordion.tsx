import React, { useState } from 'react';
import { Collapse, Typography, Tag, Badge, Divider, Space, Tooltip } from 'antd';
import { CaretRightOutlined, BookOutlined, BulbOutlined, MessageOutlined, SwapOutlined } from '@ant-design/icons';
import GrammarBlock from './GrammarBlock';

const { Title, Text, Paragraph } = Typography;

interface GrammarSection {
  id: string;
  title: string;
  structure?: string[];
  meaning?: string[];
  examples?: Array<{ japanese: string; vietnamese: string }>;
  comparison?: string[];
  formation?: string;
  usage?: string;
  level?: string;
  category?: string;
  importance?: string;
  examFrequency?: number;
  commonMistakes?: Array<{ mistake: string; correction: string }>;
  relatedPatterns?: string[];
}

interface GrammarSectionAccordionProps {
  sections: GrammarSection[];
}

const GrammarSectionAccordion: React.FC<GrammarSectionAccordionProps> = ({ sections }) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const onChange = (keys: string[]) => {
    setActiveKeys(keys);
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
      case 'high': return 'Quan trọng';
      case 'medium': return 'Trung bình';
      case 'low': return 'Cơ bản';
      default: return 'Không xác định';
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
    <Collapse
      bordered={false}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined
          rotate={isActive ? 90 : 0}
          className="text-blue-600 dark:text-blue-400"
        />
      )}
      expandIconPlacement="end"
      activeKey={activeKeys}
      onChange={onChange}
      className="bg-white dark:bg-secondary-925"
      items={sections.map((section) => ({
        key: section.id,
        label: (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <BookOutlined className="text-blue-600 dark:text-blue-400" />
              <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">
                {section.title}
              </Title>
            </div>
            <Space size="small">
              {section.level && (
                <Tag color={getLevelColor(section.level)}>
                  {section.level}
                </Tag>
              )}
              {section.importance && (
                <Badge
                  color={getImportanceColor(section.importance)}
                  text={getImportanceText(section.importance)}
                />
              )}
              {section.examFrequency && (
                <Tag color="blue">
                  Tần suất: {section.examFrequency}/10
                </Tag>
              )}
            </Space>
          </div>
        ),
        children: (
          <div className="p-6 bg-secondary-50 dark:bg-secondary-925">
            {/* Pattern/Structure */}
            {section.structure && section.structure.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <BookOutlined className="text-blue-600 dark:text-blue-400 mr-2" />
                  <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">Cấu trúc</Title>
                </div>
                <div className="bg-white dark:bg-secondary-925 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  {section.structure.map((item, index) => (
                    <Paragraph
                      key={index}
                      className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-400"
                    >
                      {item}
                    </Paragraph>
                  ))}
                </div>
              </div>
            )}

            {/* Formation */}
            {section.formation && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <BulbOutlined className="text-green-600 dark:text-green-400 mr-2" />
                  <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">Cách dùng</Title>
                </div>
                <div className="bg-white dark:bg-secondary-925 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <Paragraph className="mb-0 text-secondary-700 dark:text-secondary-300">
                    {section.formation}
                  </Paragraph>
                </div>
              </div>
            )}

            {/* Meaning/Explanation */}
            {section.meaning && section.meaning.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <BulbOutlined className="text-orange-600 dark:text-orange-400 mr-2" />
                  <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">Nghĩa</Title>
                </div>
                <div className="bg-white dark:bg-secondary-925 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                  {section.meaning.map((item, index) => (
                    <Paragraph
                      key={index}
                      className="mb-2 text-secondary-700 dark:text-secondary-300"
                    >
                      {item}
                    </Paragraph>
                  ))}
                </div>
              </div>
            )}

            {/* Usage */}
            {section.usage && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <MessageOutlined className="text-purple-600 dark:text-purple-400 mr-2" />
                  <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">Cách sử dụng</Title>
                </div>
                <div className="bg-white dark:bg-secondary-925 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                  <Paragraph className="mb-0 text-secondary-700 dark:text-secondary-300">
                    {section.usage}
                  </Paragraph>
                </div>
              </div>
            )}

            {/* Examples */}
            {section.examples && section.examples.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <MessageOutlined className="text-blue-600 dark:text-blue-400 mr-2" />
                  <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">Ví dụ</Title>
                </div>
                <div className="bg-white dark:bg-secondary-925 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  {section.examples.map((example, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <Paragraph className="mb-1 text-secondary-900 dark:text-secondary-100 font-medium">
                        <Tooltip
                          title={example.vietnamese}
                          placement="bottomLeft"
                          arrow={false}
                          align={{ offset: [0, 4] }}
                          classNames={{ root: "glass-tooltip" }}
                          styles={{
                            root: {
                              backdropFilter: 'blur(20px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            },
                            container: {
                              color: '#1a1a1a',
                              fontSize: '14px',
                              fontWeight: '500',
                              padding: '8px 12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.75)',
                              border: '1px solid rgba(255, 255, 255, 0.4)',
                              borderRadius: '12px',
                              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                              backdropFilter: 'blur(20px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            }
                          }}
                          fresh
                        >
                          <span className="cursor-help hover:text-blue-600 transition-colors">
                            {example.japanese}
                          </span>
                        </Tooltip>
                      </Paragraph>
                      {index < section.examples!.length - 1 && (
                        <Divider className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comparison */}
            {section.comparison && section.comparison.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <SwapOutlined className="text-red-600 dark:text-red-400 mr-2" />
                  <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">So sánh</Title>
                </div>
                <div className="bg-white dark:bg-secondary-925 p-4 rounded-lg border border-red-200 dark:border-red-700">
                  {section.comparison.map((item, index) => (
                    <Paragraph
                      key={index}
                      className="mb-2 text-secondary-700 dark:text-secondary-300"
                    >
                      {item}
                    </Paragraph>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {section.commonMistakes && section.commonMistakes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <BulbOutlined className="text-red-600 dark:text-red-400 mr-2" />
                  <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">Lỗi thường gặp</Title>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                  {section.commonMistakes.map((mistake, index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <div className="mb-2">
                        <Text type="danger" className="font-medium">
                          ❌ Sai: {mistake.mistake}
                        </Text>
                      </div>
                      <div>
                        <Text type="success" className="font-medium">
                          ✅ Đúng: {mistake.correction}
                        </Text>
                      </div>
                      {index < section.commonMistakes!.length - 1 && (
                        <Divider className="my-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Patterns */}
            {section.relatedPatterns && section.relatedPatterns.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <BookOutlined className="text-secondary-600 dark:text-secondary-400 mr-2" />
                  <Title level={5} className="mb-0 text-secondary-900 dark:text-secondary-100">Mẫu liên quan</Title>
                </div>
                <div className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg">
                  <Space wrap>
                    {section.relatedPatterns.map((pattern, index) => (
                      <Tag key={index} color="blue" className="mb-2">
                        {pattern}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>
            )}
          </div>
        ),
        className: "mb-4 border border-blue-200 rounded-lg overflow-hidden"
      }))}
    />
  );
};

export default GrammarSectionAccordion;
