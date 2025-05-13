
import { UserRole, MarcheSpecificRole } from './types';

/**
 * Optimized function to determine if the user can diffuse documents on a specific market
 * Reduced logging to prevent console spam
 */
export const canDiffuseMarche = (
  globalRole: UserRole, 
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent diffuser sur tous les marchés
  if (globalRole === 'ADMIN') {
    return true;
  }
  
  // Si aucun marché n'est spécifié, vérifier le rôle global
  if (!marcheId) {
    return globalRole === 'MANDATAIRE';
  }
  
  // Sinon, vérifier le rôle spécifique pour ce marché
  const roleForMarche = marcheRoles[marcheId];
  return roleForMarche === 'MANDATAIRE';
};

/**
 * Optimized function to determine if the user can visa documents on a specific market
 * Reduced logging to prevent console spam
 */
export const canVisaMarche = (
  globalRole: UserRole, 
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent viser sur tous les marchés
  if (globalRole === 'ADMIN') {
    return true;
  }
  
  // Si aucun marché n'est spécifié, vérifier le rôle global
  if (!marcheId) {
    return globalRole === 'MOE';
  }
  
  // Sinon, vérifier le rôle spécifique pour ce marché
  const roleForMarche = marcheRoles[marcheId];
  return roleForMarche === 'MOE';
};

/**
 * Determines if the user can create markets
 * Made more efficient by avoiding unnecessary logging
 */
export const canCreateMarche = (globalRole: UserRole): boolean => {
  // Seuls les administrateurs et les MOE peuvent créer des marchés
  return globalRole === 'ADMIN' || globalRole === 'MOE';
};

/**
 * Determines if the user can manage roles on a specific market
 * Optimized for performance
 */
export const canManageRolesMarche = (
  globalRole: UserRole, 
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent gérer les rôles sur tous les marchés
  if (globalRole === 'ADMIN') {
    return true;
  }
  
  // Si aucun marché n'est spécifié et que l'utilisateur n'est pas admin, il ne peut pas gérer les rôles globaux
  if (!marcheId) {
    return false;
  }
  
  // Les MOE peuvent gérer les rôles uniquement pour les marchés où ils sont MOE
  const roleForMarche = marcheRoles[marcheId];
  return roleForMarche === 'MOE';
};
