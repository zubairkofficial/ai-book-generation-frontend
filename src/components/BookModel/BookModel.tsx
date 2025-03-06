import { FormEvent, SetStateAction, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  Loader2, Edit2, Image,
  BookOpen, List, Heart, BookmarkIcon, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetchBookByIdQuery, useUpdateChapterMutation,  useUpdateImageMutation, useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { BASE_URl } from '@/constant';
import { ReloadIcon } from '@radix-ui/react-icons';
import { RegenerateImageModal } from './RegenerateImageModal';
import { CoverContent } from './CoverContent';
import { DedicationContent } from './DedicationContent';
import { PrefaceContent } from './PrefaceContent';
import { GlossaryContent } from './GlossaryContent';
import { IndexContent } from './IndexContent';
import { ReferencesContent } from './ReferencesContent';
import { TableOfContentsContent } from './TableOfContentsContent';
import { markdownComponents } from '@/utils/markdownUtils';


const PAGES: PageContent[] = [
  { id: 'cover', icon: <BookOpen className="w-4 h-4" />, label: 'Cover' },
  { id: 'dedication', icon: <Heart className="w-4 h-4" />, label: 'Dedication' },
  { id: 'preface', icon: <BookmarkIcon className="w-4 h-4" />, label: 'Preface' },
  { id: 'toc', icon: <List className="w-4 h-4" />, label: 'Contents' },
  { id: 'glossary', icon: <Users className="w-4 h-4" />, label: 'Glossary' },
  { id: 'index', icon: <List className="w-4 h-4" />, label: 'Index' },
  { id: 'references', icon: <BookmarkIcon className="w-4 h-4" />, label: 'References' },
  { id: 'backCover', icon: <BookOpen className="w-4 h-4" />, label: 'Back Cover' },
];


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
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingContent, setPendingContent] = useState<string>('');
  // API Hooks
  const { data: book, isLoading } = useFetchBookByIdQuery(bookId, {
    skip: !bookId,
  });
  const [updateChapter] = useUpdateChapterMutation();
  const [updateImage] = useUpdateImageMutation();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();

  // Updated handleFormat function for better text formatting
 


  // Handle image update
  const handleImageUpdate = async (file: File, type: 'cover' | 'backCover') => {
    if (!bookId) return;

    try {
      await updateImage({
        bookId,
        imageType: type,
        image: file
      }).unwrap();
    } catch (error) {
      console.error('Failed to update image:', error);
    }
  };

  // Handle content update
  const handleContentUpdate = async (content: string, pageType?: string) => {
    if (!bookId || !book?.data) return;
    
    setHasChanges(false); // Reset changes flag after save
    
    try {
      // Add logic to handle different page types
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
          
        // ... handle other page types
        default:
          // Handle chapter updates
          if (typeof pageType === 'number') {
            // Chapter update logic here
          }
      }
    } catch (error) {
      console.error('Failed to update content:', error);
      // Optionally add user feedback for error
      setHasChanges(true); // Indicate that changes weren't saved
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
        <div className="mb-4 px-2">
          <div className="h-1 w-8 bg-amber-500 rounded-full mb-1" />
          <div className="h-1 w-6 bg-amber-300 rounded-full" />
        </div>
        
        {PAGES.map(page => (
          <Button
            key={page.id}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(page.id)}
            className={`
              ${navStyles.button.base}
              ${currentPage === page.id ? navStyles.button.active : navStyles.button.inactive}
              group
            `}
            title={page.label}
          >
            <div className="flex items-center gap-3 px-2 py-1">
              <div className={`
                ${currentPage === page.id ? 'text-amber-700' : 'text-gray-500'}
                group-hover:text-amber-600 transition-colors
              `}>
                {page.icon}
              </div>
              <span className={`
                hidden lg:block text-sm font-medium
                transition-all duration-200
                ${currentPage === page.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-60'}
                group-hover:translate-x-0 group-hover:opacity-100
              `}>
                {page.label}
              </span>
            </div>
          </Button>
        ))}
        
        <div className="mt-4 px-2">
          <div className="h-1 w-6 bg-amber-300 rounded-full mb-1" />
          <div className="h-1 w-8 bg-amber-500 rounded-full" />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={navStyles.mobile}>
        <div className="flex justify-around items-center">
          {PAGES.map(page => (
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
          ))}
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
    <div className="min-h-screen bg-gray-100">
      <NavigationButtons />

      {/* Edit Mode Toggle */}
      <div className="fixed right-4 top-4">
        <Button
          variant={editMode ? "default" : "outline"}
          onClick={() => setEditMode(!editMode)}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {editMode ? 'Editing' : 'Edit'}
        </Button>
      </div>

      {/* Book Content */}
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl mx-auto min-h-[800px] p-8">
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
              handleContentUpdate,
              setCurrentPage,
              handleImageUpdate,
              setHasChanges
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
  onUpdate: (content: string, pageType?: string) => void,
  onPageChange: (page: string) => void,
  onImageUpdate: (file: File, type: 'cover' | 'backCover') => void,
  setHasChanges: { (value: SetStateAction<boolean>): void; (arg0: boolean): void; }

): JSX.Element => {
  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      className="prose max-w-none"
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );

  switch (currentPage) {
    case 'cover':
      return (
        <div className="flex flex-col items-center justify-center min-h-[800px] text-center space-y-8 relative">
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
            setHasChanges={setHasChanges}
          />
          {/* Copyright Notice */}
          <div className="text-sm text-gray-500 mt-4">
            © {new Date().getFullYear()} {bookData.authorName}. All rights reserved.
          </div>
        </div>
      );

    case 'dedication':
      return (
        <DedicationContent
          bookData={bookData}
          editMode={editMode}
          onUpdate={(content) => onUpdate(content, 'dedication')}
        />
      );

    case 'preface':
      return (
        <PrefaceContent
          bookData={bookData}
          editMode={editMode}
          setHasChanges={setHasChanges}
        />
      );

    case 'toc':
      return (
        <TableOfContentsContent 
          bookData={bookData} 
          editMode={editMode}
          onUpdate={(content) => onUpdate(content, 'toc')}
        />
      );

    case 'glossary':
      return (
        <GlossaryContent 
          bookData={bookData} 
          editMode={editMode}
          onUpdate={(content) => onUpdate(content, 'glossary')}
        />
      );

    case 'index':
      return (
        <IndexContent 
          bookData={bookData} 
          editMode={editMode}
          onUpdate={(content) => onUpdate(content, 'index')}
        />
      );

    case 'references':
      return (
        <ReferencesContent 
          bookData={bookData} 
          editMode={editMode}
          onUpdate={(content) => onUpdate(content, 'references')}
        />
      );

    case 'backCover':
      return (
        <div className="flex flex-col items-center justify-center min-h-[800px] text-center space-y-8 relative">
          <div className="relative w-full max-w-2xl">
            <ImageUpload
              currentImage={bookData.additionalData.backCoverImageUrl}
              onImageUpdate={(file) => onImageUpdate(file, 'backCover')}
              label="Back Cover"
              isEditing={editMode}
              bookId={bookData.id}
              imageType="backCover"
            />
          </div>
          <div 
            className="space-y-6 max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg"
            contentEditable={editMode}
            onBlur={(e) => onUpdate(e.currentTarget.textContent || '')}
          >
            <h2 className="text-2xl font-bold">About this Book</h2>
            <p className="text-gray-700">{bookData.bookDescription || bookData.ideaCore}</p>
          </div>
        </div>
      );

    default:
      if (currentPage.startsWith('chapter-')) {
        const chapterNum = parseInt(currentPage.split('-')[1]);
        const chapter = bookData.bookChapter.find((c: any) => c.chapterNo === chapterNum);
        
        return chapter ? (
          <div 
            contentEditable={editMode}
            onBlur={(e) => onUpdate(e.currentTarget.textContent || '', chapter.chapterNo.toString())}
            className={editMode ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg' : ''}
          >
            {renderMarkdown(chapter.chapterInfo)}
          </div>
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

  return (
    <div className="relative group">
      <img
        src={`${BASE_URl}/uploads/${currentImage}`}
        alt={label}
        className="w-full h-auto rounded-lg shadow-2xl"
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
                if (file) onImageUpdate(file);
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
        onClose={() => setIsRegenerateModalOpen(false)}
        bookId={bookId}
        imageType={imageType}
      />
    </div>
  );
};

// Add this to your types
interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  isEditing: boolean;
}

// Update the ContentEditor component to use modern clipboard API


export default BookModel;

