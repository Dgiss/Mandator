
import React, { createContext, useContext, useState } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  updateUserProfile
} from '@/services/authService';

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, user, profile, loading, authError, setProfile, refreshProfile } = useAuthState();
  const [loginInProgress, setLoginInProgress] = useState(false);

  // Sign in function with improved error handling
  const signIn = async (email: string, password: string) => {
    try {
      setLoginInProgress(true);
      const result = await signInWithEmail(email, password);
      
      // Convertir au format attendu par AuthContextType
      if (result.error) {
        return { error: result.error };
      } else {
        return { error: null, data: result.data };
      }
    } catch (error) {
      console.error("Unexpected error in sign-in:", error);
      return { error };
    } finally {
      setLoginInProgress(false);
    }
  };

  // Sign up function with improved error handling
  const signUp = async (
    email: string, 
    password: string, 
    userData?: { nom?: string; prenom?: string; entreprise?: string; email?: string }
  ) => {
    try {
      setLoginInProgress(true);
      const result = await signUpWithEmail(email, password, userData);
      
      // Convertir au format attendu par AuthContextType
      if (result.error) {
        return { error: result.error };
      } else {
        return { error: null, data: result.data };
      }
    } catch (error) {
      console.error("Unexpected error in sign-up:", error);
      return { error };
    } finally {
      setLoginInProgress(false);
    }
  };

  // Sign out function with improved state cleanup
  const signOut = async () => {
    try {
      // First update local state to prevent multiple logout attempts
      setProfile(null);
      
      // Then perform the actual signout
      await signOutUser();
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: { 
    nom?: string; prenom?: string; entreprise?: string; email?: string 
  }) => {
    if (!user) {
      return { error: { message: "Aucun utilisateur connecté" } };
    }

    const result = await updateUserProfile(user.id, data);
    
    // Convertir au format attendu par AuthContextType
    if (result.error) {
      return { error: result.error };
    } else {
      // Refresh profile in state if successful
      refreshProfile();
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        profile, 
        loading, 
        loginInProgress,
        authError,
        signIn, 
        signUp, 
        signOut, 
        updateProfile,
        refreshProfile
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
