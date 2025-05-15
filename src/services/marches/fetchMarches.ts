
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer tous les marchés depuis Supabase auxquels l'utilisateur a accès
 * @returns {Promise<Marche[]>} Liste des marchés
 */
export const fetchMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération des marchés auxquels l'utilisateur a accès...");
    
    // Vérifier que le client Supabase est correctement initialisé
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      throw new Error("Client Supabase non initialisé");
    }
    
    // Utiliser la fonction get_accessible_marches_for_user qui est sécurisée contre la récursion
    const { data, error } = await supabase.rpc('get_accessible_marches_for_user');
    
    if (error) {
      console.error('Erreur lors de la récupération des marchés:', error);
      
      // Si la fonction RPC échoue, essayer une requête directe mais sécurisée
      try {
        const { data: directData, error: directError } = await supabase
          .from('marches')
          .select('*');
          
        if (directError) {
          throw directError;
        }
        
        console.log("Marchés récupérés par requête directe:", directData?.length || 0);
        return directData as Marche[] || [];
      } catch (directError) {
        console.error('Erreur lors de la requête directe:', directError);
        throw error; // Renvoyer l'erreur originale
      }
    }
    
    console.log("Marchés récupérés:", data?.length || 0);
    
    // S'assurer que les données sont bien formatées avant de les retourner
    const formattedMarches = Array.isArray(data) ? data.map((marche: any) => ({
      id: marche.id || '',
      titre: marche.titre || 'Sans titre',
      description: marche.description || '',
      client: marche.client || 'Non spécifié',
      statut: marche.statut || 'Non défini',
      datecreation: marche.datecreation || null,
      budget: marche.budget || 'Non défini',
      image: marche.image || null,
      logo: marche.logo || null,
      user_id: marche.user_id || null,
      created_at: marche.created_at || null
    })) : [];
    
    console.log("Marchés formatés:", formattedMarches.length);
    return formattedMarches as Marche[];
  } catch (error) {
    console.error('Exception lors de la récupération des marchés:', error);
    // Ne pas laisser remonter l'erreur, mais retourner un tableau vide
    console.warn("Retour d'un tableau vide suite à une erreur");
    return [];
  }
};
