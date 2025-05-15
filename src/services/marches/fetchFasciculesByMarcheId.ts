
import { supabase } from '@/lib/supabase';
import { getGlobalUserRole } from '@/utils/auth/roles';

/**
 * Récupérer les fascicules d'un marché spécifique de manière sécurisée
 * en utilisant une approche qui évite la récursion infinie des politiques RLS
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<any[]>} Liste des fascicules
 */
export const fetchFasciculesByMarcheId = async (marcheId: string): Promise<any[]> => {
  try {
    console.log(`Récupération des fascicules pour le marché ${marcheId}...`);
    
    // Vérifier si l'utilisateur est ADMIN pour optimiser le chemin d'accès
    const globalRole = await getGlobalUserRole();
    
    // Si l'utilisateur est ADMIN, on utilise une requête directe
    // Cette approche contourne les politiques RLS qui causent l'erreur de récursion
    if (globalRole === 'ADMIN') {
      console.log(`Utilisateur est ADMIN - accès direct aux fascicules du marché ${marcheId}`);
      
      const { data, error } = await supabase
        .from('fascicules')
        .select('*')
        .eq('marche_id', marcheId)
        .order('nom', { ascending: true });
        
      if (error) {
        console.error(`Erreur lors de la récupération des fascicules (admin path):`, error);
        throw error;
      }
      
      console.log(`${data?.length || 0} fascicules récupérés pour le marché ${marcheId}`);
      return data || [];
    }
    
    // Pour les non-admin, utiliser une fonction RPC spécifique
    // Cette fonction devrait être créée côté Supabase pour éviter la récursion infinie
    console.log(`Utilisateur non-ADMIN - utilisation de get_fascicules_for_marche pour le marché ${marcheId}`);
    
    try {
      // Tenter d'utiliser la fonction RPC si elle existe
      const { data, error } = await supabase.rpc(
        'get_fascicules_for_marche', 
        { marche_id_param: marcheId }
      );

      if (error) {
        console.error(`La fonction RPC 'get_fascicules_for_marche' a échoué:`, error);
        // Fallback à une requête directe si la RPC n'existe pas
        const { data: directData, error: directError } = await supabase
          .from('fascicules')
          .select('*')
          .eq('marche_id', marcheId);
        
        if (directError) {
          console.error(`Erreur lors de la récupération directe des fascicules:`, directError);
          throw directError;
        }
        
        return directData || [];
      }
      
      return data || [];
    } catch (rpcError) {
      console.error(`Exception lors de l'appel RPC:`, rpcError);
      // Fallback to direct query with careful error handling
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('fascicules')
        .select('*')
        .eq('marche_id', marcheId);
      
      if (fallbackError) {
        console.error(`Fallback query a échoué:`, fallbackError);
        return [];
      }
      
      return fallbackData || [];
    }
  } catch (error) {
    console.error('Exception lors de la récupération des fascicules:', error);
    return [];
  }
};
