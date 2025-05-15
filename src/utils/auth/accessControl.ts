
/**
 * Access control utilities
 */
import { supabase } from '@/lib/supabase';
import { getGlobalUserRole } from './roles';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
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
    
    // HIGHEST PRIORITY: Check if user has ADMIN role first (simplest check)
    try {
      const globalRole = await getGlobalUserRole();
      if (globalRole === 'ADMIN') {
        console.log(`User ${user.id} is ADMIN - access granted to market ${marcheId}`);
        return true; // Admin always has access - no further checks needed
      }
    } catch (roleError) {
      console.error('Error checking ADMIN role:', roleError);
      // Continue with other checks - don't fail immediately
    }
    
    // Use our dedicated RPC function to avoid recursive calls to marches table
    try {
      const { data, error } = await supabase.rpc(
        'user_has_access_to_marche', 
        {
          user_id: user.id,
          marche_id: marcheId
        }
      );
      
      if (error) {
        console.error('Error checking access via RPC:', error);
        // Continue with fallback checks
      } else {
        console.log(`Access check via RPC for market ${marcheId}: ${data ? 'granted' : 'denied'}`);
        return !!data;
      }
    } catch (rpcError) {
      console.error('Exception in RPC access check:', rpcError);
      // Continue with fallback checks
    }
    
    // Fallback: Check if user is creator (second highest priority)
    try {
      // This is a direct query but safer since it's just checking a single row
      // and the user has to be logged in to execute it
      const { data: marcheData, error: marcheError } = await supabase.rpc(
        'execute_query', 
        { 
          query_text: `SELECT user_id FROM marches WHERE id = '${marcheId}'` 
        }
      );
      
      if (!marcheError && marcheData && marcheData.length > 0) {
        const creatorId = marcheData[0].user_id;
        if (creatorId === user.id) {
          console.log(`User ${user.id} is creator of market ${marcheId} - access granted`);
          return true;
        }
      }
    } catch (creatorError) {
      console.error('Error checking market creator:', creatorError);
      // Continue with other checks
    }
    
    // Fallback for most cases: Check direct rights
    try {
      const { data, error } = await supabase.rpc(
        'execute_query', 
        { 
          query_text: `SELECT id FROM droits_marche WHERE user_id = '${user.id}' AND marche_id = '${marcheId}' LIMIT 1` 
        }
      );
      
      if (!error && data && data.length > 0) {
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
