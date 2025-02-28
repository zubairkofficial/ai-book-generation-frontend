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
 
  minWords: number;
  maxWords: number;
  chapterNo:number;
  bookGenerationId:number,
  additionalInfo?:string,
}
export interface UpdateBookGenerateRequest {
  chapterNo: number;
  bookGenerationId: number;
  updateContent: string;
}

interface GenerateBookResponse {
  bookContent: string;
}

// Add new enum for book status
export enum BookStatus {
  ALL = 'all',
  DRAFT = 'draft',
  COMPLETE = 'complete'
}

// Add interface for delete response
interface DeleteBookResponse {
  success: boolean;
  message: string;
}

// Modify FetchBooksResponse to include status
interface FetchBooksResponse {
  books: Book[];
  status?: BookStatus;
}

interface StreamChapterResponse {
  data: string;
}

// Update the mutation return type
interface UpdateChapterResponse {
  statusCode: number;
  message: string;
  data: {
    content: string;
    // Add other expected response fields
  };
}

// Add new interfaces for style updates
interface TextStyle {
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  fontSize: string;
  fontFamily: string;
  color: string;
  lineHeight: string;
  letterSpacing: string;
}

interface UpdateStyleRequest {
  bookId: number;
  pageType: string;
  chapterNo?: number;
  style: TextStyle;
}

interface UpdateImageRequest {
  bookId: number;
  imageType: 'cover' | 'backCover';
  image: File;
}

export const bookApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint to fetch all books
    fetchBooks: builder.query<FetchBooksResponse, { status?: BookStatus }>({
      query: () => ({
        url: '/book-generation/all',
        method: 'GET',
      }),
    }),
    fetchBooksByType: builder.query<FetchBooksResponse, { status?: BookStatus }>({
      query: ({ status = BookStatus.DRAFT }) => ({
        url: `/book-generation/${status}`,
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
        url: '/book-chapter/chapter/create',
        method: 'POST',
        body: payload,
      }),
    }),

    updateChapter: builder.mutation<UpdateChapterResponse, UpdateBookGenerateRequest>({
      query: (payload) => ({
        url: '/book-chapter/update-chapter',
        method: 'PUT',
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

    // New endpoint to delete a book
    deleteBook: builder.mutation<DeleteBookResponse, number>({
      query: (bookId) => ({
        url: `/book-generation/${bookId}`,
        method: 'DELETE',
      }),
      // Invalidate the fetchBooks cache when a book is deleted
    }),

    // Add new endpoint to fetch a book by ID
    fetchBookById: builder.query<any, number>({
      query: (bookId) => ({
        url: `/book-generation/${bookId}`,
        method: 'GET',
      }),
    }),

    // Add new endpoint for style updates
    updateStyle: builder.mutation<any, UpdateStyleRequest>({
      query: (payload) => ({
        url: '/book-generation/update-style',
        method: 'PUT',
        body: payload,
      }),
    }),

    // Add new endpoint for image updates
    updateImage: builder.mutation<any, UpdateImageRequest>({
      query: (payload) => {
        const formData = new FormData();
        formData.append('bookId', payload.bookId.toString());
        formData.append('imageType', payload.imageType);
        formData.append('image', payload.image);

        return {
          url: '/book-generation/update-image',
          method: 'PUT',
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useFetchBooksQuery, // Hook to fetch all books
  useFetchBooksByTypeQuery, // Hook to fetch all books
  useGenerateBookMutation, // Hook to generate a new book
  useCreateChapterMutation, // Hook to generate a new book
  useUpdateChapterMutation, // Hook to generate a new book
  useSearchBookQuery, // Hook to search books
  useStreamChapterQuery,
  useDeleteBookMutation, // New hook for delete functionality
  useFetchBookByIdQuery, // Add this export
  useUpdateStyleMutation,
  useUpdateImageMutation,
} = bookApi;
