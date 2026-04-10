/**
 * Shared types for JLPT Tests feature
 */

export interface TestSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  questions: number;
  duration: number;
  description: string;
  questionTypes: string[];
}

export interface Test {
  id: string;
  level: string;
  title: string;
  title_vi?: string;
  description: string;
  description_vi?: string;
  duration: number;
  questions: number;
  difficulty: string;
  completed: boolean;
  score?: number;
  date?: string;
  sections: TestSection[];
  passing_score?: number;
  is_active?: boolean;
  version?: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  startTime: Date;
  endTime?: Date;
  answers: Record<string, string | number>;
  score?: number;
  completed: boolean;
}

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type DifficultyLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | 'Expert';

export const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const LEVEL_COLORS: Record<JLPTLevel | string, string> = {
  N5: 'var(--success)',
  N4: 'var(--info)',
  N3: 'var(--warning)',
  N2: 'var(--error)',
  N1: 'var(--primary)',
  default: 'default',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel | string, string> = {
  Beginner: 'green',
  Elementary: 'blue',
  Intermediate: 'orange',
  Advanced: 'red',
  Expert: 'purple',
  default: 'default',
};

export const getLevelColor = (level: string): string => LEVEL_COLORS[level] || LEVEL_COLORS.default;

export const getDifficultyColor = (difficulty: string): string => 
  DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.default;

export const getLevelFromDifficulty = (level: string): DifficultyLevel => {
  const mapping: Record<string, DifficultyLevel> = {
    N5: 'Beginner',
    N4: 'Elementary',
    N3: 'Intermediate',
    N2: 'Advanced',
    N1: 'Expert',
  };
  return mapping[level] || 'Beginner';
};
