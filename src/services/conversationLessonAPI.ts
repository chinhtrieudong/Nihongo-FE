import axios, { AxiosInstance, AxiosResponse } from "axios";

// Types based on API documentation
export interface ConversationLesson {
  _id?: string; // MongoDB ObjectId
  lesson_id: number;
  lesson_title: string;
  situation_vi: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  category:
    | "greetings"
    | "self_introduction"
    | "daily_life"
    | "shopping"
    | "restaurant"
    | "travel"
    | "business"
    | "school"
    | "hospital"
    | "other";
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
  audio_url?: string;
}

export interface Exercises {
  dictation: DictationExercise[];
  comprehension_mcq: MCQExercise[];
  reorder: ReorderExercise[];
  roleplay: RoleplayExercise;
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

export interface ReactionSpeakingExercise {
  situation_vi: string;
  expected_pattern: string;
  example_answer_jp: string;
  example_answer_vi: string;
}

// API Response Types
export interface GetLessonsParams {
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  category?:
    | "greetings"
    | "self_introduction"
    | "daily_life"
    | "shopping"
    | "restaurant"
    | "travel"
    | "business"
    | "school"
    | "hospital"
    | "other";
  difficulty?: 1 | 2 | 3 | 4 | 5;
  page?: number;
  limit?: number;
}

export interface GetExercisesParams {
  exerciseType?:
    | "dictation"
    | "comprehension_mcq"
    | "reorder"
    | "roleplay"
    | "reaction_speaking";
}

export interface SubmitAnswersRequest {
  exerciseType: "dictation" | "comprehension_mcq" | "reorder";
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
    this.token = token || localStorage.getItem("token") || "mock-token";

