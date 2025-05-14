
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRoleInfo, MarcheSpecificRole, UserRole } from './types';
import { useRoleFetcher } from './useRoleFetcher';
import { useAccessChecker } from './useAccessChecker';

// Create a simple cache to limit API calls
const roleCache = new Map<string, UserRoleInfo>();

export const useUserRole = (marcheId?: string) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use our specialized hooks
  const { 
    role: fetchedRole, 
    loading: roleLoading, 
    marcheRoles: fetchedRoles,
    getMarcheRole,
    isAdmin,
    isMOE,
    isMandataire 
  } = useRoleFetcher(marcheId);
  
  const { 
    canDiffuse,
    canVisa,
    canManageRoles,
    canCreateMarche 
  } = useAccessChecker(
    fetchedRole as UserRole,
    fetchedRoles
  );

  // Add a canEdit function for backwards compatibility
  const canEdit = useCallback((marcheId?: string) => {
    return canDiffuse(marcheId);
  }, [canDiffuse]);

  // Update local state when fetched data changes
  useEffect(() => {
    if (!roleLoading) {
      setRole(fetchedRole as UserRole);
      setMarcheRoles(fetchedRoles);
      setLoading(false);
    }
  }, [fetchedRole, fetchedRoles, roleLoading]);

  // Function to clear role cache (useful when role changes)
  const refreshRoles = useCallback(() => {
    // Clear the cache
    roleCache.delete('userInfo');
    // Re-fetch roles
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
    getMarcheRole,
    isAdmin,
    isMOE,
    isMandataire
  };
};
