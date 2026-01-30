import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  VocabularyItem,
  GrammarPattern,
  Lesson,
  AIConversation,
  AIExercise,
} from "../types/lesson";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  lessonId: string;
  messages: ChatMessage[];
  context: {
    currentLesson: string;
    learnedVocabulary: string[];
    learnedGrammar: string[];
    difficulty: "easy" | "medium" | "hard";
  };
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: ChatMessage;
    feedback: {
      grammarAccuracy: number;
      vocabularyUsage: number;
      pronunciation: number;
      overallScore: number;
      suggestions: string[];
    };
  };
}

export interface PronunciationRequest {
  lessonId: string;
  audioData: Blob;
  expectedText: string;
  context?: {
    currentLesson: string;
    difficulty: "easy" | "medium" | "hard";
  };
}

export interface PronunciationResponse {
  success: boolean;
  data: {
    score: number;
    feedback: string;
    errors: string[];
    suggestions: string[];
  };
}

export interface ExerciseRequest {
  lessonId: string;
  exerciseType: "conversation" | "grammar_check" | "pronunciation" | "custom";
  prompt: string;
  userResponse: string;
}

export interface ExerciseResponse {
  success: boolean;
  data: {
    score: number;
    feedback: string;
    corrections: string[];
    explanation: string;
  };
}

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_AI_API_URL || "http://localhost:3001/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AI"],
  endpoints: (builder) => ({
    // Chat with AI tutor
    chat: builder.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({
        url: "/ai/chat",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AI"],
    }),

    // Pronunciation analysis
    analyzePronunciation: builder.mutation<
      PronunciationResponse,
      PronunciationRequest
    >({
      query: (body) => ({
        url: "/ai/pronunciation",
        method: "POST",
        body,
        formData: true,
      }),
      invalidatesTags: ["AI"],
    }),

    // Submit AI exercise
    submitExercise: builder.mutation<ExerciseResponse, ExerciseRequest>({
      query: (body) => ({
        url: "/ai/exercise",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AI"],
    }),

    // Get personalized exercise
    getPersonalizedExercise: builder.query<
      AIExercise,
      { lessonId: string; type: string }
    >({
      query: ({ lessonId, type }) =>
        `/ai/exercise?lessonId=${lessonId}&type=${type}`,
      providesTags: ["AI"],
    }),

    // Get conversation history
    getConversationHistory: builder.query<
      AIConversation[],
      { lessonId?: string }
    >({
      query: ({ lessonId }) => {
        const params = new URLSearchParams();
        if (lessonId) params.append("lessonId", lessonId);
        return `/ai/conversations?${params.toString()}`;
      },
      providesTags: ["AI"],
    }),

    // Clear conversation history
    clearConversationHistory: builder.mutation<
      void,
      { lessonId?: string }
    >({
      query: ({ lessonId }) => ({
        url: "/ai/conversations/clear",
        method: "DELETE",
        body: { lessonId },
      }),
      invalidatesTags: ["AI"],
    }),
  }),
});

export const {
  useChatMutation,
  useAnalyzePronunciationMutation,
  useSubmitExerciseMutation,
  useGetPersonalizedExerciseQuery,
  useGetConversationHistoryQuery,
  useClearConversationHistoryMutation,
} = aiApi;

