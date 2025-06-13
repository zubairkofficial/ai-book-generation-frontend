import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Paintbrush, Wand2, Image as ImageIcon, Download, ArrowLeft, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { BookGenre } from '@/pages/Book/CreateBook';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { isErrorType } from '@/common/errorHandle';
import { ToastType } from '@/constant';
import { AiAssistantType,TargetAudience } from '@/types/enum';

interface CoverDesignForm {
  bookTitle: string;
  subtitle?: string;
  authorName?: string;
  genre?: string;
  targetAudience: string;
  coreIdea: string;
  numberOfImages: string;
}

const validationSchema = yup.object({
  bookTitle: yup.string().required('Book title is required'),
  subtitle: yup.string().optional(),
  authorName: yup.string().optional(),
  genre: yup.string().optional(),
  targetAudience: yup.string().required('Target audience is required'),
  coreIdea: yup.string().required('Core idea is required'),
  numberOfImages: yup.string().required('Number of images is required')
});

const BookCoverDesign = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [generateCover] = useGetAiAssistantResponseMutation();

  const { register, setValue, handleSubmit, formState: { errors } } = useForm<CoverDesignForm>({
    resolver: yupResolver(validationSchema),    defaultValues: {
      bookTitle: '',
      subtitle: '',
      authorName: '',
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
      setIsGenerating(true);      const bookCoverInfo = {
        type: AiAssistantType.BOOK_COVER_IMAGE,
        bookCoverInfo: {
          bookTitle: data.bookTitle,
          subtitle: data.subtitle,
          authorName: data.authorName,
          genre: data.genre,
          targetAudience: data.targetAudience,
          coreIdea: data.coreIdea,
          numberOfImages: data.numberOfImages
        }
      };

      const response:any = await generateCover(bookCoverInfo).unwrap();
      // Store all image URLs
      setGeneratedImages(response.response.imageUrls);
      setGeneratedContent(response.information.coreIdea);
      addToast('Cover design generated successfully!', 'success');
    } catch (error: unknown) {
      // Type guard to check if the error is of type ErrorType
      if (isErrorType(error)) {
          console.error("Failed to generate book cover image:", error);
          addToast(error.data.message.message ?? "Failed to generate Book cover image. Please try again.", ToastType.ERROR);
      } else if (error instanceof Error) {
          // Handle generic Error
          console.error("Failed to generate book cover image:", error.message);
          addToast("Failed to generate Book cover image. Please try again.", ToastType.ERROR);
      } else {
          // Handle unexpected error types
          console.error("Failed to generate book cover image: Unknown error occurred");
          addToast("Failed to generate Book cover image. Please try again.", ToastType.ERROR);
      }
  } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-red-50/50">
        <div className="max-w-[1400px] mx-auto p-6">
          {/* Header Section */}
          <Button 
            onClick={() => navigate('/ai-assistant')}
            className="mr-4 px-4 py-2 hover:bg-amber-100 rounded-md flex items-center bg-amber-50 text-amber-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Assistant
          </Button>
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">                      <div className="space-y-2">
                        <Label>Book Title</Label>
                        <Input
                          {...register('bookTitle')}
                          placeholder="Enter your book title"
                          className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                        {errors.bookTitle && (
                          <p className="text-sm text-red-500">{errors.bookTitle.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input
                          {...register('subtitle')}
                          placeholder="Enter book subtitle (optional)"
                          className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Author Name</Label>
                        <Input
                          {...register('authorName')}
                          placeholder="Enter author name (optional)"
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
                        {errors.genre && (
                          <p className="text-sm text-red-500">{errors.genre.message}</p>
                        )}
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
                        {errors.targetAudience && (
                          <p className="text-sm text-red-500">{errors.targetAudience.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Core Idea</Label>
                        <Textarea
                          {...register('coreIdea')}
                          placeholder="What's the main concept or message of your book?"
                          className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 min-h-[100px]"
                        />
                        {errors.coreIdea && (
                          <p className="text-sm text-red-500">{errors.coreIdea.message}</p>
                        )}
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
                        {errors.numberOfImages && (
                          <p className="text-sm text-red-500">{errors.numberOfImages.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
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
                    {generatedImages.length > 0 ? (
                      <div className="space-y-8">
                        {generatedImages.map((imageUrl, index) => (
                         
                         <div key={index} className="space-y-4">
                          <div className="flex justify-end">
                              <Button
                                onClick={() => handleDownloadImage(imageUrl)}
                                variant="outline"
                                className="border-amber-200 hover:bg-amber-50"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download Cover {generatedImages.length > 1 ? index + 1 : ''}
                              </Button>
                            </div>
                            <div className="rounded-lg overflow-hidden shadow-lg">
                              <img 
                                src={imageUrl} 
                                alt={`Generated book cover ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                           
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 mt-20">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Your generated cover design will appear here</p>
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