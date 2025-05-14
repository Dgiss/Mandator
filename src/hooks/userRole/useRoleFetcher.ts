
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole, MarcheSpecificRole } from './types';

export function useRoleFetcher(marcheId?: string) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to get global role
  const fetchGlobalRole = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        return null;
      }

      // First try direct function call for global role (safer to avoid RLS issues)
      try {
        const { data: globalRoleData, error: rpcError } = await supabase
          .rpc('get_user_global_role');
          
        if (!rpcError && globalRoleData) {
          const globalRole = globalRoleData as UserRole;
          setRole(globalRole);
          return globalRole;
        }
      } catch (rpcErr) {
        console.error("Error using RPC for global role:", rpcErr);
        // Fall back to direct query
      }
      
      // Direct query as fallback
      const { data, error } = await supabase
        .from('profiles')
        .select('role_global')
        .eq('id', user.id)
        .maybeSingle();  // Use maybeSingle instead of single

      if (error) {
        console.error('Error fetching global role:', error);
        return null;
      }

      const globalRole = data?.role_global as UserRole;
      setRole(globalRole);
      return globalRole;
    } catch (err) {
      console.error('Exception fetching global role:', err);
      setError(err as Error);
      return null;
    }
  }, []);

  // Function to get specific role for a market
  const getMarcheRole = useCallback(async (specificMarcheId: string): Promise<MarcheSpecificRole> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First check if we already have this role cached locally
      if (marcheRoles[specificMarcheId]) {
        return marcheRoles[specificMarcheId];
      }

      // Try using the secure RPC function first
      try {
        const { data, error } = await supabase
          .rpc('get_user_role_for_marche', { marche_id: specificMarcheId });

        if (error) {
          console.error(`Error using RPC for market ${specificMarcheId}:`, error);
          // Fall back to direct query
        } else {
          // Update local role cache
          setMarcheRoles(prev => ({
            ...prev,
            [specificMarcheId]: data as MarcheSpecificRole
          }));
          return data as MarcheSpecificRole;
        }
      } catch (rpcErr) {
        console.error(`Error in RPC for market ${specificMarcheId}:`, rpcErr);
        // Fall back to direct query
      }
      
      // Direct query as fallback
      const { data, error } = await supabase
        .from('droits_marche')
        .select('role_specifique')
        .eq('user_id', user.id)
        .eq('marche_id', specificMarcheId)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching role for market ${specificMarcheId}:`, error);
        return null;
      }

      const specificRole = data?.role_specifique as MarcheSpecificRole;
      
      // Update local role cache
      setMarcheRoles(prev => ({
        ...prev,
        [specificMarcheId]: specificRole
      }));

      return specificRole;
    } catch (err) {
      console.error(`Exception fetching role for market ${specificMarcheId}:`, err);
      return null;
    }
  }, [marcheRoles]);

  // Load roles on startup
  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      
      // 1. Load global role
      const globalRole = await fetchGlobalRole();
      
      // 2. If a marcheId is provided, also load the specific role
      if (marcheId) {
        await getMarcheRole(marcheId);
      }
      
      setLoading(false);
    };

    loadRoles();
  }, [fetchGlobalRole, getMarcheRole, marcheId]);

  // Helpers for checking roles
  const isAdmin = role === 'ADMIN';
  const isMOE = useCallback((specificMarcheId?: string) => {
    // Admin can always do everything
    if (role === 'ADMIN') return true;
    
    // Check global role
    if (role === 'MOE') return true;
    
    // Check specific role for this market
    const targetMarcheId = specificMarcheId || marcheId;
    if (targetMarcheId && marcheRoles[targetMarcheId] === 'MOE') {
      return true;
    }
    
    return false;
  }, [role, marcheId, marcheRoles]);
  
  const isMandataire = useCallback((specificMarcheId?: string) => {
    // Admin can always do everything
    if (role === 'ADMIN') return true;
    
    // Check global role
    if (role === 'MANDATAIRE') return true;
    
    // Check specific role for this market
    const targetMarcheId = specificMarcheId || marcheId;
    if (targetMarcheId && marcheRoles[targetMarcheId] === 'MANDATAIRE') {
      return true;
    }
    
    return false;
  }, [role, marcheId, marcheRoles]);

  return {
    role,
    marcheRoles,
    loading,
    error,
    getMarcheRole,
    isAdmin,
    isMOE,
    isMandataire
  };
}
