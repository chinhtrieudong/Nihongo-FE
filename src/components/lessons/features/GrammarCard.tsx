import React from "react";
import { Badge, Button } from "antd";
import {
    Volume2,
    HelpCircle,
    Lightbulb,
    Edit,
} from "lucide-react";

interface GrammarCardProps {
    grammar: {
        id: string;
        pattern: string;
        meaning: string;
        usageContext: string;
        examples: string[];
    };
    index: number;
}

const GrammarCard: React.FC<GrammarCardProps> = ({ grammar, index }) => {
    return (
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
                        icon={<Volume2 className="w-4 h-4" />}
                        className="text-white hover:bg-white/20"
                    />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                    {grammar.pattern}
                </div>
                <div className="text-white/90 text-sm">
                    {grammar.meaning}
                </div>
            </div>

            {/* Pattern Content */}
            <div className="p-6 space-y-4">
                {/* Usage Context */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">
                            Tình huống sử dụng
                        </h4>
                    </div>
                    <p className="text-secondary-700 dark:text-secondary-400 text-sm leading-relaxed">
                        {grammar.usageContext}
                    </p>
                </div>

                {/* Examples */}
                {grammar.examples && grammar.examples.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <Lightbulb className="w-3 h-3 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">
                                Ví dụ
                            </h4>
                        </div>
                        <div className="space-y-3">
                            {grammar.examples.map((example: string, i: number) => (
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
                        icon={<Volume2 className="w-4 h-4" />}
                        className="flex-1"
                    >
                        Nghe mẫu
                    </Button>
                    <Button
                        type="default"
                        size="small"
                        icon={<Edit className="w-4 h-4" />}
                        className="flex-1"
                    >
                        Luyện tập
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GrammarCard;
