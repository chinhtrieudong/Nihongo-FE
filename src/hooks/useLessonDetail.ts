import { useState, useEffect } from 'react';
import { lessonAPI } from '../services/api';

interface LessonMetadata {
  lessonNumber: number;
  title: string;
  title_jp: string;
  title_vi: string;
  description_jp: string;
  description_vi: string;
  level: string;
  book: string;
  estimated_time: string;
  difficulty: string;
  tags: string[];
  prerequisites: any[];
  next_lesson: number;
  components_available: {
    vocabulary: boolean;
    grammar: boolean;
    kaiwa: boolean;
    mondai: boolean;
    bunkei: boolean;
    reibun: boolean;
  };
  stats: {
    vocabulary_count: number;
    grammar_count: number;
    kaiwa_count: number;
    mondai_count: number;
    bunkei_count: number;
    reibun_count: number;
    total_items: number;
  };
  created_at: string;
  updated_at: string;
}

interface LessonProgress {
  lessonNumber: number;
  user_id: string;
  progress: {
    vocabulary: {
      completed: boolean;
      learned_count: number;
      total_count: number;
      last_studied: string | null;
    };
    grammar: {
      completed: boolean;
      learned_count: number;
      total_count: number;
      last_studied: string | null;
    };
    kaiwa: {
      completed: boolean;
      learned_count: number;
      total_count: number;
      last_studied: string | null;
    };
    mondai: {
      completed: boolean;
      learned_count: number;
      total_count: number;
      last_studied: string | null;
    };
    bunkei: {
      completed: boolean;
      learned_count: number;
      total_count: number;
      last_studied: string | null;
    };
    reibun: {
      completed: boolean;
      learned_count: number;
      total_count: number;
      last_studied: string | null;
    };
  };
  overall_progress: {
    percentage: number;
    completed_components: number;
    total_components: number;
    status: string;
  };
  last_accessed: string;
}

// Hook now only provides empty functionality since all lesson detail endpoints were removed
export const useLessonDetail = (lessonNumber: number) => {
  return {
    // Data - all null since no endpoints to load from
    metadata: null,
    progress: null,
    summary: null,

    // State
    loading: false,
    error: null,

    // Actions - all no-op functions since endpoints were removed
    updateMetadata: async () => {
      console.warn('Lesson detail endpoints have been removed - updateMetadata is no longer available');
      throw new Error('Lesson detail endpoints have been removed');
    },

    updateProgress: async () => {
      console.warn('Lesson detail endpoints have been removed - updateProgress is no longer available');
      throw new Error('Lesson detail endpoints have been removed');
    },

    // Utility functions - return default values
    isCompleted: () => false,
    getProgressPercentage: () => 0,
    getOverallProgress: () => 0,
  };
};
