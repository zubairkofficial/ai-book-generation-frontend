import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Layout from "@/components/layout/Layout";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { useGenerateBookMutation } from "@/api/authApi";
import DOMPurify from "dompurify"; // For sanitizing HTML

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
    colorScheme: "",
    fontStyle: "",
  });

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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setAdvancedOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const handleBookGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgress(10);

    try {
      const payload: any = {
        ...formData,
        advancedOptions: showAdvancedOptions ? advancedOptions : undefined,
      };

      const response: any = await generateBook(payload).unwrap();
      setIsBookDownloadName(formData.bookTitle);
      setProgress(70);

      if (
        response &&
        response.data &&
        response.data.additionalData?.fullContent
      ) {
        toast.success("Book generated successfully!");
        setBookContent(response.data.additionalData.fullContent);
        setCoverImageUrl(response.data.additionalData.coverImageUrl);
        setProgress(100);
        setTimeout(() => setProgress(0), 500);

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
        setAdvancedOptions({
          coverImagePrompt: "",
          colorScheme: "",
          fontStyle: "",
        });
        setErrors({});
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (error: any) {
      setProgress(0);
      console.error("Error generating book:", error);

      if (error?.data?.message?.errors) {
        const newErrors: { [key: string]: string } = {};
        error.data.message.errors.forEach((err: any) => {
          newErrors[err.property] = Object.values(err.constraints).join(", ");
        });
        setErrors(newErrors);
      } else if (error?.status === 401) {
        toast.error("Unauthorized: Please log in again.");
      } else {
        toast.error("Failed to generate the book. Please try again.");
      }
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-5xl p-8 bg-white shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Generate Book</h2>
              <p className="text-gray-600">
                Fill in the details to generate your book.
              </p>
            </div>

            <form
              onSubmit={handleBookGeneration}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{formatLabel(key)}</Label>
                  <Input
                    id={key}
                    name={key}
                    type={
                      key === "numberOfPages" || key === "numberOfChapters"
                        ? "number"
                        : "text"
                    }
                    placeholder={`Enter ${formatLabel(key)}`}
                    value={(formData as any)[key]}
                    onChange={handleChange}
                  />
                  {errors[key] && (
                    <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
                  )}
                </div>
              ))}

              <div className="col-span-full">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showAdvancedOptions}
                    onChange={() =>
                      setShowAdvancedOptions(!showAdvancedOptions)
                    }
                  />
                  Show Advanced Options
                </Label>
              </div>

              {showAdvancedOptions && (
                <>
                  <div>
                    <Label htmlFor="coverImagePrompt">Cover Image Prompt</Label>
                    <Input
                      id="coverImagePrompt"
                      name="coverImagePrompt"
                      type="text"
                      placeholder="Enter a prompt for the book cover"
                      value={advancedOptions.coverImagePrompt}
                      onChange={handleAdvancedOptionsChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="colorScheme">Color Scheme</Label>
                    <Input
                      id="colorScheme"
                      name="colorScheme"
                      type="text"
                      placeholder="Enter a color scheme (e.g., Blue and White)"
                      value={advancedOptions.colorScheme}
                      onChange={handleAdvancedOptionsChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fontStyle">Font Style</Label>
                    <Input
                      id="fontStyle"
                      name="fontStyle"
                      type="text"
                      placeholder="Enter a font style (e.g., Sans-serif)"
                      value={advancedOptions.fontStyle}
                      onChange={handleAdvancedOptionsChange}
                    />
                  </div>
                </>
              )}
              <div className="col-span-full">
                <Button
                  type="submit"
                  className="w-48 bg-amber-500 hover:bg-amber-600 mb-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Book"}
                </Button>
              </div>
            </form>
          </Card>

          {/* {bookContent && (
            <div className="w-full max-w-5xl mt-8">
              <div className="mt-4 flex justify-end gap-4">
                <Button
                  className="bg-gray-700 hover:bg-gray-800"
                  onClick={toggleModal}
                >
                  View
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => handleExport("pdf")}
                >
                  Export as PDF
                </Button>
              </div>
            </div>
          )} */}
         {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-lg overflow-hidden flex flex-col">
      {/* Modal Header */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Generated Book Content</h2>
      </div>

      {/* Modal Body (Scrollable Content) */}
      <div className="overflow-y-auto flex-1 p-6">
        {/* Cover Image */}
        {coverImageUrl && (
          <div className="mb-6">
            <img
              src={coverImageUrl}
              alt="Book Cover"
              className="w-full max-w-md h-auto rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Book Content */}
        <div
          className="prose prose-lg max-w-none [&>h1]:text-3xl [&>h2]:text-2xl [&>h3]:text-xl [&>p]:my-4 [&>ul]:list-disc [&>ol]:list-decimal [&>li]:ml-4"
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(bookContent || ""),
          }}
        />
      </div>

      {/* Modal Footer */}
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