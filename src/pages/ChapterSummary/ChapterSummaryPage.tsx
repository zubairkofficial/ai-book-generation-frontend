import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import {
  useFetchBooksByTypeQuery,
  useGenerateChapterSummaryMutation,
  useUpdateChapterSummaryMutation,
  BookStatus,
} from "@/api/bookApi";
import {
  FileText,
  X,
  Check,
  Loader2,
  ChevronDown,
  AlertCircle,
  ArrowLeft,
  Copy,
  Save,
  DownloadIcon,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { BASE_URl } from "@/constant";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { cn } from "@/lib/utils";
import { ReloadIcon } from "@radix-ui/react-icons";
import { pdf } from "@react-pdf/renderer";
import SummaryPDF from "./SummaryPDF";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

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

// Define proper API response type
interface FetchBooksResponse {
  books?: BookData[];
  data?: BookData[];
}

const ChapterSummaryPage = () => {
  // State for book selection, chapters, loading, etc.
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [numberOfWords, setNumberOfWords] = useState(50);
  const [isCombined, setIsCombined] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [streamedSummary, setStreamedSummary] = useState<string>("");
  const [chaptersSummary, setChaptersSummary] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [finalSummary, setFinalSummary] = useState<string>("");
  const [isStreamComplete, setIsStreamComplete] = useState(false);
  const { token } = useSelector((state: RootState) => state.auth);

  console.log("isStreamComplete", isStreamComplete);
  // Hooks for API interactions
  const { data: booksResponse, isLoading: isLoadingBooks } =
    useFetchBooksByTypeQuery({ status: BookStatus.ALL });
  const [generateSummary, { isLoading: isGeneratingSummary }] =
    useGenerateChapterSummaryMutation();
  const [updateChapterSummary, { isLoading: isUpdating }] =
    useUpdateChapterSummaryMutation();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Extract books array from response - handle both possible response formats
  const books: BookData[] = booksResponse?.books || booksResponse?.data || [];

  // Get chapters for selected book
  const selectedBook = selectedBookId
    ? books.find((book) => book.id === selectedBookId)
    : undefined;
  const chapters = selectedBook?.bookChapter || [];
  console.log("selectedBook", selectedBook);
  // Reset selected chapters when book changes
  useEffect(() => {
    setSelectedChapters([]);
    setIsGenerated(false);
    setSummary("");
  }, [selectedBookId]);

  // Cleanup function for SSE connection
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Handle chapter selection
  const handleChapterToggle = (chapterId: number) => {
    if (selectedChapters.includes(chapterId)) {
      setSelectedChapters(selectedChapters.filter((id) => id !== chapterId));
    } else {
      setSelectedChapters([...selectedChapters, chapterId]);
    }
  };

  // Handle "Select All" functionality
  const handleSelectAllChapters = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(chapters.map((chapter) => chapter.id));
    }
  };

  // Modified generate summary function
  const handleGenerateSummary = async () => {
    if (!selectedBookId || selectedChapters.length === 0) {
      addToast("Please select a book and at least one chapter", "error");
      return;
    }

    if (numberOfWords < 50 || numberOfWords > 500) {
      addToast("Number of words must be between 50 and 500", "error");
      return;
    }

    try {
      setIsGenerating(true);
      setStreamedSummary("");
      setIsStreamComplete(false);
      setFinalSummary("");

      // Close any existing SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Initialize SSE connection
      console.log("number of words", numberOfWords);
      const eventSource = new EventSource(
        `${BASE_URl}/book-chapter/summary-stream?token=${token}&noOfWords=${numberOfWords}&isCombined=${isCombined}`,
      );

      eventSourceRef.current = eventSource;

      let accumulatedContent = "";
      const accumalatedChapters: string[] = [];

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            accumulatedContent += data.text;
            setStreamedSummary(accumulatedContent);
            if (!isCombined) {
              accumalatedChapters.push(data.text);
              setChaptersSummary(accumalatedChapters);
            }
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        setIsGenerating(false);
        addToast("Error in summary stream connection", "error");
      };

      eventSource.addEventListener("complete", () => {
        setIsStreamComplete(true);

        eventSource.close();
        setFinalSummary(accumulatedContent);
        setIsGenerating(false);
        setIsGenerated(true);
      });

      await generateSummary({
        bookId: selectedBookId,
        chapterIds: selectedChapters,
        noOfWords: numberOfWords,
        isCombined,
      }).unwrap();
      setIsGenerating(false);
      setIsStreamComplete(true);
    } catch (error) {
      console.error("Error generating summary:", error);
      addToast("Error generating summary", "error");
      setIsGenerating(false);
    }
  };

  // Handle applying the summary
  const handleApplySummary = async () => {
    if (!selectedBookId || !finalSummary) {
      addToast("No summary to apply", "error");
      return;
    }

    try {
      await updateChapterSummary({
        bookId: selectedBookId,
        chapterIds: selectedChapters,
        summary: finalSummary,
      }).unwrap();

      addToast("Summary applied successfully", "success");
    } catch (error) {
      console.error("Error applying summary:", error);
      addToast("Failed to apply summary", "error");
    }
  };

  // Function to format markdown content
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50">
        <div className="max-w-[1400px] mx-auto p-6">
          {/* Header Section */}
          <Button
            onClick={() => navigate("/ai-assistant")}
            className="mr-4 px-4 py-2 hover:bg-amber-100 rounded-md flex items-center bg-amber-50 text-amber-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Assistant
          </Button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedBook?.bookTitle
                    ? `Summary for "${selectedBook?.bookTitle}"`
                    : "Chapter Summary Generator"}
                </h1>
                <p className="text-gray-600">
                  Generate concise summaries of your book chapters
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/50 backdrop-blur-sm">
                <ScrollArea className="h-[40rem] pr-4">
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                      Select a book and chapters to summarize
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Book Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Select Book
                      </Label>
                      <Select
                        disabled={isLoadingBooks || isGeneratingSummary}
                        value={selectedBookId?.toString() || ""}
                        onValueChange={(value) =>
                          setSelectedBookId(value ? parseInt(value) : null)
                        }
                      >
                        <SelectTrigger className="border-amber-200">
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
                            <div className="p-2 text-sm text-gray-500">
                              No books found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Chapter Selection */}
                    {selectedBookId && chapters.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-700">
                            Select Chapters
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAllChapters}
                            disabled={isGeneratingSummary}
                            className="hover:bg-amber-100 text-amber-600"
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

                        <div className="border border-amber-200 rounded-md max-h-60 overflow-hidden">
                          <ScrollArea className="h-60 p-2">
                            {chapters.map((chapter: ChapterData) => (
                              <div
                                key={chapter.id}
                                className="flex items-center space-x-2 py-2"
                              >
                                <Checkbox
                                  id={`chapter-${chapter.id}`}
                                  checked={selectedChapters.includes(chapter.id)}
                                  onCheckedChange={() =>
                                    handleChapterToggle(chapter.id)
                                  }
                                  disabled={isGeneratingSummary}
                                  className="border-amber-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
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
                          {selectedChapters.length} of {chapters.length} chapters
                          selected
                        </div>
                      </div>
                    )}

                    {/* No chapters alert */}
                    {selectedBookId && chapters.length === 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No chapters found</AlertTitle>
                        <AlertDescription>
                          This book doesn't have any chapters. Please select a
                          different book.
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedBookId && (
                      <div className="space-y-2">
                        <Label
                          htmlFor={"numberOfWords"}
                          className="text-sm font-medium text-gray-700"
                        >
                          Number of Words (50-500)
                        </Label>
                        <Input
                          id={"numberOfWords"}
                          name={"numberOfWords"}
                          type="number"
                          min={50}
                          max={500}
                          placeholder="Enter number of words"
                          value={numberOfWords}
                          onChange={(e) =>
                            setNumberOfWords(parseInt(e.target.value))
                          }
                          className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>
                    )}
                    
                    {selectedBookId && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={"combined"}
                          checked={isCombined}
                          onCheckedChange={() => setIsCombined((prev) => !prev)}
                          className="border-amber-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                        <Label
                          htmlFor={"combined"}
                          className="text-sm font-medium text-gray-700"
                        >
                          Combine Summary for all chapters
                        </Label>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"            
                      onClick={handleGenerateSummary}
                      disabled={
                        !selectedBookId ||
                        selectedChapters.length === 0 ||
                        isGeneratingSummary
                      }
                    >
                      {isGeneratingSummary ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </ScrollArea>
              </Card>
            </motion.div>

            {/* Summary Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/50 backdrop-blur-sm h-full">
                <ScrollArea className="h-[40rem] pr-4">
                  <CardHeader>
                    <CardTitle>
                      <div className="flex justify-between items-center">
                        <span>Chapter Summary</span>
                        <div className="flex space-x-2">
                          {isGenerated && !isGenerating && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleApplySummary}
                              disabled={isUpdating}
                              className="border-amber-200 hover:bg-amber-50"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Apply Summary
                                </>
                              )}
                            </Button>
                          )}
                          {isStreamComplete && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const blob = await pdf(
                                    <SummaryPDF
                                      summary={streamedSummary}
                                      chapters={selectedBook?.bookChapter}
                                      isCombined={isCombined}
                                      chaptersSummary={chaptersSummary}
                                      title={
                                        selectedBook?.bookTitle
                                          ? `Summary for "${selectedBook?.bookTitle}"`
                                          : "Summary"
                                      }
                                    />,
                                  ).toBlob();
                                  const link = document.createElement("a");
                                  link.href = URL.createObjectURL(blob);
                                  link.download = `${selectedBook?.bookTitle}-Summary.pdf`;
                                  link.click();
                                  addToast("Summary PDF Downloaded", "success");
                                }}
                                className="border-amber-200 hover:bg-amber-50"
                              >
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await handleGenerateSummary();
                                  addToast("Summary Regenerated", "success");
                                }}
                                className="border-amber-200 hover:bg-amber-50"
                              >
                                <ReloadIcon className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {isGenerated
                        ? `Summary for ${selectedChapters.length} chapter${
                            selectedChapters.length > 1 ? "s" : ""
                          } from "${selectedBook?.bookTitle}"`
                        : "Your generated summary will appear here"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="prose max-w-none dark:prose-invert">
                    {isStreamComplete
                      ? formatMarkdown(
                          isCombined
                            ? streamedSummary
                            : chaptersSummary
                                .map(
                                  (text, i) => `**Chapter: ${i + 1}** \n\n ${text}`,
                                )
                                .join("\n\n"),
                        )
                      : isGenerating ? (
                        <div className="prose max-w-none">
                          {formatMarkdown(streamedSummary)}
                          <div className="flex items-center gap-2 text-gray-500 mt-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Generating...</span>
                          </div>
                        </div>
                      ) : !isGenerated ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                          <FileText className="h-16 w-16 text-amber-200 mb-4" />
                          <h3 className="text-lg font-medium text-gray-700">
                            No Summary Generated Yet
                          </h3>
                          <p className="text-gray-500 mt-2 max-w-md">
                            Select a book and chapters from the configuration panel, then click
                            "Generate Summary" to create your chapter summary.
                          </p>
                        </div>
                      ) : (
                        <div className="prose max-w-none">
                          {formatMarkdown(finalSummary)}
                        </div>
                      )}
                  </CardContent>
                </ScrollArea>
              </Card>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-40 left-10 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-80 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
    </Layout>
  );
};

export default ChapterSummaryPage;