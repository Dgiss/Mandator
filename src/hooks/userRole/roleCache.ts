
import { UserRole, MarcheSpecificRole } from './types';

// Cache pour les rôles globaux (userID -> role)
export const globalRoleCache: Map<string, UserRole | null> = new Map();

// Cache pour les rôles spécifiques aux marchés (marcheID_userID -> role)
export const marketRoleCache: Map<string, MarcheSpecificRole> = new Map();

/**
 * Génère une clé de cache pour un marché et un utilisateur spécifiques
 * @param marketId ID du marché
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
 * @returns Clé de cache
 */
const getMarketCacheKey = (marketId?: string, userId?: string): string => {
  return `${marketId || 'global'}_${userId || 'current'}`;
};

/**
 * Met en cache le rôle global d'un utilisateur
 */
export const cacheGlobalRole = (role: UserRole | null, userId?: string): void => {
  const key = userId || 'current';
  globalRoleCache.set(key, role);
};

/**
 * Met en cache le rôle spécifique pour un marché
 */
export const cacheMarketRole = (marketId: string, role: MarcheSpecificRole, userId?: string): void => {
  const key = getMarketCacheKey(marketId, userId);
  marketRoleCache.set(key, role);
};

/**
 * Récupère le rôle global en cache
 */
export const getCachedGlobalRole = (userId?: string): UserRole | null | undefined => {
  const key = userId || 'current';
  return globalRoleCache.get(key);
};

/**
 * Récupère le rôle spécifique en cache pour un marché
 */
export const getCachedMarketRole = (marketId?: string, userId?: string): MarcheSpecificRole | undefined => {
  if (!marketId) return undefined;
  const key = getMarketCacheKey(marketId, userId);
  return marketRoleCache.get(key);
};

/**
 * Vide le cache des rôles
 */
export const clearRoleCache = (userId?: string): void => {
  if (userId) {
    // Supprimer uniquement les entrées pour cet utilisateur
    globalRoleCache.delete(userId);
    
    // Supprimer les entrées de marchés pour cet utilisateur
    for (const key of marketRoleCache.keys()) {
      if (key.endsWith(`_${userId}`)) {
        marketRoleCache.delete(key);
      }
    }
  } else {
    // Vider tout le cache
    globalRoleCache.clear();
    marketRoleCache.clear();
  }
};
