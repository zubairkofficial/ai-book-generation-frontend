import { baseApi } from './baseApi'; // Correct import
import { RootState } from '@/store/store';

interface Book {
  id: string;
  title: string;
  author: string;
  publishedYear: number;
}

interface GenerateBookRequest {
  bookTitle: string;
  genre: string;
  theme: string;
  characters: string;
  setting: string;
  tone: string;
  plotTwists: string;
  numberOfPages: number;
  numberOfChapters: number;
  targetAudience: string;
  language: string;
  additionalContent?: string;
}

interface GenerateBookResponse {
  bookContent: string;
}

interface FetchBooksResponse {
  books: Book[];
}

export const bookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint to fetch all books
    fetchBooks: builder.query<FetchBooksResponse, void>({
      query: () => ({
        url: '/book-generation/all',
        method: 'GET',
      }),
    }),

    // Endpoint to generate a new book
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
  useFetchBooksQuery, // Hook to fetch all books
  useGenerateBookMutation, // Hook to generate a new book
} = bookApi;
