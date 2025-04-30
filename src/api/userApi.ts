import { UserInterface } from './../interfaces/user.interface.d';
// api/userApi.ts
import { baseApi } from './baseApi';
import {  UpdateUserPayload } from '../interfaces/user.interface';

export const userMeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userMe: builder.query<UserInterface, void>({
      query: () => ({
        url: '/users/me',
        method: 'GET',
      }),
    }),
    updateUser: builder.mutation<UserInterface, UpdateUserPayload>({
      query: (payload) => ({
        url: '/users/me',
        method: 'PATCH',
        body: payload,
      }),
    }),
    getUserStats: builder.query<{
      user: UserInterface;
      stats: {
        totalBooks: number;
        completed: number;
        inProgress: number;
      }
    }, void>({
      query: () => ({
        url: '/users/me/stats',
        method: 'GET',
      }),
    }),
    getFreeSubscriptionUsers: builder.query<any[], void>({
      query: () => ({
        url: '/users/free-subscription',
        method: 'GET',
      }),
    }),
  }),
});

export const { useUserMeQuery, useUpdateUserMutation, useGetUserStatsQuery, useGetFreeSubscriptionUsersQuery } = userMeApi;