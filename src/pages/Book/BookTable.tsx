import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2, Eye } from 'lucide-react'; // Import Eye icon
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useFetchBooksQuery } from '@/api/bookApi';
import ReactPaginate from 'react-paginate';
import Modal from '@/components/model';

export default function BookTable() {
  const { data, isLoading, isError, error } = useFetchBooksQuery(); // Fetch books with the hook
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null); // State to store the selected book for the modal
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
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Open modal with book details
  const openModal = (book) => {
    setSelectedBook(book);
  };

  // Close modal
  const closeModal = () => {
    setSelectedBook(null);
  };

  return (
    <Layout>
      <div className="p-8">
        <ToastContainer />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Book Management</h1>
          <Button onClick={() => navigate('/books/add')}>Create Book</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead>Characters</TableHead>
                    <TableHead>Setting</TableHead>
                    <TableHead>Tone</TableHead>
                    <TableHead>Plot Twists</TableHead>
                    <TableHead>Pages</TableHead>
                    <TableHead>Chapters</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Action</TableHead> {/* Add Action column */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.bookTitle}</TableCell>
                        <TableCell>{book.genre}</TableCell>
                        <TableCell>{book.theme}</TableCell>
                        <TableCell>{book.characters}</TableCell>
                        <TableCell>{book.setting}</TableCell>
                        <TableCell>{book.tone}</TableCell>
                        <TableCell>{book.plotTwists}</TableCell>
                        <TableCell>{book.numberOfPages}</TableCell>
                        <TableCell>{book.numberOfChapters}</TableCell>
                        <TableCell>{book.targetAudience}</TableCell>
                        <TableCell>{book.language}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openModal(book)} // Open modal on click
                          >
                            <Eye className="h-4 w-4" /> {/* View icon */}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center">
                        No books found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={'flex space-x-2'}
                pageClassName={'px-3 py-1 border rounded'}
                activeClassName={'bg-blue-500 text-white'}
                previousClassName={'px-3 py-1 border rounded'}
                nextClassName={'px-3 py-1 border rounded'}
                disabledClassName={'opacity-50 cursor-not-allowed'}
              />
            </div>
          </>
        )}

        {/* Modal for displaying book details */}
        {selectedBook && (
  <Modal
    isOpen={!!selectedBook}
    onClose={closeModal}
    htmlContent={selectedBook.additionalData?.fullContent}
    coverImageUrl={selectedBook.additionalData?.coverImageUrl}
  >
    {/* Additional children (if any) */}
  </Modal>
)}
      </div>
    </Layout>
  );
}