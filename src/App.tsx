
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { MarchesPage } from './pages/MarchesPage';
import { MarketCreationPage } from './pages/MarketCreationPage';
import { MarcheDetailPage } from './pages/MarcheDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './contexts/AuthContext';

const queryClient = new QueryClient();

function App() {
  const { session, user, loading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for the auth state to be initialized before rendering the app
    // This prevents a flash of unauthenticated content
    if (!loading) {
      setIsHydrated(true);
    }
  }, [loading]);

  if (!isHydrated) {
    // You can replace this with a loading spinner or any other appropriate UI
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
            <Route path="/marches" element={!user ? <Navigate to="/auth" replace /> : <MarchesPage />} />
            <Route path="/marches/create" element={!user ? <Navigate to="/auth" replace /> : <MarketCreationPage />} />
            <Route path="/marches/:id" element={!user ? <Navigate to="/auth" replace /> : <MarcheDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
