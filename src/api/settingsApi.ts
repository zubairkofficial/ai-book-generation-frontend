import { baseApi } from './baseApi';

interface SettingsResponse {
  id: number;
  coverImagePrompt?: string;
  coverImageModel?: string;
  coverImageDomainUrl?: string;
  chapterImagePrompt?: string;
  chapterImageModel?: string;
  chapterImageDomainUrl?: string;
  bookIdeaMasterPrompt?: string;
  bookCoverMasterPrompt?: string;
  writingAssistantMasterPrompt?: string;
  chapterSummaryMasterPrompt?: string;
  presentationSlidesMasterPrompt?: string;
}

export interface UpdateSettingsRequest {
  id?: number;
  coverImagePrompt?: string|null;
  coverImageModel?: string|null;
  coverImageDomainUrl?: string|null;
  chapterImagePrompt?: string|null;
  chapterImageModel?: string|null;
  chapterImageDomainUrl?: string|null;
  bookIdeaMasterPrompt?: string|null;
  bookCoverMasterPrompt?: string|null;
  writingAssistantMasterPrompt?: string|null;
  chapterSummaryMasterPrompt?: string|null;
  presentationSlidesMasterPrompt?: string|null;
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
      query: (body) => ({
        url: '/settings',
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useFetchSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi; 