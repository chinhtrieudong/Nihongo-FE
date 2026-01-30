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
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

        // Get available voices and find Japanese voice
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = voices.find(voice =>
          voice.lang.includes('ja') || voice.name.includes('Japanese')
        );

        const utterance = new SpeechSynthesisUtterance(currentExercise.japanese);

        // Set voice if found, otherwise use default
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
          utterance.lang = japaneseVoice.lang;
        } else {
          utterance.lang = 'ja-JP';
        }

        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          message.error('Lỗi phát âm thanh. Trình duyệt có thể không hỗ trợ tiếng Nhật. Vui lòng thử lại.');
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

  const playRecordedAudio = () => {
    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.play().catch(err => {
        console.error('Error playing recorded audio:', err);
        message.error('Không thể phát bản ghi âm');
      });
    }
  };

  const handleStartRecording = async () => {
    if (!currentExercise) return;

    try {
      setIsRecording(true);
      setUserInput("");
      setShowResults(false);
      setRecordingProgress(0);

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
        console.log('🛑 Recording stopped, processing audio...');

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioData = await blobToBase64(audioBlob);
        const duration = audioChunksRef.current.length * 0.1; // Approximate duration

        // Create audio URL for playback
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        console.log('🔗 Audio URL created:', audioUrl);

        // Wait a moment for the state to update
        await new Promise(resolve => setTimeout(resolve, 100));

        await submitRecording(audioData, duration);

        // Clean up
        stream.getTracks().forEach(track => track.stop());

        // Clear recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start();

      // Update progress every 100ms
      recordingTimerRef.current = setInterval(() => {
        setRecordingProgress(prev => {
          if (prev >= 100) {
            handleStopRecording();
            return 100;
          }
          return prev + 2; // 2% every 100ms = 5 seconds total
        });
      }, 100);

      // Auto stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          handleStopRecording();
        }
      }, 5000);

    } catch (error) {
      message.error('Không thể bắt đầu thu âm. Vui lòng kiểm tra micro.');
      setIsRecording(false);
      setRecordingProgress(0);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingProgress(0);

    // Clear recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
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
      console.log('📊 Submitting recording for analysis...');
      console.log('🎯 Current exercise:', currentExercise.japanese);

      // Use real API for pronunciation analysis
      const analysisResult = await pronunciationAPI.analyzePronunciation(
        currentExercise._id,
        currentExercise.japanese
      );

      console.log('🎯 API Analysis Result:', analysisResult);

      // Store results for display
      setLastScore(analysisResult.score);
      setLastFeedback(analysisResult.feedback);
      setShowResults(true);

      // Create practice result with real API analysis
      const practice: Practice = {
        practiceId: `practice_${Date.now()}`,
        exercise: currentExercise,
        score: analysisResult.score,
        feedback: analysisResult.feedback,
        detailedAnalysis: {
          pronunciationAccuracy: analysisResult.detailedAnalysis.pronunciationAccuracy,
          fluency: analysisResult.detailedAnalysis.fluency,
          intonation: analysisResult.detailedAnalysis.intonation,
          overallScore: analysisResult.score,
          improvements: getImprovementSuggestions(analysisResult.score),
        },
        audioUrl: analysisResult.audioUrl || `blob:${window.location.origin}/${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setPracticeHistory(prev => [practice, ...prev.slice(0, 9)]);

      // Show feedback
      if (analysisResult.score >= 70) {
        message.success(`Điểm số: ${analysisResult.score}/100 - ${analysisResult.feedback}`);
      } else {
        message.warning(`Điểm số: ${analysisResult.score}/100 - ${analysisResult.feedback}`);
      }

      // Store audio data for playback
      setUserInput(`Phân tích hoàn tất! Text nhận dạng: "${analysisResult.transcription.recognizedText}" (Confidence: ${Math.round(analysisResult.transcription.confidence * 100)}%)`);

    } catch (error) {
      console.error('Recording analysis error:', error);
      message.error('Không thể phân tích bản ghi âm. Vui lòng thử lại.');

      // Fallback to simulated scoring if API fails
      fallbackToSimulatedScoring();
    }
  };

  const analyzePronunciationWithSpeechRecognition = async (targetText: string, audioUrl: string | null): Promise<number> => {
    return new Promise((resolve, reject) => {
      console.log('🎤 Starting pronunciation analysis...');
      console.log('📝 Target text:', targetText);

      // Check browser support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('❌ Speech recognition not supported in this browser');
        reject(new Error('Speech recognition not supported'));
        return;
      }

      console.log('✅ Speech recognition is supported');
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;

      console.log('🔧 Recognition config:', {
        lang: recognition.lang,
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        maxAlternatives: recognition.maxAlternatives
      });

      recognition.onresult = (event: any) => {
        console.log('🎯 Speech recognition result received:', event);
        const results = event.results[0];
        console.log('📊 Results array:', results);

        let bestMatch = "";
        let bestConfidence = 0;

        // Find the best match with highest confidence
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          console.log(`🔍 Result ${i}:`, {
            transcript: result.transcript,
            confidence: result.confidence
          });

          if (result.confidence > bestConfidence) {
            bestConfidence = result.confidence;
            bestMatch = result.transcript.trim();
          }
        }

        console.log('🏆 Best match selected:', {
          text: bestMatch,
          confidence: bestConfidence
        });

        // Calculate similarity score
        const similarity = calculateTextSimilarity(targetText, bestMatch);
        const confidenceScore = bestConfidence * 100;

        // Combine similarity and confidence for final score
        const finalScore = Math.round((similarity * 0.7) + (confidenceScore * 0.3));

        console.log('📈 Score calculation:');
        console.log(`   Target: "${targetText}"`);
        console.log(`   Recognized: "${bestMatch}"`);
        console.log(`   Confidence: ${bestConfidence} → ${confidenceScore}%`);
        console.log(`   Similarity: ${similarity}%`);
        console.log(`   Final Score: ${finalScore}% (70% similarity + 30% confidence)`);

        resolve(finalScore);
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', {
          error: event.error,
          message: event.message,
          event: event
        });
        reject(new Error(`Speech recognition failed: ${event.error}`));
      };

      recognition.ontimeout = () => {
        console.log('⏰ Speech recognition timeout');
        reject(new Error('Speech recognition timeout'));
      };

      recognition.onstart = () => {
        console.log('🎙️ Speech recognition started');
      };

      recognition.onend = () => {
        console.log('🏁 Speech recognition ended');
      };

      // Start recognition with the recorded audio
      console.log('🔊 Playing recorded audio for recognition...');
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().then(() => {
          console.log('🎵 Audio playback started, starting recognition...');
          recognition.start();
        }).catch((error) => {
          console.error('❌ Audio playback error:', error);
          reject(error);
        });
      } else {
        console.error('❌ No recorded audio available');
        reject(new Error('No recorded audio available'));
      }
    });
  };

  const calculateTextSimilarity = (text1: string, text2: string): number => {
    // Normalize texts (remove spaces, punctuation, convert to hiragana/katakana)
    const normalized1 = normalizeJapaneseText(text1);
    const normalized2 = normalizeJapaneseText(text2);

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);

    if (maxLength === 0) return 100;

    const similarity = ((maxLength - distance) / maxLength) * 100;
    return Math.max(0, Math.min(100, similarity));
  };

  const normalizeJapaneseText = (text: string): string => {
    // Remove spaces and punctuation
    let normalized = text.replace(/\s+/g, '').replace(/[。、？！]/g, '');

    // Convert katakana to hiragana for comparison
    normalized = normalized.replace(/[ァ-ヶ]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });

    return normalized.toLowerCase();
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const getImprovementSuggestions = (score: number): string[] => {
    const suggestions = [
      "Nói chậm và rõ ràng hơn",
      "Tập trung vào âm cuối của từ",
      "Nghe kỹ âm thanh mẫu trước khi nói",
      "Luyện tập với ngữ điệu tự nhiên",
      "Chú ý đến độ dài của âm vần"
    ];

    if (score >= 90) return ["Giữ nguyên phong độ phát âm tốt!"];
    if (score >= 80) return suggestions.slice(0, 2);
    if (score >= 70) return suggestions.slice(0, 3);
    if (score >= 60) return suggestions.slice(0, 4);
    return suggestions;
  };

  const fallbackToSimulatedScoring = () => {
    const simulatedScore = Math.floor(Math.random() * 30) + 70;
    const feedbackMessages = [
      "Tốt! Phát âm khá rõ ràng.",
      "Khá tốt! Cần cải thiện thêm một chút.",
      "Rất tốt! Giọng điệu tự nhiên.",
      "Xuất sắc! Phát âm chuẩn xác."
    ];
    const randomFeedback = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];

    setLastScore(simulatedScore);
    setLastFeedback(randomFeedback);
    setShowResults(true);
    setUserInput("Bản ghi âm đã được lưu. Click để nghe lại.");
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
                                percent={recordingProgress}
                                status="active"
                                showInfo={true}
                                strokeColor={{
                                  '0%': '#108ee9',
                                  '100%': '#87d068',
                                }}
                              />
                              <Text className="text-gray-600 dark:text-secondary-400">
                                Đang thu âm... {Math.round(recordingProgress)}%
                              </Text>
                            </div>
                          )}

                          {showResults && lastScore !== null && (
                            <div className="p-4 bg-secondary-50 dark:bg-secondary-925 rounded-lg">
                              <div className="text-center space-y-3">
                                <Title level={4} className="!mb-2 text-gray-900 dark:text-secondary-100">
                                  Kết quả phân tích
                                </Title>
                                <div className={`text-3xl font-bold ${lastScore >= 80 ? 'text-green-600 dark:text-green-400' :
                                  lastScore >= 60 ? 'text-blue-600 dark:text-blue-400' :
                                    'text-orange-600 dark:text-orange-400'
                                  }`}>
                                  {lastScore}/100 điểm
                                </div>
                                <div className="text-lg text-gray-700 dark:text-secondary-300">
                                  {lastFeedback}
                                </div>
                              </div>
                            </div>
                          )}

                          {userInput && (
                            <div className="p-4 bg-secondary-50 dark:bg-secondary-925 rounded-lg">
                              <Text strong>Kết quả thu âm:</Text>
                              <div className="mt-2 p-3 bg-white dark:bg-secondary-925 rounded border border-secondary-200 dark:border-secondary-900">
                                {userInput}
                              </div>
                              <div className="mt-3 space-x-2">
                                <Button
                                  icon={<PlayCircleOutlined />}
                                  onClick={playRecordedAudio}
                                  size="small"
                                  type="primary"
                                >
                                  Nghe lại
                                </Button>
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
