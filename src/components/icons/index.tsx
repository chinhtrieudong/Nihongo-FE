import {
    Pencil,
    TreePine,
    Infinity,
    PenTool,
    Layers,
    FileText,
    Type,
    type LucideIcon
} from "lucide-react";

// Re-export Lucide icons with custom names for backward compatibility
export const KanjidrawIcon = Pencil;
export const KanjitreeIcon = TreePine;
export const InfinitejapaneseIcon = Infinity;
export const WriteJapaneseIcon = PenTool;
export const FlashcardsIcon = Layers;
export const KanjiPageIcon = FileText;
export const LetterUppercaseSquareFIcon = Type;

// Export types for backward compatibility
export type IconProps = {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
};

// Wrapper component for custom icon props
export const createIconComponent = (Icon: LucideIcon) => {
    const IconComponent: React.FC<IconProps> = ({
        size = 24,
        color = "currentColor",
        strokeWidth = 2,
        className,
    }) => (
        <Icon
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            className={className}
        />
    );
    return IconComponent;
};