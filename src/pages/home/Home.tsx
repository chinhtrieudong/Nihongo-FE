import React, { useMemo, useState } from "react";
import { Button, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { CourseCard } from "../../components/course";

interface TextbookSection {
  id: string;
  label: string;
  description: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  lessons: string[];
  textbook: string;
}

const curriculumSections: TextbookSection[] = [
  {
    id: "minna-n5",
    label: "Minna no Nihongo N5",
    description: "Giáo trình Minna no Nihongo cấp độ N5",
    level: "N5",
    lessons: ["Bài 1", "Bài 2", "Bài 3", "Bài 4"],
    textbook: "minna",
  },
  {
    id: "minna-n4",
    label: "Minna no Nihongo N4",
    description: "Giáo trình Minna no Nihongo cấp độ N4",
    level: "N4",
    lessons: ["Bài 21", "Bài 22", "Bài 23"],
    textbook: "minna",
  },
  {
    id: "tango-n5",
    label: "Tango N5",
    description: "Từ vựng theo giáo trình Tango cấp độ N5",
    level: "N5",
    lessons: ["Bài 1", "Bài 2", "Bài 3"],
    textbook: "tango",
  },
  {
    id: "tango-n4",
    label: "Tango N4",
    description: "Từ vựng theo giáo trình Tango cấp độ N4",
    level: "N4",
    lessons: ["Bài 11", "Bài 12", "Bài 13"],
    textbook: "tango",
  },
  {
    id: "tango-n3",
    label: "Tango N3",
    description: "Từ vựng theo giáo trình Tango cấp độ N3",
    level: "N3",
    lessons: ["Bài 1", "Bài 2", "Bài 3"],
    textbook: "tango",
  },
  {
    id: "tango-n2",
    label: "Tango N2",
    description: "Từ vựng theo giáo trình Tango cấp độ N2",
    level: "N2",
    lessons: ["Bài 1", "Bài 2", "Bài 3"],
    textbook: "tango",
  },
  {
    id: "tango-n1",
    label: "Tango N1",
    description: "Từ vựng theo giáo trình Tango cấp độ N1",
    level: "N1",
    lessons: ["Bài 1", "Bài 2", "Bài 3"],
    textbook: "tango",
  },
  {
    id: "speed-master-n3",
    label: "Speed Master N3",
    description: "Luyện từ vựng N3 nhanh và hiệu quả",
    level: "N3",
    lessons: ["Chương 1", "Chương 2", "Chương 3"],
    textbook: "speed-master",
  },
  {
    id: "speed-master-n2",
    label: "Speed Master N2",
    description: "Luyện từ vựng N2 nâng cao",
    level: "N2",
    lessons: ["Chương 1", "Chương 2", "Chương 3"],
    textbook: "speed-master",
  },
  {
    id: "speed-master-n1",
    label: "Speed Master N1",
    description: "Luyện từ vựng N1 chuyên sâu",
    level: "N1",
    lessons: ["Chương 1", "Chương 2", "Chương 3"],
    textbook: "speed-master",
  },
];

const textbookToAccent: Record<string, "blue" | "pink" | "orange" | "green" | "purple"> = {
  minna: "blue",
  tango: "pink",
  "speed-master": "orange",
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

  const sections = useMemo(
    () =>
      curriculumSections.filter(
        (section) => activeLevel === "all" || section.level === activeLevel,
      ),
    [activeLevel],
  );

  const groupedSections = useMemo(() => {
    if (activeLevel !== "all") return { [activeLevel]: sections };

    const groups: Record<string, typeof sections> = {};
    sections.forEach((section) => {
      if (!groups[section.level]) {
        groups[section.level] = [];
      }
      groups[section.level].push(section);
    });

    // Sort levels in order: N5, N4, N3, N2, N1
    const levelOrder = ["N5", "N4", "N3", "N2", "N1"];
    const sortedGroups: Record<string, typeof sections> = {};
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
    // Navigate to textbook detail page showing list of lessons
    navigate(`/textbook/${section.id}`);
  };

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

        {activeLevel === "all" ? (
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
                    key={section.id}
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
                key={section.id}
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
