
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, MarcheSpecificRole } from './types';
import { 
  globalRoleCache, 
  marketRoleCache,
  cacheGlobalRole, 
  cacheMarketRole,
  getCachedGlobalRole,
  getCachedMarketRole
} from './roleCache';
import { 
  fetchGlobalRole, 
  fetchAllMarketRoles, 
  fetchSpecificMarketRole 
} from '@/utils/auth/roleQueries';

/**
 * Optimized hook to fetch and manage user roles with efficient caching
 * to prevent redundant API calls and improve performance
 */
export function useRoleFetcher(marcheId?: string) {
  // Local state
  const [globalRole, setGlobalRole] = useState<UserRole>(getCachedGlobalRole() as UserRole || 'STANDARD');
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(!getCachedGlobalRole());
  const [rolesFetched, setRolesFetched] = useState(!!getCachedGlobalRole());
  
  // Get user from auth context
  const { user } = useAuth();
  
  // Refs to prevent infinite loops and track component mount status
  const fetchInProgressRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastMarcheIdRef = useRef<string | undefined>(marcheId);
  
  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  
  // Track marché ID changes
  useEffect(() => {
    if (lastMarcheIdRef.current !== marcheId) {
      lastMarcheIdRef.current = marcheId;
    }
  }, [marcheId]);
  
  // Main effect to fetch roles
  useEffect(() => {
    // Skip if we already have the data we need
    if (rolesFetched && (!marcheId || marcheRoles[marcheId] !== undefined || getCachedMarketRole(marcheId))) {
      // If we have the role in cache but not in state, update state
      if (marcheId && getCachedMarketRole(marcheId) && marcheRoles[marcheId] === undefined) {
        setMarcheRoles(prev => ({
          ...prev, 
          [marcheId]: getCachedMarketRole(marcheId) as MarcheSpecificRole
        }));
      }
      return;
    }
    
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) return;
    
    const fetchUserRole = async () => {
      // Double-check to prevent race conditions
      if (fetchInProgressRef.current) return;
      
      fetchInProgressRef.current = true;
      setLoading(true);
      
      try {
        if (!user) {
          if (isMountedRef.current) {
            setGlobalRole('STANDARD');
            setMarcheRoles({});
            setRolesFetched(true);
            setLoading(false);
          }
          fetchInProgressRef.current = false;
          return;
        }
        
        // Get global role (from cache or API)
        if (getCachedGlobalRole()) {
          if (isMountedRef.current) {
            setGlobalRole(getCachedGlobalRole() as UserRole);
          }
        } else {
          const userGlobalRole = await fetchGlobalRole(user.id);
          
          if (isMountedRef.current) {
            setGlobalRole(userGlobalRole);
          }
          cacheGlobalRole(userGlobalRole);
          
          // Early return for admins if no specific market is requested
          if (userGlobalRole === 'ADMIN' && !marcheId) {
            if (isMountedRef.current) {
              setRolesFetched(true);
              setLoading(false);
            }
            fetchInProgressRef.current = false;
            return;
          }
        }
        
        // Handle market-specific roles
        if (marcheId) {
          // Check cache first
          const cachedRole = getCachedMarketRole(marcheId);
          if (cachedRole !== undefined) {
            if (isMountedRef.current) {
              setMarcheRoles(prev => ({...prev, [marcheId]: cachedRole as MarcheSpecificRole}));
            }
          } else {
            // Fetch the specific role
            const specificRole = await fetchSpecificMarketRole(user.id, marcheId);
            
            if (isMountedRef.current) {
              setMarcheRoles(prev => ({...prev, [marcheId]: specificRole}));
            }
            cacheMarketRole(marcheId, specificRole);
          }
        } else {
          // Fetch all market roles
          const userMarcheRoles = await fetchAllMarketRoles(user.id);
          
          if (isMountedRef.current) {
            setMarcheRoles(userMarcheRoles);
          }
          
          // Update cache with all fetched roles
          Object.entries(userMarcheRoles).forEach(([id, role]) => {
            cacheMarketRole(id, role);
          });
        }
        
        if (isMountedRef.current) {
          setRolesFetched(true);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        if (isMountedRef.current) {
          setGlobalRole('STANDARD');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        fetchInProgressRef.current = false;
      }
    };
    
    // Use a small delay to debounce multiple rapid requests
    const timeoutId = setTimeout(() => {
      fetchUserRole();
    }, 50);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, marcheId, rolesFetched, marcheRoles]);

  // Get a market role (with caching)
  const getMarcheRole = useCallback(async (marketId: string): Promise<MarcheSpecificRole> => {
    if (!user) return null;
    
    // Return from state if available
    if (marcheRoles[marketId] !== undefined) {
      return marcheRoles[marketId];
    }
    
    // Check cache
    const cachedRole = getCachedMarketRole(marketId);
    if (cachedRole !== undefined) {
      if (isMountedRef.current) {
        setMarcheRoles(prev => ({...prev, [marketId]: cachedRole as MarcheSpecificRole}));
      }
      return cachedRole as MarcheSpecificRole;
    }
    
    // Fetch from API
    try {
      const role = await fetchSpecificMarketRole(user.id, marketId);
      
      // Update state and cache
      if (isMountedRef.current) {
        setMarcheRoles(prev => ({...prev, [marketId]: role}));
      }
      cacheMarketRole(marketId, role);
      return role;
    } catch (error) {
      console.error('Error fetching market role:', error);
      return null;
    }
  }, [user, marcheRoles]);

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
