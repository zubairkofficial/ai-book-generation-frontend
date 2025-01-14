import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
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
          <Route path={`/auth/password-reset`} element={<PasswordResetPage />} />
            {/* verify otp */}
          <Route path="/verify-otp" element={<VerifyOTP />} />
          {/* Verify Email Page */}
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>

        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
