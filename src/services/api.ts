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

// Centralized API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },

  // Users
  USERS: {
    PROFILE: "/users/profile",
    STATS: {
      DASHBOARD: "/users/stats/dashboard",
      STREAK: "/users/stats/streak",
      WEEKLY: "/users/stats/weekly",
      STUDY_TIME: "/users/stats/study-time",
      AVERAGE_SCORE: "/users/stats/average-score",
    },
  },

  // Lessons
  LESSONS: {
    LIST: "/lessons",
    DETAIL: (id: string) => `/lessons/${id}`,
    BY_NUMBER: (number: number) => `/lessons/number/${number}`,
    PROGRESS: (lessonNumber: number) => `/lesson/${lessonNumber}/progress`,
    UPDATE_PROGRESS: (lessonId: string) => `/lessons/${lessonId}/progress`,
    COMPLETE: (lessonId: string) => `/lessons/${lessonId}/complete`,
    EXERCISES: {
      SUBMIT: (lessonId: string, exerciseId: string) => `/lessons/${lessonId}/exercises/${exerciseId}/submit`,
      SUBMIT_MULTIPLE: (lessonId: string) => `/lessons/${lessonId}/exercises/submit`,
    },
    RELATED: (lessonId: string) => `/lessons/${lessonId}/related`,
    SEARCH: "/lessons/search",
    KANJI: (lessonId: string) => `/lessons/${lessonId}/kanji`,
    AI_ROLEPLAY: (lessonId: string) => `/lessons/${lessonId}/ai/roleplay`,
    WEAK_POINTS: (lessonId: string) => `/lessons/${lessonId}/weak-points`,
  },

  // Vocabulary
  VOCABULARY: "/vocabulary",

  // Kanji
  KANJI: {
    CHARACTER: (kanji: string) => `/kanji/character/${encodeURIComponent(kanji)}`,
    LIST: "/kanji",
    BY_LEVEL: (level: string) => `/kanji/${level.toLowerCase()}`,
    RADICALS: {
      LIST: "/kanji/radicals",
      DETAIL: (symbol: string) => `/kanji/radicals/${encodeURIComponent(symbol)}`,
      KANJI_BY_RADICAL: (symbol: string) => `/kanji/radicals/${encodeURIComponent(symbol)}/kanji`,
    },
  },

  // AI
  AI: {
    CHAT: "/ai/chat",
    PRONUNCIATION: "/ai/pronunciation",
  },

  // Conversation
  CONVERSATION: {
    LESSONS: "/lessons",
    EXERCISES: (id: string) => `/lessons/${id}/exercises`,
    SUBMIT: (id: string) => `/lessons/${id}/submit`,
    SCENARIOS: "/scenarios",
    DIALOGS: "/dialogs",
    AI: {
      START: "/ai/start",
      CHAT: "/ai/chat",
      END: (conversationId: string) => `/ai/end/${conversationId}`,
    },
    VOICE: {
      START: "/voice/start",
      UPLOAD: "/voice/upload",
    },
    STATS: "/stats",
    HISTORY: "/conversations",
    AUDIO: {
      TEXT_TO_SPEECH: "/audio/text-to-speech",
      DIALOG_LINE: (dialogId: string, lineId: string) => `/audio/dialog/${dialogId}/${lineId}`,
    },
  },

  // Progress
  PROGRESS: "/progress",

  // Health Check
  HEALTH: "/health",
} as const;

// Minna JSON API endpoints (separate service)
export const MINNA_ENDPOINTS = {
  LESSON: {
    VOCABULARY: (lessonNumber: number) => `/lesson/${lessonNumber}/vocabulary`,
    GRAMMAR: (lessonNumber: number) => `/lesson/${lessonNumber}/grammar`,
    DIALOG: (lessonNumber: number) => `/lesson/${lessonNumber}/dialog`,
    BUNKEI: (lessonNumber: number) => `/lesson/${lessonNumber}/bunkei`,
    RENSHOU: (lessonNumber: number) => `/lesson/${lessonNumber}/renshou`,
    REIBUN: (lessonNumber: number) => `/lesson/${lessonNumber}/reibun`,
    AI_CHAT: (lessonNumber: number) => `/lesson/${lessonNumber}/ai/chat`,
  },
};

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

// Add minna-json API after the main api
const MINNA_JSON_API_BASE_URL = "http://localhost:5000/api/v1";

