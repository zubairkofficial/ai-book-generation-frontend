import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URl, ToastType } from '@/constant';
import { useCreateChapterMutation } from '@/api/bookApi';
import { useToast } from '@/context/ToastContext';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Settings, Image as ImageIcon, RotateCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface ChapterConfigurationProps {
  previousContent: string;
}

interface ChapterContent {
  text: string;
  images: Array<{ title: string; url: string }>;
}

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

  console.log("summaryResponse===========",bookData)
  const [createBookChapter] = useCreateChapterMutation();
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

  // Auto-scroll effect
  useEffect(() => {
    if (streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
    }
  }, [streamedContent, chapterImages]);

  const handleChange = (name: keyof ChapterConfig, value: string) => {
    
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleStreamedContent = (content: string) => {
    setStreamedContent(prev => {
      const newContent = prev + content;
      // Update generated chapters with both text and images
      
      return newContent;
    });
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
        if(Number(input.noOfImages) > 3) {
          addToast("Maximum 3 images can be generated.", ToastType.ERROR);
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
          const data = JSON.parse(event.data);
          
          if (data.text) {
            handleStreamedContent(data.text);
          } else if (data.type === 'image') {
            setChapterImages(prev => [...prev, {
              title: data.title,
              url: data.url
            }]);
          }
        } catch (error) {
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
    console.log("rescurrentChapterNo",currentChapterNo,bookData.numberOfChapters)
    if( currentChapterNo==bookData.numberOfChapters) {
      setIsBookCompleted(true);
    }
      eventSource.close();
      if(res.statusCode==200){
        setConfig(prev => ({
            ...prev,
          additionalInfo:"",
          imagePrompt:"",
          noOfImages:1,
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
      // Split text by ### markers
      const parts = text.split(/###\s*/);
      
      return parts.map((part, index) => {
        if (!part.trim()) return null;

        // Check if this part starts with a quoted title
        const titleMatch = part.match(/^"([^"]+)"\s*([\s\S]*)/);
        
        if (titleMatch) {
          const [_, title, content] = titleMatch;
          return (
            <React.Fragment key={index}>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 text-center">
                {title}
              </h3>
              <div className="prose prose-amber max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </React.Fragment>
          );
        }

        // Regular text content
        return (
          <div key={index} className="prose prose-amber max-w-none">
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
                    <span className="text-xs text-gray-500">Max: 3</span>
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
                  formatChapterContent(streamedContent) || (
                    <p className="text-gray-400">No content available</p>
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