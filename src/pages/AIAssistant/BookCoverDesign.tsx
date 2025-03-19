import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Paintbrush, Wand2, Save, AlertCircle, Image as ImageIcon, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { useGetAiAssistantResponseMutation } from '@/api/aiAssistantApi'; // You'll need to create this API endpoint
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { AiAssistantType } from '@/components/chat/ChatDialog';
import { TargetAudience } from '@/components/chat/ChatDialog';
import { BookGenre } from '@/pages/Book/CreateBook';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CoverDesignForm {
  bookTitle: string;
  genre: string;
  targetAudience: string;
  coreIdea: string;
  numberOfImages: string;
}

const BookCoverDesign = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [generateCover] = useGetAiAssistantResponseMutation();

  const { register, setValue, handleSubmit, formState: { errors } } = useForm<CoverDesignForm>({
    defaultValues: {
      bookTitle: '',
      genre: '',
      targetAudience: '',
      coreIdea: '',
      numberOfImages: '1'
    }
  });

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Extract filename from URL or use default
      const filename = imageUrl.split('/').pop() || 'book_cover.png';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      addToast('Failed to download image', 'error');
    }
  };

  const onSubmit = async (data: CoverDesignForm) => {
    try {
      setIsGenerating(true);
      const bookCoverInfo = {
        type: AiAssistantType.BOOK_COVER_IMAGE,
        bookCoverInfo: {
          bookTitle: data.bookTitle,
          genre: data.genre,
          targetAudience: data.targetAudience,
          coreIdea: data.coreIdea,
          numberOfImages: data.numberOfImages
        }
      };

      const response:any = await generateCover(bookCoverInfo).unwrap();
      // Update to handle array of image URLs
      setGeneratedImage(response.response.imageUrls[0]);
      setGeneratedContent(response.information.coreIdea);
      addToast('Cover design generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate cover design', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-red-50/50">
        <div className="max-w-[1400px] mx-auto p-6">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Paintbrush className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Book Cover Design</h1>
                <p className="text-gray-600">Create stunning AI-generated cover designs for your book</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/50 backdrop-blur-sm">
              <ScrollArea className="h-[41rem] pr-4">

                <CardHeader>
                  <CardTitle>Design Parameters</CardTitle>
                  <CardDescription>Define your cover design preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Book Title</Label>
                      <Input
                        {...register('bookTitle')}
                        placeholder="Enter your book title"
                        className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <Select onValueChange={(value) => setValue('genre', value)}>
                        <SelectTrigger className="border-amber-200">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(BookGenre).map((genre) => (
                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select onValueChange={(value) => setValue('targetAudience', value)}>
                        <SelectTrigger className="border-amber-200">
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TargetAudience).map((audience) => (
                            <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Core Idea</Label>
                      <Textarea
                        {...register('coreIdea')}
                        placeholder="What's the main concept or message of your book?"
                        className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Images</Label>
                      <Select onValueChange={(value) => setValue('numberOfImages', value)}>
                        <SelectTrigger className="border-amber-200">
                          <SelectValue placeholder="Select number of images" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Image</SelectItem>
                          <SelectItem value="2">2 Images</SelectItem>
                          <SelectItem value="3">3 Images</SelectItem>
                          <SelectItem value="4">4 Images</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Cover
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                </ScrollArea>
              </Card>
            </motion.div>

            {/* Output Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/50 backdrop-blur-sm">
              <ScrollArea className="h-[41rem] pr-4">

                <CardHeader>
                  <CardTitle>Generated Design</CardTitle>
                  <CardDescription>AI-generated cover design and suggestions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedImage && (
                    <div className="space-y-4">
                      <div className="rounded-lg overflow-hidden shadow-lg">
                        <img 
                          src={generatedImage} 
                          alt="Generated book cover" 
                          className="w-full h-auto"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleDownloadImage(generatedImage)}
                          variant="outline"
                          className="border-amber-200 hover:bg-amber-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Cover
                        </Button>
                      </div>
                    </div>
                  )}
                  
                
                </CardContent>
                </ScrollArea>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookCoverDesign; 