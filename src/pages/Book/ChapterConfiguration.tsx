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
import BookInformation from './BookInformation';






const ChapterConfiguration: React.FC<ChapterConfigurationProps> = ({  previousContent }) => {
   const navigate = useNavigate();
  const [currentChapterNo, setCurrentChapterNo] = useState(1);
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [chapterImages, setChapterImages] = useState<Array<{ title: string; url: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [generatedChapters, setGeneratedChapters] = useState<{ [key: number]: ChapterContent }>({});
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const bookData = JSON.parse(previousContent || '{}');
  const [createBookChapter] = useCreateChapterMutation();
const { addToast } = useToast(); // Use custom toast hook

  const [config, setConfig] = useState<ChapterConfig>({
    numberOfChapters: '',
    minLength: '',
    maxLength: '',
    additionalInfo: '',
    imagePrompt: '',
    noOfImages: 1
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
        if(Number(config.noOfImages)&&Number(config.noOfImages)<1){
          addToast("Number of images must be provided.",ToastType.ERROR)
          return
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
        bookGenerationId: bookData.id,
        additionalInfo:config.additionalInfo,
        imagePrompt:config.imagePrompt,
        noOfImages:Number(config.noOfImages)
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
    if( currentChapterNo>bookData.numberOfChapters) navigate('/books')
      eventSource.close();
      if(res.statusCode==200){
        setCurrentChapterNo(prev => prev + 1);
        setConfig(prev => ({
            ...prev,
          additionalInfo:"",
          imagePrompt:"",
          noOfImages:1
          }))
      }
   
      setIsGenerating(false);

    } catch (error) {
      console.error('Error generating chapter:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)]">
      {/* Configuration Panel */}
      <div className="w-full lg:w-1/3 lg:min-w-[380px]">
        <Card className="p-6 h-full overflow-auto custom-scrollbar border-amber-200 shadow-lg">
          <h2 className="text-2xl font-bold mb-8 text-amber-800 border-b pb-4">
            Chapter Configuration - Chapter {currentChapterNo}
          </h2>
          
          <div className="space-y-8">
            {/* Length Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minLength" className="text-sm font-medium text-gray-700">
                  Min Length
                </Label>
                <Input
                  id="minLength"
                  type="number"
                  value={config.minLength}
                  onChange={(e) => handleChange('minLength', e.target.value)}
                  className="focus:ring-2 focus:ring-amber-500"
                  placeholder="Min words"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLength" className="text-sm font-medium text-gray-700">
                  Max Length
                </Label>
                <Input
                  id="maxLength"
                  type="number"
                  value={config.maxLength}
                  onChange={(e) => handleChange('maxLength', e.target.value)}
                  className="focus:ring-2 focus:ring-amber-500"
                  placeholder="Max words"
                />
              </div>
           
              
            </div>
            <div className="space-y-2">
  <Label htmlFor="noOfImages" className="text-sm font-medium text-gray-700">
    Generate Images
  </Label>
  <Input
    id="noOfImages"
    type="number"
    value={config.noOfImages}
    onChange={(e) => handleChange('noOfImages', e.target.value)}
    className="w-full focus:ring-2 focus:ring-amber-500"
    placeholder="Number of images to generate"
  />
</div>
            <div className="space-y-2">
                <Label htmlFor="imagePrompt" className="text-sm font-medium text-gray-700">
                  Image Prompt
                </Label>
                <Textarea
                  id="imagePrompt"
                  
                  value={config.imagePrompt}
                  onChange={(e) => handleChange('imagePrompt', e.target.value)}
                  className="focus:ring-2 focus:ring-amber-500"
                  placeholder="Write Image Prompt..."
                />
              </div>
            </div>
            {/* Progress Indicator */}
            

            {/* Buttons */}
            <div className="space-y-2 pt-5">
              {showAdditionalInfo?<> <Label htmlFor="additionalInformation" className="text-sm font-small text-gray-700">
                Additional Information
                </Label>
                <Textarea   value={config.additionalInfo} id='additionalInfo' placeholder='Additional Information'
                onChange={(e) => handleChange('additionalInfo', e.target.value)}
                 
                 />
                </>:"" }
                <div className="text-sm text-gray-600">
              Generating chapter {currentChapterNo} of {bookData?.numberOfChapters || '?'}
            </div>
              <Button
                variant="outline"
                onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                className="w-full border-amber-500 text-amber-700 hover:bg-amber-50"
              >
                {showAdditionalInfo ? 'Hide' : 'Edit'} Additional Information
              </Button>


            {/* Generate Button */}
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
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="w-full lg:w-2/3 flex flex-col">
        <Card className="flex-1 overflow-hidden border-amber-200 shadow-lg">
        <h2 className="text-2xl p-3 font-bold mb-8 text-amber-800 border-b pb-4">
         Generate Chapter 
          </h2>
          <div className="h-full overflow-y-auto custom-scrollbar" ref={streamContainerRef}>
            <div className="p-8">
              <BookInformation 
                bookData={bookData}
                generatedChapters={generatedChapters}
                streamingContent={streamedContent}
                currentChapterNo={currentChapterNo}
                isGenerating={isGenerating}
              />
              
              {/* Progress Bar */}
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

      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .typing-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background-color: currentColor;
          margin-left: 2px;
          animation: blink 1s infinite;
        }
        
        .typing-animation {
          opacity: 0.8;
          transition: opacity 0.1s;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #f59e0b #fff;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fff;
          border-radius: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f59e0b;
          border-radius: 8px;
          border: 2px solid #fff;
          transition: all 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d97706;
        }
      `}</style>
    </div>
  );
};

export default ChapterConfiguration;