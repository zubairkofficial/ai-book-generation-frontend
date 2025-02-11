import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URl } from '@/constant';
import { useCreateChapterMutation } from '@/api/bookApi';

// Add these interfaces at the top of the file
interface ChapterConfigurationProps {
  onGenerate: (config: ChapterConfig) => void;
  previousContent: string;
}

interface ChapterConfig {
  numberOfChapters: string;
  minLength: string;
  maxLength: string;
  additionalInfo?: string;
}

interface StreamResponse {
  data: string;
}

const BookInformation: React.FC<{ bookData: any }> = ({ bookData }) => {
  

  // Helper function to parse content sections

  const parseContent = (content: string) => {
    const sections = content.split('\n\n').reduce((acc: any, section: string) => {
      const trimmedSection = section.trim();
      if (trimmedSection) {
        const title = trimmedSection.split('\n')[0].replace(':', '').trim();
        const content = trimmedSection.split('\n').slice(1).join('\n').trim();
        if (title && content) {
          acc[title] = content;
        }
      }
      return acc;
    }, {});
    return sections;
  };

  const contentSections = bookData?.additionalData?.fullContent ? 
    parseContent(bookData.additionalData.fullContent) : {};

  return (
    <div className="max-w-4xl mx-auto">
      {/* Book Preview Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">Book Preview</h2>
      </div>

      {/* Book Content */}
      <div className="prose prose-lg max-w-none">
        {/* Cover Page */}
        <div className="text-center mb-16 p-8 bg-gradient-to-b from-amber-50 to-white rounded-xl shadow-sm">
          {bookData?.additionalData?.coverImageUrl && (
            <img
              src={`${BASE_URl}/uploads/${bookData.additionalData.coverImageUrl}`}
              alt="Book Cover"
              className="mx-auto mb-8 max-w-[400px] rounded-lg shadow-xl transform transition-transform hover:scale-105"
            />
          )}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">{bookData.bookTitle}</h1>
          <p className="text-2xl text-gray-700 mb-3">By {bookData.authorName}</p>
          <p className="text-xl text-amber-600">Cyberify Publishing</p>
        </div>

        {/* Copyright Notice */}
        <div className="text-center mb-12 text-sm text-gray-600">
          <p>Copyright © {new Date().getFullYear()} by {bookData.authorName}</p>
          <p className="mt-2">All rights reserved.</p>
        </div>

        {/* Book Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 p-8 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl shadow-sm">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Genre</h3>
            <p className="text-gray-900">{bookData.genre}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Language</h3>
            <p className="text-gray-900">{bookData.language}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Target Audience</h3>
            <p className="text-gray-900">{bookData.targetAudience}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Characters</h3>
            <p className="text-gray-900">{bookData.characters}</p>
          </div>
        </div>

        {/* Dedication */}
        {contentSections['Dedication'] && (
          <div className="mb-16 p-10 bg-gradient-to-r from-amber-50 to-amber-100/30 rounded-xl shadow-sm text-center italic">
            <h2 className="text-2xl font-semibold text-amber-700 mb-6">Dedication</h2>
            <p className="text-gray-700 text-lg">{contentSections['Dedication']}</p>
          </div>
        )}

        {/* Preface */}
        {contentSections['Preface'] && (
          <div className="mb-12 border-l-4 border-amber-400 pl-6">
            <h2 className="text-xl font-semibold text-amber-600 mb-4">Preface</h2>
            <div className="prose prose-amber">
              {contentSections['Preface'].split('\n\n').map((paragraph:any, index:number) => (
                <p key={index} className="text-gray-700 mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Table of Contents */}
        {contentSections['Index'] && (
          <div className="mb-12 p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-amber-600 mb-6">Table of Contents</h2>
            <div className="space-y-3">
              {contentSections['Index'].split('\n').map((item:any, index:number) => {
                const [title, page] = item.split(':');
                return (
                  <div key={index} className="flex items-baseline">
                    <span className="text-gray-700 flex-1">{title}</span>
                    <div className="border-b border-dotted border-gray-300 flex-1 mx-4"></div>
                    <span className="text-gray-500">{page}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Cover */}
        {bookData?.additionalData?.backCoverImageUrl && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-amber-600 mb-4">Back Cover</h2>
            <img
              src={`${BASE_URl}/uploads/${bookData.additionalData.backCoverImageUrl}`}
              alt="Back Cover"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Author Bio */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-amber-600 mb-4">About the Author</h2>
          <p className="text-gray-700">{bookData.authorBio}</p>
        </div>
      </div>
    </div>
  );
};

const ChapterConfiguration: React.FC<ChapterConfigurationProps> = ({ onGenerate, previousContent }) => {
  const [currentChapterNo, setCurrentChapterNo] = useState(1);
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [chapterImages, setChapterImages] = useState<Array<{ title: string; url: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChapters, setGeneratedChapters] = useState<{ [key: number]: ChapterContent }>({});
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const bookData = JSON.parse(previousContent || '{}');
  const bookGenerationId = bookData?.id;
  const [createBookChapter] = useCreateChapterMutation();

  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [config, setConfig] = useState<ChapterConfig>({
    numberOfChapters: '',
    minLength: '',
    maxLength: '',
    additionalInfo: '',
  });

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
      setGeneratedChapters(prev => ({
        ...prev,
        [currentChapterNo]: {
          text: newContent,
          images: chapterImages
        }
      }));
      return newContent;
    });
  };

  const handleChapterGeneration = async (input: any) => {
    try {
      setIsGenerating(true);
      setStreamedContent('');
      setChapterImages([]);

      const payload = {
        minCharacters: +input.minLength,
        maxCharacters: +input.maxLength,
        chapterNo: currentChapterNo,
        bookGenerationId: bookGenerationId
      };

      // Create EventSource with proper URL
      const eventSource = new EventSource(
        `${BASE_URl}/book-generation/chapter-stream/${bookGenerationId}/${currentChapterNo}`
      );

      eventSource.onmessage = (event) => {
        const data = event.data;
        try {
          // Try to parse as JSON for images or structured content
          const json = JSON.parse(data);
          if (json.type === 'image') {
            setChapterImages(prev => [...prev, {
              title: json.title,
              url: json.url
            }]);
          } else if (json.type === 'text') {
            handleStreamedContent(json.content);
          }
        } catch {
          // If not JSON, treat as plain text content
          handleStreamedContent(data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Stream error:', error);
        eventSource.close();
        setIsGenerating(false);
      };

      // Send the chapter generation request
      await createBookChapter({ ...payload }).unwrap();
      
      // Cleanup
      eventSource.close();
      setCurrentChapterNo(prev => prev + 1);
      setConfig(prev => ({
        ...prev,
        minLength: '',
        maxLength: ''
      }));
      setIsGenerating(false);

    } catch (error) {
      console.error('Error generating chapter:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)]">
      {/* Left Side - Configuration Panel */}
      <div className="w-full lg:w-1/3 lg:min-w-[380px]">
        <Card className="p-6 h-full border-amber-200 shadow-lg">
          <h2 className="text-2xl font-bold mb-8 text-amber-800 border-b pb-4">
            Chapter Configuration - Chapter {currentChapterNo}
          </h2>
          
          <div className="space-y-8">
            {/* Chapter Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="minLength" className="text-lg font-medium text-gray-700">
                  Min Length
                </Label>
                <Input
                  id="minLength"
                  type="number"
                  className="focus:ring-2 focus:ring-amber-500"
                  value={config.minLength}
                  onChange={(e) => handleChange('minLength', e.target.value)}
                  placeholder="Min words"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="maxLength" className="text-lg font-medium text-gray-700">
                  Max Length
                </Label>
                <Input
                  id="maxLength"
                  type="number"
                  className="focus:ring-2 focus:ring-amber-500"
                  value={config.maxLength}
                  onChange={(e) => handleChange('maxLength', e.target.value)}
                  placeholder="Max words"
                />
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="text-sm text-gray-600">
              Generating chapter {currentChapterNo} of {bookData?.numberOfChapters || '?'}
            </div>

            {/* Buttons */}
            <div className="space-y-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                className="w-full border-amber-500 text-amber-700 hover:bg-amber-50"
              >
                {showAdditionalInfo ? 'Hide' : 'Edit'} Additional Information
              </Button>

              <Button
                onClick={() => handleChapterGeneration(config)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
                disabled={isGenerating || currentChapterNo > (bookData?.numberOfChapters || 0)}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⌛</span>
                    Generating Chapter {currentChapterNo}...
                  </div>
                ) : currentChapterNo > (bookData?.numberOfChapters || 0) ? (
                  'All Chapters Generated'
                ) : (
                  `Generate Chapter ${currentChapterNo}`
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Side - Preview */}
      <div className="w-full lg:w-2/3 flex flex-col">
        <Card className="flex-1 overflow-hidden border-amber-200 shadow-lg">
          <div className="h-full overflow-y-auto custom-scrollbar" ref={streamContainerRef}>
            <div className="p-8">
              <BookInformation bookData={JSON.parse(previousContent || '{}')} />
              
              {/* Generated Chapters Display */}
              <div className="mt-8 space-y-8">
                {Object.entries(generatedChapters).map(([chapterNo, chapter]) => (
                  <div key={chapterNo} className="p-6 bg-amber-50 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-amber-800 mb-4">
                      Chapter {chapterNo}
                    </h3>
                    <ChapterContent chapter={chapter} />
                  </div>
                ))}

                {/* Currently Streaming Chapter */}
                {isGenerating && streamedContent && (
                  <div className="p-6 bg-amber-50/50 rounded-lg shadow-sm border-2 border-amber-200 animate-pulse">
                    <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                      <span className="mr-2">Chapter {currentChapterNo}</span>
                      <span className="text-sm text-amber-600">(Generating...)</span>
                    </h3>
                    <div className="prose prose-amber max-w-none">
                      {streamedContent.split('\n').map((line, index) => (
                        line.trim() && (
                          <p key={index} className="mb-2 text-gray-700">
                            {line}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generation Progress */}
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(currentChapterNo - 1) / bookData?.numberOfChapters * 100}%`
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {currentChapterNo - 1} of {bookData?.numberOfChapters} chapters generated
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Separate component for displaying chapter content
const ChapterContent: React.FC<{ chapter: ChapterContent }> = ({ chapter }) => {
  const { text, images } = chapter;
  const paragraphs = text.split('\n').filter(line => line.trim());
  
  return (
    <div className="prose prose-lg max-w-none">
      {paragraphs.map((paragraph, idx) => (
        <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
          {paragraph}
        </p>
      ))}
      {images.map((img, idx) => (
        <figure key={idx} className="my-8">
          <img
            src={img.url}
            alt={img.title}
            className="w-full rounded-lg shadow-lg"
          />
          <figcaption className="text-center mt-2 text-gray-600">
            {img.title}
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

export default ChapterConfiguration;

// Update scrollbar styles
const styles = `
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #fff;
      border-radius: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: #f59e0b;
      border-radius: 8px;
      border: 2px solid #fff;
      transition: all 0.2s ease;

      &:hover {
        background: #d97706;
      }
    }

    scrollbar-width: thin;
    scrollbar-color: #f59e0b #fff;
  }
`; 