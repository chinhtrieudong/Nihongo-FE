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
  Statistic,
  List,
} from "antd";
import {
  Trophy,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Book,
  FileText,
  Mic,
  Languages,
} from "lucide-react";
import { jlptTests, type Test } from "../../data/jlptTests";
import { sampleQuestions, type Question } from "../../data/sampleQuestions";
import { PageTitle, EmptyState } from "../../components/common";

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
      const foundTest = jlptTests.find((t) => t.id === testId);
      if (foundTest) {
        setTest(foundTest);

        // Get questions for this test
        const testQuestions = sampleQuestions
          .filter(
            (q) =>
              q.level === foundTest.level &&
              foundTest.sections.some((section) => section.id === q.sectionId),
          )
          .slice(0, foundTest.questions);
        setQuestions(testQuestions);

        // Find the most recent attempt for this test
        let foundAttempt: TestAttempt | null = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("attempt_")) {
            const attemptData = localStorage.getItem(key);
            if (attemptData) {
              const parsedAttempt: TestAttempt = JSON.parse(attemptData);
              if (parsedAttempt.testId === testId && parsedAttempt.completed) {
                foundAttempt = parsedAttempt;
                break;
              }
            }
          }
        }

        if (foundAttempt) {
          setAttempt(foundAttempt);
        } else {
          // Create a mock attempt so the page can render even without stored results
          const answers: Record<string, string | number> = {};
          const desiredScore = 78;
          const correctCount = Math.round(
            (desiredScore / 100) * testQuestions.length,
          );

          testQuestions.forEach((q, index) => {
            if (index < correctCount) {
              answers[q.id] = q.correctAnswer;
            } else {
              if (
                q.type === "multiple-choice" &&
                q.options &&
                q.options.length > 1
              ) {
                const next = (Number(q.correctAnswer) + 1) % q.options.length;
                answers[q.id] = next;
              } else {
                answers[q.id] = q.correctAnswer;
              }
            }
          });

          const now = new Date();
          setAttempt({
            id: `demo_${testId}`,
            testId,
            startTime: new Date(now.getTime() - 30 * 60 * 1000),
            endTime: now,
            answers,
            score: desiredScore,
            completed: true,
          });
        }
      }
    }
  }, [testId]);

  useEffect(() => {
    if (test && attempt && questions.length > 0) {
      // Calculate section results
      const results = test.sections.map((section) => {
        const sectionQuestions = questions.filter(
          (q) => q.sectionId === section.id,
        );
        const correctAnswers = sectionQuestions.filter(
          (q) => attempt.answers[q.id] === q.correctAnswer,
        ).length;

        return {
          section,
          totalQuestions: sectionQuestions.length,
          correctAnswers,
          percentage:
            sectionQuestions.length > 0
              ? Math.round((correctAnswers / sectionQuestions.length) * 100)
              : 0,
        };
      });

      setSectionResults(results);
    }
  }, [test, attempt, questions]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "var(--success)";
    if (score >= 60) return "var(--warning)";
    return "var(--error)";
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "vocabulary":
        return <Book className="w-4 h-4" />;
      case "grammar":
        return <FileText className="w-4 h-4" />;
      case "reading":
        return <FileText className="w-4 h-4" />;
      case "listening":
        return <Mic className="w-4 h-4" />;
      case "kanji":
        return <Languages className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type="error"
          title="Không tìm thấy kết quả"
          description="Không tìm thấy kết quả bài thi bạn đang tìm kiếm."
          action={{
            label: "Quay lại danh sách",
            onClick: () => navigate("/tests"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full w-full">
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <style>
          {`
                      .test-results-list .ant-list-item {
                        padding: 12px 16px !important;
                      }
                    `}
        </style>
        {/* Header */}
        <div className="mb-6">
          <PageTitle
            title="Kết quả bài thi"
            subtitle={test.title}
            extra={
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <Button
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => navigate("/tests")}
                  className="flex-1 sm:w-auto"
                >
                  Quay lại danh sách
                </Button>
                <Button
                  type="primary"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => navigate(`/test/${testId}`)}
                  className="flex-1 sm:w-auto"
                >
                  Làm lại bài thi
                </Button>
              </div>
            }
          />
        </div>

        {/* Overall Score */}
        <Card className="mb-6 text-center">
          <Trophy
            className="w-10 h-10 sm:w-16 sm:h-16 mb-3 sm:mb-4"
            style={{ color: getScoreColor(attempt.score || 0) }}
          />
          <Title
            level={1}
            className="!mb-2"
            style={{ color: getScoreColor(attempt.score || 0) }}
          >
            {attempt.score}%
          </Title>
          <Paragraph className="text-sm sm:text-lg">
            {getPerformanceMessage(attempt.score || 0)}
          </Paragraph>
          <Divider />
          <Row justify="center" gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Statistic title="Tổng số câu" value={test.questions} />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="Câu đúng"
                value={Math.round(
                  ((attempt.score || 0) * test.questions) / 100,
                )}
                suffix={`/${test.questions}`}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Thời gian làm bài"
                value={formatDuration(attempt.startTime, attempt.endTime)}
              />
            </Col>
          </Row>
        </Card>

        {/* Section Results */}
        <Card title="Kết quả theo phần thi" className="mb-6">
          <Row gutter={[16, 16]}>
            {sectionResults.map((result) => (
              <Col xs={24} sm={12} key={result.section.id}>
                <Card size="small" className="h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg">
                      {getSectionIcon(result.section.id)}
                    </div>
                    <Text strong>{result.section.name}</Text>
                    <Tag color="blue" className="ml-auto">
                      {result.section.questions} câu
                    </Tag>
                  </div>
                  <Progress
                    percent={result.percentage}
                    size="small"
                    strokeColor={getScoreColor(result.percentage)}
                    className="mb-1"
                    showInfo={false}
                  />
                  <Text type="secondary">
                    Đúng {result.correctAnswers}/{result.totalQuestions} câu (
                    {result.percentage}%)
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Detailed Answers */}
        <Card title="Chi tiết câu trả lời" className="mb-6">
          <List
            dataSource={questions}
            className="test-results-list"
            renderItem={(question, index) => {
              const userAnswer = attempt.answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              const isFirst = index === 0;
              const isLast = index === questions.length - 1;
              const roundClass = isFirst
                ? "rounded-t-lg"
                : isLast
                  ? "rounded-b-lg"
                  : "";

              return (
                <List.Item
                  className={`px-4 py-3 test-results-item ${roundClass} ${isCorrect
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                    }`}
                >
                  <List.Item.Meta
                    avatar={
                      isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )
                    }
                    title={
                      <Space>
                        <Text strong>Câu {index + 1}</Text>
                        <Tag
                          color={
                            question.sectionId === "vocabulary"
                              ? "blue"
                              : question.sectionId === "grammar"
                                ? "green"
                                : "orange"
                          }
                        >
                          {question.sectionId}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph className="mb-2">
                          {question.question}
                        </Paragraph>

                        {question.type === "multiple-choice" && (
                          <div>
                            <Text strong>Đáp án của bạn: </Text>
                            <Text
                              className={
                                isCorrect ? "text-green-600" : "text-red-600"
                              }
                            >
                              {question.options?.[userAnswer as number] ||
                                "Chưa trả lời"}
                            </Text>
                            {!isCorrect && (
                              <>
                                <br />
                                <Text strong>Đáp án đúng: </Text>
                                <Text className="text-green-600">
                                  {
                                    question.options?.[
                                    question.correctAnswer as number
                                    ]
                                  }
                                </Text>
                              </>
                            )}
                          </div>
                        )}

                        {question.explanation && (
                          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
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
              .filter((result) => result.percentage < 70)
              .map((result) => (
                <div
                  key={result.section.id}
                  className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded"
                >
                  <Space>
                    {getSectionIcon(result.section.id)}
                    <div>
                      <Text strong>{result.section.name}</Text>
                      <div className="text-sm text-gray-600 mt-1">
                        Bạn cần cải thiện phần này. Hãy ôn tập lại các kiến thức
                        cơ bản và làm thêm bài tập.
                      </div>
                    </div>
                  </Space>
                </div>
              ))}

            {sectionResults.every((result) => result.percentage >= 70) && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                <div>
                  <Text strong>Làm tốt lắm!</Text>
                  <div className="text-sm text-gray-600 mt-1">
                    Bạn đã nắm vững kiến thức. Hãy thử các bài thi khó hơn để
                    tiếp tục cải thiện.
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestResults;
