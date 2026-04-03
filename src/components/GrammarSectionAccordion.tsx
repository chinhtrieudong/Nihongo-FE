import React, { useState } from "react";
import { Card, Typography, Collapse, Tag, Space } from "antd";
import { ChevronDown, ChevronRight, BookOpen, MessageSquare, Lightbulb, ArrowLeftRight } from "lucide-react";

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;

interface GrammarPoint {
    _id: string;
    title: string;
    explanation: string;
    examples?: string[];
    structure?: string;
    usage?: string;
    notes?: string;
    category?: string;
    level?: string;
    meaning?: string[];
    formation?: string;
    comparison?: Array<{
        pattern: string;
        meaning: string;
        usage: string;
    }>;
}

interface GrammarSectionAccordionProps {
    grammars: GrammarPoint[];
    lessonInfo?: any;
}

const GrammarSectionAccordion: React.FC<GrammarSectionAccordionProps> = ({
    grammars,
    lessonInfo,
}) => {
    const [activeKey, setActiveKey] = useState<string | string[]>([]);

    if (!grammars || grammars.length === 0) {
        return (
            <Card>
                <Text type="secondary">Không có điểm ngữ pháp nào trong bài học này.</Text>
            </Card>
        );
    }

    return (
        <Card title={<Title level={4}>Ngữ pháp</Title>}>
            <Collapse
                activeKey={activeKey}
                onChange={(key) => setActiveKey(key)}
                expandIcon={({ isActive }) =>
                    isActive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                }
            >
                {grammars.map((grammar) => (
                    <Panel
                        header={
                            <div className="flex items-center gap-2">
                                <Text strong className="text-base">
                                    {grammar.title}
                                </Text>
                                {grammar.level && (
                                    <Tag color="blue" className="!text-xs !px-2 !py-0.5 !font-semibold !m-0">
                                        {grammar.level}
                                    </Tag>
                                )}
                                {grammar.category && (
                                    <Tag color="green" className="!text-xs !px-2 !py-0.5 !font-semibold !m-0">
                                        {grammar.category}
                                    </Tag>
                                )}
                            </div>
                        }
                        key={grammar._id}
                    >
                        <div style={{ padding: "8px 0" }}>
                            {/* Meaning Section */}
                            {grammar.meaning && grammar.meaning.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                                        <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Nghĩa</Title>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                                        {grammar.meaning.map((item, index) => (
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

                            {/* Structure Section */}
                            {grammar.structure && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                                        <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Cấu trúc</Title>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                                        <Paragraph className="text-secondary-700 dark:text-secondary-300 break-words font-semibold" style={{ marginBottom: 0 }}>
                                            {grammar.structure}
                                        </Paragraph>
                                    </div>
                                </div>
                            )}

                            {/* Usage Section */}
                            {grammar.usage && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" />
                                        <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Cách dùng</Title>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700 space-y-2">
                                        {grammar.formation && (
                                            <Paragraph className="text-secondary-700 dark:text-secondary-300 break-words font-semibold" style={{ marginBottom: 0 }}>
                                                {grammar.formation}
                                            </Paragraph>
                                        )}
                                        {grammar.usage && (
                                            <Paragraph className="text-secondary-700 dark:text-secondary-300 break-words" style={{ marginBottom: 0 }}>
                                                {grammar.usage}
                                            </Paragraph>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Explanation Section */}
                            {grammar.explanation && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                                        <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Mô tả</Title>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                                        <Paragraph className="text-secondary-700 dark:text-secondary-300 break-words" style={{ marginBottom: 0 }}>
                                            {grammar.explanation}
                                        </Paragraph>
                                    </div>
                                </div>
                            )}

                            {/* Examples Section */}
                            {grammar.examples && grammar.examples.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
                                        <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Ví dụ</Title>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                                        {grammar.examples.map((example, index) => (
                                            <div key={index} className="mb-2 last:mb-0">
                                                <div className="inline-flex items-center gap-2">
                                                    <span className="text-secondary-900 dark:text-secondary-100 font-medium">
                                                        {example}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Comparison Section */}
                            {grammar.comparison && grammar.comparison.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ArrowLeftRight className="w-4 h-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                                        <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>So sánh</Title>
                                    </div>
                                    <div className="bg-white dark:bg-secondary-925 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-secondary-700">
                                        {grammar.comparison.map((item, index) => (
                                            <div key={index} className="mb-2 last:mb-0">
                                                <Paragraph className="text-secondary-700 dark:text-secondary-300 break-words" style={{ marginBottom: 0 }}>
                                                    <strong>{item.pattern}</strong>: {item.meaning} - {item.usage}
                                                </Paragraph>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Notes Section */}
                            {grammar.notes && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                                        <Title level={5} className="text-secondary-900 dark:text-secondary-100" style={{ marginBottom: 0 }}>Ghi chú</Title>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                        <Paragraph className="text-yellow-800 dark:text-yellow-200 break-words" style={{ marginBottom: 0 }}>
                                            {grammar.notes}
                                        </Paragraph>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Panel>
                ))}
            </Collapse>
        </Card>
    );
};

export default GrammarSectionAccordion;