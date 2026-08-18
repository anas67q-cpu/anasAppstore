import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import LandingPage from './pages/LandingPage';
import MainApp from './pages/MainApp';
import LeaderboardPage from './pages/LeaderboardPage';
import TourPage from './pages/TourPage';
import QuestionPage from './pages/QuestionPage';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Show landing page for unauthenticated users; login triggered from its buttons
      return <LandingPage />;
    }
  }

  // Not authenticated yet (no token) — show landing page as the entry point
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/leaderboard" element={<MainApp overlayPage="leaderboard" />} />
      <Route path="/tour" element={<MainApp overlayPage="tour" />} />
      <Route path="/question" element={<MainApp overlayPage="question" />} />
      <Route path="/*" element={<MainApp />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App