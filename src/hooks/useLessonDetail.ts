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
