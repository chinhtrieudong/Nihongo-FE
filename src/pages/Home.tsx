
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Tag, Card, Row, Col } from "antd";
import { Icon } from "@iconify/react";
import {
  ChevronRight,
  BookOpen,
} from "lucide-react";
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
    totalLessons: 25,
    color: "var(--primary)"
  },
  {
    id: "tango_no_nihongo",
    name: "Tango no Nihongo",
    nameJp: "たんごのにほんご",
    description: "Từ vựng theo chủ đề, học qua bài hát",
    level: "N5 - N4",
    totalLessons: 13,
    color: "var(--secondary)"
  }
];

const Home: React.FC = () => {
  const { darkMode } = useAppSelector((state) => state.ui);
  const navigate = useNavigate();

  const handleTextbookClick = (textbook: Textbook) => {
    navigate(`/lessons?textbook=${textbook.id}`);
  };

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-3">
            Học Tiếng Nhật
          </h1>
          <p className="text-text-sub text-lg">
            Chọn giáo trình phù hợp với trình độ của bạn
          </p>
        </div>

        {/* Textbooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {textbooks.map((textbook) => (
            <div
              key={textbook.id}
              className="bg-card rounded-2xl shadow-sm hover:bg-hover-bg transition-all duration-200 overflow-hidden border border-border"
            >
              {/* Header with color */}
              <div
                className="h-2"
                style={{ backgroundColor: textbook.color }}
              />

              <div className="p-6">
                {/* Title */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-text-main mb-1">
                    {textbook.name}
                  </h3>
                  <p className="text-text-sub text-sm">
                    {textbook.nameJp}
                  </p>
                </div>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-4">
                  {textbook.description}
                </p>

                {/* Meta info */}
                <div className="flex items-center justify-between mb-5">
                  <Tag color={textbook.color}>
                    {textbook.level}
                  </Tag>
                  <span className="text-sm text-text-sub">
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
                  <BookOpen className="w-4 h-4" />
                  Bắt đầu học
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Grid Section */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-text-main mb-6 text-center">
            Học thuật
          </h2>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="text-center cursor-pointer bg-card border-border"
                onClick={() => navigate('/grammar')}
              >
                <Icon icon="mdi:flask-outline" className="w-8 h-8 text-blue-500 mb-3" width={32} height={32} />
                <div className="text-sm font-medium text-text-main">Ngữ pháp</div>
                <div className="text-xs text-text-sub mt-1">Grammar</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="text-center cursor-pointer bg-card border-border"
                onClick={() => navigate('/kanji')}
              >
                <Icon icon="mdi:kanji" className="w-8 h-8 text-red-500 mb-3" width={32} height={32} />
                <div className="text-sm font-medium text-text-main">Hán tự</div>
                <div className="text-xs text-text-sub mt-1">Kanji</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="text-center cursor-pointer bg-card border-border"
                onClick={() => navigate('/pronunciation')}
              >
                <Icon icon="mdi:volume-high" className="w-8 h-8 text-green-500 mb-3" width={32} height={32} />
                <div className="text-sm font-medium text-text-main">Phát âm</div>
                <div className="text-xs text-text-sub mt-1">Pronunciation</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="text-center cursor-pointer bg-card border-border"
                onClick={() => navigate('/conversation')}
              >
                <Icon icon="mdi:message-text-outline" className="w-8 h-8 text-purple-500 mb-3" width={32} height={32} />
                <div className="text-sm font-medium text-text-main">Hội thoại</div>
                <div className="text-xs text-text-sub mt-1">Conversation</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="text-center cursor-pointer bg-card border-border"
                onClick={() => navigate('/vocabulary')}
              >
                <Icon icon="mdi:book-open-variant" className="w-8 h-8 text-orange-500 mb-3" width={32} height={32} />
                <div className="text-sm font-medium text-text-main">Từ vựng</div>
                <div className="text-xs text-text-sub mt-1">Vocabulary</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="text-center cursor-pointer bg-card border-border"
                onClick={() => navigate('/tests')}
              >
                <Icon icon="mdi:target" className="w-8 h-8 text-yellow-500 mb-3" width={32} height={32} />
                <div className="text-sm font-medium text-text-main">Thi JLPT</div>
                <div className="text-xs text-text-sub mt-1">JLPT Test</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="text-center cursor-pointer bg-card border-border"
                onClick={() => navigate('/flashcard')}
              >
                <Icon icon="solar:card-outline" className="w-8 h-8 text-cyan-500 mb-3" width={32} height={32} />
                <div className="text-sm font-medium text-text-main">Flashcard</div>
                <div className="text-xs text-text-sub mt-1">Flashcard</div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card
                hoverable
                className="text-center cursor-pointer bg-card border-border"
              >
                <Icon icon="mdi:trophy-outline" className="w-8 h-8 text-pink-500 mb-3" width={32} height={32} />
                <div className="text-sm font-medium text-text-main">Thành tích</div>
                <div className="text-xs text-text-sub mt-1">Achievements</div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-card rounded-xl p-8 border border-border">
          <h2 className="text-xl font-semibold text-text-main mb-6 text-center">
            Thống kê học tập
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2</div>
              <div className="text-sm text-text-sub mt-1">Giáo trình</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">38</div>
              <div className="text-sm text-text-sub mt-1">Bài học</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">5</div>
              <div className="text-sm text-text-sub mt-1">Cấp độ JLPT</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">∞</div>
              <div className="text-sm text-text-sub mt-1">Thời gian học</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;