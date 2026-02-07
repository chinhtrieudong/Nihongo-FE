import axios, { AxiosInstance, AxiosResponse } from "axios";

// Base types
export interface Scenario {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  context: string;
  aiRole: string;
  userRole: string;
  objectives: string[];
  keyPhrases: {
    japanese: string;
    romaji: string;
    vietnamese: string;
  }[];
  difficulty: number;
  estimatedDuration: number;
  isActive: boolean;
  usageCount: number;
}

export interface Dialog {
  _id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  lines: DialogLine[];
  difficulty: number;
  estimatedDuration: number;
  isActive: boolean;
  usageCount: number;
  scenario: string;
}

export interface DialogLine {
  id: string;
  speaker: string;
  japanese: string;
  romaji: string;
  vietnamese: string;
  audioUrl?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  romaji?: string;
  meaning?: string;
  timestamp: string;
  score?: number;
  feedback?: string;
}

export interface Conversation {
  conversationId: string;
  scenario: {
    id: string;
    title: string;
    context: string;
    aiRole: string;
    userRole: string;
    objectives: string[];
    keyPhrases: {
      japanese: string;
      romaji: string;
      vietnamese: string;
    }[];
  };
  initialMessage: Message;
  startedAt: string;
}

export interface ChatResponse {
  userMessage: Message;
  aiResponse: Message;
  conversationStatus: string;
}

export interface ConversationEnd {
  conversationId: string;
  status: string;
  completedAt: string;
  duration: number;
  scores: {
    overall: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
  };
  messageCount: number;
  feedback: string;
}

export interface VoiceRecording {
  recordingId: string;
  startedAt: string;
  maxDuration: number;
}

export interface VoiceAnalysis {
  recordingId: string;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  accuracy: {
    correctSyllables: number;
    totalSyllables: number;
    accuracyPercentage: number;
  };
  feedback: {
    pronunciation: {
      syllable: string;
      score: number;
      feedback: string;
    }[];
    prosody: {
      pitch: string;
      rhythm: string;
      stress: string;
    };
    overall: string;
  };
  comparison: {
    similarity: number;
    differences: string[];
  };
}

export interface UserStats {
  overallStats: {
    totalConversations: number;
    totalPracticeTime: number;
    averageScore: number;
    currentStreak: number;
    bestStreak: number;
    lastPracticeDate: string;
  };
  aiRoleplayStats: {
    completedScenarios: number;
    averageGrammarScore: number;
    averageVocabularyScore: number;
    averagePronunciationScore: number;
    favoriteCategories: string[];
    improvementAreas: string[];
  };
  dialogPracticeStats: {
    completedDialogs: number;
    averageCompletionTime: number;
    replayCount: number;
    masteredDialogs: string[];
  };
  voicePracticeStats: {
    totalRecordings: number;
    averagePronunciationScore: number;
    improvementRate: number;
    problematicSounds: string[];
  };
  recentActivity: {
    type: string;
    date: string;
    title: string;
    score: number;
    duration: number;
    scenario: string;
    conversationId: string;
  }[];
}

export interface ConversationHistory {
  id: string;
  type: string;
  date: string;
  title: string;
  scenario: string;
  level: string;
  duration: number;
  score: number;
  messagesExchanged: number;
  completedObjectives: string[];
}

export interface AudioGeneration {
  audioUrl: string;
  duration: number;
  format: string;
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
  items: T[];
  pagination: Pagination;
}

// API Client Class
class ConversationAPI {
  private client: AxiosInstance;
  private token: string | null;

