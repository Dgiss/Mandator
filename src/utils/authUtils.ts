
/**
 * Authentication utility functions for the application
 */
import { supabase } from '@/lib/supabase';

/**
 * Check if the user is authenticated
 * This is a simple implementation for now - later we can integrate with Supabase or other auth providers
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const checkAuth = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

/**
 * Log out the current user
 * @returns {Promise<boolean>} True if logout was successful
 */
export const logout = async (): Promise<boolean> => {
  const { error } = await supabase.auth.signOut();
  return !error;
};

/**
 * Récupère le rôle de l'utilisateur actuel
 * @returns {Promise<string|null>} Le rôle de l'utilisateur ou null si pas connecté
 */
export const getUserRole = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Récupérer le profil avec le rôle
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Erreur lors de la récupération du rôle:', error);
    return null;
  }
  
  // Normaliser le rôle
  return data?.role ? String(data.role).toUpperCase() : null;
};

/**
 * Vérifie si l'utilisateur a le rôle spécifié
 * @param {string} role Le rôle à vérifier
 * @returns {Promise<boolean>} True si l'utilisateur a le rôle spécifié
 */
export const hasRole = async (role: string): Promise<boolean> => {
  const userRole = await getUserRole();
  return userRole === role.toUpperCase();
};

/**
 * Vérifie si l'utilisateur est un MANDATAIRE
 * @returns {Promise<boolean>} True si l'utilisateur est un MANDATAIRE
 */
export const isMandataire = async (): Promise<boolean> => {
  return await hasRole('MANDATAIRE');
};

/**
 * Vérifie si l'utilisateur est un MOE (Maître d'Œuvre)
 * @returns {Promise<boolean>} True si l'utilisateur est un MOE
 */
export const isMOE = async (): Promise<boolean> => {
  return await hasRole('MOE');
};
