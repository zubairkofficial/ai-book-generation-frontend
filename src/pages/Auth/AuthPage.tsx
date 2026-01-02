// pages/AuthPage.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpenCheck, BookOpen, Sparkles, Brain, Rocket, Globe } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignIn from './SignIn';
import SignUp from './SignUp';
import '../../styles/globals.css';
import { useEffect } from 'react';

export default function AuthPage() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (location.state?.view === 'signup') {
      setIsLogin(false);
    } else if (location.state?.view === 'login') {
      setIsLogin(true);
    }
  }, [location.state]);

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-amber-500" />,
      title: "AI-Powered Book Creation",
      description: "Transform your ideas into complete books with advanced AI assistance"
    },
    {
      icon: <Brain className="h-8 w-8 text-amber-500" />,
      title: "Smart Content Generation",
      description: "Generate chapters, plots, and characters intelligently"
    },
    {
      icon: <Globe className="h-8 w-8 text-amber-500" />,
      title: "Global Publishing",
      description: "Share your stories with readers worldwide"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Form Section (30%) */}
      <div className="w-full md:w-[30%] p-8 flex flex-col justify-center">
        <Link to="/home" className="flex items-center gap-2 mb-8">
          <BookOpenCheck className="h-8 w-8 text-amber-500" />
          <span className="text-2xl font-bold">AI BOOK LEGACY</span>
        </Link>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-600">
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-amber-500 hover:underline font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {isLogin ? <SignIn /> : <SignUp />}
      </div>

      {/* Enhanced Graphic Section (70%) */}
      <div className="hidden md:flex w-[70%] bg-gradient-to-br from-amber-50 to-amber-100 p-12 flex-col justify-center items-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-float">
            <BookOpen className="h-16 w-16" />
          </div>
          <div className="absolute bottom-10 right-10 animate-float-delayed">
            <Sparkles className="h-16 w-16" />
          </div>
          <div className="absolute top-1/2 right-1/4 animate-float">
            <Rocket className="h-16 w-16" />
          </div>
        </div>

        <div className="max-w-2xl text-center z-10">
          <h1 className="text-4xl font-bold mb-6 pb-2 bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
            Create Amazing Books with AI
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Unleash your creativity with our AI-powered book generation platform.
            Turn your ideas into professionally crafted stories in minutes.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>


        </div>
      </div>

      <ToastContainer />
    </div>
  );
}