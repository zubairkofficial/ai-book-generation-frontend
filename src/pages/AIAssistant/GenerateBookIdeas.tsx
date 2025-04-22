import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { BookOpen, Wand2, Save, AlertCircle, ArrowLeft } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/context/ToastContext";
import { useGetAiAssistantResponseMutation } from "@/api/aiAssistantApi";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { isErrorType } from "@/common/errorHandle";
import { ToastType } from "@/constant";
import { AiAssistantType, BookGenre,TargetAudience } from "@/types/enum";

interface BookIdeaForm {
  genre: BookGenre;
  targetAudience: TargetAudience;
  themeOrTopic: string;
  
  description?: string;
}

const validationSchema = yup.object({
  genre: yup.string().required('Genre is required'),
  targetAudience: yup.string().required('Target audience is required'),
  themeOrTopic: yup.string().required('Theme or topic is required'),
   description: yup.string().optional()
});

const GenerateBookIdeas = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [generateIdeas] = useGetAiAssistantResponseMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookIdeaForm>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      genre: BookGenre.FANTASY,
      targetAudience: TargetAudience.CHILDREN,
      themeOrTopic: "",
     
      description: "",
    },
  });

  const onSubmit = async (data: BookIdeaForm) => {
    try {
      setIsGenerating(true);
      const response = await generateIdeas({
        type: AiAssistantType.BOOK_IDEA,
        information: {
          genre: data.genre,
          targetAudience: data.targetAudience,
          themeOrTopic: data.themeOrTopic,
        
          description: data.description,
        },
      }).unwrap();

      setGeneratedContent(response.response.generatedText);
      addToast("Ideas generated successfully!", "success");
    } catch (error: unknown) {
      // Type guard to check if the error is of type ErrorType
      if (isErrorType(error)) {
          console.error("Failed to generate book idea:", error);
          addToast(error.data.message.message ?? "Failed to generate book idea. Please try again.", ToastType.ERROR);
      } else if (error instanceof Error) {
          // Handle generic Error
          console.error("Failed to generate book idea:", error.message);
          addToast("Failed to generate book idea. Please try again.", ToastType.ERROR);
      } else {
          // Handle unexpected error types
          console.error("Failed to generate book idea: Unknown error occurred");
          addToast("Failed to generate book idea. Please try again.", ToastType.ERROR);
      }
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
            onClick={() => navigate("/ai-assistant")}
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
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Generate Book Ideas
                </h1>
                <p className="text-gray-600">
                  Create unique book concepts tailored to your preferences
                </p>
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
              <Card className="bg-white/50 backdrop-blur-sm ">
                <ScrollArea className="h-[40rem] pr-4">
                  <CardHeader>
                    <CardTitle>Book Parameters</CardTitle>
                    <CardDescription>
                      Define your book's characteristics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label>Genre</Label>
                        <Select
                          onValueChange={(value) => setValue('genre', value as BookGenre)}
                          defaultValue={BookGenre.FANTASY}
                        >
                          <SelectTrigger className="border-amber-200">
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(BookGenre).map((genre) => (
                              <SelectItem key={genre} value={genre}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.genre && (
                          <p className="text-sm text-red-500">{errors.genre.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select
                          onValueChange={(value) => setValue('targetAudience', value as TargetAudience)}
                          defaultValue={TargetAudience.CHILDREN}
                        >
                          <SelectTrigger className="border-amber-200">
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(TargetAudience).map((audience) => (
                              <SelectItem key={audience} value={audience}>
                                {audience}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.targetAudience && (
                          <p className="text-sm text-red-500">{errors.targetAudience.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Theme or Topic</Label>
                        <Textarea
                          {...register("themeOrTopic")}
                          placeholder="e.g., redemption, love, justice, technology's impact"
                          className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 min-h-[100px]"
                        />
                        {errors.themeOrTopic && (
                          <p className="text-sm text-red-500">{errors.themeOrTopic.message}</p>
                        )}
                      </div>
                      
                   

                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          {...register("description")}
                          placeholder="Add any extra details or specific requirements for your book idea"
                          className="border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 min-h-[100px]"
                        />
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
                            Generate Ideas
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
              <Card className="bg-white/50 backdrop-blur-sm ">
                <ScrollArea className="h-[40rem] pr-4">
                  <CardHeader>
                    <CardTitle>Generated Ideas</CardTitle>
                    <CardDescription>
                      AI-generated book concepts based on your parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generatedContent ? (
                      <div className="prose prose-amber max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {generatedContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 mt-20">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Your generated ideas will appear here</p>
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

export default GenerateBookIdeas;
