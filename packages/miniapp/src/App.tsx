import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WebApp from '@twa-dev/sdk';

// Pages
import { SplashPage } from './pages/SplashPage';
import { LegalConsentPage } from './pages/LegalConsentPage';
import { OnboardingPage } from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import DiaryPage from './pages/DiaryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import SettingsPage from './pages/SettingsPage';
import AddGlucosePage from './pages/AddGlucosePage';
import AddInsulinPage from './pages/AddInsulinPage';
import { 
  AddMealPage, 
  FeelingPage, 
  ActivityPage, 
  CreateReminderPage, 
  DiabetesProfilePage, 
  PremiumPage 
} from './pages/StubPages';
import { ReportsPage } from './pages/ReportsPage';
import { RemindersPage } from './pages/RemindersPage';

// Components
import BottomNav from './components/BottomNav';

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize Telegram WebApp
WebApp.ready();
WebApp.expand();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <main className="flex-1 overflow-y-auto">
            <Routes>
              {/* Public routes */}
              <Route path="/splash" element={<SplashPage />} />
              <Route path="/legal-consent" element={<LegalConsentPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Main app routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/diary" element={<DiaryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/ai-chat" element={<AIAssistantPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Feature routes */}
              <Route path="/add-glucose" element={<AddGlucosePage />} />
              <Route path="/add-insulin" element={<AddInsulinPage />} />
              <Route path="/add-meal" element={<AddMealPage />} />
              <Route path="/feeling" element={<FeelingPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/reminders" element={<RemindersPage />} />
              <Route path="/reminders/create" element={<CreateReminderPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/profile" element={<DiabetesProfilePage />} />
              <Route path="/diabetes-profile" element={<DiabetesProfilePage />} />
              <Route path="/premium" element={<PremiumPage />} />
            </Routes>
          </main>
          
          <BottomNavWrapper />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Helper component to conditionally show bottom nav
const BottomNavWrapper: React.FC = () => {
  const location = useLocation();
  const hideNavPaths = ['/splash', '/legal-consent', '/onboarding'];
  
  if (hideNavPaths.includes(location.pathname)) {
    return null;
  }
  
  return <BottomNav />;
};
