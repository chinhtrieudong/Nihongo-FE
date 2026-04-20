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
  Spin,
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
import { jlptTestsAPI, testAttemptsAPI } from "../../services/api";
import { PageTitle, EmptyState } from "../../components/common";

const { Title, Text, Paragraph } = Typography;

interface TestAttempt {
  _id: string;
  userId: string;
  testId: string;
  testLevel: string;
  testTitle: string;
  duration: number;
  totalQuestions: number;
  status: "in_progress" | "completed" | "abandoned";
  startTime: string;
  endTime?: string;
  correctAnswers: number;
  score: number;
  sections: any[];
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: string;
  type: "multiple-choice" | "text-input" | "listening" | "reading";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  audioUrl?: string;
  readingText?: string;
  sectionId: string;
  level: string;
  difficulty: string;
}

const TestResults: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<any>(null);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sectionResults, setSectionResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!testId) return;

      try {
        setLoading(true);
        setError(null);

        // Get test info from backend
        const testResponse = await jlptTestsAPI.getTest("N5", testId);
        if (testResponse.success && testResponse.data) {
          setTest(testResponse.data);
        } else {
          throw new Error("Không thể tải thông tin bài thi");
        }

        // Get user attempts for this test
        const attemptsResponse = await testAttemptsAPI.getUserAttempts("completed", 1);
        if (attemptsResponse.success && attemptsResponse.data) {
          const testAttempt = attemptsResponse.data.find((a: TestAttempt) => a.testId === testId);
          if (testAttempt) {
            setAttempt(testAttempt);
          }
        }

      } catch (err) {
        console.error("Error fetching test results:", err);
        setError("Không thể tải kết quả bài thi");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId]);

  useEffect(() => {
    if (test && attempt) {
      // Use section results from the attempt if available
      if (attempt.sections && attempt.sections.length > 0) {
        setSectionResults(attempt.sections);
      } else if (test.sections) {
        // Calculate section results from test sections and attempt score
        const results = test.sections.map((section: any) => {
          const sectionQuestions = section.questions || 0;
          const sectionScore = (sectionQuestions / test.questions) * attempt.score;
          
          return {
            section,
            totalQuestions: sectionQuestions,
            correctAnswers: Math.round((sectionScore / 100) * sectionQuestions),
            percentage: sectionScore,
          };
        });
        setSectionResults(results);
      }
    }
  }, [test, attempt]);

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

  const formatDuration = (startTime: string, endTime?: string) => {
    const end = endTime ? new Date(endTime) : new Date();
    const start = new Date(startTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    return `${duration} phút`;
  };

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <Spin size="large" />
        <p className="mt-4 text-text-sub">Đang tải kết quả...</p>
      </div>
    );
  }

  if (error || !test || !attempt) {
    return (
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type="error"
          title="Không tìm thấy kết quả"
          description="Không tìm thấy kết quả bài thi bạn đang tìm kiếm."
          size="default"
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
