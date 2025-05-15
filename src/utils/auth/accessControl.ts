
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
    
    // HIGHEST PRIORITY: Check if user has ADMIN role first
    try {
      // Direct query to avoid RLS recursion
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role_global')
        .eq('id', user.id)
        .single();
        
      if (!profileError && profileData && profileData.role_global === 'ADMIN') {
        console.log(`User ${user.id} is ADMIN - access granted to market ${marcheId}`);
        return true; // Admin always has access - no further checks needed
      }
    } catch (roleError) {
      console.error('Error checking ADMIN role:', roleError);
      // Continue with other checks - don't fail immediately
    }
    
    // Check if user is creator (second highest priority)
    try {
      // Direct query to check if user is the creator, avoiding RPC call
      const { data: marcheData, error: marcheError } = await supabase
        .from('marches')
        .select('user_id')
        .eq('id', marcheId)
        .single();
      
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
