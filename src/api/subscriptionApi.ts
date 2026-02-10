import { baseApi } from './baseApi';

export interface SubscriptionPackage {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  name: string;
  description: string;
  price: string;
  durationDays: number;
  tokenLimit: number;
  totalTokens: number;
  imageLimit: number;
  modelType: string;
  imageModelType: string;
  imageModelURL?: string;
  isActive: boolean;
  isFree: boolean;
  features: Record<string, string>;
}

export interface SubscriptionUsage {
  package: SubscriptionPackage;
  tokensUsed: number;
  tokenLimit: number;
  imagesGenerated: number;
  imageLimit: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export interface SubscribeRequest {
  packageId: number;
  cancelExisting: boolean;
  autoRenew: boolean;
  paymentMethod?: 'credit' | 'card';
}

export interface SubscriptionResponse {
  id: number;
  userId: number;
  packageId: number;
  startDate: string;
  endDate: string;
  status: string;
  package: SubscriptionPackage;
}

export interface CreatePackageRequest {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  tokenLimit: number;
  imageLimit: number;
  modelType: string;
  imageModelType: string;
  imageModelURL?: string;
  isActive: boolean;
  features: Record<string, string>;
}

export interface UpdatePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  tokenLimit?: number;
  imageLimit?: number;
  modelType?: string;
  imageModelType?: string;
  imageModelURL?: string;
  isActive?: boolean;
  features?: Record<string, string>;
}

export interface FreeSubscriptionUpdateRequest {
  userId: number;
  startDate?: string;
  endDate?: string;
  tokenLimit?: number;
  imageLimit?: number;
  status?: string;
  fullModelAccess?: boolean;
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSubscriptionPackage: builder.mutation<SubscriptionPackage, CreatePackageRequest>({
      query: (payload) => ({
        url: '/subscription/packages',
        method: 'POST',
        body: payload,
      }),
    }),

    getSubscriptionPackages: builder.query<SubscriptionPackage[], { includeInactive?: boolean } | void>({
      query: (params = {}) => ({
        url: '/subscription/packages',
        method: 'GET',
        params,
      }),
    }),

    getCurrentSubscription: builder.query<SubscriptionUsage[], void>({
      query: () => ({
        url: '/subscription/my-subscription',
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    subscribeToPackage: builder.mutation<SubscriptionResponse, SubscribeRequest>({
      query: (payload) => ({
        url: '/subscription/purchase',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User', 'Subscription'],
    }),

    cancelSubscription: builder.mutation<{ success: boolean }, number>({
      query: (subscriptionId) => ({
        url: `/subscription/${subscriptionId}/cancel`,
        method: 'POST',
      }),
    }),

    deleteSubscriptionPackage: builder.mutation<{ success: boolean }, number>({
      query: (packageId) => ({
        url: `/subscription/packages/${packageId}`,
        method: 'DELETE',
      }),
    }),

    updateSubscriptionPackage: builder.mutation<SubscriptionPackage, { id: number; payload: UpdatePackageRequest }>({
      query: ({ id, payload }) => ({
        url: `/subscription/packages/${id}`,
        method: 'PUT',
        body: payload,
      }),
    }),

    unsubscribeFromPackage: builder.mutation<{ success: boolean }, number>({
      query: (packageId) => ({
        url: `/subscription/unsubscribe/${packageId}`,
        method: 'POST',
      }),
    }),

    createAndUpdateFreeSubscription: builder.mutation<any, FreeSubscriptionUpdateRequest>({
      query: (payload) => ({
        url: '/subscription/free-subscription',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetSubscriptionPackagesQuery,
  useGetCurrentSubscriptionQuery,
  useSubscribeToPackageMutation,
  useCancelSubscriptionMutation,
  useCreateSubscriptionPackageMutation,
  useDeleteSubscriptionPackageMutation,
  useUpdateSubscriptionPackageMutation,
  useUnsubscribeFromPackageMutation,
  useCreateAndUpdateFreeSubscriptionMutation,
} = subscriptionApi; 