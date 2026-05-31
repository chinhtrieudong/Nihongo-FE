import { useState, useCallback } from 'react';
import type { VocabularyItem } from '../types/vocabulary';

export const useQuizManager = (vocabularyItems: VocabularyItem[], onAnswer?: (wordId: string, isCorrect: boolean) => void) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<VocabularyItem[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizMode, setQuizMode] = useState<'jp-to-vi' | 'vi-to-jp'>('jp-to-vi');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  const startQuiz = useCallback((mode: 'jp-to-vi' | 'vi-to-jp') => {
    setQuizMode(mode);
    setQuizQuestions([...vocabularyItems].sort(() => Math.random() - 0.5));
    setQuizQuestionIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setShowAnswerResult(false);
    setIsAnswerCorrect(false);
    setShowQuiz(true);
  }, [vocabularyItems]);

  const currentQuizQuestion = quizQuestions[quizQuestionIndex];
  const quizProgress = quizQuestions.length > 0 ? ((quizQuestionIndex + 1) / quizQuestions.length) * 100 : 0;

  const handleQuizAnswer = useCallback((answer: string, isCorrect: boolean) => {
    setSelectedAnswer(answer);
    setIsAnswerCorrect(isCorrect);
    setShowAnswerResult(true);
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    
    // Trigger external callback (e.g. for SRS)
    if (onAnswer && currentQuizQuestion) {
      onAnswer(currentQuizQuestion.id, isCorrect);
    }
  }, [currentQuizQuestion, onAnswer]);

  const nextQuizQuestion = useCallback(() => {
    if (quizQuestionIndex < quizQuestions.length - 1) {
      setQuizQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswerResult(false);
      setIsAnswerCorrect(false);
    } else {
      setShowQuiz(false);
    }
  }, [quizQuestionIndex, quizQuestions.length]);

  const endQuiz = useCallback(() => {
    setShowQuiz(false);
  }, []);

  return {
    showQuiz,
    quizQuestionIndex,
    quizQuestions,
    quizScore,
    quizMode,
    selectedAnswer,
    showAnswerResult,
    isAnswerCorrect,
    startQuiz,
    handleQuizAnswer,
    nextQuizQuestion,
    endQuiz,
    currentQuizQuestion,
    quizProgress,
  };
};
