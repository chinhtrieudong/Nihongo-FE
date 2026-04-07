import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Tabs, Row, Col, Card, message, Spin } from "antd";
import {
  Play,
  Trophy,
  CheckCircle,
  Flame,
  Target
} from "lucide-react";
import { jlptTestsAPI } from "../../services/api";
import TestCard from "../../components/tests/TestCard";
import TestStatistics from "../../components/tests/TestStatistics";
import StartTestModal from "../../components/tests/StartTestModal";
import TestFilters from "../../components/tests/TestFilters";
import RecentActivity from "../../components/tests/RecentActivity";
import { useAppSelector } from "../../store/hooks";

const { Text } = Typography;

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
  title_vi?: string;
  description: string;
  description_vi?: string;
  duration: number;
  questions: number;
  difficulty: string;
  completed: boolean;
  score?: number;
  date?: string;
  sections: TestSection[];
  passing_score?: number;
  is_active?: boolean;
  version?: number;
}

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
  const [jlptTests, setJlptTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);

  // Fetch JLPT tests from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await jlptTestsAPI.getAllTests();
        if (response.success) {
          // Transform API data to match our Test interface
          const transformedTests = response.data.map((test: any, index: number) => ({
            ...test,
            id: test.id || `test_${index}`,
            completed: false, // Default to not completed
            score: undefined,
            date: undefined,
            difficulty: test.level === 'N5' ? 'Beginner' :
              test.level === 'N4' ? 'Elementary' :
                test.level === 'N3' ? 'Intermediate' :
                  test.level === 'N2' ? 'Advanced' : 'Expert'
          }));
          setJlptTests(transformedTests);
        }
      } catch (error) {
        console.error('Error fetching JLPT tests:', error);
        message.error('Không thể tải danh sách bài thi');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

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

  // Calculate statistics
  const totalTestsCompleted = completedTests.length;
  const averageScore = totalTestsCompleted > 0
    ? Math.round(completedTests.reduce((acc, test) => acc + (test.score || 0), 0) / totalTestsCompleted)
    : 0;
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
      case "N5": return "var(--success)";
      case "N4": return "var(--info)";
      case "N3": return "var(--warning)";
      case "N2": return "var(--error)";
      case "N1": return "var(--primary)";
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
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
        <Card className="overflow-hidden bg-surface-1 border-border">
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
        <RecentActivity activities={recentActivities.length > 0 ? recentActivities : [
          { action: "Chưa có hoạt động gần đây", time: "", icon: <Target className="w-4 h-4" /> }
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
    </div >
  );
};

export default Tests;