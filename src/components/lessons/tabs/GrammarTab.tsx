import React from "react";
import { Badge, Button } from "antd";
import {
    ReadOutlined,
    SoundOutlined,
    QuestionCircleOutlined,
    BulbOutlined,
    EditOutlined,
    TrophyOutlined,
} from "@ant-design/icons";

interface GrammarTabProps {
    grammar: any[];
}

const GrammarTab: React.FC<GrammarTabProps> = ({ grammar }) => {
    if (grammar.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                        <ReadOutlined className="text-3xl text-gray-500 dark:text-secondary-400" />
                    </div>
                    <p className="text-secondary-700 dark:text-secondary-400 text-lg">
                        Chưa có ngữ pháp cho bài học này.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                        <span className="text-3xl">📘</span>
                        Ngữ pháp
                    </h2>
                    <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                        Học {grammar.length} mẫu ngữ pháp quan trọng
                    </p>
                </div>
                <Badge
                    count={grammar.length}
                    style={{ backgroundColor: '#52c41a' }}
                    className="text-sm"
                />
            </div>

            {/* Grammar Patterns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {grammar.map((item, index) => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                        {/* Pattern Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <Badge
                                        count="Mẫu câu"
                                        size="small"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                                    />
                                </div>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<SoundOutlined />}
                                    className="text-white hover:bg-white/20"
                                />
                            </div>
                            <div className="text-2xl font-bold text-white mb-2">
                                {item.pattern}
                            </div>
                            <div className="text-white/90 text-sm">
                                {item.meaning}
                            </div>
                        </div>

                        {/* Pattern Content */}
                        <div className="p-6 space-y-4">
                            {/* Usage Context */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <QuestionCircleOutlined className="text-blue-600 dark:text-blue-400 text-xs" />
                                    </div>
                                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">
                                        Tình huống sử dụng
                                    </h4>
                                </div>
                                <p className="text-secondary-700 dark:text-secondary-400 text-sm leading-relaxed">
                                    {item.usageContext}
                                </p>
                            </div>

                            {/* Examples */}
                            {item.examples && item.examples.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                            <BulbOutlined className="text-green-600 dark:text-green-400 text-xs" />
                                        </div>
                                        <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">
                                            Ví dụ
                                        </h4>
                                    </div>
                                    <div className="space-y-3">
                                        {item.examples.map((example: string, i: number) => (
                                            <div
                                                key={i}
                                                className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4 border-l-4 border-blue-500 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-secondary-900 dark:text-secondary-100 font-medium">
                                                            {example}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <Button
                                    type="default"
                                    size="small"
                                    icon={<SoundOutlined />}
                                    className="flex-1"
                                >
                                    Nghe mẫu
                                </Button>
                                <Button
                                    type="default"
                                    size="small"
                                    icon={<EditOutlined />}
                                    className="flex-1"
                                >
                                    Luyện tập
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Reference Card */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <TrophyOutlined className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Mẹo học ngữ pháp</h3>
                        <p className="text-white/80 text-sm">Học hiệu quả hơn với các phương pháp sau</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="font-semibold mb-2">🎯 Hiểu cấu trúc</div>
                        <p className="text-sm text-white/80">Phân tích từng thành phần trong mẫu câu</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="font-semibold mb-2">📝 Luyện viết</div>
                        <p className="text-sm text-white/80">Tạo câu riêng với mẫu ngữ pháp đã học</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="font-semibold mb-2">💬 Sử dụng thực tế</div>
                        <p className="text-sm text-white/80">Áp dụng vào hội thoại hàng ngày</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrammarTab;
