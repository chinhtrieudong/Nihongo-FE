import api from "./api";

// Interfaces matching API documentation
export interface Exercise {
  _id: string;
  japanese: string;
  romaji: string;
  vietnamese: string;
  difficulty: "easy" | "medium" | "hard";
  category: "greetings" | "numbers" | "daily" | "business";
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  isActive: boolean;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Practice {
  practiceId: string;
  exercise: Exercise;
  score: number;
  feedback: string;
  detailedAnalysis: {
    pronunciationAccuracy: number;
    fluency: number;
    intonation: number;
    overallScore: number;
    improvements: string[];
  };
  audioUrl: string;
  createdAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Category {
  value: string;
  label: string;
  description: string;
  exerciseCount: number;
}

export interface Stats {
  totalPractices: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  levelProgress: {
    [key: string]: {
      completed: number;
      total: number;
      averageScore: number;
    };
  };
  categoryStats: Array<{
    category: string;
    practices: number;
    averageScore: number;
  }>;
  recentActivity: Array<{
    date: string;
    practices: number;
    averageScore: number;
  }>;
  achievements: Array<{
    id: string;
    unlockedAt: string;
  }>;
}

// API Functions
export const pronunciationAPI = {
  // Get exercises with filters
  getExercises: async (
    level?: string,
    category?: string,
    difficulty?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    exercises: Exercise[];
    pagination: Pagination;
  }> => {
    const params = new URLSearchParams();
    if (level && level !== "all") params.append("level", level);
    if (category && category !== "all") params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/pronunciation/exercises?${params}`);
    return response.data.data;
  },

  // Get exercise detail
  getExerciseDetail: async (exerciseId: string): Promise<Exercise> => {
    const response = await api.get(`/pronunciation/exercises/${exerciseId}`);
    return response.data.data;
  },

  // Get exercise audio
  getExerciseAudio: async (
    exerciseId: string,
  ): Promise<{
    message: string;
    audioUrl: string;
  }> => {
    const response = await api.get(
      `/pronunciation/exercises/${exerciseId}/audio`,
    );
    return response.data.data;
  },

  // Submit practice
  submitPractice: async (
    exerciseId: string,
    audioData: string | Blob,
    duration: number,
  ): Promise<{
    score: number;
    feedback: string;
    detailedFeedback: {
      pronunciation: number;
      fluency: number;
      rhythm: number;
      intonation: number;
      overallScore: number;
      improvements: string[];
    };
    audioUrl: string;
    createdAt: string;
  }> => {
    // Convert base64 to Blob if needed
    let audioBlob: Blob;
    if (typeof audioData === "string") {
      // Convert base64 to Blob
      const base64Data = audioData.split(",")[1]; // Remove data:audio/wav;base64, prefix if present
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      audioBlob = new Blob([byteArray], { type: "audio/wav" });
    } else {
      audioBlob = audioData;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("exerciseId", exerciseId);
    formData.append("audioData", audioBlob, "recording.wav");
    formData.append("duration", duration.toString());

    const response = await api.post("/pronunciation/practice", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Get practice history
  getHistory: async (
    page: number = 1,
    limit: number = 20,
    level?: string,
    category?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    practices: Practice[];
    pagination: Pagination;
    statistics: {
      totalPractices: number;
      averageScore: number;
      bestScore: number;
      improvementRate: number;
    };
  }> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (level && level !== "all") params.append("level", level);
    if (category && category !== "all") params.append("category", category);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/pronunciation/history?${params}`);
    return response.data.data;
  },

  // Get user stats
  getStats: async (period: string = "all"): Promise<Stats> => {
    const response = await api.get(`/pronunciation/stats?period=${period}`);
    return response.data.data;
  },

  // Analyze pronunciation (new endpoint from documentation)
  analyzePronunciation: async (
    exerciseId: string,
    expectedText: string,
  ): Promise<{
    score: number;
    feedback: string;
    detailedAnalysis: {
      pronunciationAccuracy: number;
      fluency: number;
      intonation: number;
      rhythm: number;
    };
    transcription: {
      recognizedText: string;
      confidence: number;
    };
    audioUrl: string | null;
  }> => {
    const response = await api.post("/pronunciation/analyze", {
      exerciseId,
      expectedText,
    });
    return response.data.data;
  },

  // Get categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/pronunciation/categories");
    return response.data.data;
  },

  // Delete practice record
  deletePractice: async (practiceId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/pronunciation/practice/${practiceId}`);
    return response.data;
  },

  // Speech-to-text using OpenAI Whisper API (fallback for Web Speech API)
  speechToText: async (
    audioData: string,
    language: string = "ja",
  ): Promise<{
    text: string;
    language: string;
  }> => {
    const response = await api.post("/pronunciation/speech-to-text", {
      audioData,
      language,
    });
    return response.data.data;
  },
};
