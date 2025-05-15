
import React, { createContext, useContext, useState } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  updateUserProfile,
  fetchUserProfile 
} from '@/services/authService';

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, user, profile, loading, setProfile } = useAuthState();
  const [loginInProgress, setLoginInProgress] = useState(false);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoginInProgress(true);
      const result = await signInWithEmail(email, password);
      return result;
    } finally {
      setLoginInProgress(false);
    }
  };

  // Sign up function
  const signUp = async (
    email: string, 
    password: string, 
    userData?: { nom?: string; prenom?: string; entreprise?: string; email?: string }
  ) => {
    try {
      setLoginInProgress(true);
      return await signUpWithEmail(email, password, userData);
    } finally {
      setLoginInProgress(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    // First update local state to prevent multiple logout attempts
    setProfile(null);
    
    // Then perform the actual signout
    await signOutUser();
  };

  // Update profile function
  const updateProfile = async (data: { 
    nom?: string; prenom?: string; entreprise?: string; email?: string 
  }) => {
    if (!user) {
      return { error: { message: "Aucun utilisateur connecté" } };
    }

    const result = await updateUserProfile(user.id, data);
    
    if (!result.error) {
      // Update profile in state if successful
      const { data: updatedProfile } = await fetchUserProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    }
    
    return result;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        profile, 
        loading, 
        loginInProgress,
        signIn, 
        signUp, 
        signOut, 
        updateProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Utility hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
