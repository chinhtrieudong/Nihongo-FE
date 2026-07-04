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
    AI_CHAT: (lessonId: string) => `/lessons/${lessonId}/ai/chat`,
    EXERCISES_SUBMIT: (lessonId: string) => `/lessons/${lessonId}/exercises/submit`,
  },

  // Kanji
  KANJI: {
    CHARACTER: (kanji: string) =>
      `/kanji/character/${encodeURIComponent(kanji)}`,
    LIST: "/kanji",
    BY_LEVEL: (level: string) => `/kanji/${level.toLowerCase()}`,
    RADICALS: {
      LIST: "/kanji/radicals",
      ALL: "/kanji/radicals/all",
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


  // Textbooks
  TEXTBOOKS: {
    LIST: "/textbooks",
    BY_ID: (id: string) => `/textbooks/${id}`,
    LESSONS: (slug: string) => `/textbooks/${slug}/lessons`,
  },

  // Favorites
  FAVORITES: {
    LIST: "/favorites",
    CHECK: "/favorites/check",
  },

  // Pronunciation
  PRONUNCIATION: {
    EXERCISES: "/pronunciation/exercises",
    EXERCISE_DETAIL: (id: string) => `/pronunciation/exercises/${id}`,
    EXERCISE_AUDIO: (id: string) => `/pronunciation/exercises/${id}/audio`,
    PRACTICE: "/pronunciation/practice",
    PRACTICE_DELETE: (id: string) => `/pronunciation/practice/${id}`,
    HISTORY: "/pronunciation/history",
    STATS: "/pronunciation/stats",
    ANALYZE: "/pronunciation/analyze",
    CATEGORIES: "/pronunciation/categories",
    SPEECH_TO_TEXT: "/pronunciation/speech-to-text",
  },

  // Grammar
  GRAMMAR: {
    LIST: "/grammar",
    BY_TEXTBOOK_LESSON: (textbook: string, lesson: number) => `/grammar?textbook=${textbook}&lesson=${lesson}`,
    BY_LEVEL: (level: string) => `/grammar?level=${level}`,
    SEARCH: "/grammar/search",
    RANDOM: "/grammar/random",
    BY_ID: (id: string) => `/grammar/${id}`,
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
  fullName: string;
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
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
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

  updateProfile: async (data: Partial<{ username: string; email: string; avatar: string }>) => {
    const response = await api.put(API_ENDPOINTS.USERS.PROFILE, data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/v1/users/password', data);
    return response.data;
  },
};

// User Stats API functions
export const userStatsAPI = {
  getStats: async (userId: string) => {
    const response = await api.get(`/v1/users/${userId}/stats`);
    return response.data;
  },

  getStreak: async (userId: string) => {
    const response = await api.get(`/v1/users/${userId}/streak`);
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

    const response = await api.get(API_ENDPOINTS.LESSONS.LIST, { params });
    return response.data;
  },

  getLessonDetail: async (id: string): Promise<any> => {
    const response = await api.get(API_ENDPOINTS.LESSONS.DETAIL(id));
    return response.data;
  },

  getLessonByNumber: async (lessonNumber: number): Promise<any> => {
    const response = await api.get(API_ENDPOINTS.LESSONS.BY_NUMBER(lessonNumber));
    return response.data;
  },

  completeLesson: async (lessonId: string) => {
    const response = await api.post(API_ENDPOINTS.LESSONS.COMPLETE(lessonId));
    return response.data;
  },

  getRelatedLessons: async (lessonId: string) => {
    const response = await api.get(API_ENDPOINTS.LESSONS.RELATED(lessonId));
    return response.data;
  },

  searchLessons: async (query: string) => {
    const response = await api.get(
      `${API_ENDPOINTS.LESSONS.SEARCH}?q=${encodeURIComponent(query)}`,
    );
    return response.data;
  },

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
    const response = await api.post(API_ENDPOINTS.LESSONS.AI_ROLEPLAY(lessonId), data);
    return response.data;
  },

  getWeakPoints: async (lessonId: string): Promise<WeakPointsResponse> => {
    const response = await api.get(API_ENDPOINTS.LESSONS.WEAK_POINTS(lessonId));
    return response.data;
  },

  getLessonKanji: async (lessonId: string) => {
    const response = await api.get(API_ENDPOINTS.LESSONS.KANJI(lessonId));
    return response.data;
  },

  submitExercises: async (
    lessonId: string,
    answers: Array<{ exerciseId: string; answer: string }>,
  ) => {
    const response = await api.post(API_ENDPOINTS.LESSONS.EXERCISES_SUBMIT(lessonId), {
      answers,
    });
    return response.data;
  },
};

// Kanji API functions
export const kanjiAPI = {
  getKanji: async (kanji: string) => {
    const response = await api.get(API_ENDPOINTS.KANJI.CHARACTER(kanji));
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

    const hasLevel = Boolean(filters.level && filters.level !== "all");
    const levelPath = hasLevel ? API_ENDPOINTS.KANJI.BY_LEVEL(filters.level!) : API_ENDPOINTS.KANJI.LIST;
    const queryString = params.toString();
    const response = await api.get(
      queryString ? `${levelPath}?${queryString}` : levelPath,
    );
    return response.data;
  },

  getKanjiByRadical: async (radicalSymbol: string, page = 1, limit = 20) => {
    const response = await api.get(
      `${API_ENDPOINTS.KANJI.RADICALS.KANJI_BY_RADICAL(radicalSymbol)}?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  getRadicals: async (_page = 1, _limit = 214) => {
    const response = await api.get(API_ENDPOINTS.KANJI.RADICALS.ALL);
    return response.data;
  },

  getRadicalDetail: async (symbol: string) => {
    const response = await api.get(API_ENDPOINTS.KANJI.RADICALS.DETAIL(symbol));
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
    const latestUserMessage = data.messages
      .filter((msg) => msg.role === "user")
      .pop();
    if (!latestUserMessage) throw new Error("No user message found");

    const lessonNumber = data.lessonId.replace("lesson-", "") || "1";

    const requestBody = {
      message: latestUserMessage.content,
      context: data.context,
    };

    const response = await api.post(
      API_ENDPOINTS.LESSONS.AI_CHAT(lessonNumber),
      requestBody,
    );

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

// Progress API functions
export const progressAPI = {
  getProgress: async (userId: string, params?: { textbookId?: string; status?: string }) => {
    const response = await api.get(API_ENDPOINTS.PROGRESS, { params: { userId, ...params } });
    return response.data;
  },
  
  updateLessonProgress: async (data: any) => {
    const response = await api.post(`${API_ENDPOINTS.PROGRESS}/lesson`, data);
    return response.data;
  },

  getDueReviews: async (userId: string, limit?: number) => {
    const response = await api.get(`${API_ENDPOINTS.PROGRESS}/due`, { params: { userId, limit } });
    return response.data;
  },

  submitReview: async (data: any) => {
    const response = await api.post(`${API_ENDPOINTS.PROGRESS}/review`, data);
    return response.data;
  }
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

// Helper to build API paths avoiding double /v1 prefix
const buildPath = (path: string) => {
  const hasV1InBaseUrl = /\/v1\/?$/.test(API_BASE_URL) || API_BASE_URL.includes("/api/v1");
  if (hasV1InBaseUrl) {
    return path.startsWith("/v1/") ? path.replace("/v1", "") : path;
  }
  return path.startsWith("/v1/") ? path : `/v1${path}`;
};

const jlptBasePath = buildPath("/jlpt-tests");
const minnaBasePath = buildPath("/minna");

const MINNA_ENDPOINTS = {
  BUNKEI: `${minnaBasePath}/bunkei`,
  BUNKEI_BY_ID: (id: string) => `${minnaBasePath}/bunkei/${id}`,
  MONDAI: `${minnaBasePath}/mondai`,
  MONDAI_BY_ID: (id: string) => `${minnaBasePath}/mondai/${id}`,
  KAIWA: `${minnaBasePath}/kaiwa`,
  KAIWA_BY_ID: (id: string) => `${minnaBasePath}/kaiwa/${id}`,
  TANGO: `${minnaBasePath}/tango`,
  TANGO_BY_ID: (id: string) => `${minnaBasePath}/tango/${id}`,
  LESSON: (lessonNumber: number) => `${minnaBasePath}/lesson/${lessonNumber}`,
} as const;

const JLPT_ENDPOINTS = {
  LIST: jlptBasePath,
} as const;

export const jlptTestsAPI = {
  getAllTests: async () => {
    const response = await api.get(JLPT_ENDPOINTS.LIST);
    const payload = response.data;
    const rawTests: BackendJlptTest[] = Array.isArray(payload?.data) ? payload.data : [];
    return {
      ...payload,
      data: rawTests.map(normalizeJlptTest),
      source: "backend",
    };
  },

  getTestsByLevel: async (level: string) => {
    const response = await api.get(JLPT_ENDPOINTS.LIST);
    const payload = response.data;
    const rawTests: BackendJlptTest[] = Array.isArray(payload?.data) ? payload.data : [];
    const upper = String(level || "").toUpperCase();
    return {
      ...payload,
      data: rawTests.map(normalizeJlptTest).filter((t) => t.level === upper),
      source: "backend",
    };
  },

  getTest: async (level: string, testId: string) => {
    const response = await api.get(JLPT_ENDPOINTS.LIST);
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
export const testAttemptsAPI = {
  getUserAttempts: async (status?: string, limit?: number) => {
    const params: any = {};
    if (status) params.status = status;
    if (limit) params.limit = limit;
    const response = await api.get('/api/v1/test-attempts/user', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/v1/test-attempts/stats');
    return response.data;
  },

  createAttempt: async (attemptData: any) => {
    const response = await api.post('/api/v1/test-attempts', attemptData);
    return response.data;
  },

  updateAttempt: async (attemptId: string, updateData: any) => {
    const response = await api.put(`/api/v1/test-attempts/${attemptId}`, updateData);
    return response.data;
  },

  getAttemptById: async (attemptId: string) => {
    const response = await api.get(`/api/v1/test-attempts/${attemptId}`);
    return response.data;
  }
};

// Textbooks/Courses API
export const textbooksAPI = {
  getAll: async () => {
    const response = await api.get(API_ENDPOINTS.TEXTBOOKS.LIST);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.TEXTBOOKS.BY_ID(id));
    return response.data;
  },

  getLessons: async (slug: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(API_ENDPOINTS.TEXTBOOKS.LESSONS(slug), { params });
    return response.data;
  },
};

// Minna No Nihongo API
export const minnaAPI = {
  getBunkei: async (lessonNumber?: number, textbook = 'minna_no_nihongo') => {
    const params: any = { textbook };
    if (lessonNumber) params.lessonNumber = lessonNumber;
    const response = await api.get(MINNA_ENDPOINTS.BUNKEI, { params });
    return response.data;
  },

  getBunkeiById: async (id: string) => {
    const response = await api.get(MINNA_ENDPOINTS.BUNKEI_BY_ID(id));
    return response.data;
  },

  getMondai: async (lessonNumber?: number, type?: string, textbook = 'minna_no_nihongo') => {
    const params: any = { textbook };
    if (lessonNumber) params.lessonNumber = lessonNumber;
    if (type) params.type = type;
    const response = await api.get(MINNA_ENDPOINTS.MONDAI, { params });
    return response.data;
  },

  getMondaiById: async (id: string) => {
    const response = await api.get(MINNA_ENDPOINTS.MONDAI_BY_ID(id));
    return response.data;
  },

  getKaiwa: async (lessonNumber?: number, textbook = 'minna_no_nihongo') => {
    const params: any = { textbook };
    if (lessonNumber) params.lessonNumber = lessonNumber;
    const response = await api.get(MINNA_ENDPOINTS.KAIWA, { params });
    return response.data;
  },

  getKaiwaById: async (id: string) => {
    const response = await api.get(MINNA_ENDPOINTS.KAIWA_BY_ID(id));
    return response.data;
  },

  getTango: async (lessonNumber?: number, textbook = 'minna_no_nihongo') => {
    // Use minnaJsonRoutes vocabulary endpoint which reads from JSON files
    // Note: minnaJsonRoutes is mounted at /api/v1/mina, not /minna
    if (lessonNumber) {
      const minaBasePath = buildPath("/mina");
      const response = await api.get(`${minaBasePath}/${lessonNumber}/vocabulary`);
      return response.data;
    }
    // Fallback to original endpoint if no lesson number
    const params: any = { textbook };
    const response = await api.get(MINNA_ENDPOINTS.TANGO, { params });
    return response.data;
  },

  getTangoById: async (id: string) => {
    const response = await api.get(MINNA_ENDPOINTS.TANGO_BY_ID(id));
    return response.data;
  },

  getLessonContent: async (lessonNumber: number, textbook = 'minna_no_nihongo') => {
    const response = await api.get(MINNA_ENDPOINTS.LESSON(lessonNumber), {
      params: { textbook }
    });
    return response.data;
  },
};

// Favorites API
export const favoritesAPI = {
  getFavorites: async (userId: string, params?: { textbookId?: string; lessonNumber?: number; page?: number; limit?: number }) => {
    const response = await api.get(API_ENDPOINTS.FAVORITES.LIST, { params: { userId, ...params } });
    return response.data;
  },

  toggleFavorite: async (data: {
    userId: string;
    wordId: string;
    textbookId: string;
    lessonNumber: number;
  }) => {
    const response = await api.post(API_ENDPOINTS.FAVORITES.LIST, data);
    return response.data;
  },

  checkFavorite: async (userId: string, wordId: string) => {
    const response = await api.get(API_ENDPOINTS.FAVORITES.CHECK, { params: { userId, wordId } });
    return response.data;
  },
};
