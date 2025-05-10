
/**
 * Authentication utility functions for the application
 */
import { supabase } from '@/lib/supabase';
import { UserRole, MarcheSpecificRole } from '@/hooks/useUserRole';

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Récupérer le profil avec le rôle global
  const { data, error } = await supabase
    .from('profiles')
    .select('role_global')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Erreur lors de la récupération du rôle global:', error);
    return null;
  }
  
  // Normaliser le rôle
  return data?.role_global ? String(data.role_global).toUpperCase() as UserRole : null;
};

/**
 * Récupère le rôle spécifique de l'utilisateur pour un marché donné
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<MarcheSpecificRole|null>} Le rôle spécifique ou null si pas de rôle ou pas connecté
 */
export const getMarcheSpecificRole = async (marcheId: string): Promise<MarcheSpecificRole | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Récupérer le rôle spécifique pour ce marché
  const { data, error } = await supabase
    .from('droits_marche')
    .select('role_specifique')
    .eq('user_id', user.id)
    .eq('marche_id', marcheId)
    .maybeSingle();
  
  if (error) {
    console.error('Erreur lors de la récupération du rôle spécifique:', error);
    return null;
  }
  
  // Retourner le rôle spécifique
  return data?.role_specifique as MarcheSpecificRole || null;
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
  // Vérifier d'abord le rôle global
  const globalRole = await getGlobalUserRole();
  
  // Les administrateurs ont accès à tous les marchés
  if (globalRole === 'ADMIN') return true;
  
  // Vérifier si l'utilisateur a un rôle spécifique pour ce marché
  const specificRole = await getMarcheSpecificRole(marcheId);
  return specificRole !== null;
};
