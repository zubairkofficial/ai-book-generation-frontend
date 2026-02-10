import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Mail, Lock, Image, Cpu } from 'lucide-react';
import { baseApi } from '@/api/baseApi';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Create a new API endpoint for admin user creation
const adminCreateUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminCreateUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/admin-create-user',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

const { useAdminCreateUserMutation } = adminCreateUserApi;

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { addToast } = useToast();
  const [createUser, { isLoading }] = useAdminCreateUserMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        ...formData,
        isEmailVerified: true,
      }).unwrap();

      addToast(
        'User created successfully',
        ToastType.SUCCESS,
      );

      setFormData({
        name: '',
        email: '',
        password: '',
      });
      onClose();
    } catch (error: any) {
      addToast(
        error?.data?.message || 'Failed to create user',
        ToastType.ERROR,
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-t-lg -mt-4 -mx-4 mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            Create New User
          </DialogTitle>
          <DialogDescription className="text-amber-100 mt-1">
            Create a new user with verified email and subscription credits
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Full Name</Label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter user's name"
                  className="pl-9 focus:border-amber-500 focus:ring-amber-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter user's email"
                  className="pl-9 focus:border-amber-500 focus:ring-amber-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter user's password"
                  className="pl-9 focus:border-amber-500 focus:ring-amber-200"
                  required
                />
              </div>
            </div>


          </div>

          <DialogFooter className="gap-2 sm:gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 min-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal; 