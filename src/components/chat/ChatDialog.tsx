import {  useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send,  Loader2 } from 'lucide-react';
import { useGetAiAssistantResponseMutation } from '@/api/aiAssistantApi';
import { ToastType } from '@/constant';
import { useToast } from '@/context/ToastContext';
import { ChatDialogProps } from './types/chat.types';
import BookCoverContent from './components/BookCoverContent';
import BookIdeaContent from './components/BookIdeaContent';
import { useNavigate } from 'react-router-dom';
// Enums from CreateBook.tsx
export enum BookGenre {
  FICTION = "Fiction",
  NON_FICTION = "Non-Fiction",
  MYSTERY = "Mystery",
  SCIENCE_FICTION = "Science Fiction",
  FANTASY = "Fantasy",
  ROMANCE = "Romance",
  BUSINESS = "Business",
  PROFESSIONAL = "Professional",
  EDUCATION = "Education",
  HEALTH = "Health",
  HISTORY = "History",
  LITERATURE = "Literature",
  TRAVEL = "Travel",
  TECHNOLOGY = "Technology",
  SPORTS = "Sports",
  SCIENCE = "Science",
  POLITICS = "Politics",
  PHILOSOPHY = "Philosophy",
  RELIGION = "Religion",
  ART = "Art",
  MUSIC = "Music",
  COMEDY = "Comedy"
}

export enum BookLanguage {
  ENGLISH = "English",
  SPANISH = "Spanish",
  FRENCH = "French",
  GERMAN = "German",
  ITALIAN = "Italian",
  PORTUGUESE = "Portuguese",
  CHINESE = "Chinese",
  JAPANESE = "Japanese",
  KOREAN = "Korean",
  HINDI = "Hindi"
}

export enum TargetAudience {
  ALL_AGES = "All Ages",
  CHILDREN = "Children (Ages 5-12)",
  TEENAGERS = "Teenagers (Ages 13-17)",
  YOUNG_ADULTS = "Young Adults (Ages 18-25)",
  ADULTS = "Adults (Ages 26-64)"
}

// Question sets for different tools
const bookCoverQuestions = [
  {
    id: 'bookTitle',
    question: "What's the title of your book?",
    placeholder: "Enter your book title",
    required: true
  },
  {
    id: 'genre',
    question: "What's the genre of your book?",
    placeholder: "Select genre",
    type: 'select',
    options: Object.values(BookGenre),
    required: true
  },
  {
    id: 'coverStyle',
    question: "What style would you like for your cover?",
    placeholder: "e.g., Minimalist, Illustrated, Photography-based",
    required: true
  },
  {
    id: 'colorPreference',
    question: "Do you have any color preferences?",
    placeholder: "e.g., Dark and moody, Bright and colorful",
    required: false
  },
  {
    id: 'targetAudience',
    question: "Who is your target audience?",
    placeholder: "Select target audience",
    type: 'select',
    options: Object.values(TargetAudience),
    required: true
  },
  {
    id: 'additionalElements',
    question: "Any specific elements you'd like on the cover?",
    placeholder: "e.g., Specific symbols, imagery, or themes",
    required: false
  }
];

const writingAssistantQuestions = [
  {
    id: 'writingGoal',
    question: "What's your primary writing goal?",
    placeholder: "e.g., Improve dialogue, Enhance descriptions, Build tension",
    required: true
  },
  {
    id: 'genre',
    question: "What genre are you writing in?",
    placeholder: "Select genre",
    type: 'select',
    options: Object.values(BookGenre),
    required: true
  },
  {
    id: 'targetAudience',
    question: "Who is your target audience?",
    placeholder: "Select target audience",
    type: 'select',
    options: Object.values(TargetAudience),
    required: true
  },
  {
    id: 'currentChallenges',
    question: "What writing challenges are you facing?",
    placeholder: "e.g., Writer's block, Pacing issues, Character development",
    required: true
  },
  {
    id: 'writingLevel',
    question: "What's your writing experience level?",
    placeholder: "e.g., Beginner, Intermediate, Advanced",
    required: true
  },
  {
    id: 'specificArea',
    question: "Any specific area you want to focus on?",
    placeholder: "e.g., Opening chapters, Climax scenes, Character arcs",
    required: true
  }
];

