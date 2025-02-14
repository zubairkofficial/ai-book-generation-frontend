import { ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { Loader2, Eye, Search, Filter, Plus, BookOpen } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useFetchBooksQuery } from '@/api/bookApi';
import BookModal from '@/components/BookModel/BookModel';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BASE_URl } from '@/constant';
import { useNavigate } from 'react-router-dom';

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
  const navigate=useNavigate()
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
    setSearchParams({ ...searchParams, query: e.target.value }); // Update searchParams with the query value
  }

  return (
    <Layout>
      {/* <Header /> */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
          <ToastContainer />
          
          {/* Enhanced Header Section */}
          <div className="mb-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  My Books Collection
                </h1>
                <p className="text-sm text-gray-600">
                  Manage and organize your book collection
                </p>
              </div>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm" onClick={()=>navigate("/books/add")}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Book
              </Button>
            </div>

            {/* Enhanced Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search by title, author, or genre..."
                  className="pl-10 w-full"
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-amber-500" size={40} />
              <p className="text-gray-600">Loading your books...</p>
            </div>
          ) : allBookData?.data?.length === 0 ? (
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-64 space-y-4 text-center"
            >
              <BookOpen className="w-16 h-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900">No Books Found</h3>
              <p className="text-gray-600 max-w-md">
                Start your journey by creating your first book or try a different search term.
              </p>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                Create Your First Book
              </Button>
            </motion.div>
          ) : (
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {allBookData?.data?.map((book: BookData) => (
                <motion.div
                  key={book.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden bg-white"
                    onClick={() => openModal(book)}
                  >
                    {/* Enhanced Book Cover */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                      <img
                        src={`${BASE_URl}/uploads/${book.additionalData.coverImageUrl}`}
                        alt={book.bookTitle}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Enhanced Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="absolute inset-0 flex items-center justify-center gap-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white hover:bg-gray-50 shadow-sm"
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
                    </div>

                    {/* Enhanced Book Info */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {book.bookTitle}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {book.authorName || 'Unknown Author'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {book.genre && (
                          <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                            {book.genre}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
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
      </motion.div>
    </Layout>
  );
}