// Create separate axios instance for minna-json endpoints
const minnaJsonApi = axios.create({
  baseURL: MINNA_JSON_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for minna-json API
minnaJsonApi.interceptors.request.use(
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
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return response.data;
  },

  getCurrentUser: async () => {
    // Try to get user info from a simple endpoint that doesn't require authentication
    // This is a temporary solution for development
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
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
    const response = await api.get(API_ENDPOINTS.USERS.PROFILE);
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put(API_ENDPOINTS.USERS.PROFILE, data);
    return response.data;
  },
};

// Vocabulary API functions
export const vocabularyAPI = {
  getVocabulary: async (level?: string) => {
    const params = level ? { level } : {};
    const response = await api.get(API_ENDPOINTS.VOCABULARY, { params });
    return response.data;
  },

  getVocabularyByLesson: async (lessonNumber: number): Promise<any> => {
    const response = await minnaJsonApi.get(MINNA_ENDPOINTS.LESSON.VOCABULARY(lessonNumber));
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

  getLessonByNumber: async (lessonNumber: number): Promise<any> => {
    const response = await api.get(`/lessons/number/${lessonNumber}`);
    return response.data;
  },

  getLessonProgress: async (lessonNumber: number, userId?: string) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get(`/lesson/${lessonNumber}/progress`, { params });
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
    const response = await api.get(`/kanji/character/${encodeURIComponent(kanji)}`);
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
    sortBy?: string;
    order?: "asc" | "desc";
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters.lesson && filters.lesson !== "all")
      params.append("lesson", filters.lesson);
    if (filters.radical && filters.radical !== "all")
      params.append("radical", filters.radical);
    if (filters.strokeCount && filters.strokeCount !== "all")
      params.append("strokeCount", filters.strokeCount);
    if (filters.search) params.append("search", filters.search);
    params.append("sortBy", filters.sortBy || "level");
    params.append("order", filters.order || "asc");
    if (typeof filters.page === "number" && filters.page > 0) {
      params.append("page", String(filters.page));
    }
    if (typeof filters.limit === "number" && filters.limit > 0) {
      params.append("limit", String(filters.limit));
    }

    // Use level path only when a specific level is selected; otherwise fetch all levels from /kanji
    const hasLevel = Boolean(filters.level && filters.level !== "all");
    const levelPath = hasLevel ? `/${String(filters.level).toLowerCase()}` : "";
    const queryString = params.toString();
    const response = await api.get(
      queryString ? `/kanji${levelPath}?${queryString}` : `/kanji${levelPath}`,
    );
    return response.data;
  },

  getKanjiByRadical: async (
    radicalSymbol: string,
    page = 1,
    limit = 20,
  ) => {
    const encoded = encodeURIComponent(radicalSymbol);
    const response = await api.get(
      `/kanji/radicals/${encoded}/kanji?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getRadicals: async (page = 1, limit = 214) => {
    const response = await api.get(`/kanji/radicals?page=${page}&limit=${limit}`);
    return response.data;
  },

  getRadicalDetail: async (symbol: string) => {
    const encoded = encodeURIComponent(symbol);
    const response = await api.get(`/kanji/radicals/${encoded}`);
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
  chat: async (data: {
    lessonId: string;
    messages: Array<{ role: string; content: string; timestamp: string }>;
    context: {
      currentLesson: string;
      learnedVocabulary: string[];
      learnedGrammar: string[];
      difficulty: "easy" | "medium" | "hard";
    };
  }) => {
    // Use Minna AI chat endpoint for lesson-specific chat
    // Extract the latest user message and lesson number from the data
    const latestUserMessage = data.messages.filter(msg => msg.role === 'user').pop();
    if (!latestUserMessage) throw new Error('No user message found');

    // Try to extract lesson number from lessonId (assuming it's in format like "lesson-1" or just the number)
    const lessonNumber = data.lessonId.replace('lesson-', '') || '1';

    const requestBody = {
      message: latestUserMessage.content,
      context: data.context
    };

    const response = await api.post(`/lesson/${lessonNumber}/ai/chat`, requestBody);
    
    // Transform the response to match the expected ChatMessage format
    const apiResponse = response.data;
    if (apiResponse.success && apiResponse.data) {
      return {
        success: true,
        data: {
          message: {
            role: 'assistant',
            content: apiResponse.data.response,
            timestamp: apiResponse.data.timestamp || new Date().toISOString()
          }
        }
      };
    }
    
    return apiResponse;
  },

  pronunciation: async (audioData: any) => {
    const aiBaseUrl = process.env.REACT_APP_AI_API_URL || "http://localhost:5000/api/v1";
    const response = await api.post(`${aiBaseUrl}/ai/pronunciation`, audioData);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    return response.data;
  },
};

export default api;
export { minnaJsonApi };
