
/**
 * Permission checking utility functions
 * These are optimized versions of the functions from roleUtils.ts
 */
import { MarcheSpecificRole, UserRole } from './types';

/**
 * Vérifie si un utilisateur peut diffuser des documents sur un marché
 */
export const canDiffuseMarche = (
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Admin peut tout faire
  if (globalRole === 'ADMIN') return true;
  
  // Si pas d'ID de marché spécifié, vérifier le rôle global
  if (!marcheId) {
    return ['MOE', 'MANDATAIRE'].includes(globalRole);
  }
  
  // Vérifier le rôle spécifique au marché s'il existe
  const specificRole = marcheRoles[marcheId];
  if (!specificRole) return false;
  
  return ['MOE', 'MANDATAIRE'].includes(specificRole);
};

/**
 * Vérifie si un utilisateur peut viser des documents sur un marché
 */
export const canVisaMarche = (
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Admin peut tout faire
  if (globalRole === 'ADMIN') return true;
  
  // Si pas d'ID de marché spécifié, vérifier le rôle global
  if (!marcheId) {
    return ['CONTROLEUR', 'MANDATAIRE'].includes(globalRole);
  }
  
  // Vérifier le rôle spécifique au marché s'il existe
  const specificRole = marcheRoles[marcheId];
  if (!specificRole) return false;
  
  return ['CONTROLEUR', 'MANDATAIRE'].includes(specificRole);
};

/**
 * Vérifie si un utilisateur peut gérer les rôles sur un marché
 */
export const canManageRolesMarche = (
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Admin peut tout faire
  if (globalRole === 'ADMIN') return true;
  
  // MOE a des droits de gestion sur son marché
  if (marcheId && marcheRoles[marcheId] === 'MOE') {
    return true;
  }
  
  // Par défaut, seuls les admins peuvent gérer les rôles
  return false;
};

/**
 * Vérifie si un utilisateur peut créer des marchés
 */
export const canCreateMarche = (globalRole: UserRole): boolean => {
  // Seuls les ADMIN, MOE et MANDATAIRE peuvent créer des marchés
  return ['ADMIN', 'MOE', 'MANDATAIRE'].includes(globalRole);
};

/**
 * Vérifie si un utilisateur peut créer des fascicules pour un marché
 */
export const canCreateFascicule = (
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Admin peut tout faire
  if (globalRole === 'ADMIN') return true;
  
  // Si pas d'ID de marché spécifié, vérifier le rôle global
  if (!marcheId) {
    return ['MOE'].includes(globalRole);
  }
  
  // Vérifier spécifiquement si l'utilisateur est MOE sur ce marché
  return marcheRoles[marcheId] === 'MOE';
};
