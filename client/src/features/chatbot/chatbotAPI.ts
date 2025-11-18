import { apiClient } from "@/app/api-client";

/**
 * Chatbot message request interface
 */
export interface ChatbotMessageRequest {
  message: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
  }>;
}

/**
 * Chatbot response interface
 */
export interface ChatbotResponse {
  message: string;
  data: {
    response: string;
    timestamp: string;
  };
}

export const chatbotApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    chatbot: builder.mutation<ChatbotResponse, ChatbotMessageRequest>({
      query: (body) => ({
        url: "/chatbot/chat",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useChatbotMutation } = chatbotApi;

