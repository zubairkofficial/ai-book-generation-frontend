import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

// Example RTK-Query hook for changing password
import { usePasswordResetMutation } from '@/api/authApi';

export default function PasswordResetPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [changePassword, { isLoading }] = usePasswordResetMutation();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from the query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Invalid or missing token.');
      navigate('/auth');
    }
  }, [location.search, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
  
    try {
      // Make an API call to change the password
      await changePassword({ token, newPassword }).unwrap();
      toast.success('Password changed successfully.');
      navigate('/auth'); // Redirect to login page
    } catch (error) {
      console.error('Change password error:', error);
  
      // Check for validation errors
      if (error?.data?.message?.errors) {
        const validationErrors = error.data.message.errors;
        validationErrors.forEach((err) => {
          const field = err.property; // Field with the error
          const constraints = Object.values(err.constraints).join(', '); // Combine all validation messages
          toast.error(`${field}: ${constraints}`); // Show toast for each error
        });
      } else {
        // Generic error message
        toast.error(error?.data?.message || 'Something went wrong.');
      }
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
          <p className="text-gray-600">
            Enter and confirm your new password to reset it.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <div className="text-center mt-6">
            <Link to="/auth" className="text-sm text-amber-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}