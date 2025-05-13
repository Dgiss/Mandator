
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
    // Try direct query first
    const { data: droitsData, error: droitsError } = await supabase
      .from('droits_marche')
      .select('marche_id, role_specifique')
      .eq('user_id', userId);
      
    if (droitsError) throw droitsError;
    
    const rolesMap: Record<string, MarcheSpecificRole> = {};
    
    // Process rights data
    droitsData.forEach(droit => {
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
    
    // Try direct query
    const { data: droitData, error: droitError } = await supabase
      .from('droits_marche')
      .select('role_specifique')
      .eq('user_id', userId)
      .eq('marche_id', marcheId)
      .maybeSingle();
      
    if (droitError) throw droitError;
    
    // Creator check
    if (!droitData) {
      const { data: marcheData, error: marcheError } = await supabase
        .from('marches')
        .select('user_id')
        .eq('id', marcheId)
        .single();
      
      if (!marcheError && marcheData && marcheData.user_id === userId) {
        // Cache the result
        if (!roleCache[userId]) roleCache[userId] = {};
        roleCache[userId][marcheId] = 'MOE';
        
        return 'MOE';
      }
    }
    
    const role = droitData?.role_specifique as MarcheSpecificRole || null;
    
    // Cache the result
    if (!roleCache[userId]) roleCache[userId] = {};
    roleCache[userId][marcheId] = role;
    
    return role;
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
