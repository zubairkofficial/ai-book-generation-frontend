import { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { BASE_URl } from '@/constant';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  htmlContent?: string;
  coverImageUrl?: string;
}

export default function BookModal({ isOpen, onClose, children, htmlContent, coverImageUrl }: ModalProps) {
  console.log("object",coverImageUrl)
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const normalizedCoverImageUrl = coverImageUrl?.replace(/\\/g, '/');
  const imageUrl = `${BASE_URl}/uploads/${normalizedCoverImageUrl}`; // Close modal when clicking outside the modal content
console.log("imageUrl: " , imageUrl);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatBookContent = (content: string) => {
    // Split content by sections
    const sections = content.split('\n\n');
    
    return sections.map((section, index) => {
      // Skip duplicate chapter headers
      if (section.match(/^Chapter \d+: Chapter \d+$/)) {
        return '';
      }
      
      // Extract actual chapter title if it exists
      const chapterMatch = section.match(/^Chapter \d+: (.+)$/);
      
      if (chapterMatch) {
        // Only use the actual chapter title, not the duplicate
        const chapterTitle = chapterMatch[1];
        if (chapterTitle.toLowerCase().includes('chapter')) {
          return ''; // Skip duplicate chapter mentions
        }
        
        return `
          <div class="chapter-start">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">Chapter: ${chapterTitle}</h2>
          </div>`;
      } else if (index === 0) {
        // Book title
        return `
          <div class="title-page">
            <h1 class="text-4xl font-bold text-center mb-8 text-gray-900">${section}</h1>
          </div>`;
      } else if (section.startsWith('Introduction')) {
        return `
          <div class="section-start">
            <h2 class="text-2xl font-bold mb-6 text-amber-700">${section}</h2>
          </div>`;
      } else if (section.startsWith('Conclusion')) {
        return `
          <div class="section-start">
            <h2 class="text-2xl font-bold mb-6 text-amber-700">${section}</h2>
          </div>`;
      } else {
        // Regular paragraphs
        return `<p class="mb-5 text-gray-700 leading-relaxed text-justify">${section}</p>`;
      }
    })
    .filter(Boolean)
    .join('');
  };

  const handleDownloadPdf = async () => {
    if (!htmlContent) return;
    setIsGeneratingPdf(true);

    const element = document.createElement('div');
    element.innerHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');
          
          body {
            font-family: 'Merriweather', serif;
            line-height: 1.8;
            margin: 0;
            padding: 0;
            color: #2D3748;
          }
          
          .book-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2.5cm;
          }
          
          .cover-page {
            page-break-after: always;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
            background-color: #FFF8F0;
          }
          
          .title-page {
            margin-bottom: 4cm;
          }
          
          /* Force chapters to start on new pages */
          .chapter-start {
            page-break-before: always;
            padding-top: 2cm;
            min-height: 30vh;
          }
          
          /* Force major sections to start on new pages */
          .section-start {
            page-break-before: always;
            padding-top: 2cm;
            min-height: 30vh;
          }
          
          h1 {
            font-size: 32px;
            color: #1A202C;
            text-align: center;
            margin-bottom: 1rem;
            page-break-after: avoid;
          }
          
          h2 {
            font-size: 24px;
            color: #2D3748;
            margin-bottom: 1.5rem;
            page-break-after: avoid;
          }
          
          p {
            font-size: 12pt;
            line-height: 1.8;
            margin-bottom: 1rem;
            text-align: justify;
            orphans: 3;
            widows: 3;
            word-spacing: 0.05em;
          }
          
          @page {
            size: A4;
            margin: 2.5cm;
            @bottom-center {
              content: counter(page);
              font-family: 'Merriweather', serif;
              font-size: 10pt;
              color: #718096;
            }
          }

          /* Better paragraph spacing */
          p + p {
            text-indent: 1.5em;
          }
        </style>
      </head>
      <body>
        <div class="cover-page">
          ${coverImageUrl ? `<img src="${imageUrl}" alt="Book Cover" class="cover-image" />` : ''}
          <h1 class="title">${document.title || 'Generated Book'}</h1>
          <p class="subtitle">An AI Book Legacy Creation</p>
        </div>
        <div class="book-container">
          ${formatBookContent(htmlContent)}
        </div>
      </body>
      </html>
    `;

    try {
      const opt = {
        margin: [25, 25, 25, 25],
        filename: 'generated-book.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: ['.chapter-start', '.section-start'],
          avoid: ['h1', 'h2']
        }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Book Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="max-h-[80vh] overflow-y-auto">
          {/* Cover Image */}
          {coverImageUrl && (
            <div className="relative w-full bg-gradient-to-b from-amber-50 to-white py-8">
              <div className="max-w-md mx-auto">
                <img
                  src={imageUrl}
                  alt="Book Cover"
                  className="w-full h-auto rounded-lg shadow-2xl"
                  onLoad={() => setIsImageLoaded(true)}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x600?text=Cover+Not+Found';
                    setIsImageLoaded(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Book Content */}
          {htmlContent && (
            <div className="px-8 py-6 prose prose-lg max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: formatBookContent(htmlContent) }}
                className="text-gray-700 leading-relaxed"
              />
            </div>
          )}

          {children}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          <div className="flex space-x-3">
            {htmlContent && (
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf || (!isImageLoaded && !!coverImageUrl)}
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Generating PDF...
                  </>
                ) : (
                  'Download PDF'
                )}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}