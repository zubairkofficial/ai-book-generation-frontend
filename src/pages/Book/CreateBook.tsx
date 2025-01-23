import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { useGenerateBookMutation } from "@/api/authApi";
import DOMPurify from "dompurify"; // For sanitizing HTML
import * as yup from "yup"; // Import Yup
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from 'lucide-react';

// Define the Yup validation schema
const bookSchema = yup.object().shape({
  bookTitle: yup.string().required("Book title is required"),
  genre: yup.string().required("Genre is required"),
  theme: yup.string().required("Theme is required"),
  characters: yup.string().required("Characters are required"),
  setting: yup.string().required("Setting is required"),
  tone: yup.string().required("Tone is required"),
  plotTwists: yup.string().required("Plot twists are required"),
  numberOfPages: yup
    .number()
    .typeError("Number of pages must be a number")
    .required("Number of pages is required")
    .positive("Number of pages must be positive")
    .integer("Number of pages must be an integer"),
  numberOfChapters: yup
    .number()
    .typeError("Number of chapters must be a number")
    .required("Number of chapters is required")
    .positive("Number of chapters must be positive")
    .integer("Number of chapters must be an integer"),
  targetAudience: yup.string().required("Target audience is required"),
  language: yup.string().required("Language is required"),
  additionalContent: yup.string().optional(),
});

