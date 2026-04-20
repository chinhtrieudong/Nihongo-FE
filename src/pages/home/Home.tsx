import React, { useMemo, useState } from "react";
import { Button, Spin, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { CourseCard } from "../../components/course";
import { EmptyState } from "../../components/common";
import { useTextbooks } from "../../hooks/useTextbooks";

interface TextbookSection {
  id: string;
  label: string;
  description: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  lessons: string[];
  textbook: string;
}

const textbookToAccent: Record<string, "blue" | "pink" | "orange" | "green" | "purple"> = {
  minna: "blue",
  tango: "pink",
  "speed-master": "orange",
  "jlpt-n3": "orange",
  "jlpt-n2": "green",
  "jlpt-n1": "purple",
};



const levelOptions: Array<"all" | "N5" | "N4" | "N3" | "N2" | "N1"> = [
  "all",
  "N5",
  "N4",
  "N3",
  "N2",
  "N1",
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState<"all" | "N5" | "N4" | "N3" | "N2" | "N1">("all");

  // Fetch textbooks from API
  const { textbooks, loading, error } = useTextbooks({
    level: activeLevel === "all" ? undefined : activeLevel,
    limit: 100,
  });

  // Transform API data to component format
  const sections: TextbookSection[] = useMemo(() => {
    return textbooks.map(book => {
      // Derive textbook type from slug
      const textbookType = book.slug.startsWith('minna') ? 'minna' :
                          book.slug.startsWith('tango') ? 'tango' :
                          book.slug.startsWith('speed-master') ? 'speed-master' :
                          book.slug.startsWith('jlpt') ? book.slug : 'minna';
      return {
        id: book.slug,
        label: book.name,
        description: book.description,
        level: book.level,
        lessons: book.lessons?.map((l: any, idx: number) => `Bài ${idx + 1}`) || [],
        textbook: textbookType,
      };
    });
  }, [textbooks]);

  const groupedSections = useMemo(() => {
    if (activeLevel !== "all") return { [activeLevel]: sections };

    const groups: Record<string, TextbookSection[]> = {};
    sections.forEach((section) => {
      if (!groups[section.level]) {
        groups[section.level] = [];
      }
      groups[section.level].push(section);
    });

    // Sort levels in order: N5, N4, N3, N2, N1
    const levelOrder = ["N5", "N4", "N3", "N2", "N1"];
    const sortedGroups: Record<string, TextbookSection[]> = {};
    levelOrder.forEach(level => {
      if (groups[level]) {
        sortedGroups[level] = groups[level];
      }
    });

    return sortedGroups;
  }, [sections, activeLevel]);

  const totalLessons = sections.reduce(
    (sum, section) => sum + section.lessons.length,
    0,
  );

  const handleViewLessons = (section: TextbookSection) => {
    navigate(`/textbook/${section.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-bg flex items-center justify-center">
        <Spin size="large" description="Đang tải..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-bg p-8">
        <EmptyState
          type="error"
          title="Không thể tải dữ liệu"
          description={error}
          size="default"
          action={{
            label: "Thử lại",
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg academic-canvas">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-2">
            Từ vựng theo giáo trình
          </h1>
          <p className="text-text-sub text-lg">
            Khám phá từng cấp độ JLPT với Minna, Tango và các bộ luyện từ vựng chuyên biệt.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {levelOptions.map((level) => (
            <Button
              key={level}
              type={activeLevel === level ? "primary" : "default"}
              onClick={() => setActiveLevel(level)}
            >
              {level === "all" ? "Tất cả" : level}
            </Button>
          ))}
        </div>

        <div className="mb-8 text-center">
          <Tag color="geekblue">{activeLevel === "all" ? "Tất cả" : activeLevel}</Tag>
          <span className="ml-3 text-text-secondary">
            Có {totalLessons} bài học mẫu cho {activeLevel === "all" ? "tất cả cấp độ" : `cấp độ ${activeLevel}`}.
          </span>
        </div>

        {sections.length === 0 ? (
          <EmptyState
            type="data"
            title="Chưa có giáo trình"
            description={`Không tìm thấy giáo trình nào cho cấp độ ${activeLevel === "all" ? "này" : activeLevel}. Vui lòng thử lại sau hoặc chọn cấp độ khác.`}
            size="default"
            action={{
              label: "Tải lại",
              onClick: () => window.location.reload(),
            }}
          />
        ) : activeLevel === "all" ? (
          Object.entries(groupedSections).map(([level, levelSections]) => (
            <div key={level} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-text-main">
                  JLPT {level}
                </h2>
                <div className="h-px bg-border flex-1"></div>
                <Tag color={level === "N5" ? "geekblue" : level === "N4" ? "green" : level === "N3" ? "orange" : level === "N2" ? "red" : "purple"}>
                  {levelSections.length} giáo trình
                </Tag>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {levelSections.map((section) => (
                  <CourseCard
                    key={section.id || `${section.textbook}-${section.level}-${section.label}`}
                    title={section.label}
                    description={section.description}
                    lessonCount={section.lessons.length}
                    level={section.level}
                    accentColor={textbookToAccent[section.textbook] || "blue"}
                    onAction={() => handleViewLessons(section)}
                    actionLabel="Xem bài học"
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
              <CourseCard
                key={section.id || `${section.textbook}-${section.level}-${section.label}`}
                title={section.label}
                description={section.description}
                lessonCount={section.lessons.length}
                level={section.level}
                accentColor={textbookToAccent[section.textbook] || "blue"}
                onAction={() => handleViewLessons(section)}
                actionLabel="Xem bài học"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
