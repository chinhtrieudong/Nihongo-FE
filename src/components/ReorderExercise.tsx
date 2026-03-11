import React, { useState, useEffect } from 'react';
import { Exercise } from '../types/lesson';

interface ReorderExerciseProps {
  exercise: Exercise;
  setAnswer: (answer: string) => void;
  onAnswerSelect?: (exerciseId: string, answer: string | string[]) => void;
  answerStatus?: 'correct' | 'incorrect' | null;
  exerciseAnswers: Record<string, string | string[]>;
  exerciseId: string;
}

const ReorderExercise: React.FC<ReorderExerciseProps> = ({
  exercise,
  setAnswer,
  answerStatus,
  exerciseAnswers,
  exerciseId,
}) => {
  // Parse words from options array (for reorder exercises)
  const getWords = () => {
    // For reorder exercises, options should contain individual words
    if (exercise.options && exercise.options.length > 0) {
      return exercise.options;
    }
    return [];
  };

  const [words] = useState<string[]>(getWords());
  const [selectedOrder, setSelectedOrder] = useState<string[]>(() => {
    // Initialize from saved answer if exists
    const savedAnswer = exerciseAnswers[exerciseId] as string || '';
    return savedAnswer ? savedAnswer.split(' ').filter((word: string) => word.trim() !== '') : [];
  });

  const handleWordClick = (word: string) => {
    if (selectedOrder.includes(word)) {
      // Remove from selected order
      setSelectedOrder(selectedOrder.filter(w => w !== word));
    } else {
      // Add to selected order
      setSelectedOrder([...selectedOrder, word]);
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setSelectedOrder(selectedOrder.filter(w => w !== wordToRemove));
  };

  // Update answer whenever selectedOrder changes
  useEffect(() => {
    // Convert array to string for setAnswer compatibility
    const answer = selectedOrder.join(' ');
    setAnswer(answer);
  }, [selectedOrder]); // Remove setAnswer from dependencies

  return (
    <div className="space-y-4">
      <div className="p-4 bg-secondary-50 dark:bg-secondary-925 rounded-lg">
        <h3 className="text-sm font-medium text-secondary-700 dark:text-secondary-800 mb-3">Các từ có thể sắp xếp:</h3>
        <div className="flex flex-wrap gap-2">
          {words.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word)}
              disabled={selectedOrder.includes(word)}
              className={`px-3 py-2 rounded-lg border transition-colors ${selectedOrder.includes(word)
                ? 'bg-secondary-200 dark:bg-secondary-900 text-secondary-400 dark:text-secondary-500 cursor-not-allowed'
                : 'bg-white dark:bg-secondary-925 border-secondary-300 dark:border-secondary-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer'
                }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-secondary-700 dark:text-secondary-800 mb-3">Thứ tự đã chọn:</h3>
        <div className={`min-h-[60px] p-3 rounded-lg border ${answerStatus === 'correct'
          ? 'bg-green-50 border-green-300'
          : answerStatus === 'incorrect'
            ? 'bg-red-50 border-red-300'
            : 'bg-white dark:bg-secondary-925 border-blue-200 dark:border-blue-700'
          }`}>
          {selectedOrder.length === 0 ? (
            <span className="text-secondary-400 dark:text-secondary-500">Nhấp vào các từ bên trên để sắp xếp...</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedOrder.map((word, index) => (
                <div key={index} className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1 ${answerStatus === 'correct'
                  ? 'bg-green-100 border-green-300'
                  : answerStatus === 'incorrect'
                    ? 'bg-red-100 border-red-300'
                    : 'bg-blue-100 border-blue-300'
                  }`}>
                  <span>{word}</span>
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="ml-1 text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReorderExercise;
