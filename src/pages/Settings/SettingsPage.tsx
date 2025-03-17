// pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserMeQuery, useUpdateUserMutation } from '@/api/userApi';
import { UpdateUserPayload } from '@/interfaces/user.interface';
import { useToast } from '@/context/ToastContext'; // Import custom toast hook
import { DEFAULT_Model, ToastType } from '@/constant';
import { useFetchApiKeysQuery, useUpdateApiKeysMutation } from '@/api/apiKeysApi';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { 
  UserCircle, 
  Key, 
  Shield,
  BrainIcon,
  Save,
  AlertCircle
} from 'lucide-react';

// Add validation schemas
const passwordSchema = yup.object({
  oldPassword: yup.string()
    .required('Current password is required')
    .min(6, 'Password must be at least 6 characters'),
  newPassword: yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

const apiKeysSchema = yup.object({
  id: yup.string()
    .nullable()
    .transform((value) => value || null),
  openaiKey: yup.string()
    .nullable()
    .transform((value) => value || null)
    .test('is-empty-or-valid', 'Invalid OpenAI API key format', function(value) {
      if (!value) return true;
      return /^sk-[a-zA-Z0-9_-]+$/i.test(value);
    }),
  
    falKey: yup.string()
    .nullable()
    .transform((value) => value || null)
    .test('is-string', 'Fal AI key must be a string', function(value) {
      if (!value) return true; // Allow null or undefined
      return typeof value === 'string';
    }),  
  llmModel: yup.string()
    .nullable()
    .transform((value) => value || null),
});

// Add validation schema for profile
const profileSchema = yup.object({
  name: yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .matches(
      /^[a-zA-Z\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .test('no-consecutive-special', 'Cannot contain consecutive special characters', 
      value => !value || !/[-']{2,}/.test(value))
    .test('starts-with-letter', 'Must start with a letter', 
      value => !value || /^[a-zA-Z]/.test(value))
    .trim(),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
});

// Add interfaces for form data
interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiKeysFormData {
  id?: string | null;
  openaiKey?: string | null;
  falKey?: string | null;
  llmModel?: string | null;
}


// Add interface for API keys payload
interface UpdateApiKeysPayload {
  id: number;
  model?: string;
  openai_key?: string;
  fal_ai?: string;
}

const SettingsPage = () => {
  const { data: userInfo,refetch:userRefetch } = useUserMeQuery();
  
  // Only fetch API keys if user is admin
  const { data: apiKeyInfo } = useFetchApiKeysQuery(undefined, {
    skip: userInfo?.role !== 'admin'
  });

  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const { addToast } = useToast(); // Use custom toast hook
  const [updateApiKeys, { isLoading: isUpdatingKeys }] = useUpdateApiKeysMutation();

  // Add real-time validation state
  const [openaiKeyValidation, setOpenaiKeyValidation] = useState({
    isValid: true,
    error: ''
  });

  // Add form handling for password
  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  // Add form handling for API keys with default values
  const { register: registerApiKeys, handleSubmit: handleSubmitApiKeys, formState: { errors: apiKeyErrors }, reset: resetApiKeys } = useForm({
    resolver: yupResolver(apiKeysSchema),
    defaultValues: {
      id: '',
      openaiKey: '',
      falKey: '',
      llmModel: ''
    }
  });

  // Add form handling for profile
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, setValue } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  });

  // Update useEffect to set form values
  useEffect(() => {
    if (userInfo) {
      setValue('name', userInfo.name);
      setValue('email', userInfo.email);
    }
  }, [userInfo, setValue]);

  // Add useEffect to set the ID when apiKeyInfo is available
  useEffect(() => {
    if (apiKeyInfo) {
      resetApiKeys({
        id: apiKeyInfo.id ,
        openaiKey: '',
        dalleKey: '',
        falKey: '',
        llmModel: apiKeyInfo.model || ''
      });
    }
  }, [apiKeyInfo, resetApiKeys]);

  // Function to validate OpenAI key in real-time
  const validateOpenAIKey = (value: string) => {
    let error = '';
    
    if (value) {
      if (!value.startsWith('sk-')) {
        error = 'API key must start with "sk-"';
      } else if (value.length < 51) {
        error = 'API key must be at least 51 characters';
      } else if (!/^sk-[a-zA-Z0-9_-]+$/i.test(value)) {
        error = 'API key can only contain letters, numbers, underscores, and hyphens';
      }
    }

    setOpenaiKeyValidation({
      isValid: !error,
      error
    });
  };

  // Function to validate DALL-E key in real-time
useEffect(()=>{userRefetch()},[])

  const handleProfileSave = async (data: { name: string; email: string }) => {
    try {
      const payload: UpdateUserPayload = {
        name: data.name,
        email: data.email,
      };

      await updateUser(payload).unwrap();
      addToast('Profile updated successfully!', ToastType.SUCCESS);
      userRefetch();
    } catch (error: any) {
      console.log("error",error)
      addToast(`Failed to update profile: ${error.message}`, ToastType.ERROR);
    }
  };

  // Update password handler
  const handlePasswordSave = async (data: PasswordFormData) => {
    const payload: UpdateUserPayload = {
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    };

    try {
      await updateUser(payload).unwrap();
      resetPassword();
      addToast('Password updated successfully!', ToastType.SUCCESS);
    } catch (error: any) {
      console.log("error",error)

      addToast(`Failed to update password: ${error.data.message.message}`, ToastType.ERROR);
    }
  };

  // Update API keys handler with better error handling
  const handleApiKeysSave = async (data: ApiKeysFormData) => {
    try {
      const payload: UpdateApiKeysPayload = {
        id: Number(apiKeyInfo?.id) || Number(data.id), // Always include ID if it exists in apiKeyInfo
        ...(data.llmModel && { model: data.llmModel }),
        ...(data.openaiKey && { openai_key: data.openaiKey }),
        ...(data.falKey && { fal_ai: data.falKey }),
      };

      await updateApiKeys(payload).unwrap();
      resetApiKeys({
        id: apiKeyInfo?.id,
        openaiKey: '',
        falKey: '',
        llmModel: apiKeyInfo?.model || ''
      });
      addToast('API keys updated successfully!', ToastType.SUCCESS);
    } catch (error: any) {
      addToast(`Failed to update API keys: ${error.message}`, ToastType.ERROR);
    }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-6 sm:mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Account Settings
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your profile, security, and API preferences
              </p>
            </motion.div>
          </div>

          {/* Main Content - Enhanced Card Design */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Tabs defaultValue="profile" className="w-full">
              {/* Enhanced Tab Navigation */}
              <div className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                <TabsList className="flex w-full max-w-3xl mx-auto px-4">
                  <TabsTrigger 
                    value="profile" 
                    className="flex-1 py-4 px-3 group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserCircle className="w-5 h-5 text-gray-500 group-data-[state=active]:text-amber-500" />
                      <span className="hidden sm:inline">Profile</span>
                    </div>
                  </TabsTrigger>

                  <TabsTrigger 
                    value="password"
                    className="flex-1 py-4 px-3 group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5 text-gray-500 group-data-[state=active]:text-amber-500" />
                      <span className="hidden sm:inline">Security</span>
                    </div>
                  </TabsTrigger>

                  {userInfo?.role === 'admin' && (
                    <>
                    <TabsTrigger 
                      value="api-keys"
                      className="flex-1 py-4 px-3 group"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Key className="w-5 h-5 text-gray-500 group-data-[state=active]:text-amber-500" />
                        <span className="hidden sm:inline">API Keys</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="model-prompts"
                      className="flex-1 py-4 px-3 group"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <BrainIcon className="w-5 h-5 text-gray-500 group-data-[state=active]:text-amber-500" />
                        <span className="hidden sm:inline">AI Model and Prompts</span>
                      </div>
                    </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </div>

              {/* Enhanced Tab Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                <TabsContent value="profile">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-2xl mx-auto space-y-8"
                  >
                    {/* Profile Form - Enhanced UI */}
                    <form onSubmit={handleSubmitProfile(handleProfileSave)}>
                      <div className="space-y-6">
                        {/* Profile Picture Section */}
                        <div className="flex items-center gap-4">
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-2xl font-semibold text-amber-600">
                            {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                            <p className="text-sm text-gray-500">Update your profile photo</p>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-6">
                          {/* Name Input - Enhanced */}
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                              Full Name
                            </Label>
                            <div className="relative">
                              <Input
                                {...registerProfile('name')}
                                id="name"
                                className="pl-10"
                                placeholder="Enter your full name"
                              />
                              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                            {profileErrors.name && (
                              <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-500 flex items-center gap-1"
                              >
                                <AlertCircle className="h-4 w-4" />
                                {profileErrors.name.message}
                              </motion.p>
                            )}
                          </div>

                          {/* Email Input - Enhanced */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                              Email Address
                            </Label>
                            <div className="relative">
                              <Input
                                {...registerProfile('email')}
                                id="email"
                                type="email"
                                className="pl-10"
                                disabled={true}
                                placeholder="Enter your email"
                              />
                              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                            {profileErrors.email && (
                              <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-500 flex items-center gap-1"
                              >
                                <AlertCircle className="h-4 w-4" />
                                {profileErrors.email.message}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        {/* Submit Button - Enhanced */}
                        <div className="flex justify-end pt-6 border-t border-gray-100">
                          <Button
                            type="submit"
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6"
                            disabled={isLoading}
                          >
                            <Save className="h-4 w-4" />
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                </TabsContent>

                <TabsContent value="password">
                  <div className="animate-in fade-in-50 duration-500">
                    <div className="max-w-2xl mx-auto space-y-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
                      <form onSubmit={handleSubmitPassword(handlePasswordSave)} className="space-y-6">
                        <div className="grid gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <Input
                              {...registerPassword('oldPassword')}
                              type="password"
                              className={`w-full ${passwordErrors.oldPassword ? 'border-red-500' : ''}`}
                            />
                            {passwordErrors.oldPassword && (
                              <p className="text-sm text-red-500">{passwordErrors.oldPassword.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              {...registerPassword('newPassword')}
                              type="password"
                              className={`w-full ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                            />
                            {passwordErrors.newPassword && (
                              <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              {...registerPassword('confirmPassword')}
                              type="password"
                              className={`w-full ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                            />
                            {passwordErrors.confirmPassword && (
                              <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-100">
                          <Button 
                            type="submit" 
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white transition-colors duration-200"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Updating...</span>
                              </div>
                            ) : 'Update Password'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </TabsContent>

                {userInfo?.role === 'admin' && (
                  <TabsContent value="api-keys">
                    <div className="animate-in fade-in-50 duration-500">
                      <div className="max-w-2xl mx-auto space-y-6">
                        <div className="mb-6">
                          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">API Keys</h2>
                          <p className="mt-2 text-sm text-gray-600">
                            Manage your API keys for external services
                          </p>
                        </div>

                        {/* Current API Keys Display */}
                        {apiKeyInfo && (
                          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Current API Keys</h3>
                            <div className="grid gap-4">
                             
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">OpenAI API Key:</span>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {apiKeyInfo.openai_key ? 
                                    `${apiKeyInfo.openai_key.substring(0, 4)}...${apiKeyInfo.openai_key.slice(-4)}` : 
                                    'Not set'}
                                </code>
                              </div>
                             
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Fal AI Key:</span>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {apiKeyInfo.fal_ai ? 
                                    `${apiKeyInfo.fal_ai.substring(0, 4)}...${apiKeyInfo.fal_ai.slice(-4)}` : 
                                    'Not set'}
                                </code>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">LLM Model:</span>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {apiKeyInfo.model || 'Not set'}
                                </code>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Update API Keys Form */}
                        <form onSubmit={handleSubmitApiKeys(handleApiKeysSave)} className="space-y-6">
                          <div className="grid gap-6">
                           

                            <div className="space-y-2">
                              <Label htmlFor="openaiKey">New OpenAI API Key</Label>
                              <div className="relative">
                                <Input
                                  {...registerApiKeys('openaiKey', {
                                    onChange: (e) => validateOpenAIKey(e.target.value)
                                  })}
                                  type="password"
                                  id="openaiKey"
                                  placeholder="sk-..."
                                  className={`w-full pr-10 ${
                                    !openaiKeyValidation.isValid || apiKeyErrors.openaiKey 
                                      ? 'border-red-500' 
                                      : ''
                                  }`}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  {(!openaiKeyValidation.isValid || apiKeyErrors.openaiKey) && (
                                    <svg
                                      className="h-5 w-5 text-red-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              
                              {/* Error Message */}
                              {(!openaiKeyValidation.isValid || apiKeyErrors.openaiKey) && (
                                <p className="text-sm text-red-500">
                                  {openaiKeyValidation.error || apiKeyErrors.openaiKey?.message}
                                </p>
                              )}

                              {/* Help Text */}
                              <p className="text-xs text-gray-500">
                                Format: Must start with "sk-" and contain only letters, numbers, underscores, and hyphens
                              </p>
                            </div>

                            

                            <div className="space-y-2">
                              <Label htmlFor="falKey">New Fal AI Key</Label>
                              <div className="relative">
                                <Input
                                  {...registerApiKeys('falKey')}
                                  type="password"
                                  id="falKey"
                                  placeholder="fal_..."
                                  className={`w-full pr-20 ${apiKeyErrors.falKey ? 'border-red-500' : ''}`}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  {apiKeyErrors.falKey && (
                                    <svg 
                                      className="h-5 w-5 text-red-500" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              {apiKeyErrors.falKey && (
                                <p className="text-sm text-red-500 mt-1">
                                  {apiKeyErrors.falKey.message}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Format: fal_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Starts with 'fal_')
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="llmModel">LLM Model</Label>
                              <select
                                {...registerApiKeys('llmModel')}
                                className={`w-full rounded-md border ${apiKeyErrors.llmModel ? 'border-red-500' : 'border-gray-300'}`}
                              >
                                <option value="">Select a model</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                <option value="gpt-4">GPT-4</option>
                                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                              </select>
                              {apiKeyErrors.llmModel && (
                                <p className="text-sm text-red-500">{apiKeyErrors.llmModel.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end pt-6 border-t border-gray-100">
                            <Button 
                              type="submit" 
                              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white transition-colors duration-200"
                              disabled={isUpdatingKeys}
                            >
                              {isUpdatingKeys ? (
                                <div className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span>Updating...</span>
                                </div>
                              ) : 'Update Settings'}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </TabsContent>
                )}

{userInfo?.role === 'admin' && (
                  <TabsContent value="model-prompts">
                    <div className="animate-in fade-in-50 duration-500">
                      <div className="max-w-2xl mx-auto space-y-6">
                        <div className="mb-6">
                          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">AI Model & Prompts</h2>
                          <p className="mt-2 text-sm text-gray-600">
                            Manage your AI model and prompts
                          </p>
                        </div>

                        {/* Current API Keys Display */}
                        {apiKeyInfo && (
                          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Current API Keys</h3>
                            <div className="grid gap-4">
                             
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">OpenAI API Key:</span>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {apiKeyInfo.openai_key ? 
                                    `${apiKeyInfo.openai_key.substring(0, 4)}...${apiKeyInfo.openai_key.slice(-4)}` : 
                                    'Not set'}
                                </code>
                              </div>
                             
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Fal AI Key:</span>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {apiKeyInfo.fal_ai ? 
                                    `${apiKeyInfo.fal_ai.substring(0, 4)}...${apiKeyInfo.fal_ai.slice(-4)}` : 
                                    'Not set'}
                                </code>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">LLM Model:</span>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {apiKeyInfo.model || 'Not set'}
                                </code>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Update API Keys Form */}
                        <form onSubmit={handleSubmitApiKeys(handleApiKeysSave)} className="space-y-6">
                          <div className="grid gap-6">
                           

                            <div className="space-y-2">
                              <Label htmlFor="openaiKey">New OpenAI API Key</Label>
                              <div className="relative">
                                <Input
                                  {...registerApiKeys('openaiKey', {
                                    onChange: (e) => validateOpenAIKey(e.target.value)
                                  })}
                                  type="password"
                                  id="openaiKey"
                                  placeholder="sk-..."
                                  className={`w-full pr-10 ${
                                    !openaiKeyValidation.isValid || apiKeyErrors.openaiKey 
                                      ? 'border-red-500' 
                                      : ''
                                  }`}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  {(!openaiKeyValidation.isValid || apiKeyErrors.openaiKey) && (
                                    <svg
                                      className="h-5 w-5 text-red-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              
                              {/* Error Message */}
                              {(!openaiKeyValidation.isValid || apiKeyErrors.openaiKey) && (
                                <p className="text-sm text-red-500">
                                  {openaiKeyValidation.error || apiKeyErrors.openaiKey?.message}
                                </p>
                              )}

                              {/* Help Text */}
                              <p className="text-xs text-gray-500">
                                Format: Must start with "sk-" and contain only letters, numbers, underscores, and hyphens
                              </p>
                            </div>

                            

                            <div className="space-y-2">
                              <Label htmlFor="falKey">New Fal AI Key</Label>
                              <div className="relative">
                                <Input
                                  {...registerApiKeys('falKey')}
                                  type="password"
                                  id="falKey"
                                  placeholder="fal_..."
                                  className={`w-full pr-20 ${apiKeyErrors.falKey ? 'border-red-500' : ''}`}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  {apiKeyErrors.falKey && (
                                    <svg 
                                      className="h-5 w-5 text-red-500" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              {apiKeyErrors.falKey && (
                                <p className="text-sm text-red-500 mt-1">
                                  {apiKeyErrors.falKey.message}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Format: fal_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Starts with 'fal_')
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="llmModel">LLM Model</Label>
                              <select
                                {...registerApiKeys('llmModel')}
                                className={`w-full rounded-md border ${apiKeyErrors.llmModel ? 'border-red-500' : 'border-gray-300'}`}
                              >
                                <option value="">Select a model</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                <option value="gpt-4">GPT-4</option>
                                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                              </select>
                              {apiKeyErrors.llmModel && (
                                <p className="text-sm text-red-500">{apiKeyErrors.llmModel.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end pt-6 border-t border-gray-100">
                            <Button 
                              type="submit" 
                              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white transition-colors duration-200"
                              disabled={isUpdatingKeys}
                            >
                              {isUpdatingKeys ? (
                                <div className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span>Updating...</span>
                                </div>
                              ) : 'Update Settings'}
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default SettingsPage;