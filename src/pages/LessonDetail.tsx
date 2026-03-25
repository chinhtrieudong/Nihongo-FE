import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { lessonAPI, vocabularyAPI, aiAPI, minaApi as minnaJsonApi } from "../services/api";
import { useLessonDetail } from "../hooks/useLessonDetail";
import GrammarTab from "./lesson-detail/GrammarTab";
import ConversationTab from "./lesson-detail/ConversationTab";
import ExercisesTab from "./lesson-detail/ExercisesTab";
import VocabularyTab from "./lesson-detail/VocabularyTab";
import AiPracticeTab from "./lesson-detail/AiPracticeTab";
import type {
  LessonDetail as LessonDetailType,
  Exercise,
  Dialog,
  Lesson,
} from "../types/lesson";
import {
  Layout,
  Typography,
  Tabs,
  Badge,
  Button,
  Card,
  Spin,
  Tag,
  Select,
} from "antd";
import {
  ReadOutlined,
  PlayCircleOutlined,
  MessageOutlined,
  RobotOutlined,
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Grid } from "antd";
import { getBestFemaleNaturalVoice, getNanamiNaturalVoice } from "../utils/vocabularyUtils";
import InfinitejapaneseIcon from "../components/icons/InfinitejapaneseIcon";
import LetterUppercaseSquareFIcon from "../components/icons/LetterUppercaseSquareFIcon";
import type { VocabularyTableHandle } from "../components/VocabularyTable";

const { Content } = Layout;
const { Title, Text } = Typography;

type TabType =
  | "vocabulary"
  | "grammar"
  | "conversation"
  | "exercises"
  | "ai"
  | "renshuu"
  | "reibun"
  | "bunkei";

