import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi'; // Ensure this path is correct
import authReducer from '../features/auth/authSlice';
import { subscriptionApi } from '@/api/subscriptionApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
   },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware,
      subscriptionApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
