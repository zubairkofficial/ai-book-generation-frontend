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
  cardNumber:string;
    cardHolderName:string;
    amount: number;
    currency: string;
    cvc?: string;
    expiryMonth?: number;
    expiryYear?: number;
    saveCard:boolean
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
  status:string;
}

// Payment with existing card request interface
export interface ExistingCardPaymentRequest {
  amount: number;
  saveCard:boolean;
  // Add any other fields needed for the request
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a payment
    createPayment: builder.mutation<any, CreatePaymentRequest>({
      query: (payload) => ({
        url: '/payments/token',
        method: 'POST',
        body: payload,
      }),
    }),

    // Make payment with existing card
    payWithExistingCard: builder.mutation<any, { cardId: number; payload: ExistingCardPaymentRequest }>({
      query: ({ cardId, payload }) => ({
        url: `/payments/exist-card/${cardId}`,
        method: 'POST',
        body: payload,
      }),
    }),

    // New endpoint to get saved cards
    getSavedCards: builder.query<SavedCard[], void>({
      query: () => ({
        url: '/payments/card',
        method: 'GET',
      }),
    }),

    // Delete a saved card
    deleteCard: builder.mutation<{ success: boolean }, number>({
      query: (cardId) => ({
        url: `/payments/card/${cardId}`,
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