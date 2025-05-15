
import { UserRole, MarcheSpecificRole } from './types';

/**
 * Vérifier si un utilisateur peut diffuser des documents dans un marché
 */
export function canDiffuseMarche(
  globalRole: UserRole | null,
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean {
  // Les admins peuvent tout faire
  if (globalRole === 'ADMIN') return true;
  
  // Si aucun marché n'est spécifié, vérifier le rôle global
  if (!marcheId) {
    return globalRole === 'MOE' || globalRole === 'MANDATAIRE';
  }
  
  // Vérifier le rôle spécifique au marché
  const marcheRole = marcheRoles[marcheId];
  return marcheRole === 'MOE' || marcheRole === 'MANDATAIRE';
}

/**
 * Vérifier si un utilisateur peut viser des documents dans un marché
 */
export function canVisaMarche(
  globalRole: UserRole | null,
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean {
  // Les admins peuvent tout faire
  if (globalRole === 'ADMIN') return true;
  
  // Si aucun marché n'est spécifié, vérifier le rôle global
  if (!marcheId) {
    return globalRole === 'MOE';
  }
  
  // Vérifier le rôle spécifique au marché
  const marcheRole = marcheRoles[marcheId];
  return marcheRole === 'MOE';
}

/**
 * Vérifier si un utilisateur peut gérer les rôles dans un marché
 */
export function canManageRolesMarche(
  globalRole: UserRole | null,
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean {
  // Les admins peuvent tout faire
  if (globalRole === 'ADMIN') return true;
  
  // Si aucun marché n'est spécifié, vérifier le rôle global
  if (!marcheId) {
    return globalRole === 'MOE';
  }
  
  // Vérifier le rôle spécifique au marché
  const marcheRole = marcheRoles[marcheId];
  return marcheRole === 'MOE';
}

/**
 * Vérifier si un utilisateur peut créer des marchés
 */
export function canCreateMarche(
  globalRole: UserRole | null
): boolean {
  // Les admins peuvent toujours créer des marchés
  if (globalRole === 'ADMIN') return true;
  
  // Les MOE et MANDATAIRE peuvent créer des marchés
  return globalRole === 'MOE' || globalRole === 'MANDATAIRE';
}

/**
 * Vérifier si un utilisateur peut créer des fascicules dans un marché
 */
export function canCreateFascicule(
  globalRole: UserRole | null,
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean {
  // Les admins peuvent tout faire
  if (globalRole === 'ADMIN') return true;
  
  // Si aucun marché n'est spécifié, vérifier le rôle global
  if (!marcheId) {
    return globalRole === 'MOE';
  }
  
  // Vérifier le rôle spécifique au marché
  const marcheRole = marcheRoles[marcheId];
  return marcheRole === 'MOE';
}
