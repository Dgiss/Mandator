
import { useCallback } from 'react';
import { UserRole, MarcheSpecificRole } from './types';
import { 
  canDiffuseMarche, 
  canVisaMarche, 
  canCreateMarche as checkCanCreateMarche, 
  canManageRolesMarche,
  canCreateFascicule as checkCanCreateFascicule
} from './permissions';

/**
 * Hook for checking various access permissions based on user roles
 * Optimized to prevent excessive logging and infinite loop issues
 */
export function useAccessChecker(
  globalRole: UserRole,
  marcheRoles: Record<string, MarcheSpecificRole>
) {
  // Check if user can diffuse documents on a market
  const canDiffuse = useCallback((marcheId?: string) => {
    // Fast path for admins to prevent unnecessary processing
    if (globalRole === 'ADMIN') {
      return true;
    }
    
    const result = canDiffuseMarche(globalRole, marcheRoles, marcheId);
    return result;
  }, [globalRole, marcheRoles]);
  
  // Check if user can visa documents on a market
  const canVisa = useCallback((marcheId?: string) => {
    // Fast path for admins to prevent unnecessary processing
    if (globalRole === 'ADMIN') {
      return true;
    }
    
    const result = canVisaMarche(globalRole, marcheRoles, marcheId);
    return result;
  }, [globalRole, marcheRoles]);
  
  // Check if user can manage roles on a market
  const canManageRoles = useCallback((marcheId?: string) => {
    // Admins can always manage roles
    if (globalRole === 'ADMIN') {
      return true;
    }
    
    // Check specific market role
    if (marcheId && marcheRoles[marcheId] === 'MOE') {
      return true;
    }
    
    const result = canManageRolesMarche(globalRole, marcheRoles, marcheId);
    return result;
  }, [globalRole, marcheRoles]);
  
  // Check if user can create markets (global permission)
  // Memoize result to avoid unnecessary recalculations
  const canCreateMarche = checkCanCreateMarche(globalRole);
  
  // Check if user can create fascicules for a market
  const canCreateFascicule = useCallback((marcheId?: string) => {
    // Fast path for admins
    if (globalRole === 'ADMIN') {
      return true;
    }
    
    const result = checkCanCreateFascicule(globalRole, marcheRoles, marcheId);
    return result;
  }, [globalRole, marcheRoles]);
  
  return {
    canDiffuse,
    canVisa,
    canManageRoles,
    canCreateMarche,
    canCreateFascicule
  };
}
