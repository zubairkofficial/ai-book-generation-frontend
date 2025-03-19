import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { useFetchSettingsQuery, useUpdateSettingsMutation } from '@/api/settingsApi';
import { motion } from 'framer-motion';
import { Save, Paintbrush, Wand2, AlertCircle, BookOpen, SparklesIcon } from 'lucide-react';
import { AIModel, AIModelLabels,AIDomainURLs } from '@/types/ai-models.enum';

const settingsSchema = yup.object({
  coverImagePrompt: yup.string().nullable(),
  coverImageModel: yup.string().oneOf(Object.values(AIModel)).nullable(),
  coverImageDomainUrl: yup.string().nullable(),
  chapterImagePrompt: yup.string().nullable(),
  chapterImageModel: yup.string().oneOf(Object.values(AIModel)).nullable(),
  chapterImageDomainUrl: yup.string().nullable(),
});

interface SettingsFormData {
  coverImagePrompt?: string|null;
  coverImageModel?: AIModel|null;
  coverImageDomainUrl?: string|null;
  chapterImagePrompt?: string|null;
  chapterImageModel?: AIModel|null;
  chapterImageDomainUrl?: string|null;
}

export const ModelPromptTab = () => {
  const { data: settingsInfo } = useFetchSettingsQuery();
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
  const { addToast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<SettingsFormData>({
    resolver: yupResolver(settingsSchema),
    defaultValues: {
      coverImagePrompt: '',
      coverImageModel: null,
      coverImageDomainUrl: null,
      chapterImagePrompt: '',
      chapterImageModel: null,
      chapterImageDomainUrl: null,
    }
  });

  const formData = watch();

  const handleModelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    field: 'coverImageModel' | 'chapterImageModel'
  ) => {
    const model = event.target.value as AIModel;
    const domainUrlField = field === 'coverImageModel' ? 'coverImageDomainUrl' : 'chapterImageDomainUrl';
    
    // Update both model and domain URL
    reset({
      ...formData,
      [field]: model,
      [domainUrlField]: model ? AIDomainURLs[model] : null
    });
  };

  React.useEffect(() => {
    if (settingsInfo) {
      reset({
        coverImagePrompt: settingsInfo.coverImagePrompt || '',
        coverImageModel: settingsInfo.coverImageModel as AIModel | null,
        coverImageDomainUrl: settingsInfo.coverImageModel ? AIDomainURLs[settingsInfo.coverImageModel as AIModel] : null,
        chapterImagePrompt: settingsInfo.chapterImagePrompt || '',
        chapterImageModel: settingsInfo.chapterImageModel as AIModel | null,
        chapterImageDomainUrl: settingsInfo.chapterImageModel ? AIDomainURLs[settingsInfo.chapterImageModel as AIModel] : null,
      });
    }
  }, [settingsInfo, reset]);

  const handleSettingsSave = async (data: SettingsFormData) => {
    try {
      const payload = {
        ...data,
        id: settingsInfo?.id,
      };

      await updateSettings(payload).unwrap();
      addToast('Settings updated successfully!', ToastType.SUCCESS);
    } catch (error: any) {
      addToast(`Failed to update settings: ${error.message}`, ToastType.ERROR);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-4"
          >
            <Wand2 className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">AI Image Generation Settings</h2>
          </motion.div>
          <p className="text-gray-600 ml-11">
            Configure your AI models and prompts for generating book covers and chapter images.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleSettingsSave)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cover Image Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-50 to-amber-50/30 rounded-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Paintbrush className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Cover Image Generation</h3>
                </div>

                <div className="space-y-6">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Fal-ai Model</Label>
                    <select
                      {...register('coverImageModel')}
                      onChange={(e) => handleModelChange(e, 'coverImageModel')}
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white/80"
                    >
                      <option value="">Select AI Model</option>
                      {Object.entries(AIModelLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {/* Domain URL Display */}
                    {formData.coverImageModel && (
                      <div className="mt-2 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 font-medium">Domain URL:</p>
                        <p className="text-sm text-gray-600 break-all">
                          {AIDomainURLs[formData.coverImageModel as AIModel]}
                        </p>
                      </div>
                    )}
                    {errors.coverImageModel && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 text-sm text-red-500 mt-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.coverImageModel.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Cover Image Prompt</Label>
                    <div className="relative">
                      <textarea
                        {...register('coverImagePrompt')}
                        placeholder="Enter your default cover image prompt template..."
                        className="w-full pl-3 pr-10 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white/80 min-h-[100px] resize-y"
                      />
                      <SparklesIcon className="absolute right-3 top-4 w-5 h-5 text-amber-400" />
                    </div>
                    {errors.coverImagePrompt && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 text-sm text-red-500 mt-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.coverImagePrompt.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chapter Image Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-50/50 to-white rounded-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Chapter Image Generation</h3>
                </div>

                <div className="space-y-6">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Fal-ai Model</Label>
                    <select
                      {...register('chapterImageModel')}
                      onChange={(e) => handleModelChange(e, 'chapterImageModel')}
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white/80"
                    >
                      <option value="">Select AI Model</option>
                      {Object.entries(AIModelLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {/* Domain URL Display */}
                    {formData.chapterImageModel && (
                      <div className="mt-2 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 font-medium">Domain URL:</p>
                        <p className="text-sm text-gray-600 break-all">
                          {AIDomainURLs[formData.chapterImageModel as AIModel]}
                        </p>
                      </div>
                    )}
                    {errors.chapterImageModel && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 text-sm text-red-500 mt-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.chapterImageModel.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Chapter Image Prompt</Label>
                    <div className="relative">
                      <textarea
                        {...register('chapterImagePrompt')}
                        placeholder="Enter your default chapter image prompt template..."
                        className="w-full pl-3 pr-10 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white/80 min-h-[100px] resize-y"
                      />
                      <SparklesIcon className="absolute right-3 top-4 w-5 h-5 text-amber-400" />
                    </div>
                    {errors.chapterImagePrompt && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 text-sm text-red-500 mt-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.chapterImagePrompt.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Save Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end mt-8 pt-6 border-t border-gray-100"
          >
            <Button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving Changes...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}; 