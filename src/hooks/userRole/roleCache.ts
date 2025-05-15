
/**
 * Simple cache mechanism to optimize role fetching and prevent redundant API calls
 */

// Global cache for role information
export const globalRoleCache: { role?: string } = {};

// Cache for market-specific roles
export const marketRoleCache = new Map<string, string>();

/**
 * Clears all cached role information
 */
export function clearRoleCache(): void {
  // Clear the global role cache
  delete globalRoleCache.role;
  
  // Clear all market-specific roles
  marketRoleCache.clear();
}

/**
 * Store a role in the market role cache
 */
export function cacheMarketRole(marketId: string, role: string | null): void {
  if (role === null) {
    marketRoleCache.delete(marketId);
  } else {
    marketRoleCache.set(marketId, role);
  }
}

/**
 * Get a role from the market role cache
 */
export function getCachedMarketRole(marketId: string): string | undefined {
  return marketRoleCache.get(marketId);
}

/**
 * Store the user's global role in cache
 */
export function cacheGlobalRole(role: string): void {
  globalRoleCache.role = role;
}

/**
 * Get the user's global role from cache
 */
export function getCachedGlobalRole(): string | undefined {
  return globalRoleCache.role;
}
