
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import LoginPage from "./pages/LoginPage";
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
import { checkAuth } from "./utils/authUtils";

// Protected route component to ensure authentication
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = checkAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Define routes configuration with redirects
const routes = [
  { path: "/", element: <Navigate to="/home" replace /> },
  { path: "/home", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { 
    path: "/dashboard", 
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute> 
  },
  { 
    path: "/marches", 
    element: <ProtectedRoute><MarchesPage /></ProtectedRoute> 
  },
  { 
    path: "/marches/:id", 
    element: <ProtectedRoute><MarcheDetailPage /></ProtectedRoute> 
  },
  { 
    path: "/marches/creation", 
    element: <ProtectedRoute><MarketCreationPage /></ProtectedRoute> 
  },
  { 
    path: "/questions-reponses", 
    element: <ProtectedRoute><QuestionsReponsesPage /></ProtectedRoute> 
  },
  { 
    path: "/formulaires", 
    element: <ProtectedRoute><FormsPage /></ProtectedRoute> 
  },
  { 
    path: "/parametres", 
    element: <ProtectedRoute><div className="container mx-auto p-6"><h1 className="text-2xl font-bold">Paramètres</h1></div></ProtectedRoute> 
  },
  { path: "*", element: <NotFound /> }
];

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
                {routes.map((route) => (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={route.element} 
                  />
                ))}
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
