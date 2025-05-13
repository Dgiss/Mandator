
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from './types';

/**
 * Clears the role cache for a specific market
 * @param marcheId The ID of the market to clear the cache for
 */
export const clearRoleCache = (marcheId?: string) => {
  // This function would be implemented to clear cached roles
  console.log(`Cache cleared for market: ${marcheId || 'all'}`);
};

/**
 * Fetches the role for a user on a specific market
 * @param userId The user ID
 * @param marcheId The market ID
 * @returns The market-specific role for the user
 */
export const fetchMarcheRole = async (userId: string, marcheId: string): Promise<MarcheSpecificRole> => {
  try {
    console.log(`Fetching role for user ${userId} on market ${marcheId}...`);
    
    // First check if the user is the creator of the market (creator = MOE)
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === userId) {
      console.log(`User ${userId} is creator of market ${marcheId} - role is MOE`);
      return 'MOE';
    }
    
    // Try direct query first (safer than RPC call)
    const { data: droitData, error: droitError } = await supabase
      .from('droits_marche')
      .select('role_specifique')
      .eq('user_id', userId)
      .eq('marche_id', marcheId)
      .maybeSingle();
      
    if (!droitError && droitData) {
      console.log(`Direct query result for user ${userId} on market ${marcheId}:`, droitData.role_specifique);
      return droitData.role_specifique as MarcheSpecificRole;
    }
    
    // Fall back to RPC if direct query failed
    console.log(`No direct role found, trying RPC for user ${userId} on market ${marcheId}...`);
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_user_role_for_marche', {
        user_id: userId,
        marche_id: marcheId
      });
    
    if (rpcError) {
      console.error('Error fetching role via RPC:', rpcError);
      return null;
    }
    
    console.log(`RPC result for user ${userId} on market ${marcheId}:`, rpcData);
    return rpcData as MarcheSpecificRole;
  } catch (error) {
    console.error('Exception fetching market role:', error);
    return null;
  }
};

/**
 * Fetches all market roles for a user
 * @param userId The user ID
 * @returns A record of market IDs to roles
 */
export const fetchMarcheRoles = async (userId: string): Promise<Record<string, MarcheSpecificRole>> => {
  try {
    console.log(`Fetching all market roles for user ${userId}...`);
    
    // Try direct query first
    const { data: droitsData, error: droitsError } = await supabase
      .from('droits_marche')
      .select('marche_id, role_specifique')
      .eq('user_id', userId);
      
    if (droitsError) {
      console.error('Error fetching roles:', droitsError);
      return {};
    }
    
    // Also get markets created by the user (creator = MOE)
    const { data: createdMarches, error: createdError } = await supabase
      .from('marches')
      .select('id')
      .eq('user_id', userId);
    
    // Create record of market IDs to roles
    const roles: Record<string, MarcheSpecificRole> = {};
    
    // Add roles from droits_marche
    (droitsData || []).forEach(droit => {
      roles[droit.marche_id] = droit.role_specifique as MarcheSpecificRole;
    });
    
    // Add MOE role for created markets
    if (!createdError && createdMarches) {
      createdMarches.forEach(marche => {
        roles[marche.id] = 'MOE';
      });
    }
    
    console.log(`All market roles for user ${userId}:`, roles);
    return roles;
  } catch (error) {
    console.error('Exception fetching all market roles:', error);
    return {};
  }
};
