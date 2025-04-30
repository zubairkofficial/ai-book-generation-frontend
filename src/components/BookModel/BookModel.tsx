import { Dispatch,  SetStateAction,  useEffect,  useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Loader2,  Image,
  BookOpen, List, Heart, BookmarkIcon, Users, ArrowLeft, ChevronRight, Check, Pencil,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetchBookByIdQuery,   useUpdateImageMutation, useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { BASE_URl } from '@/constant';
import { ReloadIcon } from '@radix-ui/react-icons';
import { RegenerateImageModal } from './RegenerateImageModal';
import { CoverContent } from './CoverContent';
import { Content, BookSection } from './Content';
import { TableOfContentsContent } from './TableOfContentsContent';
import { ChapterContent } from './ChapterContent';
import { useToast } from '@/context/ToastContext';
import TurnDownService from 'turndown'
const turndown = new TurnDownService();

// Define types for pages and content
interface PageContent {
  id: string;
  icon: JSX.Element;
  label: string;
  isAction?: boolean;
}

interface TextStyle {
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  fontSize: string;
  fontFamily: string;
  color: string;
  lineHeight: string;
  letterSpacing: string;
}

// Add proper type definitions
const BookModel = () => {
  const [searchParams] = useSearchParams();
  const bookId = Number(searchParams.get('id') || 0);
  
  // State
  const [currentPage, setCurrentPage] = useState<string>('cover');
  const [editMode, setEditMode] = useState(false);
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    align: 'left',
    fontSize: '16px',
    fontFamily: 'Times New Roman',
    color: '#000000',
    lineHeight: '1.6',
    letterSpacing: 'normal'
  });
  const { addToast } = useToast();
  
  // API Hooks
  const { data: book, isLoading, refetch: refetchBook } = useFetchBookByIdQuery(bookId, { skip: !bookId });
  const isComplete=book?.data.type==="complete"
  const PAGES: PageContent[] = [
    { id: 'cover', icon: <BookOpen className="w-4 h-4" />, label: 'Cover' },
    { id: 'dedication', icon: <Heart className="w-4 h-4" />, label: 'Dedication' },
    { id: 'introduction', icon: <BookmarkIcon className="w-4 h-4" />, label: 'Introduction' },
    { id: 'preface', icon: <BookmarkIcon className="w-4 h-4" />, label: 'Preface' },
    { id: 'toc', icon: <List className="w-4 h-4" />, label: 'Contents' },
    ...(isComplete ? [
      { id: 'glossary', icon: <Users className="w-4 h-4" />, label: 'Glossary' },
      { id: 'index', icon: <List className="w-4 h-4" />, label: 'Index' },
      { id: 'references', icon: <BookmarkIcon className="w-4 h-4" />, label: 'References' },
    ] : []),
     ];

  const [updateImage] = useUpdateImageMutation();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();

  // Add navigate function
  const navigate = useNavigate();
