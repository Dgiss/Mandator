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
import { hasAccessToMarche } from "./accessControl";

// Export with older names for backward compatibility
export const hasRequiredRole = hasGlobalRole;
export const checkAccess = hasAccessToMarche;

// Default export for backward compatibility
export default {
  checkAuth: () => import('./checkAuth'),
  logout: () => import('./logout'),
  // ...other functionality as needed
};
