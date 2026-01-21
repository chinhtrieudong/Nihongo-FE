import React, { useState, useEffect, useCallback } from 'react';
import { Exercise } from '../types/lesson';

interface ReorderExerciseProps {
  exercise: Exercise;
  setAnswer: (answer: string) => void;
  onAnswerSelect?: (exerciseId: string, answer: string | string[]) => void;
  answerStatus?: 'correct' | 'incorrect' | null;
  exerciseAnswers: Record<string, string | string[]>;
  exerciseId: string;
}

const ReorderExercise: React.FC<ReorderExerciseProps> = ({ exercise, setAnswer, onAnswerSelect, answerStatus, exerciseAnswers, exerciseId }) => {
  // Parse words from options array (for reorder exercises)
  const getWords = () => {
    // For reorder exercises, options should contain individual words
    if (exercise.options && exercise.options.length > 0) {
      return exercise.options;
    }
    return [];
  };

  const [words, setWords] = useState<string[]>(getWords());
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

  const handleSubmit = () => {
    // Convert array to string for setAnswer compatibility
    const answer = selectedOrder.join(' ');
    setAnswer(answer);

    // Check answer when confirming - pass array for proper checking
    if (onAnswerSelect && exercise.id) {
      onAnswerSelect(exercise.id, selectedOrder);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Các từ có thể sắp xếp:</h3>
        <div className="flex flex-wrap gap-2">
          {words.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(word)}
              disabled={selectedOrder.includes(word)}
              className={`px-3 py-2 rounded-lg border transition-colors ${selectedOrder.includes(word)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Thứ tự đã chọn:</h3>
        <div className={`min-h-[60px] p-3 rounded-lg border ${answerStatus === 'correct'
          ? 'bg-green-50 border-green-300'
          : answerStatus === 'incorrect'
            ? 'bg-red-50 border-red-300'
            : 'bg-white border-blue-200'
          }`}>
          {selectedOrder.length === 0 ? (
            <span className="text-gray-400">Nhấp vào các từ bên trên để sắp xếp...</span>
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
