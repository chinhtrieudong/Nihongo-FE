import React from 'react';
import SentenceReorder from '../conversation/SentenceReorder';

interface ReorderExerciseProps {
  exercise: any;
  setAnswer: (answer: string | string[]) => void;
  onAnswerSelect: (exerciseId: string, answer: string | string[]) => void;
  answerStatus?: "correct" | "incorrect" | null;
  exerciseAnswers: Record<string, string | string[]>;
  exerciseId: string;
}

const ReorderExercise: React.FC<ReorderExerciseProps> = ({
  exercise,
  setAnswer,
  onAnswerSelect,
  answerStatus,
  exerciseAnswers,
  exerciseId,
}) => {
  // Transform exercise data to match SentenceReorder expected format
  const reorderExercises = [{
    id: exerciseId,
    scrambled: exercise.content?.scrambled || exercise.options || [],
    correct: exercise.correctAnswer || exercise.content?.correct || '',
    meaning_vi: exercise.question || exercise.content?.meaning_vi || '',
  }];

  const handleSubmit = (answers: string[]) => {
    const answer = answers[0] || '';
    setAnswer(answer);
    onAnswerSelect(exerciseId, answer);
  };

  const handleProgress = (current: number, total: number) => {
    // Progress tracking if needed
  };

  return (
    <SentenceReorder
      sentences={reorderExercises.map(e => e.scrambled).flat()}
      onComplete={(isCorrect) => {
        if (isCorrect) {
          handleSubmit(reorderExercises.map(e => e.correct));
        }
      }}
    />
  );
};

export default ReorderExercise;