import React from "react";
import { Grid } from "antd";

type TabType = "vocabulary" | "grammar" | "dialog" | "exercises" | "ai" | "summary";

interface LessonContentProps {
    activeTab: TabType;
    children: React.ReactNode;
}

const LessonContent: React.FC<LessonContentProps> = ({
    activeTab,
    children,
}) => {
    const screens = Grid.useBreakpoint();

    return (
        <div className={`bg-white dark:bg-secondary-900 ${screens.xs ? 'px-4 py-3' : 'px-6 py-4'
            }`}>
            <div className={`max-w-full ${screens.xs ? 'space-y-4' : 'space-y-6'
                }`}>
                {children}
            </div>
        </div>
    );
};

export default LessonContent;
