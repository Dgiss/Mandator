
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, MarcheSpecificRole } from './types';
import { fetchMarcheRoles, fetchMarcheRole } from './roleUtils';

/**
 * Hook to fetch and manage user roles
 */
export function useRoleFetcher(marcheId?: string) {
  const [globalRole, setGlobalRole] = useState<UserRole>('STANDARD');
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(true);
  const [rolesFetched, setRolesFetched] = useState(false);
  const { user } = useAuth();
  
  // Fetch the user's global role and market-specific roles
  useEffect(() => {
    // Skip if we've already fetched roles and have data for the requested marcheId
    if (rolesFetched && marcheId && marcheRoles[marcheId] !== undefined) {
      return;
    }
    
    const fetchUserRole = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          setGlobalRole('STANDARD');
          setMarcheRoles({});
          setRolesFetched(true);
          setLoading(false);
          return;
        }
        
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
          
          // If user is ADMIN, they might not need specific market roles
          if (userGlobalRole === 'ADMIN' && !marcheId) {
            setRolesFetched(true);
            setLoading(false);
            return;
          }
        } else {
          // Fallback to RPC if direct query fails
          const { data, error } = await supabase.rpc('get_user_global_role');
          
          if (error) {
            console.error('Error fetching global role:', error);
            setGlobalRole('STANDARD');
          } else {
            // Normalize the role
            const userGlobalRole = data ? String(data).toUpperCase() : 'STANDARD';
            setGlobalRole(userGlobalRole as UserRole);
          }
        }
        
        // If a marcheId is provided, fetch the specific role for that market
        if (marcheId) {
          const specificRole = await fetchMarcheRole(user.id, marcheId);
          console.log(`Fetched specific role for market ${marcheId}:`, specificRole);
          setMarcheRoles(prev => ({...prev, [marcheId]: specificRole}));
        } else {
          // Otherwise, fetch all market roles for the user
          const userMarcheRoles = await fetchMarcheRoles(user.id);
          console.log("Fetched all market roles:", userMarcheRoles);
          setMarcheRoles(userMarcheRoles);
        }
        
        setRolesFetched(true);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setGlobalRole('STANDARD');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user, marcheId, rolesFetched]);

  // Function to fetch a specific market role (with caching)
  const getMarcheRole = async (marcheId: string): Promise<MarcheSpecificRole> => {
    if (!user) return null;
    
    // If the role is already cached, return it
    if (marcheRoles[marcheId] !== undefined) {
      console.log(`Using cached role for market ${marcheId}:`, marcheRoles[marcheId]);
      return marcheRoles[marcheId];
    }
    
    // Otherwise, fetch from the database
    try {
      console.log(`Fetching role for market ${marcheId}...`);
      const role = await fetchMarcheRole(user.id, marcheId);
      console.log(`Fetched role for market ${marcheId}:`, role);
      
      // Update the cache
      setMarcheRoles(prev => ({...prev, [marcheId]: role}));
      return role;
    } catch (error) {
      console.error('Error fetching market role:', error);
      return null;
    }
  };

  // Add debugging logs to help identify issues
  console.log("Current global role:", globalRole);
  console.log("Current market roles:", marcheRoles);
  console.log("Role loading state:", loading);

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