// Add this new question set after the existing question sets
const bookGenerationQuestions = [
  {
    id: 'bookTitle',
    question: "What's the title of your book?",
    placeholder: "Enter your book title",
    required: true
  },
  {
    id: 'genre',
    question: "What genre would you like for your book?",
    placeholder: "Select genre",
    type: 'select',
    options: Object.values(BookGenre),
    required: true
  },
  {
    id: 'bookInformation',
    question: "What is your book idea about?",
    placeholder: "Describe your book idea and plot",
    required: true
  },
  {
    id: 'numberOfChapters',
    question: "How many chapters would you like in your book?",
    placeholder: "Enter number of chapters",
    type: 'number',
    required: true
  },
  {
    id: 'targetAudience',
    question: "Who is your target audience?",
    placeholder: "Select target audience",
    type: 'select',
    options: Object.values(TargetAudience),
    required: true
  },
  {
    id: 'language',
    question: "What language will the book be in?",
    placeholder: "Select language",
    type: 'select',
    options: Object.values(BookLanguage),
    required: true
  },
  // Optional fields
  {
    id: 'authorName',
    question: "What's the author's name? (Optional)",
    placeholder: "Enter author name",
    required: false
  },
  {
    id: 'authorBio',
    question: "Author's brief bio (Optional)",
    placeholder: "Enter author bio",
    required: false
  },
  {
    id: 'characters',
    question: "Who are the main characters? (Optional)",
    placeholder: "Describe your main characters",
    required: false
  },
  {
    id: 'additionalContent',
    question: "Any additional notes or content? (Optional)",
    placeholder: "Enter any additional information",
    required: false
  }
];

// Core questions for book idea generation
const bookIdeaQuestions = [
  {
    id: 'genre',
    question: "What genre would you like for your book idea?",
    placeholder: "Select genre",
    type: 'select',
    options: Object.values(BookGenre),
    required: true
  },
  {
    id: 'targetAudience',
    question: "Who is your target audience?",
    placeholder: "Select target audience",
    type: 'select',
    options: Object.values(TargetAudience),
    required: true
  },
  {
    id: 'themeOrTopic',
    question: "What main theme or topic would you like to explore?",
    placeholder: "e.g., redemption, love, justice, technology's impact",
    required: true
  },
  {
    id: 'specificElements',
    question: "Any specific elements you'd like in the story?",
    placeholder: "e.g., magic system, time period, setting, or plot elements",
    required: true
  },
  {
    id: 'description',
    question: "Any additional description or context? (Optional)",
    placeholder: "Add any extra details or specific requirements for your book idea",
    required: false
  }
];

// Add these interfaces and enum
export enum AiAssistantType {
  BOOK_IDEA = "book_idea",
  BOOK_COVER_IMAGE = "book_cover_image",
  WRITING_ASSISTANT = "writing_assistant",
}

interface AiAssistantResponse {
  id: number;
  information: {
    genre: string;
    targetAudience: string;
    themeOrTopic: string;
    specificElements: string;
    description: string;
  };
  type: AiAssistantType;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    // ... other user fields
  };
  response: {
    generatedText: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
}

