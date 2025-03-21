import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URl, ToastType } from '@/constant';
import { UpdateBookGenerateRequest, useCreateChapterMutation, useFetchBooksQuery, useUpdateChapterMutation, useGenerateBookEndContentMutation, useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { useToast } from '@/context/ToastContext';
import { Textarea } from '@/components/ui/textarea';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Settings, RotateCw,  Loader2,  ArrowLeft, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { ChapterConfigurationProps, ChapterConfig } from './types/chapter.types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import BookEndContentGenerator from './components/BookEndContentGenerator';



interface SelectedContent {
  text: string;
  index: number;
}

interface TextFormat {
  isBold: boolean;
  isItalic: boolean;
  color: string;
  fontSize: string;
}



const ChapterConfiguration: React.FC<ChapterConfigurationProps> = ({ previousContent }) => {
  const navigate = useNavigate()
  const location=useLocation()
  const inComplete=location.pathname==="/books/chapter-configuration"
    const {  refetch: refetchAllBooks }:any = useFetchBooksQuery({});
  
  // Safely get book data from either location state or prop
  const getBooksData = () => {
    try {
      // First try to get data from location state (if it exists)
      if (location.state && location.state.previousContent) {
        return typeof location.state.previousContent === 'string' 
          ? JSON.parse(location.state.previousContent) 
          : location.state.previousContent;
      }
      
      // Fall back to previousContent prop if no location state
      return typeof previousContent === 'string' 
        ? JSON.parse(previousContent || '{}') 
        : (previousContent || {});
    } catch (error) {
      console.error('Error parsing book data:', error);
      return {};
    }
  };

  const bookData = getBooksData();
  const tableOfContents = bookData?.additionalData?.tableOfContents || '';
  
  // Set initial chapter number from location state or default to 1
  const [currentChapterNo, setCurrentChapterNo] = useState(() => {
    return location.state?.initialChapter ? Number(location.state.initialChapter) : 1;
  });
  
  // Set up other state variables
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [chapterImages, setChapterImages] = useState<Array<{ title: string; url: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const streamContainerRef = useRef<HTMLDivElement>(null);
  
  const [createBookChapter] = useCreateChapterMutation();
  const [updateBookChapter] = useUpdateChapterMutation();
  const { addToast } = useToast();

  const [config, setConfig] = useState<ChapterConfig>({
    numberOfChapters: '',
    minLength: '500',
    maxLength: '1200',
    additionalInfo: '',
    imagePrompt: '',
    noOfImages: 0,
    summary: ""
  });

  const [isBookCompleted, setIsBookCompleted] = useState(false);

  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const { token } = useSelector((state: RootState) => state.auth);
console.log("selectedContent",selectedContent)
  const [textFormat, setTextFormat] = useState<TextFormat>({
    isBold: false,
    isItalic: false,
    color: 'text-gray-700',
    fontSize: 'text-base'
  });

  const [showInsertOption, setShowInsertOption] = useState(false);
  const [regeneratedContent, setRegeneratedContent] = useState('');
  // Add state for tracking editing mode
  const [editMode, setEditMode] = useState<'ai' | 'human'>('ai');
  const [humanEditContent, setHumanEditContent] = useState('');

  // Add state for end content generation
  const [endContentMode, setEndContentMode] = useState<boolean>(false);
  const [activeEndContentType, setActiveEndContentType] = useState<'glossary' | 'references' | 'index'>('glossary');
  const [endContentProgress, setEndContentProgress] = useState({
    glossary: false,
    references: false,
    index: false
  });
  const [endContentData, setEndContentData] = useState({
    glossary: '',
    references: '',
    index: ''
  });
  const [additionalEndContentInfo, setAdditionalEndContentInfo] = useState('');
  const [isGeneratingEndContent, setIsGeneratingEndContent] = useState(false);
  
  // Add API hooks for end content generation
  const [generateBookEndContent] = useGenerateBookEndContentMutation();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();

  // Auto-scroll effect
  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
    }
  }, [streamedContent, chapterImages]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText) {
        const range = selection?.getRangeAt(0);
        let element = range?.commonAncestorContainer as Element;
        
        // If the selected node is a text node, get its parent
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement as Element;
        }
        
        // Find the closest parent with data-paragraph-index
        const paragraphElement = element.closest('[data-paragraph-index]');
        if (paragraphElement) {
          const index = parseInt(paragraphElement.getAttribute('data-paragraph-index') || '-1');
          if (index !== -1) {
            setSelectedContent({ 
              text: selectedText, 
              index: index // Store the actual index
            });
            setShowEditPanel(true);
          }
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleChange = (name: keyof ChapterConfig, value: string) => {
    
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleStreamedContent = (content: string, index?: number) => {
      setStreamedContent(prev => prev + content);
    
  };
  const handleRegenerateStreamedContent = (content: string, isNewChunk = true) => {
    if (isNewChunk) {
      // Store complete content as it comes in chunks
      setRegeneratedContent(prev => prev + content);
    } else {
      // Replace content entirely (for error cases or resets)
      setRegeneratedContent(content);
    }
  };

  // Add a ref to track seen content

  const handleChapterGeneration = async (input: ChapterConfig) => {
    try {
        // Convert inputs to numbers
        const minWords = +input.minLength;
        const maxWords = +input.maxLength;
        if (!minWords || !maxWords) {
          console.error("Error: Number of characters must be provided.");
            addToast("Number of characters must be provided.",ToastType.ERROR);
            return;
        }
      
        if(Number(input.noOfImages) < 0) {
          addToast("Number of images cannot be negative.", ToastType.ERROR);
          return;
        }
        // Validation: Ensure minWords is not greater than maxWords
        if (minWords > maxWords) {
            console.error("Error: Minimum length cannot be greater than maximum length.");
            addToast("Minimum length cannot be greater than maximum length.",ToastType.ERROR);
            return;
        }

        // Validation: Ensure maxWords is not less than minWords
        if (maxWords < minWords) {
            console.error("Error: Maximum length must be greater than or equal to minimum length.");
            addToast("Maximum length must be greater than or equal to minimum length.",ToastType.ERROR);
            return;
        }

        setIsGenerating(true);
        setStreamedContent('');
        setChapterImages([]);

      const payload = {
        minWords: +input.minLength,
        maxWords: +input.maxLength,
        chapterNo: currentChapterNo,
        chapterName: getCurrentChapterTitle(),
        bookGenerationId: bookData.id,
        additionalInfo:input.additionalInfo,
        imagePrompt:input.imagePrompt,
        noOfImages:Number(input.noOfImages),
      };

      const eventSource = new EventSource(`${BASE_URl}/book-chapter/chapter-stream?token=${token}`);

      eventSource.onmessage = (event) => {
        try {
          if(!editableContent){const data = JSON.parse(event.data);
          if (data.text) {
            // For regeneration, we want to accumulate the content
            handleStreamedContent(data.text);
          } else if (data.type === 'image') {
            setChapterImages(prev => [...prev, {
              title: data.title,
              url: data.url
            }]);
          }}  
        } catch (error) {
          // If parsing fails, treat it as raw text
          handleStreamedContent(event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Stream error:', error);
        eventSource.close();
        setIsGenerating(false);
      };

      // Send chapter generation request
    const res:any=  await createBookChapter(payload).unwrap();
    if( currentChapterNo==bookData.numberOfChapters) {
      setIsBookCompleted(true);
    }
      eventSource.close();
      if(res.statusCode==200){
        setConfig(prev => ({
            ...prev,
          additionalInfo:"",
          imagePrompt:"",
          noOfImages:0,
          }))
      }

     
      setIsGenerating(false);

    } catch (error) {
      console.error('Error generating chapter:', error);
      setIsGenerating(false);
    }
  };

  // Function to get current chapter title
  const getCurrentChapterTitle = () => {
    const chapters = tableOfContents.split(/\n+/); // Split by one or more newlines
    if (currentChapterNo <= chapters.length) {
      const chapter = chapters[currentChapterNo - 1];
      return chapter
        .replace(/^Chapter \d+:\s*/, '') // Remove "Chapter X: "
        .replace(/^"(.+)"$/, '$1') // Remove surrounding quotes if present
        .replace(/\s+$/, '') // Remove trailing whitespace and newlines
        .trim();
    }
    return '';
  };

  // Function to parse table of contents
  const parseTableOfContents = () => {
    return tableOfContents
      .split(/\n+/) // Split by one or more newlines
      .map((chapter: string) => {
        return chapter
          .replace(/^Chapter \d+:\s*/, '') // Remove "Chapter X: "
          .replace(/^"(.+)"$/, '$1') // Remove surrounding quotes if present
          .replace(/\s+$/, '') // Remove trailing whitespace
          .trim();
      })
      .filter(Boolean); // Remove empty entries
  };

  // Update the progress calculation
  const calculateProgress = () => {
    const totalChapters = parseTableOfContents().length;
    return ((currentChapterNo-1) / totalChapters) * 100;
  };

  // Update where chapter count is displayed
  const getChapterCount = () => {
    return parseTableOfContents().length;
  };

  // Function to format image URL with proper slash handling
  const formatImageUrl = (url: string) => {
    if (!url) return '/placeholder-image.png';

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      
      // Clean up the URL
      const formattedUrl = url
        .replace(/\\/g, '/') // Replace backslashes with forward slashes
        .replace(/\n/g, '') // Remove newlines
        .trim();

      // Replace localhost:3000 with baseUrl if needed
      return baseUrl ? formattedUrl.replace('http://localhost:3000', baseUrl) : formattedUrl;
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return '/placeholder-image.png';
    }
  };

  // Function to format chapter content with proper error handling
  const formatChapterContent = (content: string) => {
    if (!content) return null;

    try {
      const parts = content.split(/###\s*/);
      
      return parts.map((part, index) => {
        if (index === 0) {
          return formatTextContent(part);
        }
        
        try {
          const [imageInfo, ...textParts] = part.split(']');
          if (!imageInfo) return null;

          // Extract title and URL with improved regex patterns
          const titleMatch = imageInfo.match(/###\s*"([^"]+)"|"([^"]+)"/);
          const urlMatch = textParts[0].match(/\((http[^)]+)\)/);

          if (!titleMatch || !urlMatch) return formatTextContent(part);

          const title = (titleMatch[1] || titleMatch[2]).replace(/^###\s*/, ''); // Remove ### if present
          const imageUrl = urlMatch[1];
          
          // Get the remaining text after the URL
          const remainingText = textParts[0].split(')')[1];

          return (
            <React.Fragment key={index}>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 text-center">
                {title}
              </h3>
              <div className="my-6">
                <img
                  src={formatImageUrl(imageUrl)}
                  alt={title}
                  className="rounded-lg shadow-lg w-full max-w-2xl mx-auto"
                  onError={(e) => {
                    console.error('Image failed to load:', imageUrl);
                    e.currentTarget.src = '/placeholder-image.png';
                    e.currentTarget.className = 'rounded-lg shadow-lg w-full max-w-2xl mx-auto opacity-50';
                  }}
                />
              </div>
              {formatTextContent(remainingText)}
            </React.Fragment>
          );
        } catch (error) {
          console.error('Error formatting image content:', error);
          return formatTextContent(part);
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Error formatting chapter content:', error);
      return formatTextContent(content);
    }
  };

  // Function to format text content with error handling
  const formatTextContent = (text: string) => {
    if (!text) return null;

    try {
      const parts = text.split(/###\s*/);
      
      return parts.map((part, index) => {
        if (!part.trim()) return null;

        const titleMatch = part.match(/^"([^"]+)"\s*([\s\S]*)/);
        
        if (titleMatch) {
          const [_, title, content] = titleMatch;
          return (
            <React.Fragment key={index}>
              <div className="flex items-center justify-between mt-6 mb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  {title}
                </h3>
              </div>
              <div 
                className="prose prose-amber max-w-none group relative" 
                data-paragraph-index={index}
              >
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </React.Fragment>
          );
        }

        return (
          <div 
            key={index} 
            className="prose prose-amber max-w-none group relative" 
            data-paragraph-index={index}
          >
            <ReactMarkdown>{part}</ReactMarkdown>
          </div>
        );
      }).filter(Boolean);
    } catch (error) {
      console.error('Error formatting text content:', error);
      return <p className="text-gray-700">{text}</p>;
    }
  };

  const handleNextChapter = () => {
    setCurrentChapterNo(prev => prev + 1);
    setStreamedContent('');
    setChapterImages([]);
  };

  const handleRegenerateParagraph = async (index: number, instruction: string) => {
    try {
      // Clear regenerated content at the start
      setRegeneratedContent('');
      setIsGenerating(true);
      setShowInsertOption(true);
      
      const actualIndex = selectedContent?.index || index;
      
      const payload = {
        minWords: +config.minLength,
        maxWords: +config.maxLength,
        chapterNo: currentChapterNo,
        chapterName: getCurrentChapterTitle(),
        bookGenerationId: bookData.id,
        additionalInfo: config.additionalInfo,
        imagePrompt: config.imagePrompt,
        noOfImages: Number(config.noOfImages),
        selectedText: selectedContent?.text,
        instruction: instruction,
      };

      const eventSource = new EventSource(`${BASE_URl}/book-chapter/chapter-stream?token=${token}`);
      
      // Create a variable to track full content outside the event handler
      let fullStreamContent = '';

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Streaming data:", data);
          
          if (data.text) {
            // Update our tracking variable
            fullStreamContent += data.text;
            // Replace entire content rather than appending
            setRegeneratedContent(fullStreamContent);
          } else if (data.type === 'image') {
            // Image handling stays the same
            setChapterImages(prev => {
              const exists = prev.some(img => img.url === data.url);
              if (!exists) {
                return [...prev, { title: data.title, url: data.url }];
              }
              return prev;
            });
          }
        } catch (error) {
          // For raw text or parsing errors
          fullStreamContent += event.data;
          setRegeneratedContent(fullStreamContent);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Stream error:', error);
        setIsGenerating(false);
        eventSource.close();
      };

      const res:any = await createBookChapter(payload).unwrap();
      
      if (res.statusCode === 200) {
        eventSource.close(); // Close the event source after successful completion
      }
      
      // Only set isGenerating to false after event source is closed
      setIsGenerating(false);

    } catch (error) {
      console.error('Error regenerating paragraph:', error);
      setIsGenerating(false);
    }
  };

  const handleEditClick = (content: string, index: number) => {
    // Remove markdown symbols before editing
    const cleanContent = content
      .replace(/###\s*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');
    
    setIsEditing(true);
    setEditableContent(cleanContent);
  };

  const handleSaveEdit = async () => {
    try {
      setIsGenerating(true);
      
      // Ensure bookData.id is properly parsed to a number
      const bookId = typeof bookData.id === 'string' ? parseInt(bookData.id, 10) : bookData.id;
      
      if (isNaN(bookId)) {
        throw new Error('Invalid book ID');
      }

      const updatePayload:any = {
        chapterNo: currentChapterNo,
        bookGenerationId: bookId,
        updateContent: editableContent // Use raw content without formatting
      };


      const response = await updateBookChapter(updatePayload).unwrap();
      
      if (response.statusCode === 200) {
        setStreamedContent(editableContent);
        setIsEditing(false);
        setIsGenerating(false)
        addToast("Chapter updated successfully", ToastType.SUCCESS);
      } else {
        throw new Error(response.message || 'Failed to update chapter');
      }
    } catch (error: any) {
      console.error('Update Error:', error); // Debug log
      addToast(error.message || "Failed to update chapter", ToastType.ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update handleInsertContent to handle both AI and human-edited content
  const handleInsertContent = async () => {
    if (selectedContent) {
      try {
        setIsInserting(true);        
        
        // Get the content to insert based on edit mode
        const contentToInsert = editMode === 'ai' ? regeneratedContent : humanEditContent;
        
        // Update local content first
        const updatedContent = (() => {
          const paragraphs = streamedContent.split('\n');
          let found = false;
          
          const updatedParagraphs = paragraphs.map(paragraph => {
            if (!found && paragraph.includes(selectedContent.text)) {
              found = true;
              return paragraph.replace(selectedContent.text, contentToInsert);
            }
            return paragraph;
          });
          
          return updatedParagraphs.join('\n');
        })();

        // If using human edit mode, we don't need API call for content generation
        if (editMode === 'human') {
          // Just update local state
          setStreamedContent(updatedContent);
          addToast("Content updated successfully", ToastType.SUCCESS);
        } else {
          // For AI mode, prepare and send API update as before
          const bookId = typeof bookData.id === 'string' ? parseInt(bookData.id, 10) : bookData.id;
          
          if (isNaN(bookId)) {
            throw new Error('Invalid book ID');
          }

          const updatePayload:any = {
            chapterNo: currentChapterNo,
            bookGenerationId: bookId,
            updateContent: updatedContent
          };

          const response = await updateBookChapter(updatePayload).unwrap();
          
          if (response.statusCode === 200) {
            // Update local state after successful API call
            setStreamedContent(updatedContent);
            addToast("Content updated successfully", ToastType.SUCCESS);
          } else {
            throw new Error(response.message || 'Failed to update content');
          }
        }
      } catch (error: any) {
        console.error('Update Error:', error);
        addToast(error.message || "Failed to update content", ToastType.ERROR);
      } finally {
        // Reset states after operation
        setIsInserting(false);
        setShowInsertOption(false);
        setSelectedContent(null);
        setShowEditPanel(false);
        setRegeneratedContent('');
        setHumanEditContent('');
        setEditMode('ai');
      }
    }
  };

  // Add cleanup when component unmounts or when canceling
  useEffect(() => {
    return () => {
      // Clear regenerated content when component unmounts
      setRegeneratedContent('');

    };
  }, []);

  // Effect to handle chapter navigation based on initialChapter
  useEffect(() => {
    // Check if we have existing chapters and redirect if needed
    if (bookData && bookData.bookChapter && Array.isArray(bookData.bookChapter)) {
      // Find chapters that already exist
      const existingChapters = bookData.bookChapter.map((chapter: { chapterNo: any; }) => chapter.chapterNo);
      
      // If we're starting at a specific chapter (from location.state)
      // and that chapter already exists, we might need to redirect to the next chapter to generate
      if (location.state?.initialChapter) {
        const initialChapter = Number(location.state.initialChapter);
        const nextChapterToGenerate = findNextChapterToGenerate(existingChapters, bookData.numberOfChapters);
        
        // If the initial chapter is already generated but there are more chapters to generate,
        // update to the next chapter that needs generation
        if (existingChapters.includes(initialChapter) && nextChapterToGenerate !== initialChapter) {
          setCurrentChapterNo(nextChapterToGenerate);
          addToast(`Redirecting to chapter ${nextChapterToGenerate} which needs to be generated`, ToastType.INFO);
        }
      }
    }
  }, [bookData, location.state]);

  // Helper function to find the next chapter that needs to be generated
  const findNextChapterToGenerate = (existingChapters: number[], totalChapters: number): number => {
    for (let i = 1; i <= totalChapters; i++) {
      if (!existingChapters.includes(i)) {
        return i;
      }
    }
    return 1; // Default to chapter 1 if all chapters exist
  };

  const handleChapterBack=async()=>{
   await refetchAllBooks()
    navigate(-1)
  }

  // Add effect to check if book is complete but missing end content
  useEffect(() => {
    if (bookData && bookData.type === "incomplete"&&bookData.numberOfChapters<=bookData.bookChapter?.length) {
      // Check if any of the end content sections are missing
      const needsEndContent = !bookData.glossary || !bookData.index || !bookData.references;
      
      if (needsEndContent) {
        // Switch to end content generation mode
        setEndContentMode(true);
      }
    }
  }, [bookData]);

  return (
    <div className="container mx-auto px-4 py-8">
      {endContentMode ? (
        // Use the BookEndContentGenerator component for end content generation
        <BookEndContentGenerator 
          bookId={typeof bookData.id === 'string' ? parseInt(bookData.id, 10) : bookData.id}
          bookTitle={bookData.bookTitle || "Your Book"}
          // initialContent={{
          //   glossary: bookData.glossary || '',
          //   references: bookData.references || '', // Note the typo in API field name
          //   index: bookData.index || ''
          // }}
          // initialProgress={{
          //   glossary: !!bookData.glossary, 
          //   references: !!bookData.references, 
          //   index: !!bookData.index
          // }}
          onComplete={() => {
            // Refetch all books to update data after completion
            refetchAllBooks();
            // Navigate back to books page
            navigate('/books');
          }}
        />
      ) : isBookCompleted ? (
        // Show completion UI with option to add end content
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">
            🎉 Congratulations!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully completed all chapters of your book.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => setEndContentMode(true)}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Add Glossary, Index & References
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/books')}
            >
              View All Books
            </Button>
          </div>
        </Card>
      ) : (
        <>
        {inComplete?
         <Button 
                     onClick={handleChapterBack}
                     className="mr-4 px-4 py-2 hover:bg-amber-100 rounded-md flex items-center bg-amber-50 text-amber-500"
                   >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>:""}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chapter Generation
            </h1>
            <p className="text-gray-600">
              Generating chapter {currentChapterNo} of {tableOfContents.split('\n').length}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
                {showEditPanel ? (
              <Card className="p-6 h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-semibold">Edit Content</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label>Selected Text</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg overflow-y-auto h-[100px]">
                      {selectedContent?.text}
                    </div>
                  </div>
                  
                  {/* Add edit mode selection */}
                  <div className="flex gap-4 items-center">
                    <Label className="font-medium">Edit Mode:</Label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        id="ai-edit" 
                        name="edit-mode" 
                        checked={editMode === 'ai'} 
                        onChange={() => setEditMode('ai')} 
                      />
                      <Label htmlFor="ai-edit" className="cursor-pointer">AI</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        id="human-edit" 
                        name="edit-mode" 
                        checked={editMode === 'human'} 
                        onChange={() => setEditMode('human')} 
                      />
                      <Label htmlFor="human-edit" className="cursor-pointer">Human</Label>
                    </div>
                  </div>

                  {editMode === 'human' ? (
                    <div>
                      <Label>Human Edit</Label>
                      <Textarea 
                        value={humanEditContent || selectedContent?.text || ''}
                        onChange={(e) => setHumanEditContent(e.target.value)}
                        className="mt-1 min-h-[150px]"
                        placeholder="Edit the text directly..."
                      />
                      <div className="flex gap-2 mt-4">
                        <Button
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={handleInsertContent}
                          disabled={isInserting}
                        >
                          {isInserting ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Inserting...</span>
                            </div>
                          ) : (
                            "Insert Edited Content"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowEditPanel(false);
                            setHumanEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : showInsertOption ? (
                    <>
                      <div>
                        <Label>Regenerated Content</Label>
                        <div className="mt-1 p-3 bg-amber-50 rounded-lg overflow-y-auto h-[150px]">
                          {regeneratedContent ? (
                            <div className="prose prose-amber max-w-none">
                              <ReactMarkdown>
                                {regeneratedContent}
                              </ReactMarkdown>
                              {isGenerating && <span className="animate-pulse">|</span>}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating content...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                           className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={handleInsertContent}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Generating...</span>
                            </div>
                          ):isInserting?
                          <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Inserting...</span>
                        </div>
                           : (
                            "Insert Content"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowInsertOption(false);
                            setRegeneratedContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="editInstruction">Instructions</Label>
                        <Textarea
                          id="editInstruction"
                          value={editInstruction}
                          onChange={(e) => setEditInstruction(e.target.value)}
                          placeholder="Provide instructions for regenerating this content..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => {
                            setShowInsertOption(true);
                            setRegeneratedContent('');
                            selectedContent && handleRegenerateParagraph(selectedContent.index, editInstruction);
                          }}
                          disabled={isGenerating}
                        >
                          {isGenerating ? 'Regenerating...' : 'Regenerate'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowEditPanel(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ) : (
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5 text-amber-500" />
                    <h2 className="text-xl font-semibold">Chapter Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minLength">Min Words</Label>
                        <Input
                          id="minLength"
                          type="number"
                          value={config.minLength}
                          onChange={(e) => handleChange('minLength', e.target.value)}
                          className="mt-1"
                          placeholder="500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxLength">Max Words</Label>
                        <Input
                          id="maxLength"
                          type="number"
                          value={config.maxLength}
                          onChange={(e) => handleChange('maxLength', e.target.value)}
                          className="mt-1"
                          placeholder="1000"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="noOfImages">Number of Images (Optional)</Label>
                      </div>
                      <Input
                        id="noOfImages"
                        type="number"
                        min="0"
                        max="3"
                        value={config.noOfImages}
                        onChange={(e) => handleChange('noOfImages', e.target.value)}
                        className="mt-1"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave as 0 for no images
                      </p>
                    </div>

                    {/* <div>
                      <Label htmlFor="imagePrompt">Image Description</Label>
                      <Textarea
                        id="imagePrompt"
                        value={config.imagePrompt}
                        onChange={(e) => handleChange('imagePrompt', e.target.value)}
                        className="mt-1"
                        placeholder="Describe the image you want to generate..."
                      />
                    </div> */}

                    <div>
                      <Label htmlFor="additionalInfo">Additional Details</Label>
                      <Textarea
                        id="additionalInfo"
                        value={config.additionalInfo}
                        onChange={(e) => handleChange('additionalInfo', e.target.value)}
                        className="mt-1"
                        placeholder="Any additional details for this chapter..."
                      />
                    </div>

                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                      disabled={isGenerating}
                      onClick={() => handleChapterGeneration(config)}
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin">
                              <Loader2 className="h-4 w-4 animate-spin" />
                                       
                          </div>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Generate Chapter {currentChapterNo}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </Card>
)}
                <Card className="lg:col-span-2 p-6 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      <h2 className="text-xl font-semibold">{getCurrentChapterTitle()}</h2>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleChapterGeneration(config)}
                        disabled={isGenerating}
                        title="Regenerate Chapter"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(streamedContent, -1)}
                        disabled={isGenerating}
                        title="Edit Chapter"
                      >
                        <Edit className="w-4 h-4" />
                      </Button> */}
                      {streamedContent && (
                        <Button
                          onClick={handleNextChapter}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          disabled={isGenerating}
                        >
                          <div className="flex items-center gap-2">
                            <span>Move Forward</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress()}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Chapter {currentChapterNo} of {getChapterCount()}: {getCurrentChapterTitle()}
                    </p>
                  </div>

                  <div
                    ref={streamContainerRef}
                    className={cn(
                      "prose prose-amber max-w-none",
                      "h-[calc(100vh-300px)] overflow-y-auto",
                      "bg-gray-50 rounded-lg p-6"
                    )}
                  >
                    {streamedContent ? (
                      isEditing ? (
                        <div className="flex flex-col h-full">
                          <div className="flex-grow relative">
                            <Textarea
                              value={editableContent}
                              onChange={(e) => setEditableContent(e.target.value)}
                              className={cn(
                                "w-full h-[calc(100vh-250px)] p-4",
                                "rounded-lg border border-gray-200",
                                "focus:ring-2 focus:ring-amber-500 focus:border-transparent",
                                "resize-none",
                                textFormat.isBold && "font-bold",
                                textFormat.isItalic && "italic",
                                textFormat.color,
                                "transition-all duration-200"
                              )}
                            />
                          </div>
                          
                          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2 mt-4">
                            <div className="flex justify-end items-center gap-3 max-w-2xl mx-auto">
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                  setIsEditing(false);
                                  setEditableContent(streamedContent);
                                }}
                                disabled={isGenerating}
                                className="px-6"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="lg"
                                className={cn(
                                  "bg-amber-500 hover:bg-amber-600 text-white",
                                  "min-w-[120px] px-6",
                                  "transition-all duration-200",
                                  isGenerating && "opacity-70"
                                )}
                                onClick={handleSaveEdit}
                                disabled={isGenerating}
                              >
                                {isGenerating ? (
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin">⌛</div>
                                    <span>Saving...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span>Save Changes</span>
                                  </div>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                      
                        formatChapterContent(streamedContent)
                      )
                    ) : (
                      <p className="text-gray-400">Generated content will appear here...</p>
                    )}
                  </div>
                </Card>
            
            
          </div>
        </>
      )}
    </div>
  );
};

export default ChapterConfiguration;