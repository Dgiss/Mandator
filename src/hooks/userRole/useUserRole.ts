
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, MarcheSpecificRole, UserRoleInfo } from './types';
import { 
  canDiffuseMarche, 
  canVisaMarche, 
  canCreateMarche as canCreateMarcheUtil, 
  canManageRolesMarche 
} from './permissions';
import { fetchMarcheRoles, fetchMarcheRole } from './roleUtils';

export function useUserRole(marcheId?: string): UserRoleInfo {
  const [globalRole, setGlobalRole] = useState<UserRole>('STANDARD');
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Récupérer le rôle global de l'utilisateur et les rôles spécifiques
  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          setGlobalRole('STANDARD');
          setMarcheRoles({});
          return;
        }
        
        // Récupérer le profil avec le rôle global
        const { data, error } = await supabase
          .from('profiles')
          .select('role_global')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erreur lors de la récupération du rôle global:', error);
          setGlobalRole('STANDARD');
          return;
        }
        
        // Normaliser le rôle
        const userGlobalRole = data?.role_global ? String(data.role_global).toUpperCase() : 'STANDARD';
        setGlobalRole(userGlobalRole as UserRole);
        
        // Si un marcheId est fourni, récupérer le rôle spécifique pour ce marché
        if (marcheId) {
          const specificRole = await fetchMarcheRole(user.id, marcheId);
          setMarcheRoles(prev => ({...prev, [marcheId]: specificRole}));
        } else {
          // Sinon, récupérer tous les rôles spécifiques de l'utilisateur
          const userMarcheRoles = await fetchMarcheRoles(user.id);
          setMarcheRoles(userMarcheRoles);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setGlobalRole('STANDARD');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, [user, marcheId]);

  // Wrapper pour getMarcheRole qui gère le cache et les appels API
  const getMarcheRole = async (marcheId: string): Promise<MarcheSpecificRole> => {
    // Si le rôle est déjà en cache, le retourner
    if (marcheRoles[marcheId]) {
      return marcheRoles[marcheId];
    }
    
    // Sinon, le récupérer depuis la base de données
    const role = await fetchMarcheRole(user?.id, marcheId);
    
    // Mettre à jour le cache
    setMarcheRoles(prev => ({...prev, [marcheId]: role}));
    return role;
  };

  // Valeurs booléennes dérivées pour un accès facile
  const isAdmin = globalRole === 'ADMIN';
  const isMOE = globalRole === 'MOE';
  const isMandataire = globalRole === 'MANDATAIRE';
  
  return { 
    role: globalRole, 
    loading,
    isAdmin,
    isMOE,
    isMandataire,
    canCreateMarche: canCreateMarcheUtil(globalRole),
    canDiffuse: (marcheId?: string) => canDiffuseMarche(globalRole, marcheRoles, marcheId),
    canVisa: (marcheId?: string) => canVisaMarche(globalRole, marcheRoles, marcheId),
    canManageRoles: (marcheId?: string) => canManageRolesMarche(globalRole, marcheRoles, marcheId),
    getMarcheRole
  };
}
