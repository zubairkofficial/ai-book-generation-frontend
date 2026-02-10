import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store/store';
import { BASE_URl } from '@/constant';
import { logout } from '@/features/auth/authSlice';
import { toast } from 'react-toastify';

// Define a custom base query with error handling
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced base query with error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result: any = await baseQuery(args, api, extraOptions);

  // Check for 401 Unauthorized errors
  // Check for 401 Unauthorized errors
  if (result.error?.status === 401) {
    const requestUrl = typeof args === 'string' ? args : args.url;

    // Skip global 401 handling for auth endpoints where 401 is a valid business logic response (e.g. invalid credentials)
    const isAuthEndpoint = requestUrl.includes('/auth/signin') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/verify-otp');

    if (!isAuthEndpoint) {
      const errorMessage = (result.error.data as any)?.message || "Session expired. Please login again.";
      toast.error(errorMessage);
      api.dispatch(logout());
    }
  }

  return result;
};

// Create the API with the enhanced base query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Settings', 'SystemSettings', 'User', 'Users', 'Subscription'],
  endpoints: () => ({}),
});