
import { useCallback, useMemo } from 'react';
import { UserRole, MarcheSpecificRole } from './types';
import { 
  canDiffuseMarche, 
  canVisaMarche, 
  canCreateMarche as checkCanCreateMarche, 
  canManageRolesMarche,
  canCreateFascicule as checkCanCreateFascicule
} from './permissions';

/**
 * Optimized hook for checking various access permissions based on user roles
 * Uses memoization to prevent excessive recalculations and improve performance
 */
export function useAccessChecker(
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>
) {
  // Fast access check for Admin users
  const isAdmin = useMemo(() => globalRole === 'ADMIN', [globalRole]);
  
  // Check if user can diffuse documents on a market
  const canDiffuse = useCallback((marcheId?: string) => {
    // Fast path for admins
    if (isAdmin) return true;
    
    return canDiffuseMarche(globalRole, marcheRoles, marcheId);
  }, [globalRole, marcheRoles, isAdmin]);
  
  // Check if user can visa documents on a market
  const canVisa = useCallback((marcheId?: string) => {
    // Fast path for admins
    if (isAdmin) return true;
    
    return canVisaMarche(globalRole, marcheRoles, marcheId);
  }, [globalRole, marcheRoles, isAdmin]);
  
  // Check if user can manage roles on a market
  const canManageRoles = useCallback((marcheId?: string) => {
    // Fast path for admins
    if (isAdmin) return true;
    
    // Fast path for MOE on specific market
    if (marcheId && marcheRoles[marcheId] === 'MOE') {
      return true;
    }
    
    return canManageRolesMarche(globalRole, marcheRoles, marcheId);
  }, [globalRole, marcheRoles, isAdmin]);
  
  // Check if user can create markets (global permission)
  // Memoize result to avoid unnecessary recalculations
  const canCreateMarche = useMemo(() => {
    return isAdmin || checkCanCreateMarche(globalRole);
  }, [globalRole, isAdmin]);
  
  // Check if user can create fascicules for a market
  const canCreateFascicule = useCallback((marcheId?: string) => {
    // Fast path for admins
    if (isAdmin) return true;
    
    // Fast path for MOE on specific market
    if (marcheId && marcheRoles[marcheId] === 'MOE') {
      return true;
    }
    
    return checkCanCreateFascicule(globalRole, marcheRoles, marcheId);
  }, [globalRole, marcheRoles, isAdmin]);
  
  return {
    canDiffuse,
    canVisa,
    canManageRoles,
    canCreateMarche,
    canCreateFascicule
  };
}
