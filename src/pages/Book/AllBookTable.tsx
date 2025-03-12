import { ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { Loader2, Eye, Search,  Plus, BookOpen, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useFetchBooksQuery, useDeleteBookMutation, BookStatus, useFetchBooksByTypeQuery } from '@/api/bookApi';
import BookModal from '@/components/BookModel/BookModel';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BASE_URl, ToastType } from '@/constant';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';

interface BookData {
  id: number;
  bookTitle: string;
  authorName?: string;
  genre?: string;
  type?: string;
  numberOfChapters: number;
  bookChapter?: any[];
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
  const {addToast}=useToast()
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>(BookStatus.ALL);
  const { data: allBookData, isLoading, isError, error, refetch: refetchAllBooks }:any = useFetchBooksQuery({});
  const { data: filterBookData }:any = useFetchBooksByTypeQuery({ status: selectedStatus });
  const [searchParams, setSearchParams] = useState<{ [key: string]: string }>({});
  const [deleteBook] = useDeleteBookMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);

  // const { data: searchData } = useSearchBookQuery({ userId: user.id, searchParams }); // Fetch books with the hook
  // console.log("searchData", searchData)
  // Handle the error case
  if (isError) {
    addToast(error?.data?.message || 'An error occurred',ToastType.ERROR);
  }
  useEffect(() => {
    if (selectedStatus === BookStatus.ALL) {
      refetchAllBooks();
    }
  }, [selectedStatus]);

  // Pagination logic





  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, query: e.target.value }); // Update searchParams with the query value
  }

  const handleStatusChange = (value: BookStatus) => {
    setSelectedStatus(value);
  };

  const handleDeleteBook = async (bookId: number) => {
    setBookToDelete(bookId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bookToDelete) {
      try {
        await deleteBook(bookToDelete).unwrap();
        addToast('Book deleted successfully',ToastType.SUCCESS);
        refetchAllBooks()
        setIsDeleteDialogOpen(false);
        setBookToDelete(null);
      } catch (error:any) {
        addToast(error?.message,ToastType.ERROR);
      }
    }
  };

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
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BookStatus.ALL}>All Books</SelectItem>
                  <SelectItem value={BookStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={BookStatus.COMPLETE}>Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-amber-500" size={40} />
              <p className="text-gray-600">Loading your books...</p>
            </div>
          ) : (selectedStatus === BookStatus.ALL ? allBookData?.data : filterBookData?.data)?.length === 0 ? (
            
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
              <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={()=>navigate("/books/add")}>
                Create Your First Book
              </Button>
            </motion.div>
          ) : (
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {(selectedStatus === BookStatus.ALL ? allBookData?.data : filterBookData?.data)?.map((book: BookData) => (
                <motion.div
                  key={book.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      if (book.type === "incomplete") {
                        // Calculate next chapter to generate
                        const nextChapter = (book?.bookChapter?.length ?? 0) + 1;
                        
                        // Navigate to chapter configuration with the book data and next chapter
                        navigate(`/books/add`, { 
                          state: { 
                            previousContent: JSON.stringify(book), 
                            initialChapter: nextChapter 
                          } 
                        });
                      } else {
                        // For complete books, navigate to book modal as before
                        navigate(`/book-modal?id=${book.id}`);
                      }
                    }}
                  >
                    {/* Book cover image */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                      <img
                        src={`${BASE_URl}/uploads/${book.additionalData.coverImageUrl}`}
                        alt={book.bookTitle}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Status indicator overlay for incomplete books */}
                      {book.type === "incomplete" && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-white rounded-full px-2 py-1 text-xs font-bold shadow-md">
                          In Progress
                        </div>
                      )}
                      {/* Regular overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="absolute inset-0 flex items-center justify-center gap-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="bg-white hover:bg-gray-50 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/book-modal?id=${book.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Book info */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-amber-600 transition-colors w-full">
                        {book.bookTitle}
                      </h3>

                      <p className="text-sm text-gray-600 line-clamp-1">
                        {book.authorName || 'Unknown Author'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {book.genre && (
                          <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full truncate w-full">
                            {book.genre}
                          </span>
                        )}
                        
                        {/* Status badge with progress */}
                        {book.type === "incomplete" && (
                          <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full truncate w-full">
                            Incomplete ({book.bookChapter?.length || 0}/{book.numberOfChapters} chapters)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBook(book.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

         
               <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setBookToDelete(null);
            }}
            onConfirm={confirmDelete}
            title="Delete Book"
            description="Are you sure you want to delete this book? This action cannot be undone."
          />
        </div>
      </motion.div>
    </Layout>
  );
}