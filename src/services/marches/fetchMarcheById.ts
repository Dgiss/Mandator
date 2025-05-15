
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer un marché spécifique par son ID
 * @param {string} id L'identifiant du marché
 * @returns {Promise<Marche | null>} Le marché ou null si non trouvé
 */
export const fetchMarcheById = async (id: string): Promise<Marche | null> => {
  try {
    console.log(`Tentative d'accès au marché ${id}...`);
    
    // Récupérer directement les données du marché sans vérification d'accès
    // La politique RLS a été modifiée pour permettre SELECT à tous
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .single();
      
    if (marcheError) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, marcheError);
      throw marcheError;
    }
    
    console.log(`Marché ${id} récupéré avec succès:`, marcheData);
    return marcheData as Marche;
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    throw error;
  }
};
