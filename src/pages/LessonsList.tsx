import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { lessonAPI } from "../services/api";
import type { LessonsResponse, Lesson } from "../types/lesson";
import { Card, Input, Button, Tag, Spin, Empty, Typography, Progress, Avatar } from "antd";
import { BookOutlined, SearchOutlined, PlayCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const LessonsList: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: LessonsResponse = await lessonAPI.getLessons(
        currentUser?.id,
        undefined,
        50,
        0
      );

      if (response.success && response.data) {
        setLessons(response.data.lessons);
      } else {
        setError("Failed to load lessons");
      }
    } catch (err) {
      setError("Error loading lessons");
      console.error("Failed to load lessons:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✔";
      case "in_progress":
        return "🔄";
      default:
        return "⏳";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "in_progress":
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã xong";
      case "in_progress":
        return "Đang học";
      default:
        return "Chưa học";
    }
  };

  const getMainGrammar = (lessonNumber: number) => {
    const grammarPatterns = [
      "〜です", "〜ます", "〜の", "〜を", "〜へ", "〜で", "〜と", "〜から", "〜まで",
      "〜が", "〜も", "〜と", "〜か", "〜ね", "〜よ", "〜ましょう", "〜ましょうか",
      "〜ています", "〜てあります", "〜てください", "〜てもいいです", "〜なくてもいいです",
      "〜ことができます", "〜ことがあります", "〜前に", "〜後で", "〜時", "〜たら",
      "〜ば", "〜なら", "〜と", "〜う/よう", "〜そうです", "〜ようです", "〜すぎます",
      "〜やすい", "〜にくい", "〜お〜します", "〜ご〜します", "〜なさい"
    ];

    const index = (lessonNumber - 1) % grammarPatterns.length;
    return grammarPatterns[index];
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = searchQuery === '' ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `bài ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase()) ||
      `lesson ${lesson.lessonNumber}`.includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleLessonClick = (lesson: any) => {
    // Debug: Log the actual lesson data to see what we're working with
    console.log('Lesson clicked:', lesson);
    console.log('Lesson ID:', lesson.id);
    console.log('Lesson Number:', lesson.lessonNumber);

    // Use the actual MongoDB ObjectId from the API response
    navigate(`/lessons/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Title level={2} className="text-center mb-6">
        📘 GIÁO TRÌNH: MINNA NO NIHONGO
      </Title>
      <Text className="text-center text-gray-600">
        Tổng cộng: 50 bài (Lesson 1 → Lesson 50)
      </Text>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Search Bar */}
        <Input
          placeholder="Tìm kiếm bài học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined />}
          size="large"
          className="mb-6"
        />

        {/* Minna no Nihongo I */}
        <Card
          title="Minna no Nihongo I"
          className="mb-6"
          extra={
            <Tag color="blue" icon={<BookOutlined />}>
              25 bài đầu
            </Tag>
          }
        >
          <div className="space-y-2">
            {filteredLessons.slice(0, 25).map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson)}
                className="cursor-pointer hover:bg-gray-50 p-4 border border-gray-200 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Avatar
                    size="large"
                    className={getStatusColor(lesson.status)}
                  >
                    {getStatusIcon(lesson.status)}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">
                      Bài {lesson.lessonNumber}: {lesson.title}
                    </div>
                    <div className="text-gray-600">
                      {lesson.description}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Tag color={lesson.status === 'completed' ? 'green' : 'blue'}>
                        {lesson.level}
                      </Tag>
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLessonClick(lesson);
                  }}
                >
                  Bắt đầu
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Minna no Nihongo II */}
        <Card
          title="Minna no Nihongo II"
          className="mb-6"
          extra={
            <Tag color="purple" icon={<BookOutlined />}>
              25 bài tiếp theo
            </Tag>
          }
        >
          <div className="space-y-2">
            {filteredLessons.slice(25).map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson)}
                className="cursor-pointer hover:bg-gray-50 p-4 border border-gray-200 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Avatar
                    size="large"
                    className={getStatusColor(lesson.status)}
                  >
                    {getStatusIcon(lesson.status)}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">
                      Bài {lesson.lessonNumber}: {lesson.title}
                    </div>
                    <div className="text-gray-600">
                      {lesson.description}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Tag color={lesson.status === 'completed' ? 'green' : 'purple'}>
                        {lesson.level}
                      </Tag>
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLessonClick(lesson);
                  }}
                >
                  Bắt đầu
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LessonsList;