const ChatDialog = ({ isOpen, title, onClose }: ChatDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [getAiAssistantResponse] = useGetAiAssistantResponseMutation();
  const { addToast } = useToast(); // Use custom toast hook
  const [responseData, setResponseData] = useState<any>(null);
  const navigate = useNavigate();

  console.log("reponses",responses)
  // Select question set based on tool type
  const getQuestions = () => {
    switch (title) {
      case 'Book Cover Design':
        return bookCoverQuestions;
      case 'Writing Assistant':
        return writingAssistantQuestions;
      case 'Generate Book':
        return bookGenerationQuestions;
      case 'Generate Book Ideas':
        return bookIdeaQuestions;
      default:
        return [];
    }
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentStep];

  const handleNext = async () => {
    if (!userInput && currentQuestion.required) return;
    const allResponses = {
      ...responses,
      [currentQuestion.id]: userInput
    };
    setResponses(allResponses);
    setUserInput('');
    if (currentStep === questions.length - 1) {
      try {
        setIsLoading(true);
        const assistantType = getAssistantType(title);
        
        const payload = {
          type: assistantType,
          ...(assistantType === AiAssistantType.BOOK_COVER_IMAGE 
            ? { bookCoverInfo: allResponses }
            : assistantType === AiAssistantType.BOOK_IDEA
            ? { information: allResponses }
            : { bookWriteInfo: allResponses }
          )
        };
        
        const response = await getAiAssistantResponse(payload).unwrap();
        
        if (response?.response?.generatedText) {
          handleClose();
          navigate('/response', {
            state: {
              responses: allResponses,
              generatedContent: response.response.generatedText,
              aiAssistantId: response.id
            }
          });
        }
      } catch (error) {
        console.error('Error:', error);
        addToast('Failed to generate content. Please try again.', ToastType.ERROR);
      } finally {
        setIsLoading(false);
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      const assistantType = getAssistantType(title);
      let payload;

      switch (assistantType) {
        case AiAssistantType.BOOK_COVER_IMAGE:
          payload = {
            type: assistantType,
            bookCoverInfo: responses
          };
          break;
        case AiAssistantType.WRITING_ASSISTANT:
          payload = {
            type: assistantType,
            bookWriteInfo: responses
          };
          break;
        case AiAssistantType.BOOK_IDEA:
          payload = {
            type: assistantType,
            information: responses
          };
          break;
        default:
          payload = {
            type: assistantType,
            information: responses
          };
      }

      setIsLoading(true);
      const response = await getAiAssistantResponse(payload).unwrap();
      
      if (response?.response?.generatedText) {
        setGeneratedContent(response.response.generatedText);
     
        addToast('Successfully generated content!', ToastType.SUCCESS);
      } else {
        throw new Error('No generated content received');
      }
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to generate content. Please try again.', ToastType.ERROR);
    } finally {
      setIsLoading(false);
    }
  };
  

  const renderGeneratedContent = () => {
    if (!generatedContent) {
      return (
        
        <div className="text-center space-y-8 py-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            Ready to Generate {title}!
          </h3>
          {responseData && (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-amber-100">
              <h4 className="text-xl font-semibold text-amber-800 mb-6">
                Your Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {Object.entries(responseData.information || responseData.bookCoverInfo || {}).map(([key, value]) => (
                  <div key={key} className="bg-amber-50/50 p-4 rounded-xl">
                    <p className="flex flex-col">
                      <span className="text-sm font-medium text-amber-700 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="text-gray-700">{value as string}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    const assistantType = getAssistantType(title);

    switch (assistantType) {
      case AiAssistantType.BOOK_COVER_IMAGE:
        return <BookCoverContent responseData={responseData} generatedContent={generatedContent} />;
      case AiAssistantType.BOOK_IDEA:
        return <BookIdeaContent responseData={responseData} generatedContent={generatedContent} />;
      case AiAssistantType.WRITING_ASSISTANT:
        return <BookIdeaContent responseData={responseData} generatedContent={generatedContent} />;
      default:
        return null;
    }
  };

  // Update the title to type mapping
  const getAssistantType = (title: string | null): AiAssistantType => {
    switch (title) {
      case 'Generate Book Ideas':
        return AiAssistantType.BOOK_IDEA;
      case 'Book Cover Design':
        return AiAssistantType.BOOK_COVER_IMAGE;
      case 'Writing Assistant':
        return AiAssistantType.WRITING_ASSISTANT;
      default:
        return AiAssistantType.BOOK_IDEA;
    }
  };
  const handleClose=()=>{
    onClose();
    setCurrentStep(0);
    setResponseData(null);
    setGeneratedContent(null);
    setUserInput('');
    setResponses({});
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className=" max-w-4xl max-h-96 overflow-auto p-0 gap-0 bg-gradient-to-b from-white to-gray-50">
        <DialogHeader className="px-6 py-2 border-b bg-white/80 backdrop-blur-sm">
          <DialogTitle className="p-4 text-xl font-semibold text-gray-800">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
            {currentStep < questions.length ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.type === 'number' ? (
                  <input
                    type="number"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500/20"
                  />
                ) : currentQuestion.type === 'select' ? (
                  <select
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="">Select an option</option>
                    {currentQuestion.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-amber-500/20 min-h-[100px]"
                  />
                )}
              </div>
            ) : (
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-semibold mb-4">Ready to Generate Book Ideas!</h3>

                {title === 'Writing Assistant' && (
                <>
 {generatedContent ? (
                      renderGeneratedContent()
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full
                          flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 
                          transition-all duration-200 hover:scale-[1.02]"
                      >
                        Generate Ideas
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    </>
                )}
                {title === 'Book Cover Design' && (
                <>
 {generatedContent ? (
                      renderGeneratedContent()
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full
                          flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 
                          transition-all duration-200 hover:scale-[1.02]"
                      >
                        Generate Ideas
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    </>
                )}
                
                {title === 'Generate Book Ideas' && (
                  <>
                    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border">
                      <h4 className="text-lg font-medium mb-4 text-gray-700">
                        Your Preferences:
                      </h4>
                      <div className="text-left space-y-3">
                        <p><span className="font-semibold">Genre:</span> {responses.genre}</p>
                        <p><span className="font-semibold">Target Audience:</span> {responses.targetAudience}</p>
                        <p><span className="font-semibold">Theme/Topic:</span> {responses.themeOrTopic}</p>
                        <p><span className="font-semibold">Desired Elements:</span> {responses.specificElements}</p>
                        {responses.description && (
                          <p><span className="font-semibold">Additional Description:</span> {responses.description}</p>
                        )}
                      </div>
                    </div>

                    {generatedContent ? (
                      renderGeneratedContent()
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full
                          flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 
                          transition-all duration-200 hover:scale-[1.02]"
                      >
                        Generate Ideas
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {currentStep < questions.length && (
          <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Question {currentStep + 1} of {questions.length}
              </span>
              <Button
                onClick={handleNext}
                disabled={(!userInput && currentQuestion.required) || isLoading}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 py-2 
                  flex items-center gap-2 shadow-lg shadow-amber-500/20 
                  transition-all duration-200 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    Generating...
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    {currentStep === questions.length - 1 ? 'Finish' : 'Next'}
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog; 