const CreateBook = () => {
  const [generateBook, { isLoading }] = useGenerateBookMutation();
  const [isBookDownloadName, setIsBookDownloadName] = useState("");
  const [formData, setFormData] = useState({
    bookTitle: "",
    genre: "",
    theme: "",
    characters: "",
    setting: "",
    tone: "",
    plotTwists: "",
    numberOfPages: "",
    numberOfChapters: "",
    targetAudience: "",
    language: "",
    additionalContent: "",
  });
  const [bookContent, setBookContent] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
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
      }
    }
  });
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const steps = {
    1: {
      title: "Basic Information",
      fields: ["bookTitle", "genre", "targetAudience", "language"],
      description: "Let's start with the basic details of your book"
    },
    2: {
      title: "Story Elements",
      fields: ["theme", "characters", "setting", "tone"],
      description: "Define the core elements of your story"
    },
    3: {
      title: "Structure",
      fields: ["numberOfPages", "numberOfChapters", "plotTwists"],
      description: "Set up the structure and flow of your book"
    },
    4: {
      title: "Additional Details",
      fields: ["additionalContent"],
      description: "Add any extra details or special requirements"
    },
    5: {
      title: "Styling Options",
      fields: ["advancedOptions"],
      description: "Customize the look and feel of your book"
    }
  };

  const fieldDescriptions: Record<string, string> = {
    bookTitle: "The main title of your book that captures its essence",
    genre: "The category or style of your book (e.g., Fantasy, Mystery, Romance)",
    theme: "The central idea or message of your story",
    characters: "Main characters that will appear in your story",
    setting: "The time and place where your story takes place",
    tone: "The overall mood or feeling of your book",
    plotTwists: "Unexpected turns in your story to keep readers engaged",
    numberOfPages: "Estimated length of your book in pages",
    numberOfChapters: "How many chapters you want in your book",
    targetAudience: "Who is this book primarily written for?",
    language: "The primary language of your book",
    additionalContent: "Any extra notes or special requirements",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === "numberOfPages" || name === "numberOfChapters"
          ? value === ""
            ? ""
            : parseInt(value, 10)
          : value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleAdvancedOptionsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAdvancedOptions(prev => {
      const newOptions = { ...prev };
      const keys = name.split('.');
      
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
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const currentStepData = steps[step as keyof typeof steps];
    const fieldsToValidate = currentStepData.fields.reduce((acc: any, field) => {
      if (field !== 'advancedOptions') {
        acc[field] = (formData as any)[field];
      }
      return acc;
    }, {});

    try {
      // Create a subset of the schema for the current step's fields
      const stepSchema = yup.object().shape(
        currentStepData.fields.reduce((acc: any, field) => {
          if (field !== 'advancedOptions') {
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
      toast.error("Please fill in all required fields correctly");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleGenerateBook = async () => {
    setProgress(10);

    try {
      // Validate all steps before submission
      const isValid = await Promise.all(
        Object.keys(steps).map((step) => validateStep(parseInt(step)))
      ).then((results) => results.every(Boolean));

      if (!isValid) {
        toast.error("Please check all fields and try again");
        return;
      }

      // Prepare the payload
      const payload = {
        ...formData,
        advancedOptions: showAdvancedOptions ? advancedOptions : undefined,
      };

      setProgress(30);

      // Generate the book
      const response: any = await generateBook(payload).unwrap();
      setIsBookDownloadName(formData.bookTitle);
      setProgress(70);

      if (response?.data?.additionalData?.fullContent) {
        setBookContent(response.data.additionalData.fullContent);
        setCoverImageUrl(response.data.additionalData.coverImageUrl);
        setProgress(100);
        
        toast.success("Book generated successfully!");
        navigate("/books");

        // Reset form after successful submission
        setFormData({
          bookTitle: "",
          genre: "",
          theme: "",
          characters: "",
          setting: "",
          tone: "",
          plotTwists: "",
          numberOfPages: "",
          numberOfChapters: "",
          targetAudience: "",
          language: "",
          additionalContent: "",
        });
        setCurrentStep(1);
        setAdvancedOptions({
          coverImagePrompt: "",
          colorScheme: "#F59E0B",
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
            }
          }
        });
      }
    } catch (error: any) {
      console.error('Book generation error:', error);
      toast.error(error.message || "Failed to generate book. Please try again.");
      setProgress(0);
    }
  };

  const handleExport = (format: "pdf") => {
    if (!bookContent) {
      toast.error("No content to export.");
      return;
    }

    const bookTitle = isBookDownloadName || "GeneratedBook";

    if (format === "pdf") {
      const doc = new jsPDF({
        format: "a4",
        unit: "pt",
      });

      // Add HTML content to PDF
      doc.html(sanitizeHTML(bookContent), {
        callback: (doc) => {
          doc.save(`${bookTitle}.pdf`);
          toast.success("Exported as PDF");
        },
        margin: [40, 40, 40, 40],
        autoPaging: "text",
        width: 500,
        windowWidth: 800,
      });
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Sanitize HTML content to prevent XSS attacks
  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'br', 'div', 'span', 'ul', 'ol', 'li', 'img'],
      ALLOWED_ATTR: ['style', 'class', 'id', 'src', 'alt', 'href'],
      ADD_TAGS: ['style'],
      ADD_ATTR: ['target'],
    });
  };

  const renderField = (key: string) => (
    <div key={key} className="space-y-2">
      <Label htmlFor={key} className="text-base font-medium">
        {formatLabel(key)}
      </Label>
      <Input
        id={key}
        name={key}
        type={key === "numberOfPages" || key === "numberOfChapters" ? "number" : "text"}
        placeholder={`Enter ${formatLabel(key)}`}
        value={(formData as any)[key]}
        onChange={handleChange}
        className="w-full"
      />
      <p className="text-sm text-gray-500">{fieldDescriptions[key]}</p>
      {errors[key] && (
        <p className="text-red-500 text-sm">{errors[key]}</p>
      )}
    </div>
  );

  const renderAdvancedOptionsToggle = () => (
    <div className="border-t pt-4">
      <button
        type="button"
        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        className="flex items-center justify-between w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div>
          <h4 className="text-lg font-medium">Advanced Styling Options</h4>
          <p className="text-sm text-gray-500">
            Customize fonts, colors, spacing, and more
          </p>
        </div>
        {showAdvancedOptions ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
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
          className="w-full rounded-md border border-gray-300 p-2"
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
                  { key: 'title', label: 'Title Size', default: '32px' },
                  { key: 'chapterTitle', label: 'Chapter Title', default: '24px' },
                  { key: 'headers', label: 'Headers', default: '20px' },
                  { key: 'body', label: 'Body Text', default: '16px' }
                ].map(({ key, label, default: defaultSize }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`fontSize-${key}`} className="text-sm">
                      {label}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`fontSize-${key}`}
                        name={`styling.fontSize.${key}`}
                        value={advancedOptions.styling?.fontSize?.[key] || ''}
                        onChange={handleAdvancedOptionsChange}
                        placeholder={defaultSize}
                        className="flex-1"
                      />
                      <Select
                        value={advancedOptions.styling?.fontSize?.[key]?.includes('rem') ? 'rem' : 'px'}
                        onValueChange={(unit) => {
                          const value = advancedOptions.styling?.fontSize?.[key]?.replace(/[^0-9.]/g, '') || '';
                          handleAdvancedOptionsChange({
                            target: {
                              name: `styling.fontSize.${key}`,
                              value: `${value}${unit}`
                            }
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
                  { key: 'title', label: 'Title Line Height', default: '1.2' },
                  { key: 'chapterTitle', label: 'Chapter Line Height', default: '1.3' },
                  { key: 'headers', label: 'Headers Line Height', default: '1.4' },
                  { key: 'body', label: 'Body Line Height', default: '1.6' }
                ].map(({ key, label, default: defaultHeight }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`lineHeight-${key}`} className="text-sm">
                      {label}
                    </Label>
                    <Input
                      id={`lineHeight-${key}`}
                      name={`styling.lineHeight.${key}`}
                      value={advancedOptions.styling?.lineHeight?.[key] || ''}
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
                {['top', 'right', 'bottom', 'left'].map((side) => (
                  <div key={side} className="space-y-2">
                    <Label htmlFor={`margin-${side}`} className="text-sm capitalize">
                      {side} Margin
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`margin-${side}`}
                        name={`styling.margins.${side}`}
                        value={advancedOptions.styling?.margins?.[side] || ''}
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
                  { key: 'paragraphSpacing', label: 'Paragraph Spacing', default: '1.5rem' },
                  { key: 'chapterSpacing', label: 'Chapter Spacing', default: '3rem' },
                  { key: 'sectionSpacing', label: 'Section Spacing', default: '2rem' }
                ].map(({ key, label, default: defaultSpacing }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`spacing-${key}`} className="text-sm">
                      {label}
                    </Label>
                    <Input
                      id={`spacing-${key}`}
                      name={`styling.spacing.${key}`}
                      value={advancedOptions.styling?.spacing?.[key] || ''}
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
                  { key: 'title', label: 'Title Alignment' },
                  { key: 'chapterTitle', label: 'Chapter Title Alignment' },
                  { key: 'headers', label: 'Headers Alignment' },
                  { key: 'body', label: 'Body Text Alignment' }
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`alignment-${key}`} className="text-sm">
                      {label}
                    </Label>
                    <Select
                      value={advancedOptions.styling?.textAlignment?.[key] || ''}
                      onValueChange={(value) => 
                        handleAdvancedOptionsChange({
                          target: { name: `styling.textAlignment.${key}`, value }
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

  const renderStepContent = (step: number) => {
    const currentStepData = steps[step as keyof typeof steps];
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>
        
        <div className="grid gap-6">
          {currentStepData.fields.map(field => {
            if (field === "advancedOptions") {
              return (
                <div key={field}>
                  {renderAdvancedOptionsToggle()}
                  {showAdvancedOptions && renderAdvancedOptions()}
                </div>
              );
            }
            return renderField(field);
          })}
        </div>
        
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="px-6"
            >
              Previous
            </Button>
          )}
          {step < Object.keys(steps).length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="ml-auto px-6 bg-amber-500 hover:bg-amber-600"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              className="ml-auto px-6 bg-amber-500 hover:bg-amber-600"
              disabled={isLoading}
              onClick={handleGenerateBook}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2">⌛</span>
                  Generating...
                </div>
              ) : (
                "Generate Book"
              )}
            </Button>
          )}
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-medium mb-2">Please fix the following errors:</p>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-red-500">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {progress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {progress}% Complete
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Object.entries(steps).map(([step, { title }]) => (
          <div
            key={step}
            className={cn(
              "flex flex-col items-center",
              parseInt(step) <= currentStep ? "text-amber-600" : "text-gray-400"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-2",
                parseInt(step) <= currentStep ? "bg-amber-100" : "bg-gray-100"
              )}
            >
              {step}
            </div>
            <span className="text-sm hidden md:block">{title}</span>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="absolute top-1/2 w-full h-0.5 bg-gray-200" />
        <div
          className="absolute top-1/2 h-0.5 bg-amber-500 transition-all"
          style={{ width: `${((currentStep - 1) / (Object.keys(steps).length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-5xl p-8 bg-white shadow-lg">
            {renderProgress()}
            
            <form onSubmit={handleSubmit}>
              {renderStepContent(currentStep)}
            </form>
          </Card>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold">Generated Book Content</h2>
                </div>
                <div className="overflow-y-auto flex-1 p-6">
                  {coverImageUrl && (
                    <div className="mb-6">
                      <img
                        src={coverImageUrl}
                        alt="Book Cover"
                        className="w-full max-w-md h-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  <div
                    className="prose prose-lg max-w-none [&>h1]:text-3xl [&>h2]:text-2xl [&>h3]:text-xl [&>p]:my-4 [&>ul]:list-disc [&>ol]:list-decimal [&>li]:ml-4"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHTML(bookContent || ""),
                    }}
                  />
                </div>
                <div className="p-6 border-t text-right">
                  <Button
                    className="bg-red-500 hover:bg-red-600"
                    onClick={toggleModal}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CreateBook;