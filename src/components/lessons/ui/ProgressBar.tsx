import React from "react";
import { Progress } from "antd";

interface ProgressBarProps {
    percent: number;
    strokeColor?: string | { [key: string]: string };
    trailColor?: string;
    size?: number;
    showInfo?: boolean;
    className?: string;
    labels?: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    percent,
    strokeColor = {
        '0%': '#108ee9',
        '100%': '#52c41a',
    },
    trailColor = "#f0f0f0",
    size = 8,
    showInfo = false,
    className = "",
    labels = ["Bắt đầu", "Hoàn thành"],
}) => {
    return (
        <div className={className}>
            <Progress
                percent={percent}
                strokeColor={strokeColor}
                trailColor={trailColor}
                size={size}
                showInfo={showInfo}
            />
            {labels.length > 0 && (
                <div className="flex justify-between text-xs text-gray-600 dark:text-secondary-400 mt-2">
                    {labels.map((label, index) => (
                        <span key={index}>{label}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
