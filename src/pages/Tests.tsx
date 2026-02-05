import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Tabs, Row, Col, Card, message } from "antd";
import {
  PlayCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  FireOutlined,
  AimOutlined
} from "@ant-design/icons";
import { jlptTests, type Test } from "../data/jlptTests";
import TestCard from "../components/tests/TestCard";
import TestStatistics from "../components/tests/TestStatistics";
import StartTestModal from "../components/tests/StartTestModal";
import TestFilters from "../components/tests/TestFilters";
import RecentActivity from "../components/tests/RecentActivity";

const { Title, Text } = Typography;

interface TestAttempt {
  id: string;
  testId: string;
  startTime: Date;
  endTime?: Date;
  answers: Record<string, string | number>;
  score?: number;
  completed: boolean;
}

const Tests: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("available");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showStartModal, setShowStartModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const filteredTests = selectedLevel === "all"
    ? jlptTests
    : jlptTests.filter(test => test.level === selectedLevel);

  const completedTests = jlptTests.filter(test => test.completed);
  const availableTests = jlptTests.filter(test => !test.completed);

  // Calculate statistics
  const totalTestsCompleted = completedTests.length;
  const averageScore = totalTestsCompleted > 0
    ? Math.round(completedTests.reduce((acc, test) => acc + (test.score || 0), 0) / totalTestsCompleted)
    : 0;
  // Get recent test attempts from localStorage
  const getRecentAttempts = (): TestAttempt[] => {
    const attempts: TestAttempt[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('attempt_')) {
        const attempt = JSON.parse(localStorage.getItem(key) || '{}');
        attempts.push(attempt);
      }
    }
    return attempts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 10);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "green";
      case "Elementary": return "blue";
      case "Intermediate": return "orange";
      case "Advanced": return "red";
      default: return "default";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "N5": return "#52c41a";
      case "N4": return "#1890ff";
      case "N3": return "#fa8c16";
      case "N2": return "#f5222d";
      case "N1": return "#722ed1";
      default: return "default";
    }
  };

  const handleStartTest = (test: Test) => {
    setSelectedTest(test);
    setShowStartModal(true);
  };

  const confirmStartTest = () => {
    if (selectedTest) {
      // Create a new test attempt
      const attemptId = `attempt_${Date.now()}`;
      const startTime = new Date();

      // Store test attempt in localStorage (in real app, this would be in backend)
      const attempt: TestAttempt = {
        id: attemptId,
        testId: selectedTest.id,
        startTime,
        answers: {},
        completed: false
      };

      localStorage.setItem(attemptId, JSON.stringify(attempt));

      // Navigate to test page
      navigate(`/test/${selectedTest.id}?attempt=${attemptId}`);

      message.success(`Bắt đầu bài thi: ${selectedTest.title}`);
      setShowStartModal(false);
      setSelectedTest(null);
    }
  };

  const handleViewResults = (test: Test) => {
    // Navigate to results page
    navigate(`/test-results/${test.id}`);
  };


  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-secondary-50 dark:bg-secondary-950 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Title level={2} className="!mb-1 text-lg sm:text-2xl !text-secondary-900 dark:!text-secondary-100">
            <AimOutlined className="mr-2 text-secondary-700 dark:text-secondary-400" />
            Thi JLPT
          </Title>
          <Text className="text-sm !text-secondary-700 dark:!text-secondary-400">
            Luyện tập và kiểm tra trình độ Nhật ngữ JLPT
          </Text>
        </div>
        <div />
      </div>

      {/* Statistics */}
      <TestStatistics
        totalTestsCompleted={totalTestsCompleted}
        averageScore={averageScore}
      />

      {/* Filter Tabs */}
      <Card className="overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={{
            right: (
              <TestFilters
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                availableCount={availableTests.length}
                completedCount={completedTests.length}
              />
            )
          }}
          items={[
            {
              key: "available",
              label: `Có sẵn (${availableTests.length})`,
              children: (
                <>
                  <Row gutter={[16, 16]}>
                    {availableTests.map(test => (
                      <Col xs={24} md={12} lg={8} key={test.id}>
                        <TestCard
                          test={test}
                          onStartTest={handleStartTest}
                          onViewResults={handleViewResults}
                          getLevelColor={getLevelColor}
                          getDifficultyColor={getDifficultyColor}
                        />
                      </Col>
                    ))}
                  </Row>
                  {availableTests.length === 0 && (
                    <div className="text-center py-8">
                      <Text type="secondary">Không có bài thi nào phù hợp với bộ lọc</Text>
                    </div>
                  )}
                </>
              )
            },
            {
              key: "completed",
              label: `Đã hoàn thành (${completedTests.length})`,
              children: (
                <>
                  <Row gutter={[16, 16]}>
                    {completedTests.map(test => (
                      <Col xs={24} md={12} lg={8} key={test.id}>
                        <TestCard
                          test={test}
                          onStartTest={handleStartTest}
                          onViewResults={handleViewResults}
                          getLevelColor={getLevelColor}
                          getDifficultyColor={getDifficultyColor}
                        />
                      </Col>
                    ))}
                  </Row>
                  {completedTests.length === 0 && (
                    <div className="text-center py-8">
                      <Text type="secondary">Bạn chưa hoàn thành bài thi nào</Text>
                    </div>
                  )}
                </>
              )
            }
          ]}
        />
      </Card>

      {/* Recent Activity */}
      <RecentActivity activities={[
        { action: "Hoàn thành bài thi JLPT N5", time: "2 giờ trước", score: "85%", icon: <TrophyOutlined /> },
        { action: "Bắt đầu bài thi JLPT N4", time: "1 ngày trước", icon: <PlayCircleOutlined /> },
        { action: "Hoàn thành bài tập từ vựng", time: "2 ngày trước", score: "92%", icon: <CheckCircleOutlined /> },
        { action: "Bắt đầu chuỗi học 7 ngày", time: "7 ngày trước", icon: <FireOutlined /> }
      ]} />

      {/* Start Test Modal */}
      <StartTestModal
        visible={showStartModal}
        test={selectedTest}
        onConfirm={confirmStartTest}
        onCancel={() => {
          setShowStartModal(false);
          setSelectedTest(null);
        }}
      />
    </div>
  );
};

export default Tests;
