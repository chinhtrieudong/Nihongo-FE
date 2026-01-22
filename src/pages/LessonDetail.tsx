import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { lessonAPI } from "../services/api";
import { useChatMutation } from "../services/aiService";
import VocabularyTable from "../components/VocabularyTable";
import GrammarSectionAccordion from "../components/GrammarSectionAccordion";
import ReorderExercise from "../components/ReorderExercise";
import type {
  LessonDetail as LessonDetailType,
  Lesson,
  Exercise,
  Dialog,
  VocabularyItem,
  GrammarPattern,
  AIRoleplayResponse,
  WeakPointsResponse
} from "../types/lesson";
import {
  Layout,
  Typography,
  Tabs,
  Button,
  Card,
  Input,
  Spin,
  Space,
  Badge,
  Progress,
  List,
  Avatar,
  message
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SoundOutlined,
  TranslationOutlined,
  RobotOutlined,
  TrophyOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type TabType = "vocabulary" | "grammar" | "conversation" | "exercises" | "ai" | "summary";

const LessonDetail: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [chatMutation] = useChatMutation();

  const [lessonDetail, setLessonDetail] = useState<LessonDetailType | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("vocabulary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Practice state
  const [aiMessages, setAiMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Exercise state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string | string[]>>({});
  const [exerciseResults, setExerciseResults] = useState<Record<string, any>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [answerStatus, setAnswerStatus] = useState<Record<string, 'correct' | 'incorrect' | null>>({});

  // Load exercise progress from localStorage on component mount
  useEffect(() => {
    if (lessonId) {
      const savedProgress = localStorage.getItem(`lesson_${lessonId}_exercise_progress`);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          setExerciseAnswers(progress.exerciseAnswers || {});
          setExerciseResults(progress.exerciseResults || {});
          setShowExplanation(progress.showExplanation || {});
          setAnswerStatus(progress.answerStatus || {});
          setCurrentExerciseIndex(progress.currentExerciseIndex || 0);
        } catch (error) {
          console.error('Error loading exercise progress from localStorage:', error);
        }
      }
    }
  }, [lessonId]);

  // Save exercise progress to localStorage whenever it changes
  useEffect(() => {
    if (lessonId) {
      const progress = {
        exerciseAnswers,
        exerciseResults,
        showExplanation,
        answerStatus,
        currentExerciseIndex
      };
      localStorage.setItem(`lesson_${lessonId}_exercise_progress`, JSON.stringify(progress));
    }
  }, [exerciseAnswers, exerciseResults, showExplanation, answerStatus, currentExerciseIndex, lessonId]);

  // Flashcard state
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [showVocabAnswer, setShowVocabAnswer] = useState(false);
  const [hoveredWord, setHoveredWord] = useState<{ word: string, meaning: string, x: number, y: number } | null>(null);
  const [clickedWord, setClickedWord] = useState<{ word: string, meaning: string, x: number, y: number } | null>(null);
  const [showMeaningButton, setShowMeaningButton] = useState<{ word: string, x: number, y: number } | null>(null);
  const [bookmarkedVocab, setBookmarkedVocab] = useState<Set<string>>(new Set());
  const [showDialogTranslation, setShowDialogTranslation] = useState<Record<string, boolean>>({});

  // Load flashcard progress from localStorage on component mount
  useEffect(() => {
    if (lessonId) {
      const savedFlashcardProgress = localStorage.getItem(`lesson_${lessonId}_flashcard_progress`);
      if (savedFlashcardProgress) {
        try {
          const flashcardProgress = JSON.parse(savedFlashcardProgress);
          setCurrentVocabIndex(flashcardProgress.currentVocabIndex || 0);
          setShowVocabAnswer(flashcardProgress.showVocabAnswer || false);
          setBookmarkedVocab(new Set(flashcardProgress.bookmarkedVocab || []));
          setShowDialogTranslation(flashcardProgress.showDialogTranslation || {});
        } catch (error) {
          console.error('Error loading flashcard progress from localStorage:', error);
        }
      }
    }
  }, [lessonId]);

  // Save flashcard progress to localStorage whenever it changes
  useEffect(() => {
    if (lessonId) {
      const flashcardProgress = {
        currentVocabIndex,
        showVocabAnswer,
        bookmarkedVocab: Array.from(bookmarkedVocab),
        showDialogTranslation
      };
      localStorage.setItem(`lesson_${lessonId}_flashcard_progress`, JSON.stringify(flashcardProgress));
    }
  }, [currentVocabIndex, showVocabAnswer, bookmarkedVocab, showDialogTranslation, lessonId]);

  // Lessons list state
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadLessonDetail();
    }
    loadLessons();
  }, [lessonId]);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    // Load voices immediately
    loadVoices();

    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    // Ẩn tooltip khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra xem click có phải là vào nút không
      const target = event.target as HTMLElement;
      if (!target.closest('.meaning-button') && !target.closest('.meaning-tooltip')) {
        setClickedWord(null);
        setShowMeaningButton(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadLessons = async () => {
    setLessonsLoading(true);
    try {
      const response = await lessonAPI.getLessons(currentUser?.id, undefined, 50);
      if (response.success && response.data) {
        setLessons(response.data.lessons);
      }
    } catch (err) {
      console.error("Failed to load lessons:", err);
    } finally {
      setLessonsLoading(false);
    }
  };

  // Text-to-Speech functionality
  const speakText = (text: string, lang: string = 'ja-JP', voiceIndex?: number) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;

      // Get available voices and set specific voice if index is provided
      const voices = window.speechSynthesis.getVoices();
      if (voiceIndex !== undefined && voices[voiceIndex]) {
        utterance.voice = voices[voiceIndex];
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  };

  // Function to speak entire conversation with alternating voices
  const speakEntireConversation = (dialog: Dialog) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported in this browser');
      return;
    }

    // Load voices
    const voices = window.speechSynthesis.getVoices();

    // Find Japanese voices (preferably male and female)
    const japaneseVoices = voices.filter(voice =>
      voice.lang.startsWith('ja') || voice.lang.startsWith('ja-JP')
    );

    // Separate male and female voices if available
    const maleVoices = japaneseVoices.filter(voice =>
      voice.name.toLowerCase().includes('male') ||
      voice.name.toLowerCase().includes('dan') ||
      voice.name.toLowerCase().includes('otoko')
    );

    const femaleVoices = japaneseVoices.filter(voice =>
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('josei') ||
      voice.name.toLowerCase().includes('onna')
    );

    // Fallback to any Japanese voices
    const maleVoice = maleVoices.length > 0 ? maleVoices[0] :
      japaneseVoices.length > 0 ? japaneseVoices[0] : voices[0];
    const femaleVoice = femaleVoices.length > 0 ? femaleVoices[0] :
      japaneseVoices.length > 1 ? japaneseVoices[1] :
        voices.length > 1 ? voices[1] : voices[0];

    let conversationLines: Array<{ speaker: string, text: string }> = [];

    // Extract text from lines if available
    if (dialog.lines && dialog.lines.length > 0) {
      conversationLines = dialog.lines
        .map(line => ({
          speaker: line.speaker,
          text: line.japanese || ''
        }))
        .filter(line => line.text.trim() !== '');
    }
    // Extract text from jpText if available
    else if (dialog.jpText) {
      const parsedLines = parseJpTextToLines(dialog.jpText);
      if (parsedLines.length > 0) {
        conversationLines = parsedLines
          .map(line => ({
            speaker: line.speaker,
            text: line.text || ''
          }))
          .filter(line => line.text.trim() !== '');
      } else {
        // If jpText doesn't have speaker prefixes, treat as single line
        conversationLines = [{
          speaker: "A",
          text: dialog.jpText
        }];
      }
    }

    // Speak each line with appropriate voice
    let currentIndex = 0;
    const speakNextLine = () => {
      if (currentIndex >= conversationLines.length) return;

      const line = conversationLines[currentIndex];
      const isSpeakerA = line.speaker === "A";
      const voice = isSpeakerA ? maleVoice : femaleVoice;

      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.voice = voice;

      utterance.onend = () => {
        currentIndex++;
        // Small delay between lines for natural conversation flow
        setTimeout(speakNextLine, 300);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Start speaking
    speakNextLine();
  };

  const loadLessonDetail = async () => {
    if (!lessonId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await lessonAPI.getLessonDetail(lessonId, currentUser?.id);
      // API mới trả về trực tiếp data, không có success wrapper
      if (response) {
        setLessonDetail(response as LessonDetailType);
      } else {
        setError("Failed to load lesson details");
      }
    } catch (err) {
      setError("Error loading lesson");
      console.error("Failed to load lesson detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWordHover = (word: string, event: React.MouseEvent) => {
    // Debug: Kiểm tra dữ liệu
    console.log('Hover word:', word);
    console.log('Lesson detail vocabularies:', lessonDetail?.vocabularies);

    // Tìm từ trong vocabulary thật
    if (!lessonDetail || !lessonDetail.vocabularies) return;

    const vocab = lessonDetail.vocabularies.find(v =>
      v.kanji === word ||
      v.hiragana === word ||
      v.romaji.toLowerCase() === word.toLowerCase()
    );

    console.log('Found vocab:', vocab);

    if (vocab) {
      setShowMeaningButton({
        word,
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleWordLeave = () => {
    setShowMeaningButton(null);
  };

  const handleShowMeaning = (word: string, event: React.MouseEvent) => {
    // Tìm từ trong vocabulary thật
    if (!lessonDetail || !lessonDetail.vocabularies) return;

    const vocab = lessonDetail.vocabularies.find(v =>
      v.kanji === word ||
      v.hiragana === word ||
      v.romaji.toLowerCase() === word.toLowerCase()
    );

    if (vocab) {
      // Ưu tiên dùng meaning_vi, nếu không có thì dùng mnemonic
      let meaning = vocab.meaning_vi || "";

      // Nếu không có meaning_vi, thử lấy từ mnemonic
      if (!meaning && vocab.mnemonic) {
        // Lấy phần đầu tiên của mnemonic trước dấu :
        if (vocab.mnemonic.includes(':')) {
          meaning = vocab.mnemonic.split(':')[1].trim();
        } else {
          meaning = vocab.mnemonic;
        }
      }

      // Nếu vẫn không có, tạo meaning mặc định
      if (!meaning) {
        meaning = "Đang cập nhật nghĩa...";
      }

      setClickedWord({
        word,
        meaning: meaning,
        x: event.clientX,
        y: event.clientY
      });
      setShowMeaningButton(null);
    }
  };

  const parseJpTextToLines = (jpText: string): Array<{ speaker: string, text: string }> => {
    if (!jpText || typeof jpText !== 'string') return [];

    // Normalize both colon types
    const normalizedText = jpText.replace(/：/g, ':');

    return normalizedText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Match patterns like "A: text" or "B: text"
        const match = line.match(/^(A|B):\s*(.+)$/);
        if (match) {
          return {
            speaker: match[1],
            text: match[2].trim()
          };
        }
        return null;
      })
      .filter((item): item is { speaker: string, text: string } => item !== null);
  };

  const renderTextWithTooltips = (text: string) => {
    // Tách văn bản thành các từ - cải thiện để tách đúng từ tiếng Nhật
    const words = text.split(/(\s+|[。、？！])/);

    return words.map((word, index) => {
      // Bỏ qua khoảng trắng và dấu câu
      if (word.trim() === '' || /[。、？！]/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      // Kiểm tra xem có phải là từ vựng không
      const isVocab = lessonDetail && lessonDetail.vocabularies && lessonDetail.vocabularies.some(v =>
        v.kanji === word ||
        v.hiragana === word ||
        v.romaji.toLowerCase() === word.toLowerCase()
      );

      if (isVocab) {
        return (
          <span
            key={index}
            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded"
            onMouseEnter={(e) => handleWordHover(word, e)}
            onMouseLeave={handleWordLeave}
          >
            {word}
          </span>
        );
      }

      return <span key={index}>{word}</span>;
    });
  };

  const renderConversationLines = (lines: Array<{ speaker: string, japanese?: string, text?: string }>) => {
    return (
      <div className="space-y-4">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`flex-1 px-4 py-3 rounded-xl shadow-sm ${line.speaker === "A"
              ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-secondary-800 dark:text-secondary-200"
              : "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-secondary-800 dark:text-secondary-200"
              }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-xs text-blue-600 dark:text-blue-400 opacity-75">
                  {line.speaker}
                </div>
                <button
                  onClick={() => {
                    const textToSpeak = line.japanese || line.text || '';
                    if (textToSpeak) {
                      speakText(textToSpeak);
                    }
                  }}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs transition-colors flex items-center"
                  title="Nghe phát âm"
                >
                  🔊
                </button>
              </div>
              <div className="text-sm leading-relaxed">
                {renderTextWithTooltips(line.japanese || line.text || '')}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDialogConversation = (dialog: Dialog) => {
    // Priority 1: Use lines if available and has content
    if (dialog.lines && dialog.lines.length > 0) {
      return renderConversationLines(dialog.lines);
    }

    // Priority 2: Parse from jpText if available
    if (dialog.jpText) {
      const parsedLines = parseJpTextToLines(dialog.jpText);
      if (parsedLines.length > 0) {
        return renderConversationLines(parsedLines);
      }

      // Fallback: If jpText doesn't have speaker prefixes, treat as single line
      // Create a synthetic line object for simple jpText
      const syntheticLine = {
        speaker: "A",
        japanese: dialog.jpText,
        text: dialog.jpText
      };
      return renderConversationLines([syntheticLine]);
    }

    // Fallback: Show no data message
    return (
      <div className="text-center py-8 text-secondary-700 dark:text-secondary-400">
        <p>Chưa có dữ liệu hội thoại</p>
      </div>
    );
  };

  const handleAnswerSelect = (exerciseId: string, answer: string | string[]) => {
    setExerciseAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));

    // Find the exercise object
    let exercise: Exercise | undefined;
    if (exerciseId.includes('exercise_')) {
      // Generated ID from index
      const index = parseInt(exerciseId.split('_')[1]);
      exercise = exercises[index]; // This could be undefined
    } else {
      // Real exercise ID
      exercise = exercises.find(ex => ex.id === exerciseId);
    }

    // Safety check
    if (!exercise || !exercises || exercises.length === 0) {
      console.error('Exercise not found or exercises array is empty');
      return;
    }

    let isCorrect = false;

    if (exercise.type === "reorder") {
      // For reorder, compare arrays
      const correctAnswer = Array.isArray(exercise.answer) ? exercise.answer : (exercise.answer as string).split(' ').filter(w => w.trim() !== '');
      const userAnswer = Array.isArray(answer) ? answer : (answer as string).split(' ').filter(w => w.trim() !== '');
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } else {
      // For other types, compare strings
      isCorrect = exercise.answer === answer ||
        (Array.isArray(exercise.answer) ? exercise.answer.join(' ') === answer : false);
    }

    console.log("=== DEBUG COMPARISON ===");
    console.log("User answer:", JSON.stringify(answer));
    console.log("API answer:", JSON.stringify(exercise.answer));
    console.log("API joined:", JSON.stringify(Array.isArray(exercise.answer) ? exercise.answer.join(' ') : 'N/A'));
    console.log("Is correct:", isCorrect);
    console.log("=== END DEBUG ===");

    setAnswerStatus(prev => ({
      ...prev,
      [exerciseId]: isCorrect ? 'correct' : 'incorrect'
    }));

    // Only show explanation if answer is correct
    if (isCorrect) {
      setShowExplanation(prev => ({
        ...prev,
        [exerciseId]: true
      }));
    } else {
      // Hide explanation if answer is incorrect
      setShowExplanation(prev => ({
        ...prev,
        [exerciseId]: false
      }));
    }
  };

  const handleExerciseSubmit = async (exerciseId?: string, answer?: string) => {
    console.log("handleExerciseSubmit called");
    console.log("lessonId:", lessonId);
    console.log("currentUser:", currentUser);
    console.log("exerciseId param:", exerciseId);

    // Temporarily bypass currentUser check for testing
    if (!lessonId) {
      console.log("Submission aborted: lessonId is missing.");
      return;
    }

    try {
      // Prepare answers array for the new API format
      const answers = Object.entries(exerciseAnswers).map(([id, ans]) => ({
        exerciseId: id,
        answer: Array.isArray(ans) ? ans[0] || "" : (typeof ans === 'string' ? ans : "")
      }));

      // If specific exerciseId is provided, submit only that exercise
      if (exerciseId && answer) {
        const specificAnswer = [{
          exerciseId,
          answer
        }];

        const response = await lessonAPI.submitExercises(lessonId, specificAnswer);
        if (response.success && response.data) {
          // Update results for the specific exercise
          const result = response.data.results.find((r: any) => r.exerciseId === exerciseId);
          if (result) {
            setExerciseResults(prev => ({
              ...prev,
              [exerciseId]: result
            }));
          }
        }
      } else {
        // Submit all answered exercises
        const response = await lessonAPI.submitExercises(lessonId, answers);
        if (response.success && response.data) {
          // Update results for all exercises
          const newResults: Record<string, any> = {};
          response.data.results.forEach((result: any) => {
            newResults[result.exerciseId] = result;
          });
          setExerciseResults(prev => ({
            ...prev,
            ...newResults
          }));
        }
      }
    } catch (err) {
      console.error("Exercise submission error:", err);
    }
  };

  const handleAllExercisesSubmit = async () => {
    await handleExerciseSubmit();
  };

  const handleMarkLessonComplete = async () => {
    if (!lessonId || !currentUser) {
      console.error("Missing lessonId or currentUser");
      return;
    }

    try {
      setLoading(true);
      const completedItems = {
        vocabulary: lessonDetail?.vocabularies?.map(v => v.id) || [],
        grammar: lessonDetail?.grammars?.map(g => g.id) || [],
        exercises: Object.keys(exerciseAnswers)
      };

      await lessonAPI.updateProgress(lessonId, {
        userId: currentUser.id,
        status: "completed",
        score: 100, // You might want to calculate this based on actual performance
        timeSpent: 0, // You might want to track actual time spent
        completedItems
      });

      // Refresh lessons list to show updated status
      await loadLessons();

      // Show success message or update UI
      alert("Bài học đã được đánh dấu là hoàn thành!");

      // Clear exercise progress from localStorage after marking lesson complete
      localStorage.removeItem(`lesson_${lessonId}_exercise_progress`);

      // Clear flashcard progress from localStorage after marking lesson complete
      localStorage.removeItem(`lesson_${lessonId}_flashcard_progress`);

      // Reset exercise state
      setExerciseAnswers({});
      setExerciseResults({});
      setShowExplanation({});
      setAnswerStatus({});
      setCurrentExerciseIndex(0);

      // Reset flashcard state
      setCurrentVocabIndex(0);
      setShowVocabAnswer(false);
      setBookmarkedVocab(new Set());
      setShowDialogTranslation({});
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
      alert("Có lỗi xảy ra khi đánh dấu bài học hoàn thành. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (vocabId: string) => {
    setBookmarkedVocab(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vocabId)) {
        newSet.delete(vocabId);
      } else {
        newSet.add(vocabId);
      }
      return newSet;
    });
  };

  const nextVocab = () => {
    if (lessonDetail && currentVocabIndex < lessonDetail.vocabularies.length - 1) {
      setCurrentVocabIndex(prev => prev + 1);
      setShowVocabAnswer(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    console.log('Attempting to play audio:', audioUrl);
    // Dùng audio file từ public folder
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error("Audio playback failed:", err);
      // Fallback to TTS if audio fails
      console.log('Falling back to TTS...');
      return false; // Indicate failure
    });
    return true; // Indicate success
  };

  const handleAIMessage = async () => {
    if (!currentMessage.trim() || !lessonId || !currentUser) return;

    const userMessage = {
      role: "user" as const,
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message to the conversation
    setAiMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setAiLoading(true);

    try {
      const chatRequest = {
        userId: currentUser.id,
        lessonId,
        messages: [...aiMessages, userMessage],
        context: {
          currentLesson: lesson?.title || "",
          learnedVocabulary: vocabularies?.map(v => v.kanji) || [],
          learnedGrammar: grammars?.map(g => g.pattern) || [],
          difficulty: "medium" as const,
        },
      };

      const response = await chatMutation(chatRequest).unwrap();

      if (response.success && response.data) {
        const aiMessage = {
          role: "assistant" as const,
          content: response.data.message.content,
          timestamp: response.data.message.timestamp,
        };
        setAiMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      // Add error message
      const errorMessage = {
        role: "assistant" as const,
        content: "ごめんなさい。エラーが発生しました。もう一度お試しください。(Sorry, an error occurred. Please try again.)",
        timestamp: new Date().toISOString(),
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !lessonDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="text-center">
          <Title level={2} type="danger">Error</Title>
          <Text type="secondary">{error || "Lesson not found"}</Text>
        </Card>
      </div>
    );
  }

  const { lesson, vocabularies = [], grammars = [], dialogs = [], exercises = [] } = lessonDetail || {};

  return (
    <Layout className="" style={{ background: 'var(--ant-color-bg-container)', paddingRight: '256px' }}>
      {/* Main Content */}
      <Layout>
        <Header className="bg-white dark:bg-secondary-925 border-b border-secondary-200 dark:border-secondary-900 px-6" style={{ height: 'auto', padding: '24px' }}>
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="mb-2">
                {lesson?.lessonNumber}. {lesson?.title}
              </Title>
              <Text type="secondary">{lesson?.description}</Text>
            </div>
          </div>
        </Header>

        <Content className="flex-1">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as TabType)}
            className="bg-white dark:bg-secondary-925"
            style={{ margin: '0', padding: "0 10px " }}
            items={[
              {
                key: "vocabulary",
                label: (
                  <span>
                    <BookOutlined />
                    TỪ VỰNG
                  </span>
                ),
                children: (
                  <>
                    <VocabularyTable
                      data={vocabularies.map(vocab => {
                        // Parse kanji_analysis array để lấy Hán Việt
                        let hanViet = "";

                        if (vocab.kanji_analysis && Array.isArray(vocab.kanji_analysis) && vocab.kanji_analysis.length > 0) {
                          // Ghép tất cả hanviet từ các chữ
                          hanViet = vocab.kanji_analysis.map(item => item.hanviet).join(", ");
                        }

                        return {
                          id: vocab.id,
                          kanji: vocab.kanji,
                          hiragana: vocab.hiragana, // Giữ nguyên field hiragana
                          katakana: vocab.katakana,
                          kana: vocab.hiragana || vocab.katakana || "", // Tạo kana từ hiragana/katakana
                          romaji: vocab.romaji,
                          hanviet: hanViet || vocab.hanviet, // Dùng hanViet đã parse từ kanji_analysis hoặc gốc
                          meaning_vi: vocab.meaning_vi, // Dùng meaning_vi từ API
                          exampleSentence: vocab.example_jp,
                          example_jp: vocab.example_jp || "",
                          example_vi: vocab.example_vi, // Thêm example_vi từ API
                          audioUrl: vocab.audio_url || vocab.audioUrl,
                          audio_url: vocab.audio_url || vocab.audioUrl || "",
                          difficulty: vocab.difficulty,
                          frequency: vocab.frequency,
                          kanji_analysis: vocab.kanji_analysis, // Thêm kanji_analysis từ API
                          is_starred: bookmarkedVocab.has(vocab.id),
                          is_mastered: false,
                          status: undefined
                        };
                      })}
                      loading={loading}
                    />
                  </>
                )
              },
              {
                key: "grammar",
                label: (
                  <span>
                    <BookOutlined />
                    NGỮ PHÁP
                  </span>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <div className="mb-4">
                      <Title level={3}>NGỮ PHÁP</Title>
                      <Text type="secondary">Học ngữ pháp theo giáo trình Minna no Nihongo</Text>
                    </div>

                    <Card className="bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
                      <div className="mb-4">
                        <Title level={4}>Ngữ pháp bài {lesson?.lessonNumber}</Title>
                      </div>

                      {grammars.length > 0 ? (
                        <GrammarSectionAccordion sections={grammars.map((grammar, index) => ({
                          id: `section${index + 1}`,
                          title: grammar.pattern || `Ngữ pháp ${index + 1}`,
                          structure: grammar.structure ? [grammar.structure] : [grammar.pattern || ''],
                          meaning: grammar.meaning_vi ? [grammar.meaning_vi] : (grammar.meaning ? [grammar.meaning] : ['']),
                          examples: grammar.examples?.map(ex => ({
                            japanese: ex.japanese,
                            vietnamese: ex.vietnamese || ex.meaning || ''
                          })) || [],
                          comparison: (grammar.comparison) ? [grammar.comparison] : []
                        }))} />
                      ) : (
                        <div className="text-center py-8">
                          <Text type="secondary" className="text-secondary-600 dark:text-secondary-800">Chưa có dữ liệu ngữ pháp cho bài học này.</Text>
                        </div>
                      )}
                    </Card>
                  </div>
                )
              },
              {
                key: "conversation",
                label: (
                  <span>
                    <MessageOutlined />
                    HỘI THOẠI
                  </span>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <Title level={3} className="mb-6">HỘI THOẠI</Title>
                    <Space direction="vertical" size="large" className="w-full">
                      {dialogs.map((dialog, index) => (
                        <Card key={dialog.id || index} className="bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
                          <Title level={4}>{dialog.title || `Hội thoại ${index + 1}`}</Title>
                          <Paragraph type="secondary">{dialog.scenario || "Thực hành hội thoại theo bài học"}</Paragraph>

                          {renderDialogConversation(dialog)}

                          {/* Translation Section */}
                          {dialog.viTranslation && (
                            <div className="mt-4">
                              <Button
                                icon={<TranslationOutlined />}
                                onClick={() => setShowDialogTranslation(prev => ({
                                  ...prev,
                                  [dialog.id || index]: !prev[dialog.id || index]
                                }))}
                              >
                                {showDialogTranslation[dialog.id || index] ? "Ẩn nghĩa" : "Xem nghĩa"}
                              </Button>

                              {showDialogTranslation[dialog.id || index] && (
                                <Card className="mt-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                  <Title level={5}>Bản dịch tiếng Việt:</Title>
                                  <Paragraph className="whitespace-pre-line">
                                    {dialog.viTranslation}
                                  </Paragraph>
                                </Card>
                              )}
                            </div>
                          )}

                          {/* Audio Section */}
                          <div className="mt-4 text-center">
                            {dialog.audioUrl ? (
                              <Button
                                type="primary"
                                icon={<SoundOutlined />}
                                onClick={() => {
                                  console.log('Audio URL:', dialog.audioUrl);
                                  const audio = new Audio(dialog.audioUrl!);
                                  audio.play().catch(err => {
                                    console.error("Audio playback failed:", err);
                                    console.log('Falling back to TTS...');
                                    speakEntireConversation(dialog);
                                  });
                                }}
                              >
                                Nghe âm thanh
                              </Button>
                            ) : (
                              <Button
                                icon={<SoundOutlined />}
                                onClick={() => speakEntireConversation(dialog)}
                              >
                                Nghe hội thoại
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </Space>
                  </div>
                )
              },
              {
                key: "exercises",
                label: (
                  <span>
                    <BookOutlined />
                    BÀI TẬP
                  </span>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <Title level={3} className="mb-6">BÀI TẬP</Title>

                    {/* Exercise Summary */}
                    {(Object.keys(exerciseResults).length > 0 || Object.keys(exerciseAnswers).length === exercises.length) && (
                      <Card className="mb-6 bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
                        <Title level={4}>Kết quả tổng hợp</Title>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <Title level={2} style={{ color: '#1890ff' }}>
                              {Object.keys(exerciseResults).length || Object.keys(exerciseAnswers).length}
                            </Title>
                            <Text type="secondary">Đã làm</Text>
                          </div>
                          <div className="text-center">
                            <Title level={2} style={{ color: '#52c41a' }}>
                              {Object.values(answerStatus).filter(status => status === 'correct').length}
                            </Title>
                            <Text type="secondary">Đúng</Text>
                          </div>
                          <div className="text-center">
                            <Title level={2} style={{ color: '#ff4d4f' }}>
                              {Object.values(answerStatus).filter(status => status === 'incorrect').length}
                            </Title>
                            <Text type="secondary">Sai</Text>
                          </div>
                        </div>

                        {/* Completion Message */}
                        {Object.keys(exerciseAnswers).length === exercises.length && (
                          <Card className="mt-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🎉</div>
                              <Title level={4} type="success" className="mb-2">
                                Xuất sắc! Bạn đã hoàn thành tất cả bài tập!
                              </Title>
                              <Paragraph type="success" className="mb-4">
                                Bạn đã nắm vững từ vựng, ngữ pháp và cấu trúc câu cơ bản của bài học này.
                              </Paragraph>
                              <Space className="justify-center">
                                <Button
                                  type="primary"
                                  icon={<RobotOutlined />}
                                  onClick={() => setActiveTab("ai")}
                                >
                                  Luyện tập với AI
                                </Button>
                                <Button
                                  icon={<TrophyOutlined />}
                                  onClick={() => setActiveTab("summary")}
                                >
                                  Xem tổng kết
                                </Button>
                                <Button
                                  type="primary"
                                  icon={<CheckCircleOutlined />}
                                  onClick={handleMarkLessonComplete}
                                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                >
                                  Hoàn thành bài học
                                </Button>
                              </Space>
                              <Text type="secondary" className="block mt-4">
                                Hoặc chọn bài tiếp theo ở sidebar để tiếp tục lộ trình học
                              </Text>
                            </div>
                          </Card>
                        )}

                        {/* Only show submit button if not all exercises are completed */}
                        {Object.keys(exerciseAnswers).length < exercises.length && (
                          <Button
                            type="primary"
                            onClick={handleAllExercisesSubmit}
                            className="mt-4 w-full"
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                          >
                            Nộp tất cả bài tập
                          </Button>
                        )}
                      </Card>
                    )}

                    {exercises.length > 0 && (
                      <Card className="bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
                        <div className="flex justify-between items-center mb-4">
                          <Title level={4}>
                            Bài tập {currentExerciseIndex + 1}
                          </Title>
                          <Text type="secondary">
                            {currentExerciseIndex + 1} / {exercises.length}
                          </Text>
                        </div>

                        <div className="mb-6">
                          <Paragraph className="text-lg mb-4">{exercises[currentExerciseIndex].question}</Paragraph>

                          {exercises[currentExerciseIndex].type === "multiple-choice" && (
                            <Space direction="vertical" className="w-full">
                              {(exercises[currentExerciseIndex].content?.options || exercises[currentExerciseIndex].options)?.map((option, index) => {
                                const exerciseId = exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`;
                                const isSelected = exerciseAnswers[exerciseId] === option;
                                const status = answerStatus[exerciseId];

                                return (
                                  <Card
                                    key={index}
                                    className={`cursor-pointer transition-colors ${isSelected && status === 'correct'
                                      ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                                      : isSelected && status === 'incorrect'
                                        ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                                        : 'hover:bg-secondary-100 dark:hover:bg-secondary-900'
                                      } bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900`}
                                    onClick={() => handleAnswerSelect(exerciseId, option)}
                                  >
                                    <Space>
                                      <input
                                        type="radio"
                                        name="exercise"
                                        value={option}
                                        checked={isSelected}
                                        onChange={(e) => handleAnswerSelect(exerciseId, e.target.value)}
                                        className="mr-3"
                                      />
                                      <Text className={isSelected && status === 'correct' ? 'text-green-700 dark:text-green-400 font-medium' : isSelected && status === 'incorrect' ? 'text-red-700 dark:text-red-400' : ''}>
                                        {option}
                                      </Text>
                                    </Space>
                                  </Card>
                                );
                              })}
                            </Space>
                          )}

                          {(exercises[currentExerciseIndex].type === "fill_blank" || exercises[currentExerciseIndex].type === "fill-blank") && (
                            <Input
                              placeholder="Type your answer..."
                              value={String(exerciseAnswers[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`] || "")}
                              onChange={(e) => handleAnswerSelect(exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`, e.target.value)}
                              className={`mb-4 ${answerStatus[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`] === 'correct'
                                ? 'border-green-300 bg-green-50'
                                : answerStatus[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`] === 'incorrect'
                                  ? 'border-red-300 bg-red-50'
                                  : ''
                                }`}
                              size="large"
                            />
                          )}

                          {exercises[currentExerciseIndex].type === "reorder" && (
                            <ReorderExercise
                              exercise={exercises[currentExerciseIndex]}
                              setAnswer={(answer) => setExerciseAnswers(prev => ({
                                ...prev,
                                [exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`]: answer as string
                              }))}
                              onAnswerSelect={handleAnswerSelect}
                              answerStatus={answerStatus[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`]}
                              exerciseAnswers={exerciseAnswers}
                              exerciseId={exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`}
                            />
                          )}
                        </div>

                        {/* Show explanation immediately when answer is selected */}
                        {showExplanation[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`] && (
                          <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <Title level={5} style={{ color: '#1890ff' }}>💡 Giải thích:</Title>
                            <Text type="secondary">
                              {exercises[currentExerciseIndex].explanation}
                            </Text>
                          </Card>
                        )}

                        {exerciseResults[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`] && (
                          <Card className={`mb-4 ${exerciseResults[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`].isCorrect
                            ? 'border-green-200 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                            : 'border-red-200 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                            } bg-white dark:bg-secondary-925`}>
                            <Title level={5} type={exerciseResults[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`].isCorrect ? 'success' : 'danger'}>
                              {exerciseResults[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`].isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                            </Title>
                            <Paragraph>
                              {exerciseResults[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`].explanation}
                            </Paragraph>
                            {exerciseResults[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`].feedback && (
                              <Paragraph type="secondary">
                                {exerciseResults[exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`].feedback}
                              </Paragraph>
                            )}
                          </Card>
                        )}

                        <div className="flex justify-between">
                          <Button
                            icon={<LeftOutlined />}
                            onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentExerciseIndex === 0}
                          >
                            Trước
                          </Button>

                          {exercises[currentExerciseIndex]?.type === "reorder" && (
                            <Button
                              type="primary"
                              onClick={() => {
                                const exerciseId = exercises[currentExerciseIndex].id || `exercise_${currentExerciseIndex}`;
                                const currentAnswer = exerciseAnswers[exerciseId];
                                const answerToSubmit = Array.isArray(currentAnswer)
                                  ? currentAnswer[0] || ""
                                  : (typeof currentAnswer === 'string' ? currentAnswer : "");
                                handleAnswerSelect(exerciseId, answerToSubmit);
                              }}
                            >
                              Xác nhận sắp xếp
                            </Button>
                          )}

                          <Button
                            icon={<RightOutlined />}
                            onClick={() => setCurrentExerciseIndex(prev => Math.min(exercises.length - 1, prev + 1))}
                            disabled={currentExerciseIndex === exercises.length - 1}
                          >
                            Tiếp theo
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                )
              },
              {
                key: "ai",
                label: (
                  <span>
                    <RobotOutlined />
                    LUYỆN VỚI AI
                  </span>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <Title level={3} className="mb-6">LUYỆN VỚI AI</Title>
                    <Card className="max-w-4xl mx-auto bg-white dark:bg-secondary-925 border-secondary-200 dark:border-secondary-900">
                      <div className="mb-4">
                        <Title level={4} className="mb-2">Luyện tập với AI theo bài Minna</Title>
                        <Text type="secondary">Hãy thực hành hội thoại theo ngữ pháp của bài {lesson.lessonNumber}</Text>
                      </div>

                      <div className="h-96 border border-secondary-200 dark:border-secondary-900 rounded-lg p-4 overflow-y-auto mb-4" style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
                        {aiMessages.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <Text type="secondary">Bắt đầu cuộc hội thoại với AI...</Text>
                          </div>
                        ) : (
                          <Space direction="vertical" className="w-full">
                            {aiMessages.map((message, index) => (
                              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                <Card
                                  className={`max-w-md ${message.role === "user" ? "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700" : "bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700"}`}
                                  size="small"
                                >
                                  <Text strong className="text-sm">{message.role === "user" ? "You" : "AI"}</Text>
                                  <div className="text-sm mt-1">{message.content}</div>
                                </Card>
                              </div>
                            ))}
                          </Space>
                        )}
                      </div>

                      <Space className="w-full">
                        <Input
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              handleAIMessage();
                            }
                          }}
                          className="flex-1 bg-white dark:bg-secondary-925 border-secondary-300 dark:border-secondary-700"
                          size="large"
                        />
                        <Button
                          type="primary"
                          onClick={handleAIMessage}
                          disabled={!currentMessage.trim() || aiLoading}
                          loading={aiLoading}
                          size="large"
                        >
                          Gửi
                        </Button>
                      </Space>
                    </Card>
                  </div>
                )
              },
              {
                key: "summary",
                label: (
                  <span>
                    <TrophyOutlined />
                    TỔNG KẾT
                  </span>
                ),
                children: (
                  <div style={{ padding: '24px' }}>
                    <Title level={3} className="mb-6">TỔNG KẾT</Title>
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <Title level={4} className="mb-4">📚 Từ vựng trọng tâm</Title>
                          <Space direction="vertical" className="w-full">
                            {vocabularies.slice(0, 5).map((vocab) => (
                              <Card key={vocab.id} size="small" className="bg-secondary-50 dark:bg-secondary-925">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <Text strong>{vocab.kanji}</Text>
                                    <Text type="secondary" className="ml-2">({vocab.hiragana})</Text>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </Space>
                        </Card>

                        <Card>
                          <Title level={4} className="mb-4">📘 Ngữ pháp chính</Title>
                          <Space direction="vertical" className="w-full">
                            {grammars.map((grammar) => (
                              <Card key={grammar.id} size="small" className="bg-secondary-50 dark:bg-secondary-925">
                                <Text strong>{grammar.pattern}</Text>
                              </Card>
                            ))}
                          </Space>
                        </Card>
                      </div>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </Content>
      </Layout>

      {/* Meaning Button */}
      {showMeaningButton && (
        <Button
          className="fixed z-50"
          style={{
            left: `${showMeaningButton.x}px`,
            top: `${showMeaningButton.y + 20}px`,
            transform: 'translateX(-50%)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '12px'
          }}
          type="primary"
          size="small"
          onClick={(e) => handleShowMeaning(showMeaningButton.word, e)}
        >
          📖 Xem nghĩa
        </Button>
      )}

      {/* Word Meaning Tooltip */}
      {clickedWord && (
        <div
          className="fixed z-50 meaning-tooltip bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 max-w-xs"
          style={{
            left: `${clickedWord.x}px`,
            top: `${clickedWord.y + 20}px`,
            transform: 'translateX(-50%)',
            minWidth: '200px'
          }}
        >
          <div className="space-y-2">
            <div className="font-bold text-lg text-gray-900 dark:text-white">
              {clickedWord.word}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {clickedWord.meaning || "Không có nghĩa"}
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Debug: {JSON.stringify(clickedWord)}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Lesson List */}
      <Sider
        width={256}
        collapsedWidth={0}
        breakpoint="lg"
        className="bg-white dark:bg-secondary-925 border-l border-secondary-200 dark:border-secondary-900 fixed right-0 overflow-y-hidden"
        style={{ zIndex: 1000, top: '64px', height: 'calc(100vh - 64px)' }}
      >
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-900 flex-shrink-0">
          <Title level={4}>Danh sách bài học</Title>
          <Text type="secondary">Giáo trình Minna no Nihongo</Text>
        </div>

        <div className="" style={{ height: 'calc(100vh - 152px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
          {lessonsLoading ? (
            <div className="p-8 text-center">
              <Spin size="large" className="mb-4" />
              <Text type="secondary">Đang tải danh sách bài học...</Text>
            </div>
          ) : (
            <Space orientation="vertical" className="w-full p-2">
              {lessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  hoverable
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                  className={`${lessonId === lesson.id ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  size="small"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Text type="secondary" className="text-sm">
                      Lesson {lesson.lessonNumber}
                    </Text>
                    <Badge
                      status={lesson.status === 'completed' ? 'success' : lesson.status === 'in_progress' ? 'processing' : 'default'}
                      text={lesson.status === 'completed' ? '✔' : lesson.status === 'in_progress' ? '🔄' : '⏳'}
                    />
                  </div>
                  <Text strong className="block mb-1">
                    {lesson.title}
                  </Text>
                  {lesson.progress > 0 && (
                    <Progress
                      percent={lesson.progress}
                      showInfo={false}
                      strokeColor="#1890ff"
                      size="small"
                    />
                  )}
                </Card>
              ))}
            </Space>
          )}
        </div>
      </Sider>
    </Layout >
  );
};

export default LessonDetail;
