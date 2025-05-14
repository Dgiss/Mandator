
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRoleInfo, MarcheSpecificRole, UserRole } from './types';
import { useRoleFetcher } from './useRoleFetcher';
import { useAccessChecker } from './useAccessChecker';
import { useToast } from '@/hooks/use-toast';

// Create a simple cache to limit API calls
const roleCache = new Map<string, UserRoleInfo>();

export const useUserRole = (marcheId?: string) => {
  const { toast } = useToast();
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
    isMOE: fetcherIsMOE,
    isMandataire: fetcherIsMandataire
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

  // Helper method to check if user is MOE (either globally or for specified market)
  const isMOE = useCallback((specificMarcheId?: string) => {
    // Use the provided marcheId parameter, fallback to the hook's marcheId
    const targetMarcheId = specificMarcheId || marcheId;
    
    // Check if user is admin (admins can do everything)
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
    
    // Check if user is admin (admins can do everything)
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

  // Function to clear role cache (useful when role changes)
  const refreshRoles = useCallback(() => {
    // Clear the cache
    roleCache.clear();
    // Re-fetch roles
    setLoading(true);
    
    // Force a role check for the specific marché
    if (marcheId) {
      getMarcheRole(marcheId)
        .then(specificRole => {
          console.log(`Refreshed role for market ${marcheId}: ${specificRole}`);
          // Update the local state with the fetched role
          setMarcheRoles(prev => ({
            ...prev,
            [marcheId]: specificRole
          }));
        })
        .catch(err => {
          console.error(`Error refreshing role for market ${marcheId}:`, err);
          toast({
            title: "Erreur",
            description: "Impossible de rafraîchir vos droits",
            variant: "destructive",
          });
        });
    }
  }, [marcheId, getMarcheRole, toast]);

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
