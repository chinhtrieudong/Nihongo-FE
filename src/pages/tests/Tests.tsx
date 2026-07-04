import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Tabs, Row, Col, Card, Spin, App as AntdApp } from "antd";
import { EmptyState } from "@components/common";
import {
  Play,
  Trophy,
  CheckCircle,
  Flame,
  Target
} from "lucide-react";
import { jlptTestsAPI, testAttemptsAPI } from "@services/api";
import TestCard from "@components/tests/TestCard";
import TestStatistics from "@components/tests/TestStatistics";
import StartTestModal from "@components/tests/StartTestModal";
import TestFilters from "@components/tests/TestFilters";
import RecentActivity from "@components/tests/RecentActivity";
import { useAppSelector } from "@store/hooks";
import type { Test, TestSection } from "../../types/tests";
import { getLevelColor, getDifficultyColor, getLevelFromDifficulty } from "../../types/tests";

const { Text } = Typography;

// Types imported from @types/tests

const Tests: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("available");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showStartModal, setShowStartModal] = useState<boolean>(false);
  const [jlptTests, setJlptTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [testStats, setTestStats] = useState<{ totalCompleted: number; averageScore: number }>({
    totalCompleted: 0,
    averageScore: 0,
  });
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);
  const { message } = AntdApp.useApp();

  // Fetch JLPT tests and user's test attempts from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const [testsResponse, attemptsResponse, statsResponse] = await Promise.all([
          jlptTestsAPI.getAllTests(),
          currentUser ? testAttemptsAPI.getUserAttempts() : Promise.resolve({ data: [] }),
          currentUser ? testAttemptsAPI.getStats() : Promise.resolve({ data: { totalCompleted: 0, averageScore: 0 } }),
        ]);

        if (testsResponse.success) {
          // Get completed test IDs from user attempts
          const completedAttempts: any[] = attemptsResponse.data || [];
          const completedTestMap = new Map(
            completedAttempts
              .filter((attempt: any) => attempt.status === "completed")
              .map((attempt: any) => [
                attempt.testId,
                { score: attempt.score, date: attempt.endTime || attempt.createdAt }
              ])
          );

          // Transform API data to match our Test interface
          const transformedTests = testsResponse.data.map((test: any, index: number) => {
            const completedInfo = completedTestMap.get(test.id || test._id || test.testId || test.slug || "");
            return {
              ...test,
              id: test.id || test._id || test.testId || test.slug || "",
              completed: !!completedInfo,
              score: completedInfo?.score,
              date: completedInfo?.date,
              difficulty: getLevelFromDifficulty(test.level)
            };
          });

          setJlptTests(transformedTests);

          // Update statistics
          if (statsResponse.data) {
            setTestStats({
              totalCompleted: statsResponse.data.totalCompleted || 0,
              averageScore: statsResponse.data.averageScore || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching JLPT tests:', error);
        message.error('Không thể tải danh sách bài thi');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [currentUser]);

  // Fetch recent activities from API
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!currentUser) return;

      try {
        // Fetch user stats which includes recent activity
        const response = await fetch(`/api/users/${currentUser?.id}/stats/dashboard`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.recentActivity) {
            // Transform API data to match RecentActivity component format
            const activities = data.data.recentActivity.map((activity: any) => {
              let icon = <Target className="w-4 h-4" />;
              let action = activity.title || 'Hoàn thành bài học';
              let score = activity.score ? `${activity.score}%` : undefined;

              // Determine icon based on activity type
              if (activity.type === 'test' || activity.type === 'jlpt') {
                icon = <Trophy className="w-4 h-4" />;
                action = activity.title || 'Hoàn thành bài thi JLPT';
              } else if (activity.type === 'vocabulary') {
                icon = <CheckCircle className="w-4 h-4" />;
                action = activity.title || 'Hoàn thành bài tập từ vựng';
              } else if (activity.type === 'streak') {
                icon = <Flame className="w-4 h-4" />;
                action = activity.title || 'Bắt đầu chuỗi học';
              } else if (activity.type === 'lesson') {
                icon = <Play className="w-4 h-4" />;
                action = activity.title || 'Bắt đầu bài học';
              }

              // Format time
              const activityDate = new Date(activity.date || activity.createdAt);
              const now = new Date();
              const diffMs = now.getTime() - activityDate.getTime();
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

              let time = '';
              if (diffHours < 1) {
                time = 'Vừa xong';
              } else if (diffHours < 24) {
                time = `${diffHours} giờ trước`;
              } else if (diffDays < 7) {
                time = `${diffDays} ngày trước`;
              } else {
                time = activityDate.toLocaleDateString('vi-VN');
              }

              return {
                action,
                time,
                score,
                icon
              };
            });

            setRecentActivities(activities.slice(0, 5)); // Limit to 5 activities
          }
        }
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        // Fallback to empty array on error
        setRecentActivities([]);
      }
    };

    fetchRecentActivities();
  }, [currentUser]);

  const completedTests = jlptTests.filter((test: Test) => test.completed);
  const availableTests = jlptTests.filter((test: Test) => !test.completed);

  // Use API statistics
  const totalTestsCompleted = testStats.totalCompleted;
  const averageScore = testStats.averageScore;

  const handleStartTest = (test: Test) => {
    setSelectedTest(test);
    setShowStartModal(true);
  };

  const confirmStartTest = async () => {
    if (selectedTest) {
      if (!selectedTest.id) {
        message.error("Bài thi này không có id hợp lệ để mở chi tiết.");
        setShowStartModal(false);
        return;
      }

      if (!currentUser) {
        message.error("Vui lòng đăng nhập để bắt đầu bài thi.");
        navigate("/login");
        return;
      }

      try {
        // Create test attempt via API
        const response = await testAttemptsAPI.createAttempt({
          testId: selectedTest.id,
          testLevel: selectedTest.level,
          testTitle: selectedTest.title,
          duration: selectedTest.duration,
          totalQuestions: selectedTest.questions,
          sections: selectedTest.sections?.map((s: TestSection) => ({
            sectionId: s.id,
            name: s.name,
            questions: s.questions,
          })),
        });

        if (response.success && response.data) {
          const attemptId = response.data._id;

          // Navigate to test page
          navigate(`/test/${selectedTest.id}?attempt=${attemptId}&level=${encodeURIComponent(selectedTest.level)}`);
          message.success(`Bắt đầu bài thi: ${selectedTest.title}`);
        } else {
          message.error("Không thể bắt đầu bài thi. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error creating test attempt:", error);
        message.error("Có lỗi xảy ra khi bắt đầu bài thi.");
      } finally {
        setShowStartModal(false);
        setSelectedTest(null);
      }
    }
  };

  const handleViewResults = (test: Test) => {
    // Navigate to results page
    navigate(`/test-results/${test.id}`);
  };


  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-3">
            Thi JLPT
          </h1>
          <p className="text-text-sub text-lg">
            Luyện tập và kiểm tra trình độ Nhật ngữ JLPT
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <TestStatistics
            totalTestsCompleted={totalTestsCompleted}
            averageScore={averageScore}
          />
        </div>

        {/* Filter Tabs */}
        <Card className="overflow-hidden bg-surface-1 border-border mb-8">
          {/* Filter bar — above tabs on all sizes */}
          <div className="px-4 pt-3 pb-0">
            <TestFilters
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
              availableCount={availableTests.length}
              completedCount={completedTests.length}
            />
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "available",
                label: `Có sẵn (${availableTests.length})`,
                children: (
                  <>
                    <Row gutter={[16, 16]}>
                      {availableTests.map((test, idx) => (
                        <Col
                          xs={24}
                          md={12}
                          lg={8}
                          key={test.id || `available-${test.level || "UNK"}-${idx}-${Math.random().toString(36).substr(2, 5)}`}
                        >
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
                      <EmptyState
                        type="search"
                        title="Không có bài thi"
                        description="Không có bài thi nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi bộ lọc!"
                        size="default"
                      />
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
                      {completedTests.map((test, idx) => (
                        <Col
                          xs={24}
                          md={12}
                          lg={8}
                          key={test.id || `completed-${test.level || "UNK"}-${idx}-${Math.random().toString(36).substr(2, 5)}`}
                        >
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
                      <EmptyState
                        type="data"
                        title="Chưa có bài thi hoàn thành"
                        description="Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu làm bài thi ngay!"
                        size="default"
                      />
                    )}
                  </>
                )
              }
            ]}
          />
        </Card>

        {/* Recent Activity */}
        <div className="mb-8">
          <RecentActivity activities={recentActivities.length > 0 ? recentActivities : [
            { action: "Chưa có hoạt động gần đây", time: "", icon: <Target className="w-4 h-4" /> }
          ]} />
        </div>

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
    </div >
  );
};

export default Tests;