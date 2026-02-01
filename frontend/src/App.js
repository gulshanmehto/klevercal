import { useEffect, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MeetingTypesPage from "./pages/MeetingTypesPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import BookingsPage from "./pages/BookingsPage";
import ProfilePage from "./pages/ProfilePage";
import PublicBookingPage from "./pages/PublicBookingPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";

// Auth context
import { AuthProvider, useAuth } from "./context/AuthContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH


const ProtectedRoute = ({ children }) => {
  const { user, loading, checkAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(location.state?.user ? false : true);

  useEffect(() => {
    if (location.state?.user) {
      setIsChecking(false);
      return;
    }

    const verify = async () => {
      const authenticated = await checkAuth();
      setIsChecking(false);
      if (!authenticated) {
        navigate("/login");
      }
    };

    verify();
  }, [location.state, checkAuth, navigate]);

  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meeting-types"
        element={
          <ProtectedRoute>
            <MeetingTypesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/availability"
        element={
          <ProtectedRoute>
            <AvailabilityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <AIAssistantPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <IntegrationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/administrator-login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/book/:slug" element={<PublicBookingPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/api/calendar/google/callback" element={<GoogleCallbackPage />} />
      {/* Public Profile Route - Placed last to avoid conflicts */}
      <Route path="/:slug" element={<PublicProfilePage />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
