import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Select,
  Typography,
  Space,
  Progress,
  message,
  Tabs,
  List,
  Avatar,
  Tag,
  Divider,
  Badge,
  Alert,
} from "antd";
import {
  SoundOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AudioOutlined,
  DownloadOutlined,
  StarOutlined,
  BookOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  pronunciationAPI,
  type Exercise,
  type Practice,
  type Category,
  type Stats
} from '../services/pronunciationAPI';

const { Title, Text } = Typography;
const { Option } = Select;

const Pronunciation: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("N5");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [practiceHistory, setPracticeHistory] = useState<Practice[]>([]);
  const [userStats, setUserStats] = useState<Stats | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [activeTab, setActiveTab] = useState("practice");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const loadExercises = useCallback(async () => {
    try {
      const data = await pronunciationAPI.getExercises(
        selectedLevel,
        selectedCategory,
        undefined,
        1,
        20
      );
      setExercises(data.exercises);
      if (data.exercises.length > 0 && !currentExercise) {
        setCurrentExercise(data.exercises[0]);
      }
    } catch (error) {
      message.error('Không thể tải bài tập. Vui lòng thử lại.');
    }
  }, [selectedLevel, selectedCategory, currentExercise]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await pronunciationAPI.getCategories();
      setCategories([
        { value: "all", label: "Tất cả", description: "Tất cả danh mục", exerciseCount: 0 },
        ...data.map(cat => ({
          value: cat.value,
          label: cat.label,
          description: cat.description,
          exerciseCount: cat.exerciseCount
        }))
      ]);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  // Load exercises from API
  useEffect(() => {
    loadExercises();
    loadCategories();
  }, [loadExercises, loadCategories]);

  // Load practice history and stats when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      loadPracticeHistory();
      loadUserStats();
    }
  }, [activeTab]);

  const loadPracticeHistory = async () => {
    try {
      const data = await pronunciationAPI.getHistory(1, 20);
      setPracticeHistory(data.practices);
    } catch (error) {
      message.error('Không thể tải lịch sử. Vui lòng thử lại.');
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await pronunciationAPI.getStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const levels = [
    { value: "N5", label: "N5" },
    { value: "N4", label: "N4" },
    { value: "N3", label: "N3" },
    { value: "N2", label: "N2" },
    { value: "N1", label: "N1" },
  ];

  const handlePlayAudio = async () => {
    if (!currentExercise) return;

    try {
      setIsPlaying(true);

      // Try to get audio from API
      const audioResponse = await pronunciationAPI.getExerciseAudio(currentExercise._id);

      if (audioResponse.audioUrl) {
        const audio = new Audio(audioResponse.audioUrl);
        audio.play();
        audio.onended = () => setIsPlaying(false);
      } else {
        // Fallback to text-to-speech
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(currentExercise.japanese);
          utterance.lang = 'ja-JP';
          utterance.rate = 0.8;
          utterance.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        } else {
          message.warning('Trình duyệt không hỗ trợ phát âm');
          setIsPlaying(false);
        }
      }
    } catch (error) {
      message.error('Không thể phát âm thanh. Vui lòng thử lại.');
      setIsPlaying(false);
    }
  };

  const handleStartRecording = async () => {
    if (!currentExercise) return;

    try {
      setIsRecording(true);
      setUserInput("");

      // Start real recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioData = await blobToBase64(audioBlob);
        const duration = audioChunksRef.current.length * 0.1; // Approximate duration

        await submitRecording(audioData, duration);

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      // Auto stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);

    } catch (error) {
      message.error('Không thể bắt đầu thu âm. Vui lòng kiểm tra micro.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const submitRecording = async (audioData: string, duration: number) => {
    if (!currentExercise) return;

    try {
      const result = await pronunciationAPI.submitPractice(
        currentExercise._id,
        audioData,
        duration
      );

      // Add to practice history
      const practice: Practice = {
        ...result,
        exercise: currentExercise
      };
      setPracticeHistory(prev => [practice, ...prev.slice(0, 9)]);

      // Show feedback
      if (result.score >= 70) {
        message.success(`Điểm số: ${result.score}/100 - ${result.feedback}`);
      } else {
        message.warning(`Điểm số: ${result.score}/100 - ${result.feedback}`);
      }

    } catch (error) {
      message.error('Không thể nộp bài. Vui lòng thử lại.');
    }
  };

  const handleNextExercise = () => {
    if (!currentExercise) return;

    const currentIndex = exercises.findIndex(ex => ex._id === currentExercise._id);
    const nextIndex = (currentIndex + 1) % exercises.length;
    setCurrentExercise(exercises[nextIndex]);
    setUserInput("");
  };

  const handlePreviousExercise = () => {
    if (!currentExercise) return;

    const currentIndex = exercises.findIndex(ex => ex._id === currentExercise._id);
    const prevIndex = currentIndex === 0 ? exercises.length - 1 : currentIndex - 1;
    setCurrentExercise(exercises[prevIndex]);
    setUserInput("");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "green";
      case "medium": return "orange";
      case "hard": return "red";
      default: return "default";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Dễ";
      case "medium": return "Trung bình";
      case "hard": return "Khó";
      default: return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="!mb-2">
            <SoundOutlined className="mr-2" />
            Luyện phát âm
          </Title>
          <Text type="secondary">
            Cải thiện phát âm tiếng Nhật với công nghệ AI
          </Text>
        </div>
        <Space>
          <Select
            value={selectedLevel}
            onChange={setSelectedLevel}
            style={{ width: 120 }}
            placeholder="Chọn cấp độ"
          >
            {levels.map(level => (
              <Option key={level.value} value={level.value}>
                {level.label}
              </Option>
            ))}
          </Select>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            style={{ width: 150 }}
            placeholder="Chọn danh mục"
          >
            {categories.map(category => (
              <Option key={category.value} value={category.value}>
                {category.label}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'practice',
            label: 'Luyện tập',
            children: currentExercise && (
              <Row gutter={[24, 24]}>
                {/* Main Exercise Card */}
                <Col xs={24} lg={16}>
                  <Card
                    title={
                      <Space>
                        <span>Bài tập #{currentExercise._id}</span>
                        <Tag color={getDifficultyColor(currentExercise.difficulty)}>
                          {getDifficultyText(currentExercise.difficulty)}
                        </Tag>
                        <Tag color="blue">{currentExercise.category}</Tag>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={handlePreviousExercise}
                          disabled={exercises.length <= 1}
                        >
                          Câu trước
                        </Button>
                        <Button
                          type="primary"
                          icon={<ReloadOutlined />}
                          onClick={handleNextExercise}
                          disabled={exercises.length <= 1}
                        >
                          Câu tiếp theo
                        </Button>
                      </Space>
                    }
                  >
                    <div className="text-center space-y-6">
                      {/* Japanese Text */}
                      <div className="py-8">
                        <Title level={1} className="!text-4xl !mb-4">
                          {currentExercise.japanese}
                        </Title>
                        <Title level={4} type="secondary" className="!mb-2">
                          {currentExercise.romaji}
                        </Title>
                        <Text type="secondary" className="text-lg">
                          {currentExercise.vietnamese}
                        </Text>
                      </div>

                      <Divider />

                      {/* Audio Controls */}
                      <div className="space-y-4">
                        <Title level={4}>Nghe âm thanh mẫu</Title>
                        <Space size="large">
                          <Button
                            type="primary"
                            size="large"
                            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={handlePlayAudio}
                            loading={isPlaying}
                            disabled={!currentExercise}
                          >
                            {isPlaying ? "Đang phát..." : "Phát âm thanh"}
                          </Button>
                          <Button
                            icon={<DownloadOutlined />}
                            disabled={!currentExercise}
                          >
                            Tải về
                          </Button>
                        </Space>
                      </div>

                      <Divider />

                      {/* Recording Section */}
                      <div className="space-y-4">
                        <Title level={4}>Thu âm của bạn</Title>

                        <Alert
                          title="Hướng dẫn"
                          description="Nhấn nút thu âm và đọc to câu trên. Hệ thống sẽ phân tích và đưa ra phản hồi."
                          type="info"
                          showIcon
                        />

                        <div className="space-y-4">
                          <Button
                            type={isRecording ? "default" : "primary"}
                            danger={isRecording}
                            size="large"
                            icon={<AudioOutlined />}
                            onClick={isRecording ? handleStopRecording : handleStartRecording}
                            loading={isRecording}
                          >
                            {isRecording ? "Đang thu âm..." : "Bắt đầu thu âm"}
                          </Button>

                          {isRecording && (
                            <div className="space-y-2">
                              <Progress
                                percent={66}
                                status="active"
                                showInfo={false}
                                strokeColor={{
                                  '0%': '#108ee9',
                                  '100%': '#87d068',
                                }}
                              />
                              <Text type="secondary">Đang thu âm...</Text>
                            </div>
                          )}

                          {userInput && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <Text strong>Kết quả thu âm:</Text>
                              <div className="mt-2 p-3 bg-white rounded border">
                                {userInput}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Stats and Progress */}
                <Col xs={24} lg={8}>
                  <Space orientation="vertical" className="w-full" size="large">
                    {/* Progress Card */}
                    <Card title="Tiến độ hôm nay">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Text>Số bài đã luyện tập</Text>
                          <Badge count={practiceHistory.length} showZero />
                        </div>
                        <div className="flex justify-between items-center">
                          <Text>Điểm trung bình</Text>
                          <Text strong>
                            {practiceHistory.length > 0
                              ? Math.round(practiceHistory.reduce((acc, r) => acc + r.score, 0) / practiceHistory.length)
                              : 0}/100
                          </Text>
                        </div>
                        <Progress
                          percent={Math.min(practiceHistory.length * 20, 100)}
                          status="active"
                        />
                      </div>
                    </Card>

                    {/* Achievements */}
                    <Card title="Thành tựu">
                      <Space orientation="vertical" className="w-full">
                        <div className="flex items-center space-x-3">
                          <TrophyOutlined className="text-yellow-500 text-xl" />
                          <div>
                            <Text strong>Chuyên gia phát âm</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                              Hoàn thành 100 bài tập
                            </Text>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <StarOutlined className="text-blue-500 text-xl" />
                          <div>
                            <Text strong>Chính xác tuyệt đối</Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                              Đạt 95/100 điểm
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </Card>

                    {/* Tips */}
                    <Card title="Mẹo luyện tập">
                      {/* Tips */}
                      <Card title="Mẹo luyện tập">
                        <div className="space-y-2">
                          {[
                            "Nghe kỹ âm thanh mẫu trước khi nói",
                            "Nói chậm và rõ ràng",
                            "Chú ý đến ngữ điệu",
                            "Luyện tập đều đặn mỗi ngày"
                          ].map((item, index) => (
                            <div key={index} className="py-2">
                              <Text type="secondary">• {item}</Text>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Card>
                  </Space>
                </Col>
              </Row>
            )
          },
          {
            key: 'history',
            label: 'Lịch sử',
            children: (
              <div className="space-y-6">
                {/* User Stats Card */}
                {userStats && (
                  <Card title="Thống kê luyện tập">
                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={6}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{userStats.totalPractices}</div>
                          <div className="text-gray-500">Tổng bài tập</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{userStats.averageScore.toFixed(1)}</div>
                          <div className="text-gray-500">Điểm trung bình</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{userStats.bestScore}</div>
                          <div className="text-gray-500">Điểm cao nhất</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{userStats.currentStreak}</div>
                          <div className="text-gray-500">Chuỗi hiện tại</div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                )}

                {/* Practice History */}
                <Card title="Lịch sử luyện tập">
                  {practiceHistory.length > 0 ? (
                    <List
                      dataSource={practiceHistory}
                      renderItem={(result) => (
                        <List.Item
                          actions={[
                            <Button
                              type="link"
                              icon={<PlayCircleOutlined />}
                              onClick={() => setCurrentExercise(result.exercise)}
                              key="practice-again"
                            >
                              Luyện lại
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                style={{
                                  backgroundColor: result.score >= 70 ? '#52c41a' : '#ff4d4f'
                                }}
                                icon={result.score >= 70 ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                              />
                            }
                            title={
                              <Space>
                                <span>{result.exercise.japanese}</span>
                                <Tag color={getDifficultyColor(result.exercise.difficulty)}>
                                  {getDifficultyText(result.exercise.difficulty)}
                                </Tag>
                              </Space>
                            }
                            description={
                              <div>
                                <Text type="secondary">{result.exercise.romaji}</Text>
                                <br />
                                <Text type="secondary">{result.exercise.vietnamese}</Text>
                                <br />
                                <div className="mt-2">
                                  <Text strong>Điểm: {result.score}/100</Text>
                                  <br />
                                  <Text type="secondary">{result.feedback}</Text>
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <BookOutlined className="text-4xl text-gray-300 mb-4" />
                      <Title level={4} type="secondary">Chưa có lịch sử luyện tập</Title>
                      <Text type="secondary">Bắt đầu luyện tập để xem lịch sử của bạn</Text>
                    </div>
                  )}
                </Card>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default Pronunciation;
