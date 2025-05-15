
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from './types';
import { 
  marketRoleCache, 
  cacheMarketRole 
} from './roleCache';
import { 
  fetchSpecificMarketRole, 
  fetchAllMarketRoles 
} from '@/utils/auth/roleQueries';

/**
 * Fetch a user's role for a specific market
 * 
 * @param userId User ID
 * @param marcheId Market ID
 * @returns The user's role for that market
 */
export const fetchMarcheRole = async (
  userId: string, 
  marcheId: string
): Promise<MarcheSpecificRole> => {
  // Check cache first
  const cachedRole = marketRoleCache.get(marcheId);
  if (cachedRole !== undefined) {
    return cachedRole as MarcheSpecificRole;
  }
  
  // If not in cache, fetch from API
  const role = await fetchSpecificMarketRole(userId, marcheId);
  
  // Update cache
  cacheMarketRole(marcheId, role);
  
  return role;
};

/**
 * Fetch all market roles for a user
 * 
 * @param userId User ID
 * @returns Object mapping market IDs to roles
 */
export const fetchMarcheRoles = async (
  userId: string
): Promise<Record<string, MarcheSpecificRole>> => {
  const roles = await fetchAllMarketRoles(userId);
  
  // Update cache with fetched roles
  Object.entries(roles).forEach(([marketId, role]) => {
    cacheMarketRole(marketId, role as string);
  });
  
  return roles;
};

/**
 * Clear all role cache data
 */
export const clearRoleCache = () => {
  // Reset cache maps
  marketRoleCache.clear();
};
