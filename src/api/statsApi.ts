import { baseApi } from './baseApi'; // Correct import

interface Stat {
  id: string;
  name: string;
  value: number;
}

interface BookGraphData {
  name: string;
  books: number;
}

interface FetchStatsResponse {
  stats: Stat[];
  users?: number;
  books?: number;
}

interface FetchBookGraphResponse {
  data: BookGraphData[];
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
    getBookGraph: builder.query<FetchBookGraphResponse, void>({
      query: () => ({
        url: '/stats/book-graph',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetAllStatsQuery, // Hook to fetch all stats
  useGetBookGraphQuery,
} = statsApi;
