import axios from "axios";
import {
  LessonsResponse,
  ExerciseSubmitResponse,
  AIRoleplayResponse,
  WeakPointsResponse,
} from "../types/lesson";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

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
    COMPLETE: (lessonId: string) => `/lessons/${lessonId}/complete`,
    RELATED: (lessonId: string) => `/lessons/${lessonId}/related`,
    SEARCH: "/lessons/search",
    KANJI: (lessonId: string) => `/lessons/${lessonId}/kanji`,
    AI_ROLEPLAY: (lessonId: string) => `/lessons/${lessonId}/ai/roleplay`,
    WEAK_POINTS: (lessonId: string) => `/lessons/${lessonId}/weak-points`,
  },

  // Kanji
  KANJI: {
    CHARACTER: (kanji: string) =>
      `/kanji/character/${encodeURIComponent(kanji)}`,
    LIST: "/kanji",
    BY_LEVEL: (level: string) => `/kanji/${level.toLowerCase()}`,
    RADICALS: {
      LIST: "/kanji/radicals",
      DETAIL: (symbol: string) =>
        `/kanji/radicals/${encodeURIComponent(symbol)}`,
      KANJI_BY_RADICAL: (symbol: string) =>
        `/kanji/radicals/${encodeURIComponent(symbol)}/kanji`,
    },
  },

  // AI
  AI: {
    CHAT: "/ai/chat",
    PRONUNCIATION: "/ai/pronunciation",
  },

  // Progress
  PROGRESS: "/progress",

  // Health Check
  HEALTH: "/health",

  // Test Attempts
  TEST_ATTEMPTS: {
    BASE: "/test-attempts",
    STATS: "/test-attempts/stats/summary",
    BY_ID: (id: string) => `/test-attempts/${id}`,
  },
} as const;


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
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
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