    this.client = axios.create({
      baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"}/conversation`,
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
      (error) => Promise.reject(error),
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.warn("401 but ignore in practice mode");
        }
        return Promise.reject(error);
      },
    );
  }

  // Update token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  // ============ LESSON ENDPOINTS ============

  /**
   * Get all conversation lessons
   */
  async getLessons(
    params?: GetLessonsParams,
  ): Promise<ApiResponse<PaginatedResponse<ConversationLesson>>> {
    try {
      const response: AxiosResponse<
        ApiResponse<PaginatedResponse<ConversationLesson>>
      > = await this.client.get("/lessons", { params });
      
      // Check if response has data
      if (response.data?.success && response.data?.data?.lessons?.length > 0) {
        return response.data;
      }
      
      // If API returns empty data, use mock data
      console.warn('API returned empty data, using mock data');
      throw new Error('Empty data');
    } catch (error) {
      console.warn('API not available, using mock data');
      // Return mock data
      const mockLessons: ConversationLesson[] = [
        {
          lesson_id: 1,
          lesson_title: "Tự giới thiệu bản thân",
          situation_vi: "Hội thoại về cách giới thiệu tên và quê quán",
          level: "N5",
          category: "other",
          difficulty: 1,
          estimated_duration: 5,
          dialogue: [
            {
              line_id: 1,
              speaker: "A",
              text_jp: "はじめまして。",
              romaji: "Hajimemashite.",
              meaning_vi: "Rất vui được gặp bạn."
            },
            {
              line_id: 2,
              speaker: "A",
              text_jp: "わたしはたなかです。",
              romaji: "Watashi wa Tanaka desu.",
              meaning_vi: "Tôi là Tanaka."
            },
            {
              line_id: 3,
              speaker: "B",
              text_jp: "はじめまして。",
              romaji: "Hajimemashite.",
              meaning_vi: "Rất vui được gặp bạn."
            },
            {
              line_id: 4,
              speaker: "B",
              text_jp: "わたしはスミスです。",
              romaji: "Watashi wa Smith desu.",
              meaning_vi: "Tôi là Smith."
            }
          ],
          exercises: {
            dictation: [],
            comprehension_mcq: [],
            reorder: [],
            roleplay: {
              roles: ["A", "B"],
              instruction_vi: "Hãy đóng vai và giới thiệu bản thân"
            },
            reaction_speaking: []
          },
          is_active: true,
          usage_count: 150
        },
        {
          lesson_id: 2,
          lesson_title: "Hỏi đường",
          situation_vi: "Hội thoại về cách hỏi và chỉ đường",
          level: "N5",
          category: "daily_life",
          difficulty: 1,
          estimated_duration: 5,
          dialogue: [
            {
              line_id: 1,
              speaker: "A",
              text_jp: "すみません。",
              romaji: "Sumimasen.",
              meaning_vi: "Xin lỗi."
            },
            {
              line_id: 2,
              speaker: "A",
              text_jp: "えきはどこですか。",
              romaji: "Eki wa doko desu ka.",
              meaning_vi: "Nhà ga ở đâu?"
            },
            {
              line_id: 3,
              speaker: "B",
              text_jp: "あそこです。",
              romaji: "Asoko desu.",
              meaning_vi: "Ở đằng kia."
            },
            {
              line_id: 4,
              speaker: "B",
              text_jp: "まっすぐいってください。",
              romaji: "Massugu itte kudasai.",
              meaning_vi: "Đi thẳng."
            }
          ],
          exercises: {
            dictation: [],
            comprehension_mcq: [],
            reorder: [],
            roleplay: {
              roles: ["A", "B"],
              instruction_vi: "Hãy đóng vai và hỏi đường"
            },
            reaction_speaking: []
          },
          is_active: true,
          usage_count: 200
        },
        {
          lesson_id: 3,
          lesson_title: "Đặt món tại nhà hàng",
          situation_vi: "Hội thoại về cách gọi món ăn",
          level: "N5",
          category: "restaurant",
          difficulty: 2,
          estimated_duration: 5,
          dialogue: [
            {
              line_id: 1,
              speaker: "Staff",
              text_jp: "いらっしゃいませ。",
              romaji: "Irasshaimase.",
              meaning_vi: "Xin mời vào."
            },
            {
              line_id: 2,
              speaker: "Customer",
              text_jp: "メニューをおねがいします。",
              romaji: "Menyuu wo onegaishimasu.",
              meaning_vi: "Cho tôi xem thực đơn."
            },
            {
              line_id: 3,
              speaker: "Staff",
              text_jp: "はい、こちらです。",
              romaji: "Hai, kochira desu.",
              meaning_vi: "Vâng, đây ạ."
            },
            {
              line_id: 4,
              speaker: "Customer",
              text_jp: "ラーメンをひとつおねがいします。",
              romaji: "Raamen wo hitotsu onegaishimasu.",
              meaning_vi: "Cho tôi một suất ramen."
            }
          ],
          exercises: {
            dictation: [],
            comprehension_mcq: [],
            reorder: [],
            roleplay: {
              roles: ["Staff", "Customer"],
              instruction_vi: "Hãy đóng vai và gọi món"
            },
            reaction_speaking: []
          },
          is_active: true,
          usage_count: 180
        },
        {
          lesson_id: 4,
          lesson_title: "Chào hỏi hàng ngày",
          situation_vi: "Hội thoại chào hỏi buổi sáng",
          level: "N5",
          category: "daily_life",
          difficulty: 1,
          estimated_duration: 5,
          dialogue: [
            {
              line_id: 1,
              speaker: "A",
              text_jp: "おはようございます。",
              romaji: "Ohayou gozaimasu.",
              meaning_vi: "Chào buổi sáng."
            },
            {
              line_id: 2,
              speaker: "B",
              text_jp: "おはようございます。",
              romaji: "Ohayou gozaimasu.",
              meaning_vi: "Chào buổi sáng."
            },
            {
              line_id: 3,
              speaker: "A",
              text_jp: "おげんきですか。",
              romaji: "Ogenki desu ka.",
              meaning_vi: "Bạn có khỏe không?"
            },
            {
              line_id: 4,
              speaker: "B",
              text_jp: "はい、げんきです。",
              romaji: "Hai, genki desu.",
              meaning_vi: "Vâng, tôi khỏe."
            }
          ],
          exercises: {
            dictation: [],
            comprehension_mcq: [],
            reorder: [],
            roleplay: {
              roles: ["A", "B"],
              instruction_vi: "Hãy chào hỏi nhau"
            },
            reaction_speaking: []
          },
          is_active: true,
          usage_count: 250
        },
        {
          lesson_id: 5,
          lesson_title: "Mua sắm tại cửa hàng",
          situation_vi: "Hội thoại về cách hỏi giá và mua hàng",
          level: "N5",
          category: "shopping",
          difficulty: 2,
          estimated_duration: 5,
          dialogue: [
            {
              line_id: 1,
              speaker: "Customer",
              text_jp: "これはいくらですか。",
              romaji: "Kore wa ikura desu ka.",
              meaning_vi: "Cái này giá bao nhiêu?"
            },
            {
              line_id: 2,
              speaker: "Staff",
              text_jp: "せんえんです。",
              romaji: "Sen en desu.",
              meaning_vi: "1000 yên."
            },
            {
              line_id: 3,
              speaker: "Customer",
              text_jp: "これをください。",
              romaji: "Kore wo kudasai.",
              meaning_vi: "Cho tôi cái này."
            }
          ],
          exercises: {
            dictation: [],
            comprehension_mcq: [],
            reorder: [],
            roleplay: {
              roles: ["Customer", "Staff"],
              instruction_vi: "Hãy đóng vai và mua hàng"
            },
            reaction_speaking: []
          },
          is_active: true,
          usage_count: 160
        }
      ];

      // Filter by category if provided
      let filteredLessons = mockLessons;
      if (params?.category) {
        filteredLessons = mockLessons.filter(lesson => lesson.category === params.category);
      }
      if (params?.level) {
        filteredLessons = filteredLessons.filter(lesson => lesson.level === params.level);
      }

      return {
        success: true,
        data: {
          lessons: filteredLessons,
          pagination: {
            total: filteredLessons.length,
            page: 1,
            limit: 20,
            pages: 1
          }
        }
      };
    }
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(
    id: string | number,
  ): Promise<ApiResponse<ConversationLesson>> {
    try {
      console.log(`Fetching lesson ${id} from API...`);
      const response: AxiosResponse<ApiResponse<ConversationLesson>> =
        await this.client.get(`/lessons/${id}`);
      
      console.log('API Response:', response.data);
      
      // Check if response has data
      if (response.data?.success && response.data?.data) {
        console.log('Using API data for lesson', id);
        // Map API response to match our interface
        const apiData = response.data.data;
        const mappedLesson: ConversationLesson = {
          _id: apiData._id,
          lesson_id: apiData.lesson_id || parseInt(String(id)) || 1,
          lesson_title: apiData.lesson_title || `Bài học hội thoại ${id}`,
          situation_vi: apiData.situation_vi || "Hội thoại tiếng Nhật cơ bản",
          level: apiData.level || "N5",
          category: apiData.category || "daily_life",
          difficulty: apiData.difficulty || 1,
          estimated_duration: apiData.estimated_duration || 5,
          dialogue: apiData.dialogue || [],
          exercises: apiData.exercises || {
            dictation: [],
            comprehension_mcq: [],
            reorder: [],
            roleplay: {
              roles: ["A", "B"],
              instruction_vi: "Hãy đóng vai và thực hành"
            },
            reaction_speaking: []
          },
          is_active: apiData.is_active !== undefined ? apiData.is_active : true,
          usage_count: apiData.usage_count || 0
        };
        
        return {
          success: true,
          data: mappedLesson
        };
      }
      
      // If API returns empty data, throw error
      console.error('API returned empty data for lesson', id);
      throw new Error('API returned empty data');
    } catch (error) {
      console.error('API error for lesson', id, ':', error);
      throw error;
    }
  }

  /**
   * Get lesson exercises
   */
  async getLessonExercises(
    id: string | number,
    params?: GetExercisesParams,
  ): Promise<
    ApiResponse<{
      lesson_id: number;
      lesson_title: string;
      exercises: Partial<Exercises>;
    }>
  > {
    try {
      const response: AxiosResponse<
        ApiResponse<{
          lesson_id: number;
          lesson_title: string;
          exercises: Partial<Exercises>;
        }>
      > = await this.client.get(`/lessons/${id}/exercises`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit exercise answers
   */
  async submitAnswers(
    id: string | number,
    data: SubmitAnswersRequest,
  ): Promise<ApiResponse<SubmitAnswersResponse>> {
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
      return new Error(
        apiError.error?.message || apiError.message || "API Error occurred",
      );
    }

    if (error.code === "ECONNABORTED") {
      return new Error(
        "Request timeout. Please check your connection and try again.",
      );
    }

    if (error.code === "NETWORK_ERROR") {
      return new Error("Network error. Please check your internet connection.");
    }

    return new Error("An unexpected error occurred. Please try again.");
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
    if (headers["x-ratelimit-limit"]) {
      return {
        limit: parseInt(headers["x-ratelimit-limit"]),
        remaining: parseInt(headers["x-ratelimit-remaining"]),
        reset: parseInt(headers["x-ratelimit-reset"]),
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
