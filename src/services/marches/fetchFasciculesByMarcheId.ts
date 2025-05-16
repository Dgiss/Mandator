
import { supabase } from '@/lib/supabase';
import { getGlobalUserRole } from '@/utils/auth/roles';

/**
 * Récupérer les fascicules d'un marché spécifique de manière sécurisée
 * en utilisant notre fonction RPC optimisée qui évite la récursion infinie
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<any[]>} Liste des fascicules
 */
export const fetchFasciculesByMarcheId = async (marcheId: string): Promise<any[]> => {
  try {
    console.log(`Récupération des fascicules pour le marché ${marcheId}...`);
    
    // Utiliser notre fonction RPC sécurisée qui évite les problèmes de récursion
    const { data, error } = await supabase
      .rpc('get_fascicules_for_marche', { marche_id_param: marcheId });
    
    if (error) {
      console.error(`Erreur lors de l'appel à get_fascicules_for_marche:`, error);
      
      // Tentative alternative pour les administrateurs
      const globalRole = await getGlobalUserRole();
      if (globalRole === 'ADMIN') {
        console.log(`Utilisateur est ADMIN - tentative alternative pour le marché ${marcheId}`);
        
        try {
          // Les admins peuvent faire une requête directe sans RPC
          const { data: adminData, error: adminError } = await supabase
            .from('fascicules')
            .select('*')
            .eq('marche_id', marcheId);
          
          if (adminError) {
            console.error(`Erreur lors de la récupération admin des fascicules:`, adminError);
            return [];
          }
          
          if (adminData) {
            console.log(`${adminData.length || 0} fascicules récupérés pour le marché ${marcheId} (voie ADMIN)`);
            return adminData || [];
          } else {
            return [];
          }
        } catch (directError) {
          console.error(`Exception lors de la tentative admin:`, directError);
          return [];
        }
      }
      
      // En mode développement, retourner un tableau vide mais ne pas bloquer l'application
      console.warn("Impossible de récupérer les fascicules. Retour d'un tableau vide.");
      return [];
    }
    
    // Vérifier que data est bien un tableau avant d'accéder à sa propriété length
    if (Array.isArray(data)) {
      console.log(`${data.length || 0} fascicules récupérés pour le marché ${marcheId}`);
      return data;
    } else {
      console.log(`Aucun fascicule récupéré ou format de données incorrect pour le marché ${marcheId}`);
      return [];
    }
  } catch (error) {
    console.error('Exception lors de la récupération des fascicules:', error);
    return [];
  }
};
