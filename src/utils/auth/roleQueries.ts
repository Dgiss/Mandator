
import { supabase } from '@/lib/supabase';
import { UserRole, MarcheSpecificRole } from '@/hooks/userRole/types';

/**
 * Get a user's global role from Supabase
 * 
 * @param userId The user ID to get the role for
 * @returns The user's global role
 */
export async function fetchGlobalRole(userId: string): Promise<UserRole> {
  try {
    // Try to get the role directly from the profiles table first (most efficient)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', userId)
      .single();
    
    if (!profileError && profileData) {
      const userGlobalRole = profileData.role_global ? 
        String(profileData.role_global).toUpperCase() : 'STANDARD';
      return userGlobalRole as UserRole;
    }
    
    // Fallback to RPC if direct query fails
    console.log('Falling back to RPC for global role query');
    const { data, error } = await supabase.rpc('get_user_global_role');
    
    if (error) {
      console.error('Error fetching global role:', error);
      return 'STANDARD';
    }
    
    // Normalize the role
    const userGlobalRole = data ? String(data).toUpperCase() : 'STANDARD';
    return userGlobalRole as UserRole;
  } catch (error) {
    console.error('Exception in fetchGlobalRole:', error);
    return 'STANDARD';
  }
}

/**
 * Get all market-specific roles for a user
 * 
 * @param userId The user ID to get roles for
 * @returns Record of market IDs to roles
 */
export async function fetchAllMarketRoles(userId: string): Promise<Record<string, MarcheSpecificRole>> {
  try {
    const { data, error } = await supabase
      .from('droits_marche')
      .select('marche_id, role_specifique')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching market roles:', error);
      return {};
    }
    
    const rolesMap: Record<string, MarcheSpecificRole> = {};
    
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.marche_id && item.role_specifique) {
          rolesMap[item.marche_id] = item.role_specifique as MarcheSpecificRole;
        }
      });
    }
    
    return rolesMap;
  } catch (error) {
    console.error('Exception in fetchAllMarketRoles:', error);
    return {};
  }
}

/**
 * Get a specific market role for a user
 * 
 * @param userId The user ID to get the role for
 * @param marketId The market ID to get the role for
 * @returns The user's role for the specified market
 */
export async function fetchSpecificMarketRole(userId: string, marketId: string): Promise<MarcheSpecificRole> {
  try {
    const { data, error } = await supabase
      .from('droits_marche')
      .select('role_specifique')
      .eq('user_id', userId)
      .eq('marche_id', marketId)
      .single();
    
    if (error) {
      return null;
    }
    
    return data.role_specifique as MarcheSpecificRole;
  } catch (error) {
    console.error('Exception in fetchSpecificMarketRole:', error);
    return null;
  }
}

/**
 * Check if a user has admin rights
 * 
 * @returns Boolean indicating if the current user is an admin
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception in isUserAdmin:', error);
    return false;
  }
}
