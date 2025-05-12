import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import HomePage from "./pages/HomePage"; 
import MarketCreationPage from "./pages/MarketCreationPage";
import MarchesPage from "./pages/MarchesPage";
import MarcheDetailPage from "./pages/MarcheDetailPage";
import QuestionsReponsesPage from "./pages/QuestionsReponsesPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";

import { useEffect } from "react";
import { CRMProvider } from "./contexts/CRMContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import { trackPageView } from "./utils/analytics";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Router change handler component
const RouterChangeHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Track page view for analytics
    const currentPath = window.location.pathname;
    const pageName = currentPath === '/' ? 'home' : currentPath.replace(/^\//, '');
    trackPageView(pageName);
  }, [location.pathname]);
  
  return null;
};

// Import the AI Assistant Provider
import { AIAssistantProvider } from '@/components/layout/AIAssistantProvider';

// Application main component with properly nested providers
function App() {
  return (
    // Wrap the entire app with AIAssistantProvider
    <AIAssistantProvider>
      <AppSettingsProvider>
        <AuthProvider>
          <CRMProvider>
            <TooltipProvider>
              <RouterChangeHandler />
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/marches" element={<PrivateRoute><MarchesPage /></PrivateRoute>} />
                <Route path="/marches/:id" element={<PrivateRoute><MarcheDetailPage /></PrivateRoute>} />
                <Route path="/marches/creation" element={<PrivateRoute><MarketCreationPage /></PrivateRoute>} />
                <Route path="/questions-reponses" element={<PrivateRoute><QuestionsReponsesPage /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
                <Route path="/parametres" element={
                  <PrivateRoute>
                    <div className="container mx-auto p-6"><h1 className="text-2xl font-bold">Paramètres</h1></div>
                  </PrivateRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </TooltipProvider>
          </CRMProvider>
        </AuthProvider>
      </AppSettingsProvider>
    </AIAssistantProvider>
  );
}

export default App;
