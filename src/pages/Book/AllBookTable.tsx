import { ChangeEvent, MouseEvent, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import {
  Book,
  BookOpen,
  Download,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import {
  useFetchBooksQuery,
  useDeleteBookMutation,
  BookStatus,
  useFetchBooksByTypeQuery,
} from "@/api/bookApi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BASE_URl, ToastType } from "@/constant";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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
  glossary?: string;
  index?: string;
  references?: string;
  // ... other properties
}

export default function BookTable() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [selectedStatus, setSelectedStatus] = useState<BookStatus>(
    BookStatus.ALL
  );
  const {
    data: allBookData,
    isLoading,
    isError,
    error,
    refetch: refetchAllBooks,
  }: any = useFetchBooksQuery({});

  const { data: filterBookData }: any = useFetchBooksByTypeQuery({
    status: selectedStatus,
  });
  const [searchParams, setSearchParams] = useState<{ [key: string]: string }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteBook] = useDeleteBookMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBookLoading, setIsBookLoading] = useState(false);
  const [loadingBookId, setLoadingBookId] = useState<number | null>(null);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  // Handle the error case
  if (isError) {
    addToast(error?.data?.message || "An error occurred", ToastType.ERROR);
  }
  useEffect(() => {
    if (selectedStatus === BookStatus.ALL) {
      refetchAllBooks();
    }
  }, [selectedStatus]);

  useEffect(() => {
    refetchAllBooks();
  }, []);

  // Pagination logic


  const handleDownload = async (e: MouseEvent, bookId: number) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      console.log(`Attempting to download PDF for book ID: ${bookId}`);
      
      // Create a direct link to download the PDF
      const pdfUrl = `${BASE_URl}/pdf/generate/${bookId}`;
      console.log(`PDF URL: ${pdfUrl}`);
      
      // Option 1: Using window.open for direct download
      window.open(pdfUrl, '_blank');
      
      // Alternative option using Axios (if window.open doesn't work)
      /*
      const response = await axios.get(pdfUrl, {
        responseType: 'blob',
        timeout: 60000, // 60 second timeout
        onDownloadProgress: (progressEvent) => {
          console.log(`Download progress: ${progressEvent.loaded} bytes`);
        }
      });
      
      console.log('Response received:', response.status, response.headers);
      
      if (response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `book_${bookId}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Empty response data');
        throw new Error('Empty response from server');
      }
      */
      
      addToast("PDF download initiated. Check your browser downloads.", ToastType.SUCCESS);
    } catch (error: any) {
      console.error("Download error details:", error);
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
        addToast(`Error ${error.response.status}: ${error.response.statusText}`, ToastType.ERROR);
      } else if (error.request) {
        console.error("Request error - no response received");
        addToast("No response received from server. The PDF might be too large or the server timed out.", ToastType.ERROR);
      } else {
        console.error("Error message:", error.message);
        addToast(error.message || "Failed to download PDF", ToastType.ERROR);
      }
    } finally {
      setIsDownloading(false);
    }
  };
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setSearchParams({ ...searchParams, query });
  };

  // Filter books based on search term
  const filteredBooks = useMemo(() => {
    const books =
      selectedStatus === BookStatus.ALL
        ? allBookData?.data
        : filterBookData?.data;

    if (!books || !searchTerm.trim()) {
      return books;
    }

    const term = searchTerm.toLowerCase().trim();
    return books.filter(
      (book: BookData) =>
        book.bookTitle?.toLowerCase().includes(term) ||
        book.authorName?.toLowerCase().includes(term) ||
        book.genre?.toLowerCase().includes(term)
    );
  }, [selectedStatus, allBookData, filterBookData, searchTerm]);
  const handleStatusChange = (value: BookStatus) => {
    setSelectedStatus(value);
  };

  const handleDeleteBook = async (bookId: number) => {
    setBookToDelete(bookId);
    setIsDeleteDialogOpen(true);
  };

  const handlePreview = async (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    book: BookData
  ) => {
    e.stopPropagation();

    // Set the current book as loading
    setIsBookLoading(true);
    setLoadingBookId(book.id);
console.log("first+++++++++", book.type === "complete" &&
  !book.glossary &&
  !book.index &&
  !book.references)
    if (
      book.type === "complete" &&
      !book.glossary &&
      !book.index &&
      !book.references
    ) {
      try {
        // Use Promise.race with a timeout to handle long-running requests
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000)
        );

        // await Promise.race([
        //   fetchBookEndContent(book.id).unwrap(),
        //   timeoutPromise,
        // ]);
        // await refetchBook();
        navigate(`/book-modal?id=${book.id}`);
      } catch (error: any) {
        if (error.message === "Request timeout") {
          addToast(
            "Request is taking longer than expected. Please try again.",
            ToastType.WARNING
          );
        } else {
          addToast(
            error?.data?.message || "Failed to fetch book end content",
            ToastType.ERROR
          );
        }
      } finally {
        setIsBookLoading(false);
        setLoadingBookId(null);
      }
    } else {
      navigate(`/book-modal?id=${book.id}`);
      setIsBookLoading(false);
      setLoadingBookId(null);
    }
  };

  const confirmDelete = async () => {
    if (bookToDelete) {
      try {
        await deleteBook(bookToDelete).unwrap();
        addToast("Book deleted successfully", ToastType.SUCCESS);
        refetchAllBooks();
        setIsDeleteDialogOpen(false);
        setBookToDelete(null);
      } catch (error: any) {
        addToast(error?.message, ToastType.ERROR);
      }
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
          {/* Enhanced Header Section with gradient background */}
          <div className="mb-8 space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <Book className="w-8 h-8 mr-3 text-amber-500" />
                    My Books Collection
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage, organize and create your book collection
                  </p>
                </div>
               {/* {user?.role==="user" && */}
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/books/add")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Book
                </Button>
                {/* } */}
              </div>
            </div>

            {/* Enhanced Search and Filter with animated borders */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm border border-amber-100/50">
              <div className="relative flex-1 group">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors"
                  size={20}
                />
                <Input
                  placeholder="Search by title, author, or genre..."
                  className="pl-10 w-full border-gray-200 focus:border-amber-300 focus:ring-amber-200 transition-all duration-300"
                  onChange={handleSearch}
                />
              </div>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] border-gray-200 focus:border-amber-300 focus:ring-amber-200 transition-all">
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
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 space-y-4"
              >
                <div className="p-3 bg-amber-50 rounded-full">
                  <Loader2 className="animate-spin text-amber-500" size={40} />
                </div>
                <p className="text-gray-600 font-medium">
                  Loading your books...
                </p>
              </motion.div>
            ) : filteredBooks?.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 space-y-4 text-center"
              >
                <div className="p-6 bg-amber-50 rounded-full mb-2">
                  <BookOpen className="w-16 h-16 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  No Books Found
                </h3>
                <p className="text-gray-600 max-w-md">
                  {searchTerm
                    ? "No results found for your search. Try different keywords."
                    : "Start your journey by creating your first book."}
                </p>
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white mt-4 shadow-md transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/books/add")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Book
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="books"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {filteredBooks.length}{" "}
                  {filteredBooks.length === 1 ? "Book" : "Books"}{" "}
                  {searchTerm ? "Found" : ""}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredBooks?.map((book: BookData) => (
                    <motion.div
                      key={book.id}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border border-gray-100"
                        onClick={async (e) => {
                          e.preventDefault();
                          const nextChapter =
                          (book?.bookChapter?.length ?? 0) + 1;
                         if (book.type === "incomplete"&&(nextChapter<=book?.numberOfChapters)) {
                             return navigate(`/books/chapter-configuration`, {
                              state: {
                                previousContent: JSON.stringify(book),
                                initialChapter: nextChapter,
                              },
                            });
                          } else if(book.type === "incomplete" &&
                            !(!!book?.glossary &&
                            !!book?.index &&
                            !!book?.references)) {
    const nextChapter =
    (book?.bookChapter?.length ?? 0) + 1;

    return navigate(`/books/chapter-configuration`, {
      state: {
        previousContent: JSON.stringify(book),
        initialChapter: nextChapter,
      },
    });
                            // navigate(`/book-modal?id=${book.id}`);
                          }else {
                            navigate(`/book-modal?id=${book.id}`);
                            setIsBookLoading(false);
                            setLoadingBookId(null);
                          }
                        }}
                      >
                        {/* Book cover image with enhanced effects */}
                        <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
                          {isBookLoading && loadingBookId === book.id ? (
                            // Skeleton loader for the book cover when loading
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 animate-pulse">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center mb-4">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                              <div className="px-4 py-2 bg-white rounded-md shadow-sm">
                                <p className="text-amber-600 text-sm font-medium">
                                  Loading preview...
                                </p>
                              </div>
                              <div className="mt-4 text-xs text-gray-500 max-w-[80%] text-center">
                                This may take a moment for complete books
                              </div>
                            </div>
                            
                          ) : (
                            <>
                              <img
                                src={`${BASE_URl}/uploads/${book.additionalData.coverImageUrl}`}
                                alt={book.bookTitle}
                                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://placehold.co/400x600/f59e0b/ffffff?text=No+Cover";
                                }}
                              />

                              {/* Status indicator overlay for incomplete books */}
                              {
                            book.type === 'incomplete' &&  (
                         <div className="absolute top-2 left-2 bg-amber-500 text-white rounded-full px-3 py-1 text-xs font-bold shadow-md z-10">
                        In Progress
                                </div>)
                              }

                              {/* Regular overlay with improved UI */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-4 gap-2">
  <Button
    variant="secondary"
    size="sm"
    className="w-full bg-white hover:bg-amber-50 shadow-sm transition-all duration-300"
    onClick={(e) => handlePreview(e, book)}
    disabled={isBookLoading}
  >
    {isBookLoading && loadingBookId === book.id ? (
      <>
        <Loader2 className="w-4 h-4 mr-2 text-amber-600 animate-spin" />
        Loading...
      </>
    ) : (
      <>
        <Eye className="w-4 h-4 mr-2 text-amber-600" />
        Preview
      </>
    )}
  </Button>
  
  {book.type === 'complete' && (
    <Button
      variant="secondary"
      size="sm"
      className="w-full bg-white hover:bg-green-50 shadow-sm transition-all duration-300"
      onClick={(e) => handleDownload(e, book.id)}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-600" />
      ) : (
        <>
          <Download className="w-4 h-4 mr-2 text-green-600" />
          Download PDF
        </>
      )}
    </Button>
  )}
</div>
                            </>
                          )}
                        </div>

                        {/* Book info with improved typography */}
                        <div className="p-4 space-y-2 relative">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-amber-600 transition-colors w-full">
                            {book.bookTitle}
                          </h3>

                          <p className="text-sm text-gray-600 line-clamp-1 flex items-center">
                            <Users className="w-3 h-3 mr-1 text-gray-400" />
                            {book.authorName || "Unknown Author"}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {book.genre && (
                              <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full truncate w-full flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                                {book.genre}
                              </span>
                            )}

                            {book.type === "complete" &&
                             (!!book?.glossary &&
                              !!book?.index &&
                              !!book?.references)
                            && (
                              <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full truncate w-full flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                                Complete
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete button with improved hover */}
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirmation Dialog */}
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
