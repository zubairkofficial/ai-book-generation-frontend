import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { useFetchBooksByTypeQuery, useGeneratePresentationSlidesMutation, BookStatus } from '@/api/bookApi';
import { 
  Presentation, X, Check, Loader2, ChevronDown, AlertCircle, ArrowLeft, 
  Minimize2, Maximize2, ChevronLeft, ChevronRight, Download,
  SkipBack, SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { BASE_URl } from '@/constant';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';
import pptxgen from 'pptxgenjs';

interface BookData {
  id: number;
  bookTitle: string;
  authorName?: string;
  genre?: string;
  bookChapter: ChapterData[];
  additionalData: {
    coverImageUrl?: string;
    // other additional data fields
  };
}

interface ChapterData {
  id: number;
  chapterNo: number;
  chapterName: string;
  content: string;
}

// Interface for slide data
interface Slide {
  title: string;
  content: string;
  imagePrompt?: string;
}

const PresentationSlidesPage = () => {
  // State for book selection, chapters, loading, etc.
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [numberOfSlides, setNumberOfSlides] = useState<number>(10);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedSlides, setCompletedSlides] = useState<Slide[]>([]);
  const { token } = useSelector((state: RootState) => state.auth);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

  // Hooks for API interactions
  const { data: booksResponse, isLoading: isLoadingBooks } = useFetchBooksByTypeQuery({ status: BookStatus.ALL });
  const [generateSlides] = useGeneratePresentationSlidesMutation();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  // Extract books array from response - handle both possible response formats
  const books: BookData[] = booksResponse?.books || booksResponse?.data || [];
  
  // Get chapters for selected book
  const selectedBook = selectedBookId ? books.find(book => book.id === selectedBookId) : undefined;
  const chapters = selectedBook?.bookChapter || [];
  
  // Reset selected chapters when book changes
  useEffect(() => {
    setSelectedChapters([]);
    setIsGenerated(false);
    setSlides([]);
    setCurrentSlide(0);
  }, [selectedBookId]);
  
  // Handle chapter selection
  const handleChapterToggle = (chapterId: number) => {
    if (selectedChapters.includes(chapterId)) {
      setSelectedChapters(selectedChapters.filter(id => id !== chapterId));
    } else {
      setSelectedChapters([...selectedChapters, chapterId]);
    }
  };
  
  // Handle "Select All" functionality
  const handleSelectAllChapters = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(chapters.map((chapter: ChapterData) => chapter.id));
    }
  };
  
  // Update handleGenerateSlides function
  const handleGenerateSlides = async () => {
    if (!selectedBookId || selectedChapters.length === 0) {
      addToast("Please select a book and at least one chapter", "error");
      return;
    }

    try {
      setIsGenerating(true);
      setIsGenerated(false);
      setCompletedSlides([]); // Reset completed slides

      // Make the API call
      const response = await generateSlides({
        bookId: selectedBookId,
        chapterIds: selectedChapters,
        numberOfSlides: numberOfSlides
      }).unwrap();

      // Process the response
      if (response && response.slides) {
        // Parse the markdown content from the slides string
        const markdownContent = response.slides.replace(/```markdown\n/, '').replace(/```$/, '');
        const slidesSections = markdownContent.split('\n\n').filter(Boolean);
        
        const formattedSlides = slidesSections.map((section) => {
          const lines = section.split('\n');
          const titleMatch = lines[0].match(/^# (.*?)$/);
          const title = titleMatch ? titleMatch[1] : "Untitled Slide";
          const content = section;
          
          return {
            title,
            content
          };
        });

        setSlides(formattedSlides);
        setCompletedSlides(formattedSlides);
        setCurrentSlide(0);
        setIsGenerated(true);
        addToast(response.message || "Slides generated successfully!", "success");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to generate slides:", error);
      addToast("Failed to generate presentation slides. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Navigation between slides
  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  // Toggle fullscreen presentation mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle keyboard navigation in fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'Space':
        case 'Enter':
          goToNextSlide();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          goToPreviousSlide();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentSlide, slides.length]);
  
  // Modify the renderSlideContent function
  const renderSlideContent = (slide: Slide, isFullscreen: boolean = false) => {
    return (
      <div className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${isFullscreen ? 'w-full max-w-5xl' : 'w-full'}`}>
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
        
        {/* Slide content with improved styling */}
        <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-[400px]">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4 flex items-center">
            <div className="w-2 h-8 bg-blue-500 mr-4 rounded-full" />
            {slide.title}
          </h2>
          <div className="prose max-w-none">
            {formatMarkdown(slide.content.replace(`# ${slide.title}`, ''))}
          </div>
        </div>
        
        {/* Slide footer */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50" />
      </div>
    );
  };

  // Update renderCurrentSlide function
  const renderCurrentSlide = () => {
    if (!isGenerated && !isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <Presentation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Slides Generated Yet
            </h3>
            <p className="text-gray-600">
              Select a book and chapters, then click "Generate Slides" to create your presentation.
            </p>
          </div>
        </div>
      );
    }
    
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Generating Your Presentation
            </h3>
            <p className="text-gray-600">
              Please wait while we create your slides...
            </p>
          </div>
        </div>
      );
    }

    // Show generated slides
    const currentSlideContent = slides[currentSlide];
    return (
      <div className="flex flex-col h-full">
        {/* Slide Content */}
        <div className="flex-1 px-4 py-6 bg-gray-50 overflow-auto rounded-lg">
          <div className="aspect-[16/9] mx-auto transform transition-all duration-300 hover:scale-[1.01]">
            {renderSlideContent(currentSlideContent)}
          </div>
        </div>

        {/* Carousel Thumbnails */}
        <div className="bg-white p-3 border-t overflow-x-auto shadow-inner">
          <div className="flex gap-3">
            {slides.map((s, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`flex-shrink-0 w-28 h-16 rounded-lg border-2 transition-all transform hover:scale-105 ${
                  currentSlide === index
                    ? 'border-amber-500 shadow-lg scale-105'
                    : 'border-gray-200'
                }`}
              >
                <div className="w-full h-full p-2 text-xs overflow-hidden bg-white">
                  <div className="font-medium truncate">{s.title}</div>
                  <div className="text-gray-500 line-clamp-1 text-[10px] mt-0.5">
                    {s.content.replace(/[#\-*]/g, '').split('\n').filter(Boolean)[1]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const formatMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        className="prose max-w-none dark:prose-invert"
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const handleDownloadPDF = async () => {
    if (!completedSlides.length) {
      addToast("No slides available to download", "error");
      return;
    }
  
    try {
      // Create a temporary container for all slides
      const tempContainer = document.createElement('div');
      tempContainer.style.width = '1920px'; // Full HD width for better quality
      tempContainer.style.backgroundColor = 'rgb(243 244 246)'; // bg-gray-50
      tempContainer.style.padding = '24px';
  
      // Save current slide index to restore later
      const currentSlideIndex = currentSlide;
  
      // Create slides container
      const slidesContainer = document.createElement('div');
      slidesContainer.style.display = 'flex';
      slidesContainer.style.flexDirection = 'column';
      slidesContainer.style.gap = '24px';
  
      // Add each slide
      for (let i = 0; i < completedSlides.length; i++) {
        // Set current slide to render
        setCurrentSlide(i);
        
        // Wait for React to render the slide
        await new Promise(resolve => setTimeout(resolve, 100));
  
        if (!slidesContainerRef.current) continue;
  
        // Find the slide content (prose class contains markdown content)
        const slideContent = slidesContainerRef.current.querySelector('.prose');
        if (!slideContent) continue;
  
        // Clone the slide content
        const slideClone = slideContent.cloneNode(true) as HTMLElement;
  
        // Remove navigation elements if present
        const navigationElements = slideClone.querySelectorAll('button, .navigation');
        navigationElements.forEach(el => el.remove());
  
        // Create and style the slide div
        const slideDiv = document.createElement('div');
        slideDiv.style.pageBreakAfter = 'always';
        slideDiv.style.backgroundColor = 'white';
        slideDiv.style.borderRadius = '0.5rem';
        slideDiv.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
        slideDiv.style.overflow = 'hidden';
        slideDiv.style.width = '1920px';
        slideDiv.style.height = '1080px'; // 16:9 aspect ratio
        slideDiv.style.position = 'relative';
        slideDiv.style.padding = '2rem';
  
        // Center the content
        const contentWrapper = document.createElement('div');
        contentWrapper.style.display = 'flex';
        contentWrapper.style.flexDirection = 'column';
        contentWrapper.style.justifyContent = 'center';
        contentWrapper.style.alignItems = 'center';
        contentWrapper.style.height = '100%';
        contentWrapper.style.width = '100%';
        contentWrapper.appendChild(slideClone);
  
        slideDiv.appendChild(contentWrapper);
  
        // Add slide number
        const slideNumber = document.createElement('div');
        slideNumber.style.position = 'absolute';
        slideNumber.style.bottom = '1rem';
        slideNumber.style.right = '1rem';
        slideNumber.style.fontSize = '0.875rem';
        slideNumber.style.color = 'rgb(75 85 99)';
        slideNumber.textContent = `Slide ${i + 1} of ${completedSlides.length}`;
        slideDiv.appendChild(slideNumber);
  
        slidesContainer.appendChild(slideDiv);
      }
  
      // Restore the original slide
      setCurrentSlide(currentSlideIndex);
  
      tempContainer.appendChild(slidesContainer);
      document.body.appendChild(tempContainer);
  
      // Configure html2pdf options
      const opt = {
        margin: 0.5,
        filename: `${selectedBook?.bookTitle || 'presentation'}-slides.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          width: 1920,
          windowWidth: 1920,
          scrollY: -window.scrollY,
          scrollX: 0
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'landscape',
          compress: false
        }
      };
  
      // Generate and save the PDF
      await html2pdf().set(opt).from(tempContainer).save();
  
      // Cleanup
      document.body.removeChild(tempContainer);
      addToast("Slides downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading slides:", error);
      addToast("Failed to download slides", "error");
    }
  };

  // Add function to handle PPTX export
  const handleExportPPTX = async () => {
    if (!completedSlides.length) {
      addToast("No slides available to export", "error");
      return;
    }
  
    try {
      // Initialize a new PowerPoint presentation
      const pres = new pptxgen();
  
      // Set presentation properties
      pres.layout = 'LAYOUT_16x9';
      pres.author = selectedBook?.authorName || 'Author';
      pres.title = selectedBook?.bookTitle || 'Presentation';
  
      // Save current slide index
      const currentSlideIndex = currentSlide;
  
      // Add each slide
      for (let i = 0; i < completedSlides.length; i++) {
        // Set current slide to render
        setCurrentSlide(i);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100));
  
        if (!slidesContainerRef.current) continue;
  
        // Find the slide content
        const slideContent = slidesContainerRef.current.querySelector('.prose');
        if (!slideContent) continue;
  
        // Create a new slide
        const slide = pres.addSlide();
  
        // Add title
        slide.addText(completedSlides[i].title, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: 1,
          fontSize: 36,
          bold: true,
          color: '1a202c' // Gray-800
        });
  
        // Add content, removing the title
        const contentWithoutTitle = completedSlides[i].content.replace(`# ${completedSlides[i].title}`, '').trim();
        slide.addText(contentWithoutTitle, {
          x: 0.5,
          y: 1.7,
          w: '90%',
          h: 4,
          fontSize: 18,
          color: '374151', // Gray-700
          bullet: { type: 'bullet' }
        });
  
        // Add slide number
        slide.addText(`Slide ${i + 1} of ${completedSlides.length}`, {
          x: 'right',
          y: 'bottom',
          w: 2,
          h: 0.3,
          fontSize: 12,
          color: '6B7280', // Gray-500
          align: 'right'
        });
      }
  
      // Restore original slide
      setCurrentSlide(currentSlideIndex);
  
      // Save the presentation
      await pres.writeFile(`${selectedBook?.bookTitle || 'presentation'}-slides.pptx`);
      addToast("Slides exported successfully", "success");
    } catch (error) {
      console.error("Error exporting slides:", error);
      addToast("Failed to export slides", "error");
    }
  };

  return (
    <Layout>
      <div className="mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button 
            onClick={() => navigate('/ai-assistant')}
            className="mr-4 px-4 py-2 hover:bg-amber-100 rounded-md flex items-center bg-amber-50 text-amber-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Assistant
          </Button>
          <h1 className="text-3xl font-bold">Presentation Slides Generator</h1>
        </div>
        
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="h-[calc(100vh-8rem)]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Select a book and chapters for your presentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 h-[calc(100%-13rem)] overflow-y-auto">
                {/* Book Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select Book
                  </label>
                  <Select
                    disabled={isLoadingBooks || isGenerating}
                    value={selectedBookId?.toString() || ''}
                    onValueChange={(value) => setSelectedBookId(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a book" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingBooks ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      ) : books.length > 0 ? (
                        books.map((book: BookData) => (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {book.bookTitle}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No books found</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Chapter Selection */}
                {selectedBookId && chapters.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Select Chapters
                      </label>
                      <Button 
                        onClick={handleSelectAllChapters}
                        disabled={isGenerating}
                        className="px-3 py-1 text-sm hover:bg-amber-100 bg-amber-50 text-amber-500 rounded-md flex items-center"
                      >
                        {selectedChapters.length === chapters.length ? (
                          <>
                            <X className="mr-1 h-3 w-3" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Select All
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="border rounded-md max-h-60 overflow-hidden">
                      <ScrollArea className="h-60 p-2">
                        {chapters.map((chapter: ChapterData) => (
                          <div key={chapter.id} className="flex items-center space-x-2 py-2">
                            <Checkbox 
                              id={`chapter-${chapter.id}`}
                              checked={selectedChapters.includes(chapter.id)}
                              onCheckedChange={() => handleChapterToggle(chapter.id)}
                              disabled={isGenerating}
                            />
                            <label 
                              htmlFor={`chapter-${chapter.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              Chapter {chapter.chapterNo}: {chapter.chapterName}
                            </label>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {selectedChapters.length} of {chapters.length} chapters selected
                    </div>
                  </div>
                )}
                
                {/* No chapters alert */}
                {selectedBookId && chapters.length === 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No chapters found</AlertTitle>
                    <AlertDescription>
                      This book doesn't have any chapters. Please select a different book.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Number of Slides */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Number of Slides
                  </label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[numberOfSlides]}
                      min={5}
                      max={20}
                      step={1}
                      disabled={isGenerating}
                      onValueChange={(value) => setNumberOfSlides(value[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={numberOfSlides}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 5 && value <= 20) {
                          setNumberOfSlides(value);
                        }
                      }}
                      disabled={isGenerating}
                      min={5}
                      max={20}
                      className="w-20"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleGenerateSlides}
                  disabled={!selectedBookId || selectedChapters.length === 0 || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Presentation className="mr-2 h-4 w-4" />
                      Generate Slides
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Presentation Preview */}
          <div className="h-[100vh] col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="py-3 px-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => setCurrentSlide(0)}
                      disabled={currentSlide === 0 || !isGenerated}
                      className="p-1.5 hover:bg-amber-100 bg-amber-50 text-amber-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={goToPreviousSlide}
                      disabled={currentSlide === 0 || !isGenerated}
                      className="p-1.5 hover:bg-amber-100 bg-amber-50 text-amber-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-base font-semibold px-2">
                      Presentation Preview {isGenerated && slides.length > 0 && `(${currentSlide + 1}/${slides.length})`}
                    </span>
                    <Button
                      onClick={goToNextSlide}
                      disabled={currentSlide === slides.length - 1 || !isGenerated}
                      className="p-1.5 hover:bg-amber-100 bg-amber-50 text-amber-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setCurrentSlide(slides.length - 1)}
                      disabled={currentSlide === slides.length - 1 || !isGenerated}
                      className="p-1.5 hover:bg-amber-100 bg-amber-50 text-amber-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  {isGenerated && completedSlides.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={handleDownloadPDF}
                        className="px-3 py-1.5 text-sm bg-amber-50 text-amber-500 hover:bg-amber-100"
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        onClick={handleExportPPTX}
                        className="px-3 py-1.5 text-sm bg-amber-50 text-amber-500 hover:bg-amber-100"
                      >
                        <Presentation className="mr-1.5 h-4 w-4" />
                        PPTX
                      </Button>
                      <Button 
                        onClick={toggleFullscreen}
                        className="px-3 py-1.5 text-sm bg-amber-50 text-amber-500 hover:bg-amber-100"
                      >
                        <Maximize2 className="mr-1.5 h-4 w-4" />
                        Present
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-4">
                <div ref={slidesContainerRef} className="h-full overflow-auto">
                  {renderCurrentSlide()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Presentation Mode */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-hidden">
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-white rounded-md flex items-center px-4 py-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={() => setIsFullscreen(false)}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-white rounded-md flex items-center px-4 py-2"
            >
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>
          
          <div className="flex items-center justify-between px-8 h-full">
            <Button
              onClick={goToPreviousSlide}
              disabled={currentSlide === 0}
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-full p-4"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <div className="flex-1 max-w-6xl mx-8">
              {renderSlideContent(slides[currentSlide], true)}
            </div>
            
            <Button
              onClick={goToNextSlide}
              disabled={currentSlide === slides.length - 1}
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-full p-4"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 rounded-full px-4 py-2 text-white/90">
            Slide {currentSlide + 1} of {slides.length}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PresentationSlidesPage;