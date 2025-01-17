import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import Layout from '@/components/layout/Layout';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { useGenerateBookMutation } from '@/api/authApi';

const Dashboard = () => {
  const [generateBook, { isLoading }] = useGenerateBookMutation();
  const [isbookDownloadName, setIsBookDownloadName] = useState('');
  const [formData, setFormData] = useState({
    bookTitle: '',
    genre: '',
    theme: '',
    characters: '',
    setting: '',
    tone: '',
    plotTwists: '',
    numberOfPages: '',
    numberOfChapters: '',
    targetAudience: '',
    language: '',
    additionalContent: '',
  });
  const [bookContent, setBookContent] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === 'numberOfPages' || name === 'numberOfChapters'
          ? value === '' ? '' : parseInt(value, 10)
          : value,
    }));
    // Clear the error for the field when it changes
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const handleBookGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgress(10);

    try {
      const response = await generateBook(formData).unwrap();
      setIsBookDownloadName(formData.bookTitle);
      setProgress(70);

      // Check if the response contains the expected data
      if (response && response.data && response.data.additionalData?.fullContent) {
        toast.success('Book generated successfully!');
        setBookContent(formatContent(response.data.additionalData.fullContent));
        setProgress(100);
        setTimeout(() => setProgress(0), 500);

        // Reset the form data
        setFormData({
          bookTitle: '',
          genre: '',
          theme: '',
          characters: '',
          setting: '',
          tone: '',
          plotTwists: '',
          numberOfPages: '',
          numberOfChapters: '',
          targetAudience: '',
          language: '',
          additionalContent: '',
        });
        setErrors({});
      } else {
        throw new Error('Unexpected response from the server.');
      }
    } catch (error: any) {
      setProgress(0);
      console.error('Error generating book:', error);

      if (error?.data?.message?.errors) {
        // Handle validation errors
        const newErrors: { [key: string]: string } = {};
        error.data.message.errors.forEach((err: any) => {
          newErrors[err.property] = Object.values(err.constraints).join(', ');
        });
        setErrors(newErrors);
      } else if (error?.status === 401) {
        // Handle unauthorized errors
        toast.error('Unauthorized: Please log in again.');
      } else {
        // Handle generic errors
        toast.error('Failed to generate the book. Please try again.');
      }
    }
  };

  const formatContent = (content: string) => {
    return content.replace(/\n\n/g, '\n').replace(/^Chapter/gm, '\nChapter');
  };

  const handleExport = (format: 'pdf' | 'epub' | 'word') => {
    if (!bookContent) {
      toast.error('No content to export.');
      return;
    }

    const bookTitle = isbookDownloadName || 'GeneratedBook';

    if (format === 'pdf') {
      const doc = new jsPDF({
        format: 'a4',
        unit: 'pt',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;

      const text = bookContent || '';
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);

      let cursorY = margin;

      lines.forEach((line, index) => {
        if (cursorY + 20 > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += 20;
      });

      doc.save(`${bookTitle}.pdf`);
      toast.success('Exported as PDF');
    } else {
      const blob = new Blob([bookContent], { type: 'text/plain;charset=utf-8' });
      const fileName = `${bookTitle}.${format}`;
      saveAs(blob, fileName);
      toast.success(`Exported as ${format.toUpperCase()}`);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <Header />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-5xl p-8 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Generate Book</h2>
              <p className="text-gray-600">Fill in the details to generate your book.</p>
            </div>
            <form onSubmit={handleBookGeneration} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{formatLabel(key)}</Label>
                  <Input
                    id={key}
                    name={key}
                    type={key === 'numberOfPages' || key === 'numberOfChapters' ? 'number' : 'text'}
                    placeholder={`Enter ${formatLabel(key)}`}
                    value={(formData as any)[key]}
                    onChange={handleChange}
                  />
                  {errors[key] && <p className="text-red-500 text-sm mt-1">{errors[key]}</p>}
                </div>
              ))}
              <div className="col-span-full">
                <Button
                  type="submit"
                  className="w-48 bg-amber-500 hover:bg-amber-600 mb-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Book'}
                </Button>
              </div>
            </form>
          </Card>

          {bookContent && (
            <div className="w-full max-w-5xl mt-8">
              <div className="mt-4 flex justify-end gap-4">
                <Button className="bg-gray-700 hover:bg-gray-800" onClick={toggleModal}>
                  View
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => handleExport('pdf')}
                >
                  Export as PDF
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleExport('epub')}
                >
                  Export as ePub
                </Button>
                <Button
                  className="bg-gray-500 hover:bg-gray-600"
                  onClick={() => handleExport('word')}
                >
                  Export as Word
                </Button>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white w-3/4 max-h-[80vh] p-6 rounded-lg overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Generated Book Content</h2>
                <pre className="whitespace-pre-wrap p-4 bg-gray-100 rounded-md">{bookContent}</pre>
                <div className="text-right mt-4">
                  <Button className="bg-red-500 hover:bg-red-600" onClick={toggleModal}>
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

export default Dashboard;