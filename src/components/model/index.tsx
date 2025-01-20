import { useEffect } from 'react';
import html2pdf from 'html2pdf.js';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode; // Optional children
  htmlContent?: string; // Add htmlContent as a prop
  coverImageUrl?: string; // Add coverImageUrl as a prop
}

export default function Modal({ isOpen, onClose, children, htmlContent, coverImageUrl }: ModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to reset overflow when the component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Close modal when clicking outside the modal content
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Function to trigger PDF download
  const handleDownloadPdf = () => {
    if (!htmlContent) return;

    // Create a temporary div to hold the HTML content
    const element = document.createElement('div');
    element.innerHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Modern and Professional Styling */
          body {
            font-family: 'Merriweather', serif;
            line-height: 1.8;
            margin: 0;
            padding: 0;
          }
          h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            color: #555;
            font-size: 16px;
            margin-bottom: 15px;
          }
          img {
            max-width: 100%;
            height: auto;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        ${coverImageUrl ? `<img src="${coverImageUrl}" alt="Book Cover" />` : ''}
        ${htmlContent}
      </body>
      </html>
    `;

    // Convert HTML to PDF
    html2pdf()
      .set({
        margin: 10,
        filename: 'book.pdf', // Default filename
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden animate-fade-in">
        {/* Modal Content */}
        <div className="max-h-[80vh] overflow-y-auto p-6">
          {/* Cover Image */}
          {coverImageUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={coverImageUrl}
                alt="Book Cover"
                className="w-48 h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/192x256'; // Fallback image
                }}
              />
            </div>
          )}

          {/* HTML Content */}
          {htmlContent && (
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }} // Render HTML with CSS
            />
          )}

          {/* Children (if any) */}
          {children}
        </div>

        {/* Download Buttons */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {/* PDF Download Button */}
            {htmlContent && (
              <>
              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Download PDF
              </button>
              {/* <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Download Word
              </button> */}
              </>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}