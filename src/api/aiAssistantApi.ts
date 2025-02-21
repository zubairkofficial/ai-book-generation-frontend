import { AiAssistantType } from '@/components/chat/ChatDialog';
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

interface BookCoverInfo {
  bookTitle: string;
  genre: string;
  coverStyle: string;
  colorPreference: string;
  targetAudience: string;
  additionalElements: string;
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
  }),
});

export const {
  useGetAiAssistantResponseMutation,
} = aiAssistantApi; 