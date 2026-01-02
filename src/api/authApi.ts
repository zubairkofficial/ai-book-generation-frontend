import { baseApi } from './baseApi'; // Correct import

interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: { id: string; email: string; name: string; role: string };
  token: string;
  message: string;
  accessToken: string;
  shouldRedirect?: boolean;
}

interface ResetPasswordRequest {
  email: string;
}

interface UpdatePasswordRequest {
  userId: string;
  newPassword: string;
}

interface EnableTwoFactorRequest {
  userId: string;
}

interface VerifyTwoFactorRequest {
  userId: string;
  token: string;
}



interface ResendVerificationRequest {
  email: string;
}

interface PasswordResetRequest {
  token: string;
  newPassword: string;
}

interface GenerateOTPRequest {
  email: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface GenerateBookRequest {
  bookTitle: string;
  genre: string;
  characters: string;
  targetAudience: string;
  language: string;
  additionalContent?: string;
}

interface GenerateBookResponse {
  bookContent: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signUp: builder.mutation<AuthResponse, SignUpRequest>({
      query: (credentials) => ({
        url: '/auth/signup',
        method: 'POST',
        body: credentials,
      }),
    }),

    signIn: builder.mutation<AuthResponse, SignInRequest>({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (email) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { email },
      }),
    }),

    passwordReset: builder.mutation<void, PasswordResetRequest>({
      query: ({ token, newPassword }) => ({
        url: '/auth/password-reset',
        method: 'POST',
        body: { token, newPassword },
      }),
    }),

    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    verifyEmail: builder.mutation({
      query: ({ token }) => ({
        url: `/auth/verify-email?token=${encodeURIComponent(token)}`,
        method: 'GET',
      }),
    }),

    resendVerification: builder.mutation<void, ResendVerificationRequest>({
      query: ({ email }) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: { email },
      }),
    }),

    updatePassword: builder.mutation<void, UpdatePasswordRequest>({
      query: ({ userId, newPassword }) => ({
        url: '/auth/update-password',
        method: 'POST',
        body: { userId, newPassword },
      }),
    }),

    enableTwoFactor: builder.mutation<void, EnableTwoFactorRequest>({
      query: (userId) => ({
        url: '/auth/enable-2fa',
        method: 'POST',
        body: { userId },
      }),
    }),

    verifyTwoFactor: builder.mutation<void, VerifyTwoFactorRequest>({
      query: ({ userId, token }) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body: { userId, token },
      }),
    }),

    generateOTP: builder.mutation<void, GenerateOTPRequest>({
      query: ({ email }) => ({
        url: '/auth/generate-otp',
        method: 'POST',
        body: { email },
      }),
    }),

    verifyOTP: builder.mutation<void, VerifyOTPRequest>({
      query: ({ email, otp }) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: { email, otp },
      }),
    }),

    // refreshToken: builder.mutation<AuthResponse, RefreshTokenRequest>({
    //   query: (refreshToken) => ({
    //     url: '/auth/refresh-token',
    //     method: 'POST',
    //     body: { refreshToken },
    //   }),
    // }),

    generateBook: builder.mutation<GenerateBookResponse, GenerateBookRequest>({
      query: (payload) => ({
        url: '/book-generation/generate',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useSignUpMutation,
  useSignInMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useEnableTwoFactorMutation,
  useVerifyTwoFactorMutation,
  // useRefreshTokenMutation,
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  usePasswordResetMutation,
  useGenerateOTPMutation,
  useVerifyOTPMutation,
  useGenerateBookMutation,
  useResendVerificationMutation,
} = authApi;