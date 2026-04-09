import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Divider, Progress, Radio, Select, Space, Spin, Typography, message } from "antd";
import { ArrowLeft, RefreshCcw, Play, CheckCircle2, XCircle } from "lucide-react";
import { EmptyState } from "../../components/common";
import { getLessonVocabulary, getVocabulary } from "../../services/vocabularyDataService";
import type { JLPTLevel, TextbookType, VocabularyItem } from "../../types/vocabulary";

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

  const parsed = useMemo(() => (textbookId ? parseTextbookId(textbookId) : null), [textbookId]);

  useEffect(() => {
    const run = async () => {
      if (!textbookId || !parsed) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getVocabulary({ textbook: parsed.textbook, level: parsed.level });
        setAllItems(data);
        setActiveItems(data);

        // Build lesson/topic options
        if (isTopicBasedTextbookId(textbookId)) {
          // Tango/Speed-master: use textbook metadata to show proper topic titles
          let meta: any | null = null;
          try {
            const res = await fetch(`/data/textbook-${textbookId}.json`);
            if (res.ok) meta = await res.json();
          } catch {
            meta = null;
          }

          const chapters: any[] = Array.isArray(meta?.chapters) ? meta!.chapters : [];
          const opts: LessonOption[] = [];

          if (chapters.length > 0) {
            for (const ch of chapters) {
              const chNum = ch.number;
              const topics: any[] = Array.isArray(ch.topics) ? ch.topics : [];
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
            // Fallback: build from vocabulary data - group by lesson and get topic names
            const lessonData = new Map<number, { chapter: number; topic: string }>();
            
            data.forEach((item) => {
              if (item.lesson) {
                const chapterNum = Math.ceil(item.lesson / 5);
                const topicNum = ((item.lesson - 1) % 5) + 1;
                // Use topic field or meaning as topic name
                const topicName = item.topic || item.meaning || `Topic ${topicNum}`;
                
                if (!lessonData.has(item.lesson)) {
                  lessonData.set(item.lesson, { chapter: chapterNum, topic: topicName });
                }
              }
            });
            
            // Sort lessons and build options
            const sortedLessons = Array.from(lessonData.keys()).sort((a, b) => a - b);
            for (const lesson of sortedLessons) {
              const info = lessonData.get(lesson)!;
              opts.push({
                value: lesson,
                label: `${info.topic} — Bài ${lesson} (Chương ${info.chapter})`,
              });
            }
            
            // If no lesson data found, use default 50 lessons
            if (opts.length === 0) {
              for (let i = 1; i <= 50; i++) {
                const chapterNum = Math.ceil(i / 5);
                const topicNum = ((i - 1) % 5) + 1;
                opts.push({
                  value: i,
                  label: `Topic ${topicNum} — Bài ${i} (Chương ${chapterNum})`,
                });
              }
            }
          }

          setLessonOptions(opts);
        } else {
          // Minna: infer available lessons from data (lesson field) with titles
          const lessonData = new Map<number, string>();
          
          data.forEach((item) => {
            if (item.lesson && !lessonData.has(item.lesson)) {
              // Use topic or first word's meaning as lesson title
              const title = item.topic || item.meaning || "";
              lessonData.set(item.lesson, title);
            }
          });
          
          const lessons = Array.from(lessonData.keys()).sort((a, b) => a - b);
          const opts = lessons.map((l) => {
            const title = lessonData.get(l);
            return {
              value: l,
              label: title ? `${title} — Bài ${l}` : `Bài ${l}`,
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
    const run = async () => {
      if (!textbookId || !parsed) return;
      if (scopeMode === "all") {
        setActiveItems(allItems);
        return;
      }
      // Scope to lesson/topic
      try {
        const data = await getLessonVocabulary(textbookId, selectedLesson);
        setActiveItems(data);
      } catch (e) {
        console.error(e);
        message.error("Không thể tải từ vựng theo bài để tạo bài kiểm tra");
        setActiveItems([]);
      }
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
    setStarted(true);
  };

  const submit = () => {
    setShowResult(true);
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
      <div className="min-h-full bg-bg flex items-center justify-center p-8">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-3 text-text-sub">Đang chuẩn bị bài kiểm tra…</div>
        </div>
      </div>
    );
  }

  if (!textbookId || !parsed) {
    return (
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type="error"
          title="Không tìm thấy giáo trình"
          description="Đường dẫn không hợp lệ."
          action={{
            label: "Quay lại",
            onClick: () => navigate(-1),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-3xl mx-auto px-4 py-6">
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

        <Card className="bg-surface-1 border-border shadow-sm">
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
                          "bg-surface-2 border-border hover:border-blue-400/40",
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

