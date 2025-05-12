
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Mettre à jour un marché existant
 * @param {string} id L'identifiant du marché à mettre à jour
 * @param {Partial<Marche>} updates Les modifications à apporter
 * @returns {Promise<Marche | null>} Le marché mis à jour ou null en cas d'erreur
 */
export const updateMarche = async (id: string, updates: Partial<Marche>): Promise<Marche | null> => {
  try {
    const { data, error } = await supabase
      .from('marches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Erreur lors de la mise à jour du marché ${id}:`, error);
      throw error;
    }
    
    return data as Marche;
  } catch (error) {
    console.error('Exception lors de la mise à jour du marché:', error);
    throw error;
  }
};
