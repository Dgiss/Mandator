
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer un marché spécifique par son ID
 * Version modifiée qui utilise une requête directe
 * @param {string} id L'identifiant du marché
 * @returns {Promise<Marche | null>} Le marché ou null si non trouvé
 */
export const fetchMarcheById = async (id: string): Promise<Marche | null> => {
  try {
    console.log(`Tentative d'accès au marché ${id}...`);
    
    // Requête directe sans RPC problématique
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error(`Erreur lors de l'exécution de la requête pour le marché ${id}:`, error);
      return null;
    }
    
    console.log(`Marché ${id} récupéré avec succès.`);
    return data as Marche;
    
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    return null;
  }
};
