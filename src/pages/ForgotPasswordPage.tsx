import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Example RTK-Query hook for forgot password
// You need to create this in your authApi (or similar) file.
import { useResetPasswordMutation } from '@/api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Make an API call to send password reset instructions
      await forgotPassword({ email }).unwrap();
      toast.success('Password reset link sent to your email.');
      navigate('/auth'); // or wherever you want to redirect the user
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.data.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
          <p className="text-gray-600">
            Enter your email to receive reset instructions
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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
