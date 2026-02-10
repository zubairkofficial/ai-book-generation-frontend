import { baseApi } from './baseApi';
import { User } from '@/features/auth/authSlice';

interface CreateUserRequest {
    name: string;
    email: string;
    password?: string;
    initialCreditAmount?: number;
}

interface UserListResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<UserListResponse, { page: number; limit: number; status?: string }>({
            query: ({ page, limit, status }) => ({
                url: `/admin/users`,
                params: { page, limit, status },
            }),
            providesTags: ['Users'],
        }),

        createUser: builder.mutation<{ message: string; user: User }, CreateUserRequest>({
            query: (body) => ({
                url: '/admin/users',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Users'],
        }),

        approveUser: builder.mutation<{ message: string; initialCredit: number }, { id: number; initialCreditAmount?: number }>({
            query: ({ id, initialCreditAmount }) => ({
                url: `/admin/users/${id}/approve`,
                method: 'POST',
                body: { initialCreditAmount },
            }),
            invalidatesTags: ['Users'],
        }),

        rejectUser: builder.mutation<{ message: string }, { id: number; reason?: string }>({
            query: ({ id, reason }) => ({
                url: `/admin/users/${id}/reject`,
                method: 'POST',
                params: { reason },
            }),
            invalidatesTags: ['Users'],
        }),

        blockUser: builder.mutation<{ message: string }, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/users/${id}/block`,
                method: 'POST',
            }),
            invalidatesTags: ['Users'],
        }),

        unblockUser: builder.mutation<{ message: string }, { id: number }>({
            query: ({ id }) => ({
                url: `/admin/users/${id}/unblock`,
                method: 'POST',
            }),
            invalidatesTags: ['Users'],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useApproveUserMutation,
    useRejectUserMutation,
    useBlockUserMutation,
    useUnblockUserMutation,
} = adminApi;