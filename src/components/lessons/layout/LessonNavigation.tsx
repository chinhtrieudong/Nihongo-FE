import React from "react";
import { Badge } from "antd";
import type { LessonDetail } from "../../../types/lesson";

type TabType = "vocabulary" | "grammar" | "dialog" | "exercises" | "ai" | "summary";

interface LessonNavigationProps {
    tabs: Array<{ id: TabType; label: string; icon: string }>;
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    lessonDetail: LessonDetail;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
    tabs,
    activeTab,
    setActiveTab,
    lessonDetail,
}) => {
    return (
        <div className="border-b border-secondary-200 dark:border-secondary-800">
            <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                            ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                            : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                            }`}
                    >
                        <span className="text-lg sm:text-xl">{tab.icon}</span>
                        <span className="text-sm sm:text-base">{tab.label}</span>
                        {tab.id === 'vocabulary' && lessonDetail.vocabularies.length > 0 && (
                            <Badge count={lessonDetail.vocabularies.length} size="small" className="ml-1" />
                        )}
                        {tab.id === 'grammar' && lessonDetail.grammars.length > 0 && (
                            <Badge count={lessonDetail.grammars.length} size="small" className="ml-1" />
                        )}
                        {tab.id === 'exercises' && lessonDetail.exercises.length > 0 && (
                            <Badge count={lessonDetail.exercises.length} size="small" className="ml-1" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LessonNavigation;
