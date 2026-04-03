import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
    CheckCircle,
    Star
} from "lucide-react";

interface TestStatisticsProps {
    totalTestsCompleted: number;
    averageScore: number;
}

const TestStatistics: React.FC<TestStatisticsProps> = ({
    totalTestsCompleted,
    averageScore
}) => {
    return (
        <Row gutter={[12, 12]} wrap={false}>
            <Col flex="1 1 0">
                <Card size="small" className="h-full">
                    <Statistic
                        title={<span className="text-secondary-700 dark:text-secondary-400">Bài thi đã hoàn thành</span>}
                        value={totalTestsCompleted}
                        prefix={<CheckCircle className="w-4 h-4 text-green-500" />}
                        styles={{ content: { color: '#52c41a', fontSize: 18 } }}
                    />
                </Card>
            </Col>
            <Col flex="1 1 0">
                <Card size="small" className="h-full">
                    <Statistic
                        title={<span className="text-secondary-700 dark:text-secondary-400">Điểm trung bình</span>}
                        value={averageScore}
                        suffix="%"
                        prefix={<Star className="w-4 h-4 text-yellow-500" />}
                        styles={{ content: { color: '#faad14', fontSize: 18 } }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default TestStatistics;
