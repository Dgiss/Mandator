
/**
 * Access control utilities
 */
import { supabase } from '@/lib/supabase';
import { getGlobalUserRole } from './roles';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * Cette version optimisée utilise la nouvelle fonction SECURITY DEFINER
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
    
    // HIGHEST PRIORITY: Check if user has ADMIN role first using cached or direct query
    try {
      const globalRole = await getGlobalUserRole();
      if (globalRole === 'ADMIN') {
        console.log(`User ${user.id} is ADMIN - access granted to market ${marcheId}`);
        return true; // Admin always has access
      }
    } catch (roleError) {
      console.error('Error checking global role:', roleError);
      // Continue with other checks
    }
    
    // Use the new non-recursive security definer function
    try {
      const { data: accessData, error: accessError } = await supabase.rpc(
        'check_marche_access',  // Use the new function name that matches what we created in SQL
        { marche_id: marcheId }
      );
      
      if (!accessError && accessData === true) {
        console.log(`Access granted through check_marche_access function for user ${user.id} to market ${marcheId}`);
        return true;
      } else if (accessError) {
        console.log(`check_marche_access function error: ${accessError.message}, trying fallback verification`);
      }
    } catch (rpcError) {
      console.log(`RPC function error: ${rpcError}, trying fallback verification`);
    }
    
    // Fall back to direct checks if RPC fails
    
    // Check if user is creator (second highest priority)
    try {
      // Use separate non-recursive query
      const { data, error } = await supabase
        .from('marches')
        .select('user_id')
        .eq('id', marcheId)
        .maybeSingle();
      
      if (!error && data && data.user_id === user.id) {
        console.log(`User ${user.id} is creator of market ${marcheId} - access granted`);
        return true;
      }
    } catch (creatorError) {
      console.error('Error checking market creator:', creatorError);
    }
    
    // Final check: explicit rights in droits_marche table
    // Use direct query to avoid potential recursion
    try {
      const { data, error } = await supabase
        .from('droits_marche')
        .select('id')
        .eq('user_id', user.id)
        .eq('marche_id', marcheId)
        .maybeSingle();
        
      if (!error && data) {
        console.log(`User ${user.id} has explicit rights for market ${marcheId} - access granted`);
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
