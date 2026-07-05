import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Divider, Progress, Radio, Select, Space, Spin, Typography, message } from "antd";
import { ArrowLeft, RefreshCcw, Play, CheckCircle2, XCircle } from "lucide-react";
import { EmptyState } from "../../components/common";
import { testAttemptsAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import type { JLPTLevel, TextbookType, VocabularyItem } from "../../types/vocabulary";
import fakeTextbooksData from "../../data/fakeTextbooksData.json";

const { Title, Text } = Typography;

type Question = {
  id: string;
  prompt: string;
  answer: string;
  choices: string[];
  meta: { wordId: string; hiragana: string; kanji: string };
};

type ScopeMode = "all" | "lesson";

type LessonOption = {
  value: number;
  label: string;
};

const parseTextbookId = (textbookId: string): { textbook: TextbookType; level: JLPTLevel } | null => {
  const parts = textbookId.split("-");
  if (parts.length < 2) return null;
  if (parts[0] === "speed" && parts[1] === "master") {
    const level = (parts[2] || "").toUpperCase() as JLPTLevel;
    return { textbook: "speed-master", level };
  }
  return { textbook: parts[0] as TextbookType, level: parts[1].toUpperCase() as JLPTLevel };
};

const isTopicBasedTextbookId = (textbookId: string) =>
  textbookId.startsWith("tango-") || textbookId.startsWith("speed-master-");

const sample = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

const buildQuestions = (items: VocabularyItem[], count: number): Question[] => {
  const usable = items.filter((i) => (i.meaning || "").trim().length > 0);
  const selected = sample(usable, Math.min(count, usable.length));
  const meaningsPool = usable.map((i) => i.meaning).filter(Boolean);

  return selected.map((it, idx) => {
    const wrong = sample(
      meaningsPool.filter((m) => m !== it.meaning),
      3,
    );
    const choices = sample([it.meaning, ...wrong], 4);
    return {
      id: `${it.id}-${idx}`,
      prompt: it.kanji || it.hiragana,
      answer: it.meaning,
      choices,
      meta: { wordId: it.wordId, hiragana: it.hiragana, kanji: it.kanji },
    };
  });
};

const QuickTest: React.FC = () => {
  const { textbookId } = useParams<{ textbookId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<VocabularyItem[]>([]);
  const [activeItems, setActiveItems] = useState<VocabularyItem[]>([]);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [scopeMode, setScopeMode] = useState<ScopeMode>("all");
  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<number>(1);
  const [startTime, setStartTime] = useState<number>(0);
  const { currentUser } = useAppSelector((state) => state.user);

  const parsed = useMemo(() => (textbookId ? parseTextbookId(textbookId) : null), [textbookId]);

  useEffect(() => {
    const run = () => {
      if (!textbookId || !parsed) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Generate fake vocabulary items for testing
        const fakeVocabulary: VocabularyItem[] = [];
        const vocabCount = 100; // Generate 100 fake vocabulary items
        
        for (let i = 1; i <= vocabCount; i++) {
          const lessonNum = Math.ceil(i / 10);
          fakeVocabulary.push({
            id: `vocab-${i}`,
            wordId: `word-${i}`,
            hiragana: `かな${i}`,
            kanji: `漢字${i}`,
            meaning: `Nghĩa tiếng Việt ${i}`,
            lesson: lessonNum,
            topic: `Chủ đề ${lessonNum}`,
            textbook: parsed.textbook,
            level: parsed.level,
            sourceId: `source-${i}`,
            hanViet: `Hán Việt ${i}`,
            type: "noun",
            example: `Ví dụ ${i}`,
          });
        }
        
        setAllItems(fakeVocabulary);
        setActiveItems(fakeVocabulary);

        // Build lesson/topic options
        if (isTopicBasedTextbookId(textbookId)) {
          // Tango/Speed-master: use textbook metadata to show proper topic titles
          const textbook = fakeTextbooksData.textbooks.find(t => t.slug === textbookId);
          const chapters = textbook?.chapters || [];
          const opts: LessonOption[] = [];

          if (chapters.length > 0) {
            for (const ch of chapters) {
              const chNum = ch.number;
              const topics = ch.topics || [];
              for (let i = 0; i < topics.length; i++) {
                const lesson = (chNum - 1) * 5 + (i + 1);
                const topicTitle = topics[i]?.nameVi || topics[i]?.name || `Topic ${i + 1}`;
                opts.push({
                  value: lesson,
                  label: `${topicTitle} — Bài ${lesson} (Chương ${chNum})`,
                });
              }
            }
          } else {
            // Fallback: use default 50 lessons
            for (let i = 1; i <= 50; i++) {
              const chapterNum = Math.ceil(i / 5);
              opts.push({
                value: i,
                label: `Topic ${i} — Bài ${i} (Chương ${chapterNum})`,
              });
            }
          }

          setLessonOptions(opts);
        } else {
          // Minna: build lesson options from textbook data
          const textbook = fakeTextbooksData.textbooks.find(t => t.slug === textbookId);
          const lessons = textbook?.lessons || [];
          const opts = lessons.map((l) => {
            const title = l.titleVi || l.title;
            return {
              value: l.lessonNumber,
              label: title ? `${title} — Bài ${l.lessonNumber}` : `Bài ${l.lessonNumber}`,
            };
          });
          setLessonOptions(opts);
        }
      } catch (e) {
        console.error(e);
        message.error("Không thể tải dữ liệu từ vựng để tạo bài kiểm tra");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [textbookId, parsed]);

  useEffect(() => {
    if (!textbookId) return;
    // Reset quiz when changing scope settings
    setStarted(false);
    setQuestions([]);
    setAnswers({});
    setIndex(0);
    setShowResult(false);
  }, [scopeMode, selectedLesson, textbookId]);

  useEffect(() => {
    const run = () => {
      if (!textbookId || !parsed) return;
      if (scopeMode === "all") {
        setActiveItems(allItems);
        return;
      }
      // Scope to lesson/topic - filter from allItems
      const filtered = allItems.filter(item => item.lesson === selectedLesson);
      setActiveItems(filtered);
    };
    run();
  }, [scopeMode, selectedLesson, textbookId, parsed, allItems]);

  const total = questions.length;
  const current = questions[index];

  const correctCount = useMemo(() => {
    if (!showResult) return 0;
    return questions.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0);
  }, [answers, questions, showResult]);

  const start = () => {
    const qs = buildQuestions(activeItems, 10);
    if (qs.length === 0) {
      message.warning("Chưa đủ dữ liệu từ vựng để tạo bài kiểm tra");
      return;
    }
    setQuestions(qs);
    setAnswers({});
    setIndex(0);
    setShowResult(false);
    setStartTime(Date.now());
    setStarted(true);
  };

  const submit = async () => {
    setShowResult(true);
    
    if (currentUser?.id) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      
      try {
        await testAttemptsAPI.createAttempt({
          userId: currentUser.id,
          testId: `quick-test-${textbookId}-${scopeMode}`,
          testLevel: parsed?.level || "N5",
          testTitle: `Quick Test: ${textbookId?.toUpperCase()} (${scopeMode === "all" ? "Toàn bộ" : "Bài " + selectedLesson})`,
          status: "completed",
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: Math.ceil(timeSpent / 60) || 1,
          totalQuestions: total,
          correctAnswers: correctCount,
          score,
          timeSpent,
          sections: [{
            sectionId: "quick-test",
            name: "Từ vựng",
            questions: total,
            correctAnswers: correctCount,
            timeSpent,
            answers
          }]
        });
        message.success("Đã lưu kết quả bài kiểm tra!");
      } catch (e) {
        console.error("Lỗi khi lưu kết quả bài kiểm tra:", e);
      }
    }
  };

  const restart = () => {
    setStarted(false);
    setQuestions([]);
    setAnswers({});
    setIndex(0);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-3 text-text-sub">Đang chuẩn bị bài kiểm tra…</div>
        </div>
      </div>
    );
  }

  if (!textbookId || !parsed) {
    return (
      <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <EmptyState
          type="error"
          title="Không tìm thấy giáo trình"
          description="Đường dẫn không hợp lệ."
          size="default"
          action={{
            label: "Quay lại",
            onClick: () => navigate(-1),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <Button icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(`/textbook/${textbookId}`)}>
            Quay lại
          </Button>
          <Space>
            <Button icon={<RefreshCcw className="w-4 h-4" />} onClick={restart}>
              Làm lại
            </Button>
          </Space>
        </div>

        <Card className="bg-white dark:bg-slate-800 border-border shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Title level={3} className="!mb-1 !text-text-main">
                Làm bài kiểm tra nhanh
              </Title>
              <Text className="text-text-sub">
                {textbookId.toUpperCase()} · {activeItems.length} từ vựng trong phạm vi hiện tại
              </Text>
            </div>
            {!started && (
              <Button type="primary" icon={<Play className="w-4 h-4" />} onClick={start}>
                Bắt đầu
              </Button>
            )}
          </div>

          {!started && (
            <>
              <Divider className="!my-4" />
              <div className="flex flex-col gap-3">
                <div>
                  <Text className="text-text-sub text-sm block mb-2">Phạm vi luyện tập</Text>
                  <Radio.Group
                    value={scopeMode}
                    onChange={(e) => setScopeMode(e.target.value)}
                    options={[
                      { label: "Toàn bộ giáo trình", value: "all" },
                      { label: isTopicBasedTextbookId(textbookId) ? "Theo bài (topic)" : "Theo bài", value: "lesson" },
                    ]}
                  />
                </div>

                {scopeMode === "lesson" && (
                  <div className="max-w-md">
                    <Text className="text-text-sub text-sm block mb-2">
                      {isTopicBasedTextbookId(textbookId) ? "Chọn bài (topic)" : "Chọn bài"}
                    </Text>
                    <Select
                      value={selectedLesson}
                      onChange={setSelectedLesson}
                      options={lessonOptions}
                      className="w-full"
                      showSearch
                      optionFilterProp="label"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        {started && total > 0 && (
          <Card className="mt-4 bg-surface-1 border-border">
            {(() => {
              const answeredCount = Object.keys(answers).length;
              const progressPercent = Math.round((answeredCount / total) * 100);
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <Text className="text-text-sub">
                      Câu {index + 1}/{total}
                    </Text>
                    <Text className="text-text-sub">
                      Đã làm: {answeredCount}/{total} · {progressPercent}%
                    </Text>
                  </div>
                  <Progress percent={progressPercent} showInfo={false} />
                </>
              );
            })()}

            <div className="mt-5">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-text-main kanji-text">{current.prompt}</div>
                <div className="mt-2 text-base text-text-sub jp-text">{current.meta.hiragana}</div>
              </div>

              <Radio.Group
                className="w-full"
                value={answers[current.id]}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [current.id]: e.target.value }))}
                disabled={showResult}
              >
                <div className="grid gap-2">
                  {current.choices.map((c) => {
                    const picked = answers[current.id] === c;
                    const correct = showResult && c === current.answer;
                    const wrongPicked = showResult && picked && c !== current.answer;
                    return (
                      <label
                        key={c}
                        className={[
                          "rounded-xl border p-3 cursor-pointer transition-colors",
                          "bg-white dark:bg-slate-700 border-border hover:border-blue-400/40",
                          picked ? "ring-2 ring-blue-500/20" : "",
                          correct ? "border-emerald-500/60 bg-emerald-500/10" : "",
                          wrongPicked ? "border-red-500/60 bg-red-500/10" : "",
                        ].join(" ")}
                      >
                        <Radio value={c} className="w-full">
                          <span className="text-base text-text-main">{c}</span>
                        </Radio>
                      </label>
                    );
                  })}
                </div>
              </Radio.Group>

              <div className="flex items-center justify-between mt-5">
                <Button
                  disabled={index === 0}
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                >
                  Câu trước
                </Button>

                {index < total - 1 ? (
                  <Button
                    type="primary"
                    disabled={!answers[current.id]}
                    onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                  >
                    Câu tiếp
                  </Button>
                ) : (
                  <Button type="primary" onClick={submit} disabled={showResult}>
                    Nộp bài
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {showResult && (
          <>
            <Card className="mt-4 bg-surface-1 border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Title level={4} className="!mb-1 !text-text-main">
                    Kết quả
                  </Title>
                  <Text className="text-text-sub">
                    Đúng {correctCount}/{total} · {total ? Math.round((correctCount / total) * 100) : 0}%
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  {correctCount / Math.max(1, total) >= 0.8 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </div>
            </Card>

            {/* Wrong Answers Review */}
            {(() => {
              const wrongQuestions = questions.filter(q => answers[q.id] !== q.answer);
              if (wrongQuestions.length === 0) return null;
              
              return (
                <Card className="mt-4 bg-surface-1 border-border">
                  <Title level={5} className="!mb-3 !text-text-main">
                    Câu sai ({wrongQuestions.length})
                  </Title>
                  <div className="space-y-3">
                    {wrongQuestions.map((q, idx) => (
                      <div key={q.id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-start gap-3">
                          <span className="text-red-400 font-bold">{idx + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl font-bold kanji-text">{q.prompt}</span>
                              <span className="text-text-sub jp-text">{q.meta.hiragana}</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-red-400">✗</span>
                                <span className="text-text-main">{answers[q.id] || "Chưa trả lời"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span className="text-emerald-400 font-medium">{q.answer}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default QuickTest;

