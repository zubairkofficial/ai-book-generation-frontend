import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2, Check, RefreshCw, ArrowLeft, ArrowRight, Settings, RotateCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/context/ToastContext";
import { ToastType } from "@/constant";
import {
  useFetchBookByIdQuery,
  useGenerateBookEndContentMutation,
  useUpdateBookGeneratedMutation,
} from "@/api/bookApi";
import { BASE_URl } from "@/constant";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface BookEndContentGeneratorProps {
  bookId: number;
  bookTitle: string;
  onComplete?: () => void;
}

type ContentType = "glossary" | "references" | "index";

const BookEndContentGenerator: React.FC<BookEndContentGeneratorProps> = ({
  bookId,
  bookTitle,
  onComplete,
}) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const { token } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<ContentType>("glossary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Initialize content states
  const [glossaryContent, setGlossaryContent] = useState("");
  const [referencesContent, setReferencesContent] = useState("");
  const [indexContent, setIndexContent] = useState("");

  // Streaming content
  const [streamingContent, setStreamingContent] = useState("");
  
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState("");

  // Generation tracking
  const [generated, setGenerated] = useState({
    glossary: false,
    references: false,
    index: false,
  });

  // Add these new states for paragraph selection and regeneration
  const [selectedContent, setSelectedContent] = useState<{ text: string; index: number } | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [regeneratedContent, setRegeneratedContent] = useState('');
  const [showInsertOption, setShowInsertOption] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [editMode, setEditMode] = useState<'ai' | 'human'>('ai');
  const [humanEditContent, setHumanEditContent] = useState('');

  console.log("streamingContent",streamingContent)
  // API hooks
  const [generateBookEndContent] = useGenerateBookEndContentMutation();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const {data: getBookById, isLoading, refetch: refetchBook} = useFetchBookByIdQuery(bookId, { skip: !bookId });

  // Derive if all sections are complete
  const allSectionsComplete = generated.glossary && generated.references && generated.index;

  // Calculate progress percentage
  const calculateProgress = () => {
    const completedSections = Object.values(generated).filter(Boolean).length;
    return (completedSections / 3) * 100;
  };

  useEffect(()=>{refetchBook()},[activeTab])
  console.log("getBookById",!!getBookById?.data)
  // Load content from API on component mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Set initial content if provided
        if (getBookById.data) {
          if (getBookById.data.glossary) {
            setGlossaryContent(getBookById.data.glossary);
            setGenerated(prev => ({ ...prev, glossary:!!getBookById?.data?.glossary }));
          }
          if (getBookById.data.references) {
            setReferencesContent(getBookById.data.references);
            setGenerated(prev => ({ ...prev, references: !!getBookById?.data?.references }));
          }
          if (getBookById.data.index) {
            setIndexContent(getBookById.data.index);
            setGenerated(prev => ({ ...prev, index: !!getBookById?.data?.index }));
          }
        }

        // Set initial progress if provided
        if (!!getBookById.data) {
          setGenerated({
            glossary: !!getBookById.data.glossary,
            references: !!getBookById.data.references,
            index: !!getBookById.data.index,
          });
        }

        await refetchBook()
        if (getBookById.statusCode === 200 && getBookById.data) {
          const { glossary, references, index } = getBookById.data;
          
          if (glossary) {
            setGlossaryContent(glossary);
            setGenerated(prev => ({ ...prev, glossary: true }));
          }
          
          if (references) { // Note: API field has a typo
            setReferencesContent(references);
            setGenerated(prev => ({ ...prev, references: true }));
          }
          
          if (index) {
            setIndexContent(index);
            setGenerated(prev => ({ ...prev, index: true }));
          }
        }
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadContent();
  }, [bookId,  getBookById?.data, !!getBookById?.data]);

  // Get current content based on active tab
  const getCurrentContent = () => {
    switch (activeTab) {
      case "glossary":
        return glossaryContent;
      case "references":
        return referencesContent;
      case "index":
        return indexContent;
      default:
        return "";
    }
  };

  
  // Add this useEffect to handle text selection
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
              index: index
            });
            setShowEditPanel(true);
          }
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  // Format content for display
  const formatContent = (content: string) => {
    if (!content) return null;
    
    // Split content into paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    return (
      <div className="prose prose-amber max-w-none">
        {paragraphs.map((paragraph, index) => (
          <div 
            key={index} 
            data-paragraph-index={index}
            className="mb-4 paragraph-selectable hover:bg-amber-50 p-1 rounded transition-colors"
          >
            <ReactMarkdown>{paragraph}</ReactMarkdown>
          </div>
        ))}
      </div>
    );
  };

  // Handle content generation
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setStreamingContent(""); // Clear streaming content
      setGlossaryContent("")
      setIndexContent("")
      setReferencesContent("")
      // Create payload for API
      const payload = {
        bookId,
        contentType: activeTab,
        additionalInfo,
      };
      
    
      // Set up event source for streaming
      const eventSource = new EventSource(`${BASE_URl}/book-generation/book-end-stream/bgr?token=${token}`);
      
      let fullContent = "";
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            fullContent += data.text;
            setStreamingContent(fullContent);
          }
        } catch (error) {
          // For raw text or parsing errors
          fullContent += event.data;
          setStreamingContent(fullContent);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error("Stream error:", error);
        eventSource.close();
        setIsGenerating(false);
        
        // Save the accumulated content
        if (fullContent) {
          // Update the appropriate content state
          if (activeTab === "glossary") {
            setGlossaryContent(fullContent);
            setGenerated(prev => ({ ...prev, glossary: true }));
          } else if (activeTab === "references") {
            setReferencesContent(fullContent);
            setGenerated(prev => ({ ...prev, references: true }));
          } else if (activeTab === "index") {
            setIndexContent(fullContent);
            setGenerated(prev => ({ ...prev, index: true }));
          }
          
          // Save to API
          saveGeneratedContent(fullContent);
        }
      };
        // Initialize generation
      const response= await generateBookEndContent(payload).unwrap();
   if(response){
     setIsGenerating(false);
      addToast("Content generated successfully", ToastType.SUCCESS);
      // Safety timeout
     
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
        }
     
     } 
    } catch (error: any) {
     console.error("Error generating content:", error);
      addToast(error.message || "Failed to generate content", ToastType.ERROR);
      setIsGenerating(false);
    }
  };

  
  // Save generated content to API
  const saveGeneratedContent = async (content: string) => {
    try {
      const updateData: any = {
        bookGenerationId: bookId,
      };
      
      // Set the correct field based on active tab
      if (activeTab === "glossary") {
        updateData.glossary = content;
      } else if (activeTab === "references") {
        updateData.references = content; // API field name has a typo
      } else if (activeTab === "index") {
        updateData.index = content;
      }
      
      const response = await updateBookGenerated(updateData).unwrap();
      
      if (response.statusCode === 200) {
        addToast(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} successfully generated!`, ToastType.SUCCESS);
      }
    } catch (error: any) {
      console.error("Error saving content:", error);
      addToast(error.message || "Failed to save content", ToastType.ERROR);
    }
  };

  // Handle navigating to next section
  const handleNextSection = () => {
    if (activeTab === "glossary") {
      setActiveTab("references");
    } else if (activeTab === "references") {
      setActiveTab("index");
    }
  };

  // Handle navigating to previous section
  const handlePreviousSection = () => {
    if (activeTab === "references") {
      setActiveTab("glossary");
    } else if (activeTab === "index") {
      setActiveTab("references");
    }
  };

  // Handle enabling edit mode
  const handleEditMode = () => {
    setEditableContent(getCurrentContent() || "");
    setIsEditing(true);
  };

  // Handle saving edits
  const handleSaveEdit = async () => {
    if (!editableContent) return;
    
    try {
      setIsGenerating(true);
      
      // Update the appropriate content state
      if (activeTab === "glossary") {
        setGlossaryContent(editableContent);
        setGenerated(prev => ({ ...prev, glossary: true }));
      } else if (activeTab === "references") {
        setReferencesContent(editableContent);
        setGenerated(prev => ({ ...prev, references: true }));
      } else if (activeTab === "index") {
        setIndexContent(editableContent);
        setGenerated(prev => ({ ...prev, references: true }));
      }
      
      // Save to API
      await saveGeneratedContent(editableContent);
      setIsEditing(false);
      setIsGenerating(false);
      
    } catch (error) {
      console.error("Error saving edit:", error);
      addToast("Failed to save edit", ToastType.ERROR);
      setIsGenerating(false);
    }
  };

  // Handle completing the book
  const handleCompleteBook = () => {
    addToast("Book completed successfully!", ToastType.SUCCESS);
    if (onComplete) {
      onComplete();
    } else {
      navigate("/books");
    }
  };

  // Add regenerate paragraph function
  const handleRegenerateParagraph = async (index: number, instruction: string) => {
    try {
      setRegeneratedContent('');
      setIsGenerating(true);
      setShowInsertOption(true);
      
      const actualIndex = selectedContent?.index || index;
      
      // Create payload for API
      const payload = {
        bookId,
        contentType: activeTab,
        additionalInfo: instruction || additionalInfo,
        // paragraphIndex: actualIndex,
        currentContent: selectedContent?.text
      };
      
      // Set up event source for streaming
      const eventSource = new EventSource(`${BASE_URl}/book-generation/book-end-stream/bgr?token=${token}`);
      
      let fullContent = "";
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            fullContent += data.text;
            setRegeneratedContent(fullContent);
          }
        } catch (error) {
          // For raw text or parsing errors
          fullContent += event.data;
          setRegeneratedContent(fullContent);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error("Stream error:", error);
        eventSource.close();
        setIsGenerating(false);
      };
      
      // Initialize generation with a payload that includes the paragraph index
      await generateBookEndContent(payload).unwrap();
      
   
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
          setIsGenerating(false);
        }
      
      
    } catch (error: any) {
      console.error("Error regenerating paragraph:", error);
      addToast(error.message || "Failed to regenerate content", ToastType.ERROR);
      setIsGenerating(false);
    }
  };

  // Add function to insert regenerated content
  const handleInsertContent = async () => {
    try {
      setIsInserting(true);
      
      let contentToInsert = '';
      
      if (editMode === 'human') {
        contentToInsert = humanEditContent;
      } else {
        contentToInsert = regeneratedContent;
      }
      
      if (!contentToInsert) {
        addToast("No content to insert", ToastType.ERROR);
        setIsInserting(false);
        return;
      }
      
      // Get current content based on active tab
      let currentContent = '';
      if (activeTab === "glossary") {
        currentContent = glossaryContent;
      } else if (activeTab === "references") {
        currentContent = referencesContent;
      } else if (activeTab === "index") {
        currentContent = indexContent;
      }
      
      // If no saved content but we have streaming content, use that
      if (!currentContent && streamingContent) {
        currentContent = streamingContent;
      }
      
      // Split content into paragraphs
      const paragraphs = currentContent ? currentContent.split(/\n\n+/) : [];
      
      // Replace only the selected paragraph with new content
      if (selectedContent && selectedContent.index < paragraphs.length) {
        paragraphs[selectedContent.index] = contentToInsert;
      } else {
        // If somehow the index is invalid, append to the end
        paragraphs.push(contentToInsert);
      }
      
      // Join back together and update
      const updatedContent = paragraphs.join('\n\n');
      
      // Update the appropriate content state
      if (activeTab === "glossary") {
        setGlossaryContent(updatedContent);
        setGenerated(prev => ({ ...prev, glossary: true }));
      } else if (activeTab === "references") {
        setReferencesContent(updatedContent);
        setGenerated(prev => ({ ...prev, references: true }));
      } else if (activeTab === "index") {
        setIndexContent(updatedContent);
        setGenerated(prev => ({ ...prev, index: true }));
      }
      
      // If we were working with streaming content that wasn't saved yet,
      // make sure it's preserved in the appropriate state
      if (!getCurrentContent() && streamingContent) {
        if (activeTab === "glossary") {
          setGlossaryContent(updatedContent);
        } else if (activeTab === "references") {
          setReferencesContent(updatedContent);
        } else if (activeTab === "index") {
          setIndexContent(updatedContent);
        }
      }
      
      // Save to API
      await saveGeneratedContent(updatedContent);
      
      // Reset states
      setShowEditPanel(false);
      setShowInsertOption(false);
      setRegeneratedContent('');
      setHumanEditContent('');
      setEditInstruction('');
      setSelectedContent(null);
      
      addToast("Content updated successfully", ToastType.SUCCESS);
    } catch (error: any) {
      console.error("Error inserting content:", error);
      addToast(error.message || "Failed to update content", ToastType.ERROR);
    } finally {
      setIsInserting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }
  const handleBookEndContent=(tab: string)=>{
    setActiveTab(tab as ContentType)
    setStreamingContent("")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        onClick={() => navigate(-1)}
        className="mr-4 px-4 py-2 hover:bg-amber-100 rounded-md flex items-center bg-amber-50 text-amber-500 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Finishing Your Book
        </h1>
        <p className="text-gray-600">
          Add final content to complete "{bookTitle}"
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel - either settings or edit panel */}
        {showEditPanel ? (
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-semibold">Edit Content</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditPanel(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-500">Selected Text</Label>
                <div className="p-3 bg-amber-50 rounded-md mt-1 text-sm">
                  {selectedContent?.text}
                </div>
              </div>

              <div className="flex gap-4 my-3">
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
                      disabled={isGenerating || isInserting}
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : isInserting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Inserting...</span>
                        </div>
                      ) : (
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
          // Settings Panel - existing code
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold">Content Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {["glossary", "references", "index"].map((tab) => (
                    <Button
                      key={tab}
                      onClick={() => handleBookEndContent(tab as ContentType)}
                      variant="outline"
                      className={cn(
                        "justify-center",
                        activeTab === tab
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "hover:bg-amber-50 text-gray-700"
                      )}
                    >
                      <div className=" items-center">
                        <span className="capitalize">{tab}</span>
                        {generated[tab as ContentType] && (
                          <Check className="h-3 w-3 ml-2 text-green-600" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>

              </div>
              
              <div>
                <Label htmlFor="additionalInfo">Additional Details</Label>
                <Textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="mt-1"
                  placeholder={`Provide any specific details for ${activeTab} generation...`}
                  disabled={isGenerating || isEditing}
                />
              </div>

              <div className="mb-6">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${calculateProgress()}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {Object.values(generated).filter(Boolean).length} of 3 completed
                </div>
              </div>

              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isGenerating || isEditing}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                  </div>
                )}
              </Button>

              {allSectionsComplete && (
                <Button
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleCompleteBook}
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Complete Book</span>
                  </div>
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Main Content Area */}
        <Card className="lg:col-span-2 p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
            </div>
            <div className="flex gap-2">
              
              {generated[activeTab] && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  title="Regenerate Content"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div ref={contentRef} className={cn(
            "prose prose-amber max-w-none",
            "h-[calc(100vh-300px)] overflow-y-auto",
            "bg-gray-50 rounded-lg p-6"
          )}>
            {isEditing ? (
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
                        setEditableContent(getCurrentContent() || "");
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
                          <Loader2 className="w-4 h-4 animate-spin" />
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
            ) : isGenerating ? (
              <div>
                {streamingContent ? (
                  <div className="prose prose-amber max-w-none">
                    <ReactMarkdown>{streamingContent}</ReactMarkdown>
                    <div className="animate-pulse mt-2">|</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
                      <p className="text-gray-500">Generating {activeTab}...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : getCurrentContent() || streamingContent ? (
              // Show either the final content or the streaming content that was generated
              formatContent(getCurrentContent() || streamingContent)
            ) : (
              <p className="text-gray-400 text-center py-12">
                Generated content will appear here...
              </p>
            )}
          </div>
          
          {/* Navigation buttons at bottom */}
          {!isEditing && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={handlePreviousSection}
                disabled={activeTab === "glossary" || isGenerating}
                className={activeTab === "glossary" ? "invisible" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                onClick={handleNextSection}
                disabled={activeTab === "index" || isGenerating}
                className={activeTab === "index" ? "invisible" : ""}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookEndContentGenerator;
