import { SetStateAction, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2, Eye, BookOpen } from 'lucide-react'; // Import Eye icon
import Layout from '@/components/layout/Layout';
import { useFetchBooksQuery } from '@/api/bookApi';
import ReactPaginate from 'react-paginate';
import BookModal from '@/components/BookModel/BookModel';
import Header from '@/components/layout/Header';

interface BookData {
  id: number;
  bookTitle: string;
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
  const { data, isLoading, isError, error }:any = useFetchBooksQuery(); // Fetch books with the hook
  const [selectedBook, setSelectedBook] = useState<BookData | null>(null); // State to store the selected book for the modal
  const [currentPage, setCurrentPage] = useState(0); // State for pagination
  const itemsPerPage = 10; // Number of items per page

  // Handle the error case
  if (isError) {
    toast.error(error?.data?.message || 'An error occurred');
  }

  // Pagination logic
  const pageCount = Math.ceil((data?.data?.length || 0) / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = data?.data?.slice(offset, offset + itemsPerPage) || [];

  // Handle page change
  const handlePageClick = ({ selected }:any) => {
    setCurrentPage(selected);
  };

  // Open modal with book details
  const openModal = (book: BookData) => {
    setSelectedBook(book);
  };

  // Close modal
  const closeModal = () => {
    setSelectedBook(null);
  };

  return (
    <Layout>
      <Header />
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <ToastContainer />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl  text-gray-800">Book Collection</h1>
            <p className="text-gray-500 mt-1">Browse and manage your book library</p>
          </div>
          
          {/* Search and Filter Section (Optional) */}
          <div className="flex gap-3 bg-gray-50 w-full md:w-auto">
            <input
              type="search"
              placeholder="Search books..."
              className="px-4 py-2 border bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1 md:w-64 text-black"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-gray-500 mt-2">Loading books...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Table Container */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/60">
                      <TableHead className="font-semibold text-gray-700 py-4">Title</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Genre</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Theme</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden xl:table-cell">Characters</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden 2xl:table-cell">Setting</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Tone</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden xl:table-cell">Plot Twists</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Pages</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Chapters</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Audience</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Language</TableHead>
                      <TableHead className="font-semibold text-gray-700 w-20">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length > 0 ? (
                      currentItems.map((book: any) => (
                        <TableRow 
                          key={book.id} 
                          className="hover:bg-gray-50/50 transition-colors duration-200"
                        >
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {book.bookTitle}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{book.genre}</TableCell>
                          <TableCell className="hidden lg:table-cell">{book.theme}</TableCell>
                          <TableCell className="hidden xl:table-cell">{book.characters}</TableCell>
                          <TableCell className="hidden 2xl:table-cell">{book.setting}</TableCell>
                          <TableCell className="hidden lg:table-cell">{book.tone}</TableCell>
                          <TableCell className="hidden xl:table-cell">{book.plotTwists}</TableCell>
                          <TableCell className="hidden md:table-cell">{book.numberOfPages}</TableCell>
                          <TableCell className="hidden lg:table-cell">{book.numberOfChapters}</TableCell>
                          <TableCell className="hidden md:table-cell">{book.targetAudience}</TableCell>
                          <TableCell className="hidden lg:table-cell">{book.language}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openModal(book)}
                              className="hover:bg-amber-50 hover:text-amber-600 rounded-full transition-colors duration-200"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell 
                          colSpan={12} 
                          className="text-center py-12 text-gray-500 bg-gray-50/50"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                            <p>No books found in the collection.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Enhanced Pagination */}
            <div className="flex justify-center mt-8">
              <ReactPaginate
                previousLabel={'← Prev'}
                nextLabel={'Next →'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={'flex flex-wrap items-center gap-2'}
                pageClassName={'px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors'}
                activeClassName={'!bg-amber-500 !text-white border-amber-500 hover:!bg-amber-600'}
                previousClassName={'px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors'}
                nextClassName={'px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors'}
                disabledClassName={'opacity-50 cursor-not-allowed'}
                breakClassName={'px-3 py-2'}
              />
            </div>
          </div>
        )}

        {/* Enhanced Modal */}
        {selectedBook && (
          <BookModal
            isOpen={!!selectedBook}
            onClose={closeModal}
            htmlContent={selectedBook.additionalData?.content || selectedBook.additionalData?.fullContent}
            coverImageUrl={selectedBook.additionalData?.coverImageUrl || selectedBook.additionalData?.coverImagePath}
            backCoverImageUrl={selectedBook.additionalData?.backCoverImageUrl }
          />
        )}
      </div>
    </Layout>
  );
}