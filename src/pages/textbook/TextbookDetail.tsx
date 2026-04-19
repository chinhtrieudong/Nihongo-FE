import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Tag, Typography, Badge, Progress, Spin, Collapse } from "antd";
import { EmptyState } from "../../components/common";
import { ArrowLeft, BookOpen, ChevronRight, PlayCircle, FileQuestion, CheckCircle2, Clock, BookText, Circle } from "lucide-react";

const { Title, Text } = Typography;

type LessonStatus = "not-started" | "in-progress" | "completed";

interface LessonInfo {
  number: number;
  topic: string;
  vocabCount: number;
  status: LessonStatus;
}

interface TextbookInfo {
  id: string;
  label: string;
  description: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  totalLessons: number;
  startLesson: number;
  textbook: string;
  accentColor: "blue" | "pink" | "orange" | "green" | "purple";
}

const textbooksData: Record<string, TextbookInfo> = {
  "minna-n5": {
    id: "minna-n5",
    label: "Minna no Nihongo N5",
    description: "Giáo trình Minna no Nihongo cấp độ N5 - 25 bài học căn bản",
    level: "N5",
    totalLessons: 25,
    startLesson: 1,
    textbook: "minna",
    accentColor: "blue",
  },
  "minna-n4": {
    id: "minna-n4",
    label: "Minna no Nihongo N4",
    description: "Giáo trình Minna no Nihongo cấp độ N4 - 50 bài học nâng cao",
    level: "N4",
    totalLessons: 50,
    startLesson: 1,
    textbook: "minna",
    accentColor: "blue",
  },
  "tango-n5": {
    id: "tango-n5",
    label: "Tango N5",
    description: "Từ vựng theo giáo trình Tango cấp độ N5",
    level: "N5",
    totalLessons: 50,
    startLesson: 1,
    textbook: "tango",
    accentColor: "pink",
  },
  "tango-n4": {
    id: "tango-n4",
    label: "Tango N4",
    description: "Từ vựng theo giáo trình Tango cấp độ N4",
    level: "N4",
    totalLessons: 30,
    startLesson: 1,
    textbook: "tango",
    accentColor: "pink",
  },
  "tango-n3": {
    id: "tango-n3",
    label: "Tango N3",
    description: "Từ vựng theo giáo trình Tango cấp độ N3",
    level: "N3",
    totalLessons: 50,
    startLesson: 1,
    textbook: "tango",
    accentColor: "orange",
  },
  "tango-n2": {
    id: "tango-n2",
    label: "Tango N2",
    description: "Từ vựng theo giáo trình Tango cấp độ N2",
    level: "N2",
    totalLessons: 50,
    startLesson: 1,
    textbook: "tango",
    accentColor: "green",
  },
  "tango-n1": {
    id: "tango-n1",
    label: "Tango N1",
    description: "Từ vựng theo giáo trình Tango cấp độ N1",
    level: "N1",
    totalLessons: 50,
    startLesson: 1,
    textbook: "tango",
    accentColor: "purple",
  },
  "speed-master-n3": {
    id: "speed-master-n3",
    label: "Speed Master N3",
    description: "Luyện từ vựng N3 nhanh và hiệu quả - 1,200 từ",
    level: "N3",
    totalLessons: 50,
    startLesson: 1,
    textbook: "speed-master",
    accentColor: "orange",
  },
  "speed-master-n2": {
    id: "speed-master-n2",
    label: "Speed Master N2",
    description: "Luyện từ vựng N2 nâng cao - 1,500 từ",
    level: "N2",
    totalLessons: 50,
    startLesson: 1,
    textbook: "speed-master",
    accentColor: "green",
  },
  "speed-master-n1": {
    id: "speed-master-n1",
    label: "Speed Master N1",
    description: "Luyện từ vựng N1 chuyên sâu - 2,000+ từ",
    level: "N1",
    totalLessons: 50,
    startLesson: 1,
    textbook: "speed-master",
    accentColor: "purple",
  },
  "jlpt-n3": {
    id: "jlpt-n3",
    label: "JLPT N3 Vocabulary",
    description: "Luyện từ vựng & kanji N3 theo JLPT",
    level: "N3",
    totalLessons: 20,
    startLesson: 1,
    textbook: "jlpt-n3",
    accentColor: "orange",
  },
  "jlpt-n2": {
    id: "jlpt-n2",
    label: "JLPT N2 Vocabulary",
    description: "Bộ từ vựng JLPT N2 cho người trung cấp",
    level: "N2",
    totalLessons: 20,
    startLesson: 1,
    textbook: "jlpt-n2",
    accentColor: "green",
  },
  "jlpt-n1": {
    id: "jlpt-n1",
    label: "JLPT N1 Vocabulary",
    description: "Nâng cao với từ vựng và kanji N1",
    level: "N1",
    totalLessons: 20,
    startLesson: 1,
    textbook: "jlpt-n1",
    accentColor: "purple",
  },
};

