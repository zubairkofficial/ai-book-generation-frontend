import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpenCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useSignUpMutation, useSignInMutation, useResendVerificationMutation, AuthResponse } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';
import { toast } from 'react-toastify';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const dispatch = useDispatch();
  const [signUp] = useSignUpMutation();
  const [signIn] = useSignInMutation();
  const [resendVerification] = useResendVerificationMutation(); // New resend verification hook
  const navigate = useNavigate();

  // This state handles showing the "Please verify your email" UI
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowVerificationPrompt(false); // Reset verification prompt

    try {
      if (isLogin) {
        // Call signIn mutation
        const response: AuthResponse = await signIn({ email, password }).unwrap();

        // Handle response based on backend behavior
        if (response?.message === 'OTP sent to your email. Please verify to log in.') {
          // Navigate to OTP verification screen
          navigate(`/verify-otp`, { state: { email } });
          toast.info('Please verify your OTP to log in.');
        } else if (response?.accessToken) {
          // Save user credentials to Redux
          dispatch(setCredentials(response));
          // Navigate to home page after successful login
          navigate('/home');
          toast.success('Logged in successfully!');
        } else {
          // Handle unexpected response structure
          toast.error('Unexpected response. Please try again.');
        }
      } else {
        // Handle signup flow
        await signUp({ email, password, name, phoneNumber }).unwrap();
        toast.success('Account created successfully!');
        navigate('/home'); // Redirect to home page after signup
      }
    } catch (error: any) {
      console.error('Authentication failed:', error);

      // Handle validation errors
      if (error?.status === 401) {
        // Unauthorized (invalid credentials)
        toast.error('Invalid email or password. Please try again.');
      } else if (
        error.status === 401 &&
        error.data?.message === 'Please verify your email before logging in.'
      ) {
        // Handle unverified email case
        setShowVerificationPrompt(true);
        toast.error('Please verify your email before logging in.');
      } else {
        // Handle generic errors
        toast.error(error?.data?.message || 'Something went wrong!');
      }
    }
  };

  // Handle re-sending the verification link
  const handleResendVerification = async () => {
    try {
      await resendVerification({ email }).unwrap();
      toast.success('Verification link sent to your email!');
    } catch (error: any) {
      console.error('Resend verification failed:', error);
      toast.error(error.data?.message || 'Could not resend verification link.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <BookOpenCheck className="h-8 w-8 text-amber-500" />
        <span className="text-2xl font-bold">Ai Book Generation</span>
      </Link>

      <Card className="w-full max-w-md p-8 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-600">
            {isLogin
              ? 'Enter your details to access your account'
              : 'Start your writing journey today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            {!isLogin && (
              <>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </>
            )}
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Forgot Password Link */}
          {isLogin && (
            <div className="text-center mt-2">
              <Link to="/auth/forgot-password" className="text-sm text-amber-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
          )}

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-amber-600 hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>

        {/* Show Resend Verification UI if email is unverified */}
        {showVerificationPrompt && (
          <div className="mt-6 text-center">
            <p className="text-red-600 font-medium">
              Please verify your email before logging in.
            </p>
            <Button
              onClick={handleResendVerification}
              className="mt-2 bg-amber-500 hover:bg-amber-600"
            >
              Resend Verification Email
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}