const LessonDetail: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();

  // Use new lesson detail hook for metadata and progress
  const lessonNum = lessonNumber ? parseInt(lessonNumber) : 0;

  // Debug log to see what we're getting
  // console.log('🔍 Lesson number from URL:', lessonNumber);
  // console.log('🔍 Parsed lesson number:', lessonNum);
  const {
    loading: detailLoading,
    error: detailError,
  } = useLessonDetail(lessonNum);
  const [lessonDetail, setLessonDetail] = useState<LessonDetailType | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TabType>("vocabulary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vocabularyTableRef = useRef<VocabularyTableHandle | null>(null);
  const [femaleVoiceName, setFemaleVoiceName] = useState(() => {
    try {
      return localStorage.getItem("tts_voice_female") || "";
    } catch {
      return "";
    }
  });

  const {
    lesson,
    vocabularies = [],
    grammars = [],
    dialogs = [],
    exercises = [],
    renshuuData = [],
    reibunData = [],
    bunkeiData = [],
  } = lessonDetail || {};

  // Update loading and error to use hook states
  const combinedLoading = loading || detailLoading;
  const combinedError = error || detailError;

  // AI Practice state
  const [aiMessages, setAiMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Exercise state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<
    Record<string, string | string[]>
  >({});
  const [exerciseResults, setExerciseResults] = useState<Record<string, any>>(
    {},
  );
  const [showExplanation, setShowExplanation] = useState<
    Record<string, boolean>
  >({});
  const [answerStatus, setAnswerStatus] = useState<
    Record<string, "correct" | "incorrect" | null>
  >({});
  const [exercisesCompleted, setExercisesCompleted] = useState(false);

  // Load exercise progress from localStorage on component mount
  useEffect(() => {
    if (lessonNum) {
      const savedProgress = localStorage.getItem(
        `lesson_${lessonNum}_exercise_progress`,
      );
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          setExerciseAnswers(progress.exerciseAnswers || {});
          setExerciseResults(progress.exerciseResults || {});
          setShowExplanation(progress.showExplanation || {});
          setAnswerStatus(progress.answerStatus || {});
          setCurrentExerciseIndex(progress.currentExerciseIndex || 0);
        } catch (error) {
          // Error loading exercise progress from localStorage
        }
      }
    }
  }, [lessonNum]);

  // Save exercise progress to localStorage whenever it changes
  useEffect(() => {
    if (lessonNum) {
      const progress = {
        exerciseAnswers,
        exerciseResults,
        showExplanation,
        answerStatus,
        currentExerciseIndex,
      };
      localStorage.setItem(
        `lesson_${lessonNum}_exercise_progress`,
        JSON.stringify(progress),
      );
    }
  }, [
    exerciseAnswers,
    exerciseResults,
    showExplanation,
    answerStatus,
    currentExerciseIndex,
    lessonNum,
  ]);

  // Flashcard state
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [showVocabAnswer, setShowVocabAnswer] = useState(false);
  const [clickedWord, setClickedWord] = useState<{
    word: string;
    meaning: string;
    x: number;
    y: number;
  } | null>(null);
  const [showMeaningButton, setShowMeaningButton] = useState<{
    word: string;
    x: number;
    y: number;
  } | null>(null);
  const [bookmarkedVocab, setBookmarkedVocab] = useState<Set<string>>(
    new Set(),
  );
  const [showDialogTranslation, setShowDialogTranslation] = useState<
    Record<string, boolean>
  >({});

  // Load flashcard progress from localStorage on component mount
  useEffect(() => {
    if (lessonNum) {
      const savedFlashcardProgress = localStorage.getItem(
        `lesson_${lessonNum}_flashcard_progress`,
      );
      if (savedFlashcardProgress) {
        try {
          const flashcardProgress = JSON.parse(savedFlashcardProgress);
          setCurrentVocabIndex(flashcardProgress.currentVocabIndex || 0);
          setShowVocabAnswer(flashcardProgress.showVocabAnswer || false);
          setBookmarkedVocab(new Set(flashcardProgress.bookmarkedVocab || []));
          setShowDialogTranslation(
            flashcardProgress.showDialogTranslation || {},
          );
        } catch (error) {
          // Error loading flashcard progress from localStorage
        }
      }
    }
  }, [lessonNum]);

  // Save flashcard progress to localStorage whenever it changes
  useEffect(() => {
    if (lessonNum) {
      const flashcardProgress = {
        currentVocabIndex,
        showVocabAnswer,
        bookmarkedVocab: Array.from(bookmarkedVocab),
        showDialogTranslation,
      };
      localStorage.setItem(
        `lesson_${lessonNum}_flashcard_progress`,
        JSON.stringify(flashcardProgress),
      );
    }
  }, [
    currentVocabIndex,
    showVocabAnswer,
    bookmarkedVocab,
    showDialogTranslation,
    lessonNum,
  ]);

  // Lessons list state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const loadLessonDetail = useCallback(async () => {
    if (!Number.isFinite(lessonNum) || lessonNum < 1 || lessonNum > 50) {
      setError("Mã bài học không hợp lệ");
      setLessonDetail(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const lessonNumber = lessonNum;

      // Get lesson metadata from bunkei API (has the most complete lesson info)
      let lessonMetadata = {
        id: `lesson_${lessonNum}`,
        lesson_number: lessonNumber,
        title: `Bài ${lessonNumber}`, // fallback
        level: "N5" as const,
        description: `Nội dung bài học ${lessonNumber}`,
        status: "not_started" as const,
        progress: 0,
        image_url: undefined
      };

      // Try to get lesson metadata from bunkei API first (most complete)
      try {
        const bunkeiCheckResponse = await minnaJsonApi.get(`/lessons/${lessonNumber}/bunkei`);
        if (bunkeiCheckResponse.data.success && bunkeiCheckResponse.data.lesson) {
          const lessonData = bunkeiCheckResponse.data.lesson;
          lessonMetadata = {
            id: `lesson_${lessonNum}`,
            lesson_number: lessonData.lessonNumber || lessonNumber,
            title: lessonData.title_vi || lessonData.title || `Bài ${lessonNumber}`,
            level: lessonData.level || "N5",
            description: lessonData.description_vi || lessonData.description_jp || `Nội dung bài học ${lessonNumber}`,
            status: "not_started" as const,
            progress: 0,
            image_url: undefined
          };
        }
      } catch (lessonErr) {
        // Failed to load lesson metadata
      }

      // Get vocabulary
      let vocabularies = [];
      try {
        const vocabResponse = await vocabularyAPI.getVocabularyByLesson(lessonNumber);
        if (vocabResponse.success && vocabResponse.data && Array.isArray(vocabResponse.data)) {
          vocabularies = vocabResponse.data.map((item: any) => ({
            id: item.kanji || item.hiragana,
            kanji: item.kanji,
            hiragana: item.hiragana,
            katakana: item.katakana || null,
            romaji: item.romaji,
            hanviet: item.hanviet,
            meaning_vi: item.meaningVi,
            meaning_en: item.meaningEn || "",
            example_jp: item.exampleSentence,
            example_vi: item.exampleSentenceVi || item.exampleSentence,
            example_en: item.exampleEn || "",
            audio_url: item.audioUrl,
            difficulty: item.difficulty || "easy",
            frequency: item.frequency || "high",
            kanji_analysis: item.kanji_analysis || [],
            jlpt: item.jlpt || item.jpt || "N5",
            jpt: item.jpt,
            mnemonic: item.mnemonic || "",
            part_of_speech: item.part_of_speech || "",
            notes: item.notes || ""
          }));
        }
      } catch (vocabErr) {
        // Failed to load vocabulary
      }

      // Get grammar
      let grammars = [];
      try {
        const grammarResponse = await minnaJsonApi.get(`/lessons/${lessonNumber}/grammar`);
        if (grammarResponse.data.success) {
          grammars = grammarResponse.data.data.map((item: any) => ({
            id: item.id,
            pattern: item.pattern,
            meaning_vi: item.explanation || '',
            usage_vi: item.explanation || '',
            structure: item.structure || '',
            comparisons: [],
            examples: item.examples ? item.examples.map((ex: any) => ({
              japanese: ex.japanese || '',
              vietnamese: ex.vietnamese || ''
            })) : [],
            level: item.level,
            importance: 'medium'
          }));
        }
      } catch (grammarErr) {
        // Failed to load grammar
      }

      // Get kaiwa (conversation)
      let dialogs = [];
      try {
        const kaiwaResponse = await minnaJsonApi.get(`/lessons/${lessonNumber}/kaiwa`);
        if (kaiwaResponse.data.success && kaiwaResponse.data.data.length > 0) {
          // Treat the entire kaiwaData object as one dialog with dialogue array
          dialogs = kaiwaResponse.data.data;
        }
      } catch (dialogErr) {
        // Failed to load dialogs
      }

      // Get exercises (from mondai)
      let exercises = [];
      try {
        const mondaiResponse = await minnaJsonApi.get(`/lessons/${lessonNumber}/mondai`);
        if (mondaiResponse.data.success) {
          // Preserve the full mondai structure
          exercises = mondaiResponse.data.data.map((mondai: any) => ({
            id: mondai.id,
            title: mondai.title,
            type: mondai.type,
            description: mondai.description,
            instructions: mondai.instructions,
            audioUrl: mondai.audioUrl,
            items: mondai.items,
            dialogues: mondai.dialogues,
            // Keep original structure for compatibility
            question: mondai.title || mondai.description,
            options: [],
            answer: '',
            explanation: mondai.description || ''
          }));
        }
      } catch (exerciseErr) {
        // Failed to load exercises
      }

      // Get renshuu (practice)
      let renshuuData = [];
      try {
        const renshuuResponse = await minnaJsonApi.get(`/lessons/${lessonNumber}/renshuu`);
        if (renshuuResponse.data.success) {
          renshuuData = renshuuResponse.data.data || [];
        }
      } catch (renshuuErr) {
        // Failed to load renshuu - Mock data for testing UI
        renshuuData = [
          {
            id: 'renshuu_1',
            title: 'Bài tập thực hành 1',
            description: 'Luyện tập cấu trúc câu cơ bản',
            content: 'Hãy tạo câu với từ vựng đã học'
          },
          {
            id: 'renshuu_2',
            title: 'Bài tập thực hành 2',
            description: 'Luyện tập ngữ pháp',
            content: 'Sử dụng mẫu câu đã học để tạo hội thoại ngắn'
          }
        ];
      }

      // Get reibun (example sentences)
      let reibunData = [];
      try {
        const reibunResponse = await minnaJsonApi.get(`/lessons/${lessonNumber}/reibun`);
        if (reibunResponse.data.success) {
          reibunData = reibunResponse.data.data || [];
        }
      } catch (reibunErr) {
        // Failed to load reibun
      }

      // Get bunkei (sentence patterns)
      let bunkeiData = [];
      try {
        const bunkeiResponse = await minnaJsonApi.get(`/lessons/${lessonNumber}/bunkei`);
        if (bunkeiResponse.data.success) {
          const sharedBunkeiAudioUrl =
            bunkeiResponse.data.audioUrl || bunkeiResponse.data.lesson?.audioUrl || "";
          bunkeiData = (bunkeiResponse.data.data || []).map((item: any) => ({
            ...item,
            audioUrl: item.audioUrl || item.audio_url || sharedBunkeiAudioUrl,
          }));
        }
      } catch (bunkeiErr) {
        // Failed to load bunkei
      }

      // Combine all data
      const lessonDetailData = {
        lesson: lessonMetadata,
        vocabularies,
        grammars,
        dialogs,
        exercises,
        renshuuData,
        reibunData,
        bunkeiData,
        aiPrompts: {
          roleplayPrompt: "",
          speakingTestPrompt: "",
          grammarCheckPrompt: "",
          personalizedPracticePrompt: ""
        },
        userProgress: {
          lessonId: lessonNum.toString(),
          status: "not_started" as const,
          score: 0,
          timeSpent: 0,
          completedVocabulary: [],
          completedGrammar: [],
          completedExercises: []
        },
        recommendations: {
          nextLesson: undefined,
          reviewItems: [],
          weakAreas: []
        }
      };

      setLessonDetail(lessonDetailData as LessonDetailType);
      // console.log('🔍 LessonDetail set:', lessonDetailData);
      // console.log('🔍 Vocabularies in lessonDetail:', lessonDetailData.vocabularies);
    } catch (err) {
      setError("Error loading lesson");
    } finally {
      setLoading(false);
    }
  }, [lessonNum]);

  useEffect(() => {
    if (lessonNum) {
      loadLessonDetail();
    }
    loadLessons();
  }, [lessonNum]);

  // Auto refresh lessons list when progress updates
  useEffect(() => {
    // Refresh lessons khi exercises hoặc vocabulary hoàn thành
    if (exercisesCompleted) {
      loadLessons();
    }
  }, [exercisesCompleted]);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      // Ưu tiên Nanami Online (Natural) cho giọng nữ
      if (!femaleVoiceName) {
        const nanamiNatural = getNanamiNaturalVoice();
        if (nanamiNatural) {
          setFemaleVoiceName(nanamiNatural.name);
          console.log('🎯 Set female voice to Microsoft Nanami Online (Natural):', nanamiNatural.name);
        } else {
          // Fallback to best female natural voice
          const bestFemaleVoice = getBestFemaleNaturalVoice();
          if (bestFemaleVoice) {
            setFemaleVoiceName(bestFemaleVoice.name);
            console.log(' Fallback female voice to:', bestFemaleVoice.name);
          }
        }
      }
    };

    // Load voices immediately
    loadVoices();

    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [femaleVoiceName]);

  useEffect(() => {
    try {
      localStorage.setItem("tts_voice_female", femaleVoiceName);
    } catch {
      // ignore storage errors
    }
  }, [femaleVoiceName]);

  useEffect(() => {
    // Ẩn tooltip khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra xem click có phải là vào nút không
      const target = event.target as HTMLElement;
      if (
        !target.closest(".meaning-button") &&
        !target.closest(".meaning-tooltip")
      ) {
        setClickedWord(null);
        setShowMeaningButton(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.classList.add("lesson-detail-page");
    return () => {
      document.body.classList.remove("lesson-detail-page");
    };
  }, []);

  const loadLessons = async (
    level?: string,
    limit: number = 50,
    offset: number = 0,
  ) => {
    setLessonsLoading(true);
    try {
      // Gọi API với các tham số: level, limit, offset (không còn userId)
      const response = await lessonAPI.getLessons(level, limit, offset);

      if (response.success && response.data) {
        setLessons(response.data.lessons);
      } else {
        setError("Failed to load lessons");
      }
    } catch (err) {
      setError("Lỗi khi tải data");
    } finally {
      setLessonsLoading(false);
    }
  };

  // Function to speak entire conversation with Microsoft Nanami Online (Natural)
  const speakEntireConversation = (dialog: Dialog, rate: number = 1) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    // Load voices
    const voices = window.speechSynthesis.getVoices();

    // CHỈ sử dụng Microsoft Nanami Online (Natural) cho tất cả
    const microsoftNanami = voices.find(voice =>
      voice.name.toLowerCase().includes('microsoft') &&
      voice.name.toLowerCase().includes('nanami') &&
      voice.name.toLowerCase().includes('online (natural)')
    );

    if (!microsoftNanami) {
      console.warn('Microsoft Nanami Online (Natural) not available for conversation');
      return;
    }

    let conversationLines: Array<{ speaker: string; text: string }> = [];

    // Extract text from lines if available
    if (dialog.lines && dialog.lines.length > 0) {
      conversationLines = dialog.lines
        .map((line) => ({
          speaker: line.speaker,
          text: line.japanese || "",
        }))
        .filter((line) => line.text.trim() !== "");
    }
    // Extract text from jpText if available
    else if (dialog.jpText) {
      const parsedLines = parseJpTextToLines(dialog.jpText || "");
      if (parsedLines.length > 0) {
        conversationLines = parsedLines
          .map((line: any) => ({
            speaker: line.speaker,
            text: line.text || "",
          }))
          .filter((line: any) => line.text.trim() !== "");
      } else {
        // If jpText doesn't have speaker prefixes, treat as single line
        conversationLines = [
          {
            speaker: "narrator",
            text: dialog.jpText || "",
          },
        ];
      }
    }

    let currentIndex = 0;

    const speakNextLine = () => {
      if (currentIndex >= conversationLines.length) {
        return;
      }

      const line = conversationLines[currentIndex];
      const utterance = new SpeechSynthesisUtterance(line.text);

      // Sử dụng Microsoft Nanami Online (Natural) cho tất cả các dòng
      utterance.voice = microsoftNanami;
      utterance.lang = microsoftNanami.lang || 'ja-JP';
      utterance.rate = 0.85 * rate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        currentIndex++;
        // Chờ một chút giữa các dòng
        setTimeout(speakNextLine, 300);
      };

      utterance.onerror = () => {
        currentIndex++;
        setTimeout(speakNextLine, 300);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Bắt đầu nói
    speakNextLine();
  };


  const handleWordHover = (word: string, event: React.MouseEvent) => {
    // Tìm từ trong vocabulary thật
    if (!lessonDetail || !lessonDetail.vocabularies) return;

    const vocab = lessonDetail.vocabularies.find(
      (v) =>
        v.kanji === word ||
        v.hiragana === word ||
        v.romaji.toLowerCase() === word.toLowerCase(),
    );

    if (vocab) {
      setShowMeaningButton({
        word,
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleWordLeave = () => {
    setShowMeaningButton(null);
  };

  const handleShowMeaning = (word: string, event: React.MouseEvent) => {
    // Tìm từ trong vocabulary thật
    if (!lessonDetail || !lessonDetail.vocabularies) return;

    const vocab = lessonDetail.vocabularies.find(
      (v) =>
        v.kanji === word ||
        v.hiragana === word ||
        v.romaji.toLowerCase() === word.toLowerCase(),
    );

    if (vocab) {
      // Ưu tiên dùng meaning_vi, nếu không có thì dùng mnemonic
      let meaning = vocab.meaning_vi || "";

      // Nếu không có meaning_vi, thử lấy từ mnemonic
      if (!meaning && vocab.mnemonic) {
        // Lấy phần đầu tiên của mnemonic trước dấu :
        if (vocab.mnemonic.includes(":")) {
          meaning = vocab.mnemonic.split(":")[1].trim();
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
        y: event.clientY,
      });
      setShowMeaningButton(null);
    }
  };

  const parseJpTextToLines = (
    jpText: string,
  ): Array<{ speaker: string; text: string }> => {
    if (!jpText || typeof jpText !== "string") return [];

    // Normalize both colon types
    const normalizedText = jpText.replace(/：/g, ":");

    return normalizedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Match patterns like "A: text" or "B: text"
        const match = line.match(/^(A|B):\s*(.+)$/);
        if (match) {
          return {
            speaker: match[1],
            text: match[2].trim(),
          };
        }
        return null;
      })
      .filter(
        (item): item is { speaker: string; text: string } => item !== null,
      );
  };

  const renderTextWithTooltips = (text: string) => {
    // Tách văn bản thành các từ - cải thiện để tách đúng từ tiếng Nhật
    const words = text.split(/(\s+|[。、？！])/);

    return words.map((word, index) => {
      // Bỏ qua khoảng trắng và dấu câu
      if (word.trim() === "" || /[。、？！]/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      // Kiểm tra xem có phải là từ vựng không
      const isVocab =
        lessonDetail &&
        lessonDetail.vocabularies &&
        lessonDetail.vocabularies.some(
          (v) =>
            v.kanji === word ||
            v.hiragana === word ||
            v.romaji.toLowerCase() === word.toLowerCase(),
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

  const renderConversationLines = (
    lines: Array<{ speaker: string; japanese?: string; text?: string }>,
  ) => {
    return (
      <div className="space-y-4">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className={`flex-1 px-4 py-3 rounded-xl shadow-sm ${line.speaker === "A"
                ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-secondary-800 dark:text-secondary-200"
                : "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-secondary-800 dark:text-secondary-200"
                }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3 min-w-0">
                  <div className="font-semibold text-sm text-blue-600 dark:text-blue-400 opacity-75 flex-shrink-0">
                    {line.speaker}
                  </div>
                  <div className="text-sm leading-relaxed break-words">
                    {renderTextWithTooltips(line.japanese || line.text || "")}
                  </div>
                </div>
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
        text: dialog.jpText,
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

  const handleAnswerSelect = (
    exerciseId: string,
    answer: string | string[],
  ) => {
    setExerciseAnswers((prev) => ({
      ...prev,
      [exerciseId]: answer,
    }));

    // Find the exercise object
    let exercise: Exercise | undefined;
    if (exerciseId.includes("exercise_")) {
      // Generated ID from index
      const index = parseInt(exerciseId.split("_")[1]);
      exercise = exercises[index]; // This could be undefined
    } else {
      // Real exercise ID
      exercise = exercises.find((ex) => ex.id === exerciseId);
    }

    // Safety check
    if (!exercise || !exercises || exercises.length === 0) {
      return;
    }

    let isCorrect = false;

    if (exercise.type === "reorder") {
      // For reorder, compare arrays
      const correctAnswer = Array.isArray(exercise.answer)
        ? exercise.answer
        : (exercise.answer as string).split(" ").filter((w) => w.trim() !== "");
      const userAnswer = Array.isArray(answer)
        ? answer
        : (answer as string).split(" ").filter((w) => w.trim() !== "");
      isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    } else {
      // For other types, compare strings
      isCorrect =
        exercise.answer === answer ||
        (Array.isArray(exercise.answer)
          ? exercise.answer.join(" ") === answer
          : false);
    }

    setAnswerStatus((prev) => ({
      ...prev,
      [exerciseId]: isCorrect ? "correct" : "incorrect",
    }));

    // Only show explanation if answer is correct
    if (isCorrect) {
      setShowExplanation((prev) => ({
        ...prev,
        [exerciseId]: true,
      }));
    } else {
      // Hide explanation if answer is incorrect
      setShowExplanation((prev) => ({
        ...prev,
        [exerciseId]: false,
      }));
    }
  };

  const handleExerciseSubmit = async (exerciseId?: string, answer?: string) => {
    // Temporarily bypass currentUser check for testing
    if (!lessonNum) {
      return;
    }

    try {
      // Prepare answers array for the new API format
      const answers = Object.entries(exerciseAnswers).map(([id, ans]) => ({
        exerciseId: id,
        answer: Array.isArray(ans)
          ? ans[0] || ""
          : typeof ans === "string"
            ? ans
            : "",
      }));

      // If specific exerciseId is provided, submit only that exercise
      if (exerciseId && answer) {
        const specificAnswer = [
          {
            exerciseId,
            answer,
          },
        ];

        const response = await lessonAPI.submitExercises(
          lessonNum.toString(),
          specificAnswer,
        );
        if (response.success && response.data) {
          // Update results for the specific exercise
          const result = response.data.results.find(
            (r: any) => r.exerciseId === exerciseId,
          );
          if (result) {
            setExerciseResults((prev) => ({
              ...prev,
              [exerciseId]: result,
            }));
          }
        }
      } else {
        // Submit all answered exercises
        const response = await lessonAPI.submitExercises(lessonNum.toString(), answers);
        if (response.success && response.data) {
          // Update results for all exercises
          const newResults: Record<string, any> = {};
          response.data.results.forEach((result: any) => {
            newResults[result.exerciseId] = result;
          });
          setExerciseResults((prev) => ({
            ...prev,
            ...newResults,
          }));
        }
      }
    } catch (err) {
      // Exercise submission error
    }
  };

  const handleAllExercisesSubmit = async () => {
    await handleExerciseSubmit();
  };

  const handleMarkLessonComplete = async () => {
    if (!lessonNum) {
      return;
    }

    try {
      // Local-only: do not update user lesson status on backend
      localStorage.setItem(`lesson_${lessonNum}_exercises_completed`, "true");
      setExercisesCompleted(true);

      // Clear exercise progress from localStorage after marking lesson complete
      localStorage.removeItem(`lesson_${lessonNum}_exercise_progress`);

      // Clear flashcard progress from localStorage after marking lesson complete
      localStorage.removeItem(`lesson_${lessonNum}_flashcard_progress`);

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

      alert("Đã hoàn thành bài học (chỉ lưu local, không cập nhật status người dùng).");
    } catch (error) {
      // Error marking lesson as complete
      alert("Có lỗi xảy ra khi đánh dấu bài học hoàn thành. Vui lòng thử lại.");
    }
  };

  const handleAIMessage = async () => {
    if (!currentMessage.trim() || !lessonNum || !currentUser) return;

    const userMessage = {
      role: "user" as const,
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message to the conversation
    setAiMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setAiLoading(true);

    try {
      const response = await aiAPI.chat({
        lessonId: lessonNum.toString(),
        messages: [...aiMessages, userMessage],
        context: {
          currentLesson: lesson?.title || "",
          learnedVocabulary: vocabularies?.map((v) => v.kanji) || [],
          learnedGrammar: grammars?.map((g) => g.pattern) || [],
          difficulty: "medium" as const,
        },
      });

      if (response.success && response.data) {
        const aiMessage = {
          role: "assistant" as const,
          content: response.data.message.content,
          timestamp: response.data.message.timestamp,
        };
        setAiMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      // AI chat error
      // Add error message
      const errorMessage = {
        role: "assistant" as const,
        content:
          "ごめんなさい。エラーが発生しました。もう一度お試しください。(Sorry, an error occurred. Please try again.)",
        timestamp: new Date().toISOString(),
      };
      setAiMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };

  // Navigation handlers
  const handlePreviousLesson = () => {
    if (lessonNum > 1) {
      navigate(`/mina/${lessonNum - 1}`);
    }
  };

  const handleNextLesson = () => {
    if (lessonNum < 50) {
      navigate(`/mina/${lessonNum + 1}`);
    }
  };

  const handleLessonSelect = (value: number) => {
    navigate(`/mina/${value}`);
  };

  // Handler when exercises are completed
  const handleExercisesComplete = useCallback(async () => {
    if (!exercisesCompleted && exercises.length > 0) {
      setExercisesCompleted(true);

      // Save completion status to localStorage
      localStorage.setItem(`lesson_${lessonNum}_exercises_completed`, "true");
    } else {
      // Exercises already completed or no exercises
    }
  }, [exercisesCompleted, exercises.length, lessonNum]);

  // Check if exercises were already completed
  useEffect(() => {
    if (lessonNum) {
      const exercisesCompleted = localStorage.getItem(
        `lesson_${lessonNum}_exercises_completed`,
      );
      if (exercisesCompleted === "true") {
        setExercisesCompleted(true);
      }
    }
  }, [lessonNum]);

  // Check if exercises are completed
  useEffect(() => {
    if (
      exercises.length > 0 &&
      Object.keys(answerStatus).length === exercises.length
    ) {
      const allAnswered = exercises.every((exercise) => {
        const exerciseId =
          exercise.id || `exercise_${exercises.indexOf(exercise)}`;
        const hasStatus = answerStatus[exerciseId] !== undefined;
        return hasStatus;
      });

      if (allAnswered) {
        handleExercisesComplete();
      }
    }
  }, [answerStatus, exercises, exercisesCompleted, lessonNum]);

  if (combinedLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (combinedError || !lessonDetail) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Card className="text-center">
          <Title level={2} type="danger">
            Error
          </Title>
          <Text className="!text-secondary-700 dark:!text-secondary-400">
            {error || "Lesson not found"}
          </Text>
        </Card>
      </div>
    );
  }

  const getTabDisplayName = (tab: TabType) => {
    const tabNames = {
      vocabulary: "Từ vựng",
      grammar: "Ngữ pháp",
      conversation: "Kaiwa",
      exercises: "Mondai",
      ai: "Luyện với AI",
      renshuu: "Renshuu",
      reibun: "Reibun",
      bunkei: "Bunkei",
    };
    return tabNames[tab] || "";
  };

  const pickFirstText = (...values: unknown[]): string => {
    for (const value of values) {
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
      if (typeof value === "number") {
        return String(value);
      }
    }
    return "";
  };

  const getRomajiText = (item: any): string =>
    pickFirstText(
      item?.romaji,
      item?.romaJi,
      item?.jp_romaji,
      item?.jpRomaji,
      item?.text_romaji,
      item?.textRomaji,
      item?.question_romaji,
      item?.questionRomaji,
    );

  const getMeaningText = (item: any): string =>
    pickFirstText(
      item?.meaning,
      item?.meaning_vi,
      item?.meaningVi,
      item?.translation,
      item?.viTranslation,
      item?.question_translation,
      item?.questionTranslation,
    );

  const getJapaneseText = (item: any): string =>
    pickFirstText(item?.pattern, item?.text, item?.japanese, item?.jpText, item?.question);
  const showTabCounts = !screens.xs;
  const showFullTabLabels = screens.xxl || screens.xl;
  const showCompactTabLabels = !showFullTabLabels && screens.md;

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "vocabulary":
        return (
          <VocabularyTab
            ref={vocabularyTableRef}
            vocabularies={vocabularies}
            loading={loading}
            bookmarkedVocab={bookmarkedVocab}
            onCloseSidebar={() => { }}
            lessonInfo={{
              title: lesson?.title,
              lessonNumber: lesson?.lesson_number,
              level: lesson?.level
            }}
          />
        );
      case "grammar":
        return (
          <GrammarTab
            grammars={grammars}
            lessonInfo={{
              level: lesson?.level
            }}
          />
        );
      case "conversation":
        return (
          <ConversationTab
            dialogs={dialogs}
            showDialogTranslation={showDialogTranslation}
            setShowDialogTranslation={setShowDialogTranslation}
            renderDialogConversation={renderDialogConversation}
            speakEntireConversation={speakEntireConversation}
            lessonInfo={{
              title: lesson?.title,
              lessonNumber: lesson?.lesson_number,
              level: lesson?.level
            }}
          />
        );
      case "exercises":
        return (
          <ExercisesTab
            exercises={exercises}
            exerciseResults={exerciseResults}
            exerciseAnswers={exerciseAnswers}
            answerStatus={answerStatus}
            showExplanation={showExplanation}
            currentExerciseIndex={currentExerciseIndex}
            setCurrentExerciseIndex={setCurrentExerciseIndex}
            setExerciseAnswers={setExerciseAnswers}
            handleAnswerSelect={handleAnswerSelect}
            handleAllExercisesSubmit={handleAllExercisesSubmit}
            handleMarkLessonComplete={handleMarkLessonComplete}
            onGoToTab={(tab) => setActiveTab(tab)}
            lessonInfo={{
              title: lesson?.title,
              lessonNumber: lesson?.lesson_number,
              level: lesson?.level
            }}
          />
        );
      case "ai":
        return (
          <AiPracticeTab
            lessonNumber={lesson?.lesson_number}
            aiMessages={aiMessages}
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            aiLoading={aiLoading}
            handleAIMessage={handleAIMessage}
          />
        );
      case "renshuu":
        return (
          <div className="p-6">
            <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
              <Text className="block mb-4 !text-secondary-700 dark:!text-secondary-400">
                Bài tập thực hành ({renshuuData.length} mục)
              </Text>
              {renshuuData.length > 0 ? (
                <div className="space-y-4">
                  {renshuuData.map((item: any, index: number) => (
                    <Card key={index} size="small">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <Text strong className="!mb-0">
                            {item.title || `Bài tập ${index + 1}`}
                          </Text>
                          {item.title_jp && (
                            <Text className="text-xs !mb-0 !text-secondary-700 dark:!text-secondary-400">
                              {item.title_jp}
                            </Text>
                          )}
                          {item.description && (
                            <Text className="!mb-0 text-secondary-700 dark:text-secondary-400">
                              {item.description}
                            </Text>
                          )}
                          {getRomajiText(item) && (
                            <Text className="!mb-0 text-xs italic !text-secondary-700 dark:!text-secondary-400">
                              {getRomajiText(item)}
                            </Text>
                          )}
                          {getMeaningText(item) &&
                            getMeaningText(item) !== item.description && (
                              <Text className="!mb-0 text-green-600 dark:text-green-400">
                                {getMeaningText(item)}
                              </Text>
                            )}
                        </div>
                        {item.audioUrl && (
                          <Card size="small" className="mt-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <Text className="text-sm text-blue-700 dark:text-blue-300 block mb-2">
                              🎵 Nghe và lặp lại hội thoại
                            </Text>
                            <audio controls preload="metadata" className="w-full">
                              <source src={item.audioUrl} />
                            </audio>
                          </Card>
                        )}
                        {item.content && (
                          <div className="mt-3">
                            {typeof item.content === 'string' ? (
                              <Card size="small" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                <Text className="text-sm text-blue-700 dark:text-blue-300">
                                  📝 {item.content}
                                </Text>
                              </Card>
                            ) : (
                              <div className="space-y-3">
                                {/* Dialogue Content */}
                                {item.content.dialogue && (
                                  <Card size="small" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                                    <Title level={5} className="text-purple-600 dark:text-purple-400 mb-3">
                                      💬 Hội thoại mẫu:
                                    </Title>
                                    <div className="space-y-3">
                                      {typeof item.content.dialogue === 'object' && item.content.dialogue !== null ? (
                                        Object.entries(item.content.dialogue).map(([speaker, content]: [string, any]) => (
                                          <div key={speaker} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-purple-200 dark:border-purple-600">
                                            <div className="flex items-start gap-3">
                                              <Text strong className="text-purple-600 dark:text-purple-400 min-w-[24px]">
                                                {speaker}:
                                              </Text>
                                              <div className="flex-1">
                                                <Text className="text-sm text-purple-800 dark:text-purple-200 block">
                                                  {getJapaneseText(content) ||
                                                    (typeof content === "string"
                                                      ? content
                                                      : JSON.stringify(content))}
                                                </Text>
                                                {getRomajiText(content) && (
                                                  <Text className="text-xs text-gray-600 dark:text-gray-400 italic block mt-1">
                                                    {getRomajiText(content)}
                                                  </Text>
                                                )}
                                                {getMeaningText(content) && (
                                                  <Text className="text-xs text-green-600 dark:text-green-400 block mt-1">
                                                    {getMeaningText(content)}
                                                  </Text>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <Text className="text-sm text-purple-700 dark:text-purple-300">
                                          {typeof item.content.dialogue === 'string'
                                            ? item.content.dialogue
                                            : JSON.stringify(item.content.dialogue)}
                                        </Text>
                                      )}
                                    </div>
                                  </Card>
                                )}

                                {/* Practice Content */}
                                {item.content.practice && (
                                  <Card size="small" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                    <Title level={5} className="text-green-600 dark:text-green-400 mb-3">
                                      🏃‍♂️ Bài tập thực hành:
                                    </Title>
                                    <div className="space-y-3">
                                      {Array.isArray(item.content.practice) ? (
                                        item.content.practice.map((practiceItem: any, practiceIndex: number) => (
                                          <div key={practiceIndex} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-green-200 dark:border-green-600">
                                            <Text className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                                              Ví dụ {practiceIndex + 1}:
                                            </Text>
                                            {practiceItem.substitutions && (
                                              <div className="space-y-1">
                                                {Object.entries(practiceItem.substitutions).map(([placeholder, value]) => (
                                                  <div key={placeholder} className="flex items-center gap-2 text-sm">
                                                    <Text className="font-medium text-green-600 dark:text-green-400 min-w-[24px]">
                                                      {placeholder}:
                                                    </Text>
                                                    <Text className="text-green-700 dark:text-green-300">
                                                      {String(value)}
                                                    </Text>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <Text className="text-sm text-green-700 dark:text-green-300">
                                          {typeof item.content.practice === 'string'
                                            ? item.content.practice
                                            : JSON.stringify(item.content.practice)}
                                        </Text>
                                      )}
                                    </div>
                                  </Card>
                                )}

                                {/* Other content */}
                                {Object.entries(item.content)
                                  .filter(([key]) => !['practice', 'dialogue'].includes(key))
                                  .map(([key, value]) => (
                                    <Card key={key} size="small" className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                      <Title level={5} className="text-gray-600 dark:text-gray-400 mb-1 capitalize">
                                        {key.replace(/_/g, ' ')}:
                                      </Title>
                                      <Text className="text-sm text-gray-700 dark:text-gray-300">
                                        {typeof value === 'string' ? value : JSON.stringify(value)}
                                      </Text>
                                    </Card>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Text className="!text-secondary-700 dark:!text-secondary-400">
                  Chưa có dữ liệu bài tập thực hành
                </Text>
              )}
            </Card>
          </div>
        );
      case "reibun":
        return (
          <div className="p-6">
            <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
              <Title level={3}>Reibun - 例文 ({lesson?.title || `Bài ${lessonNum}`})</Title>
              <Text className="block mb-4 !text-secondary-700 dark:!text-secondary-400">
                Hội thoại ví dụ ({reibunData.length} đoạn)
              </Text>
              {reibunData.length > 0 ? (
                <div className="space-y-6">
                  {reibunData.map((item: any, index: number) => (
                    <div key={index} className="space-y-4">
                      {/* Dialogue Header */}
                      <Card size="small" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <div className="space-y-2">
                          <Title level={4} className="text-blue-600 dark:text-blue-400">
                            {item.title || `Đoạn hội thoại ${index + 1}`}
                          </Title>
                          {item.description && (
                            <Text className="text-secondary-700 dark:text-secondary-400">
                              {item.description}
                            </Text>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <Text className="!text-secondary-700 dark:!text-secondary-400">
                              <strong>{item.total_lines}</strong> câu thoại
                            </Text>
                          </div>
                          {item.audioUrl && (
                            <div className="mt-2">
                              <audio controls preload="metadata" className="block w-full min-w-0">
                                <source src={item.audioUrl} />
                              </audio>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Dialogue Content */}
                      <Card>
                        <div className="space-y-3">
                          {item.dialogue && item.dialogue.map((line: any, lineIndex: number) => (
                            <div key={lineIndex} className="flex items-start gap-3">
                              <div className={`flex-1 px-4 py-3 rounded-xl shadow-sm ${line.speaker === "A"
                                ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-secondary-800 dark:text-secondary-200"
                                : "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-secondary-800 dark:text-secondary-200"
                                }`}>
                                <div className="flex items-baseline justify-between gap-3">
                                  <div className="flex items-baseline gap-3 min-w-0">
                                    <div className="font-semibold text-sm text-blue-600 dark:text-blue-400 opacity-75 flex-shrink-0">
                                      {line.speaker}
                                    </div>
                                    <div className="text-sm leading-relaxed break-words flex-1">
                                      <div className="font-medium text-base mb-1">
                                        {getJapaneseText(line) || "Chưa có nội dung"}
                                      </div>
                                      {getRomajiText(line) && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                                          {getRomajiText(line)}
                                        </div>
                                      )}
                                      {getMeaningText(line) && (
                                        <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                                          {getMeaningText(line)}
                                        </div>
                                      )}
                                      {line.context && (
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                          💡 {line.context}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Grammar Focus */}
                      {item.grammar_focus && item.grammar_focus.length > 0 && (
                        <Card size="small" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                          <Title level={5} className="text-purple-600 dark:text-purple-400 mb-2">
                            📚 Điểm ngữ pháp chính:
                          </Title>
                          <div className="flex flex-wrap gap-2">
                            {item.grammar_focus.map((grammar: string, gIndex: number) => (
                              <Tag key={gIndex} color="purple">{grammar}</Tag>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Vocabulary Focus */}
                      {item.vocabulary_focus && item.vocabulary_focus.length > 0 && (
                        <Card size="small" className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                          <Title level={5} className="text-orange-600 dark:text-orange-400 mb-2">
                            📝 Từ vựng chính:
                          </Title>
                          <div className="flex flex-wrap gap-2">
                            {item.vocabulary_focus.map((vocab: string, vIndex: number) => (
                              <Tag key={vIndex} color="orange">{vocab}</Tag>
                            ))}
                          </div>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Text className="!text-secondary-700 dark:!text-secondary-400">
                  Chưa có dữ liệu hội thoại ví dụ
                </Text>
              )}
            </Card>
          </div>
        );
      case "bunkei":
        return (
          <div className="p-6">
            <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
              <Title level={3}>Bunkei - 文型 ({lesson?.title || `Bài ${lessonNum}`})</Title>
              <Text className="block mb-4 !text-secondary-700 dark:!text-secondary-400">
                Mẫu câu ({bunkeiData.length} mẫu)
              </Text>

              {/* Shared Audio Control */}
              {bunkeiData.length > 0 && bunkeiData[0].audioUrl && (
                <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <div className="mb-3">
                    <Text strong className="text-blue-700 dark:text-blue-300">
                      Audio mẫu câu
                    </Text>
                    <Text className="block text-sm mt-1 text-secondary-700 dark:text-secondary-400">
                      Nghe tất cả mẫu câu để làm quen với các cấu trúc ngữ pháp
                    </Text>
                  </div>
                  <audio controls preload="metadata" className="w-full">
                    <source src={bunkeiData[0].audioUrl} />
                  </audio>
                </Card>
              )}

              {bunkeiData.length > 0 ? (
                <div className="space-y-4">
                  {bunkeiData.map((item: any, index: number) => (
                    <Card key={index} size="small" className="hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        {/* Pattern */}
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {getJapaneseText(item) || "Chưa có mẫu câu"}
                          </div>
                          {getRomajiText(item) && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                              {getRomajiText(item)}
                            </div>
                          )}
                          {getMeaningText(item) && (
                            <div className="text-lg text-green-600 dark:text-green-400 font-medium">
                              {getMeaningText(item)}
                            </div>
                          )}
                        </div>

                        {/* Type */}
                        <div className="flex items-center justify-center">
                          <Tag color={
                            item.type === 'introduction' ? 'blue' :
                              item.type === 'negative' ? 'red' :
                                item.type === 'question' ? 'orange' :
                                  item.type === 'addition' ? 'green' : 'default'
                          }>
                            {item.type === 'introduction' ? 'Giới thiệu' :
                              item.type === 'negative' ? 'Phủ định' :
                                item.type === 'question' ? 'Câu hỏi' :
                                  item.type === 'addition' ? 'Thêm vào' : item.type}
                          </Tag>
                        </div>

                        {/* Explanation */}
                        {item.explanation && (
                          <Card size="small" className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <Text className="text-sm text-gray-700 dark:text-gray-300">
                              💡 {item.explanation}
                            </Text>
                          </Card>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Text className="!text-secondary-700 dark:!text-secondary-400">
                  Chưa có dữ liệu mẫu câu
                </Text>
              )}
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      className="bg-white dark:bg-secondary-900"
    >
      <style>{`
        .lesson-detail-page .theme-surface::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .lesson-detail-page .theme-surface {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .lesson-detail-content::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .lesson-detail-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        /* Improve readability for lesson detail content */
        .lesson-detail-content .text-xs {
          font-size: 0.8125rem !important;
          line-height: 1.25rem !important;
        }
        .lesson-detail-content .text-sm {
          font-size: 0.9375rem !important;
          line-height: 1.45rem !important;
        }
        .lesson-detail-content .ant-tag {
          font-size: 0.8125rem !important;
          line-height: 1.25rem !important;
        }
        .lesson-detail-content .ant-typography h5,
        .lesson-detail-content h5.ant-typography {
          font-size: 1rem !important;
          line-height: 1.5rem !important;
        }
        .lesson-tabs .ant-tabs-tab .anticon {
          margin-right: 0 !important;
          transform: translateY(-1px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .lesson-tabs .ant-tabs-tab:hover .anticon {
          transform: translateY(-1px) scale(1.1) !important;
        }
        .lesson-tabs .ant-tabs-tab.ant-tabs-tab-active .anticon {
          color: #3b82f6 !important;
        }
        .lesson-tabs .ant-tabs-tab .ant-tabs-tab-btn {
          display: inline-flex;
          align-items: center;
        }
        .lesson-tabs .ant-tabs-tab .ant-tabs-tab-btn > span {
          display: inline-flex;
          align-items: center;
          line-height: 1;
        }
        .lesson-tabs.ant-tabs {
          height: 100% !important;
        }
        .lesson-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
          height: 100% !important;
        }
        .lesson-tabs .ant-tabs-nav-wrap {
          height: 100% !important;
        }
        .lesson-tabs .ant-tabs-nav-list {
          height: 100% !important;
          padding-inline: 8px !important;
        }
        .lesson-tabs .ant-tabs-tab {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          margin: 0 !important;
          flex: 0 0 auto !important;
          justify-content: flex-start !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          padding: 0 12px !important;
        }
        .lesson-tabs .ant-tabs-tab:hover {
          background-color: rgba(59, 130, 246, 0.05) !important;
          transform: translateY(-1px) !important;
        }
        .lesson-tabs .ant-tabs-tab.ant-tabs-tab-active {
          background-color: rgba(59, 130, 246, 0.1) !important;
          border-bottom: 2px solid #3b82f6 !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15) !important;
        }
        .lesson-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #3b82f6 !important;
          font-weight: 600 !important;
        }
        .lesson-tabs .ant-tabs-ink-bar {
          background: linear-gradient(90deg, #3b82f6, #06b6d4) !important;
          height: 3px !important;
          border-radius: 2px 2px 0 0 !important;
        }
      `}</style>
      {/* Main Content */}
      <Layout>

        <Content className="lesson-detail-content academic-canvas app-surface flex-1 sm:px-0 flex flex-col min-h-full">
          {screens.xs && (
            <style>
              {`
                .lesson-tabs .ant-tabs-nav {
                  margin: 0 !important;
                }
                .lesson-tabs .ant-tabs-nav-wrap {
                  overflow-x: auto !important;
                  scrollbar-width: none;
                }
                .lesson-tabs .ant-tabs-nav-wrap::-webkit-scrollbar {
                  display: none;
                }
                .lesson-tabs .ant-tabs-nav-list {
                  display: flex;
                  width: max-content;
                  min-width: 100%;
                  gap: 8px;
                  padding: 8px 10px;
                }
                .lesson-tabs .ant-tabs-nav,
                .lesson-tabs .ant-tabs-nav-wrap {
                  width: 100%;
                }
                .lesson-tabs .ant-tabs-tab {
                  flex: 0 0 auto;
                  min-width: 52px;
                  justify-content: center;
                  margin: 0 !important;
                  border-radius: 6px !important;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                  height: 44px !important;
                  display: flex !important;
                  align-items: center !important;
                  padding: 0 8px !important;
                }
                .lesson-tabs .ant-tabs-tab:hover {
                  background-color: rgba(59, 130, 246, 0.08) !important;
                  transform: translateY(-1px) !important;
                }
                .lesson-tabs .ant-tabs-tab.ant-tabs-tab-active {
                  background-color: rgba(59, 130, 246, 0.15) !important;
                  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2) !important;
                }
                .lesson-tabs .ant-tabs-ink-bar {
                  display: none !important;
                }
              `}
            </style>
          )}
          <div className="sticky top-0 z-30 bg-gradient-to-r from-white via-white to-white dark:from-secondary-925 dark:via-secondary-925 dark:to-secondary-925 border-b border-secondary-200 dark:border-secondary-700 shadow-sm backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 h-[60px] flex items-center gap-2 pr-2">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as TabType)}
              className="lesson-tabs bg-white dark:bg-secondary-800 flex-1 min-w-0"
              style={{ margin: 0, padding: 0 }}
              size={screens.xs ? "large" : screens.md ? "large" : "middle"}
              tabPlacement={screens.xs ? "top" : "top"}
              centered={false}
              items={[
                {
                  key: "vocabulary",
                  label: (
                    <span className="flex items-center gap-1">
                      <InfinitejapaneseIcon size={16} color="#000000" strokeWidth={2} />
                      {showFullTabLabels && <span>TỪ VỰNG</span>}
                      {showCompactTabLabels && <span>TỪ</span>}
                      {showTabCounts && vocabularies.length > 0 && (
                        <Badge count={vocabularies.length} size="small" />
                      )}
                    </span>
                  ),
                },
                {
                  key: "grammar",
                  label: (
                    <span className="flex items-center gap-1">
                      <ReadOutlined className="text-base" />
                      {showFullTabLabels && <span>NGỮ PHÁP</span>}
                      {showCompactTabLabels && <span>NP</span>}
                      {showTabCounts && grammars.length > 0 && (
                        <Badge count={grammars.length} size="small" />
                      )}
                    </span>
                  ),
                },
                {
                  key: "conversation",
                  label: (
                    <span className="flex items-center gap-1">
                      <MessageOutlined className="text-base" />
                      {showFullTabLabels && <span>KAIWA</span>}
                      {showCompactTabLabels && <span>KAIWA</span>}
                      {showTabCounts && dialogs.length > 0 && (
                        <Badge count={dialogs.length} size="small" />
                      )}
                    </span>
                  ),
                },
                {
                  key: "exercises",
                  label: (
                    <span className="flex items-center gap-1">
                      <PlayCircleOutlined className="text-base" />
                      {showFullTabLabels && <span>MONDAI</span>}
                      {showCompactTabLabels && <span>MONDAI</span>}
                      {showTabCounts && exercises.length > 0 && (
                        <Badge count={exercises.length} size="small" />
                      )}
                    </span>
                  ),
                },
                {
                  key: "renshuu",
                  label: (
                    <span className="flex items-center gap-1">
                      <PlayCircleOutlined className="text-base" />
                      {showFullTabLabels && <span>RENSHUU</span>}
                      {showCompactTabLabels && <span>RH</span>}
                      {showTabCounts && renshuuData.length > 0 && (
                        <Badge count={renshuuData.length} size="small" />
                      )}
                    </span>
                  ),
                },
                {
                  key: "reibun",
                  label: (
                    <span className="flex items-center gap-1">
                      <ReadOutlined className="text-base" />
                      {showFullTabLabels && <span>REIBUN</span>}
                      {showCompactTabLabels && <span>RB</span>}
                      {showTabCounts && reibunData.length > 0 && (
                        <Badge count={reibunData.length} size="small" />
                      )}
                    </span>
                  ),
                },
                {
                  key: "bunkei",
                  label: (
                    <span className="flex items-center gap-1">
                      <MessageOutlined className="text-base" />
                      {showFullTabLabels && <span>BUNKEI</span>}
                      {showCompactTabLabels && <span>BK</span>}
                      {showTabCounts && bunkeiData.length > 0 && (
                        <Badge count={bunkeiData.length} size="small" />
                      )}
                    </span>
                  ),
                },
                {
                  key: "ai",
                  label: (
                    <span className="flex items-center gap-1">
                      <RobotOutlined className="text-base" />
                      {showFullTabLabels && <span>LUYỆN VỚI AI</span>}
                      {showCompactTabLabels && <span>AI</span>}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          <div className="px-3 lg:px-6 pt-3">
            {/* Row 1: Back button, title, flashcard, and navigation */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/lessons")}
                  className="rounded-xl"
                >
                  Quay lại
                </Button>
                <Title level={2} className="!mb-0 text-base sm:text-lg lg:text-xl leading-snug">
                  {getTabDisplayName(activeTab)}
                </Title>
                {activeTab === "vocabulary" && (
                  <Button
                    type="text"
                    size="middle"
                    className={`px-3 py-1.5 h-auto text-xs font-semibold rounded-lg border transition-colors ${vocabularies.length > 0
                      ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600"
                      : "text-secondary-600 border-secondary-200 hover:text-secondary-900 hover:bg-secondary-50 hover:border-secondary-300 dark:text-secondary-400 dark:border-secondary-700 dark:hover:text-secondary-100 dark:hover:bg-secondary-800/60 dark:hover:border-secondary-500"
                      }`}
                    onClick={() => {
                      setActiveTab("vocabulary");
                      setTimeout(() => {
                        vocabularyTableRef.current?.enterFlashcard();
                      }, 100);
                    }}
                  >
                    <div className="flex flex-row items-center">
                      <LetterUppercaseSquareFIcon
                        size={16}
                        color="currentColor"
                        strokeWidth={2}
                      />
                      <span className="ml-1">Flashcard</span>
                    </div>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePreviousLesson}
                  disabled={lessonNum <= 1}
                  className="rounded-xl"
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1 flex-1 justify-center">
                  <Select
                    value={lessonNum}
                    onChange={handleLessonSelect}
                    loading={lessonsLoading}
                    className="
    w-14 rounded-xl
    [&_.ant-select-content]:!flex
    [&_.ant-select-content]:!justify-center
    [&_.ant-select-content]:!items-center
  "
                    placeholder="Chọn bài"
                    suffixIcon={null}
                    optionLabelProp="label"
                    options={lessons.length > 0
                      ? lessons.map((l) => ({
                        value: l.lesson_number,
                        label: `${l.lesson_number}`,
                      }))
                      : Array.from({ length: 50 }, (_, i) => ({
                        value: i + 1,
                        label: `${i + 1}`,
                      }))
                    }
                  />
                  <Text className="text-xs text-secondary-300 dark:text-secondary-600">
                    /50
                  </Text>
                </div>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextLesson}
                  disabled={lessonNum >= 50}
                  className="rounded-xl"
                >
                  Sau
                </Button>
              </div>
            </div>

            {/* Row 2: Description */}
            <div className="mb-3">
              <Text className="text-base sm:text-lg leading-relaxed line-clamp-2 text-secondary-700 dark:text-secondary-300">
                {lesson?.description
                  ? `${lesson?.lesson_number || lessonNum}. ${lesson.description}`
                  : ""}
              </Text>
            </div>
          </div>

          <div className="flex-1">{renderActiveTabContent()}</div>
        </Content>
      </Layout>

      {/* Meaning Button */}
      {
        showMeaningButton && (
          <Button
            className="fixed z-50"
            style={{
              left: `${showMeaningButton.x}px`,
              top: `${showMeaningButton.y + 20}px`,
              transform: "translateX(-50%)",
              borderRadius: "9999px",
              padding: "4px 12px",
              fontSize: "12px",
            }}
            type="primary"
            size="small"
            onClick={(e) => handleShowMeaning(showMeaningButton.word, e)}
          >
            📖 Xem nghĩa
          </Button>
        )
      }

      {/* Word Meaning Tooltip */}
      {
        clickedWord && (
          <div
            className="fixed z-50 meaning-tooltip bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 max-w-xs"
            style={{
              left: `${clickedWord.x}px`,
              top: `${clickedWord.y + 20}px`,
              transform: "translateX(-50%)",
              minWidth: "200px",
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
        )
      }
    </Layout>
  );
};

export default LessonDetail;
