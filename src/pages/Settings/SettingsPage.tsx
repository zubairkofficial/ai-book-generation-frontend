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

const SettingsPage = () => {
  const { data: userInfo } = useUserMeQuery();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const { addToast } = useToast(); // Use custom toast hook

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Populate form fields with user data
  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateUserPayload = {
      name,
      email,
    };

    try {
      await updateUser(payload).unwrap();
      addToast('Profile updated successfully!',ToastType.SUCCESS);
    } catch (error:any) {
      addToast(`Failed to update profile.${error.message}`,ToastType.ERROR);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match',ToastType.ERROR);
      return;
    }

    if (!oldPassword || !newPassword) {
      addToast('Please fill in all password fields',ToastType.ERROR);
      return;
    }

    const payload: UpdateUserPayload = {
      name: userInfo?.name || '',
      email: userInfo?.email || '',
      oldPassword,
      newPassword,
    };

    try {
      await updateUser(payload).unwrap();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password updated successfully!',ToastType.SUCCESS);
    } catch (error) {
      addToast('Failed to update password.',ToastType.ERROR);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="flex w-full rounded-t-xl border-b border-gray-200 bg-gray-50">
                  <TabsTrigger 
                    value="profile"
                    className="flex-1 px-4 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Information</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="password"
                    className="flex-1 px-4 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-amber-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Password</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="p-6">
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                      <Button 
                        type="submit" 
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm transition-colors duration-200"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Saving...</span>
                          </div>
                        ) : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="password" className="p-6">
                  <form onSubmit={handlePasswordSave} className="space-y-6">
                    <div className="grid gap-6 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword" className="text-sm font-medium text-gray-700">
                          Current Password
                        </Label>
                        <Input
                          id="oldPassword"
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          placeholder="Enter your current password"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          placeholder="Enter new password"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                      <Button 
                        type="submit" 
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm transition-colors duration-200"
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;