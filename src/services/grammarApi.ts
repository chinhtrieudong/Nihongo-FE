import axios from "axios";
import { API_ENDPOINTS } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

// Create axios instance for grammar API
const grammarApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
grammarApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
grammarApi.interceptors.response.use(
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
          return grammarApi(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export interface GrammarExample {
  japanese: string;
  vietnamese: string;
}

export interface GrammarItem {
  id: string;
  title: string;
  pattern: string;
  meaning: string;
  explanation: string;
  structure: string;
  examples: GrammarExample[];
  notes?: string;
  category: string;
}

export interface Lesson {
  lessonNumber: number;
  title: string;
  title_jp: string;
  level: string;
  description: string;
  grammars: GrammarItem[];
}

export interface GrammarResponse {
  success: boolean;
  data: {
    lessons: Lesson[];
    categories: { value: string; label: string }[];
    levels: string[];
    pagination?: {
      page: number;
      limit: number;
      totalLessons: number;
      totalGrammars: number;
      hasMore: boolean;
    };
    query?: string;
  };
}

export interface SearchParams {
  q?: string;
  level?: string;
  category?: string;
  page?: number;
  limit?: number;
  importance?: string;
  min_frequency?: number;
}

// Grammar API functions
export const grammarAPI = {
  // Get all grammar with optional filters
  getAllGrammar: async (params?: SearchParams): Promise<GrammarResponse> => {
    const response = await grammarApi.get(API_ENDPOINTS.GRAMMAR.LIST, { params });
    return response.data;
  },

  // Get grammar by textbook and lesson
  getGrammarByTextbookLesson: async (textbook: string, lesson: number): Promise<GrammarResponse> => {
    const response = await grammarApi.get(API_ENDPOINTS.GRAMMAR.BY_TEXTBOOK_LESSON(textbook, lesson));
    return response.data;
  },

  // Get grammar by level
  getGrammarByLevel: async (level: string, params?: Omit<SearchParams, 'level'>): Promise<GrammarResponse> => {
    const response = await grammarApi.get(API_ENDPOINTS.GRAMMAR.BY_LEVEL(level), { params });
    return response.data;
  },

  // Search grammar
  searchGrammar: async (params: SearchParams): Promise<GrammarResponse> => {
    const response = await grammarApi.get(API_ENDPOINTS.GRAMMAR.SEARCH, { params });
    return response.data;
  },

  // Get random grammar for practice
  getRandomGrammar: async (level?: string, count: number = 5): Promise<GrammarResponse> => {
    const params: any = { count };
    if (level) params.level = level;
    const response = await grammarApi.get(API_ENDPOINTS.GRAMMAR.RANDOM, { params });
    return response.data;
  },

  // Get grammar by ID
  getGrammarById: async (id: string): Promise<GrammarResponse> => {
    const response = await grammarApi.get(API_ENDPOINTS.GRAMMAR.BY_ID(id));
    return response.data;
  },
};

export default grammarAPI;
