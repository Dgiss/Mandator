
// We need to fix line 253 where there's a type mismatch
// The function is trying to return a Promise<string> where a string is expected

// Find the specific section in the function that has the issue and fix it
// This is likely in the changePassword function

import { supabase } from '@/lib/supabase';
import { UserProfileData } from '@/types/auth';
import { toast } from 'sonner';

/**
 * Maximum number of retry attempts for auth operations
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Delay between retry attempts (in ms)
 */
const RETRY_DELAY = 1000;

/**
 * Helper function to implement retry logic for auth operations
 */
const withRetry = async (operation: () => Promise<any>, retries = MAX_RETRY_ATTEMPTS) => {
  try {
    return await operation();
  } catch (error: any) {
    console.error("Auth operation error:", error);
    
    // Check if error is retryable and we have retries left
    if (
      retries > 0 && 
      (error.name === "AuthRetryableFetchError" || 
       error.message?.includes("network") || 
       error.status === 503 || 
       error.status === 429)
    ) {
      console.log(`Retrying auth operation. Attempts remaining: ${retries-1}`);
      
      // Wait for delay and retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return withRetry(operation, retries - 1);
    }
    
    // If not retryable or out of retries, rethrow
    throw error;
  }
};

/**
 * Connexion avec email et mot de passe
 * Amélioration de la gestion des erreurs avec mécanisme de retry
 * @param email Email de l'utilisateur
 * @param password Mot de passe
 * @returns Le résultat de la connexion
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Attempting to sign in with email:", email);
    
    const { data, error } = await withRetry(async () => {
      return await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
    });
    
    if (error) {
      console.error("Error during sign in:", error);
      return { error };
    }
    
    console.log("Sign in successful:", data);
    return { data };
  } catch (err) {
    console.error("Exception in signInWithEmail:", err);
    
    // Improve error message for better user experience
    let userMessage = "Erreur de connexion. Veuillez réessayer.";
    
    if (err instanceof Error) {
      if (err.name === "AuthRetryableFetchError" || 
          err.message?.includes("network") ||
          err.message?.includes("timeout")) {
        userMessage = "Problème de connexion au serveur d'authentification. Vérifiez votre connexion internet et réessayez.";
      } else if (err.message?.includes("credentials")) {
        userMessage = "Email ou mot de passe incorrect.";
      }
    }
    
    return { error: { message: userMessage, originalError: err } };
  }
};

/**
 * Inscription avec email, mot de passe et données utilisateur
 * Version améliorée avec gestion des erreurs et retry
 * @param email Email de l'utilisateur
 * @param password Mot de passe
 * @param userData Données supplémentaires (nom, prénom, etc.)
 * @returns Le résultat de l'inscription
 */
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData?: UserProfileData
) => {
  try {
    console.log("Attempting to sign up with email:", email);
    
    const { data, error } = await withRetry(async () => {
      return await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            role_global: 'STANDARD' // Par défaut, tous les nouveaux utilisateurs sont standard
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
    });
    
    if (error) {
      console.error("Error during sign up:", error);
      return { error };
    }
    
    // 2. Si l'inscription réussit mais que l'utilisateur n'est pas confirmé
    // Nous indiquons à l'utilisateur qu'il doit confirmer son email
    if (data.user && !data.user.email_confirmed_at) {
      console.log("User created but email not confirmed. Check your inbox.");
    }
    
    console.log("Sign up successful:", data);
    return { data };
  } catch (err) {
    console.error("Exception in signUpWithEmail:", err);
    
    // Improve error message for better user experience
    let userMessage = "Erreur lors de l'inscription. Veuillez réessayer.";
    
    if (err instanceof Error) {
      if (err.name === "AuthRetryableFetchError" || 
          err.message?.includes("network") ||
          err.message?.includes("timeout")) {
        userMessage = "Problème de connexion au serveur d'authentification. Vérifiez votre connexion internet et réessayez.";
      } else if (err.message?.includes("User already registered")) {
        userMessage = "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.";
      }
    }
    
    return { error: { message: userMessage, originalError: err } };
  }
};

