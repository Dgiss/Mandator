import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, MarcheSpecificRole } from './types';
import { fetchMarcheRoles, fetchMarcheRole } from './roleUtils';

const roleCache: Record<string, MarcheSpecificRole> = {};
const globalRoleCache: {role?: UserRole} = {};

/**
 * Hook to fetch and manage user roles with caching to prevent redundant fetching
 */
export function useRoleFetcher(marcheId?: string) {
  const [globalRole, setGlobalRole] = useState<UserRole>(globalRoleCache.role || 'STANDARD');
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(!globalRoleCache.role);
  const [rolesFetched, setRolesFetched] = useState(!!globalRoleCache.role);
  const { user } = useAuth();
  const fetchInProgressRef = useRef(false);
  
  // Fetch the user's global role and market-specific roles
  useEffect(() => {
    // Skip if we've already fetched roles and have data for the requested marcheId
    if (
      rolesFetched && 
      (marcheId ? marcheRoles[marcheId] !== undefined || roleCache[marcheId] !== undefined : true)
    ) {
      // If we have cached data for the requested marcheId, use it
      if (marcheId && roleCache[marcheId] !== undefined) {
        setMarcheRoles(prev => ({...prev, [marcheId]: roleCache[marcheId]}));
      }
      return;
    }
    
    // Prevent multiple fetches running simultaneously
    if (fetchInProgressRef.current) return;
    
    const fetchUserRole = async () => {
      if (fetchInProgressRef.current) return;
      fetchInProgressRef.current = true;
      setLoading(true);
      
      try {
        if (!user) {
          setGlobalRole('STANDARD');
          setMarcheRoles({});
          setRolesFetched(true);
          setLoading(false);
          fetchInProgressRef.current = false;
          return;
        }
        
        // If we already have the global role cached, use it
        if (globalRoleCache.role) {
          setGlobalRole(globalRoleCache.role);
        } else {
          // First check if user is ADMIN (this overrides everything else)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role_global')
            .eq('id', user.id)
            .single();
            
          if (!profileError && profileData) {
            const userGlobalRole = profileData.role_global ? 
              String(profileData.role_global).toUpperCase() : 'STANDARD';
            setGlobalRole(userGlobalRole as UserRole);
            globalRoleCache.role = userGlobalRole as UserRole;
            
            // If user is ADMIN, they might not need specific market roles
            if (userGlobalRole === 'ADMIN' && !marcheId) {
              setRolesFetched(true);
              setLoading(false);
              fetchInProgressRef.current = false;
              return;
            }
          } else {
            // Fallback to RPC if direct query fails
            const { data, error } = await supabase.rpc('get_user_global_role');
            
            if (error) {
              console.error('Error fetching global role:', error);
              setGlobalRole('STANDARD');
              globalRoleCache.role = 'STANDARD';
            } else {
              // Normalize the role
              const userGlobalRole = data ? String(data).toUpperCase() : 'STANDARD';
              setGlobalRole(userGlobalRole as UserRole);
              globalRoleCache.role = userGlobalRole as UserRole;
            }
          }
        }
        
        // If a marcheId is provided, fetch the specific role for that market
        if (marcheId) {
          // Check cache first
          if (roleCache[marcheId] !== undefined) {
            setMarcheRoles(prev => ({...prev, [marcheId]: roleCache[marcheId]}));
          } else {
            const specificRole = await fetchMarcheRole(user.id, marcheId);
            console.log(`Fetched specific role for market ${marcheId}:`, specificRole);
            setMarcheRoles(prev => ({...prev, [marcheId]: specificRole}));
            roleCache[marcheId] = specificRole;
          }
        } else {
          // Otherwise, fetch all market roles for the user
          const userMarcheRoles = await fetchMarcheRoles(user.id);
          console.log("Fetched all market roles:", userMarcheRoles);
          setMarcheRoles(userMarcheRoles);
          
          // Update cache with all fetched roles
          Object.keys(userMarcheRoles).forEach(id => {
            roleCache[id] = userMarcheRoles[id];
          });
        }
        
        setRolesFetched(true);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setGlobalRole('STANDARD');
      } finally {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    };
    
    fetchUserRole();
  }, [user, marcheId, rolesFetched]);

  // Function to fetch a specific market role (with caching)
  const getMarcheRole = useCallback(async (marcheId: string): Promise<MarcheSpecificRole> => {
    if (!user) return null;
    
    // If the role is already cached, return it
    if (marcheRoles[marcheId] !== undefined) {
      console.log(`Using cached role for market ${marcheId}:`, marcheRoles[marcheId]);
      return marcheRoles[marcheId];
    }
    
    if (roleCache[marcheId] !== undefined) {
      console.log(`Using global cache for market ${marcheId}:`, roleCache[marcheId]);
      setMarcheRoles(prev => ({...prev, [marcheId]: roleCache[marcheId]}));
      return roleCache[marcheId];
    }
    
    // Otherwise, fetch from the database
    try {
      console.log(`Fetching role for market ${marcheId}...`);
      const role = await fetchMarcheRole(user.id, marcheId);
      console.log(`Fetched role for market ${marcheId}:`, role);
      
      // Update both local and global cache
      setMarcheRoles(prev => ({...prev, [marcheId]: role}));
      roleCache[marcheId] = role;
      return role;
    } catch (error) {
      console.error('Error fetching market role:', error);
      return null;
    }
  }, [user, marcheRoles]);

  // Simplified and limited logging to avoid log spam
  console.log("Current global role:", globalRole);

  return {
    role: globalRole,
    loading,
    marcheRoles,
    getMarcheRole,
    isAdmin: globalRole === 'ADMIN',
    isMOE: globalRole === 'MOE',
    isMandataire: globalRole === 'MANDATAIRE'
  };
}
