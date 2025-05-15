
// Ce fichier exporte les hooks et les types du système de gestion des rôles utilisateurs
// Optimisé pour éviter les imports circulaires et les re-rendus inutiles

import { useUserRole } from './userRole/useUserRole';
import { UserRole, MarcheSpecificRole, UserRoleInfo } from './userRole/types';
import { clearRoleCache } from './userRole/roleCache';

// Export direct pour éviter les wrapper inutiles
export { useUserRole, clearRoleCache };
export type { UserRole, MarcheSpecificRole, UserRoleInfo };
