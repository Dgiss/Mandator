/**
 * Role management utilities
 */
import { supabase } from '@/lib/supabase';
import { UserRole, MarcheSpecificRole } from '@/hooks/userRole/types';

/**
 * Récupère le rôle global de l'utilisateur actuel
 * @returns {Promise<UserRole|null>} Le rôle global de l'utilisateur ou null si pas connecté
 */
export const getGlobalUserRole = async (): Promise<UserRole | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Try direct query first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .single();
      
    if (!profileError && profileData) {
      return profileData.role_global ? 
        String(profileData.role_global).toUpperCase() as UserRole : null;
    }
    
    // Fall back to RPC if direct query fails
    const { data, error } = await supabase.rpc('get_user_global_role');
    
    if (error) {
      console.error('Error retrieving global role:', error);
      return null;
    }
    
    // Normalize the role
    return data ? String(data).toUpperCase() as UserRole : null;
  } catch (error) {
    console.error('Exception retrieving global role:', error);
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
    if (!user) {
      console.log('User not logged in, cannot retrieve specific role');
      return null;
    }
    
    console.log(`Getting role for user ${user.id} on market ${marcheId}...`);
    
    // First check if user is creator (most important)
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === user.id) {
      console.log(`User ${user.id} is creator of market ${marcheId}`);
      return 'MOE'; // Creator is considered MOE by default
    }
    
    // Use RPC to avoid recursive RLS issues
    const { data, error } = await supabase
      .rpc('get_user_role_for_marche', {
        user_id: user.id,
        marche_id: marcheId
      });
    
    if (error) {
      console.error('Error retrieving specific role:', error);
      return null;
    }
    
    // Return the specific role
    console.log(`Role retrieved for user ${user.id} on market ${marcheId}: ${data || 'none'}`);
    return data as MarcheSpecificRole || null;
  } catch (error) {
    console.error('Exception retrieving specific role:', error);
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
  
  // Vérifier si l'utilisateur est le créateur du marché
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === user.id) {
      // Si on vérifie le rôle MOE et que l'utilisateur est le créateur, c'est vrai
      if (role === 'MOE') return true;
    }
  }
  
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
  // Check first if the user is ADMIN (admins can do everything)
  if (await isAdmin()) return true;
  
  // Check if user is creator of the market
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === user.id) {
      return true; // Creator is considered MOE
    }
  }
  
  // Finally, check for explicit role assignment
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
 * Helper function to get all user roles and permissions in one call
 * This avoids multiple separate database calls that can cause recursion issues
 */
export const getUserPermissions = async (marcheId?: string): Promise<{
  globalRole: UserRole | null,
  specificRole?: MarcheSpecificRole | null,
  isCreator?: boolean,
  hasAccess?: boolean
}> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { globalRole: null };
    
    // Get global role
    const globalRole = await getGlobalUserRole();
    
    // If ADMIN, no need for further checks
    if (globalRole === 'ADMIN') {
      return { 
        globalRole, 
        specificRole: 'ADMIN', 
        isCreator: true,
        hasAccess: true 
      };
    }
    
    // If no marcheId provided, just return global role
    if (!marcheId) {
      return { globalRole };
    }
    
    // For specific market, get direct database info
    const [marketData, rightData] = await Promise.allSettled([
      // Check if user is creator
      supabase
        .from('marches')
        .select('user_id')
        .eq('id', marcheId)
        .single(),
      
      // Check if user has specific rights
      supabase
        .from('droits_marche')
        .select('role_specifique')
        .eq('user_id', user.id)
        .eq('marche_id', marcheId)
        .single()
    ]);
    
    // Process results
    const isCreator = marketData.status === 'fulfilled' && 
                     !marketData.value.error && 
                     marketData.value.data?.user_id === user.id;
                     
    const specificRole = rightData.status === 'fulfilled' && 
                         !rightData.value.error ? 
                         rightData.value.data?.role_specifique as MarcheSpecificRole : 
                         null;
    
    const hasAccess = isCreator || specificRole !== null;
    
    return {
      globalRole,
      specificRole: isCreator && !specificRole ? 'MOE' : specificRole,
      isCreator,
      hasAccess
    };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return { globalRole: null };
  }
};
