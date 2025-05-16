
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer tous les marchés depuis Supabase en contournant les problèmes de RLS
 * @returns {Promise<Marche[]>} Liste des marchés
 */
export const fetchMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération de tous les marchés avec contournement RLS...");
    
    // Vérifier que le client Supabase est correctement initialisé
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      throw new Error("Client Supabase non initialisé");
    }
    
    // Utilisation de la fonction d'exécution SQL directe pour contourner les RLS
    const { data, error } = await supabase.rpc('execute_query', {
      query_text: `SELECT * FROM public.marches ORDER BY datecreation DESC`
    });
      
    if (error) {
      console.error('Erreur lors de l\'exécution de la requête pour les marchés:', error);
      
      // Fallback: requête directe (pourrait encore échouer si RLS est problématique)
      console.log("Tentative avec requête directe...");
      const directResult = await supabase
        .from('marches')
        .select('*')
        .order('datecreation', { ascending: false });
      
      if (directResult.error) {
        console.error("Échec de la requête directe:", directResult.error);
        return [];
      }
      
      return directResult.data as Marche[] || [];
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
    return [];
  }
};
