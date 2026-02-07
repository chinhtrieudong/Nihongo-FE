import axios from "axios";
import {
  LessonsResponse,
  LessonDetailResponse,
  ExerciseSubmitResponse,
  AIRoleplayResponse,
  WeakPointsResponse,
  AIPrompts,
} from "../types/lesson";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data.tokens;
          localStorage.setItem("accessToken", accessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

// Auth API functions
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    // Try to get user info from a simple endpoint that doesn't require authentication
    // This is a temporary solution for development
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      // If /auth/me doesn't exist, create a mock user from token
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        return {
          success: true,
          data: {
            id: decoded.id || decoded.sub || "temp-user",
            username: decoded.username || decoded.name || "User",
            email: decoded.email || "user@example.com",
            role: decoded.role || "student",
          },
        };
      }
      throw error;
    }
  },
};

// User API functions
export const userAPI = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },
};

// Vocabulary API functions
export const vocabularyAPI = {
  getVocabulary: async (level?: string) => {
    const params = level ? { level } : {};
    const response = await api.get("/vocabulary", { params });
    return response.data;
  },
};

// Lesson API functions
export const lessonAPI = {
  getLessons: async (
    level?: string,
    limit?: number,
    offset?: number,
  ): Promise<LessonsResponse> => {
    const params: any = {};
    if (level) params.level = level;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;

    const response = await api.get("/lessons", { params });
    return response.data;
  },

  getLessonDetail: async (id: string): Promise<any> => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  updateProgress: async (
    lessonId: string,
    data: {
      status: "not_started" | "in_progress" | "completed" | "review";
      progress: number;
      vocabularyCompleted?: boolean;
      grammarCompleted?: boolean;
      dialogCompleted?: boolean;
      exercisesScore?: number;
      aiPracticeCount?: number;
    },
  ) => {
    const response = await api.put(`/lessons/${lessonId}/progress`, data);
    return response.data;
  },

  completeLesson: async (lessonId: string) => {
    const response = await api.post(`/lessons/${lessonId}/complete`);
    return response.data;
  },

  submitExercise: async (
    lessonId: string,
    exerciseId: string,
    answer: string,
  ): Promise<ExerciseSubmitResponse> => {
    const response = await api.post(
      `/lessons/${lessonId}/exercises/${exerciseId}/submit`,
      {
        answer,
      },
    );
    return response.data;
  },

  submitExercises: async (
    lessonId: string,
    answers: Array<{ exerciseId: string; answer: string | string[] }>,
  ): Promise<any> => {
    const response = await api.post(`/lessons/${lessonId}/exercises/submit`, {
      answers,
    });
    return response.data;
  },

  getRelatedLessons: async (lessonId: string) => {
    const response = await api.get(`/lessons/${lessonId}/related`);
    return response.data;
  },

  searchLessons: async (query: string) => {
    const response = await api.get(
      `/lessons/search?q=${encodeURIComponent(query)}`,
    );
    return response.data;
  },

  // AI Practice endpoints
  aiRoleplay: async (
    lessonId: string,
    data: {
      message: string;
      context: {
        currentLesson: string;
        difficulty: "easy" | "medium" | "hard";
      };
    },
  ): Promise<AIRoleplayResponse> => {
    const response = await api.post(`/lessons/${lessonId}/ai/roleplay`, data);
    return response.data;
  },

  getWeakPoints: async (lessonId: string): Promise<WeakPointsResponse> => {
    const response = await api.get(`/lessons/${lessonId}/weak-points`);
    return response.data;
  },

  // Kanji endpoints
  getKanji: async (kanji: string) => {
    const response = await api.get(`/kanji/${kanji}`);
    return response.data;
  },

  getLessonKanji: async (lessonId: string) => {
    const response = await api.get(`/lessons/${lessonId}/kanji`);
    return response.data;
  },

  getAllKanji: async (filters: {
    lesson?: string;
    level?: string;
    radical?: string;
    strokeCount?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.lesson && filters.lesson !== "all")
      params.append("lesson", filters.lesson);
    if (filters.radical && filters.radical !== "all")
      params.append("radical", filters.radical);
    if (filters.strokeCount && filters.strokeCount !== "all")
      params.append("strokeCount", filters.strokeCount);
    if (filters.search) params.append("search", filters.search);

    // Use the level in the path (e.g., /kanji/n5) and include other filters as query params
    const levelPath = filters.level ? `/${filters.level.toLowerCase()}` : "/n5";
    const response = await api.get(`/kanji${levelPath}?${params.toString()}`);
    return response.data;
  },
};

// Progress API functions
export const progressAPI = {
  getProgress: async () => {
    const response = await api.get("/progress");
    return response.data;
  },

  updateProgress: async (data: any) => {
    const response = await api.post("/progress", data);
    return response.data;
  },
};

// User Statistics API functions
export const userStatsAPI = {
  // Get user dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get(`/users/stats/dashboard`);
    return response.data;
  },

  // Get learning streak
  getLearningStreak: async () => {
    const response = await api.get(`/users/stats/streak`);
    return response.data;
  },

  // Get weekly statistics
  getWeeklyStats: async () => {
    const response = await api.get(`/users/stats/weekly`);
    return response.data;
  },

  // Get total study time
  getTotalStudyTime: async () => {
    const response = await api.get(`/users/stats/study-time`);
    return response.data;
  },

  // Get average score
  getAverageScore: async () => {
    const response = await api.get(`/users/stats/average-score`);
    return response.data;
  },

  // Update dashboard statistics
  updateDashboardStats: async (data: {
    learningStreak?: number;
    totalStudyTime?: number;
  }) => {
    const response = await api.put(`/users/stats/dashboard`, data);
    return response.data;
  },
};

// AI API functions
export const aiAPI = {
  chat: async (message: string) => {
    const response = await api.post("/ai/chat", { message });
    return response.data;
  },

  pronunciation: async (audioData: any) => {
    const response = await api.post("/ai/pronunciation", audioData);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;
