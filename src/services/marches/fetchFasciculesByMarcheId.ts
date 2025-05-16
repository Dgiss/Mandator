
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
    
    // Approche 1: Utiliser notre nouvelle fonction SECURITY DEFINER
    try {
      const { data, error } = await supabase
        .rpc('get_fascicules_for_marche', { marche_id_param: marcheId });
      
      if (error) {
        console.error(`Erreur lors de l'appel à get_fascicules_for_marche:`, error);
        throw error;
      }
      
      console.log(`${data?.length || 0} fascicules récupérés pour le marché ${marcheId}`);
      return data || [];
    } catch (primaryError) {
      console.error(`Erreur lors de l'utilisation de la méthode principale:`, primaryError);
      
      // Approche 2: Vérifier si l'utilisateur est ADMIN pour optimiser le chemin d'accès
      const globalRole = await getGlobalUserRole();
      
      // Si l'utilisateur est ADMIN, on utilise une requête directe
      if (globalRole === 'ADMIN') {
        console.log(`Utilisateur est ADMIN - tentative alternative pour le marché ${marcheId}`);
        
        const { data: adminData, error: adminError } = await supabase
          .rpc('get_accessible_marches');
          
        if (adminError) {
          console.error(`Erreur lors de la récupération des marchés (admin path):`, adminError);
          return [];
        }
        
        // Vérifier si le marché est accessible
        const marcheAccessible = adminData.some((marche: any) => marche.id === marcheId);
        
        if (marcheAccessible) {
          // Récupérer les fascicules directement
          const { data: fascicules, error: fascError } = await supabase
            .from('fascicules')
            .select('*')
            .eq('marche_id', marcheId)
            .order('nom', { ascending: true });
          
          if (fascError) {
            console.error(`Erreur lors de la récupération directe des fascicules:`, fascError);
            return [];
          }
          
          return fascicules || [];
        }
      }
      
      // En mode développement, retourner un tableau vide mais ne pas bloquer l'application
      console.warn("Impossible de récupérer les fascicules. Retour d'un tableau vide.");
      return [];
    }
  } catch (error) {
    console.error('Exception lors de la récupération des fascicules:', error);
    return [];
  }
};
