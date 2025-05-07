
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import HomePage from "./pages/HomePage"; 
import DashboardPage from "./pages/DashboardPage";
import MarketCreationPage from "./pages/MarketCreationPage";
import FormsPage from "./pages/FormsPage";
import MarchesPage from "./pages/MarchesPage";
import MarcheDetailPage from "./pages/MarcheDetailPage";
import QuestionsReponsesPage from "./pages/QuestionsReponsesPage";
import NotFound from "./pages/NotFound";

import { useEffect } from "react";
import { CRMProvider } from "./contexts/CRMContext";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";
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
        <CRMProvider>
          <BrowserRouter>
            <TooltipProvider>
              <RouterChangeHandler />
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/marches" element={<MarchesPage />} />
                <Route path="/marches/:id" element={<MarcheDetailPage />} />
                <Route path="/marches/creation" element={<MarketCreationPage />} />
                <Route path="/questions-reponses" element={<QuestionsReponsesPage />} />
                <Route path="/formulaires" element={<FormsPage />} />
                <Route path="/parametres" element={
                  <div className="container mx-auto p-6"><h1 className="text-2xl font-bold">Paramètres</h1></div>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </TooltipProvider>
          </BrowserRouter>
        </CRMProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
