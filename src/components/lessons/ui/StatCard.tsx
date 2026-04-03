import React from "react";

interface StatCardProps {
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    value,
    label,
    icon,
    color = "text-secondary-900 dark:text-secondary-100",
    className = "",
}) => {
    return (
        <div className={`text-center ${className}`}>
            <div className={`text-2xl font-bold ${color}`}>
                {value}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-400">
                {label}
            </div>
        </div>
    );
};

export default StatCard;
