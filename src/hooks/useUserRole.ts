
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'MANDATAIRE' | 'MOE' | 'STANDARD';

export function useUserRole() {
  const [role, setRole] = useState<UserRole>('STANDARD');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          setRole('STANDARD');
          return;
        }
        
        // Récupérer le profil avec le rôle
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erreur lors de la récupération du rôle:', error);
          setRole('STANDARD');
          return;
        }
        
        // Normaliser le rôle
        const userRole = data?.role ? String(data.role).toUpperCase() : 'STANDARD';
        setRole(userRole as UserRole);
      } catch (error) {
        console.error('Erreur:', error);
        setRole('STANDARD');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user]);
  
  const canDiffuse = role === 'MANDATAIRE';
  const canVisa = role === 'MOE';
  
  return { 
    role, 
    loading, 
    canDiffuse, 
    canVisa,
    isMandataire: role === 'MANDATAIRE',
    isMOE: role === 'MOE'
  };
}
