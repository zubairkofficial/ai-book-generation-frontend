import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send, ArrowRightIcon, BookIcon, CheckCircleIcon, ClipboardIcon, SparklesIcon } from 'lucide-react';

// Enums from CreateBook.tsx
enum BookGenre {
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

enum BookLanguage {
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

enum TargetAudience {
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
    id: 'projectType',
    question: "What type of writing assistance do you need?",
    placeholder: "e.g., Story Development, Character Creation, Scene Writing",
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
    id: 'language',
    question: "What language are you writing in?",
    placeholder: "Select language",
    type: 'select',
    options: Object.values(BookLanguage),
    required: true
  },
  {
    id: 'writingStyle',
    question: "What's your preferred writing style?",
    placeholder: "e.g., Descriptive, Concise, Conversational",
    required: true
  },
  {
    id: 'specificChallenges',
    question: "What specific challenges would you like help with?",
    placeholder: "e.g., Dialog writing, Plot development, Character arcs",
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

interface ChatDialogProps {
  isOpen: boolean;
  title: string | null;
  onClose: () => void;
}

const ChatDialog = ({ isOpen, title, onClose }: ChatDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
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

  const handleNext = () => {
    if (!userInput && currentQuestion.required) {
      return; // Don't proceed if required field is empty
    }

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: userInput
    }));
    setUserInput('');
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      let endpoint;
      switch (title) {
        case 'Book Cover Design':
          endpoint = '/api/generate-cover';
          break;
        case 'Writing Assistant':
          endpoint = '/api/writing-assistant';
          break;
        case 'Generate Book':
          endpoint = '/api/generate-book';
          break;
        case 'Generate Book Ideas':
          endpoint = '/api/generate-book-ideas';
          break;
        default:
          throw new Error('Invalid tool selected');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses),
      });

      if (!response.ok) {
        throw new Error('Failed to generate book idea');
      }

      const data = await response.json();
      // Handle the response data here
      console.log('Generated book ideas:', data);
      
      // You might want to show the results in a new dialog or update the UI
      // This depends on how you want to display the generated ideas
    } catch (error) {
      console.error('Error:', error);
      // Handle error (show error message to user)
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 bg-gradient-to-b from-white to-gray-50">
        <DialogHeader className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
          <DialogTitle className="text-xl font-semibold text-gray-800">
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
                
                {title === 'Generate Book Ideas' && (
                  <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border">
                    <h4 className="text-lg font-medium mb-4 text-gray-700">Your Preferences:</h4>
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
                )}
                
                <Button
                  onClick={handleSubmit}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full
                    flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 
                    transition-all duration-200 hover:scale-[1.02]"
                >
                  Generate Ideas
                  <Send className="w-4 h-4" />
                </Button>
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
                disabled={!userInput && currentQuestion.required}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 py-2 
                  flex items-center gap-2 shadow-lg shadow-amber-500/20 
                  transition-all duration-200 hover:scale-[1.02]"
              >
                {currentStep === questions.length - 1 ? 'Finish' : 'Next'}
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog; 