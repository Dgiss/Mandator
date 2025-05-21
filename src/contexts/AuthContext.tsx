
import React, { createContext, useContext, useState } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  updateUserProfile
} from '@/services/authService';
import { toast } from 'sonner';

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, user, profile, loading, authError, setProfile, refreshProfile } = useAuthState();
  const [loginInProgress, setLoginInProgress] = useState(false);

  // Sign in function with improved error handling
  const signIn = async (email: string, password: string) => {
    try {
      setLoginInProgress(true);
      console.log("Starting sign-in process for:", email);
      
      const result = await signInWithEmail(email, password);
      
      // Handle sign-in error
      if (result.error) {
        console.error("Sign-in error:", result.error);
        const errorMessage = result.error.message || "Erreur de connexion";
        toast.error(errorMessage);
        return { error: result.error };
      } else {
        console.log("Sign-in successful:", result.data);
        toast.success("Connexion réussie");
        return { error: null, data: result.data };
      }
    } catch (error: any) {
      console.error("Unexpected error in sign-in:", error);
      toast.error("Erreur inattendue lors de la connexion");
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
      console.log("Starting sign-up process for:", email);
      
      const result = await signUpWithEmail(email, password, userData);
      
      // Handle sign-up error or success
      if (result.error) {
        console.error("Sign-up error:", result.error);
        const errorMessage = result.error.message || "Erreur lors de l'inscription";
        toast.error(errorMessage);
        return { error: result.error };
      } else {
        console.log("Sign-up successful:", result.data);
        
        // Check if email verification is required
        if (result.data?.user && !result.data.user.email_confirmed_at) {
          toast.success("Inscription réussie ! Veuillez confirmer votre email.");
        } else {
          toast.success("Inscription réussie !");
        }
        
        return { error: null, data: result.data };
      }
    } catch (error: any) {
      console.error("Unexpected error in sign-up:", error);
      toast.error("Erreur inattendue lors de l'inscription");
      return { error };
    } finally {
      setLoginInProgress(false);
    }
  };

  // Sign out function with improved state cleanup
  const signOut = async () => {
    try {
      console.log("Starting sign-out process");
      
      // First update local state to prevent multiple logout attempts
      setProfile(null);
      
      // Then perform the actual signout
      const result = await signOutUser();
      
      if (result.error) {
        console.error("Sign-out error:", result.error);
        toast.error("Erreur lors de la déconnexion");
        throw result.error;
      } else {
        console.log("Sign-out successful");
        toast.success("Vous avez été déconnecté");
      }
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
      toast.error("Aucun utilisateur connecté");
      return { error: { message: "Aucun utilisateur connecté" } };
    }

    console.log("Updating profile for user:", user.id);
    const result = await updateUserProfile(user.id, data);
    
    // Handle profile update error or success
    if (result.error) {
      console.error("Profile update error:", result.error);
      toast.error("Erreur lors de la mise à jour du profil");
      return { error: result.error };
    } else {
      // Refresh profile in state if successful
      console.log("Profile update successful");
      toast.success("Profil mis à jour avec succès");
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
