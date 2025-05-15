
import { supabase } from '@/lib/supabase';
import { Marche } from './types';
import { getGlobalUserRole } from '@/utils/auth/roles';

/**
 * Récupérer tous les marchés de manière sécurisée
 * en utilisant une approche qui évite la récursion infinie des politiques RLS
 * @returns {Promise<Marche[]>} Liste des marchés
 */
export const fetchAllMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération de tous les marchés...");
    
    // Vérifier si l'utilisateur est ADMIN pour optimiser le chemin d'accès
    const globalRole = await getGlobalUserRole();
    
    // Si l'utilisateur est ADMIN, utiliser une requête directe pour contourner les RLS problématiques
    if (globalRole === 'ADMIN') {
      console.log('Utilisateur est ADMIN - accès direct à tous les marchés');
      
      const { data, error } = await supabase
        .from('marches')
        .select('*')
        .order('titre', { ascending: true });
        
      if (error) {
        console.error('Erreur lors de la récupération des marchés (admin path):', error);
        throw error;
      }
      
      console.log(`${data?.length || 0} marchés récupérés`);
      return data as Marche[] || [];
    }
    
    // Pour les non-admin, utiliser une fonction RPC ou un fallback
    console.log('Utilisateur non-ADMIN - utilisation de get_accessible_marches_for_user');
    
    try {
      // Tenter d'utiliser la fonction RPC si elle existe
      const { data, error } = await supabase.rpc('get_accessible_marches_for_user');

      if (error) {
        console.error(`La fonction RPC 'get_accessible_marches_for_user' a échoué:`, error);
        // Fallback à une requête directe
        const { data: directData, error: directError } = await supabase
          .from('marches')
          .select('*');
        
        if (directError) {
          console.error(`Erreur lors de la récupération directe des marchés:`, directError);
          throw directError;
        }
        
        return directData as Marche[] || [];
      }
      
      return data as Marche[] || [];
    } catch (rpcError) {
      console.error(`Exception lors de l'appel RPC:`, rpcError);
      
      // Fallback to direct query with careful error handling
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('marches')
        .select('*');
      
      if (fallbackError) {
        console.error(`Fallback query a échoué:`, fallbackError);
        return [];
      }
      
      return fallbackData as Marche[] || [];
    }
  } catch (error) {
    console.error('Exception lors de la récupération des marchés:', error);
    return [];
  }
};
