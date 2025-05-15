
import { useState, useEffect, useCallback } from 'react';
import { UserRoleInfo, MarcheSpecificRole, UserRole } from './types';
import { useRoleFetcher } from './useRoleFetcher';
import { useAccessChecker } from './useAccessChecker';
import { clearRoleCache } from './roleCache';

/**
 * Main hook for accessing and managing user roles throughout the application
 * @param marcheId Optional market ID to get specific permissions for
 */
export const useUserRole = (marcheId?: string) => {
  // Local state
  const [role, setRole] = useState<UserRole | null>(null);
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use specialized hooks
  const { 
    role: fetchedRole, 
    loading: roleLoading, 
    marcheRoles: fetchedRoles,
    getMarcheRole,
    isAdmin,
    isMOE: fetcherIsMOE,
    isMandataire: fetcherIsMandataire
  } = useRoleFetcher(marcheId);
  
  const { 
    canDiffuse,
    canVisa,
    canManageRoles,
    canCreateMarche,
    canCreateFascicule
  } = useAccessChecker(
    fetchedRole as UserRole,
    fetchedRoles
  );

  // Legacy compatibility - canEdit is now an alias for canDiffuse
  const canEdit = useCallback((specificMarcheId?: string) => {
    return canDiffuse(specificMarcheId || marcheId);
  }, [canDiffuse, marcheId]);

  // Helper method to check if user is MOE (either globally or for specified market)
  const isMOE = useCallback((specificMarcheId?: string) => {
    // Use the provided marcheId parameter, fallback to the hook's marcheId
    const targetMarcheId = specificMarcheId || marcheId;
    
    // Fast path: admins can do everything
    if (fetchedRole === 'ADMIN') return true;
    
    // Check global role
    if (fetchedRole === 'MOE') return true;
    
    // Check market-specific role if we have a marcheId
    if (targetMarcheId && fetchedRoles[targetMarcheId] === 'MOE') {
      return true;
    }
    
    return false;
  }, [fetchedRole, fetchedRoles, marcheId]);

  // Helper method to check if user is MANDATAIRE
  const isMandataire = useCallback((specificMarcheId?: string) => {
    // Use the provided marcheId parameter, fallback to the hook's marcheId
    const targetMarcheId = specificMarcheId || marcheId;
    
    // Fast path: admins can do everything
    if (fetchedRole === 'ADMIN') return true;
    
    // Check global role
    if (fetchedRole === 'MANDATAIRE') return true;
    
    // Check market-specific role if we have a marcheId
    if (targetMarcheId && fetchedRoles[targetMarcheId] === 'MANDATAIRE') {
      return true;
    }
    
    return false;
  }, [fetchedRole, fetchedRoles, marcheId]);

  // Update local state when fetched data changes
  useEffect(() => {
    if (!roleLoading) {
      setRole(fetchedRole as UserRole);
      setMarcheRoles(fetchedRoles);
      setLoading(false);
    }
  }, [fetchedRole, fetchedRoles, roleLoading]);

  // Function to clear role cache and refresh roles
  const refreshRoles = useCallback(() => {
    clearRoleCache();
    setLoading(true);
  }, []);

  return {
    role,
    marcheRoles,
    loading,
    error,
    refreshRoles,
    canEdit,
    canDiffuse,
    canVisa,
    canManageRoles,
    canCreateMarche,
    canCreateFascicule,
    getMarcheRole,
    isAdmin,
    isMOE,
    isMandataire
  };
};
