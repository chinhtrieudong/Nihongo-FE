import React from "react";
import { Button } from "antd";
import { BookOpen, ArrowRight, BookText } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  lessonCount: number;
  level: string;
  accentColor: "blue" | "pink" | "orange" | "green" | "purple";
  onAction?: () => void;
  actionLabel?: string;
  icon?: React.ReactNode;
}

const accentConfig = {
  blue: {
    light: {
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      border: "border-gray-200",
      borderAccent: "border-t-blue-500",
    },
    dark: {
      iconBg: "bg-blue-500/20",
      iconText: "text-blue-300",
      button: "bg-blue-600 hover:bg-blue-500",
      border: "border-slate-700",
      borderAccent: "border-t-blue-400",
    },
  },
  pink: {
    light: {
      iconBg: "bg-pink-100",
      iconText: "text-pink-600",
      button: "bg-pink-600 hover:bg-pink-700",
      border: "border-gray-200",
      borderAccent: "border-t-pink-500",
    },
    dark: {
      iconBg: "bg-pink-500/20",
      iconText: "text-pink-300",
      button: "bg-pink-600 hover:bg-pink-500",
      border: "border-slate-700",
      borderAccent: "border-t-pink-400",
    },
  },
  orange: {
    light: {
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
      button: "bg-orange-600 hover:bg-orange-700",
      border: "border-gray-200",
      borderAccent: "border-t-orange-500",
    },
    dark: {
      iconBg: "bg-orange-500/20",
      iconText: "text-orange-300",
      button: "bg-orange-600 hover:bg-orange-500",
      border: "border-slate-700",
      borderAccent: "border-t-orange-400",
    },
  },
  green: {
    light: {
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      button: "bg-emerald-600 hover:bg-emerald-700",
      border: "border-gray-200",
      borderAccent: "border-t-emerald-500",
    },
    dark: {
      iconBg: "bg-emerald-500/20",
      iconText: "text-emerald-300",
      button: "bg-emerald-600 hover:bg-emerald-500",
      border: "border-slate-700",
      borderAccent: "border-t-emerald-400",
    },
  },
  purple: {
    light: {
      iconBg: "bg-violet-100",
      iconText: "text-violet-600",
      button: "bg-violet-600 hover:bg-violet-700",
      border: "border-gray-200",
      borderAccent: "border-t-violet-500",
    },
    dark: {
      iconBg: "bg-violet-500/20",
      iconText: "text-violet-300",
      button: "bg-violet-600 hover:bg-violet-500",
      border: "border-slate-700",
      borderAccent: "border-t-violet-400",
    },
  },
};

const levelBadgeConfig: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  N5: { bg: "bg-sky-100", text: "text-sky-700", darkBg: "bg-sky-500/25", darkText: "text-sky-300" },
  N4: { bg: "bg-emerald-100", text: "text-emerald-700", darkBg: "bg-emerald-500/25", darkText: "text-emerald-300" },
  N3: { bg: "bg-amber-100", text: "text-amber-700", darkBg: "bg-amber-500/25", darkText: "text-amber-300" },
  N2: { bg: "bg-rose-100", text: "text-rose-700", darkBg: "bg-rose-500/25", darkText: "text-rose-300" },
  N1: { bg: "bg-violet-100", text: "text-violet-700", darkBg: "bg-violet-500/25", darkText: "text-violet-300" },
};

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  lessonCount,
  level,
  accentColor,
  onAction,
  actionLabel = "Bắt đầu học",
  icon = <BookOpen className="w-5 h-5" />,
}) => {
  const accent = accentConfig[accentColor];
  const levelBadge = levelBadgeConfig[level] || levelBadgeConfig.N5;

  return (
    <div
      className={`
        group relative flex flex-col
        bg-white dark:bg-slate-900
        rounded-2xl
        border ${accent.light.border} dark:${accent.dark.border}
        border-t-4 ${accent.light.borderAccent} dark:${accent.dark.borderAccent}
        overflow-hidden
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50
        cursor-pointer
      `}
      onClick={onAction}
    >
      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Top: Icon + Title + Level Badge */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div
            className={`
              flex-shrink-0 w-12 h-12 rounded-xl
              ${accent.light.iconBg} dark:${accent.dark.iconBg}
              ${accent.light.iconText} dark:${accent.dark.iconText}
              flex items-center justify-center
              transition-transform duration-300 group-hover:scale-105
            `}
          >
            {icon}
          </div>

          {/* Title + Level */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {title}
              </h3>
              <span
                className={`
                  inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold
                  ${levelBadge.bg} ${levelBadge.text}
                  dark:${levelBadge.darkBg} dark:${levelBadge.darkText}
                `}
              >
                {level}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Description */}
        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Bottom: Lesson Count + CTA */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500 dark:text-slate-500 flex items-center gap-1.5">
            <BookText className="w-4 h-4" />
            {lessonCount} bài học
          </span>

          <Button
            type="primary"
            size="small"
            className={`
              rounded-lg px-4 py-1 h-auto
              ${accent.light.button} dark:${accent.dark.button}
              border-0 shadow-sm
              transition-all duration-200
              hover:scale-105 hover:shadow-md hover:brightness-110
              active:scale-95
            `}
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
          >
            <span className="flex items-center gap-1.5">
              {actionLabel}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
