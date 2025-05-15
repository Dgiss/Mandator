
/**
 * Role caching functionality to improve performance and reduce database queries
 */

import { MarcheSpecificRole, UserRole } from './types';

// Cache storage with expiry time
interface CacheItem<T> {
  value: T;
  expiry: number;
}

// Cache for global roles - key is user ID
export const globalRoleCache = new Map<string, CacheItem<UserRole>>();

// Cache for market specific roles - key is userId:marketId
export const marketRoleCache = new Map<string, CacheItem<MarcheSpecificRole>>();

// Default cache expiry time (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

// Session storage keys
const GLOBAL_ROLE_KEY = 'user_global_role';

/**
 * Cache the global role for the current session
 */
export function cacheGlobalRole(role: UserRole | null) {
  if (!role) return;
  
  // Store in memory cache
  globalRoleCache.set('current', {
    value: role,
    expiry: Date.now() + CACHE_TTL_MS
  });
  
  // Store in session storage for persistence
  try {
    sessionStorage.setItem(GLOBAL_ROLE_KEY, role);
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Cache a specific market role
 */
export function cacheMarketRole(marketId: string, role: MarcheSpecificRole | null) {
  if (!marketId) return;
  
  marketRoleCache.set(marketId, {
    value: role,
    expiry: Date.now() + CACHE_TTL_MS
  });
}

/**
 * Get cached global role if available and not expired
 */
export function getCachedGlobalRole(): UserRole | null {
  // Try memory cache first
  const cachedItem = globalRoleCache.get('current');
  
  if (cachedItem && cachedItem.expiry > Date.now()) {
    return cachedItem.value;
  }
  
  // Clear expired item
  if (cachedItem) {
    globalRoleCache.delete('current');
  }
  
  // Try session storage as fallback
  try {
    const storedRole = sessionStorage.getItem(GLOBAL_ROLE_KEY);
    if (storedRole) {
      // Refresh cache with stored value
      cacheGlobalRole(storedRole as UserRole);
      return storedRole as UserRole;
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  return null;
}

/**
 * Get cached market role if available and not expired
 */
export function getCachedMarketRole(marketId?: string): MarcheSpecificRole | undefined {
  if (!marketId) return undefined;
  
  const cachedItem = marketRoleCache.get(marketId);
  
  if (cachedItem && cachedItem.expiry > Date.now()) {
    return cachedItem.value;
  }
  
  // Clear expired item
  if (cachedItem) {
    marketRoleCache.delete(marketId);
  }
  
  return undefined;
}

/**
 * Clear all role caches
 */
export function clearRoleCache() {
  globalRoleCache.clear();
  marketRoleCache.clear();
  
  try {
    sessionStorage.removeItem(GLOBAL_ROLE_KEY);
  } catch (e) {
    // Ignore storage errors
  }
}
