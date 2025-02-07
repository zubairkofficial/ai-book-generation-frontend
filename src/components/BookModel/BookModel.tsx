// components/BookModal.tsx

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { useToast } from '@/context/ToastContext';
import BookPreview from './BookPreview';
import BookPDF from './PdfBook/BookPdf';
import { defaultBookStyles } from './PdfBook/hooks/useBookStyles';
import '../../utils/BookStyles'
interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  selectedBook: any;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
}

const BookModal: React.FC<BookModalProps> = ({ isOpen, onClose, htmlContent, selectedBook, coverImageUrl, backCoverImageUrl }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'preview' | 'pdf'>('preview');

  const handleDownloadPdf = async () => {
    if (!htmlContent) {
      addToast('No content available', 'error');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdfBlob = await pdf(<BookPDF selectedBook={selectedBook} content={htmlContent} coverImageUrl={coverImageUrl} backCoverImageUrl={backCoverImageUrl} bookStyles={defaultBookStyles} />).toBlob();
      const fileName = `${selectedBook?.bookTitle || 'book'}.pdf`;
      saveAs(pdfBlob, fileName);
      addToast('PDF generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate PDF', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="container mx-auto h-full p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Book Preview</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {htmlContent && activeTab === 'preview' && <BookPreview htmlContent={htmlContent} coverImageUrl={coverImageUrl} backCoverImageUrl={backCoverImageUrl} />}
            {htmlContent && activeTab === 'pdf' && (
              <iframe
                src={URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }))}
                className="w-full h-[600px] border-0"
                title="PDF Preview"
              />
            )}
          </div>
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end gap-4">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Close
              </button>
              <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="inline-flex items-center px-6 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
                {isGeneratingPdf ? <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
