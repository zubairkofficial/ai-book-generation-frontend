import { useState } from 'react';
import { useSignInMutation } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import { Eye, EyeOff } from 'lucide-react';
import * as yup from 'yup';
import { useToast } from '@/context/ToastContext'; // Import custom toast hook
import ToastContainer from '@/components/Toast/ToastContainer';
import { ToastType } from '@/constant';

// Define the validation schema using yup
const signInSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address.')
    .required('Email is required.'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters long.')
    .required('Password is required.'),
});

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const [signIn] = useSignInMutation();
  const navigate = useNavigate();
  const { addToast } = useToast(); // Use custom toast hook

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate the form data against the schema
      await signInSchema.validate({ email, password }, { abortEarly: false });
      setErrors({}); // Clear any previous errors

      setIsLoading(true);

      // Call the sign-in API
      const response: any = await signIn({ email, password }).unwrap();

      if (response?.message === 'OTP sent to your email. Please verify to log in.') {
        navigate(`/verify-otp`, { state: { email } });
        addToast('Please verify your OTP to log in.', ToastType.WARNING); // Custom toast
      } else if (response?.accessToken) {
        dispatch(setCredentials(response));
        navigate('/home');
        addToast('Logged in successfully!', ToastType.SUCCESS); // Custom toast
      } else {
        addToast('Unexpected response. Please try again.', ToastType.ERROR); // Custom toast
      }
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        // Handle validation errors
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err: yup.ValidationError) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        // Handle API errors
        console.error('Sign-in failed:', error);
        addToast(error?.data?.message || 'Invalid email or password. Please try again.', ToastType.ERROR); // Custom toast
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <ToastContainer /> {/* Add custom ToastContainer */}
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2 relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full ${
              errors.password ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 top-6 text-amber-500 right-3 flex items-center "
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border-gray-300 text-amber-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>
          <a
            href="/auth/forgot-password"
            className="text-sm text-amber-500 hover:underline"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-600"
        disabled={isLoading}
      >
        {isLoading ? <Loader /> : 'Sign in'}
      </Button>
    </form>
  );
}