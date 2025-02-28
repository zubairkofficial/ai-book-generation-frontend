import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Loader2, Edit2, Image,  Bold, Italic, 
  AlignLeft, AlignCenter, AlignRight,
  BookOpen, List, Heart, BookmarkIcon, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFetchBookByIdQuery, useUpdateChapterMutation, useUpdateStyleMutation, useUpdateImageMutation } from '@/api/bookApi';
import { BASE_URl } from '@/constant';
import debounce from 'lodash/debounce';

// Types
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

interface PageContent {
  id: string;
  icon: JSX.Element;
  label: string;
}

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

export interface Book {
  id: number;
  bookTitle: string;
  authorName: string;
  genre: string;
  numberOfChapters: number;
  additionalData: {
    fullContent: string;
    coverImageUrl: string;
    backCoverImageUrl: string;
    tableOfContents: string;
  };
  bookChapter: Array<{
    id: number;
    chapterNo: number;
    chapterInfo: string;
  }>;
}

export interface BookModelProps {
  book: Book;
}

// Add these font options
const FONT_OPTIONS = [
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Palatino', value: 'Palatino' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Bookman', value: 'Bookman' },
  { label: 'Baskerville', value: 'Baskerville' }
];

const FONT_SIZES = [
  '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'
];

// Add a helper function to convert HTML to Markdown
const htmlToMarkdown = (html: string): string => {
  // Replace heading tags with markdown
  let markdown = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/g, '##### $1\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/g, '###### $1\n');

  // Replace bold and italic
  markdown = markdown
    .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');

  return markdown;
};

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
  const [pendingStyle, setPendingStyle] = useState<TextStyle | null>(null);

  // API Hooks
  const { data: book, isLoading } = useFetchBookByIdQuery(bookId, {
    skip: !bookId,
  });
  const [updateChapter] = useUpdateChapterMutation();
  const [updateStyle] = useUpdateStyleMutation();
  const [updateImage] = useUpdateImageMutation();

  // Create a debounced version of the style update
  const debouncedStyleUpdate = useCallback(
    debounce((newStyle: TextStyle) => {
      if (!bookId) return;

      updateStyle({
        bookId,
        pageType: currentPage,
        chapterNo: currentPage.startsWith('chapter-') 
          ? parseInt(currentPage.split('-')[1]) 
          : undefined,
        style: newStyle
      }).unwrap()
        .catch(error => console.error('Failed to update style:', error));
    }, 1000), // Wait 1 second after last change before making API call
    [bookId, currentPage]
  );

  // Handle text formatting
  const handleFormat = (format: 'h1' | 'h2' | 'h3' | 'bold' | 'italic') => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    let markdownFormat = '';
    switch (format) {
      case 'h1':
        markdownFormat = `# ${selectedText}`;
        break;
      case 'h2':
        markdownFormat = `## ${selectedText}`;
        break;
      case 'h3':
        markdownFormat = `### ${selectedText}`;
        break;
      case 'bold':
        markdownFormat = `**${selectedText}**`;
        break;
      case 'italic':
        markdownFormat = `*${selectedText}*`;
        break;
    }

    // Replace selected text with markdown
    const newText = document.createTextNode(markdownFormat);
    range.deleteContents();
    range.insertNode(newText);

    // Update the content state but don't trigger API call yet
    const container = range.commonAncestorContainer.parentElement;
    if (container) {
      setTextStyle(prevStyle => ({ ...prevStyle, [format]: markdownFormat }));
    }
  };

  // Debounced content update
  const debouncedContentUpdate = useCallback(
    debounce((content: string, pageType?: string) => {
      if (!bookId) return;

      // Convert HTML to Markdown before saving
      const markdownContent = htmlToMarkdown(content);

      updateChapter({
        chapterNo: pageType && !isNaN(Number(pageType)) ? Number(pageType) : -1,
        bookGenerationId: bookId,
        updateContent: markdownContent
      }).unwrap()
        .catch(error => console.error('Failed to update content:', error));
    }, 1000),
    [bookId]
  );

  // Handle style update
  const handleStyleUpdate = async (newStyle: TextStyle) => {
    if (!bookId) return;

    try {
      await updateStyle({
        bookId,
        pageType: currentPage,
        chapterNo: currentPage.startsWith('chapter-') 
          ? parseInt(currentPage.split('-')[1]) 
          : undefined,
        style: newStyle
      }).unwrap();
      
      // Update local state
      setTextStyle(newStyle);
    } catch (error) {
      console.error('Failed to update style:', error);
    }
  };

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
    if (!bookId) return;

    try {
      // Add logic to handle different page types
      switch (pageType) {
        case 'cover':
          // Update cover content
          break;
        case 'dedication':
          // Update dedication content
          break;
        case 'preface':
          // Update preface content
          break;
        // ... handle other page types
        default:
          // Handle chapter updates
          if (typeof pageType === 'number') {
            await updateChapter({
              chapterNo: pageType,
              bookGenerationId: bookId,
              updateContent: content
            }).unwrap();
          }
      }
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  // Handle update button click
  const handleUpdate = async () => {
    if (!bookId || !hasChanges) return;
    try {
      // Handle content update
      if (pendingContent) {
        await updateChapter({
          chapterNo: currentPage.startsWith('chapter-') 
            ? parseInt(currentPage.split('-')[1]) 
            : -1,
          bookGenerationId: bookId,
          updateContent: pendingContent
        }).unwrap();
      }

      // Handle style update
      if (pendingStyle) {
        await updateStyle({
          bookId,
          pageType: currentPage,
          style: pendingStyle
        }).unwrap();
      }

      // Reset states
      setPendingContent('');
      setPendingStyle(null);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  // Render markdown content
  const renderMarkdown = (content: string) => (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      className="prose max-w-none"
      components={{
        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-3" {...props} />,
        p: ({node, ...props}) => <p className="mb-4" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

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
                ${currentPage === page.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}
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

  // Update the editing tools component
  const renderEditingTools = () => (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex flex-wrap gap-4 items-center max-w-3xl">
      {/* Heading Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h1')}
          title="Heading 1"
        >
          H1
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h2')}
          title="Heading 2"
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('h3')}
          title="Heading 3"
        >
          H3
        </Button>
      </div>

      {/* Text Style Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          className={textStyle.bold ? 'bg-amber-100' : ''}
        >
          <Bold className={`w-4 h-4 ${textStyle.bold ? 'text-amber-600' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          className={textStyle.italic ? 'bg-amber-100' : ''}
        >
          <Italic className={`w-4 h-4 ${textStyle.italic ? 'text-amber-600' : ''}`} />
        </Button>
      </div>

      {/* Alignment Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newStyle:TextStyle = { ...textStyle, align: 'left' };
            handleStyleUpdate(newStyle);
          }}
          className={textStyle.align === 'left' ? 'bg-amber-100' : ''}
        >
          <AlignLeft className={`w-4 h-4 ${textStyle.align === 'left' ? 'text-amber-600' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newStyle:TextStyle = { ...textStyle, align: 'center' };
            handleStyleUpdate(newStyle);
          }}
          className={textStyle.align === 'center' ? 'bg-amber-100' : ''}
        >
          <AlignCenter className={`w-4 h-4 ${textStyle.align === 'center' ? 'text-amber-600' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newStyle:TextStyle = { ...textStyle, align: 'right' };
            handleStyleUpdate(newStyle);
          }}
          className={textStyle.align === 'right' ? 'bg-amber-100' : ''}
        >
          <AlignRight className={`w-4 h-4 ${textStyle.align === 'right' ? 'text-amber-600' : ''}`} />
        </Button>
      </div>

      {/* Font Family Selector */}
      <select
        value={textStyle.fontFamily}
        onChange={(e) => {
          const newStyle:TextStyle = { ...textStyle, fontFamily: e.target.value };
          handleStyleUpdate(newStyle);
        }}
        className="px-2 py-1 border rounded-md text-sm"
      >
        {FONT_OPTIONS.map(font => (
          <option key={font.value} value={font.value}>{font.label}</option>
        ))}
      </select>

      {/* Font Size Selector */}
      <select
        value={textStyle.fontSize}
        onChange={(e) => {
          const newStyle:TextStyle = { ...textStyle, fontSize: e.target.value };
          handleStyleUpdate(newStyle);
        }}
        className="px-2 py-1 border rounded-md text-sm w-20"
      >
        {FONT_SIZES.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>

      {/* Color Picker */}
      <input
        type="color"
        value={textStyle.color}
        onChange={(e) => {
          const newStyle:TextStyle = { ...textStyle, color: e.target.value };
          handleStyleUpdate(newStyle);
        }}
        className="w-8 h-8 rounded cursor-pointer"
      />

      {/* Line Height Control */}
      <select
        value={textStyle.lineHeight}
        onChange={(e) => {
          const newStyle:TextStyle = { ...textStyle, lineHeight: e.target.value };
          handleStyleUpdate(newStyle);
        }}
        className="px-2 py-1 border rounded-md text-sm w-24"
      >
        <option value="1.2">Compact</option>
        <option value="1.6">Normal</option>
        <option value="2.0">Relaxed</option>
      </select>

      {/* Letter Spacing Control */}
      <select
        value={textStyle.letterSpacing}
        onChange={(e) => {
          const newStyle:TextStyle = { ...textStyle, letterSpacing: e.target.value };
          handleStyleUpdate(newStyle);
        }}
        className="px-2 py-1 border rounded-md text-sm w-24"
      >
        <option value="-.05em">Tight</option>
        <option value="normal">Normal</option>
        <option value=".05em">Spaced</option>
      </select>
    </div>
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
              handleImageUpdate
            )}
          </div>
        </div>
      </div>

      {editMode && renderEditingTools()}
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
  onImageUpdate: (file: File, type: 'cover' | 'backCover') => void
): JSX.Element => {
  const renderMarkdown = (content: string) => (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      className="prose max-w-none"
      components={{
        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-6 text-gray-900" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-4 text-gray-800" {...props} />,
        p: ({node, ...props}) => <p className="mb-6 text-gray-700 leading-relaxed" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
        em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  );

  const handleContentChange = async (content: string, pageType?: string) => {
    // if (!bookId) return;

    try {
      switch (pageType) {
        case 'cover':
        case 'dedication':
        case 'preface':
        case 'glossary':
        case 'references':
        case 'backCover':
        case 'index':
          await onUpdate(content, pageType);
          break;
        default:
          if (pageType && !isNaN(Number(pageType))) {
            await onUpdate(content, pageType);
          }
      }
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

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
            />
          </div>
          <div 
            className="space-y-6 max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg"
            contentEditable={editMode}
            onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
          >
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {bookData.bookTitle}
            </h1>
            
            <div className="space-y-2">
              <p className="text-2xl text-gray-700">by</p>
              <p className="text-3xl font-semibold text-gray-800">{bookData.authorName}</p>
            </div>

            {/* Additional Book Information */}
            <div className="grid grid-cols-2 gap-4 text-left mt-8 text-gray-600">
              <div>
                <p className="font-semibold">Publisher</p>
                <p>{bookData.authorName || "AiBookPublisher"}</p>
              </div>
              <div>
                <p className="font-semibold">Language</p>
                <p>{bookData.language || "English"}</p>
              </div>
              <div>
                <p className="font-semibold">Genre</p>
                <p>{bookData.genre}</p>
              </div>
              <div>
                <p className="font-semibold">Chapters</p>
                <p>{bookData.numberOfChapters}</p>
              </div>
            </div>

            {/* Core Idea / Book Description */}
            <div className="mt-8 text-left">
              <p className="font-semibold text-gray-700">About this book:</p>
              <p className="text-gray-600 mt-2 leading-relaxed">
                {bookData.ideaCore}
              </p>
            </div>

            {/* Author Bio if available */}
            {bookData.authorBio && (
              <div className="mt-8 text-left">
                <p className="font-semibold text-gray-700">About the Author:</p>
                <p className="text-gray-600 mt-2">
                  {bookData.authorBio}
                </p>
              </div>
            )}
          </div>

          {/* Copyright Notice */}
          <div className="text-sm text-gray-500 mt-4">
            © {new Date().getFullYear()} {bookData.authorName}. All rights reserved.
          </div>
        </div>
      );

    case 'dedication':
      return (
        <div className="min-h-[800px] flex flex-col items-center justify-center px-8 py-12">
          <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
            <h1 className="text-3xl font-serif text-center mb-8 text-gray-900">Dedication</h1>
            <ContentEditor
              content={bookData.additionalData.fullContent
                .split('Dedication\n')[1]
                .split('\n\n')[0]}
              onChange={(content) => handleContentChange(content, 'dedication')}
              isEditing={editMode}
            />
          </div>
        </div>
      );

    case 'preface':
      const prefaceContent = bookData.additionalData.fullContent
        .split('Preface\n')[1]
        ?.split('Glossary')[0] || '';

      return (
        <div className="min-h-[800px] px-8 py-12">
          <div 
            className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg"
            contentEditable={editMode}
            onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
          >
            <h1 className="text-4xl  text-center mb-12 text-gray-900">Preface</h1>
            
            <div className="space-y-8">
              {/* Overview Section */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Overview</h2>
                <div className="prose max-w-none text-gray-700">
                  {renderMarkdown(
                    prefaceContent.includes('**Overview**') 
                      ? prefaceContent.split('**Overview**')[1].split('**Use')[0]
                      : ''
                  )}
                </div>
              </section>

              {/* Use in Curriculum Section */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Use in Curriculum</h2>
                <div className="prose max-w-none text-gray-700">
                  {renderMarkdown(
                    prefaceContent.includes('**Use in Curriculum**')
                      ? prefaceContent.split('**Use in Curriculum**')[1].split('**Goals**')[0]
                      : ''
                  )}
                </div>
              </section>

              {/* Goals Section */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Goals</h2>
                <div className="prose max-w-none text-gray-700">
                  {renderMarkdown(
                    prefaceContent.includes('**Goals**')
                      ? prefaceContent.split('**Goals**')[1].split('**Acknowledgments**')[0]
                      : ''
                  )}
                </div>
              </section>

              {/* Acknowledgments Section */}
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Acknowledgments</h2>
                <div className="prose max-w-none text-gray-700">
                  {renderMarkdown(
                    prefaceContent.includes('**Acknowledgments**')
                      ? prefaceContent.split('**Acknowledgments**')[1].split('With anticipation')[0]
                      : ''
                  )}
                </div>
              </section>

              {/* Author Signature */}
              <div className="mt-12 text-right italic text-gray-700">
                <p className="mb-2">With anticipation and excitement,</p>
                <p className="font-semibold">{bookData.authorName}</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'toc':
      return (
        <div 
          className="space-y-6"
          contentEditable={editMode}
          onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
        >
          <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
          <div className="space-y-2">
            {bookData.bookChapter.map((chapter: any) => (
              <div key={chapter.id} className="flex justify-between items-center py-2 border-b">
                <span className="text-lg">
                  {chapter.chapterInfo.split('\n')[0].replace('# ', '')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(`chapter-${chapter.chapterNo}`)}
                >
                  Read
                </Button>
              </div>
            ))}
          </div>
        </div>
      );

    case 'glossary':
      return (
        <div 
          className={`space-y-6 ${editMode ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg' : ''}`}
          contentEditable={editMode}
          onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
        >
          <h2 className="text-2xl font-bold mb-4">Glossary</h2>
          {renderMarkdown(bookData.additionalData.fullContent.split('Glossary\n')[1])}
        </div>
      );

    case 'references':
      return (
        <div 
          className={`space-y-6 ${editMode ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg' : ''}`}
          contentEditable={editMode}
          onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
        >
          <h2 className="text-2xl font-bold mb-4">References</h2>
          {renderMarkdown(bookData.additionalData.fullContent.split('References\n')[1])}
        </div>
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
            />
          </div>
          <div 
            className="space-y-6 max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg"
            contentEditable={editMode}
            onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
          >
            <h2 className="text-2xl font-bold">About this Book</h2>
            <p className="text-gray-700">{bookData.bookDescription || bookData.ideaCore}</p>
          </div>
        </div>
      );

    case 'index':
      return (
        <div 
          className={`space-y-6 ${editMode ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg' : ''}`}
          contentEditable={editMode}
          onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
        >
          <h2 className="text-2xl font-bold mb-4">Index</h2>
          {renderMarkdown(bookData.additionalData.fullContent.split('Index\n')[1].split('Preface')[0])}
        </div>
      );

    default:
      if (currentPage.startsWith('chapter-')) {
        const chapterNum = parseInt(currentPage.split('-')[1]);
        const chapter = bookData.bookChapter.find((c: any) => c.chapterNo === chapterNum);
        
        return chapter ? (
          <div 
            contentEditable={editMode}
            onBlur={(e) => handleContentChange(e.currentTarget.textContent || '', chapter.chapterNo.toString())}
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
}

// Updated ImageUpload component
const ImageUpload = ({ currentImage, onImageUpdate, label, isEditing }: ImageUploadProps) => (
  <div className="relative group">
    <img
      src={`${BASE_URl}/uploads/${currentImage}`}
      alt={label}
      className="w-full h-auto rounded-lg shadow-2xl"
    />
    {isEditing && (
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
      </div>
    )}
  </div>
);

// Add this to your types
interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  isEditing: boolean;
}

// Create a reusable content editor component
const ContentEditor: React.FC<ContentEditorProps> = ({ content, onChange, isEditing }) => {
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    onChange(newContent);
  };

  return (
    <div
      contentEditable={isEditing}
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: content }}
      className={`prose max-w-none ${isEditing ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg' : ''}`}
    />
  );
};

export default BookModel;

