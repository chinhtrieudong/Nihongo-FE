import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Button, List, Tag, Space } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Volume2, BookOpen } from "lucide-react";
import { minnaAPI } from "../../services/api";

const { Title, Text, Paragraph } = Typography;

interface TangoItem {
  _id: string;
  kanji: string;
  kana: string;
  romaji: string;
  hanviet: string;
  meaningVi: string;
  exampleJp?: string;
  exampleVi?: string;
  lessonNumber: number;
}

const TangoDetail: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId?: string }>();
  const [loading, setLoading] = useState(true);
  const [tango, setTango] = useState<TangoItem[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  // Set selected lesson from URL param
  useEffect(() => {
    if (lessonId) {
      setSelectedLesson(parseInt(lessonId));
    }
  }, [lessonId]);

  useEffect(() => {
    fetchTango();
  }, [selectedLesson]);

  const fetchTango = async () => {
    try {
      setLoading(true);
      const response = await minnaAPI.getTango(selectedLesson || undefined);
      if (response.success) {
        setTango(response.data);
      }
    } catch (error) {
      console.error("Error fetching tango:", error);
    } finally {
      setLoading(false);
    }
  };

  const lessons = Array.from(new Set(tango.map(item => item.lessonNumber))).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Button 
        icon={<ArrowLeft className="w-4 h-4" />} 
        onClick={() => navigate("/practice")}
        className="mb-4"
      >
        Quay lại
      </Button>

      <Title level={2} className="flex items-center gap-2 mb-6">
        <BookOpen className="w-8 h-8 text-blue-500" />
        Từ vựng Minna (Tango)
      </Title>

      <Space className="mb-4 flex-wrap">
        <Tag 
          color={selectedLesson === null ? "blue" : undefined}
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedLesson(null)}
        >
          Tất cả
        </Tag>
        {lessons.map(lesson => (
          <Tag
            key={lesson}
            color={selectedLesson === lesson ? "blue" : undefined}
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedLesson(lesson)}
          >
            Bài {lesson}
          </Tag>
        ))}
      </Space>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        dataSource={tango}
        renderItem={(item) => (
          <List.Item>
            <Card className="w-full">
              <div className="text-center">
                <Text strong className="text-2xl block mb-2">
                  {item.kanji || item.kana}
                </Text>
                {item.kanji && (
                  <Text type="secondary" className="text-lg block mb-1">
                    {item.kana}
                  </Text>
                )}
                <Tag color="blue" className="mb-2">
                  {item.romaji}
                </Tag>
                {item.hanviet && (
                  <Text type="secondary" className="block mb-2">
                    {item.hanviet}
                  </Text>
                )}
                <Paragraph className="text-gray-700 mt-2">
                  {item.meaningVi}
                </Paragraph>
                {item.exampleJp && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="italic">{item.exampleJp}</p>
                    <p>{item.exampleVi}</p>
                  </div>
                )}
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TangoDetail;
