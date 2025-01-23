import { useState } from 'react';
import { useSignInMutation } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import * as yup from 'yup';

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

  const dispatch = useDispatch();
  const [signIn] = useSignInMutation();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate the form data against the schema
      await signInSchema.validate({ email, password }, { abortEarly: false });
      setErrors({}); // Clear any previous errors

      setIsLoading(true);

      // Call the sign-in API
      const response = await signIn({ email, password }).unwrap();

      if (response?.message === 'OTP sent to your email. Please verify to log in.') {
        navigate(`/verify-otp`, { state: { email } });
        toast.info('Please verify your OTP to log in.');
      } else if (response?.accessToken) {
        dispatch(setCredentials(response));
        navigate('/home');
        toast.success('Logged in successfully!');
      } else {
        toast.error('Unexpected response. Please try again.');
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

        // Display the first validation error using toast
        
      } else {
        // Handle API errors
        console.error('Sign-in failed:', error);
        toast.error(error?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Email Field */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
              errors.email ? 'focus:ring-red-500 border-red-500' : 'focus:ring-amber-400'
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`border rounded-md p-2 focus:outline-none focus:ring-2 ${
              errors.password ? 'focus:ring-red-500 border-red-500' : 'focus:ring-amber-400'
            }`}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-600 rounded-md shadow-md transition duration-200"
        disabled={isLoading}
      >
        {isLoading ? <Loader /> : 'Sign In'}
      </Button>

      {/* Forgot Password Link */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          <a
            href="/auth/forgot-password"
            className="text-amber-600 hover:underline"
          >
            Forgot password?
          </a>
        </p>
      </div>
    </form>
  );
}