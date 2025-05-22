
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Si l'authentification est en cours de chargement, afficher un indicateur de chargement avec le logo
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="w-16 h-16 mb-4 bg-gradient-to-br from-[#5743e9] to-[#7e69c5] flex items-center justify-center rounded-md">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <p className="text-lg font-medium">Chargement...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu protégé
  return <>{children}</>;
}
