
import { UserRole, MarcheSpecificRole } from './types';

/**
 * Determines if the user can diffuse documents on a specific market
 */
export const canDiffuseMarche = (
  globalRole: UserRole, 
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent diffuser sur tous les marchés
  if (globalRole === 'ADMIN') {
    console.log("ADMIN can always diffuse - granted");
    return true;
  }
  
  // Si aucun marché n'est spécifié, vérifier le rôle global
  if (!marcheId) {
    const result = globalRole === 'MANDATAIRE';
    console.log(`No market specified, checking global role: ${globalRole} - ${result ? 'granted' : 'denied'}`);
    return result;
  }
  
  // Sinon, vérifier le rôle spécifique pour ce marché
  const roleForMarche = marcheRoles[marcheId];
  console.log(`Checking market-specific role for ${marcheId}: ${roleForMarche}`);
  
  const result = roleForMarche === 'MANDATAIRE';
  console.log(`Can diffuse for market ${marcheId}: ${result ? 'granted' : 'denied'}`);
  return result;
};

/**
 * Determines if the user can visa documents on a specific market
 */
export const canVisaMarche = (
  globalRole: UserRole, 
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent viser sur tous les marchés
  if (globalRole === 'ADMIN') {
    console.log("ADMIN can always visa - granted");
    return true;
  }
  
  // Si aucun marché n'est spécifié, vérifier le rôle global
  if (!marcheId) {
    const result = globalRole === 'MOE';
    console.log(`No market specified, checking global role: ${globalRole} - ${result ? 'granted' : 'denied'}`);
    return result;
  }
  
  // Sinon, vérifier le rôle spécifique pour ce marché
  const roleForMarche = marcheRoles[marcheId];
  console.log(`Checking market-specific role for ${marcheId}: ${roleForMarche}`);
  
  const result = roleForMarche === 'MOE';
  console.log(`Can visa for market ${marcheId}: ${result ? 'granted' : 'denied'}`);
  return result;
};

/**
 * Determines if the user can create markets
 */
export const canCreateMarche = (globalRole: UserRole): boolean => {
  // Seuls les administrateurs et les MOE peuvent créer des marchés
  const result = globalRole === 'ADMIN' || globalRole === 'MOE';
  console.log(`Can create market with global role ${globalRole}: ${result ? 'granted' : 'denied'}`);
  return result;
};

/**
 * Determines if the user can manage roles on a specific market
 */
export const canManageRolesMarche = (
  globalRole: UserRole, 
  marcheRoles: Record<string, MarcheSpecificRole>,
  marcheId?: string
): boolean => {
  // Les administrateurs peuvent gérer les rôles sur tous les marchés
  if (globalRole === 'ADMIN') {
    console.log("ADMIN can always manage roles - granted");
    return true;
  }
  
  // Si aucun marché n'est spécifié et que l'utilisateur n'est pas admin, il ne peut pas gérer les rôles globaux
  if (!marcheId) {
    console.log("No market specified and user is not ADMIN - denied");
    return false;
  }
  
  // Les MOE peuvent gérer les rôles uniquement pour les marchés où ils sont MOE
  const roleForMarche = marcheRoles[marcheId];
  console.log(`Checking market-specific role for ${marcheId}: ${roleForMarche}`);
  
  const result = roleForMarche === 'MOE';
  console.log(`Can manage roles for market ${marcheId}: ${result ? 'granted' : 'denied'}`);
  return result;
};
