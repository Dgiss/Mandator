
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'ADMIN' | 'MOE' | 'MANDATAIRE' | 'STANDARD';
export type MarcheSpecificRole = 'MOE' | 'MANDATAIRE' | 'CONSULTANT' | null;

export interface UserRoleInfo {
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isMOE: boolean; 
  isMandataire: boolean;
  canCreateMarche: boolean;
  canDiffuse: (marcheId?: string) => boolean;
  canVisa: (marcheId?: string) => boolean;
  canManageRoles: (marcheId?: string) => boolean;
  getMarcheRole: (marcheId: string) => Promise<MarcheSpecificRole>;
}

export function useUserRole(marcheId?: string): UserRoleInfo {
  const [globalRole, setGlobalRole] = useState<UserRole>('STANDARD');
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Récupérer le rôle global de l'utilisateur
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
          const specificRole = await getMarcheRole(marcheId);
          setMarcheRoles(prev => ({...prev, [marcheId]: specificRole}));
        } else {
          // Sinon, récupérer tous les rôles spécifiques de l'utilisateur
          await fetchMarcheRoles();
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

  // Récupérer tous les rôles spécifiques de l'utilisateur pour tous les marchés
  const fetchMarcheRoles = async () => {
    if (!user) return;
    
    try {
      // Use our security definer function through RPC to avoid recursion
      const { data, error } = await supabase
        .from('droits_marche')
        .select('marche_id, role_specifique')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erreur lors de la récupération des rôles par marché:', error);
        return;
      }
      
      const rolesMap: Record<string, MarcheSpecificRole> = {};
      data?.forEach(item => {
        rolesMap[item.marche_id] = item.role_specifique as MarcheSpecificRole;
      });
      
      setMarcheRoles(rolesMap);
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles par marché:', error);
    }
  };

  // Récupérer le rôle spécifique pour un marché donné
  const getMarcheRole = async (marcheId: string): Promise<MarcheSpecificRole> => {
    // Si le rôle est déjà en cache, le retourner
    if (marcheRoles[marcheId]) {
      return marcheRoles[marcheId];
    }
    
    // Sinon, le récupérer depuis la base de données
    if (!user) return null;
    
    try {
      // Use our security definer function through RPC to avoid recursion
      const { data, error } = await supabase
        .rpc('get_user_role_for_marche', {
          user_id: user.id,
          marche_id: marcheId
        });
      
      if (error) {
        console.error(`Pas de rôle spécifique trouvé pour le marché ${marcheId}:`, error);
        return null;
      }
      
      // Mettre à jour le cache
      const role = data as MarcheSpecificRole;
      setMarcheRoles(prev => ({...prev, [marcheId]: role}));
      return role;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };

  // Vérifier si l'utilisateur peut diffuser des documents sur un marché spécifique
  const canDiffuse = (marcheId?: string): boolean => {
    // Les administrateurs peuvent diffuser sur tous les marchés
    if (globalRole === 'ADMIN') return true;
    
    // Si aucun marché n'est spécifié, vérifier le rôle global
    if (!marcheId) {
      return globalRole === 'MANDATAIRE';
    }
    
    // Sinon, vérifier le rôle spécifique pour ce marché
    const roleForMarche = marcheRoles[marcheId];
    return roleForMarche === 'MANDATAIRE';
  };

  // Vérifier si l'utilisateur peut viser des documents sur un marché spécifique
  const canVisa = (marcheId?: string): boolean => {
    // Les administrateurs peuvent viser sur tous les marchés
    if (globalRole === 'ADMIN') return true;
    
    // Si aucun marché n'est spécifié, vérifier le rôle global
    if (!marcheId) {
      return globalRole === 'MOE';
    }
    
    // Sinon, vérifier le rôle spécifique pour ce marché
    const roleForMarche = marcheRoles[marcheId];
    return roleForMarche === 'MOE';
  };

  // Vérifier si l'utilisateur peut créer des marchés
  const canCreateMarche = (): boolean => {
    // Seuls les administrateurs et les MOE peuvent créer des marchés
    return globalRole === 'ADMIN' || globalRole === 'MOE';
  };

  // Vérifier si l'utilisateur peut gérer les rôles sur un marché spécifique
  const canManageRoles = (marcheId?: string): boolean => {
    // Les administrateurs peuvent gérer les rôles sur tous les marchés
    if (globalRole === 'ADMIN') return true;
    
    // Les MOE peuvent gérer les rôles uniquement pour les marchés où ils sont MOE
    if (globalRole === 'MOE') {
      if (!marcheId) return false; // Un MOE ne peut pas gérer les rôles globaux
      
      // Vérifier si l'utilisateur est MOE sur ce marché spécifique
      const roleForMarche = marcheRoles[marcheId];
      return roleForMarche === 'MOE';
    }
    
    // Les mandataires ne peuvent pas gérer les rôles
    return false;
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
    canCreateMarche: canCreateMarche(),
    canDiffuse,
    canVisa,
    canManageRoles,
    getMarcheRole
  };
}
