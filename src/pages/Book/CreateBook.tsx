import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import { useToast } from '@/context/ToastContext'; // Import custom toast hook
import { ToastType } from '@/constant';

import { useGenerateBookMutation } from "@/api/authApi";
import * as yup from "yup"; // Import Yup
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import ChapterConfiguration from './ChapterConfiguration';
import { ArrowLeft, ArrowRight, Loader2, Wand2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import TableOfContents from './components/TableOfContents';
import { useLocation } from "react-router-dom";

// Add this enum for genres
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

// Add Language enum
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
  HINDI = "Hindi",
  Urdu = "Urdu"
}

// Add this enum for target audience
enum TargetAudience {
  ALL_AGES = "All Ages",
  CHILDREN = "Children (Ages 5-12)",
  TEENAGERS = "Teenagers (Ages 13-17)",
  YOUNG_ADULTS = "Young Adults (Ages 18-25)",
  ADULTS = "Adults (Ages 26-64)",

}

// Update the validation schema
const bookSchema: any = yup.object().shape({
  bookTitle: yup.string().required("Book title is required"),
  authorName: yup.string().required("Author name is required"),
  authorBio: yup.string().nullable().transform((value) => value || ""),
  bookInformation: yup.string().required("Core idea is required"),
  genre: yup.string().required("Genre is required").oneOf(Object.values(BookGenre)),
  characters: yup.string().transform((value) => value || "").optional(),
  targetAudience: yup.string().required("Target audience is required").oneOf(Object.values(TargetAudience)),
  language: yup.string().required("Language is required").oneOf(Object.values(BookLanguage)),
  numberOfChapters: yup
    .number()
    .typeError("Number of chapters is required")
    .required("Number of chapters is required")
    .integer("Must be a whole number")
    .min(1, "Must be at least 1")
    .max(50, "Maximum 50 chapters allowed"),
});

// Add type for API error response
interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: {
    message: string;
    errors?: Array<{
      property: string;
      constraints: {
        [key: string]: string;
      };
    }>;
  };
}