/**
 * Déconnexion avec gestion améliorée des erreurs
 * @returns Le résultat de la déconnexion
 */
export const signOutUser = async () => {
  try {
    console.log("Attempting to sign out");
    
    const { error } = await withRetry(async () => {
      return await supabase.auth.signOut();
    });
    
    if (error) {
      console.error("Error during sign out:", error);
      return { error };
    }
    
    console.log("Sign out successful");
    return { error: null, success: true };
  } catch (err) {
    console.error("Exception in signOutUser:", err);
    toast.error("Erreur lors de la déconnexion. Veuillez réessayer.");
    return { error: err };
  }
};

/**
 * Mise à jour du profil utilisateur
 * @param userId ID de l'utilisateur
 * @param data Données à mettre à jour
 * @returns Le résultat de la mise à jour
 */
export const updateUserProfile = async (userId: string, data: UserProfileData) => {
  try {
    console.log(`Updating profile for user ${userId}:`, data);
    
    // Mettre à jour le profil dans la base de données
    const { error } = await withRetry(async () => {
      return await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
    });
    
    if (error) {
      console.error("Error updating profile:", error);
      return { error };
    }
    
    console.log("Profile update successful");
    return { error: null, success: true };
  } catch (err) {
    console.error("Exception in updateUserProfile:", err);
    return { error: err };
  }
};

/**
 * Récupération des données du profil utilisateur avec gestion améliorée des erreurs
 * @param userId ID de l'utilisateur
 * @returns Les données du profil utilisateur
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log(`Fetching profile for user ${userId}`);
    
    // Récupérer le profil de l'utilisateur dans la base de données
    const { data, error } = await withRetry(async () => {
      return await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    });
    
    if (error) {
      console.error("Error fetching profile:", error);
      return { error };
    }
    
    console.log("Profile fetch successful:", data);
    return { error: null, data };
  } catch (err) {
    console.error("Exception in fetchUserProfile:", err);
    return { error: err };
  }
};

/**
 * Changement de mot de passe pour un utilisateur connecté
 * @param currentPassword Mot de passe actuel
 * @param newPassword Nouveau mot de passe
 * @returns Le résultat du changement de mot de passe
 */
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    console.log("Attempting to change password");
    
    // Première étape: vérifier le mot de passe actuel en tentant de se connecter
    // Fix the issue here - We can't return a Promise<string> where a string is expected
    // Get the user's email safely
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData.user?.email || '';
    
    if (!userEmail) {
      return { error: { message: "Impossible de récupérer l'email de l'utilisateur" } };
    }
    
    const { error: signInError } = await withRetry(async () => {
      return await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword
      });
    });
    
    if (signInError) {
      console.error("Current password verification failed:", signInError);
      return { error: { message: "Le mot de passe actuel est incorrect" } };
    }
    
    // Deuxième étape: mettre à jour le mot de passe
    const { error } = await withRetry(async () => {
      return await supabase.auth.updateUser({
        password: newPassword
      });
    });
    
    if (error) {
      console.error("Password update error:", error);
      return { error };
    }
    
    console.log("Password updated successfully");
    return { error: null, success: true };
  } catch (err) {
    console.error("Exception in changePassword:", err);
    
    let userMessage = "Erreur lors du changement de mot de passe. Veuillez réessayer.";
    
    if (err instanceof Error) {
      if (err.message?.includes("weak password")) {
        userMessage = "Le nouveau mot de passe est trop faible. Utilisez un mot de passe plus fort.";
      }
    }
    
    return { error: { message: userMessage, originalError: err } };
  }
};

// Add a health check function to verify Supabase connectivity
export const checkSupabaseConnection = async () => {
  try {
    // Try to access a public endpoint that doesn't require auth
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    return { isConnected: !error, error };
  } catch (err) {
    console.error("Supabase connectivity issue:", err);
    return { isConnected: false, error: err };
  }
};
