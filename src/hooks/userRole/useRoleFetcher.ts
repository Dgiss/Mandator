
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, MarcheSpecificRole } from './types';
import { fetchMarcheRoles, fetchMarcheRole } from './roleUtils';

// Cache global pour éviter les appels redondants
const roleCache: Record<string, MarcheSpecificRole> = {};
const globalRoleCache: {role?: UserRole} = {};

/**
 * Hook to fetch and manage user roles with caching to prevent redundant fetching
 */
export function useRoleFetcher(marcheId?: string) {
  // États locaux qui peuvent causer des rendus
  const [globalRole, setGlobalRole] = useState<UserRole>(globalRoleCache.role || 'STANDARD');
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(!globalRoleCache.role);
  const [rolesFetched, setRolesFetched] = useState(!!globalRoleCache.role);
  
  // Accès aux données utilisateur
  const { user } = useAuth();
  
  // Références pour éviter des boucles infinies
  const fetchInProgressRef = useRef(false);
  const fetchRetryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const lastMarcheIdRef = useRef<string | undefined>(marcheId);
  
  // Effet pour suivre si le composant est monté
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  
  // Effet pour détecter les changements de marcheId
  useEffect(() => {
    if (lastMarcheIdRef.current !== marcheId) {
      lastMarcheIdRef.current = marcheId;
    }
  }, [marcheId]);
  
  // Optimisation: limiter le nombre d'appels consécutifs de logs
  const logCountRef = useRef(0);
  const throttledConsoleLog = useCallback((message: string) => {
    if (logCountRef.current % 10 === 0) {
      console.log(message);
    }
    logCountRef.current++;
    if (logCountRef.current > 1000) logCountRef.current = 0;
  }, []);
  
  // Fetch the user's global role and market-specific roles
  useEffect(() => {
    // Skip if we've already fetched roles and have data for the requested marcheId
    if (
      rolesFetched && 
      (marcheId ? marcheRoles[marcheId] !== undefined || roleCache[marcheId] !== undefined : true)
    ) {
      // Si nous avons déjà les données en cache, pas besoin de refaire un appel
      if (marcheId && roleCache[marcheId] !== undefined) {
        setMarcheRoles(prev => {
          // Vérifier si l'état a changé pour éviter des mises à jour inutiles
          if (prev[marcheId] === roleCache[marcheId]) return prev;
          return {...prev, [marcheId]: roleCache[marcheId]};
        });
      }
      return;
    }
    
    // Stopper si un fetch est déjà en cours pour éviter les appels multiples
    if (fetchInProgressRef.current) return;
    
    // Limiter le nombre de tentatives pour éviter les boucles infinies
    if (fetchRetryCountRef.current > 5) {
      console.warn('Too many role fetch attempts, stopping to prevent infinite loop');
      return;
    }
    
    const fetchUserRole = async () => {
      // Vérifier à nouveau si un fetch est en cours (protection supplémentaire)
      if (fetchInProgressRef.current) return;
      
      // Marquer le début d'une opération de récupération
      fetchInProgressRef.current = true;
      fetchRetryCountRef.current++;
      
      setLoading(true);
      
      try {
        if (!user) {
          // Pas d'utilisateur = pas de rôle
          if (isMountedRef.current) {
            setGlobalRole('STANDARD');
            setMarcheRoles({});
            setRolesFetched(true);
            setLoading(false);
          }
          fetchInProgressRef.current = false;
          return;
        }
        
        // Si nous avons déjà le rôle global en cache, utilisons-le
        if (globalRoleCache.role) {
          if (isMountedRef.current) {
            setGlobalRole(globalRoleCache.role);
          }
        } else {
          // Vérifier d'abord si l'utilisateur est ADMIN (cela outrepasse tout le reste)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role_global')
            .eq('id', user.id)
            .single();
            
          if (!profileError && profileData) {
            const userGlobalRole = profileData.role_global ? 
              String(profileData.role_global).toUpperCase() : 'STANDARD';
              
            if (isMountedRef.current) {
              setGlobalRole(userGlobalRole as UserRole);
            }
            globalRoleCache.role = userGlobalRole as UserRole;
            
            // Si l'utilisateur est ADMIN, il n'a peut-être pas besoin de rôles spécifiques au marché
            if (userGlobalRole === 'ADMIN' && !marcheId) {
              if (isMountedRef.current) {
                setRolesFetched(true);
                setLoading(false);
              }
              fetchInProgressRef.current = false;
              return;
            }
          } else {
            // Solution de secours si la requête directe échoue
            const { data, error } = await supabase.rpc('get_user_global_role');
            
            if (error) {
              console.error('Error fetching global role:', error);
              if (isMountedRef.current) {
                setGlobalRole('STANDARD');
              }
              globalRoleCache.role = 'STANDARD';
            } else {
              // Normaliser le rôle
              const userGlobalRole = data ? String(data).toUpperCase() : 'STANDARD';
              if (isMountedRef.current) {
                setGlobalRole(userGlobalRole as UserRole);
              }
              globalRoleCache.role = userGlobalRole as UserRole;
            }
          }
        }
        
        // Si un marcheId est fourni, récupérer le rôle spécifique pour ce marché
        if (marcheId) {
          // Vérifier d'abord le cache
          if (roleCache[marcheId] !== undefined) {
            if (isMountedRef.current) {
              setMarcheRoles(prev => ({...prev, [marcheId]: roleCache[marcheId]}));
            }
          } else {
            const specificRole = await fetchMarcheRole(user.id, marcheId);
            
            if (isMountedRef.current) {
              setMarcheRoles(prev => ({...prev, [marcheId]: specificRole}));
            }
            roleCache[marcheId] = specificRole;
          }
        } else {
          // Sinon, récupérer tous les rôles de marché pour l'utilisateur
          const userMarcheRoles = await fetchMarcheRoles(user.id);
          
          if (isMountedRef.current) {
            setMarcheRoles(userMarcheRoles);
          }
          
          // Mettre à jour le cache avec tous les rôles récupérés
          Object.keys(userMarcheRoles).forEach(id => {
            roleCache[id] = userMarcheRoles[id];
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
        // Lorsque l'opération est terminée, signaler que nous ne sommes plus en train de fetch
        fetchInProgressRef.current = false;
      }
    };
    
    // Utiliser un timeout pour éviter les appels trop rapprochés
    const timeoutId = setTimeout(() => {
      fetchUserRole();
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, marcheId, rolesFetched, marcheRoles]);

  // Function to fetch a specific market role (with caching)
  const getMarcheRole = useCallback(async (marketId: string): Promise<MarcheSpecificRole> => {
    if (!user) return null;
    
    // Si le rôle est déjà en cache, le retourner immédiatement
    if (marcheRoles[marketId] !== undefined) {
      throttledConsoleLog(`Using cached role for market ${marketId}: ${marcheRoles[marketId]}`);
      return marcheRoles[marketId];
    }
    
    if (roleCache[marketId] !== undefined) {
      throttledConsoleLog(`Using global cache for market ${marketId}: ${roleCache[marketId]}`);
      if (isMountedRef.current) {
        setMarcheRoles(prev => ({...prev, [marketId]: roleCache[marketId]}));
      }
      return roleCache[marketId];
    }
    
    // Sinon, récupérer depuis la base de données
    try {
      throttledConsoleLog(`Fetching role for market ${marketId}...`);
      const role = await fetchMarcheRole(user.id, marketId);
      
      // Mettre à jour à la fois le cache local et global
      if (isMountedRef.current) {
        setMarcheRoles(prev => ({...prev, [marketId]: role}));
      }
      roleCache[marketId] = role;
      return role;
    } catch (error) {
      console.error('Error fetching market role:', error);
      return null;
    }
  }, [user, marcheRoles, throttledConsoleLog]);

  // Logging limité pour éviter le spam de logs
  throttledConsoleLog("Current global role: " + globalRole);

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
