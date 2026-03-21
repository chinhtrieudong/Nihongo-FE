import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Select,
  Typography,
  Space,
  Progress,
  App as AntdApp,
  Tag,
} from "antd";
import {
  SoundOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  AudioOutlined,
  DownloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  pronunciationAPI,
  type Exercise,
  type Category,
} from '../services/pronunciationAPI';
import { getNanamiNaturalVoice } from "../utils/vocabularyUtils";

const { Title, Text } = Typography;
const { Option } = Select;

const Pronunciation: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("N5");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showRomaji, setShowRomaji] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string>("");
  const [recognitionError, setRecognitionError] = useState<string>("");
  const [manualTranscript, setManualTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionResultRef = useRef<{ text: string; confidence: number; score: number } | null>(null);
  const isRecordingRef = useRef(false);
  const recognitionRestartRef = useRef(0);
  const speechSupported =
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const { message } = AntdApp.useApp();

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

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

  const levels = [
    { value: "N5", label: "N5" },
    { value: "N4", label: "N4" },
    { value: "N3", label: "N3" },
    { value: "N2", label: "N2" },
    { value: "N1", label: "N1" },
  ];

  const remainingSeconds = Math.max(
    0,
    Math.ceil((100 - recordingProgress) / 20),
  );

  const handlePlayAudio = async () => {
    if (!currentExercise) return;

    try {
      setIsPlaying(true);

      // Use text-to-speech directly since backend API is not available yet
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Get available voices and find Japanese voice (prefer Natural if available)
        const voices = window.speechSynthesis.getVoices();
        // CHỈ sử dụng Microsoft Nanami Online (Natural)
        const nanamiNatural = getNanamiNaturalVoice();
        const preferredJapanese = nanamiNatural;

        const utterance = new SpeechSynthesisUtterance(currentExercise.japanese);

        // Set voice if found, otherwise use default
        if (preferredJapanese) {
          utterance.voice = preferredJapanese;
          utterance.lang = preferredJapanese.lang;
        } else {
          // Nếu không có Microsoft Nanami, không phát âm
          console.warn('Microsoft Nanami Online (Natural) not available. Please install the voice.');
          message.warning('Microsoft Nanami Online (Natural) not available. Please install the voice.');
          setIsPlaying(false);
          return;
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
      setRecognitionError("");
      setManualTranscript("");
      recognitionResultRef.current = null;

      // Initialize Web Speech API for Japanese recognition
      if (speechSupported) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP'; // Japanese language
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
          console.log('🎯 Speech recognition result received');
          const last = event.results.length - 1;
          const result = event.results[last];
          
          if (result.isFinal) {
            const transcript = result[0].transcript;
            const confidence = result[0].confidence;
            
            console.log('✅ Final result:', transcript, 'Confidence:', confidence);
            
            recognitionResultRef.current = {
              text: transcript,
              confidence: confidence,
              score: 0
            };
          }
        };

        recognition.onerror = (event: any) => {
          console.error('❌ Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            setRecognitionError('Không phát hiện giọng nói. Vui lòng nói rõ ràng hơn.');
          } else if (event.error === 'audio-capture') {
            setRecognitionError('Không tìm thấy microphone. Vui lòng kiểm tra thiết bị.');
          } else if (event.error === 'not-allowed') {
            setRecognitionError('Quyền truy cập micro bị từ chối.');
          } else {
            setRecognitionError(`Lỗi nhận diện: ${event.error}`);
          }
        };

        recognition.onend = () => {
          console.log('🔚 Speech recognition ended');
        };

        // Start speech recognition
        try {
          recognition.start();
          console.log('🎤 Speech recognition started');
        } catch (err) {
          console.error('Failed to start speech recognition:', err);
        }
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing audio...');
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        console.log('🔗 Audio URL created:', audioUrl);

        // Clean up recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }

        // Wait a moment before stopping speech recognition to ensure it processes
        await new Promise(resolve => setTimeout(resolve, 300));

        // Stop speech recognition
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            console.log('🛑 Speech recognition stopped');
          } catch (err) {
            console.log('Speech recognition already stopped');
          }
        }

        // Wait a moment for speech recognition to finish processing
        await new Promise(resolve => setTimeout(resolve, 700));

        // Check if we got a speech recognition result
        if (recognitionResultRef.current && recognitionResultRef.current.text) {
          const { text, confidence } = recognitionResultRef.current;
          
          // Calculate score based on text similarity and confidence
          const similarity = calculateTextSimilarity(currentExercise.japanese, text);
          const confidenceScore = confidence * 100;
          const finalScore = Math.round((similarity * 0.7) + (confidenceScore * 0.3));
          
          setLastScore(finalScore);
          setLastFeedback(getImprovementSuggestions(finalScore)[0] || "Tiếp tục luyện tập!");
          setShowResults(true);
          setUserInput(`Text nhận dạng: "${text}" (Độ tin cậy: ${Math.round(confidence * 100)}%)`);
          
          if (finalScore >= 70) {
            message.success(`Điểm số: ${finalScore}/100`);
          } else {
            message.warning(`Điểm số: ${finalScore}/100`);
          }
        } else {
          // No speech recognition result - show error
          setRecognitionError("Không nhận diện được giọng nói. Vui lòng thử lại hoặc nói rõ ràng hơn.");
          setUserInput("Không có kết quả nhận diện");
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        message.error('Lỗi ghi âm. Vui lòng thử lại.');
        setIsRecording(false);
      };

      mediaRecorder.start(100); // Collect data every 100ms

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

    } catch (error: any) {
      console.error('Recording error:', error);
      if (error.name === 'NotAllowedError') {
        message.error('Quyền truy cập micro bị từ chối. Vui lòng cho phép truy cập micro.');
      } else if (error.name === 'NotFoundError') {
        message.error('Không tìm thấy micro. Vui lòng kiểm tra thiết bị.');
      } else {
        message.error('Không thể bắt đầu thu âm. Vui lòng thử lại.');
      }
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

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore stop errors
      }
    }

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
      // Wait briefly for recognition result (speech API can be async)
      if (!recognitionResultRef.current || !recognitionResultRef.current.text) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      if (!recognitionResultRef.current || !recognitionResultRef.current.text) {
        message.warning('Chưa nhận diện được giọng nói. Vui lòng thử lại.');
        return;
      }

      const { score, text, confidence } = recognitionResultRef.current;

      if (score >= 70) {
        message.success(`Điểm số: ${score}/100`);
      } else {
        message.warning(`Điểm số: ${score}/100`);
      }

      setUserInput(`Text nhận dạng: "${text}" (Confidence: ${Math.round(confidence * 100)}%)`);
    } catch (error) {
      console.error('Recording analysis error:', error);
      message.error('Không thể phân tích bản ghi âm. Vui lòng thử lại.');
    }
  };

  const scoreFromText = (text: string, confidence: number = 1) => {
    if (!currentExercise || !text.trim()) {
      message.warning("Vui lòng nhập transcript để chấm.");
      return;
    }
    const similarity = calculateTextSimilarity(currentExercise.japanese, text.trim());
    const confidenceScore = confidence * 100;
    const finalScore = Math.round((similarity * 0.7) + (confidenceScore * 0.3));

    setLastScore(finalScore);
    setLastFeedback(getImprovementSuggestions(finalScore)[0] || "Cố gắng thêm nhé!");
    setShowResults(true);
    setUserInput(`Text nhận dạng: "${text.trim()}"`);
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
    <div className="min-h-full bg-gray-50 dark:bg-secondary-900 academic-canvas">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-secondary-100 mb-3">
            Luyện phát âm
          </h1>
          <p className="text-gray-600 dark:text-secondary-400 text-lg">
            Nghe mẫu, thu âm và nhận phản hồi nhanh.
          </p>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={selectedLevel}
              onChange={setSelectedLevel}
              className="w-full sm:w-auto min-w-[120px]"
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
              className="w-full sm:w-auto min-w-[160px]"
              placeholder="Chọn danh mục"
            >
              {categories.map(category => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </div>
        )}

        {!currentExercise ? (
          <Card className="p-6">
            <Text type="secondary">Chưa có bài luyện phát âm.</Text>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-secondary-700 dark:text-secondary-300">
                  Bài tập #{exercises.findIndex(ex => ex._id === currentExercise._id) + 1}
                </span>
                <Tag color={getDifficultyColor(currentExercise.difficulty)}>
                  {getDifficultyText(currentExercise.difficulty)}
                </Tag>
                <Tag color="blue">{currentExercise.category}</Tag>
              </div>
              <Space>
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePreviousExercise}
                  disabled={exercises.length <= 1}
                  className="rounded-xl"
                >
                  Câu trước
                </Button>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextExercise}
                  disabled={exercises.length <= 1}
                  className="rounded-xl"
                >
                  Câu tiếp
                </Button>
              </Space>
            </div>

            <div className="space-y-6">
              {/* Sample Section with buttons on top right */}
              <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      type="primary"
                      size="small"
                      icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={handlePlayAudio}
                      loading={isPlaying}
                      className={`${isPlaying ? "animate-pulse" : ""}`}
                    >
                      {isPlaying ? "Đang phát..." : "Nghe"}
                    </Button>
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={downloadExerciseAudio}
                    >
                      Tải
                    </Button>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <Title level={1} className="!mb-0 font-kosugi tracking-wide">
                    {currentExercise.japanese}
                  </Title>
                  {showRomaji && (
                    <div className="text-base sm:text-lg text-gray-700 dark:text-secondary-400">
                      {currentExercise.romaji}
                    </div>
                  )}
                  <div className="text-secondary-700 dark:text-secondary-300 text-sm">
                    {currentExercise.vietnamese}
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={showRomaji ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    onClick={() => setShowRomaji((prev) => !prev)}
                  >
                    {showRomaji ? "Ẩn romaji" : "Hiện romaji"}
                  </Button>
                </div>
              </div>

            {/* Recording and Results Section - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recording Section - Left Side */}
              <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Thu âm của bạn</div>
                  <span className="text-xs text-secondary-500">3–5 giây</span>
                </div>
                <Text className="text-secondary-600 dark:text-secondary-400 text-sm">
                  Nhấn mic và đọc to rõ ràng.
                </Text>
                {recognitionError && (
                  <div className="text-xs text-red-500">{recognitionError}</div>
                )}
                <div className="flex items-center gap-4">
                  <Button
                    type={isRecording ? "default" : "primary"}
                    danger={isRecording}
                    icon={<AudioOutlined />}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    loading={isRecording}
                    className="h-14 w-14 rounded-full flex items-center justify-center"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-secondary-700 dark:text-secondary-400 mb-2">
                      {isRecording ? `Đang ghi... còn ${remainingSeconds}s` : "Sẵn sàng thu âm"}
                    </div>
                    <div className="flex items-end gap-1 h-8">
                      {Array.from({ length: 12 }).map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 rounded-full bg-secondary-400 dark:bg-secondary-600 ${isRecording ? "animate-pulse" : "opacity-30"}`}
                          style={{ height: `${6 + (index % 5) * 3}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {isRecording && (
                  <div className="space-y-2">
                    <Progress
                      percent={recordingProgress}
                      status="active"
                      showInfo
                    />
                    <Text className="text-gray-600 dark:text-secondary-400 text-sm">
                      Đang thu âm... {Math.round(recordingProgress)}%
                    </Text>
                  </div>
                )}

                {recognitionError && (
                  <div className="space-y-2 mt-4">
                    <Text className="text-xs text-secondary-600 dark:text-secondary-400">
                      Nếu Speech Recognition không hoạt động, bạn có thể nhập transcript để chấm.
                    </Text>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        className="flex-1 rounded-md border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-950 px-3 py-2 text-sm"
                        placeholder="Nhập transcript bạn nói..."
                        value={manualTranscript}
                        onChange={(e) => setManualTranscript(e.target.value)}
                      />
                      <Button
                        type="default"
                        onClick={() => scoreFromText(manualTranscript)}
                      >
                        Chấm theo transcript
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Results Section - Right Side */}
              <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-4 sm:p-5 bg-secondary-50 dark:bg-secondary-800">
                <Text strong className="text-lg mb-4 block">Kết quả thu âm:</Text>
                
                {showResults && lastScore !== null && (
                  <div className="mb-4 text-center">
                    <div className={`text-2xl font-bold mb-2 ${lastScore >= 80 ? 'text-green-600 dark:text-green-400' :
                      lastScore >= 60 ? 'text-blue-600 dark:text-blue-400' :
                        'text-orange-600 dark:text-orange-400'
                      }`}>
                      {lastScore}/100 điểm
                    </div>
                    <div className="text-gray-700 dark:text-secondary-300 text-sm">
                      {lastFeedback}
                    </div>
                  </div>
                )}
                
                {userInput ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700">
                      {userInput}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        icon={<PlayCircleOutlined />}
                        onClick={playRecordedAudio}
                        size="middle"
                        type="primary"
                        className="w-full sm:w-auto"
                      >
                        Nghe lại
                      </Button>
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={downloadRecordedAudio}
                        size="middle"
                        className="w-full sm:w-auto"
                      >
                        Tải về bản ghi âm
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
                    <AudioOutlined className="text-4xl mb-3 block opacity-50" />
                    <Text className="text-sm">
                      Nhấn nút mic để bắt đầu thu âm
                    </Text>
                  </div>
                )}
              </div>
            </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Pronunciation;
