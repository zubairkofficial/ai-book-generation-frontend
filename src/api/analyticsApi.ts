import { baseApi } from './baseApi';

// Interface for user analytics data
export interface UserAnalytics {
  user_id: number;
  user_createdAt: string;
  user_updatedAt: string;
  user_deletedAt: string | null;
  user_name: string | null;
  user_email: string;
  user_password?: string;
  user_phoneNumber: string | null;
  user_isEmailVerified: boolean;
  user_isBlocked: boolean; // Added isBlocked
  user_twoFactorSecret: string | null;
  user_role: 'admin' | 'user';
  user_status: string;
  user_paymentStatus: string;
  bookCount: string;
}

// Response interface
export interface AnalyticsResponse {
  message?: string;
  success?: boolean;
  data: UserAnalytics[];
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUserAnalytics: builder.query<UserAnalytics[], void>({
      query: () => ({
        url: '/analytics/admin',
        method: 'GET',
      }),
      // Refresh every 5 minutes
      keepUnusedDataFor: 300,
      providesTags: ['Users'],
    }),
  }),
});

export const { useGetAllUserAnalyticsQuery } = analyticsApi; 