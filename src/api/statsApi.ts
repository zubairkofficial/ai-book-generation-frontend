import { baseApi } from './baseApi'; // Correct import

interface Stat {
  id: string;
  name: string;
  value: number;
}

interface FetchStatsResponse {
  stats: Stat[];
}

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint to fetch all stats
    getAllStats: builder.query<FetchStatsResponse, void>({
      query: () => ({
        url: '/stats',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetAllStatsQuery, // Hook to fetch all stats
} = statsApi;
