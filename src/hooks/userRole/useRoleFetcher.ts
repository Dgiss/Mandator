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
  const { user } = useAuth();
  
  // Fetch the user's global role and market-specific roles
  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          setGlobalRole('STANDARD');
          setMarcheRoles({});
          setLoading(false);
          return;
        }
        
        // Fetch global role via RPC
        const { data, error } = await supabase.rpc('get_user_global_role');
        
        if (error) {
          console.error('Error fetching global role:', error);
          setGlobalRole('STANDARD');
        } else {
          // Normalize the role
          const userGlobalRole = data ? String(data).toUpperCase() : 'STANDARD';
          setGlobalRole(userGlobalRole as UserRole);
        }
        
        // If a marcheId is provided, fetch the specific role for that market
        if (marcheId) {
          const specificRole = await fetchMarcheRole(user.id, marcheId);
          setMarcheRoles(prev => ({...prev, [marcheId]: specificRole}));
        } else {
          // Otherwise, fetch all market roles for the user
          const userMarcheRoles = await fetchMarcheRoles(user.id);
          setMarcheRoles(userMarcheRoles);
        }
      } catch (error) {
        console.error('Error:', error);
        setGlobalRole('STANDARD');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user, marcheId]);

  // Function to fetch a specific market role (with caching)
  const getMarcheRole = async (marcheId: string): Promise<MarcheSpecificRole> => {
    // If the role is already cached, return it
    if (marcheRoles[marcheId]) {
      return marcheRoles[marcheId];
    }
    
    // Check if user is creator first (most important case)
    if (user) {
      const { data: marcheData, error: marcheError } = await supabase
        .from('marches')
        .select('user_id')
        .eq('id', marcheId)
        .single();
      
      if (!marcheError && marcheData && marcheData.user_id === user.id) {
        console.log(`User ${user.id} is creator of market ${marcheId}, assigning MOE role`);
        // Update the cache
        setMarcheRoles(prev => ({...prev, [marcheId]: 'MOE'}));
        return 'MOE';
      }
    }
    
    // Otherwise, fetch from the database
    const role = await fetchMarcheRole(user?.id, marcheId);
    
    // Update the cache
    setMarcheRoles(prev => ({...prev, [marcheId]: role}));
    return role;
  };

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
