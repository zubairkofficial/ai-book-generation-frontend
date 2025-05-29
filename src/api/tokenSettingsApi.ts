import { baseApi } from './baseApi';

export interface TokenSettings {
  creditsPerModelToken: number;
  creditsPerImageToken: number;
}

export const tokenSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTokenSettings: builder.query<TokenSettings, void>({
      query: () => ({
        url: '/settings/token-conversion',
        method: 'GET',
      }),
   
    }),
    updateTokenSettings: builder.mutation<TokenSettings, Partial<TokenSettings>>({
      query: (settings) => ({
        url: '/settings/token-conversion',
        method: 'POST',
        body: settings,
      }),
      
    }),
  }),
});

export const {
  useGetTokenSettingsQuery,
  useUpdateTokenSettingsMutation,
} = tokenSettingsApi; 