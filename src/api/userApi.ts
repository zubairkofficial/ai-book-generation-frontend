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
  }),
});

export const { useUserMeQuery, useUpdateUserMutation } = userMeApi;