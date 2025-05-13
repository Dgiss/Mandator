
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
    
    // IMPORTANT: First check if user is creator (highest priority)
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === user.id) {
      console.log(`User ${user.id} is creator of market ${marcheId} - access granted`);
      return true;
    }
    
    // Check global role (admin has access to everything)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .single();
      
    if (!profileError && profileData && profileData.role_global === 'ADMIN') {
      console.log(`User ${user.id} is ADMIN - access granted to market ${marcheId}`);
      return true;
    }
    
    // Try direct query first
    const { data: droitData, error: droitError } = await supabase
      .from('droits_marche')
      .select('id')
      .eq('user_id', user.id)
      .eq('marche_id', marcheId)
      .maybeSingle(); // Use maybeSingle to avoid error if no record
      
    if (!droitError && droitData) {
      console.log(`User ${user.id} has explicit rights for market ${marcheId} - access granted`);
      return true;
    }
    
    // Fall back to RPC if direct query approach fails
    const { data, error } = await supabase
      .rpc('user_has_access_to_marche', {
        user_id: user.id,
        marche_id: marcheId
      });
    
    if (error) {
      console.error('Error checking access rights:', error);
      return false;
    }
    
    console.log(`Access check result:`, data);
    return !!data;
  } catch (error) {
    console.error('Exception checking access rights:', error);
    return false;
  }
};
