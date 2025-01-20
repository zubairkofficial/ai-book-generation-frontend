import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LandingPage from './pages/LandingPage';
import CreateBook from './pages/Book/CreateBook';
import AuthPage from './pages/AuthPage';
import PasswordResetPage from './pages/PasswordResetPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';
import { initializeAuth } from './features/auth/authSlice';
import VerifyOTP from './pages/VerifyOTP';
import AIAssistantPage from './pages/AIAssistantPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import BookTable from './pages/Book/BookTable';

function App() {
  const dispatch = useDispatch();

  // Initialize authentication state from local storage when the app loads
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <ThemeProvider defaultTheme="light">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth: Sign In / Sign Up */}
          <Route
            path="/auth"
            element={
              <>
                <AuthRedirect />
                <AuthPage />
              </>
            }
          />

          {/* Forgot Password Page */}
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Password Reset Page */}
          <Route path="/auth/password-reset" element={<PasswordResetPage />} />

          {/* Verify OTP Page */}
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Verify Email Page */}
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/books/add" element={<CreateBook />} />
            <Route path="/books" element={<BookTable />} />
            <Route path="/home" element={<HomePage />} />

            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Not Found Page (Optional) */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;