// Color mapping for Tailwind classes
const colorMap: Record<string, { bg: string; border: string; text: string; bgLight: string; hoverBorder: string; colorValue: string }> = {
  blue: { bg: "bg-blue-500", border: "border-blue-500", text: "text-blue-600", bgLight: "bg-blue-100", hoverBorder: "hover:border-blue-500", colorValue: "#3b82f6" },
  pink: { bg: "bg-pink-500", border: "border-pink-500", text: "text-pink-600", bgLight: "bg-pink-100", hoverBorder: "hover:border-pink-500", colorValue: "#ec4899" },
  orange: { bg: "bg-orange-500", border: "border-orange-500", text: "text-orange-600", bgLight: "bg-orange-100", hoverBorder: "hover:border-orange-500", colorValue: "#f97316" },
  green: { bg: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-100", hoverBorder: "hover:border-emerald-500", colorValue: "#10b981" },
  purple: { bg: "bg-violet-500", border: "border-violet-500", text: "text-violet-600", bgLight: "bg-violet-100", hoverBorder: "hover:border-violet-500", colorValue: "#8b5cf6" },
};

// Fetch textbook data from JSON file
const fetchTextbookData = async (textbookId: string): Promise<{ 
  lessons?: Array<{ number: number; topic: string; vocab: number }>;
  chapters?: Array<{ number: number; title: string; titleVi: string; vocab: number; topics: Array<{name: string; nameVi: string}> }>;
} | null> => {
  try {
    // Try root data folder first (where most textbook JSON files are located)
    const url = `/data/textbook/textbook-${textbookId}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[fetchTextbookData] Error:", error);
    return null;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "N5": return "geekblue";
    case "N4": return "green";
    case "N3": return "orange";
    case "N2": return "red";
    case "N1": return "purple";
    default: return "default";
  }
};

const getStatusConfig = (status: LessonStatus) => {
  switch (status) {
    case "completed":
      return { color: "success", text: "Đã xong", icon: <CheckCircle2 className="w-3 h-3" />, bgColor: "#22c55e20", borderColor: "#22c55e" };
    case "in-progress":
      return { color: "blue", text: "Đang học", icon: <Clock className="w-3 h-3" />, bgColor: "#3b82f620", borderColor: "#3b82f6" };
    default:
      // Show icon-only for "not started" to reduce visual noise
      return { color: "default", text: "", icon: <Circle className="w-3 h-3" />, bgColor: "#6b728020", borderColor: "#6b7280" };
  }
};

// Group lessons into chunks
const groupLessons = (lessons: LessonInfo[], groupSize: number = 5) => {
  const groups: { name: string; lessons: LessonInfo[] }[] = [];
  for (let i = 0; i < lessons.length; i += groupSize) {
    const chunk = lessons.slice(i, i + groupSize);
    const startNum = chunk[0].number;
    const endNum = chunk[chunk.length - 1].number;
    groups.push({
      name: `Bài ${startNum} - ${endNum}`,
      lessons: chunk,
    });
  }
  return groups;
};

const TextbookDetail: React.FC = () => {
  const { textbookId } = useParams<{ textbookId: string }>();
  const navigate = useNavigate();
  const [completedLessons] = useState<number[]>([]);
  const [inProgressLessons] = useState<number[]>([]);
  const [textbookData, setTextbookData] = useState<{ 
    lessons?: Array<{ number: number; topic: string; vocab: number }>;
    chapters?: Array<{ number: number; title: string; titleVi: string; vocab: number; topics: Array<{name: string; nameVi: string}> }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const textbook = textbookId ? textbooksData[textbookId] : null;

  // Fetch textbook data from JSON
  useEffect(() => {
    const fetchData = async () => {
      if (!textbookId) return;
      setLoading(true);
      const data = await fetchTextbookData(textbookId);
      setTextbookData(data);
      setLoading(false);
    };
    fetchData();
  }, [textbookId]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!textbook) return { completed: 0, inProgress: 0, percentage: 0 };
    const completed = completedLessons.length;
    const inProgress = inProgressLessons.length;
    const percentage = Math.round((completed / textbook.totalLessons) * 100);
    return { completed, inProgress, percentage };
  }, [textbook, completedLessons, inProgressLessons]);

  // Find continue lesson
  const continueLesson = useMemo(() => {
    if (!textbook) return null;
    for (let i = textbook.startLesson; i <= textbook.startLesson + textbook.totalLessons - 1; i++) {
      if (inProgressLessons.includes(i) || !completedLessons.includes(i)) {
        return i;
      }
    }
    return null;
  }, [textbook, inProgressLessons, completedLessons]);

  if (!textbook) {
    return (
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type="error"
          title="Không tìm thấy giáo trình"
          description="Giáo trình bạn đang tìm kiếm không tồn tại."
          size="default"
          action={{
            label: "Quay lại trang chủ",
            onClick: () => navigate("/"),
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Generate lessons with info from JSON
  const lessons: LessonInfo[] = Array.from({ length: textbook.totalLessons }, (_, i) => {
    const lessonNumber = textbook.startLesson + i;
    const lessonFromJson = textbookData?.lessons?.find(l => l.number === lessonNumber);
    
    let status: LessonStatus = "not-started";
    if (completedLessons.includes(lessonNumber)) status = "completed";
    else if (inProgressLessons.includes(lessonNumber)) status = "in-progress";

    return {
      number: lessonNumber,
      topic: lessonFromJson?.topic || `Chủ đề bài ${lessonNumber}`,
      vocabCount: lessonFromJson?.vocab || 40 + Math.floor(Math.random() * 15),
      status,
    };
  });

  // Get chapters for Tango/Speed Master textbooks (any textbook with chapter-based structure)
  const chapters = textbookData?.chapters || [];
  const hasChapters = textbookId?.startsWith('tango') || textbookId?.startsWith('speed-master');

  const lessonGroups = groupLessons(lessons);

  const handleLessonClick = (lessonNumber: number) => {
    // Navigate to vocabulary detail page for the lesson
    navigate(`/textbook/${textbookId}/vocabulary/${lessonNumber}`);
  };

  const handleContinueLearning = () => {
    if (continueLesson) {
      handleLessonClick(continueLesson);
    }
  };

  const handleQuickTest = () => {
    // Quick test page for this textbook
    navigate(`/textbook/${textbookId}/quick-test`);
  };

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/")}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="mb-2"
          >
            Quay lại
          </Button>

          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorMap[textbook.accentColor].bgLight}`}
            >
              <BookOpen className={`w-8 h-8 ${colorMap[textbook.accentColor].text}`} />
            </div>
            <div className="flex-1">
              <Title level={3} className="!mb-2 !text-text-main">{textbook.label}</Title>
              <Text className="text-text-sub">{textbook.description}</Text>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {continueLesson && (
            <Button
              type="primary"
              size="large"
              icon={<PlayCircle className="w-5 h-5" />}
              onClick={handleContinueLearning}
              className="flex items-center gap-2 font-semibold"
              style={{ backgroundColor: "#f59e0b", borderColor: "#f59e0b" }}
            >
              Học tiếp - Bài {continueLesson}
            </Button>
          )}
          <Button
            size="large"
            icon={<FileQuestion className="w-5 h-5" />}
            onClick={handleQuickTest}
            className="flex items-center gap-2"
          >
            Làm bài kiểm tra nhanh
          </Button>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 bg-surface-1 border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Text strong className="text-text-main text-lg">Tiến độ học tập</Text>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <div className={`w-3 h-3 rounded-full ${colorMap[textbook.accentColor].bg}`} />
                <span className="text-text-sub">{progress.completed} hoàn thành</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <div className="w-3 h-3 rounded-full bg-surface-2" />
                <span className="text-text-sub">{textbook.totalLessons - progress.completed - progress.inProgress} chưa học</span>
              </div>
              <Text strong className={`text-lg ${colorMap[textbook.accentColor].text}`}>
                {progress.percentage}%
              </Text>
            </div>
          </div>
          <Progress
            percent={progress.percentage}
            strokeColor={colorMap[textbook.accentColor].colorValue}
            // Antd v6: prefer railColor/size, but keep legacy props so it renders correctly in all themes.
            railColor="#e5e7eb"
            trailColor="#e5e7eb"
            strokeWidth={12}
            showInfo={false}
          />
        </Card>

        {/* Content - Chapters for Tango/Speed Master, Lessons for Minna */}
        {hasChapters && chapters.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Title level={5} className="!mb-0 !text-text-main">Mục lục</Title>
              <div className="h-px bg-border flex-1" />
              <Tag color="default" className="text-xs">{chapters.length} chương</Tag>
            </div>
            
            <Collapse
              ghost
              expandIconPlacement="end"
              className="tango-chapters-collapse"
              items={chapters.map((chapter) => ({
                key: `chapter-${chapter.number}`,
                label: (
                  <div className="flex items-center gap-3 py-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${colorMap[textbook.accentColor].bgLight} ${colorMap[textbook.accentColor].text} flex-shrink-0`}
                    >
                      C{chapter.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text className="text-lg font-semibold text-text-main block truncate">
                        Chương {chapter.number}: {chapter.titleVi}
                      </Text>
                      <Text className="text-sm text-text-sub block">
                        {chapter.title} · {chapter.vocab} từ vựng
                      </Text>
                    </div>
                  </div>
                ),
                children: (
                  <div className="pl-4 space-y-2">
                    {chapter.topics.map((topic, idx) => {
                      const lessonNum = (chapter.number - 1) * 5 + idx + 1;
                      const lesson = lessons.find(l => l.number === lessonNum);
                      const statusConfig = getStatusConfig(lesson?.status || "not-started");
                      return (
                        <Card
                          key={`lesson-${lessonNum}`}
                          hoverable
                          size="small"
                          onClick={() => handleLessonClick(lessonNum)}
                          className={`bg-surface-1 border border-border cursor-pointer group hover:shadow-md transition-all duration-200 hover:scale-[1.01] ${colorMap[textbook.accentColor].hoverBorder} ${
                            lesson?.status === "completed" ? "opacity-75" : ""
                          }`}
                          styles={{ body: { padding: "12px 16px" } }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Number */}
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${colorMap[textbook.accentColor].bgLight} ${colorMap[textbook.accentColor].text} flex-shrink-0`}
                              >
                                {lessonNum}
                              </div>
                              
                              {/* Topic */}
                              <div className="flex-1 min-w-0">
                                <Text className="text-text-main text-base font-medium block truncate">
                                  {topic.name}
                                </Text>
                                <Text className="text-text-sub text-sm block truncate">
                                  {topic.nameVi}
                                </Text>
                              </div>
                            </div>
                            
                            {/* Right side: Status + Arrow */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {/* Status icon-only */}
                              <div
                                className="inline-flex items-center justify-center h-7 w-7 rounded-md border"
                                style={{
                                  backgroundColor: statusConfig.bgColor,
                                  borderColor: statusConfig.borderColor,
                                  color: statusConfig.borderColor,
                                }}
                                aria-label={lesson?.status === "not-started" ? "Chưa học" : statusConfig.text}
                                title={lesson?.status === "not-started" ? "Chưa học" : statusConfig.text}
                              >
                                {statusConfig.icon}
                              </div>
                              
                              <ChevronRight
                                className={`w-5 h-5 text-text-sub opacity-60 group-hover:opacity-100 transition-opacity ${colorMap[textbook.accentColor].text}`}
                              />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ),
              }))}
            />
          </div>
        ) : (
          /* Lesson Groups for Minna */
          <div className="flex flex-col gap-2">
            {lessons.map((lesson) => {
              const statusConfig = getStatusConfig(lesson.status);
              
              return (
                <Card
                  key={lesson.number}
                  hoverable
                  onClick={() => handleLessonClick(lesson.number)}
                  className={`bg-surface-1 border border-border cursor-pointer group hover:shadow-md transition-all duration-200 hover:scale-[1.01] ${colorMap[textbook.accentColor].hoverBorder} ${
                    lesson.status === "completed" ? "opacity-75" : ""
                  }`}
                  styles={{ body: { padding: "12px 16px" } }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Number */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${colorMap[textbook.accentColor].bgLight} ${colorMap[textbook.accentColor].text} flex-shrink-0`}
                      >
                        {lesson.number}
                      </div>
                      
                      {/* Topic */}
                      <Text className="text-text-main text-base font-medium truncate">
                        {lesson.topic}
                      </Text>
                    </div>
                    
                    {/* Right side: Vocab count + Arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Status icon (icon-only for "not started") */}
                      <div
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md border"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          borderColor: statusConfig.borderColor,
                          color: statusConfig.borderColor,
                        }}
                        aria-label={lesson.status === "not-started" ? "Chưa học" : statusConfig.text}
                        title={lesson.status === "not-started" ? "Chưa học" : statusConfig.text}
                      >
                        {statusConfig.icon}
                      </div>
                      <span className="flex items-center gap-1 text-sm text-text-sub">
                        <BookText className="w-4 h-4" />
                        {lesson.vocabCount} từ
                      </span>
                      
                      <ChevronRight
                        className={`w-5 h-5 text-text-sub opacity-60 group-hover:opacity-100 transition-opacity ${colorMap[textbook.accentColor].text}`}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-surface-1 border-border mt-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[textbook.accentColor].bgLight}`}
            >
              <BookOpen className={`w-5 h-5 ${colorMap[textbook.accentColor].text}`} />
            </div>
            <div>
              <Text strong className="text-text-main block mb-1">Bắt đầu học</Text>
              <Text className="text-text-sub text-sm">
                Chọn một bài học từ danh sách trên để bắt đầu. Mỗi bài bao gồm từ vựng, ngữ pháp, hội thoại và bài tập.
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TextbookDetail;
