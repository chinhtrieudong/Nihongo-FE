import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Typography,
    Button,
    Progress,
    Space,
    Row,
    Col,
    Tag,
    Divider,
    List,
    Statistic
} from "antd";
import {
    TrophyOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LeftOutlined,
    ReloadOutlined,
    BookOutlined,
    FileTextOutlined,
    AudioOutlined,
    TranslationOutlined
} from "@ant-design/icons";
import { jlptTests, type Test } from "../data/jlptTests";
import { sampleQuestions, type Question } from "../data/sampleQuestions";

const { Title, Text, Paragraph } = Typography;

interface TestAttempt {
    id: string;
    testId: string;
    startTime: Date;
    endTime?: Date;
    answers: Record<string, string | number>;
    score?: number;
    completed: boolean;
}

const TestResults: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    const [test, setTest] = useState<Test | null>(null);
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [sectionResults, setSectionResults] = useState<any[]>([]);

    useEffect(() => {
        if (testId) {
            // Find test
            const foundTest = jlptTests.find(t => t.id === testId);
            if (foundTest) {
                setTest(foundTest);

                // Get questions for this test
                const testQuestions = sampleQuestions.filter(q =>
                    q.level === foundTest.level &&
                    foundTest.sections.some(section => section.id === q.sectionId)
                ).slice(0, foundTest.questions);
                setQuestions(testQuestions);
            }

            // Find the most recent attempt for this test
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('attempt_')) {
                    const attemptData = localStorage.getItem(key);
                    if (attemptData) {
                        const parsedAttempt: TestAttempt = JSON.parse(attemptData);
                        if (parsedAttempt.testId === testId && parsedAttempt.completed) {
                            setAttempt(parsedAttempt);
                            break;
                        }
                    }
                }
            }
        }
    }, [testId]);

    useEffect(() => {
        if (test && attempt && questions.length > 0) {
            // Calculate section results
            const results = test.sections.map(section => {
                const sectionQuestions = questions.filter(q => q.sectionId === section.id);
                const correctAnswers = sectionQuestions.filter(q =>
                    attempt.answers[q.id] === q.correctAnswer
                ).length;

                return {
                    section,
                    totalQuestions: sectionQuestions.length,
                    correctAnswers,
                    percentage: sectionQuestions.length > 0 ? Math.round((correctAnswers / sectionQuestions.length) * 100) : 0
                };
            });

            setSectionResults(results);
        }
    }, [test, attempt, questions]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "#52c41a";
        if (score >= 60) return "#fa8c16";
        return "#f5222d";
    };

    const getSectionIcon = (sectionId: string) => {
        switch (sectionId) {
            case "vocabulary": return <BookOutlined />;
            case "grammar": return <FileTextOutlined />;
            case "reading": return <FileTextOutlined />;
            case "listening": return <AudioOutlined />;
            case "kanji": return <TranslationOutlined />;
            default: return <FileTextOutlined />;
        }
    };

    const getPerformanceMessage = (score: number) => {
        if (score >= 90) return "Xuất sắc! Bạn đã làm rất tốt.";
        if (score >= 80) return "Tốt! Bạn đã nắm vững kiến thức.";
        if (score >= 60) return "Khá! Cần cố gắng hơn nữa.";
        return "Cần cải thiện! Hãy ôn tập lại kiến thức.";
    };

    const formatDuration = (startTime: Date, endTime?: Date) => {
        const end = endTime ? new Date(endTime) : new Date();
        const start = new Date(startTime);
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
        return `${duration} phút`;
    };

    if (!test || !attempt) {
        return (
            <div className="p-6">
                <Text>Không tìm thấy kết quả bài thi</Text>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto bg-secondary-50 dark:bg-secondary-950 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} className="!mb-2">Kết quả bài thi</Title>
                        <Text type="secondary">{test.title}</Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<LeftOutlined />} onClick={() => navigate("/tests")}>
                                Quay lại danh sách
                            </Button>
                            <Button type="primary" icon={<ReloadOutlined />} onClick={() => navigate(`/test/${testId}`)}>
                                Làm lại bài thi
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* Overall Score */}
            <Card className="mb-6 text-center">
                <TrophyOutlined className="text-6xl mb-4" style={{ color: getScoreColor(attempt.score || 0) }} />
                <Title level={1} style={{ color: getScoreColor(attempt.score || 0) }}>
                    {attempt.score}%
                </Title>
                <Paragraph className="text-lg">
                    {getPerformanceMessage(attempt.score || 0)}
                </Paragraph>
                <Divider />
                <Row justify="center" gutter={32}>
                    <Col>
                        <Statistic title="Tổng số câu" value={test.questions} />
                    </Col>
                    <Col>
                        <Statistic
                            title="Câu đúng"
                            value={Math.round((attempt.score || 0) * test.questions / 100)}
                            suffix={`/${test.questions}`}
                        />
                    </Col>
                    <Col>
                        <Statistic title="Thời gian làm bài" value={formatDuration(attempt.startTime, attempt.endTime)} />
                    </Col>
                </Row>
            </Card>

            {/* Section Results */}
            <Card title="Kết quả theo phần thi" className="mb-6">
                <List
                    dataSource={sectionResults}
                    renderItem={(result) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<div className="text-2xl">{getSectionIcon(result.section.id)}</div>}
                                title={
                                    <Space>
                                        <Text strong>{result.section.name}</Text>
                                        <Tag color="blue">{result.section.questions} câu</Tag>
                                    </Space>
                                }
                                description={
                                    <div>
                                        <Progress
                                            percent={result.percentage}
                                            size="small"
                                            strokeColor={getScoreColor(result.percentage)}
                                            className="mb-2"
                                        />
                                        <Text type="secondary">
                                            Đúng {result.correctAnswers}/{result.totalQuestions} câu ({result.percentage}%)
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>

            {/* Detailed Answers */}
            <Card title="Chi tiết câu trả lời" className="mb-6">
                <List
                    dataSource={questions}
                    renderItem={(question, index) => {
                        const userAnswer = attempt.answers[question.id];
                        const isCorrect = userAnswer === question.correctAnswer;

                        return (
                            <List.Item className={isCorrect ? "bg-green-50" : "bg-red-50"}>
                                <List.Item.Meta
                                    avatar={
                                        isCorrect ?
                                            <CheckCircleOutlined className="text-green-500 text-xl" /> :
                                            <CloseCircleOutlined className="text-red-500 text-xl" />
                                    }
                                    title={
                                        <Space>
                                            <Text strong>Câu {index + 1}</Text>
                                            <Tag color={question.sectionId === "vocabulary" ? "blue" : question.sectionId === "grammar" ? "green" : "orange"}>
                                                {question.sectionId}
                                            </Tag>
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Paragraph className="mb-2">{question.question}</Paragraph>

                                            {question.type === "multiple-choice" && (
                                                <div>
                                                    <Text strong>Đáp án của bạn: </Text>
                                                    <Text className={isCorrect ? "text-green-600" : "text-red-600"}>
                                                        {question.options?.[userAnswer as number] || "Chưa trả lời"}
                                                    </Text>
                                                    {!isCorrect && (
                                                        <>
                                                            <br />
                                                            <Text strong>Đáp án đúng: </Text>
                                                            <Text className="text-green-600">
                                                                {question.options?.[question.correctAnswer as number]}
                                                            </Text>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {question.explanation && (
                                                <div className="mt-2 p-3 bg-blue-50 rounded">
                                                    <Text strong>Giải thích: </Text>
                                                    <Text>{question.explanation}</Text>
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            </Card>

            {/* Recommendations */}
            <Card title="Gợi ý học tập" className="mb-6">
                <div className="space-y-4">
                    {sectionResults
                        .filter(result => result.percentage < 70)
                        .map(result => (
                            <div key={result.section.id} className="p-4 bg-orange-50 rounded">
                                <Space>
                                    {getSectionIcon(result.section.id)}
                                    <div>
                                        <Text strong>{result.section.name}</Text>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Bạn cần cải thiện phần này. Hãy ôn tập lại các kiến thức cơ bản và làm thêm bài tập.
                                        </div>
                                    </div>
                                </Space>
                            </div>
                        ))}

                    {sectionResults.every(result => result.percentage >= 70) && (
                        <div className="p-4 bg-green-50 rounded text-center">
                            <CheckCircleOutlined className="text-2xl text-green-500 mb-2" />
                            <div>
                                <Text strong>Làm tốt lắm!</Text>
                                <div className="text-sm text-gray-600 mt-1">
                                    Bạn đã nắm vững kiến thức. Hãy thử các bài thi khó hơn để tiếp tục cải thiện.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default TestResults;
