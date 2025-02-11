import {  ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2, Eye,  Search } from 'lucide-react'; // Import Eye icon
import Layout from '@/components/layout/Layout';
import { useFetchBooksQuery } from '@/api/bookApi';
import BookModal from '@/components/BookModel/BookModel';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BASE_URl } from '@/constant';

interface BookData {
  id: number;
  bookTitle: string;
  authorName?: string;
  genre?: string;
  additionalData: {
    content: string;
    fullContent?: string;
    coverImageUrl?: string;
    backCoverImageUrl?: string;
    coverImagePath?: string;
  
  };
  // ... other properties
}

export default function BookTable() {
  const { data:allBookData, isLoading, isError, error, refetch: refetchAllBooks }:any = useFetchBooksQuery();
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null);
  const [searchParams, setSearchParams] = useState<{ [key: string]: string }>({});

  // const { data: searchData } = useSearchBookQuery({ userId: user.id, searchParams }); // Fetch books with the hook
  // console.log("searchData", searchData)
  // Handle the error case
  if (isError) {
    toast.error(error?.data?.message || 'An error occurred');
  }
  useEffect(() => {
    refetchAllBooks()
  }, [])

  // Pagination logic



  // Open modal with book details
  const openModal = (book: BookData) => {
    setSelectedBook(book);
  };

  // Close modal
  const closeModal = () => {
    setSelectedBook(null);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("e", e.target.value)
    setSearchParams({ ...searchParams, query: e.target.value }); // Update searchParams with the query value
  }

  return (
    <Layout>
      <Header />
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <ToastContainer />
        
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Books Collection</h1>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search books..."
                className="pl-10"
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {allBookData?.data?.map((book: BookData) => (
              <Card 
                key={book.id}
                className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                onClick={() => openModal(book)}
              >
                {/* Book Cover */}
                <div className="aspect-w-3 aspect-h-4 relative overflow-hidden">
                  <img
                    src={`${BASE_URl}/uploads/${book.additionalData.coverImageUrl}`}
                    alt={book.bookTitle}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-200"
                  />
                  {/* Overlay with Quick Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(book);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                    {book.bookTitle}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {book.authorName}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                      {book.genre}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Book Modal */}
        {selectedBook && (
          <BookModal
            isOpen={!!selectedBook}
            onClose={closeModal}
            htmlContent={selectedBook.additionalData?.fullContent}
            coverImageUrl={selectedBook.additionalData?.coverImageUrl}
            backCoverImageUrl={selectedBook.additionalData?.backCoverImageUrl}
            selectedBook={selectedBook}
          />
        )}
      </div>
    </Layout>
  );
}