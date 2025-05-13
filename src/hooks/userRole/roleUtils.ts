
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from './types';

/**
 * Fetches all market-specific roles for a user
 */
export const fetchMarcheRoles = async (userId: string | undefined): Promise<Record<string, MarcheSpecificRole>> => {
  if (!userId) return {};
  
  try {
    // First check if user is creator of any markets (they should have MOE role)
    const { data: createdMarches, error: marchesError } = await supabase
      .from('marches')
      .select('id')
      .eq('user_id', userId);
    
    let rolesMap: Record<string, MarcheSpecificRole> = {};
    
    if (!marchesError && createdMarches) {
      createdMarches.forEach(marche => {
        // If the user is the creator of the market, assign them the MOE role
        console.log(`User ${userId} is creator of market ${marche.id}, setting MOE role`);
        rolesMap[marche.id] = 'MOE';
      });
    }
    
    // IMPORTANT: Use RPC function to avoid RLS recursion issues
    const { data, error } = await supabase
      .rpc('get_droits_for_user', {
        user_id_param: userId
      });
    
    if (error) {
      console.error('Error retrieving market roles:', error);
      return rolesMap; // Return creator roles if we have them
    }
    
    if (data && Array.isArray(data)) {
      data.forEach((item: any) => {
        // Don't override MOE role for creators with lesser roles
        if (rolesMap[item.marche_id] !== 'MOE') {
          rolesMap[item.marche_id] = item.role_specifique as MarcheSpecificRole;
        }
      });
    }
    
    return rolesMap;
  } catch (error) {
    console.error('Error retrieving market roles:', error);
    return {};
  }
};

/**
 * Fetches the specific role for a user on a specific market
 */
export const fetchMarcheRole = async (
  userId: string | undefined, 
  marcheId: string
): Promise<MarcheSpecificRole> => {
  if (!userId || !marcheId) return null;
  
  try {
    // IMPORTANT: Check if user is creator first (highest priority)
    console.log(`Checking if user ${userId} is creator of market ${marcheId}...`);
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === userId) {
      console.log(`User ${userId} is creator of market ${marcheId} - assigning MOE role`);
      return 'MOE';
    }
    
    // IMPORTANT: DO NOT query droits_marche directly - use the RPC function
    console.log(`Getting specific role for user ${userId} on market ${marcheId}...`);
    
    // CRITICAL: Use RPC function to avoid RLS recursion
    console.log(`Trying RPC for user ${userId} on market ${marcheId}...`);
    const { data, error } = await supabase
      .rpc('get_user_role_for_marche', {
        user_id: userId,
        marche_id: marcheId
      });
    
    if (error) {
      console.error(`Failed to find specific role for market ${marcheId}:`, error);
      return null;
    }
    
    console.log(`Role retrieved for user ${userId} on market ${marcheId}:`, data);
    return data as MarcheSpecificRole;
  } catch (error) {
    console.error('Error retrieving specific role:', error);
    return null;
  }
};
