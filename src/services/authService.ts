
import { supabase } from '@/lib/supabase';
import { UserProfileData } from '@/types/auth';

/**
 * Connexion avec email et mot de passe
 * Amélioration de la gestion des erreurs
 * @param email Email de l'utilisateur
 * @param password Mot de passe
 * @returns Le résultat de la connexion
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Attempting to sign in with email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      console.error("Error during sign in:", error);
      return { error };
    }
    
    console.log("Sign in successful:", data);
    return { data };
  } catch (err) {
    console.error("Exception in signInWithEmail:", err);
    return { error: err };
  }
};

/**
 * Inscription avec email, mot de passe et données utilisateur
 * Version améliorée avec gestion des erreurs pour le problème de confirmation d'email
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
    
    // 1. Inscription de l'utilisateur
    const { data, error } = await supabase.auth.signUp({
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
    return { error: err };
  }
};

/**
 * Déconnexion avec gestion améliorée des erreurs
 * @returns Le résultat de la déconnexion
 */
export const signOutUser = async () => {
  try {
    console.log("Attempting to sign out");
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error during sign out:", error);
      return { error };
    }
    
    console.log("Sign out successful");
    return { error: null, success: true };
  } catch (err) {
    console.error("Exception in signOutUser:", err);
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
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
    
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Utilisation de maybeSingle pour éviter les erreurs quand aucun résultat n'est trouvé
    
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
