
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Si l'authentification est en cours de chargement, afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement...</p>
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
