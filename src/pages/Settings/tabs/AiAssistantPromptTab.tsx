import React, { useState, RefObject,useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { useFetchSettingsQuery, useUpdateSettingsMutation } from '@/api/settingsApi';
import { motion } from 'framer-motion';
import { Save, MessageSquare, BookOpen, Paintbrush, FileText, Presentation, Info, Eye, AlertCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define prompt types
type PromptType = 'bookIdea' | 'bookCover' | 'writingAssistant' | 'chapterSummary' | 'presentationSlides';
type PromptFormField = `${PromptType}MasterPrompt`;

const settingsSchema = yup.object({
  bookIdeaMasterPrompt: yup.string().nullable(),
  bookCoverMasterPrompt: yup.string().nullable(),
  writingAssistantMasterPrompt: yup.string().nullable(),
  chapterSummaryMasterPrompt: yup.string().nullable(),
  presentationSlidesMasterPrompt: yup.string().nullable(),
});

interface SettingsFormData {
  bookIdeaMasterPrompt?: string|null;
  bookCoverMasterPrompt?: string|null;
  writingAssistantMasterPrompt?: string|null;
  chapterSummaryMasterPrompt?: string|null;
  presentationSlidesMasterPrompt?: string|null;
}

interface Parameter {
  label: string;
  value: string;
}

// Record types for data structures
type PreviewData = Record<PromptType, Record<string, string>>;
type PromptExamples = Record<PromptType, string>;
type ParameterButtons = Record<PromptType, Parameter[]>;
type TextareaRefs = Record<PromptType, RefObject<HTMLTextAreaElement>>;

// Example data for parameter previews
const previewData: PreviewData = {
  bookIdea: {
    genre: "Science Fiction",
    themeOrTopic: "Space Exploration",
    targetAudience: "Young Adults",
    description: "A thrilling space adventure"
  },
  bookCover: {
    bookTitle: "The Cosmic Journey",
    authorName: "John Smith",
    subtitle: "A Tale of Space and Time",
    genre: "Science Fiction",
    targetAudience: "Young Adults",
    coreIdea: "Space exploration and discovery",
    systemPrompt: "Create a futuristic space scene"
  },
  writingAssistant: {
    genre: "Science Fiction",
    writingGoal: "Develop compelling characters",
    writingLevel: "Intermediate",
    targetAudience: "Young Adults",
    specificArea: "Character Development",
    currentChallenges: "Making unique alien species"
  },
  chapterSummary: {
    noOfWords: "300",
    chapterContent: "Sample chapter content here..."
  },
  presentationSlides: {
    numberOfSlides: "5",
    chapterContent: "Sample chapter content here..."
  }
};

const promptExamples: PromptExamples = {
  bookIdea: `Generate a compelling book concept for a ${'{genre}'} novel targeting ${'{targetAudience}'}.
Theme: ${'{themeOrTopic}'}
Description: ${'{description}'}

Please provide:
1. A captivating title
2. Core concept summary
3. Key plot points
4. Target audience appeal`,

  bookCover: `Design a cover for "${'{bookTitle}'}"${'{subtitle}' ? ` - ${'{subtitle}'}` : ''}${'{authorName}' ? ` by ${'{authorName}'}` : ''}${'{genre}' ? `, a ${'{genre}'} book` : ''}${'{targetAudience}' ? ` for ${'{targetAudience}'}` : ''}.
Core Concept: ${'{coreIdea}'}
Style Guidelines: ${'{systemPrompt}'}

The cover should:
1. Reflect the genre and theme
2. Appeal to the target audience
3. Be visually striking
4. Convey the book's essence
5. Include space for title${'{subtitle}' ? ', subtitle' : ''}${'{authorName}' ? ' and author name' : ''}`,

  writingAssistant: `As a writing coach for a ${'{genre}'} author:
- Writing Goal: ${'{writingGoal}'}
- Current Level: ${'{writingLevel}'}
- Target Readers: ${'{targetAudience}'}
- Focus Area: ${'{specificArea}'}
- Challenges: ${'{currentChallenges}'}

Provide specific advice and examples to improve their writing.`,

  chapterSummary: `Create a concise chapter summary:
- Number of words: \${noOfWords}
- Chapter content: \${chapterContent}

Instructions:
1. Write exactly \${noOfWords} words
2. Capture the essence of the chapter
3. Include key plot points and developments
4. Use engaging language`,

  presentationSlides: `Create presentation slides:
- Number of slides: \${numberOfSlides}
- Chapter content: \${chapterContent}

Instructions:
1. Create exactly \${numberOfSlides} slides
2. Each slide should have a clear title
3. Include key points and concepts
4. Keep content focused and concise`
};

const parameterButtons: ParameterButtons = {
  bookIdea: [
    { label: 'Genre', value: '${genre}' },
    { label: 'Theme/Topic', value: '${themeOrTopic}' },
    { label: 'Target Audience', value: '${targetAudience}' },
    { label: 'Description', value: '${description}' }
  ],
  bookCover: [
    { label: 'Book Title', value: '${bookTitle}' },
    { label: 'Author Name', value: '${authorName}' },
    { label: 'Subtitle', value: '${subtitle}' },
    { label: 'Genre', value: '${genre}' },
    { label: 'Target Audience', value: '${targetAudience}' },
    { label: 'Core Idea', value: '${coreIdea}' },
    { label: 'System Prompt', value: '${systemPrompt}' }
  ],
  writingAssistant: [
    { label: 'Genre', value: '${genre}' },
    { label: 'Writing Goal', value: '${writingGoal}' },
    { label: 'Writing Level', value: '${writingLevel}' },
    { label: 'Target Audience', value: '${targetAudience}' },
    { label: 'Specific Area', value: '${specificArea}' },
    { label: 'Current Challenges', value: '${currentChallenges}' }
  ],
  chapterSummary: [
    { label: 'Number of Words', value: '${noOfWords}' },
    { label: 'Chapter Content', value: '${chapterContent}' }
  ],
  presentationSlides: [
    { label: 'Number of Slides', value: '${numberOfSlides}' },
    { label: 'Chapter Content', value: '${chapterContent}' }
  ]
};

// Helper function to check if all parameters are used in prompt
const validatePromptParameters = (type: PromptType, prompt: string, parameters: Parameter[]): string[] => {
  const missingParams: string[] = [];
  parameters.forEach(param => {
    // Skip validation for optional parameters in bookCover type
    if (type === 'bookCover' && ['authorName', 'subtitle', 'genre'].includes(param.label)) {
      return;
    }
    if (!prompt.includes(param.value)) {
      missingParams.push(param.label);
    }
  });
  return missingParams;
};

export const AiAssistantPromptTab = () => {
  const { data: settingsInfo } = useFetchSettingsQuery();
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
  const { addToast } = useToast();
  const [showPreview, setShowPreview] = useState<PromptType | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<PromptType, string[]>>({
    bookIdea: [],
    bookCover: [],
    writingAssistant: [],
    chapterSummary: [],
    presentationSlides: []
  });

  const textareaRefs: TextareaRefs = {
    bookIdea: React.createRef<HTMLTextAreaElement>(),
    bookCover: React.createRef<HTMLTextAreaElement>(),
    writingAssistant: React.createRef<HTMLTextAreaElement>(),
    chapterSummary: React.createRef<HTMLTextAreaElement>(),
    presentationSlides: React.createRef<HTMLTextAreaElement>()
  };

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<SettingsFormData>({
    resolver: yupResolver(settingsSchema),
    defaultValues: {
      bookIdeaMasterPrompt: '',
      bookCoverMasterPrompt: '',
      writingAssistantMasterPrompt: '',
      chapterSummaryMasterPrompt: '',
      presentationSlidesMasterPrompt: '',
    }
  });

  const formValues = watch();

  // Restore the useEffect for form reset
  useEffect(() => {
    if (settingsInfo) {
      reset({
        bookIdeaMasterPrompt: settingsInfo.bookIdeaMasterPrompt || '',
        bookCoverMasterPrompt: settingsInfo.bookCoverMasterPrompt || '',
        writingAssistantMasterPrompt: settingsInfo.writingAssistantMasterPrompt || '',
        chapterSummaryMasterPrompt: settingsInfo.chapterSummaryMasterPrompt || '',
        presentationSlidesMasterPrompt: settingsInfo.presentationSlidesMasterPrompt || '',
      });
    }
  }, [settingsInfo, reset]);

  // Validation useEffect - Update this section
  React.useEffect(() => {
    const validatePrompts = () => {
      const newValidationErrors: Record<PromptType, string[]> = {
        bookIdea: [],
        bookCover: [],
        writingAssistant: [],
        chapterSummary: [],
        presentationSlides: []
      };

      (Object.keys(parameterButtons) as PromptType[]).forEach(type => {
        const formField = `${type}MasterPrompt` as PromptFormField;
        const promptText = formValues[formField] || '';
        if (promptText.trim()) { // Only validate if there's content
          const missingParams = validatePromptParameters(type, promptText, parameterButtons[type]);
          newValidationErrors[type] = missingParams;
        }
      });

      // Only update state if validation results have changed
      const hasChanges = Object.entries(newValidationErrors).some(
        ([type, errors]) => 
          JSON.stringify(errors) !== JSON.stringify(validationErrors[type as PromptType])
      );

      if (hasChanges) {
        setValidationErrors(newValidationErrors);
      }
    };

    validatePrompts();
  }, [formValues, parameterButtons]); // Add proper dependencies

  const handleSettingsSave = async (data: SettingsFormData) => {
    try {
      // Check if there are any validation errors in non-empty prompts
      const hasErrors = Object.entries(data).some(([key, value]) => {
        const type = key.replace('MasterPrompt', '') as PromptType;
        return value && validationErrors[type].length > 0;
      });

      if (hasErrors) {
        addToast('Please include all required parameters in the prompts before saving.', ToastType.ERROR);
        return;
      }

      const payload = {
        ...data,
        id: settingsInfo?.id,
      };

      await updateSettings(payload).unwrap();
      addToast('Settings updated successfully!', ToastType.SUCCESS);
    } catch (error: any) {
      console.error('Settings update error:', error);
      addToast(`Failed to update settings: ${error?.data?.message || error.message || 'Unknown error'}`, ToastType.ERROR);
    }
  };

  const insertParameter = (fieldName: PromptType, parameter: string) => {
    const formField = `${fieldName}MasterPrompt` as PromptFormField;
    const currentValue = formValues[formField] || '';
    const textarea = document.querySelector(`textarea[name="${formField}"]`) as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = currentValue.slice(0, start) + parameter + currentValue.slice(end);
      
      setValue(formField, newValue, { shouldDirty: true });
      
      // Set cursor position after the inserted parameter
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + parameter.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      // If textarea not found, just append to the end
      setValue(formField, currentValue + parameter, { shouldDirty: true });
    }
  };

  const getPreviewText = (type: PromptType, prompt: string) => {
    if (!prompt) return '';
    
    let previewText = prompt;
    const data = previewData[type];
    
    // Replace all variables in the prompt with their preview values
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      previewText = previewText.replace(regex, value.toString());
    });
    
    return previewText;
  };

  // Component to render parameter buttons
  const ParameterButtons = ({ type }: { type: PromptType }) => (
    <div className="flex flex-wrap gap-2 mb-4">
      {parameterButtons[type].map((param: Parameter, index: number) => (
        <Button
          key={index}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertParameter(type, param.value)}
          className="text-xs bg-amber-50 hover:bg-amber-100 border-amber-200"
        >
          {param.label}
        </Button>
      ))}
    </div>
  );

  // Function to render a prompt section
  const renderPromptSection = (type: PromptType, title: string, icon: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <Label className="text-lg font-semibold">{title}</Label>
      </div>

      {/* Show validation error if any parameters are missing */}
      {validationErrors[type].length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Missing required parameters: {validationErrors[type].join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="parameters">
          <AccordionTrigger className="text-sm font-medium text-amber-600">
            <Info className="w-4 h-4 mr-2" />
            Available Parameters & Example
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-amber-50 rounded-lg space-y-4">
              <div>
                <h4 className="font-medium mb-2">Available Parameters:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {parameterButtons[type].map((param: Parameter, index: number) => (
                    <li key={index}>
                      <code className="bg-white px-1 py-0.5 rounded">{param.value}</code> - {param.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Example Prompt:</h4>
                <pre className="bg-white p-3 rounded-lg text-sm whitespace-pre-wrap">{promptExamples[type]}</pre>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm text-amber-600 font-medium">Required Parameters (Click to Insert)</Label>
          <ParameterButtons type={type} />
        </div>
        
        <Textarea
          {...register(`${type}MasterPrompt` as PromptFormField)}
          className={`min-h-[200px] font-mono text-sm ${
            validationErrors[type].length > 0 ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
          placeholder={`Enter master prompt for ${title.toLowerCase()}...`}
          name={`${type}MasterPrompt`}
        />
        
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(showPreview === type ? null : type)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview === type ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>

        {showPreview === type && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Preview with sample data:</h4>
            <pre className="whitespace-pre-wrap text-sm">
              {getPreviewText(type, formValues[`${type}MasterPrompt` as PromptFormField] || '')}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-4"
          >
            <MessageSquare className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">AI Assistant Master Prompts</h2>
          </motion.div>
          <p className="text-gray-600 ml-11">
            Configure master prompts for different AI assistant features. These prompts will be used as templates for generating responses.
            <br />
            <span className="text-amber-600 font-medium">Note: All parameters must be included in the prompts before saving.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(handleSettingsSave)} className="space-y-8">
          {renderPromptSection('bookIdea', 'Book Idea Generation Prompt', <BookOpen className="w-5 h-5 text-amber-500" />)}
          {renderPromptSection('bookCover', 'Book Cover Design Prompt', <Paintbrush className="w-5 h-5 text-amber-500" />)}
          {renderPromptSection('writingAssistant', 'Writing Assistant Prompt', <MessageSquare className="w-5 h-5 text-amber-500" />)}
          {renderPromptSection('chapterSummary', 'Chapter Summary Prompt', <FileText className="w-5 h-5 text-amber-500" />)}
          {renderPromptSection('presentationSlides', 'Presentation Slides Prompt', <Presentation className="w-5 h-5 text-amber-500" />)}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end"
          >
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 shadow-md hover:shadow-lg transition-all duration-200"
                             
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}; 