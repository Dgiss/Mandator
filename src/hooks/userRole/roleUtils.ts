
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from './types';

/**
 * Cache to store roles for markets to reduce database queries
 */
let roleCache: Record<string, Record<string, MarcheSpecificRole>> = {};

/**
 * Fetch all market roles for a user
 */
export async function fetchMarcheRoles(userId: string): Promise<Record<string, MarcheSpecificRole>> {
  try {
    // First, check if user is admin - for admins we can bypass normal checks
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', userId)
      .single();
      
    if (!profileError && profileData && profileData.role_global === 'ADMIN') {
      // For admins, we'll still fetch their explicit roles to merge with admin privileges
      console.log('User is admin, proceeding with admin privileges');
    }
    
    // Try using the RPC function to avoid recursion issues
    const { data: droitsData, error: rpcError } = await supabase
      .rpc('get_droits_for_user', {
        user_id_param: userId
      });
    
    // If RPC fails, try direct query as fallback
    if (rpcError) {
      console.error('Error fetching market roles via RPC:', rpcError);
      console.log('Falling back to direct query for droits_marche');
      
      // Try direct query as fallback
      const { data: directData, error: directError } = await supabase
        .from('droits_marche')
        .select('marche_id, role_specifique')
        .eq('user_id', userId);
        
      if (directError) {
        console.error('Error fetching market roles via direct query:', directError);
        return {};
      }
      
      const rolesMap: Record<string, MarcheSpecificRole> = {};
      
      // Process rights data
      directData?.forEach(droit => {
        rolesMap[droit.marche_id] = droit.role_specifique as MarcheSpecificRole;
      });
      
      // Update cache
      roleCache[userId] = rolesMap;
      
      return rolesMap;
    }
    
    const rolesMap: Record<string, MarcheSpecificRole> = {};
    
    // Process rights data from RPC
    droitsData?.forEach(droit => {
      rolesMap[droit.marche_id] = droit.role_specifique as MarcheSpecificRole;
    });
    
    // Update cache
    roleCache[userId] = rolesMap;
    
    return rolesMap;
  } catch (error) {
    console.error('Error fetching market roles:', error);
    return {};
  }
}

/**
 * Fetch a specific market role for a user
 */
export async function fetchMarcheRole(userId: string, marcheId: string): Promise<MarcheSpecificRole> {
  try {
    // Check cache first
    if (roleCache[userId]?.[marcheId] !== undefined) {
      return roleCache[userId][marcheId];
    }
    
    // First check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', userId)
      .single();
      
    if (!profileError && profileData && profileData.role_global === 'ADMIN') {
      console.log('User is admin, but still checking for explicit market role');
    }
    
    // Creator check - if user created the market, they are MOE by default
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === userId) {
      console.log(`User ${userId} is creator of market ${marcheId} - default role MOE`);
      
      // Cache the result
      if (!roleCache[userId]) roleCache[userId] = {};
      roleCache[userId][marcheId] = 'MOE';
      
      return 'MOE';
    }
    
    // Try using RPC to avoid recursion issues
    const { data: specificRole, error: rpcError } = await supabase
      .rpc('get_user_role_for_marche', {
        user_id: userId,
        marche_id: marcheId
      });
    
    // If RPC fails, try direct query as fallback
    if (rpcError) {
      console.error('Error fetching market role via RPC:', rpcError);
      console.log('Falling back to direct query for droits_marche');
      
      // Try direct query
      const { data: droitData, error: droitError } = await supabase
        .from('droits_marche')
        .select('role_specifique')
        .eq('user_id', userId)
        .eq('marche_id', marcheId)
        .maybeSingle();
        
      if (droitError) {
        console.error('Error fetching market role via direct query:', droitError);
        return null;
      }
      
      const role = droitData?.role_specifique as MarcheSpecificRole || null;
      
      // Cache the result
      if (!roleCache[userId]) roleCache[userId] = {};
      roleCache[userId][marcheId] = role;
      
      return role;
    }
    
    // Cache the result from RPC
    if (!roleCache[userId]) roleCache[userId] = {};
    roleCache[userId][marcheId] = specificRole as MarcheSpecificRole;
    
    return specificRole as MarcheSpecificRole;
  } catch (error) {
    console.error('Error fetching market role:', error);
    return null;
  }
}

/**
 * Clear role cache to force fresh data retrieval
 * @param userId Optional user ID to clear only a specific user's cache
 */
export function clearRoleCache(userId?: string) {
  if (userId) {
    delete roleCache[userId];
  } else {
    roleCache = {};
  }
}