// Lesson API functions
export const lessonAPI = {
  getLessons: async (
    level?: string,
    limit?: number,
    offset?: number,
    textbook?: string,
  ): Promise<LessonsResponse> => {
    const params: any = {};
    if (level) params.level = level;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    if (textbook) params.textbook = textbook;

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

  completeLesson: async (lessonId: string) => {
    const response = await api.post(`/lessons/${lessonId}/complete`);
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
    const response = await api.get(
      `/kanji/character/${encodeURIComponent(kanji)}`,
    );
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

  getKanjiByRadical: async (radicalSymbol: string, page = 1, limit = 20) => {
    const encoded = encodeURIComponent(radicalSymbol);
    const response = await api.get(
      `/kanji/radicals/${encoded}/kanji?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getRadicals: async (_page = 1, _limit = 214) => {
    const response = await api.get(`/kanji/radicals/all`);
    return response.data;
  },

  getRadicalDetail: async (symbol: string) => {
    const encoded = encodeURIComponent(symbol);
    const response = await api.get(`/kanji/radicals/${encoded}`);
    return response.data;
  },

  submitExercises: async (
    lessonId: string,
    answers: Array<{ exerciseId: string; answer: string }>,
  ) => {
    const response = await api.post(`/lessons/${lessonId}/exercises/submit`, {
      answers,
    });
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
    const latestUserMessage = data.messages
      .filter((msg) => msg.role === "user")
      .pop();
    if (!latestUserMessage) throw new Error("No user message found");

    // Try to extract lesson number from lessonId (assuming it's in format like "lesson-1" or just the number)
    const lessonNumber = data.lessonId.replace("lesson-", "") || "1";

    const requestBody = {
      message: latestUserMessage.content,
      context: data.context,
    };

    const response = await api.post(
      `/lessons/${lessonNumber}/ai/chat`,
      requestBody,
    );

    // Transform the response to match the expected ChatMessage format
    const apiResponse = response.data;
    if (apiResponse.success && apiResponse.data) {
      return {
        success: true,
        data: {
          message: {
            role: "assistant",
            content: apiResponse.data.response,
            timestamp: apiResponse.data.timestamp || new Date().toISOString(),
          },
        },
      };
    }

    return apiResponse;
  },

  pronunciation: async (audioData: any) => {
    const aiBaseUrl =
      import.meta.env.VITE_AI_API_URL || "http://localhost:3000/api/v1";
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

// JLPT Tests API functions
type BackendJlptTest = {
  level: string;
  title: string;
  title_vi?: string;
  description: string;
  description_vi?: string;
  duration: number;
  total_questions?: number;
  questions?: number;
  passing_score?: number;
  sections?: Array<{
    name: string;
    name_vi?: string;
    questions: number;
    time: number;
  }>;
  is_active?: boolean;
  version?: number;
  id?: string;
  _id?: string;
  testId?: string;
  slug?: string;
};

const normalizeJlptTest = (raw: BackendJlptTest) => {
  const level = String(raw.level || "").toUpperCase();
  const version = typeof raw.version === "number" ? raw.version : 1;
  const id =
    raw.id ||
    raw._id ||
    raw.testId ||
    raw.slug ||
    `${level.toLowerCase()}-practice-v${version}`;

  const totalQuestions =
    typeof raw.questions === "number"
      ? raw.questions
      : typeof raw.total_questions === "number"
        ? raw.total_questions
        : raw.sections?.reduce((sum, s) => sum + (s.questions || 0), 0) || 0;

  return {
    id,
    level,
    title: raw.title || `${level} Practice Test`,
    title_vi: raw.title_vi,
    description: raw.description || "",
    description_vi: raw.description_vi,
    duration: typeof raw.duration === "number" ? raw.duration : 0,
    questions: totalQuestions,
    total_questions: raw.total_questions,
    passing_score: raw.passing_score,
    is_active: raw.is_active,
    version: raw.version,
    // UI expects sections with ids and durations
    sections: (raw.sections || []).map((s) => ({
      id: (s.name_vi || s.name || "section").toLowerCase().replace(/\s+/g, "-"),
      name: s.name_vi || s.name,
      questions: s.questions,
      duration: s.time,
      description: "",
      questionTypes: ["multiple-choice"],
    })),
    // extra fields used in UI
    difficulty:
      level === "N5"
        ? "Beginner"
        : level === "N4"
          ? "Elementary"
          : level === "N3"
            ? "Intermediate"
            : level === "N2"
              ? "Advanced"
              : "Expert",
    completed: false,
  };
};

// API_BASE_URL can be either ".../api" or ".../api/v1" depending on VITE_API_URL.
// Build JLPT path to avoid "/v1/v1/..." double prefix.
const hasV1InBaseUrl = /\/v1\/?$/.test(API_BASE_URL) || API_BASE_URL.includes("/api/v1");
const jlptBasePath = hasV1InBaseUrl ? "/jlpt-tests" : "/v1/jlpt-tests";

export const jlptTestsAPI = {
  // Get all JLPT tests
  getAllTests: async () => {
    // Backend is under /api/v1/jlpt-tests while API_BASE_URL defaults to /api
    const response = await api.get(jlptBasePath);
    const payload = response.data;
    const rawTests: BackendJlptTest[] = Array.isArray(payload?.data) ? payload.data : [];
    return {
      ...payload,
      data: rawTests.map(normalizeJlptTest),
      source: "backend",
    };
  },

  // Get JLPT tests by level
  getTestsByLevel: async (level: string) => {
    // Not all backends expose /:level; use list endpoint and filter.
    const response = await api.get(jlptBasePath);
    const payload = response.data;
    const rawTests: BackendJlptTest[] = Array.isArray(payload?.data) ? payload.data : [];
    const upper = String(level || "").toUpperCase();
    return {
      ...payload,
      data: rawTests.map(normalizeJlptTest).filter((t) => t.level === upper),
      source: "backend",
    };
  },

  // Get specific JLPT test
  getTest: async (level: string, testId: string) => {
    // Backend currently exposes list endpoint; avoid hitting a non-existent detail endpoint (404 noise).
    const response = await api.get(jlptBasePath);
    const payload = response.data;
    const rawTests: BackendJlptTest[] = Array.isArray(payload?.data) ? payload.data : [];
    const normalized = rawTests.map(normalizeJlptTest);
    const upper = String(level || "").toUpperCase();
    const found = normalized.find(
      (t) => String(t.id) === String(testId) && String(t.level).toUpperCase() === upper,
    );
    if (!found) {
      return {
        success: false,
        message: "Test not found.",
        data: null,
        source: "backend",
      };
    }
    return {
      success: true,
      data: found,
      source: "backend",
    };
  },
};

// Test Attempts API
export interface CreateTestAttemptData {
  testId: string;
  testLevel: string;
  testTitle: string;
  duration: number;
  totalQuestions: number;
  sections?: Array<{
    sectionId: string;
    name: string;
    questions: number;
  }>;
}

export interface UpdateTestAttemptData {
  status?: "in_progress" | "completed" | "abandoned";
  endTime?: string;
  correctAnswers?: number;
  score?: number;
  timeSpent?: number;
  sections?: any[];
  answers?: Record<string, Record<string, string | number>>;
}

export interface TestAttempt {
  _id: string;
  userId: string;
  testId: string;
  testLevel: string;
  testTitle: string;
  status: "in_progress" | "completed" | "abandoned";
  startTime: string;
  endTime?: string;
  duration: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  sections: any[];
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
}

// Textbooks/Courses API
export const textbooksAPI = {
  // Get all textbooks/courses
  getAll: async () => {
    const response = await api.get('/textbooks');
    return response.data;
  },

  // Get single textbook by ID (slug)
  getById: async (id: string) => {
    const response = await api.get(`/textbooks/${id}`);
    return response.data;
  },

  // Get textbook lessons with pagination
  getLessons: async (slug: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/textbooks/${slug}/lessons`, { params });
    return response.data;
  },
};

export const testAttemptsAPI = {
  // Create a new test attempt
  createAttempt: async (data: CreateTestAttemptData) => {
    const response = await api.post("/test-attempts", data);
    return response.data;
  },

  // Get all user's test attempts
  getUserAttempts: async (status?: string, limit?: number) => {
    const params: any = {};
    if (status) params.status = status;
    if (limit) params.limit = limit;
    const response = await api.get("/test-attempts", { params });
    return response.data;
  },

  // Get test attempt statistics
  getStats: async () => {
    const response = await api.get("/test-attempts/stats/summary");
    return response.data;
  },

  // Get specific test attempt
  getAttempt: async (id: string) => {
    const response = await api.get(`/test-attempts/${id}`);
    return response.data;
  },

  // Update test attempt
  updateAttempt: async (id: string, data: UpdateTestAttemptData) => {
    const response = await api.put(`/test-attempts/${id}`, data);
    return response.data;
  },

  // Delete test attempt
  deleteAttempt: async (id: string) => {
    const response = await api.delete(`/test-attempts/${id}`);
    return response.data;
  },
};

// Minna No Nihongo API
export const minnaAPI = {
  // Get Bunkei (Grammar patterns)
  getBunkei: async (lessonNumber?: number, textbook = 'minna_no_nihongo') => {
    const params: any = { textbook };
    if (lessonNumber) params.lessonNumber = lessonNumber;
    const response = await api.get('/v1/minna/bunkei', { params });
    return response.data;
  },

  getBunkeiById: async (id: string) => {
    const response = await api.get(`/v1/minna/bunkei/${id}`);
    return response.data;
  },

  // Get Mondai (Exercises)
  getMondai: async (lessonNumber?: number, type?: string, textbook = 'minna_no_nihongo') => {
    const params: any = { textbook };
    if (lessonNumber) params.lessonNumber = lessonNumber;
    if (type) params.type = type;
    const response = await api.get('/v1/minna/mondai', { params });
    return response.data;
  },

  getMondaiById: async (id: string) => {
    const response = await api.get(`/v1/minna/mondai/${id}`);
    return response.data;
  },

  // Get Kaiwa (Conversations)
  getKaiwa: async (lessonNumber?: number, textbook = 'minna_no_nihongo') => {
    const params: any = { textbook };
    if (lessonNumber) params.lessonNumber = lessonNumber;
    const response = await api.get('/v1/minna/kaiwa', { params });
    return response.data;
  },

  getKaiwaById: async (id: string) => {
    const response = await api.get(`/v1/minna/kaiwa/${id}`);
    return response.data;
  },

  // Get Tango (Vocabulary)
  getTango: async (lessonNumber?: number, textbook = 'minna_no_nihongo') => {
    const params: any = { textbook };
    if (lessonNumber) params.lessonNumber = lessonNumber;
    const response = await api.get('/v1/minna/tango', { params });
    return response.data;
  },

  getTangoById: async (id: string) => {
    const response = await api.get(`/v1/minna/tango/${id}`);
    return response.data;
  },

  // Get all lesson content
  getLessonContent: async (lessonNumber: number, textbook = 'minna_no_nihongo') => {
    const response = await api.get(`/v1/minna/lesson/${lessonNumber}`, {
      params: { textbook }
    });
    return response.data;
  },
};

// Favorites API
export const favoritesAPI = {
  // Get user's favorites
  getFavorites: async (userId: string, params?: { textbookId?: string; lessonNumber?: number; page?: number; limit?: number }) => {
    const response = await api.get('/favorites', { params: { userId, ...params } });
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (data: {
    userId: string;
    wordId: string;
    textbookId: string;
    lessonNumber: number;
  }) => {
    const response = await api.post('/favorites', data);
    return response.data;
  },

  // Check if word is favorited
  checkFavorite: async (userId: string, wordId: string) => {
    const response = await api.get('/favorites/check', { params: { userId, wordId } });
    return response.data;
  },
};
