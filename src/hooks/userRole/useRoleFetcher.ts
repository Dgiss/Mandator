
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole, MarcheSpecificRole } from './types';

export function useRoleFetcher(marcheId?: string) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [marcheRoles, setMarcheRoles] = useState<Record<string, MarcheSpecificRole>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour récupérer le rôle global de l'utilisateur
  const fetchGlobalRole = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role_global')
        .eq('id', user.id)
        .maybeSingle();  // Utiliser maybeSingle() au lieu de single()

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

  // Fonction pour récupérer un rôle spécifique pour un marché
  const getMarcheRole = useCallback(async (specificMarcheId: string): Promise<MarcheSpecificRole> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Utiliser la fonction RPC sécurisée créée dans les migrations SQL
      const { data, error } = await supabase
        .rpc('get_user_role_for_marche', { marche_id: specificMarcheId });

      if (error) {
        console.error(`Error fetching role for market ${specificMarcheId}:`, error);
        return null;
      }

      // Mise à jour du cache local des rôles
      setMarcheRoles(prev => ({
        ...prev,
        [specificMarcheId]: data as MarcheSpecificRole
      }));

      return data as MarcheSpecificRole;
    } catch (err) {
      console.error(`Exception fetching role for market ${specificMarcheId}:`, err);
      return null;
    }
  }, []);

  // Charger les rôles au démarrage
  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      
      // 1. Charger le rôle global
      const globalRole = await fetchGlobalRole();
      
      // 2. Si un marcheId est fourni, charger également le rôle spécifique
      if (marcheId) {
        await getMarcheRole(marcheId);
      }
      
      setLoading(false);
    };

    loadRoles();
  }, [fetchGlobalRole, getMarcheRole, marcheId]);

  // Helpers pour vérifier les rôles
  const isAdmin = role === 'ADMIN';
  const isMOE = useCallback((specificMarcheId?: string) => {
    // Admin peut toujours tout faire
    if (role === 'ADMIN') return true;
    
    // Vérifier le rôle global
    if (role === 'MOE') return true;
    
    // Vérifier le rôle spécifique pour ce marché
    const targetMarcheId = specificMarcheId || marcheId;
    if (targetMarcheId && marcheRoles[targetMarcheId] === 'MOE') {
      return true;
    }
    
    return false;
  }, [role, marcheId, marcheRoles]);
  
  const isMandataire = useCallback((specificMarcheId?: string) => {
    // Admin peut toujours tout faire
    if (role === 'ADMIN') return true;
    
    // Vérifier le rôle global
    if (role === 'MANDATAIRE') return true;
    
    // Vérifier le rôle spécifique pour ce marché
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
