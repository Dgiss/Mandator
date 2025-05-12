
import { UserRole, MarcheSpecificRole } from './types';
import { canDiffuseMarche, canVisaMarche, canCreateMarche as checkCanCreateMarche, canManageRolesMarche } from './permissions';

/**
 * Hook for checking various access permissions based on user roles
 */
export function useAccessChecker(
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>
) {
  // Check if user can diffuse documents on a market
  const canDiffuse = (marcheId?: string) => {
    return canDiffuseMarche(globalRole, marcheRoles, marcheId);
  };
  
  // Check if user can visa documents on a market
  const canVisa = (marcheId?: string) => {
    return canVisaMarche(globalRole, marcheRoles, marcheId);
  };
  
  // Check if user can manage roles on a market
  const canManageRoles = (marcheId?: string) => {
    return canManageRolesMarche(globalRole, marcheRoles, marcheId);
  };
  
  // Check if user can create markets (global permission)
  const canCreateMarche = checkCanCreateMarche(globalRole);
  
  return {
    canDiffuse,
    canVisa,
    canManageRoles,
    canCreateMarche
  };
}
