import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useFetchBooksByTypeQuery, useGeneratePresentationSlidesMutation, BookStatus } from '@/api/bookApi';
import { 
  Presentation, X, Check, Loader2, ChevronDown, AlertCircle, ArrowLeft, 
  Minimize2, Maximize2, ChevronLeft, ChevronRight
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
  title: string;
  content: string;
}

// Interface for slide data
interface Slide {
  title: string;
  content: string;
  imagePrompt?: string;
}

// Define proper API response type
interface FetchBooksResponse {
  books?: BookData[];
  data?: BookData[];
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
  
  // Hooks for API interactions
  const { data: booksResponse, isLoading: isLoadingBooks } = useFetchBooksByTypeQuery({ status: BookStatus.ALL });
  const [generateSlides, { isLoading: isGenerating }] = useGeneratePresentationSlidesMutation();
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
  
  // Generate the presentation slides
  const handleGenerateSlides = async () => {
    if (!selectedBookId || selectedChapters.length === 0) {
      addToast("Please select a book and at least one chapter", "error");
      return;
    }
    
    try {
      const response = await generateSlides({
        bookId: selectedBookId,
        chapterIds: selectedChapters,
        numberOfSlides: numberOfSlides
      }).unwrap();
      
      const generatedSlides = response.slides || response.data?.slides || [];
      setSlides(generatedSlides);
      setIsGenerated(true);
      setCurrentSlide(0);
      addToast("Presentation slides generated successfully", "success");
    } catch (error) {
      console.error("Failed to generate slides:", error);
      addToast("Failed to generate presentation slides. Please try again.", "error");
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
  
  // Render the current slide
  const renderCurrentSlide = () => {
    if (!isGenerated || slides.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Presentation className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No Presentation Generated Yet</h3>
          <p className="text-gray-500 mt-2 max-w-md">
            Select a book and chapters from the configuration panel, then click "Generate Slides" to create your presentation.
          </p>
        </div>
      );
    }
    
    const slide = slides[currentSlide];
    
    return (
      <div className={`${isFullscreen ? 'h-screen' : 'h-96'} flex flex-col relative bg-white rounded-lg shadow-lg overflow-hidden`}>
        {/* Slide navigation controls */}
        <div className="absolute top-2 right-2 flex space-x-2 z-10">
          {isFullscreen && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Slide content */}
        <div className="flex-1 flex flex-col p-8 overflow-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">{slide.title}</h2>
          <div 
            className="prose max-w-none flex-1" 
            dangerouslySetInnerHTML={{ __html: slide.content }}
          />
        </div>
        
        {/* Slide navigation */}
        <div className="bg-gray-50 p-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="text-sm text-gray-500">
            Slide {currentSlide + 1} of {slides.length}
          </div>
          
          <Button
            variant="outline"
            onClick={goToNextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/ai-assistant')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Assistant
          </Button>
          <h1 className="text-3xl font-bold">Presentation Slides Generator</h1>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Select a book and chapters for your presentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSelectAllChapters}
                        disabled={isGenerating}
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
                              Chapter {chapter.chapterNo}: {chapter.title}
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
                  className="w-full"
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
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  <div className="flex justify-between items-center">
                    <span>Presentation Preview</span>
                    {isGenerated && slides.length > 0 && (
                      <Button 
                        size="sm"
                        onClick={toggleFullscreen}
                      >
                        <Maximize2 className="mr-2 h-4 w-4" />
                        Present
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {isGenerated && slides.length > 0
                    ? `Presentation based on ${selectedChapters.length} chapter${selectedChapters.length > 1 ? 's' : ''} from "${selectedBook?.bookTitle}"`
                    : "Your presentation preview will appear here"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="mt-4 text-gray-500">Generating your presentation slides...</p>
                  </div>
                ) : (
                  renderCurrentSlide()
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Presentation Mode */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-100 to-blue-50 z-50 overflow-hidden flex justify-center items-center p-8">
          {renderCurrentSlide()}
        </div>
      )}
    </Layout>
  );
};

export default PresentationSlidesPage; 