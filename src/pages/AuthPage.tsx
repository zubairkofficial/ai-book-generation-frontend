// pages/AuthPage.tsx
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { BookOpenCheck } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignIn from './Auth/SignIn';
import SignUp from './Auth/SignUp';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Replace with your authentication logic
      if (isLogin) {
        // Simulate API call for login
        await simulateApiCall(data);
        toast.success('Login successful!');
      } else {
        // Simulate API call for signup
        await simulateApiCall(data);
        toast.success('Account created successfully!');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const simulateApiCall = (data: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Here you'd handle the success/error from your API
        if (data.email) {
          resolve(true);
        } else {
          reject(new Error('Invalid data'));
        }
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <ToastContainer />
      <Link to="/" className="flex items-center gap-2 mb-8">
        <BookOpenCheck className="h-8 w-8 text-amber-500" />
        <span className="text-2xl font-bold">Ai Book Legacy Generation</span>
      </Link>

      <Card className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Enter your details to access your account' : 'Start your writing journey today'}
          </p>
        </div>

        {isLogin ? (
          <SignIn onSubmit={handleSubmit} loading={loading} />
        ) : (
          <SignUp onSubmit={handleSubmit} loading={loading} />
        )}

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-amber-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </Card>
    </div>
  );
}