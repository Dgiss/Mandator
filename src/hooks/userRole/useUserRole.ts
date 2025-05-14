
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRoleInfo, MarcheSpecificRole, UserRole } from './types';
import { useRoleFetcher } from './useRoleFetcher';
import { useAccessChecker } from './useAccessChecker';

// Create a simple cache to limit API calls
const roleCache = new Map<string, UserRoleInfo>();

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use our specialized hooks
  const { fetchGlobalRole, fetchMarcheRoles } = useRoleFetcher();
  const { canEdit, canDiffuse, canVisa } = useAccessChecker(role, marcheRoles);

  // Fetch the user's global role
  const fetchUserRole = useCallback(async () => {
    // Check if we have this info in cache
    const cachedUserInfo = roleCache.get('userInfo');
    if (cachedUserInfo) {
      setRole(cachedUserInfo.globalRole);
      setMarcheRoles(cachedUserInfo.marcheSpecificRoles || {});
      setLoading(false);
      return;
    }

    try {
      // Get the global role
      const globalRole = await fetchGlobalRole();
      setRole(globalRole);

      // Get all marché-specific roles
      const specificRoles = await fetchMarcheRoles();
      setMarcheRoles(specificRoles);

      // Store in cache
      roleCache.set('userInfo', {
        globalRole,
        marcheSpecificRoles: specificRoles
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching role'));
      setLoading(false);
    }
  }, [fetchGlobalRole, fetchMarcheRoles]);

  // Fetch role on mount
  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  // Function to clear role cache (useful when role changes)
  const refreshRoles = useCallback(() => {
    // Clear the cache
    roleCache.delete('userInfo');
    // Re-fetch roles
    setLoading(true);
    fetchUserRole();
  }, [fetchUserRole]);

  return {
    role,
    marcheRoles,
    loading,
    error,
    refreshRoles,
    canEdit,
    canDiffuse,
    canVisa
  };
};
