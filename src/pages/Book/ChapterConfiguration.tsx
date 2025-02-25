import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URl, ToastType } from '@/constant';
import { UpdateBookGenerateRequest, useCreateChapterMutation, useUpdateChapterMutation } from '@/api/bookApi';
import { useToast } from '@/context/ToastContext';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Settings, Image as ImageIcon, RotateCw, Edit, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { ChapterConfigurationProps, ChapterConfig } from './types/chapter.types';



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

const styles = {
  '@keyframes blink': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
  '.typing-cursor': {
    display: 'inline-block',
    width: '2px',
    animation: 'blink 1s infinite',
    marginLeft: '2px',
  }
};

const ChapterConfiguration: React.FC<ChapterConfigurationProps> = ({ previousContent }) => {
 const navigate = useNavigate()
  const parsedContent = JSON.parse(previousContent);
  const tableOfContents = parsedContent?.additionalData?.tableOfContents || '';
  const [currentChapterNo, setCurrentChapterNo] = useState(1);
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [chapterImages, setChapterImages] = useState<Array<{ title: string; url: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const bookData = JSON.parse(previousContent || '{}');

  const [createBookChapter] = useCreateChapterMutation();
  const [updateBookChapter] = useUpdateChapterMutation();
  const { addToast } = useToast(); // Use custom toast hook

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
  const [textFormat, setTextFormat] = useState<TextFormat>({
    isBold: false,
    isItalic: false,
    color: 'text-gray-700',
    fontSize: 'text-base'
  });

  const [showInsertOption, setShowInsertOption] = useState(true);
  const [regeneratedContent, setRegeneratedContent] = useState('');
console.log("regeneratedContent",regeneratedContent)
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
  const handleRegenerateStreamedContent = (content: string, index?: number) => {
    
      setRegeneratedContent(prev => prev + content);
   
  };

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

      const eventSource = new EventSource(`${BASE_URl}/book-chapter/chapter-stream`);

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
    return (currentChapterNo / totalChapters) * 100;
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
      setIsGenerating(true);
      setRegeneratedContent(''); // Clear previous content
      
      const actualIndex = selectedContent?.index || index;
      
      // Create payload first
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

      // Set up EventSource before making the API call
      const eventSource = new EventSource(`${BASE_URl}/book-chapter/chapter-stream`);
      
      eventSource.onopen = () => {
        console.log("EventSource connection opened"); // Debug log
      };
      eventSource.onmessage = (event) => {
        console.log("Received event:", event.data); // Debug log
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            handleRegenerateStreamedContent(data.text, actualIndex);
          } else if (data.type === 'image') {
            setChapterImages(prev => [...prev, {
              title: data.title,
              url: data.url
            }]);
          }
        } catch (error) {
          // If parsing fails, treat it as raw text
          handleRegenerateStreamedContent(event.data, actualIndex);
        }
      };
      // eventSource.onmessage = (event) => {
      //   try {
      //     const data = JSON.parse(event.data);
      //     if (data.text) {
      //       handleStreamedContent(data.text, actualIndex);
      //     } else if (data.type === 'image') {
      //       setChapterImages(prev => [...prev, {
      //         title: data.title,
      //         url: data.url
      //       }]);
      //     }
      //   } catch (error) {
      //     // If parsing fails, treat it as raw text
      //     handleStreamedContent(event.data, actualIndex);
      //   }
      // };

      // eventSource.onerror = (error) => {
      //   console.error('Stream error:', error);
      //   eventSource.close();
      //   setIsGenerating(false);
      // };

      // Make the API call after setting up EventSource
      const res:any = await createBookChapter(payload).unwrap();
      
      if (res.statusCode === 200) {
        setShowInsertOption(true);
        // Don't close EventSource immediately to ensure we get all streamed content
      } else {
        // eventSource.close();
        setIsGenerating(false);
        console.error('API call failed:', res);
      }

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

      const updatePayload: UpdateBookGenerateRequest = {
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

  const handleInsertContent = () => {
    if (selectedContent && regeneratedContent) {
      setStreamedContent(prev => {
        const parts = prev.split(/###\s*/);
        const actualIndex = selectedContent.index;
        
        if (actualIndex >= 0 && actualIndex < parts.length) {
          const targetPart = parts[actualIndex];
          const startIndex = targetPart.indexOf(selectedContent.text);
          
          if (startIndex !== -1) {
            parts[actualIndex] = 
              targetPart.substring(0, startIndex) + 
              targetPart.substring(startIndex + selectedContent.text.length);
            
            return parts.join('\n### ');
          }
        }
        return prev;
      });
      
      // Reset states after insertion
      setShowInsertOption(false);
      setRegeneratedContent('');
      setSelectedContent(null);
      setShowEditPanel(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isBookCompleted ? (
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">
            🎉 Congratulations!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully completed all chapters of your book.
          </p>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => navigate('/books')}
          >
            View All Books
          </Button>
        </Card>
      ) : (
        <>
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

                  {showInsertOption ? (
                    <>
                      <div>
                        <Label>Regenerated Content</Label>
                        <div className="mt-1 p-3 bg-amber-50 rounded-lg overflow-y-auto h-[150px]">
                          {
                           regeneratedContent ? (
                            <div className="prose prose-amber max-w-none">
                              {regeneratedContent.split('\n').map((line, index) => (
                                <p key={index} className="mb-2">
                                  {line}
                                 
                                </p>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              Waiting for content...
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          onClick={handleInsertContent}
                        >
                          Insert Content
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
                          <div className="animate-spin">⌛</div>
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(streamedContent, -1)}
                        disabled={isGenerating}
                        title="Edit Chapter"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
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
                          
                          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 mt-4">
                            <div className="flex justify-end items-center gap-3 max-w-7xl mx-auto">
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