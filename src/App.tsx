import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {jwtDecode} from "jwt-decode";
import LandingPage from "./pages/LandingPage/LandingPage";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthRedirect from "./components/AuthRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeAuth, logout, setCredentials } from "./features/auth/authSlice";
import AIAssistantPage from "./pages/AIAssistant/AIAssistantPage";
import AnalyticsPage from "./pages/Analytics/AnalyticsPage";
import AuthPage from "./pages/Auth/AuthPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import PasswordResetPage from "./pages/Auth/PasswordResetPage";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";
import VerifyOTP from "./pages/Auth/VerifyOTP";
import BookTable from "./pages/Book/AllBookTable";
import CreateBook from "./pages/Book/CreateBook";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/Settings/SettingsPage";
import { RootState } from "./store/store";
import BookModel from "./components/BookModel/BookModel";
import "react-quill/dist/quill.snow.css";
import "./styles/editor.css";
import ChapterSummaryPage from "./pages/ChapterSummary/ChapterSummaryPage";
import PresentationSlidesPage from "./pages/PresentationSlides/PresentationSlidesPage";
import ChapterConfiguration from "./pages/Book/ChapterConfiguration";
import GenerateBookIdeas from "./pages/AIAssistant/GenerateBookIdeas";
import BookCoverDesign from "./pages/AIAssistant/BookCoverDesign";
import WritingAssistant from "./pages/AIAssistant/WritingAssistant";
import BookModal from "./pages/Book/BookModal";
import PaymentPage from "./pages/Settings/PaymentPage";
import SubscriptionPage from '@/pages/SubscriptionPage/SubscriptionPage';
import FreeSubscriptionsPage from "@/components/admin/FreeSubscriptionsPage";
import NotFoundPage from "./components/NotFound404";
import PackageManagementPage from "./pages/admin/PackageManagementPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AppRoutes() {
  const query = useQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);

  // Memoize query parameters
  const { accessToken, userParam } = useMemo(() => ({
    accessToken: query.get("accessToken"),
    userParam: query.get("user")
  }), [query]);

  // Handle authentication
  const handleAuthentication = useCallback(async () => {
    if (!accessToken) return;

    try {
      let parsedUser = null;
      if (userParam) {
        try {
          parsedUser = JSON.parse(userParam);
        } catch {
          parsedUser = userParam;
        }
      }

      // Set credentials in Redux store
      dispatch(setCredentials({ user: parsedUser, accessToken }));
      
      // Use navigate instead of window.location for better SPA experience
      navigate("/subscription", { replace: true });
      
    } catch (error) {
      console.error('Authentication failed:', error);
      // Handle error appropriately - you might want to show a toast or error message
    }
  }, [accessToken, userParam, dispatch, navigate]);

  useEffect(() => {
    handleAuthentication();
  }, [handleAuthentication]);

  // Initialize authentication state from local storage on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Check token expiration whenever the token changes
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode<{ exp: number }>(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Invalid token:", error);
        dispatch(logout());
      }
    }
  }, [token, dispatch]);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/" element={<LandingPage />} /> */}

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
          <Route path="/" element={<HomePage />} />
          <Route path="/books/add" element={<CreateBook />} />
          <Route path="/books/chapter-configuration" element={<ChapterConfiguration />} />
          <Route path="/books" element={<BookTable />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/ai-assistant/book-ideas" element={<GenerateBookIdeas />} />
          <Route path="/ai-assistant/cover-design" element={<BookCoverDesign />} />
          <Route path="/ai-assistant/writing" element={<WritingAssistant />} />
          <Route path="/payment" element={<PaymentPage />} />
          {user?.role === "admin" && <Route path="/analytics" element={<AnalyticsPage />} />}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/book-modal" element={<BookModel />} />
          <Route path="/book-modal/preview" element={<BookModal />} />
          <Route path="/chapter-summary" element={<ChapterSummaryPage />} />
          <Route path="/presentation-slides" element={<PresentationSlidesPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          {user?.role === "admin" && <Route path="/admin/packages" element={<PackageManagementPage />} />}
          {user?.role === "admin" && <Route path="/free-subscriptions" element={<FreeSubscriptionsPage />} />}
        </Route>

        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