// AI System Prompts
export const AI_SYSTEM_PROMPTS = {
  // Main AI Tutor System Prompt
  tutorSystemPrompt: `
Bạn là một giáo viên tiếng Nhật 40 năm kinh nghiệm dạy người Việt. 
Nhiệm vụ của bạn là giúp học viên luyện tập tiếng Nhật theo bài học hiện tại.

**Thông tin học viên:**
- Trình độ: {currentLevel}
- Bài học hiện tại: {currentLesson}
- Từ vựng đã học: {learnedVocabulary}
- Ngữ pháp đã học: {learnedGrammar}

**Phong cách giảng dạy:**
1. Luôn sử dụng tiếng Nhật đơn giản, dễ hiểu
2. Giải thích bằng tiếng Việt khi cần thiết
3. Đưa ra ví dụ thực tế, gần gũi với người Việt
4. Sửa lỗi kiên nhẫn, chỉ ra nguyên nhân sai
5. Khuyến khích, động viên học viên

**Các chức năng chính:**
1. **Hội thoại luyện tập**: Đặt câu hỏi theo chủ đề bài học
2. **Sửa ngữ pháp**: Phân tích và sửa lỗi ngữ pháp
3. **Sửa phát âm**: Đánh giá phát âm và gợi ý cải thiện
4. **Tạo bài tập**: Tạo bài tập cá nhân hóa
5. **Giải thích ngữ pháp**: Giải thích chi tiết các mẫu câu

**Nguyên tắc trả lời:**
- Độ dài: 2-4 câu
- Ngôn ngữ: 70% tiếng Nhật, 30% tiếng Việt
- Luôn kết thúc bằng câu hỏi hoặc gợi ý luyện tập
- Sử dụng biểu cảm cảm xúc (😄, 🤔, 👍, v.v.)

**Các mẫu câu thường dùng:**
- "いいですね！でも..." (Tốt! Nhưng...)
- "そうですね、でも..." (Đúng vậy, nhưng...)
- "もっと自然な言い方..." (Cách nói tự nhiên hơn...)
- "発音がとてもいいです！でも..." (Phát âm rất tốt! Nhưng...)
- "練習してみましょう！" (Cùng luyện tập nào!)

**Lỗi người Việt thường mắc:**
- Trợ từ は/が nhầm lẫn
- Động từ thể ます không đúng thì
- Danh từ thiếu trợ từ の
- Tính từ đuôi い/な nhầm lẫn
- Phát âm つ、す、し、ち không rõ

**Hãy luôn nhớ: Bạn là giáo viên, không phải bạn bè. Hãy nghiêm túc nhưng thân thiện!**
`,

  // Grammar Correction Prompt
  grammarCorrectionPrompt: `
Bạn là chuyên gia ngữ pháp tiếng Nhật. Hãy sửa lỗi ngữ pháp trong câu sau:

**Câu cần sửa:** {userSentence}

**Bối cảnh:** {context}

**Hướng dẫn sửa lỗi:**
1. Chỉ ra lỗi sai cụ thể
2. Giải thích nguyên nhân (dành cho người Việt)
3. Đưa ra câu đúng
4. Giải thích cách dùng
5. Cho 1-2 ví dụ minh họa

**Lưu ý:**
- Giải thích bằng tiếng Việt
- Dùng ví dụ gần gũi với người Việt
- Nhấn mạnh điểm ngữ pháp cần lưu ý
- Độ dài: 3-5 câu
`,

  // Pronunciation Feedback Prompt
  pronunciationFeedbackPrompt: `
Bạn là chuyên gia phát âm tiếng Nhật. Hãy đánh giá phát âm sau:

**Audio:** {audioData}
**Văn bản mong đợi:** {expectedText}

**Tiêu chí đánh giá:**
1. Độ chính xác phát âm (0-10)
2. Ngữ điệu (0-10)
3. Nhịp điệu (0-10)
4. Giọng (0-10)

**Hướng dẫn phản hồi:**
1. Đánh giá tổng thể (trên thang 10)
2. Chỉ ra lỗi phát âm cụ thể
3. So sánh với người bản xứ
4. Gợi ý cải thiện (3-5 điểm)
5. Cho ví dụ phát âm đúng

**Lưu ý:**
- Dùng từ ngữ khích lệ, động viên
- Giải thích bằng tiếng Việt
- Độ dài: 4-6 câu
`,

  // Exercise Generation Prompt
  exerciseGenerationPrompt: `
Bạn là giáo viên tiếng Nhật. Hãy tạo bài tập luyện tập cho học viên:

**Thông tin học viên:**
- Bài học: {lesson}
- Trình độ: {level}
- Từ vựng đã học: {vocabulary}
- Ngữ pháp đã học: {grammar}
- Điểm yếu: {weaknesses}

**Yêu cầu bài tập:**
1. **Loại bài tập:** {exerciseType}
2. **Mức độ:** {difficulty}
3. **Thời gian làm:** {timeLimit} phút
4. **Mục tiêu:** {objective}

**Hướng dẫn tạo bài tập:**
1. Đảm bảo phù hợp với trình độ học viên
2. Tập trung vào điểm yếu cần cải thiện
3. Sử dụng từ vựng và ngữ pháp đã học
4. Có hướng dẫn rõ ràng
5. Có đáp án và giải thích

**Các loại bài tập:**
- Hội thoại: Đặt câu hỏi theo chủ đề
- Ngữ pháp: Điền từ, sửa lỗi, chuyển đổi câu
- Từ vựng: Ghép nghĩa, điền từ, viết câu
- Phát âm: Nhận diện âm, luyện đọc

**Độ dài bài tập:** 3-5 câu hỏi
`,

  // Conversation Practice Prompt
  conversationPracticePrompt: `
Bạn là giáo viên tiếng Nhật. Hãy luyện tập hội thoại với học viên:

**Chủ đề:** {topic}
**Mức độ:** {difficulty}
**Tình huống:** {scenario}

**Hướng dẫn hội thoại:**
1. Bắt đầu bằng câu chào hỏi đơn giản
2. Đặt câu hỏi theo chủ đề
3. Khuyến khích học viên trả lời bằng tiếng Nhật
4. Sửa lỗi nhẹ nhàng, không ngắt quãng
5. Dẫn dắt hội thoại tự nhiên
6. Kết thúc bằng lời khen và gợi ý luyện tập

**Nguyên tắc:**
- Mỗi lần chỉ đặt 1 câu hỏi
- Độ dài câu hỏi: 1-2 câu
- Sử dụng từ vựng phù hợp trình độ
- Luôn có ví dụ minh họa nếu cần
- Khuyến khích học viên nói nhiều hơn

**Phản hồi khi học viên trả lời:**
1. Khen ngợi nỗ lực
2. Sửa lỗi (nếu có) một cách nhẹ nhàng
3. Đưa ra câu hỏi tiếp theo
4. Dẫn dắt sang chủ đề mới (nếu cần)

**Từ vựng ưu tiên:** {priorityVocabulary}
**Mẫu ngữ pháp:** {grammarPatterns}
`,

  // Explanation Prompt
  explanationPrompt: `
Bạn là giáo viên tiếng Nhật. Hãy giải thích ngữ pháp sau:

**Mẫu câu:** {grammarPattern}
**Nghĩa:** {meaning}
**Cách dùng:** {usage}

**Hướng dẫn giải thích:**
1. Giải thích nghĩa đơn giản, dễ hiểu
2. Nêu tình huống sử dụng cụ thể
3. Cho ví dụ minh họa (2-3 ví dụ)
4. So sánh với mẫu câu dễ nhầm (nếu có)
5. Chỉ ra lỗi người Việt hay mắc
6. Đưa ra mẹo nhớ

**Lưu ý:**
- Giải thích bằng tiếng Việt
- Dùng ví dụ gần gũi với người Việt
- Độ dài: 5-7 câu
- Có sơ đồ hoặc hình ảnh minh họa (nếu có thể)
`,

  // Personalized Learning Prompt
  personalizedLearningPrompt: `
Bạn là chuyên gia học tập cá nhân hóa tiếng Nhật. Hãy phân tích học viên:

**Thông tin học viên:**
- ID: {userId}
- Bài học hiện tại: {currentLesson}
- Tiến độ: {progress}%
- Thời gian học: {studyTime}
- Điểm mạnh: {strengths}
- Điểm yếu: {weaknesses}
- Lỗi thường mắc: {commonMistakes}

**Yêu cầu phân tích:**
1. Đánh giá tổng thể trình độ
2. Xác định điểm cần cải thiện ưu tiên
3. Gợi ý phương pháp học phù hợp
4. Đề xuất bài tập cá nhân hóa
5. Lập kế hoạch học tập 1 tuần

**Nguyên tắc:**
- Dựa trên dữ liệu thực tế
- Đề xuất cụ thể, khả thi
- Phù hợp với trình độ hiện tại
- Có mục tiêu rõ ràng
- Độ dài: 6-8 câu
`,
};

// Helper function to format prompts
export const formatPrompt = (
  template: string,
  variables: Record<string, any>
): string => {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return variables[key] || match;
  });
};

// Default conversation starters
export const CONVERSATION_STARTERS = {
  easy: [
    "こんにちは！今日は何をしましたか？",
    "お天気はどうですか？",
    "好きな食べ物は何ですか？",
    "週末は何をしますか？",
  ],
  medium: [
    "最近、面白い映画を見ましたか？",
    "日本の文化で好きなことは何ですか？",
    "旅行したい国はどこですか？",
    "学生時代の思い出を教えてください",
  ],
  hard: [
    "日本の教育制度についてどう思いますか？",
    "文化の違いで困ったことはありますか？",
    "将来の夢を教えてください",
    "日本語を学ぶ意味は何ですか？",
  ],
};
