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

const { Text } = Typography;

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
    <div className="min-h-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#d5dfef] bg-[#d6e4f8] bg-[linear-gradient(to_right,rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:24px_24px] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="inline-flex items-center justify-center text-secondary-700 dark:text-secondary-400 shrink-0">
              <AimOutlined className="text-[34px] sm:text-[40px]" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-semibold leading-tight text-[#2a2f3f] truncate">
                Thi JLPT
              </h1>
              <p className="mt-1 text-sm sm:text-lg text-[#2c3853]">
                Luyện tập và kiểm tra trình độ Nhật ngữ JLPT
              </p>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end rounded-xl border border-white/60 bg-white/55 px-3 py-2 text-[#2c3853]">
            <span className="text-xs uppercase tracking-wide">Đã hoàn thành</span>
            <span className="text-lg font-semibold">{totalTestsCompleted} bài</span>
            <span className="text-xs">Điểm TB: {averageScore}%</span>
          </div>
        </div>
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
