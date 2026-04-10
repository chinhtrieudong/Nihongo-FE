import React from 'react';
import { Button, Select } from 'antd';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface LessonNavigationProps {
  currentLesson: number;
  totalLessons: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectLesson?: (lesson: number) => void;
  showSelect?: boolean;
  showCounter?: boolean;
  disabled?: boolean;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  currentLesson,
  totalLessons,
  onPrev,
  onNext,
  onSelectLesson,
  showSelect = true,
  showCounter = false,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onPrev}
        disabled={disabled || currentLesson <= 1}
      >
        <ArrowLeft className="w-4 h-4" /> Bài tr&#432;&#7899;c
      </Button>
      
      {showSelect && onSelectLesson && (
        <Select
          value={currentLesson}
          onChange={onSelectLesson}
          style={{ width: 50, textAlign: 'center', height: 32, fontSize: 15 }}
          suffixIcon={null}
          options={Array.from({ length: totalLessons }, (_, i) => ({
            value: i + 1,
            label: `${i + 1}`,
          }))}
        />
      )}
      
      {showCounter && (
        <span className="text-sm text-text-sub px-2">
          {currentLesson} / {totalLessons}
        </span>
      )}
      
      <Button
        onClick={onNext}
        disabled={disabled || currentLesson >= totalLessons}
      >
        Bài ti&#7871;p <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default LessonNavigation;
