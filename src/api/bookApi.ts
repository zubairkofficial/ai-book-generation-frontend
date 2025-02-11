import { baseApi } from './baseApi'; // Correct import

interface Book {
  id: string;
  title: string;
  author: string;
  publishedYear: number;
}

interface SearchRequest {
  genre?: string;
  bookTitle?: string;
  theme?: string;
  characters?: string;
  setting?: string;
  tone?: string;
  plotTwists?: string;
  numberOfPages?: number;
  numberOfChapters?: number;
  targetAudience?: string;
  language?: string;
  additionalContent?: string;
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
interface CreateBookGenerateRequest {
 
  minCharacters: number;
  maxCharacters: number;
  chapterNo:number;
  bookGenerationId:number
}

interface GenerateBookResponse {
  bookContent: string;
}

interface FetchBooksResponse {
  books: Book[];
}

interface StreamChapterResponse {
  data: string;
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
    createChapter: builder.mutation<GenerateBookResponse, CreateBookGenerateRequest>({
      query: (payload) => ({
        url: '/book-generation/chapter/create',
        method: 'POST',
        body: payload,
      }),
    }),

    // Endpoint to search books
    searchBook: builder.query<FetchBooksResponse, { userId: number; searchParams:SearchRequest }>({
      query: ({ userId, searchParams }) => ({
        url: `/book-generation/search-by-id`,
        method: 'GET',
        params: { userId, ...searchParams },
      }),
    }),

    streamChapter: builder.query<StreamChapterResponse, void>({
      query: () => ({
        url: '/book-generation/chapter/stream-from-llm',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useFetchBooksQuery, // Hook to fetch all books
  useGenerateBookMutation, // Hook to generate a new book
  useCreateChapterMutation, // Hook to generate a new book
  useSearchBookQuery, // Hook to search books
  useStreamChapterQuery,
} = bookApi;
