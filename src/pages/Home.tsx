
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Tag, Card, Row, Col } from "antd";
import { 
  RightOutlined, 
  BookOutlined,
  ExperimentOutlined,
  SoundOutlined,
  MessageOutlined,
  AimOutlined,
  ReadOutlined,
  TranslationOutlined,
  BulbOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { useAppSelector } from "../store/hooks";

interface Textbook {
  id: string;
  name: string;
  nameJp: string;
  description: string;
  level: string;
  totalLessons: number;
  color: string;
}

const textbooks: Textbook[] = [
  {
    id: "minna_no_nihongo",
    name: "Minna no Nihongo",
    nameJp: "みんなの日本語",
    description: "Giáo trình phổ biến nhất cho người mới bắt đầu",
    level: "N5 - N4",
    totalLessons: 50,
    color: "#3B82F6"
  },
  {
    id: "genki",
    name: "Genki",
    nameJp: "げんき",
    description: "Giáo trình tiếng Nhật hiện đại, dễ hiểu",
    level: "N5 - N4",
    totalLessons: 23,
    color: "#10B981"
  },
  {
    id: "shin_nihongo",
    name: "Shin Nihongo no Kiso",
    nameJp: "新日本語の基礎",
    description: "Giáo trình cơ bản với ngữ pháp hệ thống",
    level: "N5 - N4",
    totalLessons: 50,
    color: "#F59E0B"
  },
  {
    id: "irodori",
    name: "Irodori",
    nameJp: "いろどり",
    description: "Giáo trình tiếng Nhật cho cuộc sống hàng ngày",
    level: "N5 - N4",
    totalLessons: 18,
    color: "#EF4444"
  },
  {
    id: "nihongo_sou_matome",
    name: "Nihongo Sou Matome",
    nameJp: "日本語総まとめ",
    description: "Ôn tập JLPT hiệu quả",
    level: "N3 - N1",
    totalLessons: 42,
    color: "#8B5CF6"
  }
];

const Home: React.FC = () => {
  const { darkMode } = useAppSelector((state) => state.ui);
  const navigate = useNavigate();

  const handleTextbookClick = (textbook: Textbook) => {
    navigate(`/lessons?textbook=${textbook.id}`);
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-secondary-900 academic-canvas">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-secondary-100 mb-3">
            Học Tiếng Nhật
          </h1>
          <p className="text-gray-600 dark:text-secondary-400 text-lg">
            Chọn giáo trình phù hợp với trình độ của bạn
          </p>
        </div>

        {/* Textbooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {textbooks.map((textbook) => (
            <div
              key={textbook.id}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-secondary-700"
            >
              {/* Header with color */}
              <div 
                className="h-2"
                style={{ backgroundColor: textbook.color }}
              />
              
              <div className="p-6">
                {/* Title */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-secondary-100 mb-1">
                    {textbook.name}
                  </h3>
                  <p className="text-gray-500 dark:text-secondary-400 text-sm">
                    {textbook.nameJp}
                  </p>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 dark:text-secondary-300 text-sm mb-4">
                  {textbook.description}
                </p>
                
                {/* Meta info */}
                <div className="flex items-center justify-between mb-5">
                  <Tag color={textbook.color}>
                    {textbook.level}
                  </Tag>
                  <span className="text-sm text-gray-500 dark:text-secondary-400">
                    {textbook.totalLessons} bài học
                  </span>
                </div>
                
                {/* Button */}
                <Button
                  type="primary"
                  block
                  className="flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: textbook.color, 
                    borderColor: textbook.color,
                    height: '44px'
                  }}
                  onClick={() => handleTextbookClick(textbook)}
                >
                  <BookOutlined />
                  Bắt đầu học
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Grid Section */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-secondary-100 mb-6 text-center">
            Học thuật
          </h2>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={6}>
              <Card 
                hoverable 
                className="text-center cursor-pointer bg-white border-gray-200 dark:bg-secondary-800 dark:border-secondary-700"
                onClick={() => navigate('/grammar')}
              >
                <ExperimentOutlined className="text-3xl text-blue-500 mb-3" />
                <div className="text-sm font-medium text-gray-900 dark:text-secondary-100">Ngữ pháp</div>
                <div className="text-xs text-gray-500 dark:text-secondary-400 mt-1">Grammar</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card 
                hoverable 
                className="text-center cursor-pointer bg-white border-gray-200 dark:bg-secondary-800 dark:border-secondary-700"
                onClick={() => navigate('/kanji')}
              >
                <TranslationOutlined className="text-3xl text-red-500 mb-3" />
                <div className="text-sm font-medium text-gray-900 dark:text-secondary-100">Hán tự</div>
                <div className="text-xs text-gray-500 dark:text-secondary-400 mt-1">Kanji</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card 
                hoverable 
                className="text-center cursor-pointer bg-white border-gray-200 dark:bg-secondary-800 dark:border-secondary-700"
                onClick={() => navigate('/pronunciation')}
              >
                <SoundOutlined className="text-3xl text-green-500 mb-3" />
                <div className="text-sm font-medium text-gray-900 dark:text-secondary-100">Phát âm</div>
                <div className="text-xs text-gray-500 dark:text-secondary-400 mt-1">Pronunciation</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card 
                hoverable 
                className="text-center cursor-pointer bg-white border-gray-200 dark:bg-secondary-800 dark:border-secondary-700"
                onClick={() => navigate('/conversation')}
              >
                <MessageOutlined className="text-3xl text-purple-500 mb-3" />
                <div className="text-sm font-medium text-gray-900 dark:text-secondary-100">Hội thoại</div>
                <div className="text-xs text-gray-500 dark:text-secondary-400 mt-1">Conversation</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card 
                hoverable 
                className="text-center cursor-pointer bg-white border-gray-200 dark:bg-secondary-800 dark:border-secondary-700"
                onClick={() => navigate('/vocabulary')}
              >
                <ReadOutlined className="text-3xl text-orange-500 mb-3" />
                <div className="text-sm font-medium text-gray-900 dark:text-secondary-100">Từ vựng</div>
                <div className="text-xs text-gray-500 dark:text-secondary-400 mt-1">Vocabulary</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card 
                hoverable 
                className="text-center cursor-pointer bg-white border-gray-200 dark:bg-secondary-800 dark:border-secondary-700"
                onClick={() => navigate('/tests')}
              >
                <AimOutlined className="text-3xl text-yellow-500 mb-3" />
                <div className="text-sm font-medium text-gray-900 dark:text-secondary-100">Thi JLPT</div>
                <div className="text-xs text-gray-500 dark:text-secondary-400 mt-1">JLPT Test</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card 
                hoverable 
                className="text-center cursor-pointer bg-white border-gray-200 dark:bg-secondary-800 dark:border-secondary-700"
              >
                <BulbOutlined className="text-3xl text-cyan-500 mb-3" />
                <div className="text-sm font-medium text-gray-900 dark:text-secondary-100">Mẹo học</div>
                <div className="text-xs text-gray-500 dark:text-secondary-400 mt-1">Study Tips</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card 
                hoverable 
                className="text-center cursor-pointer bg-white border-gray-200 dark:bg-secondary-800 dark:border-secondary-700"
              >
                <TrophyOutlined className="text-3xl text-pink-500 mb-3" />
                <div className="text-sm font-medium text-gray-900 dark:text-secondary-100">Thành tích</div>
                <div className="text-xs text-gray-500 dark:text-secondary-400 mt-1">Achievements</div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white dark:bg-secondary-800 rounded-xl p-8 border border-gray-200 dark:border-secondary-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-secondary-100 mb-6 text-center">
            Thống kê học tập
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</div>
              <div className="text-sm text-gray-600 dark:text-secondary-400 mt-1">Giáo trình</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">183</div>
              <div className="text-sm text-gray-600 dark:text-secondary-400 mt-1">Bài học</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">5</div>
              <div className="text-sm text-gray-600 dark:text-secondary-400 mt-1">Cấp độ JLPT</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">∞</div>
              <div className="text-sm text-gray-600 dark:text-secondary-400 mt-1">Thời gian học</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;