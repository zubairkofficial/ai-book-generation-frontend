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
import { ToastType } from '@/constant';
import { useFetchApiKeysQuery, useUpdateApiKeysMutation } from '@/api/apiKeysApi';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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
  openaiKey: yup.string()
    .test('is-empty-or-valid', 'Invalid OpenAI API key format', function(value) {
      // Allow empty string (no changes to existing key)
      if (!value) return true;
      // Validate format if value is provided - allows for longer keys with special characters
      return /^sk-[a-zA-Z0-9_-]+$/i.test(value);
    })
    .transform((value) => value || null)
    .nullable()
    .test('prefix', 'API key must start with "sk-"', (value) => {
      if (!value) return true;
      return value.startsWith('sk-');
    })
    .test('min-length', 'API key must be at least 51 characters', (value) => {
      if (!value) return true;
      return value.length >= 51;
    }),
  dalleKey: yup.string()
    .test('is-empty-or-valid', 'Invalid DALL-E API key format', function(value) {
      if (!value) return true;
      return /^sk-[a-zA-Z0-9_-]+$/i.test(value);
    })
    .transform((value) => value || null)
    .nullable()
    .test('prefix', 'API key must start with "sk-"', (value) => {
      if (!value) return true;
      return value.startsWith('sk-');
    })
    .test('min-length', 'API key must be at least 51 characters', (value) => {
      if (!value) return true;
      return value.length >= 51;
    }),
  llmModel: yup.string()
    .required('Please select a model'),
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
  openaiKey?: string | null;
  dalleKey?: string | null;
  llmModel?: string;
}


// Add interface for API keys payload
interface UpdateApiKeysPayload {
  model: string;
  openai_key?: string;
  dalle_key?: string;
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
      openaiKey: '',
      dalleKey: '',
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
      // Validate key formats before submitting
      if (data.openaiKey) {
        try {
          await apiKeysSchema.validateAt('openaiKey', { openaiKey: data.openaiKey });
        } catch (error) {
          throw new Error('Invalid OpenAI API key format');
        }
      }
      
      if (data.dalleKey) {
        try {
          await apiKeysSchema.validateAt('dalleKey', { dalleKey: data.dalleKey });
        } catch (error) {
          throw new Error('Invalid DALL-E API key format');
        }
      }

      // Create payload with correct types
      const payload: UpdateApiKeysPayload = {
        model: data.llmModel??'gpt-3.5-turbo',
        ...(data.openaiKey && { openai_key: data.openaiKey }),
        ...(data.dalleKey && { dalle_key: data.dalleKey }),
      };

      await updateApiKeys(payload).unwrap();
      resetApiKeys();
      addToast('API keys updated successfully!', ToastType.SUCCESS);
    } catch (error: any) {
      addToast(`Failed to update API keys: ${error.message}`, ToastType.ERROR);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-2 sm:py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Improved mobile spacing */}
          <div className="mb-4 sm:mb-8 px-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow overflow-hidden">
            <Tabs defaultValue="profile" className="w-full">
              {/* Tabs Navigation - Enhanced Mobile Design */}
              <TabsList className="w-full border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-3 w-full">
                  <TabsTrigger 
                    value="profile" 
                    className="flex-1 py-2.5 sm:py-4 text-xs sm:text-sm font-medium 
                      border-b-2 border-transparent
                      text-gray-500 hover:text-gray-700 hover:border-gray-300
                      data-[state=active]:border-amber-500 data-[state=active]:text-amber-600
                      transition-all duration-200 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 sm:h-5 sm:w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs whitespace-nowrap">Profile</span>
                    </div>
                  </TabsTrigger>

                  <TabsTrigger 
                    value="password"
                    className="flex-1 py-2.5 sm:py-4 text-xs sm:text-sm font-medium 
                      border-b-2 border-transparent
                      text-gray-500 hover:text-gray-700 hover:border-gray-300
                      data-[state=active]:border-amber-500 data-[state=active]:text-amber-600
                      transition-all duration-200 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 sm:h-5 sm:w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs whitespace-nowrap">Password</span>
                    </div>
                  </TabsTrigger>

                  {userInfo?.role === 'admin' && (
                    <TabsTrigger 
                      value="api-keys"
                      className="flex-1 py-2.5 sm:py-4 text-xs sm:text-sm font-medium 
                        border-b-2 border-transparent
                        text-gray-500 hover:text-gray-700 hover:border-gray-300
                        data-[state=active]:border-amber-500 data-[state=active]:text-amber-600
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 sm:h-5 sm:w-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span className="text-[10px] sm:text-xs whitespace-nowrap">API Keys</span>
                      </div>
                    </TabsTrigger>
                  )}
                </div>
              </TabsList>

              {/* Tabs Content - Improved Mobile Layout */}
              <div className="p-2 sm:p-4 md:p-6">
                <TabsContent value="profile">
                  <div className="animate-in fade-in-50 duration-500">
                    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                      {/* Profile Section Header */}
                      <div className="mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Profile Information</h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600">
                          Update your personal information
                        </p>
                      </div>

                      {/* Profile Form */}
                      <form onSubmit={handleSubmitProfile(handleProfileSave)} className="space-y-4 sm:space-y-6">
                        <div className="grid gap-4 sm:gap-6">
                          {/* Name Input */}
                          <div className="space-y-1.5">
                            <Label 
                              htmlFor="name" 
                              className="text-xs sm:text-sm font-medium text-gray-700"
                            >
                              Full Name
                            </Label>
                            <Input
                              {...registerProfile('name')}
                              id="name"
                              className="text-sm sm:text-base"
                              placeholder="Enter your name"
                            />
                            {profileErrors.name && (
                              <p className="text-xs text-red-500 mt-1">{profileErrors.name.message}</p>
                            )}
                          </div>

                          {/* Email Input */}
                          <div className="space-y-1.5">
                            <Label 
                              htmlFor="email" 
                              className="text-xs sm:text-sm font-medium text-gray-700"
                            >
                              Email Address
                            </Label>
                            <Input
                              {...registerProfile('email')}
                              id="email"
                              type="email"
                              className="text-sm sm:text-base bg-gray-50"
                              disabled
                            />
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-100">
                          <Button
                            type="submit"
                            className="w-full sm:w-auto min-w-[120px] h-9 sm:h-10
                              bg-amber-500 hover:bg-amber-600 text-white
                              text-xs sm:text-sm font-medium
                              transition-colors duration-200"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
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
                                <span className="text-sm text-gray-600">DALL-E API Key:</span>
                                <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                                  {apiKeyInfo.dalle_key ? 
                                    `${apiKeyInfo.dalle_key.substring(0, 4)}...${apiKeyInfo.dalle_key.slice(-4)}` : 
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
                            {/* OpenAI API Key Input */}
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
                              <Label htmlFor="dalleKey">New DALL-E API Key</Label>
                              <div className="relative">
                                <Input
                                  {...registerApiKeys('dalleKey')}
                                  type="password"
                                  id="dalleKey"
                                  placeholder="Leave empty to keep current key"
                                  className={`w-full pr-20 ${apiKeyErrors.dalleKey ? 'border-red-500' : ''}`}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  {apiKeyErrors.dalleKey && (
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
                              {apiKeyErrors.dalleKey && (
                                <p className="text-sm text-red-500 mt-1">
                                  {apiKeyErrors.dalleKey.message}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Format: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (51 characters)
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
      </div>
    </Layout>
  );
};

export default SettingsPage;