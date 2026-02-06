import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { lessonAPI, userStatsAPI } from "../services/api";
import { useChatMutation } from "../services/aiService";
import GrammarTab from "./lesson-detail/GrammarTab";
import ConversationTab from "./lesson-detail/ConversationTab";
import ExercisesTab from "./lesson-detail/ExercisesTab";
import AiPracticeTab from "./lesson-detail/AiPracticeTab";
import SummaryTab from "./lesson-detail/SummaryTab";
import LessonSidebar from "./lesson-detail/LessonSidebar";
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
  Button,
  Card,
  Spin,
  Tooltip,
  Space,
  Progress,
  Badge,
} from "antd";
import {
  BookOutlined,
  ReadOutlined,
  PlayCircleOutlined,
  MessageOutlined,
  SoundOutlined,
  RobotOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
  MenuOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Grid } from "antd";
import { getJapaneseVoices } from "../utils/vocabularyUtils";
import WriteJapaneseIcon from "../components/icons/WriteJapaneseIcon";
import InfinitejapaneseIcon from "../components/icons/InfinitejapaneseIcon";
import LetterUppercaseSquareFIcon from "../components/icons/LetterUppercaseSquareFIcon";
import VocabularyTable, { type VocabularyTableHandle } from "../components/VocabularyTable";

const { Content } = Layout;
const { Title, Text } = Typography;

type TabType =
  | "vocabulary"
  | "grammar"
  | "conversation"
  | "exercises"
  | "ai"
  | "summary";

