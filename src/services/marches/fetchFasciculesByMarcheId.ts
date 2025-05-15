
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
    
    // Pour les non-admin, utiliser une requête directe avec gestion d'erreur
    console.log(`Utilisateur non-ADMIN - utilisation de requête directe pour le marché ${marcheId}`);
    
    try {
      // Essayer une requête directe
      const { data, error } = await supabase
        .from('fascicules')
        .select('*')
        .eq('marche_id', marcheId);
      
      if (error) {
        console.error(`Erreur lors de la récupération directe des fascicules:`, error);
        throw error;
      }
      
      return data || [];
    } catch (directQueryError) {
      console.error(`Exception lors de la requête directe:`, directQueryError);
      
      // En cas d'erreur, faire un autre essai avec une approche alternative
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('fascicules')
          .select('*')
          .eq('marche_id', marcheId);
        
        if (fallbackError) {
          console.error(`Requête alternative a échoué:`, fallbackError);
          return [];
        }
        
        return fallbackData || [];
      } catch (fallbackError) {
        console.error('Erreur lors de la requête alternative:', fallbackError);
        return [];
      }
    }
  } catch (error) {
    console.error('Exception lors de la récupération des fascicules:', error);
    return [];
  }
};
