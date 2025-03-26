import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthRedirect from "./components/AuthRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeAuth, logout } from "./features/auth/authSlice"; // Import logout action
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
import { RootState } from "./store/store"; // Import RootState
import ResponsePage from "@/pages/ResponsePage/ResponsePage";
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

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  console.log("user", user?.role);
  // Initialize authentication state from local storage when the app loads
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Check token expiration whenever the token changes
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token) as { exp: number }; // Decode the token
      const currentTime = Date.now() / 1000; // Convert to seconds

      if (decodedToken.exp < currentTime) {
        dispatch(logout()); // Dispatch logout action
      }
    }
  }, [token, dispatch]);

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
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />

          {/* Password Reset Page */}
          <Route path="/auth/password-reset" element={<PasswordResetPage />} />

          {/* Verify OTP Page */}
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Verify Email Page */}
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/books/add" element={<CreateBook />} />
            <Route
              path="/books/chapter-configuration"
              element={<ChapterConfiguration />}
            />
            <Route path="/books" element={<BookTable />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/ai-assistant/book-ideas" element={<GenerateBookIdeas />} />
            <Route path="/ai-assistant/cover-design" element={<BookCoverDesign />} />
            <Route path="/ai-assistant/writing" element={<WritingAssistant />} />
            {user?.role === "admin" && (
              <Route path="/analytics" element={<AnalyticsPage />} />
            )}{" "}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/response" element={<ResponsePage />} />
            <Route path="/book-modal" element={<BookModel />} />
            <Route path="/book-modal/preview" element={<BookModal />} />
            <Route path="/chapter-summary" element={<ChapterSummaryPage />} />
            <Route
              path="/presentation-slides"
              element={<PresentationSlidesPage />}
            />
          </Route>

          {/* Response Page */}

          {/* 404 Not Found Page (Optional) */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right" // Position of the toast
          autoClose={3000} // Auto-close after 3 seconds
          hideProgressBar={false} // Show progress bar
          newestOnTop={false} // New toasts appear below older ones
          closeOnClick // Close toast on click
          rtl={false} // Left-to-right layout
          pauseOnFocusLoss // Pause toast when window loses focus
          draggable // Allow dragging to dismiss
          pauseOnHover // Pause toast on hover
          theme="light" // Light or dark theme
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
