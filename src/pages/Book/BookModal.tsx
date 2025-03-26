import  { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFetchBookByIdQuery } from "@/api/bookApi";
import Layout from "@/components/layout/Layout";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import BookPDF from "@/components/BookPreview/BookPDF";
import { PDFViewer } from "@react-pdf/renderer";
import { useToast } from "@/context/ToastContext";
import { ToastType } from "@/constant";

const BookModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const params = new URLSearchParams(location.search);
  const bookId = Number(params.get("id"));
  
  const { data: bookData, isLoading, isError } = useFetchBookByIdQuery(bookId);
  const [isDownloading, setIsDownloading] = useState(false);
  
  useEffect(() => {
    if (isError) {
      addToast("Failed to load book data.", ToastType.ERROR);
      navigate("/books");
    }
  }, [isError, navigate, addToast]);

  const handleDownloadPDF = async () => {
    if (!bookData?.data) return;
    
    try {
      setIsDownloading(true);
      const blob = await pdf(<BookPDF book={bookData.data} />).toBlob();
      saveAs(blob, `${bookData.data.bookTitle}.pdf`);
      addToast("PDF downloaded successfully", ToastType.SUCCESS);
    } catch (error) {
      console.error("Error generating PDF:", error);
      addToast("Failed to generate PDF", ToastType.ERROR);
    } finally {
      setIsDownloading(false);
    }
  };

 

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
          <p className="text-amber-700">Loading book preview...</p>
        </div>
      </Layout>
    );
  }

  if (!bookData?.data) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <p className="text-red-500 mb-4">Book not found</p>
          <Button 
            onClick={() => navigate(-1)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Books
          </Button>
        </div>
      </Layout>
    );
  }

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 md:p-8 max-w-[1200px] mx-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Books
          </Button>
          
          <div className="flex gap-2">
           
            
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                "Download PDF"
              )}
            </Button>
          </div>
        </div>

        
          <div className="h-[800px] w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg">
            <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
              <BookPDF book={bookData.data} />
            </PDFViewer>
          </div>
       
      </motion.div>
  );
};

export default BookModal; 