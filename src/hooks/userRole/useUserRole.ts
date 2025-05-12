
import { useRoleFetcher } from './useRoleFetcher';
import { useAccessChecker } from './useAccessChecker';
import { UserRole, MarcheSpecificRole, UserRoleInfo } from './types';

/**
 * Main hook for user role management, combining role fetching and access checking
 */
export function useUserRole(marcheId?: string): UserRoleInfo {
  // Get role information
  const { 
    role, 
    loading, 
    marcheRoles, 
    getMarcheRole,
    isAdmin,
    isMOE,
    isMandataire
  } = useRoleFetcher(marcheId);
  
  // Get access checking functions
  const { 
    canDiffuse, 
    canVisa, 
    canManageRoles, 
    canCreateMarche 
  } = useAccessChecker(role, marcheRoles);
  
  return {
    role,
    loading,
    isAdmin,
    isMOE,
    isMandataire,
    canCreateMarche,
    canDiffuse,
    canVisa,
    canManageRoles,
    getMarcheRole
  };
}
