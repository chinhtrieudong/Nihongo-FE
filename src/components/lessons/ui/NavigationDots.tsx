import React from "react";

interface NavigationDotsProps {
    total: number;
    current: number;
    onSelect: (index: number) => void;
    className?: string;
}

const NavigationDots: React.FC<NavigationDotsProps> = ({
    total,
    current,
    onSelect,
    className = "",
}) => {
    return (
        <div className={`flex justify-center gap-2 ${className}`}>
            {Array.from({ length: total }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === current
                            ? 'w-8 bg-primary-600'
                            : 'bg-gray-300 dark:bg-secondary-600 hover:bg-gray-400'
                        }`}
                />
            ))}
        </div>
    );
};

export default NavigationDots;
