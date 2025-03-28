import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, ChevronRight, 
  Download, X, Maximize2, Minimize2,
  BookOpen, List, Menu, Moon, Sun, 
  FileText, Grid, ChevronsLeft, ChevronsRight,
  Loader2
} from 'lucide-react';
import { BASE_URl } from '@/constant';
import TurnDownService from 'turndown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useToast } from '@/context/ToastContext';
import '../../styles/book-preview.css';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookPDFDownloadLink } from './BookPDFRenderer';

const turndown = new TurnDownService();

// Define types for BookData
interface ChapterData {
  chapterNo: number;
  chapterInfo: string;
  chapterSummary?: string;
  chapterID?: number;
  chapterName:string
}

export interface BookData {
  id: number;
  bookTitle: string;
  authorName: string;
  genre: string;
  chapterName: string;
  bookChapter: ChapterData[];
  additionalData: {
    coverImageUrl?: string;
    backCoverImageUrl?: string;
    [key: string]: any;
    dedication?: string;
    introduction?: string;
    preface?: string;
    tableOfContents?: string;
  };
 
  glossary?: string;
  index?: string;
  references?: string;
  type: string;
  language: string;
  targetAudience: string;
  characters?: string;
  authorBio?: string;
  numberOfChapters: number;
}

interface BookPreviewProps {
  book: BookData;
  onClose: () => void;
  nightMode: boolean;
}

