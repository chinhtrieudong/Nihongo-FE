import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types based on API documentation
export interface ConversationLesson {
  lesson_id: number;
  lesson_title: string;
  situation_vi: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  category: 'greetings' | 'self_introduction' | 'daily_life' | 
           'shopping' | 'restaurant' | 'travel' | 'business' | 
           'school' | 'hospital' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimated_duration: number;
  dialogue: DialogueLine[];
  exercises: Exercises;
  is_active: boolean;
  usage_count: number;
}

export interface DialogueLine {
  line_id: number;
  speaker: string;
  text_jp: string;
  romaji: string;
  meaning_vi: string;
  audio_url: string;
}

export interface Exercises {
  dictation: DictationExercise[];
  comprehension_mcq: MCQExercise[];
  reorder: ReorderExercise[];
  roleplay: RoleplayExercise;
  shadowing: ShadowingExercise[];
  reaction_speaking: ReactionSpeakingExercise[];
}

export interface DictationExercise {
  line_id: number;
  text_with_blank: string;
  answer: string;
}

export interface MCQExercise {
  question_vi: string;
  options: string[];
  correct_index: number;
  explanation_vi: string;
}

export interface ReorderExercise {
  scrambled: string[];
  correct: string;
  meaning_vi: string;
}

export interface RoleplayExercise {
  roles: string[];
  instruction_vi: string;
}

export interface ShadowingExercise {
  line_id: number;
  focus: 'intonation' | 'speed' | 'emotion';
}

export interface ReactionSpeakingExercise {
  situation_vi: string;
  expected_pattern: string;
  example_answer_jp: string;
  example_answer_vi: string;
}

// API Response Types
export interface GetLessonsParams {
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  category?: 'greetings' | 'self_introduction' | 'daily_life' | 
             'shopping' | 'restaurant' | 'travel' | 'business' | 
             'school' | 'hospital' | 'other';
  difficulty?: 1 | 2 | 3 | 4 | 5;
  page?: number;
  limit?: number;
}

export interface GetExercisesParams {
  exerciseType?: 'dictation' | 'comprehension_mcq' | 'reorder' | 
                  'roleplay' | 'shadowing' | 'reaction_speaking';
}

export interface SubmitAnswersRequest {
  exerciseType: 'dictation' | 'comprehension_mcq' | 'reorder';
  answers: string[] | number[];
}

export interface ExerciseResult {
  question: string;
  user_answer: string | number;
  correct_answer: string | number;
  is_correct: boolean;
  explanation?: string;
}

export interface SubmitAnswersResponse {
  lesson_id: number;
  lesson_title: string;
  exercise_type: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  results: ExerciseResult[];
  passed: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details: string;
  };
}

export interface PaginatedResponse<T> {
  lessons: T[];
  pagination: Pagination;
}

// API Client Class
class ConversationLessonAPI {
  private client: AxiosInstance;
  private token: string | null;

  constructor(token?: string) {
    this.token = token || localStorage.getItem('token') || 'mock-token';
    
    this.client = axios.create({
      baseURL: 'http://localhost:3000/api/v1/conversation',
      timeout: 30000,
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.warn('401 but ignore in practice mode');
        }
        return Promise.reject(error);
      }
    );
  }

  // Update token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // ============ LESSON ENDPOINTS ============

  /**
   * Get all conversation lessons
   */
  async getLessons(params?: GetLessonsParams): Promise<ApiResponse<PaginatedResponse<ConversationLesson>>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<ConversationLesson>>> = 
        await this.client.get('/lessons', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(id: string | number): Promise<ApiResponse<ConversationLesson>> {
    try {
      const response: AxiosResponse<ApiResponse<ConversationLesson>> = 
        await this.client.get(`/lessons/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get lesson exercises
   */
  async getLessonExercises(id: string | number, params?: GetExercisesParams): Promise<ApiResponse<{ lesson_id: number; lesson_title: string; exercises: Partial<Exercises> }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ lesson_id: number; lesson_title: string; exercises: Partial<Exercises> }>> = 
        await this.client.get(`/lessons/${id}/exercises`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit exercise answers
   */
  async submitAnswers(id: string | number, data: SubmitAnswersRequest): Promise<ApiResponse<SubmitAnswersResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<SubmitAnswersResponse>> = 
        await this.client.post(`/lessons/${id}/submit`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ HELPER METHODS ============

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data;
      return new Error(apiError.error?.message || apiError.message || 'API Error occurred');
    }
    
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please check your connection and try again.');
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return new Error('Network error. Please check your internet connection.');
    }
    
    return new Error('An unexpected error occurred. Please try again.');
  }

  /**
   * Check rate limit headers
   */
  getRateLimitInfo(response: AxiosResponse): {
    limit: number;
    remaining: number;
    reset: number;
  } | null {
    const headers = response.headers;
    if (headers['x-ratelimit-limit']) {
      return {
        limit: parseInt(headers['x-ratelimit-limit']),
        remaining: parseInt(headers['x-ratelimit-remaining']),
        reset: parseInt(headers['x-ratelimit-reset']),
      };
    }
    return null;
  }
}

// Create singleton instance
const conversationLessonAPI = new ConversationLessonAPI();

// Export singleton instance
export { conversationLessonAPI };

// Export class for custom instances
export { ConversationLessonAPI };
