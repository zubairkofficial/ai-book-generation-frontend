import { baseApi } from './baseApi';

interface SettingsResponse {
  id: number;
  coverImagePrompt?: string;
  coverImageModel?: string;
  coverImageDomainUrl?: string;
  chapterImagePrompt?: string;
  chapterImageModel?: string;
  chapterImageDomainUrl?: string;
}

export interface UpdateSettingsRequest {
  id?: number;
  coverImagePrompt?: string|null;
  coverImageModel?: string|null;
  coverImageDomainUrl?: string|null;
  chapterImagePrompt?: string|null;
  chapterImageModel?: string|null;
  chapterImageDomainUrl?: string|null;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchSettings: builder.query<SettingsResponse, void>({
      query: () => ({
        url: '/settings',
        method: 'GET',
      }),
    }),

    updateSettings: builder.mutation<SettingsResponse, UpdateSettingsRequest>({
      query: (payload) => ({
        url: '/settings',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useFetchSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi; 