  constructor(token?: string) {
    this.token = token || localStorage.getItem("accessToken");

    this.client = axios.create({
      baseURL: "http://localhost:5000/api/v1/conversation",
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
          localStorage.removeItem("accessToken");
          // window.location.href = '/login';
          console.warn("401 but ignore in practice mode");
        }
        return Promise.reject(error);
      },
    );
  }

  // Update token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("accessToken", token);
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem("accessToken");
  }

  // ============ PUBLIC ENDPOINTS ============

  /**
   * Get available scenarios
   */
  async getScenarios(params?: {
    category?: string;
    level?: string;
    difficulty?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ scenarios: Scenario[]; pagination: Pagination }>> {
    try {
      const response: AxiosResponse<
        ApiResponse<{ scenarios: Scenario[]; pagination: Pagination }>
      > = await this.client.get("/scenarios", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get scenario details by ID
   */
  async getScenarioById(
    id: string,
  ): Promise<ApiResponse<{ scenario: Scenario }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ scenario: Scenario }>> =
        await this.client.get(`/scenarios/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available dialogs
   */
  async getDialogs(params?: {
    category?: string;
    level?: string;
    difficulty?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ dialogs: Dialog[]; pagination: Pagination }>> {
    try {
      const response: AxiosResponse<
        ApiResponse<{ dialogs: Dialog[]; pagination: Pagination }>
      > = await this.client.get("/dialogs", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get dialog details by ID
   */
  async getDialogById(id: string): Promise<ApiResponse<{ dialog: Dialog }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ dialog: Dialog }>> =
        await this.client.get(`/dialogs/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ AI CONVERSATION ENDPOINTS ============

  /**
   * Start AI conversation
   */
  async startConversation(
    scenarioId: string,
    level?: string,
  ): Promise<ApiResponse<Conversation>> {
    try {
      const response: AxiosResponse<ApiResponse<Conversation>> =
        await this.client.post("/ai/start", { scenarioId, level });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send chat message
   */
  async sendMessage(
    conversationId: string,
    message: string,
  ): Promise<ApiResponse<ChatResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<ChatResponse>> =
        await this.client.post("/ai/chat", { conversationId, message });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * End AI conversation
   */
  async endConversation(
    conversationId: string,
  ): Promise<ApiResponse<ConversationEnd>> {
    try {
      const response: AxiosResponse<ApiResponse<ConversationEnd>> =
        await this.client.post(`/ai/end/${conversationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ VOICE RECORDING ENDPOINTS ============

  /**
   * Start voice recording
   */
  async startVoiceRecording(params: {
    exerciseType: string;
    targetText: string;
  }): Promise<ApiResponse<VoiceRecording>> {
    try {
      const response: AxiosResponse<ApiResponse<VoiceRecording>> =
        await this.client.post("/voice/start", params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload voice recording
   */
  async uploadVoiceRecording(params: {
    recordingId: string;
    audioFile: File;
  }): Promise<ApiResponse<{ analysis: VoiceAnalysis }>> {
    try {
      const formData = new FormData();
      formData.append("recordingId", params.recordingId);
      formData.append("audioFile", params.audioFile);

      const response: AxiosResponse<ApiResponse<{ analysis: VoiceAnalysis }>> =
        await this.client.post("/voice/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ STATISTICS & HISTORY ENDPOINTS ============

  /**
   * Get user conversation statistics
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response: AxiosResponse<ApiResponse<UserStats>> =
        await this.client.get(`/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(params?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ conversations: Conversation[]; total: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append("type", params.type);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());

      const response: AxiosResponse<
        ApiResponse<{ conversations: Conversation[]; total: number }>
      > = await this.client.get(`/conversations?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ============ AUDIO GENERATION ENDPOINTS ============

  /**
   * Generate audio from text (text-to-speech)
   */
  async generateAudio(params: {
    text: string;
    voice?: string;
    speed?: number;
  }): Promise<ApiResponse<AudioGeneration>> {
    try {
      const response: AxiosResponse<ApiResponse<AudioGeneration>> =
        await this.client.get("/audio/text-to-speech", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get dialog line audio
   */
  async getDialogLineAudio(
    dialogId: string,
    lineId: string,
  ): Promise<ApiResponse<AudioGeneration>> {
    try {
      const response: AxiosResponse<ApiResponse<AudioGeneration>> =
        await this.client.get(`/audio/dialog/${dialogId}/${lineId}`);
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
const conversationAPI = new ConversationAPI();

// Export singleton instance
export { conversationAPI };

// Export class for custom instances
export { ConversationAPI };
