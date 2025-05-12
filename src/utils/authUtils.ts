/**
 * Authentication utility functions for the application
 */
import { supabase } from '@/lib/supabase';
import { UserRole, MarcheSpecificRole } from '@/hooks/userRole/types';

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
 * Récupère le rôle global de l'utilisateur actuel
 * @returns {Promise<UserRole|null>} Le rôle global de l'utilisateur ou null si pas connecté
 */
export const getGlobalUserRole = async (): Promise<UserRole | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Récupérer le profil avec le rôle global en utilisant une fonction sécurisée 
    // pour éviter les problèmes de récursion RLS
    const { data, error } = await supabase
      .rpc('get_user_global_role');  // Utiliser une fonction RPC à la place d'un accès direct
    
    if (error) {
      console.error('Erreur lors de la récupération du rôle global:', error);
      return null;
    }
    
    // Normaliser le rôle
    return data ? String(data).toUpperCase() as UserRole : null;
  } catch (error) {
    console.error('Exception lors de la récupération du rôle global:', error);
    return null;
  }
};

/**
 * Récupère le rôle spécifique de l'utilisateur pour un marché donné
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<MarcheSpecificRole|null>} Le rôle spécifique ou null si pas de rôle ou pas connecté
 */
export const getMarcheSpecificRole = async (marcheId: string): Promise<MarcheSpecificRole | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Récupérer le rôle spécifique pour ce marché via la fonction RPC
    const { data, error } = await supabase
      .rpc('get_user_role_for_marche', {
        user_id: user.id,
        marche_id: marcheId
      });
    
    if (error) {
      console.error('Erreur lors de la récupération du rôle spécifique:', error);
      return null;
    }
    
    // Retourner le rôle spécifique
    return data as MarcheSpecificRole || null;
  } catch (error) {
    console.error('Exception lors de la récupération du rôle spécifique:', error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur a le rôle global spécifié
 * @param {UserRole} role Le rôle à vérifier
 * @returns {Promise<boolean>} True si l'utilisateur a le rôle spécifié
 */
export const hasGlobalRole = async (role: UserRole): Promise<boolean> => {
  const userRole = await getGlobalUserRole();
  
  // Les administrateurs ont tous les droits
  if (userRole === 'ADMIN') return true;
  
  return userRole === role;
};

/**
 * Vérifie si l'utilisateur a le rôle spécifié pour un marché donné
 * @param {string} marcheId L'identifiant du marché
 * @param {MarcheSpecificRole} role Le rôle à vérifier
 * @returns {Promise<boolean>} True si l'utilisateur a le rôle spécifié
 */
export const hasMarcheRole = async (marcheId: string, role: MarcheSpecificRole): Promise<boolean> => {
  // Vérifier d'abord le rôle global
  const globalRole = await getGlobalUserRole();
  
  // Les administrateurs ont tous les droits
  if (globalRole === 'ADMIN') return true;
  
  // Vérifier le rôle spécifique
  const specificRole = await getMarcheSpecificRole(marcheId);
  return specificRole === role;
};

/**
 * Vérifie si l'utilisateur est un ADMIN
 * @returns {Promise<boolean>} True si l'utilisateur est un ADMIN
 */
export const isAdmin = async (): Promise<boolean> => {
  return await hasGlobalRole('ADMIN');
};

/**
 * Vérifie si l'utilisateur est un MOE pour un marché spécifique
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur est un MOE pour ce marché
 */
export const isMOEForMarche = async (marcheId: string): Promise<boolean> => {
  return await hasMarcheRole(marcheId, 'MOE');
};

/**
 * Vérifie si l'utilisateur est un MANDATAIRE pour un marché spécifique
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur est un MANDATAIRE pour ce marché
 */
export const isMandataireForMarche = async (marcheId: string): Promise<boolean> => {
  return await hasMarcheRole(marcheId, 'MANDATAIRE');
};

/**
 * Vérifie si l'utilisateur peut créer des marchés
 * @returns {Promise<boolean>} True si l'utilisateur peut créer des marchés
 */
export const canCreateMarches = async (): Promise<boolean> => {
  const role = await getGlobalUserRole();
  return role === 'ADMIN' || role === 'MOE';
};

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  // Cette fonction utilise la RPC pour vérifier l'accès, ce qui respecte les politiques de sécurité
  try {
    // Récupérer l'ID utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("Utilisateur non connecté - accès refusé");
      return false;
    }
    
    console.log(`Vérification de l'accès au marché ${marcheId} pour l'utilisateur ${user.id}...`);
    
    const { data, error } = await supabase
      .rpc('user_has_access_to_marche', {
        user_id: user.id,
        marche_id: marcheId
      });
    
    if (error) {
      console.error('Erreur lors de la vérification des droits d\'accès:', error);
      return false;
    }
    
    console.log(`Résultat de la vérification d'accès:`, data);
    return !!data;
  } catch (error) {
    console.error('Exception lors de la vérification des droits d\'accès:', error);
    return false;
  }
};
