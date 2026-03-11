import React from 'react';
import type { Lesson } from '../types/lesson';

interface LessonRangeProps {
  lessons: Lesson[];
  currentLessonId?: string;
  onLessonClick: (lesson: Lesson) => void;
}

const LessonRange: React.FC<LessonRangeProps> = ({
  lessons,
  currentLessonId,
  onLessonClick,
}) => {
  return (
    <div className="w-full bg-white dark:bg-secondary-925 p-4">
      <div className="grid grid-cols-4 gap-x-4 gap-y-4 justify-items-stretch w-full">
        {Array.from({ length: 50 }, (_, i) => {
          const lessonNumber = i + 1;
          const realLesson = lessons.find((item) => item.lessonNumber === lessonNumber);
          const lesson = realLesson || {
            id: `fake-${lessonNumber}`,
            lessonNumber,
            title: `Bài ${lessonNumber}`,
            description: "",
            status: "not_started",
            progress: 0,
          };
          const isFake = !realLesson;
          const isCurrentLesson =
            lesson.lessonNumber.toString() === currentLessonId ||
            lesson.id === currentLessonId;
          const isCompleted = lesson.status === 'completed';
          const isInProgress = lesson.status === 'in_progress';
          const isLocked = lesson.status === 'not_started';

          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => {
                if (!isFake) {
                  onLessonClick(lesson);
                }
              }}
              disabled={isFake}
              className={`
                w-full aspect-square rounded-md text-sm font-semibold
                transition-all duration-200
                hover:-translate-y-0.5 hover:shadow-md
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                ${isCurrentLesson
                  ? 'text-white shadow-md ring-2 focus-visible:ring-[#7CC9D3]'
                  : 'text-white'
                }
                ${isCompleted ? 'opacity-95' : ''}
                ${isInProgress ? 'ring-1 focus-visible:ring-[#7CC9D3]' : ''}
                ${isLocked ? 'opacity-80' : ''}
                ${isFake ? 'cursor-default hover:shadow-none hover:-translate-y-0' : ''}
              `}
              style={{
                backgroundColor: isCurrentLesson
                  ? "#0A4F59"
                  : isCompleted
                    ? "#1A7F8D"
                    : isLocked
                      ? "#5E9AA2"
                      : "#0F6D7A",
                ...(isCurrentLesson ? { borderColor: "#7CC9D3", boxShadow: "0 0 0 2px #7CC9D3" } : {}),
                ...(isInProgress ? { borderColor: "#7CC9D3" } : {}),
              }}
              aria-pressed={isCurrentLesson}
              aria-disabled={isFake}
            >
              {lesson.lessonNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LessonRange;
