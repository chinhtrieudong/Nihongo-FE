import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import {
    CheckCircleOutlined,
    StarOutlined,
    FireOutlined,
    ClockCircleOutlined
} from "@ant-design/icons";

interface TestStatisticsProps {
    totalTestsCompleted: number;
    averageScore: number;
    currentStreak: number;
    totalStudyTime: number;
}

const TestStatistics: React.FC<TestStatisticsProps> = ({
    totalTestsCompleted,
    averageScore,
    currentStreak,
    totalStudyTime
}) => {
    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title="Bài thi đã hoàn thành"
                        value={totalTestsCompleted}
                        prefix={<CheckCircleOutlined className="text-green-500" />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title="Điểm trung bình"
                        value={averageScore}
                        suffix="%"
                        prefix={<StarOutlined className="text-yellow-500" />}
                        valueStyle={{ color: '#faad14' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title="Chuỗi luyện tập"
                        value={currentStreak}
                        suffix="ngày"
                        prefix={<FireOutlined className="text-orange-500" />}
                        valueStyle={{ color: '#fa8c16' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title="Tổng thời gian"
                        value={totalStudyTime}
                        suffix="phút"
                        prefix={<ClockCircleOutlined className="text-blue-500" />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default TestStatistics;
