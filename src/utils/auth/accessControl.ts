
/**
 * Access control utilities
 */
import { supabase } from '@/lib/supabase';
import { getGlobalUserRole } from './roles';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * Cette version améliorée évite la récursion infinie des politiques RLS
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("User not logged in - access denied");
      return false;
    }
    
    console.log(`Checking access to market ${marcheId} for user ${user.id}...`);
    
    // HIGHEST PRIORITY: Check if user has ADMIN role first - DIRECT QUERY APPROACH
    try {
      const globalRole = await getGlobalUserRole();
      if (globalRole === 'ADMIN') {
        console.log(`User ${user.id} is ADMIN - access granted to market ${marcheId}`);
        return true; // Admin always has access - no further checks needed
      }
    } catch (roleError) {
      console.error('Error checking global role:', roleError);
      // Continue with other checks - don't fail immediately
    }
    
    // Try using a security definer function if available
    try {
      const { data: accessData, error: accessError } = await supabase.rpc(
        'check_user_marche_access',
        { 
          user_id: user.id, 
          marche_id: marcheId 
        }
      );
      
      if (!accessError && accessData === true) {
        console.log(`Access granted through RPC function for user ${user.id} to market ${marcheId}`);
        return true;
      } else if (accessError) {
        console.log(`RPC function error: ${accessError.message}, trying direct queries`);
      }
    } catch (rpcError) {
      console.log(`RPC function not available, trying direct queries`);
    }
    
    // Check if user is creator (second highest priority) - DIRECT QUERY APPROACH
    try {
      const { data: marcheData, error: marcheError } = await supabase
        .from('marches')
        .select('user_id')
        .eq('id', marcheId)
        .maybeSingle();
      
      if (!marcheError && marcheData && marcheData.user_id === user.id) {
        console.log(`User ${user.id} is creator of market ${marcheId} - access granted`);
        return true;
      }
    } catch (creatorError) {
      console.error('Error checking market creator:', creatorError);
    }
    
    // Direct query for droits_marche to avoid recursion
    try {
      console.log("Checking direct query for droits_marche...");
      // Utiliser une requête SQL non récursive via une RPC
      const { data: droitData, error: droitError } = await supabase
        .from('droits_marche')
        .select('id')
        .eq('user_id', user.id)
        .eq('marche_id', marcheId)
        .maybeSingle();
        
      if (!droitError && droitData) {
        console.log(`User ${user.id} has explicit rights for market ${marcheId} via direct query - access granted`);
        return true;
      }
    } catch (directQueryError) {
      console.error('Exception in direct query access check:', directQueryError);
    }
    
    // If we get here, no access was found through any method
    console.log(`No access rights found for user ${user.id} to market ${marcheId} - access denied`);
    return false;
  } catch (error) {
    console.error('Major exception checking access rights:', error);
    return false;
  }
};
