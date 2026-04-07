import React from "react";
import { Card, Button, Tag, Typography } from "antd";
import {
    Trophy,
    Clock,
    FileText,
    CheckCircle
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

interface TestSection {
    id: string;
    name: string;
    icon: React.ReactNode;
    questions: number;
    duration: number;
    description: string;
    questionTypes: string[];
}

interface Test {
    id: string;
    level: string;
    title: string;
    description: string;
    duration: number;
    questions: number;
    difficulty: string;
    completed: boolean;
    score?: number;
    date?: string;
    sections: TestSection[];
}

interface TestCardProps {
    test: Test;
    onStartTest: (test: Test) => void;
    onViewResults: (test: Test) => void;
    getLevelColor: (level: string) => string;
    getDifficultyColor: (difficulty: string) => string;
}

const TestCard: React.FC<TestCardProps> = ({
    test,
    onStartTest,
    onViewResults,
    getLevelColor,
    getDifficultyColor
}) => {
    const handleCardClick = () => {
        if (test.completed) {
            onViewResults(test);
        } else {
            onStartTest(test);
        }
    };

    return (
        <Card
            hoverable
            onClick={handleCardClick}
            className={`${test.completed ? 'border-green-200' : ''} bg-surface-1 border-border cursor-pointer`}
            actions={[
                ...(test.completed ? [
                    <Button
                        type="default"
                        icon={<Trophy className="w-4 h-4" />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewResults(test);
                        }}
                    >
                        Xem kết quả
                    </Button>
                ] : [])
            ]}
        >
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <Tag color={getLevelColor(test.level)} className="text-sm font-bold">
                        {test.level}
                    </Tag>
                    {test.completed && (
                        <Tag color="success" icon={<CheckCircle className="w-4 h-4" />}>
                            {test.score}%
                        </Tag>
                    )}
                </div>
                <Title level={4} className="!mb-2">{test.title}</Title>
                <Paragraph className="text-sm !mb-3 !text-secondary-700 dark:!text-secondary-300">
                    {test.description}
                </Paragraph>
                <Tag color={getDifficultyColor(test.difficulty)} className="mb-3">
                    {test.difficulty}
                </Tag>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-secondary-700 dark:text-secondary-400">
                        <Clock className="w-4 h-4 mr-1" />
                        Thời gian
                    </span>
                    <span className="font-medium">{test.duration} phút</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-secondary-700 dark:text-secondary-400">
                        <FileText className="w-4 h-4 mr-1" />
                        Số câu
                    </span>
                    <span className="font-medium">{test.questions} câu</span>
                </div>
                {test.completed && test.date && (
                    <div className="flex justify-between text-sm">
                        <span className="text-secondary-700 dark:text-secondary-400">Ngày làm</span>
                        <span className="font-medium">{new Date(test.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-3 border-t">
                <Text className="text-xs !text-secondary-700 dark:!text-secondary-300">Phần thi:</Text>
                <div className="flex flex-wrap gap-1 mt-1">
                    {test.sections.map(section => (
                        <Tag key={section.id} className="text-xs">
                            {section.icon} {section.name}
                        </Tag>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default TestCard;