const CreateBook = () => {
  const [generateBook, { isLoading }] = useGenerateBookMutation();
  const location = useLocation()
  console.log("location", location.state)

  const [formData, setFormData] = useState({
    bookTitle: "",
    authorName: "",
    authorBio: "",
    bookInformation: "",
    genre: "",
    characters: "",
    targetAudience: "",
    language: "",
    numberOfChapters: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState<any>({
    coverImagePrompt: "",
    colorScheme: "#F59E0B", // Default warm color
    fontStyle: "",
    styling: {
      fontSize: {
        title: "",
        chapterTitle: "",
        headers: "",
        body: "",
      },
      lineHeight: {
        title: "",
        chapterTitle: "",
        headers: "",
        body: "",
      },
      fontFamily: {
        title: "",
        chapterTitle: "",
        headers: "",
        body: "",
      },
      textAlignment: {
        title: "",
        chapterTitle: "",
        headers: "",
        body: "",
      },
      margins: {
        top: "",
        bottom: "",
        left: "",
        right: "",
      },
      spacing: {
        paragraphSpacing: "",
        chapterSpacing: "",
        sectionSpacing: "",
      },
      pageLayout: {
        pageSize: "",
        orientation: "",
        columns: 1,
      },
    },
  });
  const [currentStep, setCurrentStep] = useState(1);
  const { addToast } = useToast(); // Use custom toast hook


  const steps = {
    1: {
      title: "Basic Information",
      fields: ["bookTitle", "authorName", "authorBio"],
      description: "Enter the basic author and core idea",
    },
    2: {
      title: "Book Details",
      fields: ["bookInformation", ["genre", "language"], "characters", "targetAudience", "numberOfChapters"],
      description: "Enter the detailed information about your book",
    }
  };


  const fieldDescriptions: Record<string, string> = {
    // Basic Information
    bookTitle: "The main title of your book",
    authorName: "The name of the author",
    authorBio: "A short biography of the author (optional)",

    // Book Details
    bookInformation: "The core idea or concept of book or thoughts",
    genre: "Choose the category that best fits your book",
    characters: "Main characters that will appear in your story (optional)",
    targetAudience: "Who is this book primarily written for?",
    language: "Choose the primary language for your book",
    numberOfChapters: "How many chapters would you like in your book? (1-50)",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for number fields
    if (name === "numberOfChapters") {
      // Always keep as string in state to match type definition
      setFormData((prevData) => ({
        ...prevData,
        [name]: value, // Keep as string in the state
      }));

      // For validation, convert to number to check range
      if (value === "") {
        // Handle empty value
        setErrors(prev => ({
          ...prev,
          [name]: "Number of chapters is required"
        }));
      } else {
        const numValue = parseInt(value, 10);

        // Clear error if value is valid
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 50) {
          setErrors((prevErrors) => {
            const { [name]: removedError, ...restErrors } = prevErrors;
            return restErrors;
          });
        } else {
          // Set error immediately for invalid number
          setErrors(prev => ({
            ...prev,
            [name]: isNaN(numValue)
              ? "Must be a valid number"
              : numValue < 1
                ? "Must be at least 1"
                : "Maximum 50 chapters allowed"
          }));
        }
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      // Clear the error for the specific field being updated
      setErrors((prevErrors) => {
        const { [name]: removedError, ...restErrors } = prevErrors;
        return restErrors;
      });
    }
  };



  const formatLabel = (key: string) => {
    if (key === 'bookInformation') return 'Core Idea';
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };


  const validateStep = async (step: number): Promise<boolean> => {
    const currentStepData = steps[step as keyof typeof steps];
    const fieldsToValidate = (currentStepData.fields as any[]).reduce((acc: any, field: any) => {
      if (Array.isArray(field)) {
        field.forEach(f => {
          acc[f] = formData[f as keyof typeof formData];
        });
      } else if (field !== "advancedOptions") {
        acc[field] = formData[field as keyof typeof formData];
      }
      return acc;
    }, {});

    try {
      const stepSchema = yup.object().shape(
        (currentStepData.fields as any[]).reduce((acc: any, field: any) => {
          if (Array.isArray(field)) {
            field.forEach(f => {
              acc[f] = bookSchema.fields[f];
            });
          } else if (field !== "advancedOptions") {
            acc[field] = bookSchema.fields[field];
          }
          return acc;
        }, {})
      );

      await stepSchema.validate(fieldsToValidate, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    } else {
      addToast("Please fill in all required fields correctly", ToastType.ERROR);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<string>("");
  const [showChapterConfig, setShowChapterConfig] = useState(false);
  const [previousContent, setPreviousContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateBook = async () => {
    if (isGenerating || isLoading) return; // Prevent double submission

    setIsGenerating(true);
    try {
      // Validate the current form data
      const isValid = await Promise.all(
        Object.keys(steps).map((step) => validateStep(parseInt(step)))
      ).then((results) => results.every(Boolean));
      console.log("isValid", isValid, Object.keys(steps))
      if (!isValid) {
        addToast("Please check all fields and try again", ToastType.ERROR);
        setIsGenerating(false);
        return;
      }

      const payload: any = {
        ...formData,
        characters: formData.characters || "",
        advancedOptions: showAdvancedOptions ? advancedOptions : undefined,
      };

      const response: any = await generateBook(payload).unwrap();
      if (response) {
        if (response?.data?.additionalData?.tableOfContents) {
          setTableOfContents(response.data.additionalData.tableOfContents);
          setShowTableOfContents(true);
        }
        setPreviousContent(JSON.stringify(response?.data, null, 2));
      }
    } catch (error: any) {
      console.error("Error:", error);
      setIsGenerating(false); // Only reset on error. Success leads to new UI state.

      // Handle API error response
      if (error.data) {
        const apiError = error.data as ApiErrorResponse;

        // Handle validation errors
        if (apiError.message.errors) {
          const newErrors: { [key: string]: string } = {};

          apiError.message.errors.forEach((err) => {
            const errorMessage = Object.values(err.constraints)[0];
            newErrors[err.property] = errorMessage;
          });

          setErrors(newErrors);
          addToast("Please fix the validation errors", ToastType.ERROR);
        } else {
          // Handle general error message
          addToast(apiError.message.message || "An error occurred", ToastType.ERROR);
        }
      } else {
        addToast("An unexpected error occurred", ToastType.ERROR);
      }
    }
    // Note: We don't indiscriminately set isGenerating(false) here because if successful, 
    // we want the button to remain disabled while possibly transitioning UI. 
    // But since we show a modal or change state, it matters less.
    // For safety against stuck state if component doesn't unmount:
    // setIsGenerating(false); 
    // Actually, let's keep it safe.
  };

  // Helper to ensure state reset if needed
  React.useEffect(() => {
    if (!isLoading && isGenerating) {
      // If query finished but we are still generating, it means we handled success/error.
      // But we handle explicit sets above. 
      // Let's just reset isGenerating when isLoading becomes false to be safe (sync attempt)
      setIsGenerating(false);
    }
  }, [isLoading]);

  const handleCloseTableOfContents = () => {
    setShowTableOfContents(false);
    setIsGenerating(false);
  };

  const handleProceedToChapterConfig = () => {
    setShowTableOfContents(false);
    setShowChapterConfig(true);
  };




  const renderField = (key: string) => {
    const baseFieldClasses = "space-y-2 w-full";
    const labelClasses = "text-base font-medium text-gray-700 flex items-center";
    const inputClasses = cn(
      "w-full rounded-lg border shadow-sm transition-all duration-200",
      "focus:border-amber-500 focus:ring-amber-500 focus:ring-opacity-50",
      "placeholder:text-gray-400",
      errors[key] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300"
    );
    const helperTextClasses = "text-sm text-gray-500 mt-1 italic";
    const errorClasses = "text-sm text-red-500 mt-1 flex items-center gap-1";
    const requiredAsterisk = <span className="text-red-500 ml-1">*</span>;

    // Function to check if field is required
    const isRequired = (fieldName: string) => {
      const optionalFields = ['authorBio', 'characters'];
      return !optionalFields.includes(fieldName);
    };

    // Handle genre, language, and target audience dropdowns with consistent styling
    if (key === 'genre' || key === 'language' || key === 'targetAudience') {
      const options = key === 'genre'
        ? BookGenre
        : key === 'language'
          ? BookLanguage
          : TargetAudience;
      const placeholder = `Select a ${formatLabel(key)}`;

      return (
        <div key={key} className={`${baseFieldClasses} group`}>
          <Label htmlFor={key} className={labelClasses}>
            {formatLabel(key)}
            {isRequired(key) && requiredAsterisk}
          </Label>
          <Select
            value={formData[key]}
            onValueChange={(value) =>
              handleChange({ target: { name: key, value } } as any)
            }
          >
            <SelectTrigger className={`${inputClasses} group-hover:border-amber-300`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm border border-amber-100">
              {Object.values(options).map((option) => (
                <SelectItem key={option} value={option} className="hover:bg-amber-50">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className={helperTextClasses}>{fieldDescriptions[key]}</p>
          {errors[key] && (
            <p className={errorClasses}>
              <AlertCircle className="w-3 h-3" />
              {errors[key]}
            </p>
          )}
        </div>
      );
    }

    // Handle textarea fields
    if (key === 'bookInformation' || key === 'authorBio' || key === 'characters') {
      return (
        <div key={key} className={`${baseFieldClasses} group`}>
          <Label htmlFor={key} className={labelClasses}>
            {formatLabel(key)}
            {isRequired(key) && requiredAsterisk}
            {!isRequired(key) && <span className="text-gray-500 text-sm ml-2 font-normal">(Optional)</span>}
          </Label>
          <textarea
            id={key}
            name={key}
            placeholder={`Enter ${formatLabel(key)}`}
            value={formData[key]}
            onChange={handleChange}
            className={`${inputClasses} min-h-[120px] resize-y p-3 group-hover:border-amber-300 font-normal`}
          />
          <p className={helperTextClasses}>{fieldDescriptions[key]}</p>
          {errors[key] && (
            <p className={errorClasses}>
              <AlertCircle className="w-3 h-3" />
              {errors[key]}
            </p>
          )}
        </div>
      );
    }

    // Handle number input for chapters
    if (key === 'numberOfChapters') {
      return (
        <div key={key} className={`${baseFieldClasses} group`}>
          <Label htmlFor={key} className={labelClasses}>
            Number of Chapters
            {isRequired(key) && requiredAsterisk}
          </Label>
          <Input
            id={key}
            name={key}
            type="number"
            min={1}
            max={50}
            placeholder="Enter number of chapters"
            value={(formData as any)[key]}
            onChange={handleChange}
            className={`${inputClasses} group-hover:border-amber-300`}
          />
          <p className={helperTextClasses}>{fieldDescriptions[key]}</p>
          {errors[key] && (
            <p className={errorClasses}>
              <AlertCircle className="w-3 h-3" />
              {errors[key]}
            </p>
          )}
        </div>
      );
    }

    // Default input field
    return (
      <div key={key} className={`${baseFieldClasses} group`}>
        <Label htmlFor={key} className={labelClasses}>
          {formatLabel(key)}
          {isRequired(key) && requiredAsterisk}
        </Label>
        <Input
          id={key}
          name={key}
          type="text"
          placeholder={`Enter ${formatLabel(key)}`}
          value={(formData as any)[key]}
          onChange={handleChange}
          className={`${inputClasses} group-hover:border-amber-300`}
        />
        <p className={helperTextClasses}>{fieldDescriptions[key]}</p>
        {errors[key] && (
          <p className={errorClasses}>
            <AlertCircle className="w-3 h-3" />
            {errors[key]}
          </p>
        )}
      </div>
    );
  };

  const renderAdvancedOptionsToggle = () => (
    <div className="border-t pt-4 mt-6">
      <button
        type="button"
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        className="flex items-center justify-between w-full text-left px-4 py-2 rounded-lg hover:bg-amber-50/50 transition-colors"
      >
        <div>
          <h4 className="text-lg font-medium text-amber-700">Advanced Styling Options</h4>
          <p className="text-sm text-gray-500">
            Customize fonts, colors, spacing, and more
          </p>
        </div>
        {showAdvancedOptions ? (
          <ChevronUp className="h-5 w-5 text-amber-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-amber-500" />
        )}
      </button>
    </div>
  );



  const renderApiErrors = () => {
    if (Object.keys(errors).length === 0) return null;

    return (
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn shadow-sm">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-800">
              Please fix the following errors:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-red-600 text-sm">
                  {formatLabel(field)}: {error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = (step: number) => {
    const currentStepData = steps[step as keyof typeof steps];

    return (
      <div className="space-y-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-1 rounded-full bg-amber-100 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
              {step === 1 ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {currentStepData.title}
          </h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            {currentStepData.description}
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
        </div>

        {renderApiErrors()}

        <div className="grid gap-8">
          {currentStepData.fields.map((field, index) => {
            if (Array.isArray(field)) {
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {field.map(subField => renderField(subField))}
                </div>
              );
            }
            return renderField(field);
          })}
        </div>

        <div className="flex justify-between items-center mt-12 pt-6 border-t">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="px-6 hover:bg-gray-50 border-amber-200 text-amber-800 group transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              Previous
            </Button>
          )}
          <div className="flex-1" />
          {step < Object.keys(steps).length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2 group-hover:transform group-hover:translate-x-1 transition-transform" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleGenerateBook}
              disabled={isGenerating || isLoading}
              className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isGenerating || isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </div>
              ) : (
                <>
                  Generate Book
                  <Wand2 className="w-4 h-4 ml-2 group-hover:transform group-hover:rotate-12 transition-transform" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderProgress = () => (
    <div className="mb-10">
      <div className="flex justify-around mb-4">
        {Object.entries(steps).map(([step, { title }]) => {
          const stepNum = parseInt(step);
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div
              key={step}
              className={cn(
                "flex flex-col items-center",
                isActive ? "text-amber-600" : isCompleted ? "text-amber-500" : "text-gray-400"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                  isActive
                    ? "bg-amber-100 border-2 border-amber-500 shadow-md"
                    : isCompleted
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100"
                )}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-lg font-semibold">{step}</span>
                )}
              </div>
              <span className={cn(
                "text-sm md:text-base transition-all duration-300",
                isActive && "font-medium"
              )}>
                {title}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative mt-4">
        <div className="absolute top-1/2 w-full h-1 bg-gray-200 rounded-full" />
        <div
          className="absolute top-1/2 h-1 bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (Object.keys(steps).length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );

  if (showChapterConfig) {
    return (
      <Layout>
        <ChapterConfiguration
          previousContent={location?.state?.previousContent ?? previousContent}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50">
        <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <div className="inline-block p-2 bg-gradient-to-r from-amber-100 to-amber-200 rounded-2xl mb-4 animate-pulse">
              <Wand2 className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl tracking-tight">
              Create Your <span className="text-amber-600">Book</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Follow the steps below to create your personalized book. Fill in the details carefully to generate the best possible content.
            </p>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-6 rounded-full" />
          </div>

          {/* Main Content Card */}
          <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border-0">
            <div className="p-6 sm:p-8 lg:p-10">
              {/* Progress Bar */}
              <div className="max-w-3xl mx-auto">
                {renderProgress()}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                {renderStepContent(currentStep)}
              </form>
            </div>
          </Card>

          {/* Subtle decoration elements */}
          <div className="absolute top-40 left-10 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-80 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Add Table of Contents Modal */}
      {showTableOfContents && (
        <TableOfContents
          tableOfContents={tableOfContents}
          onClose={handleCloseTableOfContents}
          onProceed={handleProceedToChapterConfig}
        />
      )}
    </Layout>
  );
};

export default CreateBook;