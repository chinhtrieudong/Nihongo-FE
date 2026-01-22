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

      // Use text-to-speech directly since backend API is not available yet
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(currentExercise.japanese);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          message.error('Lỗi phát âm thanh. Vui lòng thử lại.');
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        message.warning('Trình duyệt không hỗ trợ phát âm');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
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

  const downloadAudio = async (audioBlob: Blob, filename: string) => {
    try {
      const url = window.URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Đã tải về file âm thanh');
    } catch (error) {
      message.error('Không thể tải về file âm thanh');
    }
  };

  const downloadExerciseAudio = async () => {
    if (!currentExercise) return;

    try {
      message.loading('Đang tạo file âm thanh...', 0);

      // Create a text file with pronunciation guide
      const content = `Phát âm tiếng Nhật\n\nTiếng Nhật: ${currentExercise.japanese}\nRomaji: ${currentExercise.romaji}\nTiếng Việt: ${currentExercise.vietnamese}\n\nHướng dẫn phát âm:\n- ${currentExercise.romaji}\n- Nghe kỹ âm thanh mẫu và lặp lại`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const filename = `pronunciation_guide_${currentExercise.japanese}_${Date.now()}.txt`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.destroy();
      message.success('Đã tải về hướng dẫn phát âm');
    } catch (error) {
      console.error('Download error:', error);
      message.error('Không thể tạo file. Vui lòng thử lại.');
    }
  };

  const downloadRecordedAudio = () => {
    if (audioChunksRef.current.length === 0) {
      message.warning('Chưa có bản ghi âm nào để tải về');
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const filename = `recorded_pronunciation_${Date.now()}.wav`;
    downloadAudio(audioBlob, filename);
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
    <div className="p-6 space-y-6 bg-secondary-50 dark:bg-secondary-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="bg-white dark:bg-transparent p-4 rounded-lg">
          <Title level={2} className="!mb-2 text-gray-900 dark:text-secondary-100">
            <SoundOutlined className="mr-2 text-gray-700 dark:text-secondary-400" />
            Luyện phát âm
          </Title>
          <Text className="text-gray-700 dark:text-secondary-400 text-base">
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
                        <Title level={1} className="!text-4xl !mb-4 text-gray-900 dark:text-secondary-100">
                          {currentExercise.japanese}
                        </Title>
                        <Title level={4} className="!mb-2 text-gray-600 dark:text-secondary-400">
                          {currentExercise.romaji}
                        </Title>
                        <Text className="text-gray-600 dark:text-secondary-400 text-lg">
                          {currentExercise.vietnamese}
                        </Text>
                      </div>

                      <Divider />

                      {/* Audio Controls */}
                      <div className="space-y-4">
                        <Title level={4} className="text-gray-900 dark:text-secondary-100">Nghe âm thanh mẫu</Title>
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
                            onClick={downloadExerciseAudio}
                          >
                            Tải hướng dẫn
                          </Button>
                        </Space>
                      </div>

                      <Divider />

                      {/* Recording Section */}
                      <div className="space-y-4">
                        <Title level={4} className="text-gray-900 dark:text-secondary-100">Thu âm của bạn</Title>

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
                              <Text className="text-gray-600 dark:text-secondary-400">Đang thu âm...</Text>
                            </div>
                          )}

                          {userInput && (
                            <div className="p-4 bg-secondary-50 dark:bg-secondary-925 rounded-lg">
                              <Text strong>Kết quả thu âm:</Text>
                              <div className="mt-2 p-3 bg-white dark:bg-secondary-925 rounded border border-secondary-200 dark:border-secondary-900">
                                {userInput}
                              </div>
                              <div className="mt-3">
                                <Button
                                  icon={<DownloadOutlined />}
                                  onClick={downloadRecordedAudio}
                                  size="small"
                                >
                                  Tải về bản ghi âm
                                </Button>
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
                    <Card title={<span className="text-gray-900 dark:text-secondary-100">Tiến độ hôm nay</span>}>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Text className="text-gray-700 dark:text-secondary-300">Số bài đã luyện tập</Text>
                          <Badge count={practiceHistory.length} showZero />
                        </div>
                        <div className="flex justify-between items-center">
                          <Text className="text-gray-700 dark:text-secondary-300">Điểm trung bình</Text>
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
                    <Card title={<span className="text-gray-900 dark:text-secondary-100">Thành tựu</span>}>
                      <Space orientation="vertical" className="w-full">
                        <div className="flex items-center space-x-3">
                          <TrophyOutlined className="text-yellow-500 text-xl" />
                          <div>
                            <Text strong className="text-gray-900 dark:text-secondary-100">Chuyên gia phát âm</Text>
                            <br />
                            <Text className="text-gray-600 dark:text-secondary-400 text-sm">
                              Hoàn thành 100 bài tập
                            </Text>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <StarOutlined className="text-blue-500 text-xl" />
                          <div>
                            <Text strong className="text-gray-900 dark:text-secondary-100">Chính xác tuyệt đối</Text>
                            <br />
                            <Text className="text-gray-600 dark:text-secondary-400 text-sm">
                              Đạt 95/100 điểm
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </Card>

                    {/* Tips */}
                    <Card title={<span className="text-gray-900 dark:text-secondary-100">Mẹo luyện tập</span>}>
                      <div className="space-y-2">
                        {[
                          "Nghe kỹ âm thanh mẫu trước khi nói",
                          "Nói chậm và rõ ràng",
                          "Chú ý đến ngữ điệu",
                          "Luyện tập đều đặn mỗi ngày"
                        ].map((item, index) => (
                          <div key={index} className="py-2">
                            <Text className="text-gray-600 dark:text-secondary-400">• {item}</Text>
                          </div>
                        ))}
                      </div>
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
                  <Card title={<span className="text-gray-900 dark:text-secondary-100">Thống kê luyện tập</span>}>
                    <Row gutter={[16, 16]}>
                      <Col xs={12} sm={6}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.totalPractices}</div>
                          <div className="text-gray-600 dark:text-secondary-400">Tổng bài tập</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.averageScore.toFixed(1)}</div>
                          <div className="text-gray-600 dark:text-secondary-400">Điểm trung bình</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{userStats.bestScore}</div>
                          <div className="text-gray-600 dark:text-secondary-400">Điểm cao nhất</div>
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.currentStreak}</div>
                          <div className="text-gray-600 dark:text-secondary-400">Chuỗi hiện tại</div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                )}

                {/* Practice History */}
                <Card title={<span className="text-gray-900 dark:text-secondary-100">Lịch sử luyện tập</span>}>
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
                                <Text className="text-gray-600 dark:text-secondary-400">{result.exercise.romaji}</Text>
                                <br />
                                <Text className="text-gray-600 dark:text-secondary-400">{result.exercise.vietnamese}</Text>
                                <br />
                                <div className="mt-2">
                                  <Text strong>Điểm: {result.score}/100</Text>
                                  <br />
                                  <Text className="text-gray-600 dark:text-secondary-400">{result.feedback}</Text>
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <BookOutlined className="text-4xl text-gray-300 dark:text-secondary-600 mb-4" />
                      <Title level={4} className="text-gray-900 dark:text-secondary-100">Chưa có lịch sử luyện tập</Title>
                      <Text className="text-gray-600 dark:text-secondary-400">Bắt đầu luyện tập để xem lịch sử của bạn</Text>
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
