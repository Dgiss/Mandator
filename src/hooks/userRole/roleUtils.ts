
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from './types';

// Global cache to avoid redundant fetches
const roleCache: Record<string, MarcheSpecificRole> = {};

/**
 * Fetches all market roles for a specific user
 */
export async function fetchMarcheRoles(userId: string): Promise<Record<string, MarcheSpecificRole>> {
  try {
    // Using RPC to avoid recursive RLS issues
    const { data, error } = await supabase.rpc('get_droits_for_user', { user_id_param: userId });
    
    if (error) {
      console.error('Error fetching user market roles:', error);
      return {};
    }
    
    const roles: Record<string, MarcheSpecificRole> = {};
    
    // Map the result to our expected format
    if (data && Array.isArray(data)) {
      data.forEach(role => {
        roles[role.marche_id] = role.role_specifique as MarcheSpecificRole;
        // Update cache
        roleCache[role.marche_id] = role.role_specifique as MarcheSpecificRole;
      });
    }
    
    return roles;
  } catch (error) {
    console.error('Exception fetching market roles:', error);
    return {};
  }
}

/**
 * Fetches a specific role for a user and market
 */
export async function fetchMarcheRole(userId: string, marcheId: string): Promise<MarcheSpecificRole> {
  // Check cache first to prevent redundant fetches
  if (roleCache[marcheId]) {
    return roleCache[marcheId];
  }
  
  try {
    // Using RPC to avoid recursive RLS issues
    const { data, error } = await supabase.rpc('get_user_role_for_marche', {
      user_id: userId,
      marche_id: marcheId
    });
    
    if (error) {
      console.error(`Error fetching role for market ${marcheId}:`, error);
      return null;
    }
    
    // Update cache
    roleCache[marcheId] = data as MarcheSpecificRole;
    return data as MarcheSpecificRole;
  } catch (error) {
    console.error(`Exception fetching role for market ${marcheId}:`, error);
    return null;
  }
}

/**
 * Clears the role cache to force fresh data fetching
 * Useful when roles are updated
 */
export function clearRoleCache(marcheId?: string): void {
  if (marcheId) {
    delete roleCache[marcheId];
  } else {
    Object.keys(roleCache).forEach(key => delete roleCache[key]);
  }
}
