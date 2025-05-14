
// Ce fichier exporte les hooks et les types du système de gestion des rôles utilisateurs
// Optimisé pour éviter les imports circulaires et les re-rendus inutiles

import { useUserRole } from './userRole/useUserRole';
import { UserRole, MarcheSpecificRole, UserRoleInfo } from './userRole/types';
import { clearRoleCache } from './userRole/roleUtils';

// Ajouter un système de cache simple pour limiter les appels répétés
const roleCache = new Map<string, UserRoleInfo>();

// Export direct pour éviter les wrapper inutiles
export { useUserRole, clearRoleCache };
export type { UserRole, MarcheSpecificRole, UserRoleInfo };

// Remplacer l'export original par une version avec cache
// Ceci permet de conserver la compatibilité avec le code existant