const LessonDetail: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [chatMutation] = useChatMutation();
  const screens = Grid.useBreakpoint();
  const [lessonDetail, setLessonDetail] = useState<LessonDetailType | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TabType>("vocabulary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(true);
  const sidebarSnapshotRef = useRef<{
    sidebarVisible: boolean;
    desktopSidebarCollapsed: boolean;
  } | null>(null);
  const [japaneseVoices, setJapaneseVoices] = useState<SpeechSynthesisVoice[]>([]);
  const vocabularyTableRef = useRef<VocabularyTableHandle | null>(null);
  const [maleVoiceName, setMaleVoiceName] = useState(() => {
    try {
      return localStorage.getItem("tts_voice_male") || "";
    } catch {
      return "";
    }
  });
  const [femaleVoiceName, setFemaleVoiceName] = useState(() => {
    try {
      return localStorage.getItem("tts_voice_female") || "";
    } catch {
      return "";
    }
  });

  // Extract lesson data early to avoid undefined issues
  const {
    lesson,
    vocabularies = [],
    grammars = [],
    dialogs = [],
    exercises = [],
  } = lessonDetail || {};

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
    if (lessonId) {
      const savedProgress = localStorage.getItem(
        `lesson_${lessonId}_exercise_progress`,
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
  }, [lessonId]);

  // Save exercise progress to localStorage whenever it changes
  useEffect(() => {
    if (lessonId) {
      const progress = {
        exerciseAnswers,
        exerciseResults,
        showExplanation,
        answerStatus,
        currentExerciseIndex,
      };
      localStorage.setItem(
        `lesson_${lessonId}_exercise_progress`,
        JSON.stringify(progress),
      );
    }
  }, [
    exerciseAnswers,
    exerciseResults,
    showExplanation,
    answerStatus,
    currentExerciseIndex,
    lessonId,
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
    if (lessonId) {
      const savedFlashcardProgress = localStorage.getItem(
        `lesson_${lessonId}_flashcard_progress`,
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
  }, [lessonId]);

  // Save flashcard progress to localStorage whenever it changes
  useEffect(() => {
    if (lessonId) {
      const flashcardProgress = {
        currentVocabIndex,
        showVocabAnswer,
        bookmarkedVocab: Array.from(bookmarkedVocab),
        showDialogTranslation,
      };
      localStorage.setItem(
        `lesson_${lessonId}_flashcard_progress`,
        JSON.stringify(flashcardProgress),
      );
    }
  }, [
    currentVocabIndex,
    showVocabAnswer,
    bookmarkedVocab,
    showDialogTranslation,
    lessonId,
  ]);


  // Lessons list state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadLessonDetail();
    }
    loadLessons();
  }, [lessonId]);

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
      const voices = getJapaneseVoices();
      setJapaneseVoices(voices);
    };

    // Load voices immediately
    loadVoices();

    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tts_voice_male", maleVoiceName);
    } catch {
      // ignore storage errors
    }
  }, [maleVoiceName]);

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

  // Text-to-Speech functionality
  const speakText = (
    text: string,
    lang: string = "ja-JP",
    voiceIndex?: number,
    voiceName?: string,
  ) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 1;

      // Get available voices and set specific voice if index is provided
      const voices = window.speechSynthesis.getVoices();
      if (voiceName) {
        const byName = voices.find((voice) => voice.name === voiceName);
        if (byName) {
          utterance.voice = byName;
        }
      }
      if (!utterance.voice && voiceIndex !== undefined && voices[voiceIndex]) {
        utterance.voice = voices[voiceIndex];
      } else if (!utterance.voice) {
        const preferredVoice = getJapaneseVoices()[0];
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } else {
      // Text-to-speech not supported
    }
  };

  // Function to speak entire conversation with alternating voices
  const speakEntireConversation = (dialog: Dialog) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    // Load voices
    const voices = window.speechSynthesis.getVoices();

    // Find Japanese voices (preferably higher quality)
    const preferredVoices = getJapaneseVoices();
    const japaneseVoices =
      preferredVoices.length > 0
        ? preferredVoices
        : voices.filter(
          (voice) => voice.lang.startsWith("ja") || voice.lang.startsWith("ja-JP"),
        );

    // Separate male and female voices if available
    const femaleHints = [
      "nanami online (natural)",
      "nanami",
      "ayumi",
      "haruka",
      "sayaka",
      "female",
      "josei",
      "onna",
    ];
    const maleHints = [
      "keita online (natural)",
      "keita",
      "ichiro",
      "otoya",
      "male",
      "dan",
      "otoko",
    ];

    const pickByPreference = (voicesList: SpeechSynthesisVoice[], hints: string[]) => {
      for (const hint of hints) {
        const found = voicesList.find((voice) =>
          voice.name.toLowerCase().includes(hint),
        );
        if (found) return found;
      }
      return undefined;
    };

    const maleVoicePreferred = pickByPreference(japaneseVoices, maleHints);
    const femaleVoicePreferred = pickByPreference(japaneseVoices, femaleHints);

    // Fallback to any Japanese voices
    const selectedMale = voices.find((voice) => voice.name === maleVoiceName);
    const selectedFemale = voices.find((voice) => voice.name === femaleVoiceName);

    const maleVoice =
      selectedMale ||
      maleVoicePreferred ||
      (japaneseVoices.length > 0 ? japaneseVoices[0] : voices[0]);
    const femaleVoice =
      selectedFemale ||
      femaleVoicePreferred ||
      (japaneseVoices.length > 0 ? japaneseVoices[0] : voices[0]);

    const otherVoices = japaneseVoices.filter(
      (voice) => voice !== maleVoice && voice !== femaleVoice,
    );

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
      const parsedLines = parseJpTextToLines(dialog.jpText);
      if (parsedLines.length > 0) {
        conversationLines = parsedLines
          .map((line) => ({
            speaker: line.speaker,
            text: line.text || "",
          }))
          .filter((line) => line.text.trim() !== "");
      } else {
        // If jpText doesn't have speaker prefixes, treat as single line
        conversationLines = [
          {
            speaker: "A",
            text: dialog.jpText,
          },
        ];
      }
    }

    // Speak each line with appropriate voice
    let currentIndex = 0;
    const speakNextLine = () => {
      if (currentIndex >= conversationLines.length) return;

      const line = conversationLines[currentIndex];
      let voice = femaleVoice; // default
      if (line.speaker === "A") {
        voice = maleVoice;
      } else if (line.speaker === "B") {
        voice = femaleVoice;
      } else {
        const speakerIndex = line.speaker
          ? line.speaker.charCodeAt(0) - "A".charCodeAt(0)
          : 0;
        const pool = otherVoices.length > 0 ? otherVoices : japaneseVoices;
        if (pool.length > 0) {
          voice = pool[Math.abs(speakerIndex) % pool.length];
        }
      }

      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = "ja-JP";
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
      const response = await lessonAPI.getLessonDetail(lessonId);
      // API mới trả về trực tiếp data, không có success wrapper
      if (response) {
        setLessonDetail(response as LessonDetailType);
      } else {
        setError("Failed to load lesson details");
      }
    } catch (err) {
      setError("Error loading lesson");
    } finally {
      setLoading(false);
    }
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
                <Button
                  type="text"
                  onClick={() => {
                    const textToSpeak = line.japanese || line.text || "";
                    const voiceName =
                      line.speaker === "A"
                        ? maleVoiceName
                        : line.speaker === "B"
                          ? femaleVoiceName
                          : undefined;
                    if (textToSpeak) {
                      speakText(textToSpeak, "ja-JP", undefined, voiceName);
                    }
                  }}
                  icon={<SoundOutlined />}
                  size="small"
                  title="Nghe phát âm"
                />
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
    if (!lessonId) {
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
          lessonId,
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
        const response = await lessonAPI.submitExercises(lessonId, answers);
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
    if (!lessonId || !currentUser) {
      return;
    }

    try {
      setLoading(true);

      // Dùng API mới để đánh dấu hoàn thành nhanh
      const response = await lessonAPI.completeLesson(lessonId);

      // Refresh lessons list to show updated status
      await loadLessons();

      // Show success message
      alert("Bài học đã được đánh dấu là hoàn thành!");

      // Update dashboard stats after completing lesson
      try {
        // Get current dashboard stats first
        const currentStats = await userStatsAPI.getDashboardStats();

        // Calculate new stats
        const newLearningStreak = (currentStats.data?.learningStreak || 0) + 1;
        const newTotalHours =
          (currentStats.data?.totalStudyTime || 0) +
          (lessonDetail?.lesson?.estimatedTime || 1);

        // Update dashboard stats using new endpoint
        await userStatsAPI.updateDashboardStats({
          learningStreak: newLearningStreak,
          totalStudyTime: newTotalHours,
        });
      } catch (error) {
        // Failed to update dashboard stats
      }

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
      // Error marking lesson as complete
      alert("Có lỗi xảy ra khi đánh dấu bài học hoàn thành. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAIMessage = async () => {
    if (!currentMessage.trim() || !lessonId || !currentUser) return;

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
      const chatRequest = {
        userId: currentUser.id,
        lessonId,
        messages: [...aiMessages, userMessage],
        context: {
          currentLesson: lesson?.title || "",
          learnedVocabulary: vocabularies?.map((v) => v.kanji) || [],
          learnedGrammar: grammars?.map((g) => g.pattern) || [],
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

  // Function to update lesson progress
  const updateLessonProgress = async (
    progress: number,
    status: "not_started" | "in_progress" | "completed" | "review",
    sectionData?: {
      vocabularyCompleted?: boolean;
      grammarCompleted?: boolean;
      dialogCompleted?: boolean;
      exercisesScore?: number;
      aiPracticeCount?: number;
    },
  ) => {
    if (!lessonId || !currentUser) {
      return;
    }

    try {
      // API structure mới theo backend documentation
      const apiData = {
        userId: currentUser.id,
        status,
        progress,
        vocabularyCompleted: sectionData?.vocabularyCompleted || false,
        grammarCompleted: sectionData?.grammarCompleted || false,
        dialogCompleted: sectionData?.dialogCompleted || false,
        exercisesScore: sectionData?.exercisesScore || 0,
        aiPracticeCount: sectionData?.aiPracticeCount || 0,
      };

      const response = await lessonAPI.updateProgress(lessonId, apiData);

      // Refresh lessons list to show updated status
      await loadLessons();
    } catch (error) {
      // Error updating lesson progress
    }
  };

  // Handler when exercises are completed
  const handleExercisesComplete = async () => {
    if (!exercisesCompleted && exercises.length > 0) {
      setExercisesCompleted(true);

      // Calculate score based on correct answers
      const correctCount = Object.values(answerStatus).filter(
        (status) => status === "correct",
      ).length;
      const totalAnswered = Object.keys(answerStatus).length;
      const score =
        totalAnswered > 0
          ? Math.round((correctCount / totalAnswered) * 100)
          : 0;

      // Update progress to 100% for exercises completion (hoàn thành bài học)
      await updateLessonProgress(100, "completed", {
        exercisesScore: score,
      });

      // Save completion status to localStorage
      localStorage.setItem(`lesson_${lessonId}_exercises_completed`, "true");
    } else {
      // Exercises already completed or no exercises
    }
  };

  // Check if exercises were already completed
  useEffect(() => {
    if (lessonId) {
      const exercisesCompleted = localStorage.getItem(
        `lesson_${lessonId}_exercises_completed`,
      );
      if (exercisesCompleted === "true") {
        setExercisesCompleted(true);
      }
    }
  }, [lessonId]);

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
  }, [answerStatus, exercises]);

  // Calculate overall progress based on completed sections
  const calculateOverallProgress = () => {
    let progress = 0;

    if (exercisesCompleted) {
      progress = 100; // Hoàn thành bài học khi làm xong bài tập
    }

    // Add logic for grammar and dialog completion when implemented
    // if (grammarCompleted) {
    //   progress += 15;
    // }

    // if (dialogCompleted) {
    //   progress += 10;
    // }

    return progress;
  };

  // Update overall progress when sections are completed
  useEffect(() => {
    const overallProgress = calculateOverallProgress();

    if (overallProgress > 0 && exercisesCompleted) {
      const status = overallProgress === 100 ? "completed" : "in_progress";

      updateLessonProgress(overallProgress, status, {
        exercisesScore: exercisesCompleted
          ? Math.round(
            (Object.values(answerStatus).filter(
              (status) => status === "correct",
            ).length /
              Object.keys(answerStatus).length) *
            100,
          )
          : 0,
      });
    }
  }, [exercisesCompleted]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !lessonDetail) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Card className="text-center">
          <Title level={2} type="danger">
            Error
          </Title>
          <Text type="secondary">{error || "Lesson not found"}</Text>
        </Card>
      </div>
    );
  }

  const getTabDisplayName = (tab: TabType) => {
    const tabNames = {
      vocabulary: "Từ vựng",
      grammar: "Ngữ pháp",
      conversation: "Hội thoại",
      exercises: "Bài tập",
      ai: "Luyện với AI",
      summary: "Tổng kết"
    };
    return tabNames[tab] || "";
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "vocabulary":
        return (
          <VocabularyTable
            ref={vocabularyTableRef}
            data={vocabularies}
            loading={loading}
            onCloseSidebar={() => {
              setSidebarVisible(false);
              setDesktopSidebarCollapsed(true);
            }}
            onEnterFlashcard={() => {
              sidebarSnapshotRef.current = {
                sidebarVisible,
                desktopSidebarCollapsed,
              };
              setSidebarVisible(false);
              setDesktopSidebarCollapsed(true);
            }}
            onExitFlashcard={() => {
              const snapshot = sidebarSnapshotRef.current;
              if (snapshot) {
                setSidebarVisible(snapshot.sidebarVisible);
                setDesktopSidebarCollapsed(snapshot.desktopSidebarCollapsed);
                sidebarSnapshotRef.current = null;
              }
            }}
          />
        );
      case "grammar":
        return (
          <GrammarTab lessonNumber={lesson?.lessonNumber} grammars={grammars} />
        );
      case "conversation":
        return (
          <ConversationTab
            dialogs={dialogs}
            showDialogTranslation={showDialogTranslation}
            setShowDialogTranslation={setShowDialogTranslation}
            renderDialogConversation={renderDialogConversation}
            speakEntireConversation={speakEntireConversation}
            japaneseVoices={japaneseVoices}
            maleVoiceName={maleVoiceName}
            setMaleVoiceName={setMaleVoiceName}
            femaleVoiceName={femaleVoiceName}
            setFemaleVoiceName={setFemaleVoiceName}
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
          />
        );
      case "ai":
        return (
          <AiPracticeTab
            lessonNumber={lesson?.lessonNumber}
            aiMessages={aiMessages}
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            aiLoading={aiLoading}
            handleAIMessage={handleAIMessage}
          />
        );
      case "summary":
        return <SummaryTab vocabularies={vocabularies} grammars={grammars} />;
      default:
        return null;
    }
  };

  return (
    <Layout
      className="bg-white dark:bg-secondary-900"
      style={{
        paddingRight: screens.lg && !desktopSidebarCollapsed ? "280px" : "0",
      }}
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
        .lesson-tabs .ant-tabs-tab .anticon {
          margin-right: 0 !important;
          transform: translateY(-1px);
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
        .lesson-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
      `}</style>
      {/* Main Content */}
      <Layout>

        {/* Fixed Sidebar Toggle Button */}
        {(!screens.lg || desktopSidebarCollapsed) && (
          <div
            className="fixed bottom-6 right-4 z-40"
            style={{ bottom: "24px" }}
          >
            <Tooltip title="Danh sách bài học" placement="left">
              <Button
                shape="square"
                icon={<MenuFoldOutlined />}
                onClick={() =>
                  screens.lg
                    ? setDesktopSidebarCollapsed(false)
                    : setSidebarVisible(true)
                }
                className="border border-neutral-200 dark:border-neutral-700 shadow-lg hover:shadow-md bg-white dark:bg-secondary-925 px-2"
                size="large"
              >
                <span>50 Bài</span>
              </Button>
            </Tooltip>
          </div>
        )}

        <Content className="lesson-detail-content flex-1 sm:px-0 bg-white dark:bg-secondary-900 flex flex-col min-h-full overflow-auto">
          {screens.xs && (
            <style>
              {`
                .lesson-tabs .ant-tabs-nav-list {
                  display: flex;
                  width: 100%;
                }
                .lesson-tabs .ant-tabs-nav,
                .lesson-tabs .ant-tabs-nav-wrap,
                .lesson-tabs .ant-tabs-nav-list {
                  width: 100%;
                }
                .lesson-tabs .ant-tabs-tab {
                  flex: 1 1 0;
                  justify-content: center;
                  padding-left: 0;
                  padding-right: 0;
                  padding-top: 6px;
                  padding-bottom: 6px;
                }
              `}
            </style>
          )}
          <div className="sticky top-0 z-30 bg-white dark:bg-secondary-925 border-b border-secondary-200 dark:border-secondary-900">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as TabType)}
              className="lesson-tabs bg-white dark:bg-secondary-925"
              style={{ margin: 0, padding: screens.xs ? "0" : "0 8px" }}
              size={screens.xs ? "large" : screens.md ? "large" : "middle"}
              tabPlacement={screens.xs ? "top" : "top"}
              centered={screens.xs}
              items={[
                {
                  key: "vocabulary",
                  label: (
                    <span className="flex items-center gap-1">
                      <InfinitejapaneseIcon size={16} color="#000000" strokeWidth={2} />
                      {screens.md && <span>TỪ VỰNG</span>}
                    </span>
                  ),
                },
                {
                  key: "grammar",
                  label: (
                    <span className="flex items-center gap-1">
                      <ReadOutlined className="text-base" />
                      {screens.md && <span>NGỮ PHÁP</span>}
                    </span>
                  ),
                },
                {
                  key: "conversation",
                  label: (
                    <span className="flex items-center gap-1">
                      <MessageOutlined className="text-base" />
                      {screens.md && <span>HỘI THOẠI</span>}
                    </span>
                  ),
                },
                {
                  key: "exercises",
                  label: (
                    <span className="flex items-center gap-1">
                      <PlayCircleOutlined className="text-base" />
                      {screens.md && <span>BÀI TẬP</span>}
                    </span>
                  ),
                },
                {
                  key: "ai",
                  label: (
                    <span className="flex items-center gap-1">
                      <RobotOutlined className="text-base" />
                      {screens.md && <span>LUYỆN VỚI AI</span>}
                    </span>
                  ),
                },
                {
                  key: "summary",
                  label: (
                    <span className="flex items-center gap-1">
                      <TrophyOutlined className="text-base" />
                      {screens.md && <span>TỔNG KẾT</span>}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          <div className="px-3 lg:px-6 pt-3">
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="flex-1">
                <div className={`flex items-center gap-2 ${screens.xs ? "mb-2" : "mb-2"}`}>
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/lessons")}
                    className="rounded-full w-8 h-8 flex items-center justify-center border border-secondary-200 bg-white text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50 dark:border-secondary-800 dark:bg-secondary-925 dark:text-secondary-300 dark:hover:text-secondary-100 dark:hover:bg-secondary-800/60 transition-colors"
                  />
                  <Title level={2} className="!mb-0 pt-2 text-base sm:text-lg lg:text-xl leading-snug">
                    {lesson?.lessonNumber}. {lesson?.title} - {getTabDisplayName(activeTab)}
                  </Title>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      type="text"
                      size="middle"
                      className={`px-3 py-1.5 h-auto text-xs font-semibold rounded-lg transition-colors ${activeTab === "vocabulary" && vocabularies.length > 0
                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                        : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 dark:text-secondary-400 dark:hover:text-secondary-100 dark:hover:bg-secondary-800/60"
                        }`}
                      onClick={() => {
                        setActiveTab("vocabulary");
                        // Switch to flashcard mode after a short delay to ensure tab is active
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
                  </div>
                </div>
                <Text className="text-sm leading-relaxed line-clamp-2 text-secondary-600 dark:text-secondary-400">
                  {lesson?.description}
                </Text>
              </div>
            </div>
          </div>

          <div className="flex-1">{renderActiveTabContent()}</div>
        </Content>
      </Layout>

      {/* Meaning Button */}
      {showMeaningButton && (
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
      )}

      {/* Word Meaning Tooltip */}
      {clickedWord && (
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
      )}

      <LessonSidebar
        lessons={lessons}
        lessonsLoading={lessonsLoading}
        lessonId={lessonId}
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        desktopSidebarCollapsed={desktopSidebarCollapsed}
        setDesktopSidebarCollapsed={setDesktopSidebarCollapsed}
        onLessonClick={(lesson) => navigate(`/lessons/${lesson.id}`)}
      />
    </Layout>
  );
};

export default LessonDetail;
