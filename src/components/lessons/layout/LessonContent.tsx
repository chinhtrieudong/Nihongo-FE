import React from "react";

type TabType = "vocabulary" | "grammar" | "dialog" | "exercises" | "ai" | "summary";

interface LessonContentProps {
    activeTab: TabType;
    children: React.ReactNode;
}

const LessonContent: React.FC<LessonContentProps> = ({
    activeTab,
    children,
}) => {
    return (
        <div className="p-4 sm:p-6">
            {children}
        </div>
    );
};

export default LessonContent;
