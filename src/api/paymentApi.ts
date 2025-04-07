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

   
  }),
});

export const {
  
  useCreatePaymentMutation,
 
} = paymentApi; 