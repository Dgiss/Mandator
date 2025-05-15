
/**
 * Functions dedicated to fetching role information from the database
 * This separation helps prevent circular imports
 */

import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole, UserRole } from '@/hooks/userRole/types';

/**
 * Get the global role for a user
 */
export async function fetchGlobalRole(userId: string): Promise<UserRole> {
  try {
    // Try with the new RPC function first (most reliable)
    const { data: roleData, error: roleError } = await supabase.rpc('get_user_global_role');
    
    if (!roleError && roleData) {
      return roleData.toUpperCase() as UserRole;
    }
    
    // Fallback: direct query to profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', userId)
      .maybeSingle();
    
    if (!profileError && profileData && profileData.role_global) {
      return profileData.role_global.toUpperCase() as UserRole;
    }
    
    // Default role if nothing found
    return 'STANDARD';
    
  } catch (error) {
    console.error('Error retrieving global role:', error);
    return 'STANDARD';
  }
}

/**
 * Get specific role for a user on a specific market
 */
export async function fetchSpecificMarketRole(
  userId: string,
  marcheId: string
): Promise<MarcheSpecificRole> {
  try {
    // Check if user is creator first (most authoritative)
    const { data: marcheData } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .maybeSingle();
    
    if (marcheData && marcheData.user_id === userId) {
      return 'MOE'; // Creator is MOE by default
    }
    
    // Try the RPC function
    try {
      const { data: roleData, error: roleError } = await supabase.rpc(
        'get_user_role_for_marche',
        { 
          user_id: userId, 
          marche_id: marcheId 
        }
      );
      
      if (!roleError && roleData) {
        return roleData as MarcheSpecificRole;
      }
    } catch (rpcError) {
      console.warn('RPC role query failed, falling back to direct query');
    }
    
    // Fallback: direct query to droits_marche
    const { data: droitData, error: droitError } = await supabase
      .from('droits_marche')
      .select('role_specifique')
      .eq('user_id', userId)
      .eq('marche_id', marcheId)
      .maybeSingle();
    
    if (!droitError && droitData) {
      return droitData.role_specifique as MarcheSpecificRole;
    }
    
    // Return null if no role found
    return null;
    
  } catch (error) {
    console.error(`Error retrieving role for market ${marcheId}:`, error);
    return null;
  }
}

/**
 * Get all market roles for a user
 */
export async function fetchAllMarketRoles(
  userId: string
): Promise<Record<string, MarcheSpecificRole>> {
  try {
    // Get all markets where the user is creator
    const { data: createdMarches } = await supabase
      .from('marches')
      .select('id')
      .eq('user_id', userId);
    
    // Get all explicit role assignments
    const { data: droits, error } = await supabase
      .from('droits_marche')
      .select('marche_id, role_specifique')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching market roles:', error);
      return {};
    }
    
    // Initialize with explicit assignments
    const roles: Record<string, MarcheSpecificRole> = {};
    
    // Add roles from droits_marche
    if (droits) {
      droits.forEach(droit => {
        roles[droit.marche_id] = droit.role_specifique as MarcheSpecificRole;
      });
    }
    
    // Add MOE role for created markets (overwrites any existing role)
    if (createdMarches) {
      createdMarches.forEach(marche => {
        roles[marche.id] = 'MOE';
      });
    }
    
    return roles;
    
  } catch (error) {
    console.error('Error fetching all market roles:', error);
    return {};
  }
}
