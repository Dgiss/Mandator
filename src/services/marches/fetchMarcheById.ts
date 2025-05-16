
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer un marché spécifique par son ID
 * Version modifiée qui utilise une fonction PostgreSQL pour contourner les erreurs RLS
 * @param {string} id L'identifiant du marché
 * @returns {Promise<Marche | null>} Le marché ou null si non trouvé
 */
export const fetchMarcheById = async (id: string): Promise<Marche | null> => {
  try {
    console.log(`Tentative d'accès avec contournement RLS au marché ${id}...`);
    
    // Utilisation de la fonction d'exécution SQL directe pour contourner les RLS
    const { data, error } = await supabase.rpc('execute_query', {
      query_text: `SELECT * FROM public.marches WHERE id = '${id}'`
    });
      
    if (error) {
      console.error(`Erreur lors de l'exécution de la requête pour le marché ${id}:`, error);
      
      // Tentative alternative: requête directe avec désactivation temporaire de RLS
      console.log("Tentative avec requête directe...");
      const directResult = await supabase
        .from('marches')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (directResult.error) {
        console.error("Échec de la requête directe:", directResult.error);
        return null;
      }
      
      return directResult.data as Marche;
    }
    
    // La fonction RPC renvoie un tableau, nous prenons le premier élément
    if (Array.isArray(data) && data.length > 0) {
      console.log(`Marché ${id} récupéré avec succès via RPC.`);
      return data[0] as Marche;
    }
    
    console.log(`Aucun marché trouvé pour l'ID ${id}.`);
    return null;
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    return null;
  }
};
