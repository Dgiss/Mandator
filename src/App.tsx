
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import HomePage from "./pages/HomePage"; 
import MarketCreationPage from "./pages/MarketCreationPage";
import MarchesPage from "./pages/MarchesPage";
import MarcheDetailPage from "./pages/MarcheDetailPage";
import QuestionsReponsesPage from "./pages/QuestionsReponsesPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";

import { useEffect } from "react";
import { CRMProvider } from "./contexts/CRMContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import { trackPageView } from "./utils/analytics";

// Create query client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Router change handler component
const RouterChangeHandler = () => {
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

// Application main component with properly nested providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <AuthProvider>
          <CRMProvider>
            <BrowserRouter>
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
                  <Route path="/parametres" element={
                    <PrivateRoute>
                      <div className="container mx-auto p-6"><h1 className="text-2xl font-bold">Paramètres</h1></div>
                    </PrivateRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </TooltipProvider>
            </BrowserRouter>
          </CRMProvider>
        </AuthProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
