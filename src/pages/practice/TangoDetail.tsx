import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Button, List, Tag, Space } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Volume2, BookOpen } from "lucide-react";
// import { minnaAPI } from "../../services/api"; // Disabled - using local JSON data
import { EmptyState } from "../../components/common";

const { Title, Text, Paragraph } = Typography;

interface TangoItem {
  id: number;
  japanese: string;
  kana: string;
  kanji: string;
  romaji: string;
  vietnamese: string;
  partOfSpeech: string;
  example: string;
  exampleRomaji: string;
  exampleVietnamese: string;
}

const TangoDetail: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId?: string }>();
  const [loading, setLoading] = useState(true);
  const [tangoData, setTangoData] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  // Set selected lesson from URL param
  useEffect(() => {
    if (lessonId) {
      setSelectedLesson(parseInt(lessonId));
    }
  }, [lessonId]);

  useEffect(() => {
    const fetchTangoData = async () => {
      if (!selectedLesson) return;
      try {
        setLoading(true);
        // Load local JSON data instead of API call
        const data = await import(`../../data/practice/tango/lesson${selectedLesson}.json`);
        setTangoData(data.default);
      } catch (error) {
        console.error("Error loading tango data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTangoData();
  }, [selectedLesson]);

  const tango = tangoData?.tango || [];

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
        Từ vựng - Bài {selectedLesson || '...'}
      </Title>

      <Space className="mb-4 flex-wrap">
        <Tag 
          color={selectedLesson === 1 ? "blue" : undefined}
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedLesson(1)}
        >
          Bài 1
        </Tag>
        <Tag
          color={selectedLesson === 2 ? "blue" : undefined}
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedLesson(2)}
        >
          Bài 2
        </Tag>
      </Space>

      {tango.length === 0 ? (
        <EmptyState
          type="data"
          title="Chưa có từ vựng"
          description="Bài học này chưa có từ vựng nào."
          size="default"
        />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
          dataSource={tango}
          renderItem={(item: TangoItem) => (
            <List.Item>
              <Card className="w-full">
                <div className="text-center">
                  <Text strong className="text-2xl block mb-2">
                    {item.kanji || item.japanese}
                  </Text>
                  {item.kanji && (
                    <Text type="secondary" className="text-lg block mb-1">
                      {item.kana}
                    </Text>
                  )}
                  {/* Romaji - Hidden */}
                  {/* <Tag color="blue" className="mb-2">
                    {item.romaji}
                  </Tag> */}
                  <Text type="secondary" className="block mb-2 text-xs">
                    {item.partOfSpeech}
                  </Text>
                  <Paragraph className="text-gray-700 mt-2">
                    {item.vietnamese}
                  </Paragraph>
                  {item.example && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p className="italic">{item.example}</p>
                      {/* Example Romaji - Hidden */}
                      {/* <p className="text-xs">{item.exampleRomaji}</p> */}
                      <p>{item.exampleVietnamese}</p>
                    </div>
                  )}
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default TangoDetail;
