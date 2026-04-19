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
  Badge,
} from "antd";
import {
  Volume2,
  Play,
  Pause,
  Mic,
  Download,
  Eye,
  EyeOff,
  Settings,
  ArrowLeft,
  ArrowRight,
  Headphones,
} from "lucide-react";
import { jlptTestsAPI } from "../../services/api";
import { pronunciationAPI, type Exercise, type Category } from '../../services/pronunciationAPI';
import { getNanamiNaturalVoice } from "../../utils/vocabularyUtils";
import { useAppSelector } from "../../store/hooks";
import { getFontPreset } from "../../constants/fonts";
import { EmptyState } from "../../components/common";

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
  const [lastFeedback, setLastFeedback] = useState("");
  const [recognitionError, setRecognitionError] = useState("");
  const [networkRetryCount, setNetworkRetryCount] = useState(0);
  const { fontPreset } = useAppSelector((state) => state.ui);
  const selectedPreset = getFontPreset(fontPreset);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const recognitionResultRef = useRef<{ text: string; confidence: number; score: number } | null>(null);
  const isRecordingRef = useRef(false);
  const recognitionRestartRef = useRef(0);
  const recordedAudioBlobRef = useRef<Blob | null>(null);
  const speechSupported =
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
  // Check if using HTTPS (required for speech recognition in some browsers)
  const isSecureContext = window.isSecureContext || location.protocol === 'https:';
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
    { value: "N5", label: "N5", color: "#3b82f6" },
    { value: "N4", label: "N4", color: "#10b981" },
    { value: "N3", label: "N3", color: "#f59e0b" },
    { value: "N2", label: "N2", color: "#ef4444" },
    { value: "N1", label: "N1", color: "#8b5cf6" },
  ] as const;

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

        // Helper to get Japanese voice with fallback
        const getJapaneseVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          // Try Microsoft Nanami Natural first
          const nanamiNatural = getNanamiNaturalVoice();
          if (nanamiNatural) return nanamiNatural;
          
          // Fallback: any Japanese voice
          const jaVoice = voices.find(v => v.lang?.startsWith('ja'));
          if (jaVoice) {
            console.log('Using fallback Japanese voice:', jaVoice.name);
            return jaVoice;
          }
          return null;
        };

        let preferredJapanese = getJapaneseVoice();

        // If no voices loaded yet, wait for them
        if (!preferredJapanese && window.speechSynthesis.getVoices().length === 0) {
          console.log('Voices not loaded yet, waiting...');
          await new Promise<void>((resolve) => {
            const checkVoices = () => {
              preferredJapanese = getJapaneseVoice();
              if (preferredJapanese || window.speechSynthesis.getVoices().length > 0) {
                resolve();
              } else {
                setTimeout(checkVoices, 100);
              }
            };
            // Timeout after 2 seconds
            setTimeout(resolve, 2000);
            checkVoices();
          });
        }

        const utterance = new SpeechSynthesisUtterance(currentExercise.japanese);

        // Set voice if found, otherwise use default with Japanese lang
        if (preferredJapanese) {
          utterance.voice = preferredJapanese;
          utterance.lang = preferredJapanese.lang;
        } else {
          // Fallback: use default voice but set lang to Japanese
          utterance.lang = 'ja-JP';
          console.warn('No Japanese voice found, using default voice with ja-JP lang');
        }

        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          // Don't show error for cancellation
          if (event.error !== 'canceled') {
            message.error(`Lỗi phát âm: ${event.error}. Thử dùng giọng khác hoặc kiểm tra cài đặt.`);
          }
          setIsPlaying(false);
        };

        // Some browsers need a small delay after cancel()
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 50);
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

  // Helper to create and start speech recognition
  const startSpeechRecognition = (retryCount: number = 0) => {
    if (!speechSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
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
        // Reset retry count on success
        setNetworkRetryCount(0);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        setRecognitionError('Không phát hiện giọng nói. Vui lòng nói rõ ràng hơn hoặc nhập thủ công.');
      } else if (event.error === 'audio-capture') {
        setRecognitionError('Không tìm thấy microphone. Vui lòng kiểm tra thiết bị.');
      } else if (event.error === 'not-allowed') {
        setRecognitionError('Quyền truy cập micro bị từ chối.');
      } else if (event.error === 'network') {
        // Retry twice with increasing delay - network errors are usually environmental
        if (retryCount < 2) {
          const delay = (retryCount + 1) * 1000;
          console.log(`🔄 Retrying speech recognition (${retryCount + 1}/2) in ${delay}ms...`);
          setTimeout(() => {
            startSpeechRecognition(retryCount + 1);
          }, delay);
          return;
        }
        setRecognitionError(
          'Nhận diện giọng nói không khả dụng (cần HTTPS hoặc kết nối Internet). Vui lòng nhập câu tiếng Nhật vào ô bên dưới để chấm điểm.',
        );
      } else if (event.error === 'aborted') {
        console.log('Speech recognition aborted by user');
      } else {
        setRecognitionError(`Lỗi nhận diện: ${event.error}. Bạn có thể nhập thủ công.`);
      }
    };

    recognition.onend = () => {
      console.log('🔚 Speech recognition ended');
    };

    try {
      recognition.start();
      console.log('🎤 Speech recognition started' + (retryCount > 0 ? ` (retry ${retryCount})` : ''));
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setRecognitionError('Không thể khởi động nhận diện giọng nói. Bạn vẫn có thể thu âm và nhập thủ công.');
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
      setNetworkRetryCount(0);
      recognitionResultRef.current = null;
      recordedAudioBlobRef.current = null;

      // Start speech recognition
      startSpeechRecognition(0);

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
        recordedAudioBlobRef.current = audioBlob; // Store for fallback STT
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
          // No speech recognition result - try backend fallback with Whisper API
          console.log('No speech recognition result, trying backend fallback...');
          
          if (recordedAudioBlobRef.current) {
            try {
              // Convert blob to base64
              const reader = new FileReader();
              reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                
                try {
                  const result = await pronunciationAPI.speechToText(base64, 'ja');
                  const text = result.text;
                  
                  if (text) {
                    // Calculate score based on text similarity
                    const similarity = calculateTextSimilarity(currentExercise.japanese, text);
                    const finalScore = Math.round(similarity * 100);
                    
                    setLastScore(finalScore);
                    setLastFeedback(getImprovementSuggestions(finalScore)[0] || "Ti\u1ebfp t\u1ee5c luy\u1ec7n tá\u0323p!");
                    setShowResults(true);
                    setUserInput(`Text nh\u1eadn di\u1ec7n: "${text}" (S\u1eed d\u1ee5ng API d\u1ef1 ph\u00f2ng)`);
                    
                    if (finalScore >= 70) {
                      message.success(`\u0110i\u1ec3m s\u1ed1: ${finalScore}/100`);
                    } else {
                      message.warning(`\u0110i\u1ec3m s\u1ed1: ${finalScore}/100`);
                    }
                  }
                } catch (sttError: any) {
                  console.log('Backend STT failed:', sttError.message);
                  // Fall back to manual input
                }
              };
              reader.readAsDataURL(recordedAudioBlobRef.current);
            } catch (error) {
              console.log('Failed to process audio for backend STT:', error);
            }
          }
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
    <div className="min-h-full bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="w-6 h-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-text-main">Luyện phát âm</h1>
          </div>
          <p className="text-text-sub">Nghe mẫu, thu âm và nhận đánh giá phát âm của bạn</p>
        </div>

        {/* Filters */}
        <Card className="mb-4 bg-surface-1 border-border" styles={{ body: { padding: '12px 16px' } }}>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedLevel}
              onChange={setSelectedLevel}
              className="w-24"
              popupMatchSelectWidth={false}
            >
              {levels.map(level => (
                <Option key={level.value} value={level.value}>
                  <span style={{ color: level.color }} className="font-semibold">{level.label}</span>
                </Option>
              ))}
            </Select>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="w-40"
              placeholder="Danh mục"
              popupMatchSelectWidth={false}
            >
              {categories.map(category => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Button
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={handlePreviousExercise}
                disabled={exercises.length <= 1}
                size="small"
              />
              <Text className="text-sm text-text-sub">
                {currentExercise ? `${exercises.findIndex(ex => ex._id === currentExercise._id) + 1}/${exercises.length}` : "0/0"}
              </Text>
              <Button
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNextExercise}
                disabled={exercises.length <= 1}
                size="small"
              />
            </div>
          </div>
        </Card>

        {currentExercise ? (
          <div className="space-y-4">
            {/* Main Exercise Display */}
            <Card className="bg-surface-1 border-border" styles={{ body: { padding: '24px' } }}>
              {/* Difficulty & Category */}
              <div className="flex items-center gap-2 mb-4">
                <Tag color={currentExercise.difficulty === 'easy' ? 'green' : currentExercise.difficulty === 'medium' ? 'orange' : 'red'}>
                  {currentExercise.difficulty === 'easy' ? 'Dễ' : currentExercise.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                </Tag>
                <Tag color="blue">{currentExercise.category}</Tag>
              </div>

              {/* Japanese Text */}
              <div className="text-center mb-6">
                <Title
                  level={1}
                  className="!mb-2 !text-4xl sm:!text-5xl kanji-text"
                >
                  {currentExercise.japanese}
                </Title>
                
                {/* Romaji Toggle */}
                <Button
                  type="link"
                  size="small"
                  icon={showRomaji ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onClick={() => setShowRomaji(!showRomaji)}
                  className="mb-2"
                >
                  {showRomaji ? "Ẩn romaji" : "Hiện romaji"}
                </Button>
                
                {showRomaji && (
                  <Text className="block text-lg text-text-sub mb-2">
                    {currentExercise.romaji}
                  </Text>
                )}
                
                <Text className="block text-text-sub">
                  {currentExercise.vietnamese}
                </Text>
              </div>

              {/* Audio Controls */}
              <div className="flex justify-center gap-3">
                <Button
                  type="primary"
                  size="large"
                  icon={isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  onClick={handlePlayAudio}
                  loading={isPlaying}
                  className="rounded-full px-6"
                >
                  {isPlaying ? "Đang phát..." : "Nghe mẫu"}
                </Button>
                <Button
                  size="large"
                  icon={<Volume2 className="w-5 h-5" />}
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      const utterance = new SpeechSynthesisUtterance(currentExercise.japanese);
                      utterance.rate = 0.6;
                      utterance.pitch = 1;
                      const voices = window.speechSynthesis.getVoices();
                      const jaVoice = voices.find(v => v.lang.includes('ja'));
                      if (jaVoice) utterance.voice = jaVoice;
                      window.speechSynthesis.speak(utterance);
                    }
                  }}
                  className="rounded-full"
                >
                  Phát chậm
                </Button>
              </div>
            </Card>

            {/* Recording Section */}
            <Card className="bg-surface-1 border-border" styles={{ body: { padding: '20px' } }}>
              <div className="flex flex-col items-center">
                {/* Recording Button */}
                <div className="relative mb-4">
                  <Button
                    type={isRecording ? "default" : "primary"}
                    danger={isRecording}
                    shape="circle"
                    icon={<Mic className="w-8 h-8" />}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    loading={isRecording && recordingProgress === 0}
                    className={`!w-20 !h-20 !p-0 !rounded-full flex items-center justify-center ${
                      isRecording ? "animate-pulse !bg-red-500 !border-red-500" : ""
                    }`}
                  />
                  {isRecording && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <Badge status="processing" text={`${Math.ceil((100 - recordingProgress) / 20)}s`} />
                    </div>
                  )}
                </div>

                <Text className="text-text-sub mb-4 text-center">
                  {isRecording ? "Đang thu âm... Nói rõ ràng" : "Nhấn nút để bắt đầu thu âm (3-5 giây)"}
                </Text>

                {/* Progress Bar */}
                {isRecording && (
                  <Progress
                    percent={recordingProgress}
                    status="active"
                    showInfo={false}
                    className="w-full max-w-xs mb-4"
                  />
                )}

                {/* Speech Toggle & HTTPS Warning */}
                {speechSupported && (
                  <div className="w-full max-w-md mt-4 flex flex-wrap items-center gap-2">
                    {!isSecureContext && (
                      <Tag color="warning" className="text-xs">Cần HTTPS để nhận diện giọng nói hoạt động tốt</Tag>
                    )}
                  </div>
                )}

                {/* Recognition Error Message */}
                {recognitionError && (
                  <div className="w-full max-w-md mt-2">
                    <Text className="text-warning text-sm block">⚠️ {recognitionError}</Text>
                  </div>
                )}

              </div>
            </Card>

            {/* Results Section */}
            {showResults && lastScore !== null && (
              <Card className="bg-surface-1 border-border" styles={{ body: { padding: '20px' } }}>
                <div className="flex flex-col items-center">
                  {/* Score Circle */}
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: `conic-gradient(${lastScore >= 80 ? '#22c55e' : lastScore >= 60 ? '#3b82f6' : '#f97316'} ${lastScore * 3.6}deg, #e5e7eb 0deg)`,
                    }}
                  >
                    <div className="w-24 h-24 rounded-full bg-surface-1 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${lastScore >= 80 ? 'text-green-600' : lastScore >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {lastScore}
                      </span>
                      <span className="text-xs text-text-sub">/100</span>
                    </div>
                  </div>

                  {/* Score Status */}
                  <Tag
                    color={lastScore >= 80 ? 'success' : lastScore >= 60 ? 'processing' : 'warning'}
                    className="mb-2 text-base px-4 py-1"
                  >
                    {lastScore >= 90 ? 'Xuất sắc' : lastScore >= 80 ? 'Tốt' : lastScore >= 70 ? 'Khá' : lastScore >= 60 ? 'Trung bình' : 'Cần cải thiện'}
                  </Tag>

                  {/* Feedback */}
                  <Text className="text-text-sub text-center mb-4">
                    {lastFeedback}
                  </Text>

                  {/* Action Buttons */}
                  <Space>
                    {recordedAudioUrl && (
                      <Button
                        icon={<Play className="w-4 h-4" />}
                        onClick={playRecordedAudio}
                      >
                        Nghe lại
                      </Button>
                    )}
                    <Button
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => {
                        if (audioChunksRef.current.length === 0) {
                          message.warning('Chưa có bản ghi âm nào để tải về');
                          return;
                        }
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                        const url = window.URL.createObjectURL(audioBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `recorded_pronunciation_${Date.now()}.wav`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }}
                    >
                      Tải về
                    </Button>
                  </Space>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <EmptyState
            type="data"
            title="Chưa có bài luyện phát âm"
            description="Vui lòng chọn cấp độ khác để luyện tập."
            size="default"
          />
        )}
      </div>
    </div>
  );
};

export default Pronunciation;
