
/**
 * Re-export all auth utilities for easy importing
 * Optimisé pour éviter les problèmes d'importation circulaire
 * et les rendus en cascade
 */
export * from './checkAuth';
export * from './logout';
export * from './roles';
export * from './accessControl';

// Un export direct pour les fonctions essentielles
import { checkAuth } from './checkAuth';
import { logout } from './logout';
import { hasGlobalRole } from './roles';  // Changed from hasRequiredRole to hasGlobalRole
import { hasAccessToMarche } from './accessControl';  // Changed from checkAccess to hasAccessToMarche

export { checkAuth, logout, hasGlobalRole, hasAccessToMarche };
