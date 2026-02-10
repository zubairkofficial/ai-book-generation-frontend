import { baseApi } from './baseApi';

// Payment plan interface
export interface PaymentPlan {
  id: number;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popularPlan?: boolean;
}

// Payment request interface
export interface CreatePaymentRequest {
  cardNumber: string;
  cardHolderName: string;
  amount: number;
  currency?: string;
  cvc?: string;
  expiryMonth?: number;
  expiryYear?: number;
  saveCard: boolean;
  isFree: boolean;
}

// Card interface
export interface SavedCard {
  id: string;
  cardNumber: string; // Likely masked/last 4 digits only
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  brand?: string;
  isDefault?: boolean;
  status: string;
}

// Payment with existing card request interface
export interface ExistingCardPaymentRequest {
  amount: number;
  saveCard: boolean;
  isFree: boolean;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a payment
    createPayment: builder.mutation<any, CreatePaymentRequest>({
      query: (payload) => ({
        url: '/card-payments/process',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User', 'Subscription'],
    }),

    // Make payment with existing card
    payWithExistingCard: builder.mutation<any, { cardId: number; payload: ExistingCardPaymentRequest }>({
      query: ({ cardId, payload }) => ({
        url: `/card-payments/exist-card/${cardId}`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User', 'Subscription'],
    }),

    // New endpoint to get saved cards
    getSavedCards: builder.query<SavedCard[], void>({
      query: () => ({
        url: '/card-payments/card',
        method: 'GET',
      }),
    }),

    // Delete a saved card
    deleteCard: builder.mutation<{ success: boolean }, number>({
      query: (cardId) => ({
        url: `/card-payments/card/${cardId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetSavedCardsQuery,
  useDeleteCardMutation,
  usePayWithExistingCardMutation,
} = paymentApi; 