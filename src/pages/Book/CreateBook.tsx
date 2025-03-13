import React, {useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import { useToast } from '@/context/ToastContext'; // Import custom toast hook
import { ToastType } from '@/constant';

import { useGenerateBookMutation } from "@/api/authApi";
import DOMPurify from "dompurify"; // For sanitizing HTML
import * as yup from "yup"; // Import Yup
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useCreateChapterMutation, useFetchBooksQuery } from "@/api/bookApi";
import ChapterConfiguration from './ChapterConfiguration';
import { ArrowLeft, ArrowRight, Loader2, Wand2 } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import TableOfContents from './components/TableOfContents';
import { useLocation } from "react-router-dom";

// Add this enum for genres
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
  HINDI = "Hindi"
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
  numberOfChapters: yup.number()
    .required("Number of chapters is required")
    .min(1, "Must have at least 1 chapter")
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
  const location=useLocation()
  console.log("location",location.state)
 
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
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "numberOfChapters"
          ? value === ""
            ? ""
            : parseInt(value, 10)
          : value,
    }));

    // Clear the error for the specific field being updated
    setErrors((prevErrors) => {
      const { [name]: removedError, ...restErrors } = prevErrors;
      return restErrors;
    });
  };

  const handleAdvancedOptionsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAdvancedOptions((prev: any) => {
      const newOptions = { ...prev };
      const keys = name.split(".");

      if (keys.length === 1) {
        // Handle top-level properties
        return { ...prev, [name]: value };
      }

      // Handle nested properties
      let current: any = newOptions;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      return newOptions;
    });
  };

  const formatLabel = (key: string) => {
    if (key === 'bookInformation') return 'Core Idea';
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };
  

  const validateStep = async (step: number): Promise<boolean> => {
    const currentStepData = steps[step as keyof typeof steps];
    const fieldsToValidate = currentStepData.fields.reduce((acc: any, field: any) => {
      if (Array.isArray(field)) {
        field.forEach(f => {
          acc[f] = formData[f as keyof typeof formData] || "";
        });
      } else if (field !== "advancedOptions") {
        acc[field] = formData[field as keyof typeof formData] || "";
      }
      return acc;
    }, {});

    try {
      const stepSchema = yup.object().shape(
        currentStepData.fields.reduce((acc: any, field: any) => {
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
      addToast("Please fill in all required fields correctly",ToastType.ERROR);
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

  const handleGenerateBook = async () => {
    try {
      // Validate the current form data
      const isValid = await Promise.all(
        Object.keys(steps).map((step) => validateStep(parseInt(step)))
      ).then((results) => results.every(Boolean));

      if (!isValid) {
        addToast("Please check all fields and try again", ToastType.ERROR);
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
  };

  const handleCloseTableOfContents = () => {
    setShowTableOfContents(false);
  };

  const handleProceedToChapterConfig = () => {
    setShowTableOfContents(false);
    setShowChapterConfig(true);
  };

  // Sanitize HTML content to prevent XSS attacks
  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "u", "br", "div", "span", "ul", "ol", "li", "img"],
      ALLOWED_ATTR: ["style", "class", "id", "src", "alt", "href"],
      ADD_TAGS: ["style"],
      ADD_ATTR: ["target"],
    });
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

  const renderAdvancedOptions = () => (
    <div className="space-y-8">
      {/* Cover Image Prompt */}
      <div className="space-y-2">
        <Label htmlFor="coverImagePrompt">Cover Image Prompt</Label>
        <Input
          id="coverImagePrompt"
          name="coverImagePrompt"
          value={advancedOptions.coverImagePrompt}
          onChange={handleAdvancedOptionsChange}
          placeholder="Describe your ideal book cover"
        />
        <p className="text-sm text-gray-500">
          Describe how you want your book cover to look
        </p>
      </div>

      {/* Color Scheme */}
      <div className="space-y-2">
        <Label htmlFor="colorScheme">Color Scheme</Label>
        <div className="flex gap-3">
          <Input
            type="color"
            id="colorScheme"
            name="colorScheme"
            value={advancedOptions.colorScheme}
            onChange={handleAdvancedOptionsChange}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={advancedOptions.colorScheme}
            onChange={handleAdvancedOptionsChange}
            name="colorScheme"
            placeholder="#000000"
            className="flex-1"
          />
        </div>
        <p className="text-sm text-gray-500">
          Choose a primary color for your book's theme
        </p>
      </div>

      {/* Font Style */}
      <div className="space-y-2">
        <Label htmlFor="fontStyle">Font Style</Label>
        <select
          id="fontStyle"
          name="fontStyle"
          value={advancedOptions.fontStyle}
          onChange={handleAdvancedOptionsChange}
          className="w-full rounded-md border bg-gray-50 border-gray-300 p-2"
        >
          <option value="">Select a font style</option>
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans Serif</option>
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
          <option value="playful">Playful</option>
        </select>
        <p className="text-sm text-gray-500">
          Choose the main font style for your book
        </p>
      </div>

      {/* Advanced Styling Options */}
      <div className="space-y-6">
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium mb-4">Advanced Styling Options</h4>

          {/* Typography Settings */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h5 className="font-medium text-base">Typography Settings</h5>

              {/* Font Sizes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "title", label: "Title Size", default: "32px" },
                  { key: "chapterTitle", label: "Chapter Title", default: "24px" },
                  { key: "headers", label: "Headers", default: "20px" },
                  { key: "body", label: "Body Text", default: "16px" },
                ].map(({ key, label, default: defaultSize }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`fontSize-${key}`} className="text-sm">
                      {label}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`fontSize-${key}`}
                        name={`styling.fontSize.${key}`}
                        value={advancedOptions.styling?.fontSize?.[key] || ""}
                        onChange={handleAdvancedOptionsChange}
                        placeholder={defaultSize}
                        className="flex-1"
                      />
                      <Select
                        value={advancedOptions.styling?.fontSize?.[key]?.includes("rem") ? "rem" : "px"}
                        onValueChange={(unit) => {
                          const value = advancedOptions.styling?.fontSize?.[key]?.replace(/[^0-9.]/g, "") || "";
                          handleAdvancedOptionsChange({
                            target: {
                              name: `styling.fontSize.${key}`,
                              value: `${value}${unit}`,
                            },
                          } as any);
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="px">px</SelectItem>
                          <SelectItem value="rem">rem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Line Heights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "title", label: "Title Line Height", default: "1.2" },
                  { key: "chapterTitle", label: "Chapter Line Height", default: "1.3" },
                  { key: "headers", label: "Headers Line Height", default: "1.4" },
                  { key: "body", label: "Body Line Height", default: "1.6" },
                ].map(({ key, label, default: defaultHeight }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`lineHeight-${key}`} className="text-sm">
                      {label}
                    </Label>
                    <Input
                      id={`lineHeight-${key}`}
                      name={`styling.lineHeight.${key}`}
                      value={advancedOptions.styling?.lineHeight?.[key] || ""}
                      onChange={handleAdvancedOptionsChange}
                      placeholder={defaultHeight}
                      type="number"
                      step="0.1"
                      min="1"
                      max="3"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Spacing Settings */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h5 className="font-medium text-base">Spacing & Margins</h5>

              {/* Margins */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["top", "right", "bottom", "left"].map((side) => (
                  <div key={side} className="space-y-2">
                    <Label htmlFor={`margin-${side}`} className="text-sm capitalize">
                      {side} Margin
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`margin-${side}`}
                        name={`styling.margins.${side}`}
                        value={advancedOptions.styling?.margins?.[side] || ""}
                        onChange={handleAdvancedOptionsChange}
                        placeholder="2cm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Spacing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "paragraphSpacing", label: "Paragraph Spacing", default: "1.5rem" },
                  { key: "chapterSpacing", label: "Chapter Spacing", default: "3rem" },
                  { key: "sectionSpacing", label: "Section Spacing", default: "2rem" },
                ].map(({ key, label, default: defaultSpacing }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`spacing-${key}`} className="text-sm">
                      {label}
                    </Label>
                    <Input
                      id={`spacing-${key}`}
                      name={`styling.spacing.${key}`}
                      value={advancedOptions.styling?.spacing?.[key] || ""}
                      onChange={handleAdvancedOptionsChange}
                      placeholder={defaultSpacing}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h5 className="font-medium text-base">Text Alignment</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "title", label: "Title Alignment" },
                  { key: "chapterTitle", label: "Chapter Title Alignment" },
                  { key: "headers", label: "Headers Alignment" },
                  { key: "body", label: "Body Text Alignment" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`alignment-${key}`} className="text-sm">
                      {label}
                    </Label>
                    <Select
                      value={advancedOptions.styling?.textAlignment?.[key] || ""}
                      onValueChange={(value) =>
                        handleAdvancedOptionsChange({
                          target: { name: `styling.textAlignment.${key}`, value },
                        } as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="justify">Justify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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
              disabled={isLoading}
              className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
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
          previousContent={location?.state?.previousContent??previousContent}
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