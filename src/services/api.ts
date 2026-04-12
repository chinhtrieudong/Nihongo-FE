import axios from "axios";
import {
  LessonsResponse,
  ExerciseSubmitResponse,
  AIRoleplayResponse,
  WeakPointsResponse,
} from "../types/lesson";
import { jlptTests as localJlptTests } from "../data/jlptTests";

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

  // Vocabulary
  VOCABULARY: "/vocabulary",

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
      DIALOG_LINE: (dialogId: string, lineId: string) =>
        `/audio/dialog/${dialogId}/${lineId}`,
    },
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

// Minna JSON API endpoints (separate service)
export const MINNA_ENDPOINTS = {
  LESSON: {
    VOCABULARY: (lessonNumber: number) => `/lessons/${lessonNumber}/vocabulary`,
    GRAMMAR: (lessonNumber: number) => `/lessons/${lessonNumber}/grammar`,
    DIALOG: (lessonNumber: number) => `/lessons/${lessonNumber}/dialog`,
    BUNKEI: (lessonNumber: number) => `/lessons/${lessonNumber}/bunkei`,
    RENSHOU: (lessonNumber: number) => `/lessons/${lessonNumber}/renshuu`,
    REIBUN: (lessonNumber: number) => `/lessons/${lessonNumber}/reibun`,
    AI_CHAT: (lessonNumber: number) => `/lessons/${lessonNumber}/ai/chat`,
  },
};

// Tango JSON API endpoints (separate service)
export const TANGO_ENDPOINTS = {
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

// Add mina API after the main api
const MINA_API_BASE_URL = "/api/v1/mina";

// Create separate axios instance for mina endpoints
const minaApi = axios.create({
  baseURL: MINA_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add tango API after the main api
const TANGO_API_BASE_URL = "/api/tango";

// Create separate axios instance for tango endpoints
const tangoApi = axios.create({
  baseURL: TANGO_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for mina API
minaApi.interceptors.request.use(
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

// Request interceptor for tango API
tangoApi.interceptors.request.use(
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

// Vocabulary API functions
export const vocabularyAPI = {
  getVocabulary: async (level?: string) => {
    const params = level ? { level } : {};
    const response = await api.get(API_ENDPOINTS.VOCABULARY, { params });
    return response.data;
  },

  getVocabularyByLesson: async (lessonNumber: number): Promise<any> => {
    const response = await minaApi.get(`/lessons/${lessonNumber}/vocabulary`);
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

    // Use mina endpoint for minna_no_nihongo textbook
    if (textbook === "minna_no_nihongo") {
      const response = await minaApi.get("/lessons", { params });
      return response.data;
    }

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

    const response = await minaApi.post(
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
export { minaApi };

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
    try {
      // Backend is under /api/v1/jlpt-tests while API_BASE_URL defaults to /api
      const response = await api.get(jlptBasePath);
      const payload = response.data;
      const rawTests: BackendJlptTest[] = Array.isArray(payload?.data) ? payload.data : [];
      return {
        ...payload,
        data: rawTests.map(normalizeJlptTest),
        source: "backend",
      };
    } catch (error) {
      // Fallback to local JSON when backend endpoint is missing
      return {
        success: true,
        data: localJlptTests,
        source: "local",
      };
    }
  },

  // Get JLPT tests by level
  getTestsByLevel: async (level: string) => {
    try {
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
    } catch (error) {
      const upper = String(level || "").toUpperCase();
      const filtered = localJlptTests.filter(
        (t) => String(t.level).toUpperCase() === upper,
      );
      return {
        success: true,
        data: filtered,
        source: "local",
      };
    }
  },

  // Get specific JLPT test
  getTest: async (level: string, testId: string) => {
    try {
      // Backend currently exposes list endpoint; avoid hitting a non-existent detail endpoint (404 noise).
      const response = await api.get(jlptBasePath);
      const payload = response.data;
      const rawTests: BackendJlptTest[] = Array.isArray(payload?.data) ? payload.data : [];
      const normalized = rawTests.map(normalizeJlptTest);
      const upper = String(level || "").toUpperCase();
      const found =
        normalized.find((t) => String(t.id) === String(testId) && t.level === upper) ||
        // If caller passes old/empty ids, pick the first active test of that level
        normalized.find((t) => t.level === upper);
      if (!found) {
        return {
          success: false,
          message: "Test not found (backend & local).",
          data: null,
          source: "backend",
        };
      }
      return {
        success: true,
        data: found,
        source: "backend",
      };
    } catch (error) {
      const upper = String(level || "").toUpperCase();
      const found = localJlptTests.find(
        (t) => String(t.id) === String(testId) && String(t.level).toUpperCase() === upper,
      );
      if (!found) {
        // Preserve a consistent shape for callers
        return {
          success: false,
          message: "Test not found (backend & local).",
          data: null,
          source: "local",
        };
      }
      return {
        success: true,
        data: found,
        source: "local",
      };
    }
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
