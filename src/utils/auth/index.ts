
/**
 * Main auth utilities entry point
 * Re-exports functions from the different auth modules for easier imports
 */

// Re-export everything for backward compatibility
export * from './checkAuth';
export * from './logout';
export * from './roles';
export * from './accessControl';

// Aliasing imports for backward compatibility with old code
import { hasGlobalRole } from "./roles";
import { userHasAccessToMarche } from "./accessControl";
import { getDocumentsForMarche } from "./accessControl";

// Export avec les anciens noms pour la compatibilité
export const hasRequiredRole = hasGlobalRole;
export const checkAccess = userHasAccessToMarche;
export const hasAccessToMarche = userHasAccessToMarche;
export { getDocumentsForMarche };

// Default export for backward compatibility
export default {
  checkAuth: () => import('./checkAuth'),
  logout: () => import('./logout'),
};
