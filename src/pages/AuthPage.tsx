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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import zxcvbn from 'zxcvbn'; // For password strength validation
import { Loader2 } from 'lucide-react'; // For loading spinner

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [passwordStrength, setPasswordStrength] = useState(0); // Password strength score
  const [passwordMatchError, setPasswordMatchError] = useState(false); // State for password match error

  const dispatch = useDispatch();
  const [signUp] = useSignUpMutation();
  const [signIn] = useSignInMutation();
  const [resendVerification] = useResendVerificationMutation();
  const navigate = useNavigate();

  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Validate password strength
  const validatePassword = (password: string) => {
    const result = zxcvbn(password);
    setPasswordStrength(result.score); // Score ranges from 0 (weak) to 4 (strong)
    return result.score >= 3; // Require at least a "strong" password (score 3 or 4)
  };

  // Validate if password and confirm password match
  const validatePasswordMatch = () => {
    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      return false;
    }
    setPasswordMatchError(false);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowVerificationPrompt(false);

    // Validate password strength for signup
    if (!isLogin && !validatePassword(password)) {
      toast.warn('Password is too weak. Please choose a stronger password.');
      return;
    }

    // Validate password match for signup
    if (!isLogin && !validatePasswordMatch()) {
      toast.error('Passwords do not match. Please try again.');
      return;
    }

    setIsLoading(true); // Start loading

    try {
      if (isLogin) {
        const response: AuthResponse = await signIn({ email, password }).unwrap();

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
      } else {
        await signUp({ email, password, name, phoneNumber }).unwrap();
        toast.success('Account created successfully!');
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Authentication failed:', error);

      if (error?.status === 401) {
        toast.error('Invalid email or password. Please try again.');
      } else if (
        error.status === 401 &&
        error.data?.message === 'Please verify your email before logging in.'
      ) {
        setShowVerificationPrompt(true);
        toast.error('Please verify your email before logging in.');
      } else {
        toast.error(error?.data?.message || 'Something went wrong!');
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

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
      <ToastContainer /> {/* Add ToastContainer for react-toastify */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <BookOpenCheck className="h-8 w-8 text-amber-500" />
        <span className="text-2xl font-bold">Ai Book Legacy Generation</span>
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (!isLogin) validatePassword(e.target.value); // Validate password strength on change
              }}
              
            />
            {!isLogin && (
              <div className="text-sm text-gray-600">
                Password Strength: {['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][passwordStrength]}
              </div>
            )}
            {!isLogin && (
              <>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validatePasswordMatch(); // Validate password match on change
                  }}
                  
                />
                {passwordMatchError && (
                  <p className="text-sm text-red-600">Passwords do not match.</p>
                )}
              </>
            )}
          </div>

          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>

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