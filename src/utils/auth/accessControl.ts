
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
    
    // CRITICAL: First check if user has ADMIN role (highest priority)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .single();
      
    if (!profileError && profileData && profileData.role_global === 'ADMIN') {
      console.log(`User ${user.id} is ADMIN - access granted to market ${marcheId}`);
      return true; // Admin always has access
    }
    
    // Check if user is creator (second highest priority)
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === user.id) {
      console.log(`User ${user.id} is creator of market ${marcheId} - access granted`);
      return true;
    }
    
    // Check specific market rights (using RPC to avoid infinite recursion)
    const { data: hasAccess, error: accessError } = await supabase
      .rpc('user_has_access_to_marche', {
        user_id: user.id,
        marche_id: marcheId
      });
    
    if (accessError) {
      console.error('Error checking access rights:', accessError);
      // Don't immediately return false on error - try direct query as fallback
    } else if (hasAccess) {
      console.log(`Access check via RPC successful - access granted to market ${marcheId}`);
      return true;
    }
    
    // Fallback: Direct query as a last resort
    console.log("Falling back to direct query for access check...");
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
    
    // If we get here, no access was found through any method
    console.log(`No access rights found for user ${user.id} to market ${marcheId} - access denied`);
    return false;
  } catch (error) {
    console.error('Exception checking access rights:', error);
    // On error, let's check one last time directly for ADMIN role
    try {
      const role = await getGlobalUserRole();
      if (role === 'ADMIN') {
        console.log(`Exception recovery: Confirmed user is ADMIN - granting access to market ${marcheId}`);
        return true;
      }
    } catch (secondaryError) {
      console.error('Secondary error checking admin status:', secondaryError);
    }
    return false;
  }
};