useEffect(()=>{refetchBook()},[])
  // Handle image update
  const handleImageUpdate = async (file: File, type: 'cover' | 'backCover') => {
    if (!bookId) return;

    try {
      await updateImage({
        bookId,
        imageType: type,
        image: file
      }).unwrap();
     await refetchBook()
     addToast("Image updated successfully", "success");

    } catch (error:any) {
      addToast("Failed to update image", "error");
    }
  };

  // Handle content update
  const handleContentUpdate = async (content: string, pageType?: string) => {
    if (!bookId || !book?.data) return;
    
    
    try {
      switch (pageType) {
        case 'glossary':
          await updateBookGenerated({
            bookGenerationId: book.data.id,
            glossary: content
          }).unwrap();
          break;
          
        case 'index':
          await updateBookGenerated({
            bookGenerationId: book.data.id,
            index: content
          }).unwrap();
          break;
          
        case 'references':
          await updateBookGenerated({
            bookGenerationId: book.data.id,
            references: content
          }).unwrap();
          break;
          
        case 'toc':
          await updateBookGenerated({
            bookGenerationId: book.data.id,
            tableOfContents: content
          }).unwrap();
          break;
          
        case 'dedication':
          await updateBookGenerated({
            bookGenerationId: book.data.id,
            dedication: content
          }).unwrap();
          break;
          
        // Add other cases as needed
      }
      
      setEditMode(false);
      await refetchBook();
      
    } catch (error) {
      addToast(`Failed to update ${pageType || 'content'}`, "error");
    }
  };

  // Add these styles at the top of your file
  const navStyles = {
    desktop: `
      hidden md:flex md:flex-col
      fixed left-4 top-1/2 transform -translate-y-1/2 
      bg-white/95 backdrop-blur-sm rounded-xl 
      shadow-lg border border-gray-100
      p-3 space-y-1.5 transition-all duration-300
      hover:shadow-xl
    `,
    mobile: `
      md:hidden fixed bottom-0 left-0 right-0 
      bg-white/95 backdrop-blur-sm
      shadow-[0_-4px_10px_rgba(0,0,0,0.05)]
      border-t border-gray-100
      px-2 py-1.5 z-50
    `,
    button: {
      base: `
        w-full transition-all duration-200
        hover:bg-amber-50 hover:text-amber-700
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1
        rounded-lg
      `,
      active: `
        bg-amber-100 text-amber-900
        shadow-inner
      `,
      inactive: `
        text-gray-600
      `
    }
  };

  // Navigation component
  const NavigationButtons = () => (
    <>
      {/* Desktop Navigation */}
      <div className={navStyles.desktop}>
       
        
        {PAGES.map((page) => {
          // Special handling for edit button
          if (page.id === 'edit') {
            return (
              <Button
                key={page.id}
                variant={editMode ? "default" : "outline"}
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-2 justify-start w-full"
              >
                {page.icon}
                <span className="font-medium">
                  {editMode ? 'Editing' : 'Edit'}
                </span>
              </Button>
            );
          }

          // Regular navigation buttons
          return (
            <Button
              key={page.id}
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(page.id)}
              className={`
                ${navStyles.button.base}
                ${currentPage === page.id ? navStyles.button.active : navStyles.button.inactive}
                group text-left justify-start w-full
              `}
              title={page.label}
            >
              <div className="flex items-center gap-3 px-2 py-1 w-full">
                <div className={`
                  ${currentPage === page.id ? 'text-amber-700' : 'text-gray-500'}
                  group-hover:text-amber-600 transition-colors flex-shrink-0
                `}>
                  {page.icon}
                </div>
                <span className={`
                  hidden lg:block text-sm font-medium
                  text-left
                  ${currentPage === page.id ? 'opacity-100' : 'opacity-60'}
                  group-hover:opacity-100
                `}>
                  {page.label}
                </span>
              </div>
            </Button>
          );
        })}
        
        
      </div>

      {/* Mobile Navigation */}
      <div className={navStyles.mobile}>
        <div className="flex justify-around items-center">
          {PAGES.map((page) => {
            // Special handling for edit button
            if (page.id === 'edit') {
              return (
                <Button
                  key={page.id}
                  variant={editMode ? "ghost" : "outline"}
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2"
                >
                  {page.icon}
                  <span className="font-medium">
                    {editMode ? 'Editing' : 'Edit'}
                  </span>
                </Button>
              );
            }

            // Regular navigation buttons
            return (
              <Button
                key={page.id}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(page.id)}
                className={`
                  px-3 py-2 rounded-lg transition-all
                  ${currentPage === page.id ? 'bg-amber-100 text-amber-900' : 'text-gray-600'}
                `}
                title={page.label}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className={`
                    ${currentPage === page.id ? 'text-amber-700' : 'text-gray-500'}
                  `}>
                    {page.icon}
                  </div>
                  <span className="text-[10px] font-medium">
                    {page.label.split(' ')[0]}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
        
        {/* Mobile Progress Indicator */}
        <div className="absolute -top-1 left-0 right-0 h-1 bg-gray-100">
          <div 
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ 
              width: `${((PAGES.findIndex(p => p.id === currentPage) + 1) / PAGES.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </>
  );

 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header with Breadcrumbs */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left section: Back button and breadcrumb */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-amber-600 p-2"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="h-4 w-px bg-gray-200 mx-1"></div>
            
            <nav className="flex items-center text-sm">
              <span className="text-gray-500">Books</span>
              <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
              <span className="text-gray-700 font-medium truncate max-w-[150px]">{book?.data?.bookTitle || "Book"}</span>
              <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
              <span className="text-amber-600 font-medium">{PAGES.find(p => p.id === currentPage)?.label || "Preview"}</span>
            </nav>
          </div>
          
          {/* Right section: Edit mode toggle with status indicator */}
          <div className="flex items-center">
         
            <div className="hidden sm:flex items-center mx-3">
              <div className={`w-2 h-2 rounded-full mr-2 ${editMode ? "bg-amber-500" : "bg-gray-300"}`}></div>
              <span className="text-sm font-medium text-gray-600">
                {editMode ? "Editing Mode" : "View Mode"}
              </span>
            </div>
            {!editMode ? (
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1 ${editMode ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
            >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="font-medium">Edit</span>
                
            </Button>
              ):""}
          </div>
        </div>
      </header>

      <NavigationButtons />

      {/* Book Content - Updated for consistent, responsive layout */}
      <div className="container mx-auto p-4 sm:p-6">
        <div className="md:pl-16 lg:pl-20 xl:pl-24 max-w-4xl mx-auto">
          <div
            className="prose max-w-none"
            style={{
              fontWeight: textStyle.bold ? 'bold' : 'normal',
              fontStyle: textStyle.italic ? 'italic' : 'normal',
              textAlign: textStyle.align,
              fontSize: textStyle.fontSize,
              fontFamily: textStyle.fontFamily,
              color: textStyle.color,
              lineHeight: textStyle.lineHeight,
              letterSpacing: textStyle.letterSpacing
            }}
          >
            {renderCurrentPageContent(
              currentPage, 
              book.data, 
              editMode,
              setEditMode, 
              handleContentUpdate,
              setCurrentPage,
              handleImageUpdate,
              refetchBook
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to render current page content
const renderCurrentPageContent = (
  currentPage: string, 
  bookData: any, 
  editMode: boolean,
  setEditMode: Dispatch<SetStateAction<boolean>>,
  onUpdate: (content: string, pageType?: string) => void,
  onPageChange: (page: string) => void,
  onImageUpdate: (file: File, type: 'cover' | 'backCover') => void,
  refetchBook: unknown
): JSX.Element => {
  switch (currentPage) {
    case 'cover':
      return (
        <div className="flex flex-col items-center justify-center min-h-[800px] text-center space-y-8 relative bg-white">
          <div className="relative w-full max-w-2xl">
            <ImageUpload
              currentImage={bookData.additionalData.coverImageUrl}
              onImageUpdate={(file) => onImageUpdate(file, 'cover')}
              label={bookData.bookTitle}
              isEditing={editMode}
              bookId={bookData.id}
              imageType="cover"
            />
          </div>
          <CoverContent
            bookData={bookData}
            editMode={editMode}
            refetchBook={refetchBook}
            setEditMode={setEditMode}
          />
          {/* Copyright Notice */}
          <div className="text-sm text-gray-500 mt-4">
            © {new Date().getFullYear()} {bookData.authorName}. All rights reserved.
          </div>
        </div>
      );

    case 'dedication':
      return (
        <Content
          section={BookSection.DEDICATION}
          bookData={bookData}
          editMode={editMode}
          refetchBook={refetchBook}
          setEditMode={setEditMode}
        />
      );

   
    case 'introduction':
        return (
          <Content
            section={BookSection.INTRODUCTION}
            bookData={bookData}
            editMode={editMode}
            refetchBook={refetchBook}
            setEditMode={setEditMode}
          />
        );
    case 'preface':
      return (
        <Content
          section={BookSection.PREFACE}
          bookData={bookData}
          editMode={editMode}
          refetchBook={refetchBook}
          setEditMode={setEditMode}
        />
      );

    case 'toc':
      return (
        <TableOfContentsContent 
          bookData={bookData} 
          editMode={editMode}
          onUpdate={(content) => onUpdate(content, 'toc')}
          onChapterSelect={(chapterNo) => onPageChange(`chapter-${chapterNo}`)}
        
        />
      );

    case 'glossary':
      return (
        <Content 
        section={BookSection.GLOSSARY}  
        bookData={bookData} 
          editMode={editMode}
          setEditMode={setEditMode}
          refetchBook={refetchBook}
          />
      );

    case 'index':
      return (
        <Content 
        section={BookSection.INDEX}  
        bookData={bookData} 
          editMode={editMode}
          refetchBook={refetchBook}
          setEditMode={setEditMode}
        />
      );

    case 'references':
      return (
        <Content 
        section={BookSection.REFERENCES}  
        bookData={bookData} 
        editMode={editMode}
        refetchBook={refetchBook}
        setEditMode={setEditMode}
        />
      );

   
    default:
      if (currentPage.startsWith('chapter-')) {
        const chapterNum = parseInt(currentPage.split('-')[1]);
        const chapter = JSON.parse(JSON.stringify(bookData.bookChapter.find(
          (c: any) => c.chapterNo === chapterNum
        )));

        if (chapter && chapter.chapterInfo?.startsWith("<")) {
          const markdown = turndown.turndown(chapter.chapterInfo).replace(/ \#/gm, '\n\n#').replace("\\#", '\n\n#');
          chapter.chapterInfo = markdown;
        }
        
        return chapter ? (
          <ChapterContent
            chapter={chapter}
            totalChapters={bookData.bookChapter.length}
            bookGenerationId={bookData.id}
            editMode={editMode}
            onUpdate={onUpdate}
            onNavigate={(chapterNo) => onPageChange(`chapter-${chapterNo}`)}
          />
        ) : (
          <div className="text-center text-gray-500">Chapter not found</div>
        );
      }

      return (
        <div className="text-center text-gray-500">
          Select a section from the navigation
        </div>
      );
  }
};

// Update ImageUpload component props interface
interface ImageUploadProps {
  currentImage: string;
  onImageUpdate: (file: File) => void;
  label: string;
  isEditing: boolean;
  bookId: number;
  imageType: 'cover' | 'backCover';
}

// Updated ImageUpload component
const ImageUpload = ({ currentImage, onImageUpdate, label, isEditing, bookId, imageType }: ImageUploadProps) => {
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [imageVersion, setImageVersion] = useState(Date.now()); // Add this for cache busting

  // Helper function to refresh the image
  const refreshImage = () => {
    setImageVersion(Date.now());
  };

  // Handle successful image update
  const handleImageUpdate = (file: File) => {
    onImageUpdate(file);
    // Schedule a refresh after a short delay to allow the server to process
    setTimeout(refreshImage, 1000);
  };

  return (
    <div className="relative group">
      <img
        src={`${BASE_URl}/uploads/${currentImage}?v=${imageVersion}`} // Add cache busting parameter
        alt={label}
        className="w-full h-auto rounded-lg shadow-2xl"
        onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/400x600/f59e0b/ffffff?text=No+Cover';
        }}
      />
      {isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          {/* Change Image */}
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpdate(file);
              }}
            />
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
              <Image className="w-4 h-4" />
              <span>Change Image</span>
            </div>
          </label>

          {/* Regenerate Image */}
          <button
            onClick={() => setIsRegenerateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            <ReloadIcon className="w-4 h-4" />
            <span>Regenerate Image</span>
          </button>
        </div>
      )}

      <RegenerateImageModal
        isOpen={isRegenerateModalOpen}
        onClose={() => {
          setIsRegenerateModalOpen(false);
          refreshImage(); // Refresh image after modal closes
        }}
        bookId={bookId}
        imageType={imageType}
      />
    </div>
  );
};

export default BookModel;