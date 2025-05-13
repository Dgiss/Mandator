
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
    const result = canDiffuseMarche(globalRole, marcheRoles, marcheId);
    console.log(`canDiffuse check for market ${marcheId}: ${result} (Global role: ${globalRole}, Market role: ${marcheId ? marcheRoles[marcheId] : 'N/A'})`);
    return result;
  };
  
  // Check if user can visa documents on a market
  const canVisa = (marcheId?: string) => {
    const result = canVisaMarche(globalRole, marcheRoles, marcheId);
    console.log(`canVisa check for market ${marcheId}: ${result} (Global role: ${globalRole}, Market role: ${marcheId ? marcheRoles[marcheId] : 'N/A'})`);
    return result;
  };
  
  // Check if user can manage roles on a market
  const canManageRoles = (marcheId?: string) => {
    // Admins can always manage roles
    if (globalRole === 'ADMIN') {
      console.log(`canManageRoles check for market ${marcheId}: true (User is ADMIN)`);
      return true;
    }
    
    // Check specific market role
    if (marcheId && marcheRoles[marcheId] === 'MOE') {
      console.log(`canManageRoles check for market ${marcheId}: true (User is MOE for this market)`);
      return true;
    }
    
    const result = canManageRolesMarche(globalRole, marcheRoles, marcheId);
    console.log(`canManageRoles check for market ${marcheId}: ${result} (Global role: ${globalRole}, Market role: ${marcheId ? marcheRoles[marcheId] : 'N/A'})`);
    return result;
  };
  
  // Check if user can create markets (global permission)
  const canCreateMarche = checkCanCreateMarche(globalRole);
  console.log(`canCreateMarche check: ${canCreateMarche} (Global role: ${globalRole})`);
  
  return {
    canDiffuse,
    canVisa,
    canManageRoles,
    canCreateMarche
  };
}
