
import { UserRole, MarcheSpecificRole } from './types';

/**
 * Vérifie si l'utilisateur peut diffuser un document pour un marché spécifique
 */
export const canDiffuseMarche = (
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>, 
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent toujours diffuser
  if (globalRole === 'ADMIN') {
    return true;
  }
  
  // Si nous avons un ID de marché, vérifions le rôle spécifique pour ce marché
  if (marcheId && marcheRoles[marcheId]) {
    // Les MOE peuvent diffuser
    if (marcheRoles[marcheId] === 'MOE') {
      return true;
    }
  }

  // Par défaut, le rôle global MOE peut diffuser, mais pas les autres
  return globalRole === 'MOE';
};

/**
 * Vérifie si l'utilisateur peut viser un document pour un marché spécifique
 */
export const canVisaMarche = (
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>, 
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent toujours viser
  if (globalRole === 'ADMIN') {
    return true;
  }
  
  // Si nous avons un ID de marché, vérifions le rôle spécifique pour ce marché
  if (marcheId && marcheRoles[marcheId]) {
    // Les MANDATAIRES peuvent viser
    if (marcheRoles[marcheId] === 'MANDATAIRE') {
      return true;
    }
  }

  // Par défaut, le rôle global MANDATAIRE peut viser
  return globalRole === 'MANDATAIRE';
};

/**
 * Vérifie si l'utilisateur peut gérer les rôles pour un marché spécifique
 */
export const canManageRolesMarche = (
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>, 
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent toujours gérer les rôles
  if (globalRole === 'ADMIN') {
    return true;
  }
  
  // Si nous avons un ID de marché, vérifions le rôle spécifique pour ce marché
  if (marcheId && marcheRoles[marcheId]) {
    // Les MOE peuvent gérer les rôles de leur marché
    if (marcheRoles[marcheId] === 'MOE') {
      return true;
    }
  }

  // Par défaut, seuls les administrateurs et les MOE peuvent gérer les rôles
  return globalRole === 'MOE';
};

/**
 * Vérifie si l'utilisateur peut créer des marchés
 */
export const canCreateMarche = (globalRole: UserRole): boolean => {
  // Seuls les administrateurs et les MOE peuvent créer des marchés
  return globalRole === 'ADMIN' || globalRole === 'MOE';
};

/**
 * Vérifie si l'utilisateur peut créer des fascicules pour un marché spécifique
 */
export const canCreateFascicule = (
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>, 
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent toujours créer des fascicules
  if (globalRole === 'ADMIN') {
    return true;
  }
  
  // Si nous avons un ID de marché, vérifions le rôle spécifique pour ce marché
  if (marcheId && marcheRoles[marcheId]) {
    // Les MOE peuvent créer des fascicules pour leur marché
    if (marcheRoles[marcheId] === 'MOE') {
      return true;
    }
  }

  // Par défaut, seuls les administrateurs et les MOE peuvent créer des fascicules
  return globalRole === 'MOE';
};
