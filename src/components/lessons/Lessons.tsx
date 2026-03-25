import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { lessonAPI } from "../../services/api";
import type {
    Lesson,
    LessonDetail,
} from "../../types/lesson";
import { Spin } from "antd";

// Import components
import LessonHeader from "./layout/LessonHeader.js";
import LessonNavigation from "./layout/LessonNavigation.js";
import LessonContent from "./layout/LessonContent.js";

// Import tab components
import VocabularyTab from "./tabs/VocabularyTab.js";
import GrammarTab from "./tabs/GrammarTab.js";
import DialogTab from "./tabs/DialogTab.js";
import ExercisesTab from "./tabs/ExercisesTab.js";
import AITab from "./tabs/AITab.js";
import SummaryTab from "./tabs/SummaryTab.js";

type TabType =
    | "vocabulary"
    | "grammar"
    | "dialog"
    | "exercises"
    | "ai"
    | "summary";

const Lessons: React.FC = () => {
    const { currentUser } = useAppSelector((state) => state.user);
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("vocabulary");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadLessons();
        }
    }, [currentUser]);

    useEffect(() => {
        if (lessonId && lessons.length > 0) {
            const lesson = lessons.find((l) => l.id === lessonId);
            if (lesson) {
                setSelectedLesson(lesson);
            }
        } else if (lessons.length > 0 && !selectedLesson) {
            setSelectedLesson(lessons[0]);
        }
    }, [lessonId, lessons]);

    useEffect(() => {
        if (selectedLesson) {
            loadLessonDetail(selectedLesson.id);
            // Update URL if not already set
            if (lessonId !== selectedLesson.id) {
                navigate(`/mina/${selectedLesson.id}`);
            }
        }
    }, [selectedLesson, navigate]);

    const loadLessons = async () => {
        try {
            const response = await lessonAPI.getLessons(currentUser?.id);
            if (response.success && response.data) {
                setLessons(response.data.lessons);
                // Auto-select first lesson
                if (response.data.lessons.length > 0 && !selectedLesson) {
                    setSelectedLesson(response.data.lessons[0]);
                }
            } else {
                console.error("API response missing success or data:", response);
                setLessons([]);
            }
        } catch (error) {
            console.error("Failed to load lessons:", error);
            setLessons([]);
        }
    };

    const loadLessonDetail = async (lessonId: string) => {
        setLoading(true);
        try {
            const response = await lessonAPI.getLessonDetail(lessonId);
            if (response?.lesson) {
                setLessonDetail(response);
            } else if (response?.success && response?.data) {
                setLessonDetail(response.data);
            } else {
                console.error(
                    "API response missing data for lesson detail:",
                    response
                );
            }
        } catch (error) {
            console.error("Failed to load lesson detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "vocabulary" as TabType, label: "📚 Từ vựng", icon: "📚" },
        { id: "grammar" as TabType, label: "📘 Ngữ pháp", icon: "📘" },
        { id: "dialog" as TabType, label: "💬 Hội thoại", icon: "💬" },
        { id: "exercises" as TabType, label: "✍ Bài tập", icon: "✍" },
        { id: "ai" as TabType, label: "🤖 Luyện AI", icon: "🤖" },
        { id: "summary" as TabType, label: "📝 Tổng kết", icon: "📝" },
    ];

    const tabComponents = {
        vocabulary: <VocabularyTab vocabulary={lessonDetail?.vocabularies || []} />,
        grammar: <GrammarTab grammar={lessonDetail?.grammars || []} />,
        dialog: <DialogTab dialogs={lessonDetail?.dialogs || []} />,
        exercises: (
            <ExercisesTab
                exercises={lessonDetail?.exercises || []}
                lessonId={selectedLesson?.id || ""}
            />
        ),
        ai: <AITab lesson={lessonDetail?.lesson!} />,
        summary: <SummaryTab lessonDetail={lessonDetail!} />,
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-950 dark:to-primary-950">
            {selectedLesson && lessonDetail ? (
                <>
                    <LessonHeader
                        selectedLesson={selectedLesson}
                        lessonDetail={lessonDetail}
                    />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                            <LessonNavigation
                                tabs={tabs}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                lessonDetail={lessonDetail}
                            />

                            <LessonContent activeTab={activeTab}>
                                {tabComponents[activeTab]}
                            </LessonContent>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center min-h-full px-4">
                    <Spin size="large" className="text-center">
                        <div className="mt-4">
                            <h3 className="text-lg sm:text-xl">Đang tải bài học...</h3>
                        </div>
                    </Spin>
                </div>
            )}
        </div>
    );
};

export default Lessons;
