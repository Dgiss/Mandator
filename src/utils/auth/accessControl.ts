
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
    
    // Use existing user_has_access_to_marche function
    const { data: hasAccess, error } = await supabase
      .rpc('user_has_access_to_marche', { 
        user_id: user.id, 
        marche_id: marcheId 
      });
      
    if (error) {
      console.error('Error checking access via RPC:', error);
      // Fall back to direct checks
    } else {
      console.log(`Access check via RPC for market ${marcheId}: ${hasAccess ? 'granted' : 'denied'}`);
      return !!hasAccess;
    }
    
    // Fallback: Check if user is creator using direct query
    try {
      const { data: marcheData, error: marcheError } = await supabase
        .from('marches')
        .select('user_id')
        .eq('id', marcheId)
        .single();
      
      if (!marcheError && marcheData) {
        if (marcheData.user_id === user.id) {
          console.log(`User ${user.id} is creator of market ${marcheId} - access granted`);
          return true;
        }
      }
    } catch (creatorError) {
      console.error('Error checking market creator:', creatorError);
    }
    
    // Fallback: Check direct rights
    try {
      const { data, error } = await supabase
        .from('droits_marche')
        .select('id')
        .eq('user_id', user.id)
        .eq('marche_id', marcheId)
        .limit(1);
      
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