const BookPreview: React.FC<BookPreviewProps> = ({ book, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pages, setPages] = useState<Array<{ title: string, content: JSX.Element }>>([]);
  const [showTOC, setShowTOC] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        addToast(`Error attempting to enable fullscreen: ${err.message}`, "error");
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          addToast(`Error attempting to exit fullscreen: ${err.message}`, "error");
        });
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (currentPage < pages.length - 1) {
          e.preventDefault();
          handlePageChange(currentPage + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentPage > 0) {
          e.preventDefault();
          handlePageChange(currentPage - 1);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length, onClose]);
  
  // Animate page changes
  const handlePageChange = (newPage: number) => {
    if (pageRef.current) {
      pageRef.current.classList.add('page-exit');
      setTimeout(() => {
        setCurrentPage(newPage);
        if (pageRef.current) {
          pageRef.current.classList.remove('page-exit');
          pageRef.current.classList.add('page-enter');
          setTimeout(() => {
            if (pageRef.current) {
              pageRef.current.classList.remove('page-enter');
            }
          }, 300);
        }
      }, 150);
    } else {
      setCurrentPage(newPage);
    }
  };

  // Prepare book pages
  useEffect(() => {
    if (!book) return;

    const bookPages = [];
    
    // Cover page
    bookPages.push({
      title: 'Cover',
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
          {book.additionalData?.coverImageUrl && (
            <img 
              src={`${BASE_URl}/uploads/${book.additionalData.coverImageUrl}`}
              alt={`Cover for ${book.bookTitle}`}
              className="w-auto max-h-[60vh] rounded-lg shadow-xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x600/f59e0b/ffffff?text=No+Cover';
              }}
            />
          )}
          <h1 className="text-4xl font-bold mt-6">{book.bookTitle}</h1>
          <h2 className="text-xl text-gray-600">By {book.authorName || 'Unknown Author'}</h2>
        </div>
      )
    });

    // Dedication
    if (book.additionalData.dedication) {
      bookPages.push({
        title: 'Dedication',
        content: (
          <div className="flex flex-col p-8 max-w-prose mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Dedication</h2>
            <div className="prose prose-amber mx-auto">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {book.additionalData.dedication}
              </ReactMarkdown>
            </div>
          </div>
        )
      });
    }

    // Introduction
    if (book.additionalData.introduction) {
      bookPages.push({
        title: 'Introduction',
        content: (
          <div className="flex flex-col p-8 max-w-prose mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Introduction</h2>
            <div className="prose prose-amber mx-auto">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {book.additionalData.introduction}
              </ReactMarkdown>
            </div>
          </div>
        )
      });
    }

    // Preface
    if (book.additionalData.preface) {
      bookPages.push({
        title: 'Preface',
        content: (
          <div className="flex flex-col p-8 max-w-prose mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Preface</h2>
            <div className="prose prose-amber mx-auto">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {book.additionalData.preface}
              </ReactMarkdown>
            </div>
          </div>
        )
      });
    }

    // Table of Contents
    if (book.additionalData.tableOfContents) {
      bookPages.push({
        title: 'Table of Contents',
        content: (
          <div className="flex flex-col p-8 max-w-prose mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Table of Contents</h2>
            <div className="prose prose-amber mx-auto">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {book.additionalData.tableOfContents}
              </ReactMarkdown>
            </div>
          </div>
        )
      });
    }

    // Chapters
    if (book.bookChapter && book.bookChapter.length > 0) {
      book.bookChapter.forEach((chapter) => {
        let chapterContent = chapter.chapterInfo;
        
        // Convert HTML to Markdown if needed
        if (chapterContent?.startsWith("<")) {
          const markdown = turndown.turndown(chapterContent).replace(/ \#/gm, '\n\n#').replace(/\\\#/g, '\n\n#');
          chapterContent = markdown;
        }

        bookPages.push({
          title: `Chapter ${chapter.chapterNo}`,
          content: (
            <div className="flex flex-col p-8 max-w-prose mx-auto">
             
              <div className="prose prose-amber mx-auto">
                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                  {chapterContent}
                </ReactMarkdown>
              </div>
            </div>
          )
        });
      });
    }

    // Glossary
    if (book.glossary) {
      bookPages.push({
        title: 'Glossary',
        content: (
          <div className="flex flex-col p-8 max-w-prose mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Glossary</h2>
            <div className="prose prose-amber mx-auto">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {book.glossary}
              </ReactMarkdown>
            </div>
          </div>
        )
      });
    }

    // Index
    if (book.index) {
      bookPages.push({
        title: 'Index',
        content: (
          <div className="flex flex-col p-8 max-w-prose mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Index</h2>
            <div className="prose prose-amber mx-auto">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {book.index}
              </ReactMarkdown>
            </div>
          </div>
        )
      });
    }

    // References
    if (book.references) {
      bookPages.push({
        title: 'References',
        content: (
          <div className="flex flex-col p-8 max-w-prose mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">References</h2>
            <div className="prose prose-amber mx-auto">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                {book.references}
              </ReactMarkdown>
            </div>
          </div>
        )
      });
    }

    // Back cover
    if (book.additionalData?.backCoverImageUrl) {
      bookPages.push({
        title: 'Back Cover',
        content: (
          <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
            <img 
              src={`${BASE_URl}/uploads/${book.additionalData.backCoverImageUrl}`}
              alt="Back cover"
              className="w-auto max-h-[60vh] rounded-lg shadow-xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x600/f59e0b/ffffff?text=No+Back+Cover';
              }}
            />
            <h2 className="text-xl font-semibold text-gray-600">© {new Date().getFullYear()} {book.authorName || 'Unknown Author'}</h2>
          </div>
        )
      });
    }

    setPages(bookPages);
  }, [book]);

  // Download PDF
  const handleDownloadPDF = () => {
    // This is now a no-op as the download link handles everything
    // You can use this function to set isPdfGenerating state if needed
    setIsPdfGenerating(true);
    setTimeout(() => setIsPdfGenerating(false), 100); // Just for UI feedback
  };

  if (!book || pages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold">Loading book preview...</h3>
        </div>
      </div>
    );
  }

  // Updated renderThumbnail for better content preview
  const renderThumbnail = (pageIndex: number) => {
    const page = pages[pageIndex];
    const isCurrentPage = currentPage === pageIndex;
    
    return (
      <button
        key={pageIndex}
        onClick={() => handlePageChange(pageIndex)}
        className={`w-full mb-4 transition-all overflow-hidden ${
          isCurrentPage ? 'scale-100' : 'opacity-80 hover:opacity-100'
        }`}
      >
        <div 
          className={`w-full relative aspect-[1/1.4142] border rounded-md overflow-hidden shadow-md transition-all ${
            isCurrentPage 
              ? 'border-amber-500 shadow-amber-200' 
              : 'border-gray-200 hover:border-amber-300'
          }`}
        >
          {/* Page number badge */}
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-bl-md z-10">
            {pageIndex + 1}
          </div>
          
          {/* Thumbnail content with actual miniature preview */}
          <div className={`w-full h-full flex flex-col ${
            nightMode ? 'bg-gray-800 text-white' : 'bg-white'
          }`}>
            {/* Thumbnail header */}
            <div className={`py-1 px-2 border-b text-xs truncate ${
              nightMode ? 'bg-gray-800 border-gray-700' : 'bg-amber-50 border-amber-100'
            }`}>
              {page.title}
            </div>
            
            {/* Thumbnail body - actual content in miniature */}
            <div className="flex-1 p-1 overflow-hidden">
              {page.title === 'Cover' && book.additionalData?.coverImageUrl ? (
                <img 
                  src={`${BASE_URl}/uploads/${book.additionalData.coverImageUrl}`} 
                  alt="Cover"
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x600/f59e0b/ffffff?text=No+Cover';
                  }}
                />
              ) : (
                <div className="pdf-page-content-thumb">
                  {/* Render a miniature version of the content */}
                  <div className="transform scale-[0.25] origin-top-left w-[400%] h-[400%]">
                    {page.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Title below thumbnail */}
        <p className="text-xs truncate mt-1 text-center text-gray-700">
          {page.title}
        </p>
      </button>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-white ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header with controls */}
      <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onClose} className="mr-2">
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Close</span>
          </Button>
          <div className="text-sm font-medium px-3 py-1 rounded-full bg-amber-100 text-amber-800">
            {currentPage + 1} of {pages.length}
          </div>
        </div>
        
        <div className="text-xl font-serif text-amber-800 hidden md:block truncate max-w-[300px]">
          {book.bookTitle}
        </div>
        
        <div className="flex items-center space-x-2">
        
          <BookPDFDownloadLink
           book={book}
             >
            {isPdfGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                <span>PDF</span>
              </>
            )}
          </BookPDFDownloadLink>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Main content area with side-by-side layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails sidebar - always visible */}
        <div className="w-64 xl:w-72 bg-gray-50 border-r border-gray-200 overflow-hidden flex-shrink-0">
          <div className="p-2 border-b border-gray-200 bg-white flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Pages</h3>
            <div className="px-2 py-1 bg-amber-50 rounded text-xs text-amber-800 font-medium">
              {pages.length} total
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-8.5rem)]">
            <div className="p-3 space-y-1">
              {pages.map((_, index) => renderThumbnail(index))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100 relative">
          {/* Page viewer */}
          <div className="w-full max-w-4xl mx-auto h-[calc(100vh-8.5rem)] p-4 flex items-center justify-center">
            <div 
              className={`a4-page w-full h-full rounded-md shadow-xl overflow-hidden ${
                nightMode ? 'bg-gray-900 text-gray-100' : 'bg-white'
              } pdf-container`}
            >
              <div className="h-full overflow-y-auto page-transition" ref={pageRef}>
                <div className="min-h-full flex flex-col">
                  {/* Page header */}
                  <div className={`py-3 px-6 border-b flex items-center justify-between ${
                    nightMode ? 'bg-gray-800 border-gray-700' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <BookOpen className={`h-4 w-4 ${nightMode ? 'text-amber-400' : 'text-amber-600'}`} />
                      <h3 className={`font-medium ${nightMode ? 'text-amber-400' : 'text-amber-800'}`}>
                        {pages[currentPage].title}
                      </h3>
                    </div>
                    
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100/60 text-amber-800">
                      Page {currentPage + 1}
                    </div>
                  </div>
                  
                  {/* Page content with PDF styling */}
                  <div 
                    className={`flex-1 overflow-y-auto pdf-page-content ${
                      nightMode ? 'bg-gray-900 text-gray-100 night-mode' : 'bg-white'
                    }`}
                    data-page={currentPage + 1}
                  >
                    {/* Professional print-style page */}
                    <div className={`mx-auto px-2 md:px-4 py-3 max-w-[52rem] ${
                      nightMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {pages[currentPage].content}
                    </div>
                    
                    {/* Page number watermark for professional look */}
                    <div className="absolute bottom-10 right-4 opacity-20 select-none pointer-events-none">
                      <span className="text-5xl font-light">{currentPage + 1}</span>
                    </div>
                  </div>
                  
                  {/* PDF-style footer with enhanced styling */}
                  <div className={`py-3 px-6 text-center text-sm border-t ${
                    nightMode 
                      ? 'border-gray-800 text-gray-400' 
                      : 'border-gray-100 text-gray-500'
                  }`}>
                    <div className="mx-auto flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{book.authorName}</span>
                        {book.genre && <span className="text-xs opacity-75">• {book.genre}</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Page {currentPage + 1}</span>
                        <span className="opacity-75">of {pages.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile controls */}
      <div className="md:hidden bg-white border-t border-gray-200 py-2 px-3 grid grid-cols-4 gap-1">
        <Button variant="ghost" size="sm" className="text-xs flex flex-col items-center py-1" onClick={() => setCurrentPage(0)}>
          <BookOpen className="h-4 w-4" />
          <span>Cover</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-xs flex flex-col items-center py-1" onClick={() => setCurrentPage(Math.floor(pages.length / 2))}>
          <Grid className="h-4 w-4" />
          <span>Middle</span>
        </Button>
        <BookPDFDownloadLink
          book={book}
          >
          {isPdfGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </>
          )}
        </BookPDFDownloadLink>
        <Button variant="ghost" size="sm" className="text-xs flex flex-col items-center py-1" onClick={() => setNightMode(!nightMode)}>
          {nightMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{nightMode ? 'Light' : 'Dark'}</span>
        </Button>
      </div>
    </div>
  );
};

export default BookPreview; 