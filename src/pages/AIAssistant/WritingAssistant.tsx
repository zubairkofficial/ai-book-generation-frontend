import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { MessageSquare, Wand2, Save, AlertCircle, BookOpen, Send, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { useGetAiAssistantResponseMutation } from '@/api/aiAssistantApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AiAssistantType, BookGenre, TargetAudience } from '@/components/chat/ChatDialog';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface WritingForm {
  writingGoal: string;
  genre: string;
  targetAudience: string;
  currentChallenges?: string;
  specificArea?: string;
  writingLevel: string;
}

const validationSchema = yup.object({
  writingGoal: yup.string().required('Writing goal is required'),
  genre: yup.string().required('Genre is required'),
  targetAudience: yup.string().required('Target audience is required'),
  currentChallenges: yup.string().optional(),
  specificArea: yup.string().optional(),
  writingLevel: yup.string().required('Writing level is required'),
});

const WritingAssistant = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [generateWriting] = useGetAiAssistantResponseMutation();

  const { register, setValue, handleSubmit, formState: { errors } } = useForm<WritingForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      writingGoal: '',
      genre: '',
      targetAudience: '',
      currentChallenges: '',
      specificArea: '',
      writingLevel: ''
    }
  });

  const onSubmit = async (data: WritingForm) => {
    try {
      setIsGenerating(true);
      const response = await generateWriting({
        type: AiAssistantType.WRITING_ASSISTANT,
        bookWriteInfo: {
            writingGoal: data.writingGoal,
          genre: data.genre,
          targetAudience: data.targetAudience,
          currentChallenges: data.currentChallenges,
          specificArea: data.specificArea,
          writingLevel: data.writingLevel
        }
      }).unwrap();
      
      setGeneratedContent(response.response.generatedText);
      addToast('Content generated successfully!', 'success');
    } catch (error) {
      addToast(error?.data.message.message??'Failed to generate content', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50">
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
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Writing Assistant</h1>
                <p className="text-gray-600">Your AI companion for crafting engaging content</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-6"
            >
              <Card className="bg-white/50 backdrop-blur-sm ">
                <ScrollArea className="h-[40rem] pr-4">
                <CardHeader>
                  <CardTitle>Writing Parameters</CardTitle>
                  <CardDescription>Define your writing requirements</CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Writing Goal</Label>
                      <Select onValueChange={(value) => setValue('writingGoal', value)}>
                        <SelectTrigger className="border-amber-200">
                          <SelectValue placeholder="Select writing goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="improve">Improve Writing</SelectItem>
                          <SelectItem value="start">Start New Project</SelectItem>
                          <SelectItem value="continue">Continue Project</SelectItem>
                          <SelectItem value="edit">Edit Existing Work</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.writingGoal && (
                        <p className="text-sm text-red-500">{errors.writingGoal.message}</p>
                      )}
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
                      <Label>Current Challenges (Optional)</Label>
                      <Textarea
                        {...register('currentChallenges')}
                        placeholder="Describe any writing challenges you're facing..."
                        className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Specific Area (Optional)</Label>
                      <Textarea
                        {...register('specificArea')}
                        placeholder="Any specific area you want to focus on..."
                        className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Writing Level</Label>
                      <Select onValueChange={(value) => setValue('writingLevel', value)}>
                        <SelectTrigger className="border-amber-200">
                          <SelectValue placeholder="Select writing level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.writingLevel && (
                        <p className="text-sm text-red-500">{errors.writingLevel.message}</p>
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
                          Generate Content
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
              <ScrollArea className="h-[40rem] pr-4">
                  
                <CardHeader>
                  <CardTitle>Generated Content</CardTitle>
                  <CardDescription>AI-generated writing based on your parameters</CardDescription>
                </CardHeader>
                <CardContent>
                   {generatedContent ? (
                      <div className="prose prose-amber max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                            li: ({node, ...props}) => <li className="mb-2" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-amber-700" {...props} />
                          }}
                        >
                          {generatedContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 mt-20">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Your generated content will appear here</p>
                      </div>
                    )}

                
                </CardContent>
                  </ScrollArea>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-40 left-10 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-80 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
    </Layout>
  );
};

export default WritingAssistant; 