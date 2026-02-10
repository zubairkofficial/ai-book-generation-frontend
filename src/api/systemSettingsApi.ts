import { baseApi } from './baseApi';

export interface SystemSetting {
    key: string;
    value: string;
    description?: string;
}

export const systemSettingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSystemSettings: builder.query<SystemSetting[], void>({
            query: () => '/system-settings',
            providesTags: ['SystemSettings'],
        }),
        updateSystemSetting: builder.mutation<SystemSetting, { key: string; value: string }>({
            query: ({ key, value }) => ({
                url: `/system-settings/${key}`,
                method: 'PUT',
                body: { value },
            }),
            invalidatesTags: ['SystemSettings'],
        }),
        getPublicPaymentFee: builder.query<{ fee: number }, void>({
            query: () => '/system-settings/public/payment-fee',
        }),
    }),
});

export const {
    useGetSystemSettingsQuery,
    useUpdateSystemSettingMutation,
    useGetPublicPaymentFeeQuery,
} = systemSettingsApi;
