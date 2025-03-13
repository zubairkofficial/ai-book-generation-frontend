import { baseApi } from './baseApi';

interface ApiKeysResponse {
  openai_key: string;
  fal_ai: string;
  model: string;
  id: number;
}

export interface UpdateApiKeysRequest {
  model?: string;
  openai_key?: string;
  fal_ai?: string;
  id: number;
}

export const apiKeysApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchApiKeys: builder.query<ApiKeysResponse, void>({
      query: () => ({
        url: '/api-keys',
        method: 'GET',
      }),
    }),

    saveApiKeys: builder.mutation<ApiKeysResponse, UpdateApiKeysRequest>({
      query: (payload) => ({
        url: '/api-keys',
        method: 'POST',
        body: payload,
      }),
    }),

    updateApiKeys: builder.mutation<ApiKeysResponse, UpdateApiKeysRequest>({
      query: (payload) => ({
        url: '/api-keys',
        method: 'PUT', // Use PUT for updating existing API keys
        body: payload,
      }),
    }),
  }),
});

export const {
  useFetchApiKeysQuery,
  useSaveApiKeysMutation,
  useUpdateApiKeysMutation, // Export the new mutation hook
} = apiKeysApi;
