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
    console.log("token",token)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced base query with error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result:any = await baseQuery(args, api, extraOptions);

  // Check for 401 Unauthorized errors
  if (result.error?.status === 401) {
    // Dispatch the logout action
    toast.error(result.error.message);

    api.dispatch(logout());
    // Show a toast message
    
    // Optionally, redirect the user to the login page
    // You can use a redirect library like react-router-dom here
  }

  return result;
};

// Create the API with the enhanced base query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});