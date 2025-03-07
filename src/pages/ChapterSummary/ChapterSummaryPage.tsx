import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useFetchBooksByTypeQuery, useGenerateChapterSummaryMutation, BookStatus } from '@/api/bookApi';
import { 
  FileText, X, Check, Loader2, ChevronDown, AlertCircle, ArrowLeft, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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

// Define proper API response type
interface FetchBooksResponse {
  books?: BookData[];
  data?: BookData[];
}

const ChapterSummaryPage = () => {
  // State for book selection, chapters, loading, etc.
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isGenerated, setIsGenerated] = useState(false);
  
  // Hooks for API interactions
  const { data: booksResponse, isLoading: isLoadingBooks } = useFetchBooksByTypeQuery({ status: BookStatus.ALL });
  const [generateSummary, { isLoading: isGenerating }] = useGenerateChapterSummaryMutation();
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
    setSummary('');
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
      setSelectedChapters(chapters.map(chapter => chapter.id));
    }
  };
  
  // Generate the summary
  const handleGenerateSummary = async () => {
    if (!selectedBookId || selectedChapters.length === 0) {
      addToast("Please select a book and at least one chapter", "error");
      return;
    }
    
    try {
      const response = await generateSummary({
        bookId: selectedBookId,
        chapterIds: selectedChapters
      }).unwrap();
      
      setSummary(response.summary || response.data?.summary || '');
      setIsGenerated(true);
      addToast("Summary generated successfully", "success");
    } catch (error) {
      console.error("Failed to generate summary:", error);
      addToast("Failed to generate summary. Please try again.", "error");
    }
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
          <h1 className="text-3xl font-bold">Chapter Summary Generator</h1>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Select a book and chapters to summarize</CardDescription>
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
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleGenerateSummary}
                  disabled={!selectedBookId || selectedChapters.length === 0 || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Summary Output */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  <div className="flex justify-between items-center">
                    <span>Chapter Summary</span>
                    {isGenerated && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(summary);
                          addToast("Summary copied to clipboard", "success");
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  {isGenerated 
                    ? `Summary for ${selectedChapters.length} chapter${selectedChapters.length > 1 ? 's' : ''} from "${selectedBook?.bookTitle}"`
                    : "Your generated summary will appear here"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="mt-4 text-gray-500">Generating your summary...</p>
                  </div>
                ) : isGenerated ? (
                  <div className="prose max-w-none">
                    {summary.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No Summary Generated Yet</h3>
                    <p className="text-gray-500 mt-2 max-w-md">
                      Select a book and chapters from the configuration panel, then click "Generate Summary" to create your chapter summary.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChapterSummaryPage; 