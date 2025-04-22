import { AiAssistantType } from '@/types/enum';
import { baseApi } from './baseApi';


// Interface for AI Assistant request
interface AiAssistantRequest {
  type: AiAssistantType;
  information?: {
    genre?: string;
    targetAudience?: string;
    themeOrTopic?: string;
    specificElements?: string;
    description?: string;
  };
  bookCoverInfo?: {
    bookTitle?: string;
    coverStyle?: string;
    colorPreference?: string;
    additionalElements?: string;
  };
  bookWriteInfo?: {
    writingGoal?: string;
    genre?: string;
    targetAudience?: string;
    currentChallenges?: string;
    specificArea?: string;
    writingLevel?: string;
  };
}

// Interface for AI Assistant response
interface AiAssistantResponse {
  id: number;
  information: {
    genre: string;
    targetAudience: string;
    themeOrTopic: string;
    specificElements: string;
    description: string;
  };
  type: AiAssistantType;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  response: {
    generatedText: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
}



// Add these interfaces at the top with the other interfaces
interface AiAssistantMessage {
  message: string;
  aiAssistantId: number;
}

interface AiAssistantChatResponse {
  id: number;
  message: string;
  aiAssistantId: number;
  response: {
    generatedText: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const aiAssistantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiAssistantResponse: builder.mutation<AiAssistantResponse, AiAssistantRequest>({
      query: (payload) => ({
        url: '/ai-assistant',
        method: 'POST',
        body: payload,
      }),
    }),
    // Add new chat endpoint
    getAiAssistantChat: builder.mutation<AiAssistantChatResponse, AiAssistantMessage>({
      query: (payload) => ({
        url: '/ai-assistant/chat',
        method: 'POST',
        body: payload,
      }),
    }),
    
  }),
});

export const {
  useGetAiAssistantResponseMutation,
  useGetAiAssistantChatMutation,
} = aiAssistantApi; 